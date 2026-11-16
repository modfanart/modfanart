'use client';

import { RoleView } from '../_views/role-view';
import ArtistLicensing from '../_views/artist/licensing/page';
import BrandLicensing from '../_views/brand/licensing/page';

// Artists see licensing & earnings; brands see incoming licensing requests.
export default function LicensingPage() {
  return (
    <RoleView
      otherwise="/dashboard"
      views={{ artist: <ArtistLicensing />, brand: <BrandLicensing /> }}
    />
  );
}
