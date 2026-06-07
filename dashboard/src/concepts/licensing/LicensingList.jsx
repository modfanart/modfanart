// src/pages/licenses/LicensesList.jsx

import React, { useMemo, useState } from 'react';
import { 
  useGetAllLicensesQuery,
  useGetMyLicensesQuery,
  useGetIssuedLicensesQuery,
  useRevokeLicenseMutation,
} from '../../services/api/licenseApi';

import { useAuth } from '../../contexts/AuthContext';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';

import { 
  ShieldCheck, 
  Clock, 
  WarningCircle 
} from '@phosphor-icons/react';

import { toast } from 'sonner';

export const LicensesList = () => {
  const { hasRole } = useAuth();

  const isAdmin = hasRole(['super_admin', 'admin']);
  const isSeller = hasRole(['artist', 'brand_manager']);

  const [revokeConfirm, setRevokeConfirm] = useState({ open: false, license: null });
  const [revokeLicense] = useRevokeLicenseMutation();

  // 🔥 Role-based query selection
  const {
    data: allData,
    isLoading: loadingAll,
  } = useGetAllLicensesQuery(undefined, { skip: !isAdmin });

  const {
    data: issuedData,
    isLoading: loadingIssued,
  } = useGetIssuedLicensesQuery(undefined, { skip: !isSeller || isAdmin });

  const {
    data: myData,
    isLoading: loadingMy,
  } = useGetMyLicensesQuery(undefined, { skip: isAdmin || isSeller });

  const licenses = useMemo(() => {
    if (isAdmin) return allData?.licenses || [];
    if (isSeller) return issuedData?.licenses || [];
    return myData?.licenses || [];
  }, [isAdmin, isSeller, allData, issuedData, myData]);

  const isLoading = loadingAll || loadingIssued || loadingMy;

  const handleRevoke = async () => {
    try {
      await revokeLicense({
        id: revokeConfirm.license.id,
        reason: 'Violation / Admin action',
      }).unwrap();

      toast.success('License revoked');
      setRevokeConfirm({ open: false, license: null });
    } catch {
      toast.error('Failed to revoke');
    }
  };

  const statusVariant = (status) => {
    switch (status) {
      case 'active': return 'default';
      case 'revoked': return 'destructive';
      case 'expired': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="min-h-screen">
      <Header 
        title="Licenses" 
        subtitle={`${licenses.length} total licenses`} 
      />

      <div className="p-6 space-y-6">

        {/* Loading */}
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white border-t-transparent animate-spin rounded-full" />
          </div>
        ) : licenses.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-zinc-500">
            <ShieldCheck className="w-12 h-12 mb-4" />
            No licenses found
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {licenses.map((license) => (
              <div
                key={license.id}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-5"
              >
                {/* Header */}
                <div className="flex justify-between mb-4">
                  <div>
                    <p className="font-semibold text-white">
                      {license.asset_name || 'Untitled Asset'}
                    </p>
                    <p className="text-xs text-zinc-500">
                      #{license.id.slice(0, 8)}
                    </p>
                  </div>

                  <Badge variant={statusVariant(license.status)}>
                    {license.status}
                  </Badge>
                </div>

                {/* Info */}
                <div className="text-sm text-zinc-400 space-y-2 mb-4">
                  <div>
                    Buyer: <span className="text-white">{license.buyer_username || '—'}</span>
                  </div>
                  <div>
                    Seller: <span className="text-white">{license.seller_username || '—'}</span>
                  </div>
                </div>

                {/* Dates */}
                <div className="flex items-center gap-2 text-xs text-zinc-500 mb-4">
                  <Clock className="w-4 h-4" />
                  {license.created_at
                    ? new Date(license.created_at).toLocaleDateString()
                    : '—'}
                </div>

                {/* Actions */}
                {(isAdmin || isSeller) && license.status === 'active' && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-500 hover:text-red-400"
                    onClick={() => setRevokeConfirm({ open: true, license })}
                  >
                    <WarningCircle className="w-4 h-4 mr-1" />
                    Revoke
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Revoke Dialog */}
      <Dialog 
        open={revokeConfirm.open} 
        onOpenChange={() => setRevokeConfirm({ open: false, license: null })}
      >
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle>Revoke License</DialogTitle>
          </DialogHeader>

          <p className="text-zinc-400">
            Are you sure you want to revoke this license?
          </p>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setRevokeConfirm({ open: false, license: null })}
            >
              Cancel
            </Button>

            <Button 
              variant="destructive"
              onClick={handleRevoke}
            >
              Revoke
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LicensesList;