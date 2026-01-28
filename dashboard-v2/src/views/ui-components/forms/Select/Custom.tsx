import Select, { Option as DefaultOption } from '@/components/ui/Select'
import Avatar from '@/components/ui/Avatar'
import { components } from 'react-select'
import type {
    ControlProps,
    OptionProps,
    MultiValueGenericProps,
} from 'react-select'

type Option = {
    value: string
    label: string
    imgPath: string
}

const { MultiValueLabel, Control } = components

const countryOptions: Option[] = [
    { value: 'us', label: 'United State', imgPath: '/img/countries/US.png' },
    { value: 'cn', label: 'China', imgPath: '/img/countries/CN.png' },
    { value: 'jp', label: 'Japan', imgPath: '/img/countries/JP.png' },
    { value: 'fr', label: 'French', imgPath: '/img/countries/FR.png' },
]

const CustomSelectOption = (props: OptionProps<Option>) => {
    return (
        <DefaultOption<Option>
            {...props}
            customLabel={(data, label) => (
                <span className="flex items-center gap-2">
                    <Avatar shape="circle" size={20} src={data.imgPath} />
                    <span className="ml-2 rtl:mr-2">{label}</span>
                </span>
            )}
        />
    )
}

const CustomControl = ({ children, ...props }: ControlProps<Option>) => {
    const selected = props.getValue()[0]
    return (
        <Control {...props}>
            {selected && (
                <Avatar
                    className="ltr:ml-4 rtl:mr-4"
                    shape="circle"
                    size={18}
                    src={selected.imgPath}
                />
            )}
            {children}
        </Control>
    )
}

const CustomControlMulti = ({
    children,
    ...props
}: MultiValueGenericProps<Option, true>) => {
    const { imgPath } = props.data
    return (
        <MultiValueLabel {...props}>
            <div className="inline-flex items-center">
                <Avatar
                    className="mr-2 rtl:ml-2"
                    shape="circle"
                    size={15}
                    src={imgPath}
                />
                {children}
            </div>
        </MultiValueLabel>
    )
}

const Custom = () => {
    return (
        <div>
            <Select<Option>
                options={countryOptions}
                components={{
                    Option: CustomSelectOption,
                    Control: CustomControl,
                }}
                defaultValue={countryOptions[0]}
                className="mb-4"
            />
            <Select<Option, true>
                isMulti
                options={countryOptions}
                components={{
                    Option: CustomSelectOption,
                    MultiValueLabel: CustomControlMulti,
                }}
                defaultValue={[countryOptions[1], countryOptions[2]]}
                className="mb-4"
            />
        </div>
    )
}

export default Custom
