import ImageGallery from '@/components/shared/ImageGallery'
import { useState } from 'react'

const slides = [
    { src: '/img/others/gallery/img-25.webp', title: 'Image 1' },
    { src: '/img/others/gallery/img-26.webp', title: 'Image 2' },
    { src: '/img/others/gallery/img-27.webp', title: 'Image 3' },
]

const Example = () => {
    const [currentIndex, setCurrentIndex] = useState(-1)

    return (
        <ImageGallery
            index={currentIndex}
            slides={
                slides?.map((img) => {
                    return {
                        src: img.src,
                    }
                }) || []
            }
            onClose={() => setCurrentIndex(-1)}
        >
            <div className="grid grid-cols-3 gap-2">
                {slides?.map((img, index) => (
                    <div
                        key={img.title}
                        data-src={img.src}
                        className="cursor-pointer"
                        role="button"
                        onClick={() => setCurrentIndex(index)}
                    >
                        <img className="rounded-xl" src={img.src} />
                    </div>
                ))}
            </div>
        </ImageGallery>
    )
}

export default Example
