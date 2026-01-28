import Radio from '@/components/ui/Radio'

const Disabled = () => {
    return (
        <div>
            <Radio disabled className="mr-4">
                رادیو غیرفعال
            </Radio>
            <Radio disabled checked>
                رادیو غیرفعال انتخاب شده
            </Radio>
            <div className="mt-4">
                <Radio.Group disabled value={'Apple'}>
                    <Radio value={'Apple'}>سیب</Radio>
                    <Radio value={'Banana'}>موز</Radio>
                    <Radio value={'Cherry'}>گیلاس</Radio>
                </Radio.Group>
            </div>
        </div>
    )
}

export default Disabled
