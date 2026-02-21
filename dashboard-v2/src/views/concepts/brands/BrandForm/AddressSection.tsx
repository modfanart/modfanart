import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import { FormItem } from '@/components/ui/Form'
import { Controller } from 'react-hook-form'
import type { FormSectionBaseProps } from './types'

const AddressSection = ({ control, errors }: FormSectionBaseProps) => {
    return (
        <Card>
            <h4 className="mb-6">Contact & Online Presence</h4>

            <div className="space-y-6">
                {/* Official Website */}
                <FormItem
                    label="Official Website"
                    invalid={Boolean(errors.website)}
                    errorMessage={errors.website?.message}
                    extraHelp="Main brand website URL (optional but highly recommended)"
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
                                className="font-mono"
                                {...field}
                            />
                        )}
                    />
                </FormItem>

                {/* General Contact Email */}
                <FormItem
                    label="Public Contact Email"
                    invalid={Boolean(errors.contact_email)}
                    errorMessage={errors.contact_email?.message}
                    extraHelp="Official email for customers, media, and business inquiries"
                >
                    <Controller
                        name="contact_email"
                        control={control}
                        render={({ field }) => (
                            <Input
                                type="email"
                                autoComplete="off"
                                placeholder="info@brandname.com"
                                dir="ltr"
                                {...field}
                            />
                        )}
                    />
                </FormItem>

                {/* Location / Headquarters Description */}
                <FormItem
                    label="Location / Headquarters"
                    invalid={Boolean(errors.location_description)}
                    errorMessage={errors.location_description?.message}
                    extraHelp="Example: Tehran, Iran | London, United Kingdom | Production in Turkey & Italy"
                >
                    <Controller
                        name="location_description"
                        control={control}
                        render={({ field }) => (
                            <Input
                                type="text"
                                autoComplete="off"
                                placeholder="Tehran, Iran"
                                {...field}
                            />
                        )}
                    />
                </FormItem>

                {/* Additional Address Notes */}
                <FormItem
                    label="Additional Notes"
                    invalid={Boolean(errors.address_notes)}
                    errorMessage={errors.address_notes?.message}
                    extraHelp="Any other useful information such as representative office address, support hours, etc."
                >
                    <Controller
                        name="address_notes"
                        control={control}
                        render={({ field }) => (
                            <Textarea
                                placeholder="Headquarters: Tehran, Valiasr St., No. 1234\nSupport: Saturday–Thursday 9 AM – 6 PM"
                                rows={3}
                                {...field}
                            />
                        )}
                    />
                </FormItem>
            </div>

            <div className="mt-6 pt-5 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
                Note: Brands usually do not need to display exact
                customer-facing postal addresses. This section is mainly used to
                show contact information and build brand credibility.
            </div>
        </Card>
    )
}

export default AddressSection
