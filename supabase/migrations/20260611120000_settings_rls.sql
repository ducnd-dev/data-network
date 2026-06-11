-- Allow users to update their own profile and org admins to rename the organisation.

create or replace function public.user_is_org_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role = 'admin' from public.profiles where id = auth.uid()),
    false
  );
$$;

create policy "profiles_update_own" on public.profiles
  for update
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "organizations_update_admin" on public.organizations
  for update
  using (
    id = public.user_organization_id()
    and public.user_is_org_admin()
  )
  with check (
    id = public.user_organization_id()
    and public.user_is_org_admin()
  );
