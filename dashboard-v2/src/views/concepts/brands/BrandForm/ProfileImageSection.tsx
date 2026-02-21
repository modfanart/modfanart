import Card from '@/components/ui/Card'
import Avatar from '@/components/ui/Avatar'
import Upload from '@/components/ui/Upload'
import { Button } from '@/components/ui'
import DoubleSidedImage from '@/components/shared/DoubleSidedImage'
import { Controller } from 'react-hook-form'
import { HiOutlinePhotograph, HiOutlineOfficeBuilding } from 'react-icons/hi'
import type { FormSectionBaseProps } from './types'

type ProfileImageSectionProps = FormSectionBaseProps

const ProfileImageSection = ({ control, errors }: ProfileImageSectionProps) => {
    const beforeUpload = (files: FileList | null) => {
        let valid: string | boolean = true

        const allowedFileTypes = ['image/jpeg', 'image/png', 'image/webp']
        const maxSize = 5 * 1024 * 1024 // 5MB

        if (files) {
            for (const file of files) {
                if (!allowedFileTypes.includes(file.type)) {
                    valid = 'Only JPEG, PNG, or WebP files are allowed!'
                }
                if (file.size > maxSize) {
                    valid = 'File size must not exceed 5 MB!'
                }
            }
        }

        return valid
    }

    return (
        <Card>
            <h4 className="mb-6">Brand Logo</h4>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 text-center border border-gray-200 dark:border-gray-700">
                <Controller
                    name="logo_url"
                    control={control}
                    render={({ field }) => (
                        <>
                            <div className="flex flex-col items-center justify-center gap-4 mb-6">
                                {field.value ? (
                                    <Avatar
                                        size={120}
                                        shape="circle"
                                        className="border-4 border-white dark:border-gray-800 shadow-xl object-cover"
                                        src={field.value}
                                        fallback={
                                            <div className="w-full h-full flex items-center justify-center bg-primary-500 text-white text-4xl font-bold">
                                                <HiOutlineOfficeBuilding />
                                            </div>
                                        }
                                    />
                                ) : (
                                    <DoubleSidedImage
                                        src="/img/others/brand-logo-placeholder.png"
                                        darkModeSrc="/img/others/brand-logo-placeholder-dark.png"
                                        alt="Brand logo placeholder"
                                        className="w-32 h-32 opacity-70"
                                    />
                                )}

                                <div className="text-sm text-gray-500 dark:text-gray-400 whitespace-pre-line">
                                    {field.value
                                        ? 'Current logo'
                                        : 'Upload your brand logo here\n(preferably square, PNG or WebP with transparent background)'}
                                </div>

                                {errors.logo_url && (
                                    <div className="text-error-600 text-sm mt-1">
                                        {errors.logo_url.message}
                                    </div>
                                )}
                            </div>

                            <Upload
                                showList={false}
                                uploadLimit={1}
                                accept="image/jpeg,image/png,image/webp"
                                beforeUpload={beforeUpload}
                                onChange={(fileList) => {
                                    if (fileList && fileList.length > 0) {
                                        const file = fileList[0]
                                        // Create local preview URL for immediate display
                                        const previewUrl =
                                            URL.createObjectURL(file)
                                        field.onChange(previewUrl)

                                        // In a real app → upload to server here
                                        // then update field.onChange() with the permanent server URL
                                        // e.g. uploadFile(file).then(serverUrl => field.onChange(serverUrl))
                                    }
                                }}
                            >
                                <Button
                                    variant="solid"
                                    icon={
                                        <HiOutlinePhotograph className="text-lg" />
                                    }
                                    className="px-6"
                                    type="button"
                                >
                                    Select / Upload Logo
                                </Button>
                            </Upload>

                            <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                                Max size: 5 MB – Recommended formats: PNG
                                (transparent) or WebP
                            </p>
                        </>
                    )}
                />
            </div>
        </Card>
    )
}

export default ProfileImageSection
