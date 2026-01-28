import { useState } from 'react'
import Card from '@/components/ui/Card'
import Select from '@/components/ui/Select'
import AbbreviateNumber from '@/components/shared/AbbreviateNumber'
import classNames from '@/utils/classNames'
import { options } from '../constants'
import {
    TbShoppingCart,
    TbBuildingStore,
    TbDeviceMobileMessage,
} from 'react-icons/tb'
import type { ChannelRevenue, Period } from '../types'
import type { ReactNode } from 'react'

type RevenueByChannelProps = {
    data: ChannelRevenue
}

const DisplayColumn = ({
    icon,
    label,
    value,
    iconClass,
}: {
    icon: ReactNode
    label: string
    value: number
    iconClass: string
}) => {
    return (
        <div className={classNames('flex flex-col items-center gap-5')}>
            <div
                className={classNames(
                    'rounded-full flex items-center justify-center h-12 w-12 text-xl text-gray-900',
                    iconClass,
                )}
            >
                {icon}
            </div>
            <div className="text-center">
                <h6 className="font-bold mb-1">
                    {'$'}
                    <AbbreviateNumber value={value} />
                </h6>
                <div className="text-center text-xs">{label}</div>
            </div>
        </div>
    )
}

const Bar = ({
    percent,
    className,
}: {
    percent: number
    className?: string
}) => {
    return (
        <div className="flex-1" style={{ width: `${percent}%` }}>
            <div className={classNames('h-1.5 rounded-full', className)} />
            <div className="font-bold heading-text mt-1">{percent}%</div>
        </div>
    )
}

const RevenueByChannel = ({ data }: RevenueByChannelProps) => {
    const [selectedPeriod, setSelectedPeriod] = useState<Period>('thisMonth')

    return (
        <Card>
            <div className="flex items-center justify-between mb-4">
                <h4>درآمد کانال</h4>
                <Select
                    className="w-[120px]"
                    size="sm"
                    placeholder="Select period"
                    value={options.filter(
                        (option) => option.value === selectedPeriod,
                    )}
                    options={options}
                    isSearchable={false}
                    onChange={(option) => {
                        if (option?.value) {
                            setSelectedPeriod(option?.value)
                        }
                    }}
                />
            </div>
            <div className="mt-8">
                <div className="flex items-center gap-3">
                    <h2>{data[selectedPeriod].growShrink}%</h2>
                    <div className="font-nor leading-5">
                        <div>نرخ رشد</div>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-1 mt-6">
                <Bar
                    percent={data[selectedPeriod].percentage.onlineStore}
                    className="bg-sky-200 dark:opacity-70"
                />
                <Bar
                    percent={data[selectedPeriod].percentage.physicalStore}
                    className="bg-emerald-200 dark:opacity-70"
                />
                <Bar
                    percent={data[selectedPeriod].percentage.socialMedia}
                    className="bg-orange-200 dark:opacity-70"
                />
            </div>
            <div className="bg-gray-100 dark:bg-gray-900 rounded-xl p-4 mt-8">
                <div className="grid grid-cols-3">
                    <DisplayColumn
                        icon={<TbShoppingCart />}
                        label="فروشگاه آنلاین"
                        value={
                            data[selectedPeriod].value /
                            data[selectedPeriod].percentage.onlineStore
                        }
                        iconClass="bg-sky-200 dark:opacity-70"
                    />
                    <DisplayColumn
                        icon={<TbBuildingStore />}
                        label="فروشگاه فیزیکی"
                        value={
                            data[selectedPeriod].value /
                            data[selectedPeriod].percentage.physicalStore
                        }
                        iconClass="bg-emerald-200 dark:opacity-70"
                    />
                    <DisplayColumn
                        icon={<TbDeviceMobileMessage />}
                        label="رسانه اجتماعی"
                        value={
                            data[selectedPeriod].value /
                            data[selectedPeriod].percentage.socialMedia
                        }
                        iconClass="bg-orange-200 dark:opacity-70"
                    />
                </div>
            </div>
        </Card>
    )
}

export default RevenueByChannel
