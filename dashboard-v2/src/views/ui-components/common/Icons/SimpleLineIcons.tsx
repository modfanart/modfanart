import IconWrapper from './IconWrapper'
import {
    SlActionRedo,
    SlActionUndo,
    SlAnchor,
    SlArrowDown,
    SlArrowDownCircle,
    SlBadge,
    SlBell,
    SlBulb,
    SlHandbag,
} from 'react-icons/sl'

const renderIcon = [
    { render: () => <SlActionRedo /> },
    { render: () => <SlActionUndo /> },
    { render: () => <SlAnchor /> },
    { render: () => <SlArrowDown /> },
    { render: () => <SlArrowDownCircle /> },
    { render: () => <SlBadge /> },
    { render: () => <SlBell /> },
    { render: () => <SlBulb /> },
    { render: () => <SlHandbag /> },
]

const SimpleLineIcons = () => {
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

export default SimpleLineIcons
