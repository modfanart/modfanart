import { useMemo } from 'react'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import { FormItem } from '@/components/ui/Form'
import { Controller } from 'react-hook-form'
import type { FormSectionBaseProps } from './types'

const OverviewSection = ({ control, errors }: FormSectionBaseProps) => {
    // Optional: auto-slug generation can be added here later
    // e.g. watch("name") → generate slug → setValue("slug", ...)

    return (
        <Card>
            <h4 className="mb-6">Brand Overview</h4>

            <div className="grid md:grid-cols-2 gap-5">
                {/* Brand Name */}
                <FormItem
                    label="Brand Name"
                    invalid={Boolean(errors.name)}
                    errorMessage={errors.name?.message}
                    asterisk
                >
                    <Controller
                        name="name"
                        control={control}
                        render={({ field }) => (
                            <Input
                                type="text"
                                autoComplete="off"
                                placeholder="e.g. Nike Iran, Adidas Original, ..."
                                {...field}
                            />
                        )}
                    />
                </FormItem>

                {/* Slug */}
                <FormItem
                    label="Slug (URL Identifier)"
                    invalid={Boolean(errors.slug)}
                    errorMessage={errors.slug?.message}
                    asterisk
                    extraHelp="Used in the brand's page URL (lowercase letters, numbers, hyphens only)"
                >
                    <Controller
                        name="slug"
                        control={control}
                        render={({ field }) => (
                            <Input
                                type="text"
                                autoComplete="off"
                                placeholder="e.g. nike-iran, adidas-original"
                                dir="ltr"
                                className="font-mono"
                                {...field}
                            />
                        )}
                    />
                </FormItem>
            </div>

            {/* Official Website */}
            <FormItem
                label="Official Website"
                invalid={Boolean(errors.website)}
                errorMessage={errors.website?.message}
            >
                <Controller
                    name="website"
                    control={control}
                    render={({ field }) => (
                        <Input
                            type="url"
                            autoComplete="off"
                            placeholder="https://www.example.com"
                            dir="ltr"
                            {...field}
                        />
                    )}
                />
            </FormItem>

            {/* Short Description / Tagline */}
            <FormItem
                label="Brand Description"
                invalid={Boolean(errors.description)}
                errorMessage={errors.description?.message}
                extraHelp="Keep it short – 2–3 sentences max. Shown on the main brand page."
            >
                <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                        <Textarea
                            placeholder="Specialized sportswear brand focused on quality and modern design..."
                            rows={3}
                            {...field}
                        />
                    )}
                />
            </FormItem>
        </Card>
    )
}

export default OverviewSection
