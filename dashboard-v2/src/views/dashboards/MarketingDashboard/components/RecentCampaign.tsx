import { useEffect, useState } from 'react'
import Avatar from '@/components/ui/Avatar'
import Card from '@/components/ui/Card'
import Table from '@/components/ui/Table'
import Switcher from '@/components/ui/Switcher'
import Tag from '@/components/ui/Tag'
import CreateCampaign from './CreateCampaign'
import classNames from '@/utils/classNames'
import { campaignTypeOption } from '../utils'
import { NumericFormat } from 'react-number-format'
import dayjs from 'dayjs'
import type { Campagin } from '../types'
import moment from 'jalali-moment'

type RecentCampaignProps = {
    data: Campagin[]
}

const campaignStatus: Record<string, { label: string; className: string }> = {
    active: { label: 'فعال', className: 'bg-sky-200' },
    completed: { label: 'کامل شده', className: 'bg-emerald-200' },
    scheduled: { label: 'برنامه ریزی شده', className: 'bg-orange-200' },
    disabled: { label: 'غیرفعال', className: '' },
}

const { Tr, Td, TBody, THead, Th } = Table

const RecentCampaign = ({ data }: RecentCampaignProps) => {
    const [campaignList, setCampaignList] = useState<Campagin[]>(data)

    useEffect(() => {
        if (data.length > 0) {
            setCampaignList(data)
        }
    }, [data])

    const handleCreate = (value: Campagin) => {
        setCampaignList((prevList) => {
            return [...[value], ...prevList]
        })
    }

    const handleSwitcherChange = (
        value: boolean,
        id: string,
        status: string,
    ) => {
        setCampaignList((prevList) => {
            const list = prevList.map((campaign) => {
                if (campaign.id === id) {
                    if (status === 'scheduled' && value) {
                        campaign.startDate = new Date().setDate(
                            new Date().getDate(),
                        )
                        campaign.status = 'active'
                    }

                    if (status === 'disabled' && value) {
                        campaign.status = 'active'
                    }

                    if (status === 'active' && !value) {
                        campaign.status = 'disabled'
                    }
                }
                return campaign
            })
            return list
        })
    }

    return (
        <Card>
            <div className="flex items-center justify-between">
                <h4>کمپین‌ها</h4>
                <div>
                    <CreateCampaign onCreate={handleCreate} />
                </div>
            </div>
            <div className="mt-6">
                <Table hoverable={false}>
                    <THead>
                        <Tr>
                            <Th></Th>
                            <Th>کمپین</Th>
                            <Th>وضعیت</Th>
                            <Th>بودجه</Th>
                            <Th>تبدیل‌ها</Th>
                            <Th>شروع</Th>
                            <Th>پایان</Th>
                        </Tr>
                    </THead>
                    <TBody>
                        {campaignList.map((campagin) => (
                            <Tr key={campagin.id}>
                                <Td>
                                    <Switcher
                                        checked={campagin.status === 'active'}
                                        disabled={
                                            campagin.status === 'completed'
                                        }
                                        onChange={(val) =>
                                            handleSwitcherChange(
                                                val,
                                                campagin.id,
                                                campagin.status,
                                            )
                                        }
                                    />
                                </Td>
                                <Td>
                                    <div className="flex items-center gap-2">
                                        <Avatar
                                            className="bg-transparent dark:bg-transparent p-2 border-2 border-gray-200 dark:border-gray-600"
                                            size={50}
                                            shape="round"
                                            icon={
                                                <div
                                                    className={classNames(
                                                        'text-2xl heading-text',
                                                    )}
                                                >
                                                    {
                                                        campaignTypeOption[
                                                            campagin.type
                                                        ].icon
                                                    }
                                                </div>
                                            }
                                        />
                                        <div className="whitespace-nowrap">
                                            <div className="heading-text font-bold">
                                                {campagin.name}
                                            </div>
                                            {
                                                campaignTypeOption[
                                                    campagin.type
                                                ].label
                                            }
                                        </div>
                                    </div>
                                </Td>
                                <Td>
                                    <Tag
                                        className={classNames(
                                            campaignStatus[campagin.status]
                                                .className,
                                        )}
                                    >
                                        {campaignStatus[campagin.status].label}
                                    </Tag>
                                </Td>
                                <Td>
                                    <NumericFormat
                                        displayType="text"
                                        value={campagin.budget}
                                        prefix={'$'}
                                        thousandSeparator={true}
                                    />
                                </Td>
                                <Td>
                                    <div>{campagin.conversions}%</div>
                                </Td>
                                <Td>
                                    <div className="whitespace-nowrap">
                                        {moment(campagin.startDate, 'jYYYY/jMM/jDD').locale('fa').format('jDD jMMM jYYYY')}
                                    </div>
                                </Td>
                                <Td>
                                    <div className="whitespace-nowrap">
                                        {moment(campagin.endDate, 'jYYYY/jMM/jDD').locale('fa').format('jDD jMMM jYYYY')}
                                    </div>
                                </Td>
                            </Tr>
                        ))}
                    </TBody>
                </Table>
            </div>
        </Card>
    )
}

export default RecentCampaign
