import RegionMap from '@/components/shared/RegionMap'
import classNames from '@/utils/classNames'
import { useState } from 'react'

const Example = () => {
    const [hovering, setHovering] = useState('')

    const data = [
        {
            id: 'us',
            name: 'United States',
            value: 38.61,
            coordinates: [-95.7129, 37.0902],
        },
        {
            id: 'br',
            name: 'Brazil',
            value: 32.79,
            coordinates: [-51.9253, -14.235],
        },
        {
            id: 'in',
            name: 'India',
            value: 26.42,
            coordinates: [78.9629, 20.5937],
        },
        {
            id: 'uk',
            name: 'United Kingdom',
            value: 17.42,
            coordinates: [0.1278, 51.5074],
        },
        {
            id: 'tr',
            name: 'Turkey',
            value: 12.85,
            coordinates: [28.9784, 41.0082],
        },
    ]

    return (
        <RegionMap
            data={data}
            valueSuffix="%"
            marker={(Marker) => (
                <>
                    {data.map(({ name, coordinates, value, id }) => (
                        <Marker
                            key={name}
                            coordinates={coordinates as [number, number]}
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
                                        hovering === id && 'fill-primary',
                                    )}
                                />
                            </g>
                        </Marker>
                    ))}
                </>
            )}
        />
    )
}

export default Example
