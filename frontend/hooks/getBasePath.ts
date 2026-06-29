export function getBasePath(user: any) {
  const roleRaw = user?.role?.name;
  const role = roleRaw?.toLowerCase();

  if (role === 'artist') {
    const username = user?.username?.trim().toLowerCase();
    return username ? `/artist/${username}` : null;
  }

  if (role === 'brand_manager') {
    const brandId = user?.brands?.[0]?.id;
    return brandId ? `/brand-manager/${brandId}` : null;
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