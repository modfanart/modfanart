import IconWrapper from './IconWrapper'
import {
    PiAcornDuotone,
    PiAddressBookDuotone,
    PiAirplaneInFlightDuotone,
    PiAirplayDuotone,
    PiAlarmDuotone,
    PiAlienDuotone,
    PiAlignBottomSimpleDuotone,
    PiAmazonLogoDuotone,
    PiAppWindowDuotone,
} from 'react-icons/pi'

const renderIcon = [
    { render: () => <PiAcornDuotone /> },
    { render: () => <PiAddressBookDuotone /> },
    { render: () => <PiAirplaneInFlightDuotone /> },
    { render: () => <PiAirplayDuotone /> },
    { render: () => <PiAlarmDuotone /> },
    { render: () => <PiAlienDuotone /> },
    { render: () => <PiAlignBottomSimpleDuotone /> },
    { render: () => <PiAmazonLogoDuotone /> },
    { render: () => <PiAppWindowDuotone /> },
]

const PhosphorIcons = () => {
    return (
        <div className="grid grid-cols-3 gap-y-6 text-4xl text-center heading-text">
            {renderIcon.map((icon, index) => (
                <IconWrapper key={`icoMoonFree-${index}`}>
                    {icon.render()}
                </IconWrapper>
            ))}
        </div>
    )
}

export default PhosphorIcons
