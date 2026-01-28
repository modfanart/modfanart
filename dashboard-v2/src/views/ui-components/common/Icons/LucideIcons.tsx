import IconWrapper from './IconWrapper'
import {
    LuAccessibility,
    LuActivity,
    LuActivitySquare,
    LuAirVent,
    LuAirplay,
    LuAlarmCheck,
    LuAlarmClock,
    LuAlarmClockOff,
    LuAlarmMinus,
} from 'react-icons/lu'

const renderIcon = [
    { render: () => <LuAccessibility /> },
    { render: () => <LuActivity /> },
    { render: () => <LuActivitySquare /> },
    { render: () => <LuAirVent /> },
    { render: () => <LuAirplay /> },
    { render: () => <LuAlarmCheck /> },
    { render: () => <LuAlarmClock /> },
    { render: () => <LuAlarmClockOff /> },
    { render: () => <LuAlarmMinus /> },
]

const LucideIcons = () => {
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

export default LucideIcons
