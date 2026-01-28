import IconWrapper from './IconWrapper'
import {
    RxAccessibility,
    RxActivityLog,
    RxBackpack,
    RxAvatar,
    RxCamera,
    RxCardStackPlus,
    RxCookie,
    RxEnvelopeClosed,
    RxDashboard,
} from 'react-icons/rx'

const renderIcon = [
    { render: () => <RxAccessibility /> },
    { render: () => <RxActivityLog /> },
    { render: () => <RxBackpack /> },
    { render: () => <RxAvatar /> },
    { render: () => <RxCamera /> },
    { render: () => <RxCardStackPlus /> },
    { render: () => <RxCookie /> },
    { render: () => <RxEnvelopeClosed /> },
    { render: () => <RxDashboard /> },
]

const RadixIcons = () => {
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

export default RadixIcons
