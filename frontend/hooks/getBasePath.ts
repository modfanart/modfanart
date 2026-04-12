export function getBasePath(user: any) {
  const role = user?.role?.name;

  if (role === 'Artist') {
    const username = user?.username?.trim().toLowerCase();
    return username ? `/artist/${username}` : null;
  }

  if (role === 'brand_manager') {
    const brandId = user?.brands?.[0]?.id;
    return brandId ? `/brand-manager/${brandId}` : null;
  }

  if (role === 'judge') {
    return `/judge/${user?.username}`;
  }

  if (role === 'Admin') {
    return `/admin/${role}`;
  }

  return null;
}
