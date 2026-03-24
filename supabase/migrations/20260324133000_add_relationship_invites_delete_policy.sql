drop policy if exists "relationship_invites_delete_inviter" on public.relationship_invites;
create policy "relationship_invites_delete_inviter"
on public.relationship_invites
for delete
to authenticated
using (inviter_user_id = auth.uid());
