import IconWrapper from './IconWrapper'
import {
    Lia500Px,
    LiaAccessibleIcon,
    LiaAccusoft,
    LiaAcquisitionsIncorporated,
    LiaAdSolid,
    LiaAddressBook,
    LiaAddressCard,
    LiaAddressCardSolid,
    LiaAdjustSolid,
} from 'react-icons/lia'

const renderIcon = [
    { render: () => <Lia500Px /> },
    { render: () => <LiaAccessibleIcon /> },
    { render: () => <LiaAccusoft /> },
    { render: () => <LiaAcquisitionsIncorporated /> },
    { render: () => <LiaAdSolid /> },
    { render: () => <LiaAddressBook /> },
    { render: () => <LiaAddressCard /> },
    { render: () => <LiaAddressCardSolid /> },
    { render: () => <LiaAdjustSolid /> },
]

const Icon8LineAwesome = () => {
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

export default Icon8LineAwesome
