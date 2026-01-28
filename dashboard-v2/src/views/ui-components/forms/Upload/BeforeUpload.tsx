import Upload from '@/components/ui/Upload'

const BeforeUpload = () => {
    const maxUpload = 2

    const beforeUpload = (files: FileList | null, fileList: File[]) => {
        let valid: string | boolean = true
    
        const allowedFileType = ['image/jpeg', 'image/png']
        const maxFileSize = 500000
    
        if (fileList.length >= maxUpload) {
            return `شما فقط می‌توانید ${maxUpload} فایل بارگذاری کنید`
        }
    
        if (files) {
            for (const f of files) {
                if (!allowedFileType.includes(f.type)) {
                    valid = 'لطفاً یک فایل با فرمت .jpeg یا .png بارگذاری کنید!'
                }
    
                if (f.size >= maxFileSize) {
                    valid = 'حجم تصویر بارگذاری شده نباید بیشتر از 500 کیلوبایت باشد!'
                }
            }
        }
    
        return valid
    }
    
    const tip = <p className="mt-2">فقط jpeg یا png (حداکثر 500 کیلوبایت)</p>    

    return (
        <div>
            <Upload
                beforeUpload={beforeUpload}
                uploadLimit={maxUpload}
                tip={tip}
            />
        </div>
    )
}

export default BeforeUpload
