import Alert from '@/components/ui/Alert'

const Closable = () => {
    const onCloseClick = () => {
        console.log('Alert closed!')
    }

    return (
        <div>
            <Alert closable type="success" onClose={onCloseClick}>
                از ارسال درخواست خود متشکریم. تیم ما باز خواهد گشت
                به زودی به شما
            </Alert>
        </div>
    )
}

export default Closable
