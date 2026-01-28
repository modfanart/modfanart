import Masonry from '@/components/shared/Masonry'

const imageList = [
    { src: '/img/others/gallery/img-27.webp', title: 'Image 1' },
    { src: '/img/others/gallery/img-29.webp', title: 'Image 2' },
    { src: '/img/others/gallery/img-30.webp', title: 'Image 3' },
    { src: '/img/others/gallery/img-28.webp', title: 'Image 4' },
    { src: '/img/others/gallery/img-31.webp', title: 'Image 5' },
    { src: '/img/others/gallery/img-26.webp', title: 'Image 6' },
    { src: '/img/others/gallery/img-19.webp', title: 'Image 7' },
    { src: '/img/others/gallery/img-32.webp', title: 'Image 8' },
]

const Basic = () => {
    return (
        <Masonry columns={4} gap={16}>
            {imageList.map((item) => {
                return (
                    <div key={item.title} className="rounded-lg">
                        <img
                            className="rounded-xl w-full"
                            src={item.src}
                            alt={item.title}
                        />
                    </div>
                )
            })}
        </Masonry>
    )
}

export default Basic
