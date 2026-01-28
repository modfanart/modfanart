import { useState } from 'react'
import Button from '@/components/ui/Button'
import Drawer from '@/components/ui/Drawer'
import Checkbox from '@/components/ui/Checkbox'
import { Form, FormItem } from '@/components/ui/Form'
import { useManageArticleStore } from '../store/manageArticleStore'
import { categoryOption } from '../utils'
import { TbFilter } from 'react-icons/tb'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { ZodType } from 'zod'

type FormSchema = {
    category: Array<string>
}

const validationSchema: ZodType<FormSchema> = z.object({
    category: z.array(z.string()),
})

const ArticleTableFilter = () => {
    const [filterIsOpen, setFilterIsOpen] = useState(false)
    const filterData = useManageArticleStore((state) => state.filterData)
    const setFilterData = useManageArticleStore((state) => state.setFilterData)

    const { handleSubmit, control } = useForm<FormSchema>({
        defaultValues: filterData,
        resolver: zodResolver(validationSchema),
    })

    const onSubmit = (values: FormSchema) => {
        setFilterData(values)
        setFilterIsOpen(false)
    }

    return (
        <>
            <Button icon={<TbFilter />} onClick={() => setFilterIsOpen(true)}>
                فیلتر
            </Button>
            <Drawer
                title="فیلتر"
                isOpen={filterIsOpen}
                onClose={() => setFilterIsOpen(false)}
                onRequestClose={() => setFilterIsOpen(false)}
            >
                <Form
                    className="h-full"
                    containerClassName="flex flex-col justify-between h-full"
                    onSubmit={handleSubmit(onSubmit)}
                >
                    <div>
                        <FormItem label="نمایش دسته‌بندی">
                            <div className="mt-4">
                                <Controller
                                    name="category"
                                    control={control}
                                    render={({ field }) => (
                                        <Checkbox.Group
                                            vertical
                                            className="flex"
                                            {...field}
                                        >
                                            {categoryOption.map((category) => (
                                                <Checkbox
                                                    key={category.value}
                                                    name={field.name}
                                                    value={category.value}
                                                    className="justify-between flex-row-reverse heading-text"
                                                >
                                                    {category.label}
                                                </Checkbox>
                                            ))}
                                        </Checkbox.Group>
                                    )}
                                />
                            </div>
                        </FormItem>
                    </div>
                    <Button variant="solid" type="submit">
                        درخواست
                    </Button>
                </Form>
            </Drawer>
        </>
    )
}

export default ArticleTableFilter
