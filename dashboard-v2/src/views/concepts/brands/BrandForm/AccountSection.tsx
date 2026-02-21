import Card from '@/components/ui/Card'
import Switcher from '@/components/ui/Switcher'
import { FormItem } from '@/components/ui/Form'
import { Controller } from 'react-hook-form'
import { Tooltip } from '@/components/ui/Tooltip'
import type { FormSectionBaseProps } from './types'

type BrandStatusSectionProps = FormSectionBaseProps & {
    newBrand?: boolean // if creating a new brand, some options are hidden/disabled
}

const BrandStatusSection = ({
    control,
    errors,
    newBrand = false,
}: BrandStatusSectionProps) => {
    return (
        <Card>
            <h4 className="mb-5">Brand Status</h4>

            <div className="space-y-6">
                {/* Active / Inactive toggle */}
                <FormItem className="mb-0">
                    <Controller
                        name="status"
                        control={control}
                        render={({ field }) => {
                            const isActive = field.value === 'active'

                            return (
                                <div className="flex items-center justify-between gap-6">
                                    <div>
                                        <h6 className="font-medium">
                                            Brand Active
                                        </h6>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            When inactive, the brand will not
                                            appear in searches or public pages
                                        </p>
                                    </div>

                                    <Tooltip
                                        title={
                                            newBrand
                                                ? 'New brands are set to "pending" by default'
                                                : undefined
                                        }
                                    >
                                        <Switcher
                                            checked={isActive}
                                            disabled={newBrand} // usually cannot directly activate on creation
                                            onChange={(checked) => {
                                                field.onChange(
                                                    checked
                                                        ? 'active'
                                                        : 'suspended',
                                                )
                                            }}
                                        />
                                    </Tooltip>
                                </div>
                            )
                        }}
                    />
                </FormItem>

                {/* Verification Status – shown only in edit mode */}
                {!newBrand && (
                    <FormItem className="mb-0">
                        <Controller
                            name="verificationStatus"
                            control={control}
                            render={({ field }) => {
                                const statusText = {
                                    none: 'No verification request submitted yet',
                                    pending: 'Pending review',
                                    approved: 'Approved',
                                    rejected: 'Rejected',
                                }[field.value || 'none']

                                return (
                                    <div className="flex items-center justify-between gap-6">
                                        <div>
                                            <h6 className="font-medium">
                                                Brand Verification Status
                                            </h6>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                Current status:{' '}
                                                <span className="font-medium">
                                                    {statusText}
                                                </span>
                                            </p>
                                        </div>

                                        <div className="text-right">
                                            {field.value === 'approved' ? (
                                                <span className="text-success-600 font-medium">
                                                    ✓ Approved
                                                </span>
                                            ) : field.value === 'pending' ? (
                                                <span className="text-amber-600 font-medium">
                                                    ⏳ Under review
                                                </span>
                                            ) : field.value === 'rejected' ? (
                                                <span className="text-error-600 font-medium">
                                                    ✗ Rejected
                                                </span>
                                            ) : (
                                                <span className="text-gray-500">
                                                    —
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )
                            }}
                        />
                    </FormItem>
                )}

                {/* Request new verification – shown only in edit mode */}
                {!newBrand && (
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                            If your brand is not yet verified, you can submit a
                            new verification request.
                        </p>
                        <button
                            type="button"
                            className="text-primary-600 hover:text-primary-700 text-sm font-medium underline"
                            onClick={() => {
                                // Replace with actual navigation or modal logic
                                alert(
                                    'Redirecting to verification request page... (implement as needed)',
                                )
                            }}
                        >
                            Submit New Verification Request
                        </button>
                    </div>
                )}
            </div>

            {newBrand && (
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
                    New brands are automatically placed in{' '}
                    <strong>pending</strong> status after creation. After team
                    review, the status will be updated to{' '}
                    <strong>approved</strong>.
                </div>
            )}
        </Card>
    )
}

export default BrandStatusSection
