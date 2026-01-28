import Generator from './components/Generator'
import Gallery from './components/Gallery'
import ImageDialog from './components/ImageDialog'

const ImageGenerator = () => {
    return (
        <>
            <Generator />
            <div className="mt-6">
                <Gallery />
            </div>
            <ImageDialog />
        </>
    )
}

export default ImageGenerator
