import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import { FormItem } from '@/components/ui/Form'
import RichTextEditor from '@/components/shared/RichTextEditor'
import { Controller } from 'react-hook-form'
import type { FormSectionBaseProps } from '../types'

type GeneralSectionProps = FormSectionBaseProps

const GeneralSection = ({ control, errors }: GeneralSectionProps) => {
    return (
        <Card>
            <h4 className="mb-6">اطلاعات پایه</h4>
            <div>
                <FormItem
                    label="نام محصول"
                    invalid={Boolean(errors.name)}
                    errorMessage={errors.name?.message}
                >
                    <Controller
                        name="name"
                        control={control}
                        render={({ field }) => (
                            <Input
                                type="text"
                                autoComplete="off"
                                placeholder="نام محصول"
                                {...field}
                            />
                        )}
                    />
                </FormItem>
                <FormItem
                    label="کد محصول"
                    invalid={Boolean(errors.productCode)}
                    errorMessage={errors.productCode?.message}
                >
                    <Controller
                        name="productCode"
                        control={control}
                        render={({ field }) => (
                            <Input
                                type="text"
                                autoComplete="off"
                                placeholder="کد محصول"
                                {...field}
                            />
                        )}
                    />
                </FormItem>
            </div>
            <FormItem
                label="توضیحات"
                invalid={Boolean(errors.description)}
                errorMessage={errors.description?.message}
            >
                <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                        <RichTextEditor
                            content={field.value}
                            invalid={Boolean(errors.description)}
                            onChange={({ html }) => {
                                field.onChange(html)
                            }}
                        />
                    )}
                />
            </FormItem>
        </Card>

    )
}

export default GeneralSection
