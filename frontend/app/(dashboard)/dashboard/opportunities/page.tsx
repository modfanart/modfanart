'use client';

import { RoleView } from '../_views/role-view';
import ArtistOpportunities from '../_views/artist/opportunities/page';
import BrandOpportunities from '../_views/brand/opportunities/page';

// Artists browse opportunities they can enter; brands manage their own.
export default function OpportunitiesPage() {
  return (
    <RoleView
      otherwise="/dashboard"
      views={{ artist: <ArtistOpportunities />, brand: <BrandOpportunities /> }}
    />
  );
}
