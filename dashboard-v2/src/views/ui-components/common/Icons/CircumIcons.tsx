import IconWrapper from './IconWrapper'
import {
    CiAirportSign1,
    CiAlarmOff,
    CiAlarmOn,
    CiAlignBottom,
    CiAlignCenterH,
    CiAlignCenterV,
    CiAlignLeft,
    CiAlignRight,
    CiAlignTop,
} from 'react-icons/ci'

const renderIcon = [
    { render: () => <CiAirportSign1 /> },
    { render: () => <CiAlarmOff /> },
    { render: () => <CiAlarmOn /> },
    { render: () => <CiAlignBottom /> },
    { render: () => <CiAlignCenterH /> },
    { render: () => <CiAlignCenterV /> },
    { render: () => <CiAlignLeft /> },
    { render: () => <CiAlignRight /> },
    { render: () => <CiAlignTop /> },
]

const BoxIcons = () => {
    return (
        <div className="grid grid-cols-3 gap-y-6 text-4xl text-center heading-text">
            {renderIcon.map((icon, index) => (
                <IconWrapper key={`boxIcons-${index}`}>
                    {icon.render()}
                </IconWrapper>
            ))}
        </div>
    )
}

export default BoxIcons
