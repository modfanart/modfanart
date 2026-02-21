import Card from '@/components/ui/Card'
import Select from '@/components/ui/Select'
import { Controller } from 'react-hook-form'
import CreatableSelect from 'react-select/creatable'
import type { FormSectionBaseProps } from './types'

type TagsSectionProps = FormSectionBaseProps

const defaultBrandCategories = [
    { value: 'fashion', label: 'Fashion & Apparel' },
    { value: 'sportswear', label: 'Sportswear' },
    { value: 'streetwear', label: 'Streetwear' },
    { value: 'luxury', label: 'Luxury' },
    { value: 'accessories', label: 'Accessories' },
    { value: 'footwear', label: 'Footwear' },
    { value: 'traditional', label: 'Traditional / Local' },
    { value: 'sustainable', label: 'Sustainable / Eco-Friendly' },
    { value: 'minimalist', label: 'Minimalist' },
    { value: 'vintage', label: 'Vintage / Retro' },
]

const TagsSection = ({ control, errors }: TagsSectionProps) => {
    return (
        <Card>
            <h4 className="mb-2">Brand Categories & Tags</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
                Select the main categories for your brand or add custom tags
                (helps your brand appear in better search results and filters)
            </p>

            <div className="mt-2">
                <Controller
                    name="categories"
                    control={control}
                    render={({ field }) => (
                        <Select
                            isMulti
                            isClearable
                            isCreatable
                            componentAs={CreatableSelect}
                            placeholder="Add category or tag (e.g. denim, casual, handmade...)"
                            options={defaultBrandCategories}
                            formatCreateLabel={(inputValue) =>
                                `Create new tag: "${inputValue}"`
                            }
                            noOptionsMessage={() =>
                                'No categories found – create a new one'
                            }
                            onChange={(newValue) => {
                                // newValue is array of {value, label}
                                field.onChange(newValue)
                            }}
                            value={field.value}
                            className="react-select-container"
                            classNamePrefix="react-select"
                            styles={{
                                control: (base) => ({
                                    ...base,
                                    borderColor: errors?.categories
                                        ? '#dc2626'
                                        : base.borderColor,
                                }),
                            }}
                        />
                    )}
                />

                {errors?.categories && (
                    <div className="text-error-600 text-sm mt-1.5">
                        {errors.categories.message ||
                            'Please select at least one category'}
                    </div>
                )}
            </div>

            <div className="mt-5 text-xs text-gray-500 dark:text-gray-400">
                Note: Custom tags you create can be very specific (e.g.
                "local-tehran", "influencer-collab", "winter-seasonal")
            </div>
        </Card>
    )
}

export default TagsSection
