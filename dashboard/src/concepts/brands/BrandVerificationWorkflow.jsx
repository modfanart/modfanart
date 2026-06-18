'use client';

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/button';

import {
    useGetVerificationRequestsQuery,
    useApproveVerificationRequestMutation,
} from '../../services/api/brands';

const BrandVerificationWorkflowPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const {
        data: requests = [],
        isLoading,
        isError,
    } = useGetVerificationRequestsQuery();

    const [approveRequest, { isLoading: approving }] =
        useApproveVerificationRequestMutation();

    const request = requests.find((r) => r.user_id === id);

    const handleApprove = async () => {
        if (!request) return;

        try {
            await approveRequest({
                requestId: request.id,
                status: 'approved',
            }).unwrap();

            navigate('/brands');
        } catch (err) {
            console.error('Approval failed:', err);
        }
    };

    return (
        <div className="min-h-screen">
            {/* HEADER (MATCHING OTHER PAGES) */}
            <Header
                title="Verification Workflow"
                subtitle={
                    request
                        ? `${request.company_name} • ${request.status}`
                        : 'Loading verification request'
                }
            />

            <div className="p-4 sm:p-6 space-y-6">
                {/* LOADING */}
                {isLoading && (
                    <div className="bg-zinc-900 border border-zinc-800 rounded-md h-64 flex items-center justify-center">
                        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                )}

                {/* ERROR */}
                {isError && (
                    <div className="bg-zinc-900 border border-zinc-800 rounded-md h-64 flex items-center justify-center text-red-400">
                        Failed to load verification request
                    </div>
                )}

                {/* NOT FOUND */}
                {!isLoading && !isError && !request && (
                    <div className="bg-zinc-900 border border-zinc-800 rounded-md h-64 flex items-center justify-center text-zinc-400">
                        Verification request not found
                    </div>
                )}

                {/* CONTENT */}
                {request && (
                    <>
                        {/* BASIC INFO */}
                        <div className="bg-zinc-900 border border-zinc-800 rounded-md p-6">
                            <h2 className="text-white text-lg font-semibold">
                                {request.company_name}
                            </h2>

                            <p className="text-sm text-zinc-400 mt-1">
                                Status:{' '}
                                <span className="text-white capitalize">
                                    {request.status}
                                </span>
                            </p>

                            <p className="text-sm text-zinc-500 mt-1">
                                Submitted:{' '}
                                {new Date(request.created_at).toLocaleString()}
                            </p>
                        </div>

                        {/* WEBSITE */}
                        <div className="bg-zinc-900 border border-zinc-800 rounded-md p-6">
                            <h3 className="text-white font-medium mb-2">Website</h3>

                            <a
                                href={request.website}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-400 hover:underline"
                            >
                                {request.website}
                            </a>
                        </div>

                        {/* DOCUMENTS */}
                        <div className="bg-zinc-900 border border-zinc-800 rounded-md p-6">
                            <h3 className="text-white font-medium mb-3">
                                Documents
                            </h3>

                            {request.documents?.length ? (
                                <div className="space-y-2">
                                    {request.documents.map((doc, i) => (
                                        <div
                                            key={i}
                                            className="flex justify-between items-center bg-zinc-800 px-3 py-2 rounded"
                                        >
                                            <span className="text-zinc-300 text-sm">
                                                {doc}
                                            </span>

                                            <a
                                                href={doc}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-xs text-blue-400 hover:underline"
                                            >
                                                View
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-zinc-500 text-sm">
                                    No documents uploaded
                                </p>
                            )}
                        </div>

                        {/* NOTES */}
                        <div className="bg-zinc-900 border border-zinc-800 rounded-md p-6">
                            <h3 className="text-white font-medium mb-2">
                                Admin Notes
                            </h3>

                            <p className="text-zinc-400 text-sm">
                                {request.notes || 'No notes provided'}
                            </p>
                        </div>

                        {/* ACTIONS */}
                        {request.status === 'pending' && (
                            <div className="flex gap-3">
                                <Button
                                    onClick={handleApprove}
                                    disabled={approving}
                                    className="flex-1"
                                >
                                    {approving ? 'Approving...' : 'Approve'}
                                </Button>

                                <Button
                                    variant="outline"
                                    className="flex-1 border-red-900 text-red-400 hover:bg-red-950"
                                >
                                    Reject
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default BrandVerificationWorkflowPage;