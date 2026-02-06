import { useState } from 'react'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import Checkbox from '@/components/ui/Checkbox'
import Input from '@/components/ui/Input'
import { Form, FormItem } from '@/components/ui/Form'
import useCustomerList from '../hooks/useCustomerList'
import { TbFilter } from 'react-icons/tb'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { ZodType } from 'zod'

type FormSchema = {
    purchasedProducts: string
    purchaseChannel: Array<string>
}

const channelList = [
    "خرده فروشی ها",
    "خرده فروشان آنلاین",
    'فروشندگان',
    "برنامه های موبایل",
    "فروش مستقیم",
]

const validationSchema: ZodType<FormSchema> = z.object({
    purchasedProducts: z.string(),
    purchaseChannel: z.array(z.string()),
})

const CustomerListTableFilter = () => {
    const [dialogIsOpen, setIsOpen] = useState(false)

    const { filterData, setFilterData } = useCustomerList()

    const openDialog = () => {
        setIsOpen(true)
    }

    const onDialogClose = () => {
        setIsOpen(false)
    }

    const { handleSubmit, reset, control } = useForm<FormSchema>({
        defaultValues: filterData,
        resolver: zodResolver(validationSchema),
    })

    const onSubmit = (values: FormSchema) => {
        setFilterData(values)
        setIsOpen(false)
    }

    return (
        <>
            <Button icon={<TbFilter />} onClick={() => openDialog()}>
                فیلتر کنید
            </Button>
            <Dialog
                isOpen={dialogIsOpen}
                onClose={onDialogClose}
                onRequestClose={onDialogClose}
            >
                <h4 className="mb-4">فیلتر کنید</h4>
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <FormItem label="محصولات">
                        <Controller
                            name="purchasedProducts"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    type="text"
                                    autoComplete="off"
                                    placeholder="جستجو بر اساس محصول خریداری شده"
                                    {...field}
                                />
                            )}
                        />
                    </FormItem>
                    <FormItem label="کانال خرید">
                        <Controller
                            name="purchaseChannel"
                            control={control}
                            render={({ field }) => (
                                <Checkbox.Group
                                    vertical
                                    className="flex mt-4"
                                    {...field}
                                >
                                    {channelList.map((source, index) => (
                                        <Checkbox
                                            key={source + index}
                                            name={field.name}
                                            value={source}
                                            className="justify-between flex-row-reverse heading-text"
                                        >
                                            {source}
                                        </Checkbox>
                                    ))}
                                </Checkbox.Group>
                            )}
                        />
                    </FormItem>
                    <div className="flex justify-end items-center gap-2 mt-4">
                        <Button type="button" onClick={() => reset()}>
                            بازنشانی کنید
                        </Button>
                        <Button type="submit" variant="solid">
                            درخواست کنید
                        </Button>
                    </div>
                </Form>
            </Dialog>
        </>
    )
}

export default CustomerListTableFilter
