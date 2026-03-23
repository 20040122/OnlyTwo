-- MVP schema for a 1v1 private chat app backed by Supabase Postgres.
-- Focus: auth/profile, unique relationship binding, single conversation,
-- text messages, read state, and basic row-level security.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.normalize_relationship_users()
returns trigger
language plpgsql
as $$
declare
  temp uuid;
begin
  if new.user_a_id = new.user_b_id then
    raise exception 'relationship users must be different';
  end if;

  if new.user_a_id > new.user_b_id then
    temp := new.user_a_id;
    new.user_a_id := new.user_b_id;
    new.user_b_id := temp;
  end if;

  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null,
  avatar_url text,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

create table if not exists public.relationship_invites (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  inviter_user_id uuid not null references public.profiles(id) on delete cascade,
  invitee_user_id uuid references public.profiles(id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'expired', 'cancelled')),
  expires_at timestamptz,
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists relationship_invites_inviter_user_id_idx
on public.relationship_invites (inviter_user_id);

create index if not exists relationship_invites_status_idx
on public.relationship_invites (status);

create index if not exists relationship_invites_expires_at_idx
on public.relationship_invites (expires_at);

create unique index if not exists relationship_invites_one_active_per_inviter_idx
on public.relationship_invites (inviter_user_id)
where status = 'pending';

create table if not exists public.relationships (
  id uuid primary key default gen_random_uuid(),
  user_a_id uuid not null references public.profiles(id) on delete cascade,
  user_b_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'unbound')),
  created_from_invite_id uuid references public.relationship_invites(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  ended_at timestamptz,
  check (user_a_id <> user_b_id)
);

drop trigger if exists normalize_relationship_users_trigger on public.relationships;
create trigger normalize_relationship_users_trigger
before insert or update on public.relationships
for each row
execute function public.normalize_relationship_users();

drop trigger if exists set_relationships_updated_at on public.relationships;
create trigger set_relationships_updated_at
before update on public.relationships
for each row
execute function public.set_updated_at();

create unique index if not exists relationships_active_user_a_idx
on public.relationships (user_a_id)
where status = 'active';

create unique index if not exists relationships_active_user_b_idx
on public.relationships (user_b_id)
where status = 'active';

create unique index if not exists relationships_active_pair_idx
on public.relationships (user_a_id, user_b_id)
where status = 'active';

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  relationship_id uuid not null unique references public.relationships(id) on delete cascade,
  type text not null default 'direct' check (type in ('direct')),
  last_message_id uuid,
  last_message_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_conversations_updated_at on public.conversations;
create trigger set_conversations_updated_at
before update on public.conversations
for each row
execute function public.set_updated_at();

create index if not exists conversations_last_message_at_idx
on public.conversations (last_message_at desc nulls last);

create table if not exists public.conversation_members (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('member')),
  joined_at timestamptz not null default now(),
  last_read_message_id uuid,
  last_read_at timestamptz,
  unique (conversation_id, user_id)
);

create index if not exists conversation_members_user_id_idx
on public.conversation_members (user_id);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_user_id uuid not null references public.profiles(id) on delete cascade,
  client_id text not null,
  content text not null,
  message_type text not null default 'text' check (message_type in ('text')),
  status text not null default 'sent' check (status in ('sent', 'deleted')),
  created_at timestamptz not null default now(),
  edited_at timestamptz,
  deleted_at timestamptz,
  unique (sender_user_id, client_id)
);

create index if not exists messages_conversation_id_created_at_idx
on public.messages (conversation_id, created_at asc);

create index if not exists messages_sender_user_id_idx
on public.messages (sender_user_id);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'conversations_last_message_id_fkey'
  ) then
    alter table public.conversations
      add constraint conversations_last_message_id_fkey
      foreign key (last_message_id) references public.messages(id) on delete set null;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'conversation_members_last_read_message_id_fkey'
  ) then
    alter table public.conversation_members
      add constraint conversation_members_last_read_message_id_fkey
      foreign key (last_read_message_id) references public.messages(id) on delete set null;
  end if;
end $$;

create or replace function public.update_conversation_last_message()
returns trigger
language plpgsql
as $$
begin
  update public.conversations
  set last_message_id = new.id,
      last_message_at = new.created_at,
      updated_at = now()
  where id = new.conversation_id;

  return new;
end;
$$;

drop trigger if exists update_conversation_last_message_trigger on public.messages;
create trigger update_conversation_last_message_trigger
after insert on public.messages
for each row
execute function public.update_conversation_last_message();

alter table public.profiles enable row level security;
alter table public.relationship_invites enable row level security;
alter table public.relationships enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.messages enable row level security;

drop policy if exists "profiles_select_own_or_related" on public.profiles;
create policy "profiles_select_own_or_related"
on public.profiles
for select
to authenticated
using (
  id = auth.uid()
  or exists (
    select 1
    from public.relationships r
    where r.status = 'active'
      and (
        (r.user_a_id = auth.uid() and r.user_b_id = profiles.id)
        or (r.user_b_id = auth.uid() and r.user_a_id = profiles.id)
      )
  )
);

drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self"
on public.profiles
for insert
to authenticated
with check (id = auth.uid());

drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "relationship_invites_select_participants" on public.relationship_invites;
create policy "relationship_invites_select_participants"
on public.relationship_invites
for select
to authenticated
using (
  inviter_user_id = auth.uid()
  or invitee_user_id = auth.uid()
);

drop policy if exists "relationship_invites_insert_inviter" on public.relationship_invites;
create policy "relationship_invites_insert_inviter"
on public.relationship_invites
for insert
to authenticated
with check (inviter_user_id = auth.uid());

drop policy if exists "relationship_invites_update_participants" on public.relationship_invites;
create policy "relationship_invites_update_participants"
on public.relationship_invites
for update
to authenticated
using (
  inviter_user_id = auth.uid()
  or invitee_user_id = auth.uid()
)
with check (
  inviter_user_id = auth.uid()
  or invitee_user_id = auth.uid()
);

drop policy if exists "relationships_select_members" on public.relationships;
create policy "relationships_select_members"
on public.relationships
for select
to authenticated
using (user_a_id = auth.uid() or user_b_id = auth.uid());

drop policy if exists "relationships_insert_members" on public.relationships;
create policy "relationships_insert_members"
on public.relationships
for insert
to authenticated
with check (user_a_id = auth.uid() or user_b_id = auth.uid());

drop policy if exists "relationships_update_members" on public.relationships;
create policy "relationships_update_members"
on public.relationships
for update
to authenticated
using (user_a_id = auth.uid() or user_b_id = auth.uid())
with check (user_a_id = auth.uid() or user_b_id = auth.uid());

drop policy if exists "conversations_select_members" on public.conversations;
create policy "conversations_select_members"
on public.conversations
for select
to authenticated
using (
  exists (
    select 1
    from public.conversation_members cm
    where cm.conversation_id = conversations.id
      and cm.user_id = auth.uid()
  )
);

drop policy if exists "conversations_insert_members" on public.conversations;
create policy "conversations_insert_members"
on public.conversations
for insert
to authenticated
with check (
  exists (
    select 1
    from public.relationships r
    where r.id = relationship_id
      and (r.user_a_id = auth.uid() or r.user_b_id = auth.uid())
  )
);

drop policy if exists "conversations_update_members" on public.conversations;
create policy "conversations_update_members"
on public.conversations
for update
to authenticated
using (
  exists (
    select 1
    from public.conversation_members cm
    where cm.conversation_id = conversations.id
      and cm.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.conversation_members cm
    where cm.conversation_id = conversations.id
      and cm.user_id = auth.uid()
  )
);

drop policy if exists "conversation_members_select_self" on public.conversation_members;
create policy "conversation_members_select_self"
on public.conversation_members
for select
to authenticated
using (
  exists (
    select 1
    from public.conversation_members cm
    where cm.conversation_id = conversation_members.conversation_id
      and cm.user_id = auth.uid()
  )
);

drop policy if exists "conversation_members_insert_self_or_pair_member" on public.conversation_members;
create policy "conversation_members_insert_self_or_pair_member"
on public.conversation_members
for insert
to authenticated
with check (
  exists (
    select 1
    from public.conversations c
    join public.relationships r on r.id = c.relationship_id
    where c.id = conversation_id
      and (
        r.user_a_id = auth.uid()
        or r.user_b_id = auth.uid()
      )
      and (
        user_id = r.user_a_id
        or user_id = r.user_b_id
      )
  )
);

drop policy if exists "conversation_members_update_self" on public.conversation_members;
create policy "conversation_members_update_self"
on public.conversation_members
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "messages_select_members" on public.messages;
create policy "messages_select_members"
on public.messages
for select
to authenticated
using (
  exists (
    select 1
    from public.conversation_members cm
    where cm.conversation_id = messages.conversation_id
      and cm.user_id = auth.uid()
  )
);

drop policy if exists "messages_insert_sender_member" on public.messages;
create policy "messages_insert_sender_member"
on public.messages
for insert
to authenticated
with check (
  sender_user_id = auth.uid()
  and exists (
    select 1
    from public.conversation_members cm
    where cm.conversation_id = messages.conversation_id
      and cm.user_id = auth.uid()
  )
);

drop policy if exists "messages_update_sender_only" on public.messages;
create policy "messages_update_sender_only"
on public.messages
for update
to authenticated
using (sender_user_id = auth.uid())
with check (sender_user_id = auth.uid());
