import Card from '@/components/ui/Card'
import GrowShrinkValue from '@/components/shared/GrowShrinkValue'
import classNames from '@/utils/classNames'
import { NumericFormat } from 'react-number-format'
import { TbUsers, TbCoins, TbClick } from 'react-icons/tb'
import { MetricsData, Period } from '../types'
import type { ReactNode } from 'react'

type WidgetProps = {
    title: string
    value: string | number | ReactNode
    growShrink: number
    compareFrom: string
    icon: ReactNode
    iconClass: string
}

type MetricsProps = {
    data: MetricsData
    selectedPeriod: Period
}

const vsPeriod: Record<Period, string> = {
    thisMonth: 'در مقایسه با ماه قبل',
    thisWeek: 'در مقایسه با هفته قبل',
    thisYear: 'در مقایسه با سال قبل',    
}

const Widget = ({
    title,
    growShrink,
    value,
    compareFrom,
    icon,
    iconClass,
}: WidgetProps) => {
    return (
        <Card className="flex-1">
            <div className="flex justify-between gap-2 relative">
                <div>
                    <div className="mb-10 text-base">{title}</div>
                    <h3 className="mb-1">{value}</h3>
                    <div className="inline-flex items-center flex-wrap gap-1">
                        <GrowShrinkValue
                            className="font-bold"
                            value={growShrink}
                            suffix="%"
                            positiveIcon="+"
                            negativeIcon=""
                        />
                        <span>{compareFrom}</span>
                    </div>
                </div>
                <div
                    className={classNames(
                        'flex items-center justify-center min-h-12 min-w-12 max-h-12 max-w-12 text-gray-900 rounded-full text-2xl',
                        iconClass,
                    )}
                >
                    {icon}
                </div>
            </div>
        </Card>
    )
}

const Metrics = ({ data, selectedPeriod }: MetricsProps) => {
    return (
        <div className="flex flex-col 2xl:flex-col xl:flex-row gap-4">
            <Widget
                title="بازدید کننده"
                value={
                    <NumericFormat
                        displayType="text"
                        value={data.visitors.value}
                        thousandSeparator={true}
                    />
                }
                growShrink={data.visitors.growShrink}
                compareFrom={vsPeriod[selectedPeriod]}
                icon={<TbUsers />}
                iconClass="bg-orange-200"
            />
            <Widget
                title="نرخ تبدیل"
                value={`${data.conversionRate.value}%`}
                growShrink={data.conversionRate.growShrink}
                compareFrom={vsPeriod[selectedPeriod]}
                icon={<TbCoins />}
                iconClass="bg-emerald-200"
            />
            <Widget
                title="کلیک کمپین تبلیغاتی"
                value={
                    <NumericFormat
                        displayType="text"
                        value={data.adCampaignClicks.value}
                        thousandSeparator={true}
                    />
                }
                growShrink={data.adCampaignClicks.growShrink}
                compareFrom={vsPeriod[selectedPeriod]}
                icon={<TbClick />}
                iconClass="bg-purple-200"
            />
        </div>
    )
}

export default Metrics
