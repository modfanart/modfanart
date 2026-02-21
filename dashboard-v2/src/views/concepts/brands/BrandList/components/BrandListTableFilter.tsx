import { useState } from 'react'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import Checkbox from '@/components/ui/Checkbox'
import Input from '@/components/ui/Input'
import { Form, FormItem } from '@/components/ui/Form'
import { TbFilter } from 'react-icons/tb'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { ZodType } from 'zod'

// ─── RTK Query & Types ────────────────────────────────────────────────
import { useGetMyBrandsQuery } from '@/services/brands'
import type { Brand } from '@/services/brands'

// Common brand statuses from your Brand interface
const brandStatuses = ['active', 'pending', 'suspended', 'deactivated'] as const

// Zod schema for brand filters
type BrandFilterForm = {
    status: string[] // multi-select
    minFollowers: string // optional number as string (for input)
    maxFollowers: string
    hasLogo: boolean
    hasBanner: boolean
    verificationStatus?: 'pending' | 'approved' | 'rejected' | ''
}

const filterSchema: ZodType<BrandFilterForm> = z
    .object({
        status: z.array(z.enum(brandStatuses)).optional().default([]),
        minFollowers: z
            .string()
            .regex(/^\d*$/, 'Only numbers are allowed')
            .optional(),
        maxFollowers: z
            .string()
            .regex(/^\d*$/, 'Only numbers are allowed')
            .optional(),
        hasLogo: z.boolean().optional().default(false),
        hasBanner: z.boolean().optional().default(false),
        verificationStatus: z
            .enum(['pending', 'approved', 'rejected', ''])
            .optional(),
    })
    .refine(
        (data) => {
            if (data.minFollowers && data.maxFollowers) {
                return Number(data.minFollowers) <= Number(data.maxFollowers)
            }
            return true
        },
        {
            message: 'Minimum followers must be less than or equal to maximum',
            path: ['maxFollowers'],
        },
    )

const BrandListTableFilter = () => {
    const [dialogIsOpen, setDialogIsOpen] = useState(false)

    // For demo — in real app, share filter state with table component
    const { refetch } = useGetMyBrandsQuery({})

    const defaultValues: BrandFilterForm = {
        status: [],
        minFollowers: '',
        maxFollowers: '',
        hasLogo: false,
        hasBanner: false,
        verificationStatus: '',
    }

    const form = useForm<BrandFilterForm>({
        resolver: zodResolver(filterSchema),
        defaultValues,
    })

    const {
        handleSubmit,
        control,
        reset,
        formState: { isSubmitting },
    } = form

    const onSubmit = (values: BrandFilterForm) => {
        // Convert form values to API query params shape
        const queryParams: Partial<Parameters<typeof useGetMyBrandsQuery>[0]> =
            {}

        if (values.status.length > 0) {
            queryParams.status = values.status.join(',')
        }

        if (values.minFollowers) {
            queryParams.minFollowers = Number(values.minFollowers)
        }

        if (values.maxFollowers) {
            queryParams.maxFollowers = Number(values.maxFollowers)
        }

        if (values.hasLogo) queryParams.hasLogo = true
        if (values.hasBanner) queryParams.hasBanner = true

        if (values.verificationStatus) {
            queryParams.verificationStatus = values.verificationStatus
        }

        // In real app → update shared tableQueries state
        // e.g. setTableQueries(prev => ({ ...prev, ...queryParams, pageIndex: 1 }))

        // For demo only:
        refetch()

        setDialogIsOpen(false)
    }

    const handleReset = () => {
        reset(defaultValues)
        // Also reset shared query params in real implementation
    }

    return (
        <>
            <Button icon={<TbFilter />} onClick={() => setDialogIsOpen(true)}>
                Filter Brands
            </Button>

            <Dialog
                isOpen={dialogIsOpen}
                onClose={() => setDialogIsOpen(false)}
                onRequestClose={() => setDialogIsOpen(false)}
            >
                <h4 className="mb-6 text-lg font-bold">Filter Brands</h4>

                <Form onSubmit={handleSubmit(onSubmit)}>
                    {/* Status Multi-Select */}
                    <FormItem label="Brand Status" className="mb-6">
                        <Controller
                            name="status"
                            control={control}
                            render={({ field }) => (
                                <Checkbox.Group
                                    vertical
                                    className="grid grid-cols-2 gap-3"
                                    {...field}
                                >
                                    {brandStatuses.map((status) => (
                                        <Checkbox
                                            key={status}
                                            value={status}
                                            className="flex items-center gap-2 flex-row-reverse"
                                        >
                                            <span className="capitalize">
                                                {status}
                                            </span>
                                        </Checkbox>
                                    ))}
                                </Checkbox.Group>
                            )}
                        />
                    </FormItem>

                    {/* Followers Range */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <FormItem label="Minimum Followers">
                            <Controller
                                name="minFollowers"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        type="text"
                                        placeholder="e.g. 100"
                                        {...field}
                                    />
                                )}
                            />
                        </FormItem>

                        <FormItem label="Maximum Followers">
                            <Controller
                                name="maxFollowers"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        type="text"
                                        placeholder="e.g. 5000"
                                        {...field}
                                    />
                                )}
                            />
                        </FormItem>
                    </div>

                    {/* Has Logo / Banner */}
                    <FormItem label="Has Logo / Banner" className="mb-6">
                        <div className="flex flex-col gap-3">
                            <Controller
                                name="hasLogo"
                                control={control}
                                render={({ field }) => (
                                    <Checkbox
                                        checked={field.value}
                                        onChange={field.onChange}
                                    >
                                        Has Logo
                                    </Checkbox>
                                )}
                            />
                            <Controller
                                name="hasBanner"
                                control={control}
                                render={({ field }) => (
                                    <Checkbox
                                        checked={field.value}
                                        onChange={field.onChange}
                                    >
                                        Has Banner
                                    </Checkbox>
                                )}
                            />
                        </div>
                    </FormItem>

                    {/* Verification Status */}
                    <FormItem label="Verification Status" className="mb-8">
                        <Controller
                            name="verificationStatus"
                            control={control}
                            render={({ field }) => (
                                <select
                                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700"
                                    value={field.value ?? ''}
                                    onChange={(e) =>
                                        field.onChange(
                                            e.target.value || undefined,
                                        )
                                    }
                                >
                                    <option value="">All</option>
                                    <option value="pending">Pending</option>
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            )}
                        />
                    </FormItem>

                    {/* Buttons */}
                    <div className="flex justify-end items-center gap-3 mt-6">
                        <Button type="button" onClick={handleReset}>
                            Reset
                        </Button>
                        <Button
                            type="submit"
                            variant="solid"
                            loading={isSubmitting}
                            disabled={isSubmitting}
                        >
                            Apply Filters
                        </Button>
                    </div>
                </Form>
            </Dialog>
        </>
    )
}

export default BrandListTableFilter
