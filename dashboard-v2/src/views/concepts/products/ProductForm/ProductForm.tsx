import { useEffect } from 'react'
import { Form } from '@/components/ui/Form'
import Container from '@/components/shared/Container'
import BottomStickyBar from '@/components/template/BottomStickyBar'
import GeneralSection from './components/GeneralSection'
import PricingSection from './components/PricingSection'
import ImageSection from './components/ImageSection'
import AttributeSection from './components/AttributeSection'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import isEmpty from 'lodash/isEmpty'
import type { ProductFormSchema } from './types'
import type { ZodType } from 'zod'
import type { CommonProps } from '@/@types/common'

type ProductFormProps = {
    onFormSubmit: (values: ProductFormSchema) => void
    defaultValues?: ProductFormSchema
    newProduct?: boolean
} & CommonProps
const validationSchema: ZodType<ProductFormSchema> = z.object({
    name: z.string().min(1, { message: 'نام محصول الزامی است!' }),
    productCode: z.string().min(1, { message: 'کد محصول الزامی است!' }),
    description: z.string().min(1, { message: 'توضیحات محصول الزامی است!' }),
    price: z.union([z.string(), z.number()], {
        errorMap: () => ({ message: 'قیمت الزامی است!' }),
    }),
    taxRate: z.union([z.string(), z.number()], {
        errorMap: () => ({ message: 'نرخ مالیات الزامی است!' }),
    }),
    costPerItem: z.union([z.string(), z.number()], {
        errorMap: () => ({ message: 'هزینه هر واحد الزامی است!' }),
    }),
    bulkDiscountPrice: z.union([z.string(), z.number()], {
        errorMap: () => ({ message: 'قیمت تخفیف عمده الزامی است!' }),
    }),
    imgList: z
        .array(
            z.object({
                id: z.string(),
                name: z.string(),
                img: z.string(),
            }),
        )
        .min(1, { message: 'حداقل یک تصویر الزامی است!' }),
    category: z.string().min(1, { message: 'دسته‌بندی محصول الزامی است!' }),
})


const ProductForm = (props: ProductFormProps) => {
    const {
        onFormSubmit,
        defaultValues = {
            imgList: [],
        },
        children,
    } = props

    const {
        handleSubmit,
        reset,
        formState: { errors },
        control,
    } = useForm<ProductFormSchema>({
        defaultValues: {
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

    const onSubmit = (values: ProductFormSchema) => {
        onFormSubmit?.(values)
    }

    return (
        <Form
            className="flex w-full h-full"
            containerClassName="flex flex-col w-full justify-between"
            onSubmit={handleSubmit(onSubmit)}
        >
            <Container>
                <div className="flex flex-col xl:flex-row gap-4">
                    <div className="gap-4 flex flex-col flex-auto">
                        <GeneralSection control={control} errors={errors} />
                        <PricingSection control={control} errors={errors} />
                    </div>
                    <div className="lg:min-w-[440px] 2xl:w-[500px] gap-4 flex flex-col">
                        <ImageSection control={control} errors={errors} />
                        <AttributeSection control={control} errors={errors} />
                    </div>
                </div>
            </Container>
            <BottomStickyBar>{children}</BottomStickyBar>
        </Form>
    )
}

export default ProductForm
