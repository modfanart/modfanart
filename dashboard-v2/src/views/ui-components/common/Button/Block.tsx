import Button from '@/components/ui/Button'

const Block = () => {
    return (
        <div>
            <Button block className="mb-5">
                بلوک
            </Button>
            <Button block variant="solid">
                بلوک دیگر
            </Button>
        </div>
    )
}

export default Block
