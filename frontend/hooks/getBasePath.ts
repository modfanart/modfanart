export function getBasePath(user: any) {
  const roleRaw = user?.role?.name;
  const role = roleRaw?.toLowerCase();

  if (role === 'artist') {
    const username = user?.username?.trim().toLowerCase();
    return username ? `/artist/${username}` : null;
  }

  if (role === 'brand_manager' || role === 'brand_owner') {
    const brandSlug = user?.brands?.[0]?.slug;
    return brandSlug ? `/brand-manager/${brandSlug}` : null;
  }

  if (role === 'judge') {
    const username = user?.username?.trim().toLowerCase();
    return username ? `/judge/${username}` : null;
  }

  if (
    role === 'admin' ||
    role === 'super_admin' ||
    role === 'developer'
  ) {
    return `/admin/${roleRaw}`;
  }

  return null;
}