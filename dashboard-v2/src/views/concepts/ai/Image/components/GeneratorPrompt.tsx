import { useState, useRef } from 'react'
import Button from '@/components/ui/Button'
import Tooltip from '@/components/ui/Tooltip'
import Upload from '@/components/ui/Upload'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import CloseButton from '@/components/ui/CloseButton'
import ConfigDropdown from './ConfigDropdown'
import { useImageGeneratorStore } from '../store/imageGeneratorStore'
import {
    aspectRatioOptions,
    styleOptions,
    toneOptions,
    lightingOptions,
    cameraOptions,
} from '../utils'
import { apiPostImages } from '@/services/AiService'
import { LuImage } from 'react-icons/lu'
import { ConfigsVariant, PostImageResponse } from '../type'

const GeneratorPrompt = () => {
    const [uploadedImage, setUploadedImage] = useState<File[]>([])

    const {
        generatorConfig,
        setGeneratorConfig,
        resetGeneratorConfig,
        onGenerateImage,
        onGenerateImageComplete,
        setGeneratedImage,
        isGeneratingImage,
    } = useImageGeneratorStore()

    const promptRef = useRef<HTMLTextAreaElement>(null)

    const handleClear = () => {
        resetGeneratorConfig()
    }

    const handleGenerate = async () => {
        const prompt = promptRef.current?.value

        if (!prompt) {
            toast.push(
                <Notification title={'لطفاً توضیحات را وارد کنید'} type="danger" />,
                {
                    placement: 'top-center',
                },
            )
            promptRef.current?.focus()

            return
        }
        onGenerateImage()
        const resp = await apiPostImages<PostImageResponse, { prompt: string }>(
            { prompt },
        )
        if (resp) {
            setGeneratedImage(resp)
        }
        onGenerateImageComplete()
    }

    const handleSetGeneratorConfig = (key: ConfigsVariant, value: string) => {
        setGeneratorConfig({ key, value })
    }

    const beforeUpload = (files: FileList | null) => {
        let valid: string | boolean = true

        const allowedFileType = ['image/jpeg', 'image/png', 'image/webp']

        if (files) {
            for (const f of files) {
                if (!allowedFileType.includes(f.type)) {
                    valid = 'لطفاً یک فایل .jpeg یا .png آپلود کنید!'
                }
            }
        }

        return valid
    }

    return (
        <div className="rounded-lg p-4 border-2 border-gray-100 dark:border-gray-700">
            <div className="flex gap-4 mb-4">
                {uploadedImage.length > 0 && (
                    <div className="max-w-[150px] relative cursor-pointer group">
                        {
                            <img
                                className="rounded-xl"
                                src={URL.createObjectURL(uploadedImage[0])}
                            />
                        }
                        <div className="opacity-0 group-hover:opacity-100 bg-black/75 group-hover:flex items-center justify-center rounded-xl absolute top-0 left-0 w-full h-full transition-colors">
                            <CloseButton onClick={() => setUploadedImage([])} />
                        </div>
                    </div>
                )}
                <div className="flex-1">
                    <div className="heading-text text-base font-semibold">
                        توضیحات
                    </div>
                    <textarea
                        ref={promptRef}
                        className="w-full resize-none mt-1 placeholder:text-gray-400 bg-transparent focus:outline-none heading-text"
                        placeholder="تصویری که می‌خواهید تولید کنید را توصیف کنید"
                    />
                </div>
            </div>
            <div className="flex flex-col lg:flex-row gap-6 justify-between">
                <div className="inline-flex flex-wrap gap-2">
                    <Tooltip title="افزودن تصویر">
                        <Upload
                            showList={false}
                            beforeUpload={beforeUpload}
                            uploadLimit={1}
                            onChange={setUploadedImage}
                        >
                            <Button size="sm" icon={<LuImage />} />
                        </Upload>
                    </Tooltip>
                    <ConfigDropdown
                        list={aspectRatioOptions}
                        value={generatorConfig.aspectRatio}
                        onSelect={(value) =>
                            handleSetGeneratorConfig('aspectRatio', value)
                        }
                    />
                    <ConfigDropdown
                        list={styleOptions}
                        value={generatorConfig.style}
                        onSelect={(value) =>
                            handleSetGeneratorConfig('style', value)
                        }
                    />
                    <ConfigDropdown
                        list={toneOptions}
                        value={generatorConfig.tone}
                        onSelect={(value) =>
                            handleSetGeneratorConfig('tone', value)
                        }
                    />
                    <ConfigDropdown
                        list={lightingOptions}
                        value={generatorConfig.lighting}
                        onSelect={(value) =>
                            handleSetGeneratorConfig('lighting', value)
                        }
                    />
                    <ConfigDropdown
                        list={cameraOptions}
                        value={generatorConfig.camera}
                        onSelect={(value) =>
                            handleSetGeneratorConfig('camera', value)
                        }
                    />
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-end gap-4">
                    <Button size="sm" shape="circle" onClick={handleClear}>
                        پاک کردن
                    </Button>
                    <Button
                        size="sm"
                        variant="solid"
                        shape="circle"
                        loading={isGeneratingImage}
                        onClick={handleGenerate}
                    >
                        تولید
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default GeneratorPrompt
