import Radio from '@/components/ui/Radio'

const Color = () => {
    return (
        <div>
            <Radio defaultChecked radioClass="text-green-500">
                رادیو
            </Radio>
            <div className="mt-4">
                <Radio.Group
                    radioClass="text-yellow-500"
                    value={'Apple'}
                    name="radioColorGroup"
                >
                    <Radio radioClass="text-blue-600" value={'Apple'}>
                        سیب
                    </Radio>
                    <Radio value={'Banana'}>موز</Radio>
                    <Radio value={'Cherry'}>گیلاس</Radio>
                </Radio.Group>
            </div>
        </div>
    )
}

export default Color
