import IconWrapper from './IconWrapper'
import {
    TfiAgenda,
    TfiBriefcase,
    TfiComments,
    TfiGame,
    TfiHeadphone,
    TfiHandOpen,
    TfiMicrophone,
    TfiMouseAlt,
    TfiPalette,
} from 'react-icons/tfi'

const renderIcon = [
    { render: () => <TfiAgenda /> },
    { render: () => <TfiBriefcase /> },
    { render: () => <TfiComments /> },
    { render: () => <TfiGame /> },
    { render: () => <TfiHeadphone /> },
    { render: () => <TfiHandOpen /> },
    { render: () => <TfiMicrophone /> },
    { render: () => <TfiMouseAlt /> },
    { render: () => <TfiPalette /> },
]

const ThemifyIcons = () => {
    return (
        <div className="grid grid-cols-3 gap-y-6 text-4xl text-center heading-text">
            {renderIcon.map((icon, index) => (
                <IconWrapper key={`tablerIcons-${index}`}>
                    {icon.render()}
                </IconWrapper>
            ))}
        </div>
    )
}

export default ThemifyIcons
