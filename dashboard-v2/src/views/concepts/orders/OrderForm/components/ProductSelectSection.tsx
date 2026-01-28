import { useMemo, useState } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import Checkbox from '@/components/ui/Checkbox'
import Avatar from '@/components/ui/Avatar'
import Table from '@/components/ui/Table'
import ScrollBar from '@/components/ui/ScrollBar'
import AutoComplete from '@/components/shared/AutoComplete'
import useResponsive from '@/utils/hooks/useResponsive'
import { useOrderFormStore } from '../store/orderFormStore'
import classNames from '@/utils/classNames'
import { NumericFormat } from 'react-number-format'
import { TbSearch, TbMinus, TbPlus } from 'react-icons/tb'
import type { Product, ProductOption, SelectedProduct } from '../types'

const { Tr, Th, Td, THead, TBody } = Table

const ProductSelectSection = () => {
    const { productOption, productList, selectedProduct, setSelectedProduct } =
        useOrderFormStore()

    const [inputValue, setInputValue] = useState('')

    const [productsDialogOpen, setProductsDialogOpen] = useState(false)

    const { smaller } = useResponsive()

    const handleOptionSelect = (option: ProductOption) => {
        const selected = productList.find(
            (product) => product.id === option.value,
        )

        if (selected) {
            if (selectedProduct.some((product) => product.id === selected.id)) {
                return
            } else {
                selectedProduct.push({ ...selected, quantity: 1 })
                setSelectedProduct(selectedProduct)
            }
        }
    }

    const handleProductIncremental = (productToIncrease: SelectedProduct) => {
        setSelectedProduct(
            selectedProduct.map((product) => {
                if (product.id === productToIncrease.id) {
                    product.quantity = product.quantity + 1
                }
                return product
            }),
        )
    }

    const handleProductDecremental = (productToDecrease: SelectedProduct) => {
        const targeted = productToDecrease

        targeted.quantity = targeted.quantity - 1
        if (targeted.quantity === 0) {
            setSelectedProduct(
                selectedProduct.filter((product) => product.id !== targeted.id),
            )
        } else {
            setSelectedProduct(
                selectedProduct.map((product) => {
                    if (product.id === targeted.id) {
                        product = targeted
                    }
                    return product
                }),
            )
        }
    }

    const handleProductChecked = (checked: boolean, selected: Product) => {
        if (checked) {
            selectedProduct.push({ ...selected, quantity: 1 })
            setSelectedProduct(selectedProduct)
        } else {
            setSelectedProduct(
                selectedProduct.filter((product) => product.id !== selected.id),
            )
        }
    }

    const total = useMemo(() => {
        return selectedProduct.reduce((accumulator, product) => {
            return accumulator + product.price * product.quantity
        }, 0)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedProduct, selectedProduct.length])

    return (
        <>
            <Card id="selectProducts">
                <h4 className="mb-6">انتخاب محصولات</h4>
                <div className="flex items-center gap-2">
                    <AutoComplete<ProductOption>
                        data={productOption}
                        optionKey={(product) => product.label}
                        value={inputValue}
                        renderOption={(option) => (
                            <div className="flex items-center gap-2">
                                <Avatar shape="round" src={option.img} />
                                <span>{option.label}</span>
                            </div>
                        )}
                        suffix={<TbSearch className="text-lg" />}
                        placeholder="جستجوی محصول"
                        onInputChange={setInputValue}
                        onOptionSelected={handleOptionSelect}
                    />
                    <Button
                        type="button"
                        variant="solid"
                        onClick={() => setProductsDialogOpen(true)}
                    >
                        مشاهده محصولات
                    </Button>
                </div>
                <Table compact={smaller.sm} className="mt-6">
                    <THead>
                        <Tr>
                            <Th className="w-[70%]">محصول</Th>
                            <Th>قیمت</Th>
                            <Th>تعداد</Th>
                        </Tr>
                    </THead>
                    <TBody>
                        {selectedProduct.length > 0 ? (
                            selectedProduct.map((product) => (
                                <Tr key={product.id}>
                                    <Td>
                                        <div className="flex items-center gap-2">
                                            <Avatar
                                                shape="round"
                                                src={product.img}
                                            />
                                            <div>
                                                <div className="heading-text font-bold">
                                                    {product.name}
                                                </div>
                                                <div>
                                                    کد: {product.productCode}
                                                </div>
                                            </div>
                                        </div>
                                    </Td>
                                    <Td>
                                        <div className="heading-text font-bold">
                                            <NumericFormat
                                                fixedDecimalScale
                                                prefix="$ "
                                                displayType="text"
                                                value={
                                                    product.price *
                                                    product.quantity
                                                }
                                                decimalScale={2}
                                                thousandSeparator={true}
                                            />
                                        </div>
                                    </Td>
                                    <Td>
                                        <div className="flex items-center">
                                            <Button
                                                type="button"
                                                icon={<TbMinus />}
                                                size="xs"
                                                onClick={() =>
                                                    handleProductDecremental(
                                                        product,
                                                    )
                                                }
                                            />
                                            <div className="w-10 text-center">
                                                <span>{product.quantity}</span>
                                            </div>
                                            <Button
                                                type="button"
                                                icon={<TbPlus />}
                                                size="xs"
                                                onClick={() =>
                                                    handleProductIncremental(
                                                        product,
                                                    )
                                                }
                                            />
                                        </div>
                                    </Td>
                                </Tr>
                            ))
                        ) : (
                            <Tr>
                                <Td className="text-center" colSpan={3}>
                                    محصولی انتخاب نشده است!
                                </Td>
                            </Tr>
                        )}
                    </TBody>
                </Table>
                <div className="mt-8 flex justify-end">
                    <span className="text-base flex items-center gap-2">
                        <span className="font-semibold">مجموع: </span>
                        <span className="text-lg font-bold heading-text">
                            <NumericFormat
                                fixedDecimalScale
                                prefix="$ "
                                displayType="text"
                                value={total}
                                decimalScale={2}
                                thousandSeparator={true}
                            />
                        </span>
                    </span>
                </div>
            </Card>
            <Dialog
                isOpen={productsDialogOpen}
                onClose={() => setProductsDialogOpen(false)}
                onRequestClose={() => setProductsDialogOpen(false)}
            >
                <div className="text-center mb-6">
                    <h4 className="mb-1">همه محصولات</h4>
                    <p>محصولات را به این سفارش اضافه کنید.</p>
                </div>
                <div className="mt-4">
                    <div className="mb-6">
                        <ScrollBar
                            className={classNames('overflow-y-auto h-80')}
                        >
                            {productList.map((product) => (
                                <div
                                    key={product.id}
                                    className="py-3 pr-5 rounded-lg flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="px-1">
                                            <Checkbox
                                                checked={selectedProduct.some(
                                                    (selected) =>
                                                        selected.id ===
                                                        product.id,
                                                )}
                                                onChange={(value) =>
                                                    handleProductChecked(
                                                        value,
                                                        product,
                                                    )
                                                }
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Avatar
                                                size="lg"
                                                shape="round"
                                                src={product.img}
                                            />
                                            <div>
                                                <p className="heading-text font-bold">
                                                    {product.name}
                                                </p>
                                                <p>کد: {product.productCode}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        تعداد موجود:
                                        <span className="heading-text font-bold">
                                            {product.stock}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </ScrollBar>
                    </div>
                </div>
                <Button
                    block
                    type="button"
                    variant="solid"
                    onClick={() => setProductsDialogOpen(false)}
                >
                    انجام شد
                </Button>
            </Dialog>
        </>
    )
}

export default ProductSelectSection
