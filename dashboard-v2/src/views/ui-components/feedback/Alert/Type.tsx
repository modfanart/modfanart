import Alert from '@/components/ui/Alert'

const Type = () => {
    return (
        <div>
            <Alert showIcon className="mb-4" type="info">
                توضیحات و اطلاعات بیشتر در مورد کپی رایتینگ.
            </Alert>
            <Alert showIcon className="mb-4">
                توضیحات و اطلاعات بیشتر در مورد کپی رایتینگ.
            </Alert>
            <Alert showIcon className="mb-4" type="success">
                توضیحات و اطلاعات بیشتر در مورد کپی رایتینگ.
            </Alert>
            <Alert showIcon className="mb-4" type="danger">
                توضیحات و اطلاعات بیشتر در مورد کپی رایتینگ.
            </Alert>
        </div>
    )
}

export default Type
