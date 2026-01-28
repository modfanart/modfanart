import Radio from '@/components/ui/Radio'

const Simple = () => {
    return (
        <div>
            <Radio className="ml-4" name="simpleRadioExample">
                رادیو
            </Radio>
            <Radio defaultChecked name="simpleRadioExample">
                رادیو انتخاب شده
            </Radio>
        </div>
    )
}

export default Simple
