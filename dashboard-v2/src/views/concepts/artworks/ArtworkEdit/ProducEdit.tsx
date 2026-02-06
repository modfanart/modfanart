import { useState } from 'react'
import Container from '@/components/shared/Container'
import Button from '@/components/ui/Button'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import ProductForm from '../ProductForm'
import NoProductFound from '@/assets/svg/NoProductFound'
import { apiGetProduct } from '@/services/ProductService'
import sleep from '@/utils/sleep'
import { TbTrash, TbArrowNarrowLeft } from 'react-icons/tb'
import { useParams, useNavigate } from 'react-router-dom'
import useSWR from 'swr'
import type { Product, ProductFormSchema } from '../ProductForm/types'

const ProducEdit = () => {
    const { id } = useParams()

    const navigate = useNavigate()

    const { data, isLoading } = useSWR(
        [`/api/product/${id}`, { id: id as string }],
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ([_, params]) => apiGetProduct<Product, { id: string }>(params),
        {
            revalidateOnFocus: false,
            revalidateIfStale: false,
        },
    )

    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false)

    const [isSubmiting, setIsSubmiting] = useState(false)

    const getDefaultValues = () => {
        if (data) {
            const {
                name,
                description,
                productCode,
                taxRate,
                price,
                bulkDiscountPrice,
                costPerItem,
                imgList,
                category,
                brand,
            } = data

            return {
                name,
                description,
                productCode,
                taxRate,
                price,
                bulkDiscountPrice,
                costPerItem,
                imgList,
                category,
                tags: [{ label: 'مد روز', value: 'trend' }],
                brand,
            }
        }

        return {}
    }

    const handleFormSubmit = async (values: ProductFormSchema) => {
        setIsSubmiting(true)
        await sleep(800)
        setIsSubmiting(false)
        toast.push(<Notification type="success">تغییرات ذخیره شد!</Notification>, {
            placement: 'top-center',
        })
        navigate('/concepts/products/product-list')
    }

    const handleDelete = () => {
        setDeleteConfirmationOpen(true)
    }

    const handleCancel = () => {
        setDeleteConfirmationOpen(false)
    }

    const handleBack = () => {
        navigate('/concepts/products/product-list')
    }

    const handleConfirmDelete = () => {
        setDeleteConfirmationOpen(true)
        toast.push(
            <Notification type="success">محصول حذف شد!</Notification>,
            { placement: 'top-center' },
        )
        navigate('/concepts/products/product-list')
    }

    return (
        <>
            {!isLoading && !data && (
                <div className="h-full flex flex-col items-center justify-center">
                    <NoProductFound height={280} width={280} />
                    <h3 className="mt-8">محصولی پیدا نشد!</h3>
                </div>
            )}
            {!isLoading && data && (
                <>
                    <ProductForm
                        defaultValues={getDefaultValues() as ProductFormSchema}
                        newProduct={false}
                        onFormSubmit={handleFormSubmit}
                    >
                        <Container>
                            <div className="flex items-center justify-between px-8">
                                <Button
                                    className="ltr:mr-3 rtl:ml-3"
                                    type="button"
                                    variant="plain"
                                    icon={<TbArrowNarrowLeft />}
                                    onClick={handleBack}
                                >
                                    بازگشت
                                </Button>
                                <div className="flex items-center">
                                    <Button
                                        className="ltr:mr-3 rtl:ml-3"
                                        type="button"
                                        customColorClass={() =>
                                            'border-error ring-1 ring-error text-error hover:border-error hover:ring-error hover:text-error bg-transparent'
                                        }
                                        icon={<TbTrash />}
                                        onClick={handleDelete}
                                    >
                                        حذف
                                    </Button>
                                    <Button
                                        variant="solid"
                                        type="submit"
                                        loading={isSubmiting}
                                    >
                                        ذخیره
                                    </Button>
                                </div>
                            </div>
                        </Container>
                    </ProductForm>
                    <ConfirmDialog
                        isOpen={deleteConfirmationOpen}
                        type="danger"
                        title="حذف محصول"
                        onClose={handleCancel}
                        onRequestClose={handleCancel}
                        onCancel={handleCancel}
                        onConfirm={handleConfirmDelete}
                    >
                        <p>
                            آیا از حذف این محصول مطمئن هستید؟ این عمل قابل بازگشت نیست.
                        </p>
                    </ConfirmDialog>
                </>
            )}
        </>
    )
}

export default ProducEdit
