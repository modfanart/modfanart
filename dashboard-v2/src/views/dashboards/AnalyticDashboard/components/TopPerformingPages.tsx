import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Table from '@/components/ui/Table'
import GrowShrinkValue from '@/components/shared/GrowShrinkValue'
import { CSVLink } from 'react-csv'
import type { TopPageData } from '../types'

type TopPerformingPagesProps = {
    data: TopPageData[]
}

const { Tr, Td, TBody, THead, Th } = Table

const TopPerformingPages = ({ data }: TopPerformingPagesProps) => {
    return (
        <Card>
            <div className="flex items-center justify-between">
                <h4>صفحات برتر</h4>
                <CSVLink
                    filename="top-page.csv"
                    data={data.map((row) => {
                        return {
                            pageUrl: row.pageUrl,
                            views: row.views.amount,
                            'View growth': `${row.views.growth}%`,
                            'Unique visitors': row.uniqueVisitor.amount,
                            'Unique visitors growth': `${row.uniqueVisitor.growth}%`,
                        }
                    })}
                >
                    <Button size="sm">خروجی داده‌ها</Button>
                </CSVLink>
            </div>
            <div className="mt-6">
                <Table hoverable={false}>
                    <THead>
                        <Tr>
                            <Th className="!px-0">آدرس صفحه</Th>
                            <Th className="!text-right max-w-[100px]">بازدیدها</Th>
                            <Th className="!px-0 !text-right max-w-[100px]">
                                بازدیدکنندگان یکتا
                            </Th>
                        </Tr>
                    </THead>
                    <TBody>
                        {data.map((row) => {
                            return (
                                <Tr key={row.pageUrl}>
                                    <Td className="!px-0">
                                        <div className="heading-text font-bold">
                                            {row.pageUrl}
                                        </div>
                                    </Td>
                                    <Td>
                                        <div className="flex items-center justify-end gap-2">
                                            <span>{row.views.amount}</span>
                                            <GrowShrinkValue
                                                className="font-bold"
                                                value={row.views.growth}
                                                suffix="%"
                                                positiveIcon="+"
                                                negativeIcon=""
                                            />
                                        </div>
                                    </Td>
                                    <Td className="!px-0">
                                        <div className="flex items-center justify-end gap-2">
                                            {/* <ApexChart 
                                                options={{...apexSparklineChartDefaultOption, ...{colors: row.growth > 0 ? [COLORS[1]] : [COLORS[2]]}}} 
                                                series={[{
                                                    data: row.activity
                                                }]} 
                                                height={25} 
                                                width={50}
                                            /> */}
                                            <span>
                                                {row.uniqueVisitor.amount}
                                            </span>
                                            <GrowShrinkValue
                                                className="font-bold"
                                                value={row.uniqueVisitor.growth}
                                                suffix="%"
                                                positiveIcon="+"
                                                negativeIcon=""
                                            />
                                        </div>
                                    </Td>
                                </Tr>
                            )
                        })}
                    </TBody>
                </Table>
            </div>
        </Card>
    )
}

export default TopPerformingPages
