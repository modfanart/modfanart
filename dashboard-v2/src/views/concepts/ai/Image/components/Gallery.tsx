import { useEffect, useState } from 'react'
import Alert from '@/components/ui/Alert'
import Skeleton from '@/components/ui/Skeleton'
import GalleryImage from './GalleryImage'
import Masonry from '@/components/shared/Masonry'
import { useImageGeneratorStore } from '../store/imageGeneratorStore'
import useInfiniteScroll from '@/utils/hooks/useInfiniteScroll'
import { apiGetImages } from '@/services/AiService'
import type { GetImageResponse, Gallery, GelleryItem } from '../type'

const Gallery = () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, setIsInitialLoading] = useState(false)
    const [initialLoadComplete, setInitialLoadComplete] = useState(false)
    const [loadable, setLoadable] = useState(true)
    const [index, seIndex] = useState(1)

    const {
        setImageDialog,
        isGeneratedImagesView,
        isGeneratingImage,
        generatedImage,
    } = useImageGeneratorStore()

    const [imageList, setImageList] = useState<Gallery>([])

    const getImages = async (index: number) => {
        setIsInitialLoading(true)
        const resp = await apiGetImages<GetImageResponse, { index: number }>({
            index,
        })
        setImageList((prevImages) => [...prevImages, ...resp.data])
        setLoadable(resp.loadable)
        setIsInitialLoading(false)
        seIndex((prevIndex) => prevIndex + 1)
        if (!resp.loadable) {
            setLoadable(true)
            seIndex(() => 1)
        }
    }

    const { containerRef } = useInfiniteScroll({
        offset: '100px',
        async onLoadMore() {
            if (initialLoadComplete && loadable) {
                await getImages(index)
            }
        },
    })

    const initialLoad = async (index: number) => {
        setIsInitialLoading(true)
        const resp = await apiGetImages<
            GetImageResponse,
            { index: number; itemCount: number }
        >({ index, itemCount: 8 })
        setImageList(resp.data)
        setLoadable(resp.loadable)
        setIsInitialLoading(false)
        seIndex(3)
        setInitialLoadComplete(true)
    }

    const handleImageClick = (
        image: GelleryItem,
        type: 'generated' | 'existing',
    ) => {
        setImageDialog({
            open: true,
            props: { ...image, type },
        })
    }

    useEffect(() => {
        if (!initialLoadComplete) {
            initialLoad(index)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <>
            {isGeneratedImagesView && (
                <div className="rounded-xl bg-gray-100 dark:bg-gray-700 p-5 mb-4">
                    <h4 className="mb-4">
                        {isGeneratingImage ? 'در حال تولید' : 'نتیجه'}
                    </h4>
                    {!isGeneratingImage && generatedImage.length > 0 && (
                        <Alert showIcon className="mb-4" type="info">
                            این یک پاسخ شبیه‌سازی شده است که برای شبیه‌سازی یک
                            پاسخ تولید شده توسط هوش مصنوعی طراحی شده است. لطفاً توجه
                            داشته باشید که این تصویر توسط یک مدل هوش مصنوعی واقعی
                            تولید نشده است.
                        </Alert>
                    )}
                    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                        {isGeneratingImage ? (
                            <>
                                {[...Array(4).keys()].map((item) => (
                                    <Skeleton
                                        key={`loading-${item}`}
                                        className="rounded-xl bg-gray-300 dark:bg-gray-600"
                                        height={250}
                                    />
                                ))}
                            </>
                        ) : (
                            <>
                                {generatedImage.map((item) => {
                                    return (
                                        <GalleryImage
                                            key={item.id}
                                            galleryItem={item}
                                            onImageClick={() =>
                                                handleImageClick(
                                                    item,
                                                    'generated',
                                                )
                                            }
                                        />
                                    )
                                })}
                            </>
                        )}
                    </div>
                </div>
            )}
            {initialLoadComplete && (
                <div>
                    <h4 className="mb-4">تصاویر اخیر</h4>
                    <div ref={containerRef}>
                        <Masonry columns={{ 768: 2, 1280: 4 }} gap={16}>
                            {imageList.map((item) => {
                                return (
                                    <GalleryImage
                                        key={item.id}
                                        galleryItem={item}
                                        onImageClick={() =>
                                            handleImageClick(item, 'existing')
                                        }
                                    />
                                )
                            })}
                        </Masonry>
                    </div>
                </div>
            )}
        </>
    )
}

export default Gallery
