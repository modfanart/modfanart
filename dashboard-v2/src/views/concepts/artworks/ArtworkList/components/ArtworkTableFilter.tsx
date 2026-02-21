// src/features/artworks/components/ArtworkTableFilter.tsx
import { useState } from 'react'
import Button from '@/components/ui/Button'
import Drawer from '@/components/ui/Drawer'
import Checkbox from '@/components/ui/Checkbox'
import Badge from '@/components/ui/Badge'
import Select, { components } from '@/components/ui/Select'
import { Form, FormItem } from '@/components/ui/Form'
import { TbFilter, TbMinus } from 'react-icons/tb'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import classNames from '@/utils/classNames'

import { useGetAllCategoriesQuery } from '@/services/artworkApi'

const { Control, Option: DefaultOption } = components

type FormSchema = {
    status: string // '' = all
    categories: string[] // selected category slugs or ids
    // Optional later: minViews?: number, maxViews?: number
}

type StatusOption = {
    value: string
    label: string
    colorClass: string
}

const statusOptions: StatusOption[] = [
    { value: '', label: 'All statuses', colorClass: 'bg-gray-400' },
    { value: 'published', label: 'Published', colorClass: 'bg-emerald-500' },
    { value: 'draft', label: 'Draft', colorClass: 'bg-amber-500' },
    {
        value: 'moderation_pending',
        label: 'Under Review',
        colorClass: 'bg-blue-500',
    },
    { value: 'rejected', label: 'Rejected', colorClass: 'bg-red-500' },
    { value: 'archived', label: 'Archived', colorClass: 'bg-gray-600' },
]

const CustomOption = (props: any) => (
    <DefaultOption {...props}>
        <span className="flex items-center gap-2">
            <Badge className={props.data.colorClass} />
            <span>{props.label}</span>
        </span>
    </DefaultOption>
)

const CustomControl = ({ children, ...props }: any) => {
    const selected = props.getValue()[0]
    return (
        <Control {...props}>
            {selected && (
                <Badge className={classNames('mr-3', selected.colorClass)} />
            )}
            {children}
        </Control>
    )
}

const validationSchema = z.object({
    status: z.string(),
    categories: z.array(z.string()),
    // minViews: z.number().optional(),
    // maxViews: z.number().optional(),
})

type ArtworkTableFilterProps = {
    onApplyFilters?: (values: FormSchema) => void
}

const ArtworkTableFilter = ({ onApplyFilters }: ArtworkTableFilterProps) => {
    const [isOpen, setIsOpen] = useState(false)

    const { data: categories = [] } = useGetAllCategoriesQuery(
        { activeOnly: true },
        { skip: !isOpen },
    )

    const categoryOptions = categories.map((cat) => ({
        value: cat.slug || cat.id,
        label: cat.name,
    }))

    const form = useForm<FormSchema>({
        resolver: zodResolver(validationSchema),
        defaultValues: {
            status: '',
            categories: [],
        },
    })

    const { handleSubmit, control, reset } = form

    const onSubmit = (values: FormSchema) => {
        const cleanValues = {
            ...values,
            status: values.status || undefined,
        }
        onApplyFilters?.(cleanValues)
        setIsOpen(false)
    }

    const handleReset = () => {
        reset({ status: '', categories: [] })
        onApplyFilters?.({ status: undefined, categories: [] })
        setIsOpen(false)
    }

    return (
        <>
            <Button
                icon={<TbFilter className="text-lg" />}
                variant="default"
                onClick={() => setIsOpen(true)}
            >
                Filter Artworks
            </Button>

            <Drawer
                title="Filter Artworks"
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                footer={
                    <div className="flex gap-2 w-full">
                        <Button
                            variant="solid"
                            type="submit"
                            form="filter-form"
                            block
                        >
                            Apply Filters
                        </Button>
                        <Button variant="outline" onClick={handleReset} block>
                            Clear
                        </Button>
                    </div>
                }
            >
                <Form
                    id="filter-form"
                    className="h-full flex flex-col"
                    onSubmit={handleSubmit(onSubmit)}
                >
                    <div className="flex-1 space-y-6">
                        {/* Status */}
                        <FormItem label="Artwork Status">
                            <Controller
                                name="status"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        options={statusOptions}
                                        value={
                                            statusOptions.find(
                                                (opt) =>
                                                    opt.value === field.value,
                                            ) || null
                                        }
                                        components={{
                                            Option: CustomOption,
                                            Control: CustomControl,
                                        }}
                                        placeholder="Select status..."
                                        isClearable
                                        onChange={(opt) =>
                                            field.onChange(opt ? opt.value : '')
                                        }
                                    />
                                )}
                            />
                        </FormItem>

                        {/* Categories */}
                        <FormItem label="Categories">
                            <Controller
                                name="categories"
                                control={control}
                                render={({ field }) => (
                                    <Checkbox.Group
                                        vertical
                                        className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2"
                                        {...field}
                                    >
                                        {categoryOptions.map((cat) => (
                                            <Checkbox
                                                key={cat.value}
                                                value={cat.value}
                                                className="justify-between flex-row-reverse"
                                            >
                                                {cat.label}
                                            </Checkbox>
                                        ))}
                                    </Checkbox.Group>
                                )}
                            />
                        </FormItem>

                        {/* Uncomment if you later add views range filter
            <FormItem label="Views Range">
              <div className="flex items-center gap-3">
                <Controller name="minViews" ... />
                <TbMinus />
                <Controller name="maxViews" ... />
              </div>
            </FormItem>
            */}
                    </div>
                </Form>
            </Drawer>
        </>
    )
}

export default ArtworkTableFilter
