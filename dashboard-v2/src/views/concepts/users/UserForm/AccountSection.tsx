import Card from '@/components/ui/Card'
import Switcher from '@/components/ui/Switcher'
import { FormItem } from '@/components/ui/Form'
import { Controller } from 'react-hook-form'
import type { FormSectionBaseProps } from './types'

type AccountSectionProps = FormSectionBaseProps

const AccountSection = ({ control }: AccountSectionProps) => {
    return (
        <Card>
            <h4>حساب</h4>
            <div className="mt-6">
                <FormItem>
                    <Controller
                        name="banAccount"
                        control={control}
                        render={({ field }) => (
                            <div className="flex items-center justify-between gap-8">
                                <div>
                                    <h6>ممنوع شد</h6>
                                    <p>این حساب را غیرفعال کنید</p>
                                </div>
                                <Switcher
                                    checked={field.value}
                                    onChange={(checked) => {
                                        field.onChange(checked)
                                    }}
                                />
                            </div>
                        )}
                    />
                </FormItem>
                <FormItem className="mb-0">
                    <Controller
                        name="accountVerified"
                        control={control}
                        render={({ field }) => (
                            <div className="flex items-center justify-between gap-8">
                                <div>
                                    <h6>حساب تایید شد</h6>
                                    <p>
                                        غیرفعال کردن یک درخواست تأیید ارسال می کند
                                        به مشتری.
                                    </p>
                                </div>
                                <Switcher
                                    checked={field.value}
                                    onChange={(checked) => {
                                        field.onChange(checked)
                                    }}
                                />
                            </div>
                        )}
                    />
                </FormItem>
            </div>
        </Card>
    )
}

export default AccountSection
