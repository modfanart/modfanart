import { Form, FormItem } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { useScrumBoardStore } from '../store/scrumBoardStore'
import sleep from '@/utils/sleep'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import cloneDeep from 'lodash/cloneDeep'
import { createCardObject } from '../utils'
import type { ZodType } from 'zod'

type FormSchema = {
    title: string
}

const validationSchema: ZodType<FormSchema> = z.object({
    title: z.string().min(1, 'عنوان بلیط الزامی است!'),
})

const AddNewTicketContent = () => {
    const { columns, board, closeDialog, updateColumns, setSelectedBoard } =
        useScrumBoardStore()

    const {
        control,
        formState: { errors },
        handleSubmit,
    } = useForm<FormSchema>({
        defaultValues: {
            title: '',
        },
        resolver: zodResolver(validationSchema),
    })

    const onFormSubmit = async ({ title }: FormSchema) => {
        const data = columns
        const newCard = createCardObject()
        newCard.name = title ? title : 'کارت بدون عنوان'

        const newData = cloneDeep(data)
        newData[board].push(newCard)
        updateColumns(newData)
        closeDialog()
        await sleep(1000)
        setSelectedBoard('')
    }

    return (
        <div>
            <h5>افزودن بلیط جدید</h5>
            <div className="mt-8">
                <Form layout="inline" onSubmit={handleSubmit(onFormSubmit)}>
                    <FormItem
                        label="عنوان ستون"
                        invalid={Boolean(errors.title)}
                        errorMessage={errors.title?.message}
                    >
                        <Controller
                            name="title"
                            control={control}
                            rules={{ required: true }}
                            render={({ field }) => (
                                <Input
                                    type="text"
                                    autoComplete="off"
                                    {...field}
                                />
                            )}
                        />
                    </FormItem>
                    <FormItem>
                        <Button variant="solid" type="submit">
                            افزودن
                        </Button>
                    </FormItem>
                </Form>
            </div>
        </div>
    )
}

export default AddNewTicketContent
