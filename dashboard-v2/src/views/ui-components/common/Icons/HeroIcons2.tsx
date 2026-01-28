import IconWrapper from './IconWrapper'
import {
    HiAcademicCap,
    HiAdjustmentsHorizontal,
    HiAdjustmentsVertical,
    HiArchiveBox,
    HiArchiveBoxXMark,
    HiArrowDown,
    HiArrowDownCircle,
    HiArrowDownLeft,
    HiArrowDownOnSquare,
} from 'react-icons/hi2'

const renderIcon = [
    { render: () => <HiAcademicCap /> },
    { render: () => <HiAdjustmentsHorizontal /> },
    { render: () => <HiAdjustmentsVertical /> },
    { render: () => <HiArchiveBox /> },
    { render: () => <HiArchiveBoxXMark /> },
    { render: () => <HiArrowDown /> },
    { render: () => <HiArrowDownCircle /> },
    { render: () => <HiArrowDownLeft /> },
    { render: () => <HiArrowDownOnSquare /> },
]

const HeroIcons2 = () => {
    return (
        <div className="grid grid-cols-3 gap-y-6 text-4xl text-center heading-text">
            {renderIcon.map((icon, index) => (
                <IconWrapper key={`heroIcons-${index}`}>
                    {icon.render()}
                </IconWrapper>
            ))}
        </div>
    )
}

export default HeroIcons2
