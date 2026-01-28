import IconWrapper from './IconWrapper'
import {
    Fa0,
    Fa1,
    Fa2,
    Fa3,
    Fa4,
    Fa42Group,
    Fa5,
    Fa6,
    Fa7,
} from 'react-icons/fa6'

const renderIcon = [
    { render: () => <Fa0 /> },
    { render: () => <Fa1 /> },
    { render: () => <Fa2 /> },
    { render: () => <Fa3 /> },
    { render: () => <Fa4 /> },
    { render: () => <Fa42Group /> },
    { render: () => <Fa5 /> },
    { render: () => <Fa6 /> },
    { render: () => <Fa7 /> },
]

const FontAwesome6 = () => {
    return (
        <div className="grid grid-cols-3 gap-y-6 text-4xl text-center heading-text">
            {renderIcon.map((icon, index) => (
                <IconWrapper key={`fontAwesome-${index}`}>
                    {icon.render()}
                </IconWrapper>
            ))}
        </div>
    )
}

export default FontAwesome6
