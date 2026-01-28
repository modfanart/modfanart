import { useState } from 'react'
import Avatar from '@/components/ui/Avatar'
import Card from '@/components/ui/Card'
import Progress from '@/components/ui/Progress'
import RegionMap from '@/components/shared/RegionMap'
import classNames from '@/utils/classNames'
import type { CustomerDemographicData } from '../types'

type CustomerDemographicProps = {
    data: CustomerDemographicData[]
}

const mapMeta: Record<string, { img: string }> = {
    us: { img: '/img/countries/US.png' },
    br: { img: '/img/countries/BR.png' },
    in: { img: '/img/countries/IN.png' },
    uk: { img: '/img/countries/UK.png' },
    tr: { img: '/img/countries/TR.png' },
    id: { img: '/img/countries/ID.png' },
}

const getMapMeta = (data: CustomerDemographicData[] = []) => {
    return data.map((item) => ({
        ...item,
        ...(mapMeta[item.id as string] || {}),
    }))
}

const CustomerDemographic = ({ data }: CustomerDemographicProps) => {
    const [hovering, setHovering] = useState('')

    return (
        <Card>
            <h4>کشورهای برتر</h4>
            <div className="flex flex-col xl:flex-row items-center gap-4 mt-4">
                <div className="px-4 flex flex-col justify-center flex-1 w-full">
                    <RegionMap
                        data={data}
                        valueSuffix="%"
                        hoverable={false}
                        marker={(Marker) => (
                            <>
                                {data.map(
                                    ({ name, coordinates, value, id }) => (
                                        <Marker
                                            key={name}
                                            coordinates={coordinates}
                                            className="cursor-pointer group"
                                            onMouseEnter={() => setHovering(id)}
                                            onMouseLeave={() => setHovering('')}
                                        >
                                            <g transform="translate(-12, -24)">
                                                <circle
                                                    cx="12"
                                                    cy="12"
                                                    r={value * 1.5}
                                                    className="fill-gray-900 opacity-10"
                                                />
                                                <circle
                                                    cx="12"
                                                    cy="12"
                                                    r={(value * 1.5) / 2.5}
                                                    className={classNames(
                                                        'fill-gray-400 opacity-80 group-hover:fill-primary transition-colors duration-150',
                                                        hovering === id &&
                                                            'fill-primary',
                                                    )}
                                                />
                                            </g>
                                        </Marker>
                                    ),
                                )}
                            </>
                        )}
                    />
                </div>
                <div className="flex flex-col justify-center px-4 2xl:min-w-[340px] xl:w-[300px] w-full">
                    {getMapMeta(data).map((item) => (
                        <div
                            key={item.name}
                            className={classNames(
                                'flex items-center gap-4 p-3 rounded-xl transition-colors duration-150',
                                hovering === item.id &&
                                    'bg-gray-100 dark:bg-gray-700',
                            )}
                            onMouseEnter={() => setHovering(item.id)}
                            onMouseLeave={() => setHovering('')}
                        >
                            <div className="flex gap-2">
                                <Avatar src={item.img} size={30} />
                            </div>
                            <div className="flex-1">
                                <div className="heading-text font-semibold">
                                    {item.name}
                                </div>
                                <Progress
                                    percent={item.value}
                                    trailClass={classNames(
                                        'transition-colors duration-150',
                                        hovering === item.id &&
                                            'bg-gray-200 dark:bg-gray-600',
                                    )}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    )
}

export default CustomerDemographic
