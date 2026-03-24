create or replace function public.accept_relationship_invite(p_code text)
returns table (
  invite_id uuid,
  relationship_id uuid,
  conversation_id uuid
)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid;
  invite_record public.relationship_invites%rowtype;
  created_relationship_id uuid;
  created_conversation_id uuid;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception 'auth required';
  end if;

  select *
  into invite_record
  from public.relationship_invites
  where code = upper(trim(p_code))
  for update;

  if not found then
    raise exception 'invite not found';
  end if;

  if invite_record.status <> 'pending' then
    raise exception 'invite is no longer pending';
  end if;

  if invite_record.expires_at is not null and invite_record.expires_at < now() then
    update public.relationship_invites
    set status = 'expired'
    where id = invite_record.id;

    raise exception 'invite has expired';
  end if;

  if invite_record.inviter_user_id = current_user_id then
    raise exception 'cannot accept your own invite';
  end if;

  if exists (
    select 1
    from public.relationships
    where status = 'active'
      and (
        user_a_id = current_user_id
        or user_b_id = current_user_id
        or user_a_id = invite_record.inviter_user_id
        or user_b_id = invite_record.inviter_user_id
      )
  ) then
    raise exception 'one of the users already has an active relationship';
  end if;

  insert into public.relationships (
    user_a_id,
    user_b_id,
    status,
    created_from_invite_id
  )
  values (
    invite_record.inviter_user_id,
    current_user_id,
    'active',
    invite_record.id
  )
  returning id into created_relationship_id;

  insert into public.conversations (
    relationship_id,
    type
  )
  values (
    created_relationship_id,
    'direct'
  )
  returning id into created_conversation_id;

  insert into public.conversation_members (
    conversation_id,
    user_id,
    role
  )
  values
    (created_conversation_id, invite_record.inviter_user_id, 'member'),
    (created_conversation_id, current_user_id, 'member');

  update public.relationship_invites
  set status = 'accepted',
      invitee_user_id = current_user_id,
      accepted_at = now()
  where id = invite_record.id;

  update public.profiles
  set status = 'inactive'
  where id in (invite_record.inviter_user_id, current_user_id);

  return query
  select invite_record.id, created_relationship_id, created_conversation_id;
end;
$$;
