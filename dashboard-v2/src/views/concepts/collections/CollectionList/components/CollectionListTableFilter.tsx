// src/components/collections/CollectionListTableFilter.tsx

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

// ────────────────────────────────────────────────
// Define your filter shape here
// Adjust fields according to what makes sense for collections
// ────────────────────────────────────────────────
type CollectionFilterForm = {
    nameContains?: string // جستجو در نام مجموعه
    isPublic?: 'all' | 'public' | 'private' // یا می‌توانید از boolean استفاده کنید
    minItems?: number // حداقل تعداد آثار (اختیاری)
    visibility?: Array<'public' | 'private'> // یا هر دسته‌بندی دیگری
}

const visibilityOptions = [
    'عمومی', // public
    'خصوصی', // private
] as const

// Validation schema – make fields optional if they are not required
const validationSchema: ZodType<CollectionFilterForm> = z.object({
    nameContains: z.string().optional(),
    visibility: z.array(z.enum(['عمومی', 'خصوصی'])).optional(),
    // minItems: z.number().min(0).optional(),
    // isPublic: z.enum(['all', 'public', 'private']).optional(),
})

const CollectionListTableFilter = () => {
    const [dialogIsOpen, setIsOpen] = useState(false)

    // You'll need to create/use a filter state management
    // Option 1: local state (simple)
    // Option 2: zustand / context / parent prop (recommended for list + filter sync)
    // For now – assuming you have something like useCollectionList or zustand store
    // const { filterData, setFilterData } = useCollectionFilters()

    // Temporary local state – replace with real one later
    const [filterData, setFilterData] = useState<CollectionFilterForm>({})

    const { handleSubmit, reset, control } = useForm<CollectionFilterForm>({
        defaultValues: filterData,
        resolver: zodResolver(validationSchema),
    })

    const onSubmit = (values: CollectionFilterForm) => {
        // Clean/trim values if needed
        const cleaned = {
            ...values,
            nameContains: values.nameContains?.trim() || undefined,
        }

        setFilterData(cleaned)
        setIsOpen(false)

        // Here you would typically trigger refetch or update query params
        // e.g. setQueryArgs(prev => ({ ...prev, ...cleaned }))
    }

    const handleReset = () => {
        reset({})
        setFilterData({})
        // Optionally trigger refetch with cleared filters
    }

    return (
        <>
            <Button
                icon={<TbFilter className="text-lg" />}
                onClick={() => setIsOpen(true)}
            >
                فیلتر کنید
            </Button>

            <Dialog
                isOpen={dialogIsOpen}
                onClose={() => setIsOpen(false)}
                onRequestClose={() => setIsOpen(false)}
                bodyOpenClassName="overflow-hidden"
            >
                <h4 className="mb-5">فیلتر مجموعه‌ها</h4>

                <Form onSubmit={handleSubmit(onSubmit)}>
                    <FormItem label="نام مجموعه">
                        <Controller
                            name="nameContains"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    type="text"
                                    autoComplete="off"
                                    placeholder="جستجو در نام مجموعه..."
                                    {...field}
                                />
                            )}
                        />
                    </FormItem>

                    <FormItem label="وضعیت دسترسی">
                        <Controller
                            name="visibility"
                            control={control}
                            render={({ field }) => (
                                <Checkbox.Group
                                    vertical
                                    className="flex flex-col mt-3 gap-2"
                                    {...field}
                                >
                                    {visibilityOptions.map((option) => (
                                        <Checkbox
                                            key={option}
                                            value={option}
                                            className="justify-between flex-row-reverse heading-text"
                                        >
                                            {option}
                                        </Checkbox>
                                    ))}
                                </Checkbox.Group>
                            )}
                        />
                    </FormItem>

                    {/* Example of another filter – uncomment/add as needed */}
                    {/* 
          <FormItem label="حداقل تعداد آثار">
            <Controller
              name="minItems"
              control={control}
              render={({ field }) => (
                <Input
                  type="number"
                  min={0}
                  placeholder="مثال: 5"
                  {...field}
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                />
              )}
            />
          </FormItem>
          */}

                    <div className="flex justify-end items-center gap-3 mt-6">
                        <Button type="button" onClick={handleReset}>
                            بازنشانی
                        </Button>
                        <Button type="submit" variant="solid">
                            اعمال فیلتر
                        </Button>
                    </div>
                </Form>
            </Dialog>
        </>
    )
}

export default CollectionListTableFilter
