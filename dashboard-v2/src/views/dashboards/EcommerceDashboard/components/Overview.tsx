import { useState, useEffect, useRef } from 'react'
import Card from '@/components/ui/Card'
import Select from '@/components/ui/Select'
import GrowShrinkValue from '@/components/shared/GrowShrinkValue'
import AbbreviateNumber from '@/components/shared/AbbreviateNumber'
import Chart from '@/components/shared/Chart'
import { useThemeStore } from '@/store/themeStore'
import classNames from '@/utils/classNames'
import { COLOR_1, COLOR_2, COLOR_4 } from '@/constants/chart.constant'
import { options } from '../constants'
import { NumericFormat } from 'react-number-format'
import { TbCoin, TbShoppingBagCheck, TbEye } from 'react-icons/tb'
import type { ReactNode } from 'react'
import type { StatisticData, Period, StatisticCategory } from '../types'

type StatisticCardProps = {
    title: string
    value: number | ReactNode
    icon: ReactNode
    growShrink: number
    iconClass: string
    label: StatisticCategory
    compareFrom: string
    active: boolean
    onClick: (label: StatisticCategory) => void
}

type StatisticGroupsProps = {
    data: StatisticData
}

const chartColors: Record<StatisticCategory, string> = {
    totalProfit: COLOR_1,
    totalOrder: COLOR_2,
    totalImpression: COLOR_4,
}

const StatisticCard = (props: StatisticCardProps) => {
    const {
        title,
        value,
        label,
        icon,
        growShrink,
        iconClass,
        active,
        compareFrom,
        onClick,
    } = props

    return (
        <button
            className={classNames(
                'p-4 rounded-2xl cursor-pointer ltr:text-left rtl:text-right transition duration-150 outline-none',
                active && 'bg-white dark:bg-gray-900 shadow-md',
            )}
            onClick={() => onClick(label)}
        >
            <div className="flex md:flex-col-reverse gap-2 2xl:flex-row justify-between relative">
                <div>
                    <div className="mb-4 text-sm font-semibold">{title}</div>
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
        </button>
    )
}

const Overview = ({ data }: StatisticGroupsProps) => {
    const [selectedCategory, setSelectedCategory] =
        useState<StatisticCategory>('totalProfit')

    const [selectedPeriod, setSelectedPeriod] = useState<Period>('thisMonth')

    const sideNavCollapse = useThemeStore((state) => state.layout.sideNavCollapse)

    const isFirstRender = useRef(true);

    useEffect(() => {
        if (!sideNavCollapse && isFirstRender.current) {
            isFirstRender.current = false;
            return 
        }

        if(!isFirstRender.current) {
            window.dispatchEvent(new Event('resize'));
        }
    }, [sideNavCollapse]);

    return (
        <Card>
            <div className="flex items-center justify-between">
                <h4>نظرسنجی</h4>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-2xl p-3 bg-gray-100 dark:bg-gray-700 mt-4">
                <StatisticCard
                    title="سود کل"
                    value={
                        <NumericFormat
                            displayType="text"
                            value={data.totalProfit[selectedPeriod].value}
                            prefix={'$'}
                            thousandSeparator={true}
                        />
                    }
                    growShrink={data.totalProfit[selectedPeriod].growShrink}
                    iconClass="bg-sky-200"
                    icon={<TbCoin />}
                    label="totalProfit"
                    active={selectedCategory === 'totalProfit'}
                    compareFrom={data.totalProfit[selectedPeriod].comparePeriod}
                    onClick={setSelectedCategory}
                />
                <StatisticCard
                    title="کل سفارش"
                    value={
                        <NumericFormat
                            displayType="text"
                            value={data.totalOrder[selectedPeriod].value}
                            thousandSeparator={true}
                        />
                    }
                    growShrink={data.totalOrder[selectedPeriod].growShrink}
                    iconClass="bg-emerald-200"
                    icon={<TbShoppingBagCheck />}
                    label="totalOrder"
                    active={selectedCategory === 'totalOrder'}
                    compareFrom={data.totalProfit[selectedPeriod].comparePeriod}
                    onClick={setSelectedCategory}
                />
                <StatisticCard
                    title="برداشت"
                    value={
                        <AbbreviateNumber
                            value={data.totalImpression[selectedPeriod].value}
                        />
                    }
                    growShrink={data.totalImpression[selectedPeriod].growShrink}
                    iconClass="bg-purple-200"
                    icon={<TbEye />}
                    label="totalImpression"
                    active={selectedCategory === 'totalImpression'}
                    compareFrom={data.totalProfit[selectedPeriod].comparePeriod}
                    onClick={setSelectedCategory}
                />
            </div>
            <Chart
                type="line"
                series={data[selectedCategory][selectedPeriod].chartData.series}
                xAxis={data[selectedCategory][selectedPeriod].chartData.date}
                height="410px"
                customOptions={{
                    legend: { show: false },
                    colors: [chartColors[selectedCategory]],
                }}
            />
        </Card>
    )
}

export default Overview
