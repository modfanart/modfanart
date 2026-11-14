'use client';

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, ArrowLeft } from '@phosphor-icons/react';

import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/button';

import {
  useGetVerificationRequestsQuery,
  useApproveVerificationRequestMutation,
} from '../../services/api/brandApi';

import { toast } from 'sonner';

const BrandVerificationRequestsPage = () => {
  const navigate = useNavigate();

  const {
    data: requests = [],
    isLoading: requestsLoading,
  } = useGetVerificationRequestsQuery();

  const [approveRequest] = useApproveVerificationRequestMutation();

  const handleApprove = async (requestId) => {
    try {
      await approveRequest({ requestId }).unwrap();
      toast.success('Verification request approved');
    } catch (error) {
      toast.error('Failed to approve verification request');
    }
  };

  return (
    <div className="min-h-screen" data-testid="brand-verification-requests-page">
      <Header
        title="Verification Requests"
        subtitle={`${Array.isArray(requests) ? requests.length : 0} pending requests`}
      />

      <div className="p-4 sm:p-6 space-y-6">
        <Button
          variant="ghost"
          className="text-zinc-400 hover:text-white"
          onClick={() => navigate('/brands')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Brands
        </Button>

        {requestsLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !requests?.length ? (
          <div className="flex flex-col items-center justify-center h-64 text-center bg-zinc-900 border border-zinc-800 rounded-xl">
            <Users weight="duotone" className="w-12 h-12 text-zinc-600 mb-4" />
            <p className="text-zinc-400">No verification requests</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <div
                key={req.id}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-6"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-white text-lg">
                      {req.company_name}
                    </h3>
                    {req.website && (
                      <a
                        href={req.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-blue-400 hover:underline break-all"
                      >
                        {req.website}
                      </a>
                    )}
                  </div>
                  <span className="px-2 py-1 text-xs rounded bg-zinc-800 text-zinc-300 capitalize flex-shrink-0">
                    {req.status}
                  </span>
                </div>

                {req.documents?.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs text-zinc-500 mb-1">Documents</p>
                    <div className="flex flex-wrap gap-2">
                      {req.documents.map((doc, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2 py-1 bg-zinc-800 text-zinc-300 rounded"
                        >
                          {doc}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {req.notes && (
                  <p className="mt-3 text-sm text-zinc-400 border-l-2 border-zinc-700 pl-3">
                    {req.notes}
                  </p>
                )}

                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                  <button
                    onClick={() => handleApprove(req.id)}
                    className="flex-1 bg-white text-black py-2 rounded-md hover:bg-zinc-200 transition-colors"
                  >
                    Approve Verification
                  </button>

                  <button
                    type="button"
                    className="flex-1 border border-red-900 text-red-400 hover:bg-red-950 py-2 rounded-md transition-colors"
                  >
                    Reject
                  </button>

                  <Link
                    to={`/brand/${req.user_id}/verification-workflow`}
                    className="flex-1 text-center border border-zinc-700 text-zinc-300 hover:bg-zinc-800 py-2 rounded-md transition-colors"
                  >
                    View Workflow
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandVerificationRequestsPage;
