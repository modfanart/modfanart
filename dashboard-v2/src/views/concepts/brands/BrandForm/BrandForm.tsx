import { useEffect } from 'react'
import { Form } from '@/components/ui/Form'
import Container from '@/components/shared/Container'
import BottomStickyBar from '@/components/template/BottomStickyBar'
import OverviewSection from './OverviewSection' // name, slug, description, website
import SocialLinksSection from './SocialLinksSection' // instagram, twitter, etc.
import BannerSection from './BannerSection' // banner_url
import ProfileImageSection from './ProfileImageSection' // logo_url
import BrandStatusSection from './BrandStatusSection' // status, verification (edit only)

import isEmpty from 'lodash/isEmpty'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import type { ZodType } from 'zod'
import type { CommonProps } from '@/@types/common'

// Adjust according to your actual Brand type
export type BrandFormSchema = {
    name: string
    slug: string
    description?: string
    logo_url?: string
    banner_url?: string
    website?: string
    social_links?: Record<string, string> // e.g. { instagram: "...", twitter: "..." }
    status?: 'active' | 'pending' | 'suspended' | 'deactivated'
    // Optional: categories?: string[]; or tags
    // verification_request_id?: string; // usually handled separately
}

type BrandFormProps = {
    onFormSubmit: (values: BrandFormSchema) => void
    defaultValues?: Partial<BrandFormSchema>
    newBrand?: boolean // true = create, false = edit
} & CommonProps

const validationSchema: ZodType<BrandFormSchema> = z.object({
    name: z.string().min(2, { message: 'Brand name is required' }),
    slug: z
        .string()
        .min(3, { message: 'Slug is required' })
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
            message:
                'Slug can only contain lowercase letters, numbers, and hyphens',
        }),
    description: z.string().optional(),
    logo_url: z
        .string()
        .url({ message: 'Invalid logo URL' })
        .optional()
        .or(z.literal('')),
    banner_url: z
        .string()
        .url({ message: 'Invalid banner URL' })
        .optional()
        .or(z.literal('')),
    website: z
        .string()
        .url({ message: 'Invalid website URL' })
        .optional()
        .or(z.literal('')),
    social_links: z.record(z.string()).optional(),
    status: z
        .enum(['active', 'pending', 'suspended', 'deactivated'])
        .optional(),
})

const BrandForm = (props: BrandFormProps) => {
    const {
        onFormSubmit,
        defaultValues = {},
        newBrand = false,
        children,
    } = props

    const {
        handleSubmit,
        reset,
        formState: { errors },
        control,
    } = useForm<BrandFormSchema>({
        defaultValues: {
            status: 'pending', // default for new brands
            ...defaultValues,
        },
        resolver: zodResolver(validationSchema),
    })

    useEffect(() => {
        if (!isEmpty(defaultValues)) {
            reset(defaultValues)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(defaultValues)])

    const onSubmit = (values: BrandFormSchema) => {
        onFormSubmit?.(values)
    }

    return (
        <Form
            className="flex w-full h-full"
            containerClassName="flex flex-col w-full justify-between"
            onSubmit={handleSubmit(onSubmit)}
        >
            <Container>
                <div className="flex flex-col md:flex-row gap-5 md:gap-6">
                    {/* Left column - Main info */}
                    <div className="flex flex-col gap-5 flex-auto">
                        <OverviewSection control={control} errors={errors} />
                        {/* You can add more sections here like BusinessInfoSection if needed */}
                    </div>

                    {/* Right sidebar - Visuals & Settings */}
                    <div className="md:w-[380px] lg:w-[420px] flex flex-col gap-5">
                        <ProfileImageSection
                            control={control}
                            errors={errors}
                        />
                        <BannerSection control={control} errors={errors} />
                        <SocialLinksSection control={control} errors={errors} />
                        {!newBrand && (
                            <BrandStatusSection
                                control={control}
                                errors={errors}
                                newBrand={newBrand}
                            />
                        )}
                    </div>
                </div>
            </Container>

            <BottomStickyBar>{children}</BottomStickyBar>
        </Form>
    )
}

export default BrandForm
