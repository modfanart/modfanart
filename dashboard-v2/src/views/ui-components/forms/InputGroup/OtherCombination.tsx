import InputGroup from '@/components/ui/InputGroup'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import DatePicker from '@/components/ui/DatePicker'
import { HiOutlineMicrophone } from 'react-icons/hi'

const { Addon } = InputGroup

const options1 = [
    { value: '.com', label: '.com' },
    { value: '.net', label: '.net' },
    { value: '.io', label: '.io' },
]

const options2 = [
    { value: '12:00 صبح', label: '12:00 صبح' },
    { value: '1:00 صبح', label: '1:00 صبح' },
    { value: '2:00 صبح', label: '2:00 صبح' },
    { value: '3:00 صبح', label: '3:00 صبح' },
    { value: '4:00 صبح', label: '4:00 صبح' },
    { value: '5:00 صبح', label: '5:00 صبح' },
    { value: '6:00 صبح', label: '6:00 صبح' },
    { value: '7:00 صبح', label: '7:00 صبح' },
    { value: '8:00 صبح', label: '8:00 صبح' },
    { value: '9:00 صبح', label: '9:00 صبح' },
    { value: '10:00 صبح', label: '10:00 صبح' },
    { value: '11:00 صبح', label: '11:00 صبح' },
    { value: '12:00 ظهر', label: '12:00 ظهر' },
    { value: '1:00 عصر', label: '1:00 عصر' },
    { value: '2:00 عصر', label: '2:00 عصر' },
    { value: '3:00 عصر', label: '3:00 عصر' },
    { value: '4:00 عصر', label: '4:00 عصر' },
    { value: '5:00 عصر', label: '5:00 عصر' },
    { value: '6:00 عصر', label: '6:00 عصر' },
    { value: '7:00 عصر', label: '7:00 عصر' },
    { value: '8:00 عصر', label: '8:00 عصر' },
    { value: '9:00 عصر', label: '9:00 عصر' },
    { value: '10:00 عصر', label: '10:00 عصر' },
    { value: '11:00 عصر', label: '11:00 عصر' },
]

const OtherCombination = () => {
    return (
        <div>
            <InputGroup className="mb-4">
                <Input
                    prefix={
                        <HiOutlineMicrophone className="text-xl text-indigo-600 cursor-pointer" />
                    }
                />
                <Button>ارسال</Button>
            </InputGroup>
            <InputGroup className="mb-4">
                <DatePicker placeholder="تاریخ شروع" />
                <Addon>تا</Addon>
                <DatePicker placeholder="تاریخ پایان" />
            </InputGroup>
            <InputGroup className="mb-4">
                <Input />
                <div style={{ minWidth: 120 }}>
                    <Select
                        isSearchable={false}
                        defaultValue={{ label: '.com', value: '.com' }}
                        options={options1}
                    />
                </div>
            </InputGroup>
            <InputGroup className="mb-4">
                <DatePicker placeholder="انتخاب تاریخ" />
                <div style={{ minWidth: 140 }}>
                    <Select
                        isSearchable={false}
                        placeholder="زمان"
                        options={options2}
                    />
                </div>
            </InputGroup>
        </div>
    )
}

export default OtherCombination
