import DemoLayout from '@/components/docs/DemoLayout'

// Demo
import Basic from './Basic'
import CustomToolbar from './CustomToolbar'
import CustomConfig from './CustomConfig'
import WithForm from './WithForm'

const mdPath = 'RichTextEditorDoc'

const demoHeader = {
    title: 'RichTextEditor (ویرایشگر متن غنی)',
    desc: 'کامپوننت <code>RichTextEditor</code> یک ویرایشگر متن غنی قابل تنظیم است که با فریمورک Tiptap مورد استفاده قرار می‌گیرد. این ویرایشگر دارای یک نوار ابزار از پیش تعریف‌شده است که شامل گزینه‌های فرمت‌دهی معمول مانند بولد، ایتالیک، لیست‌ها و موارد دیگر می‌باشد.',
}

const demos = [
    {
        mdName: 'Basic',
        mdPath: mdPath,
        title: 'Basic (استفاده اساسی)',
        desc: `استفاده اساسی.`,
        component: <Basic />,
    },
    {
        mdName: 'CustomToolbar',
        mdPath: mdPath,
        title: 'Custom toolbar (نوار ابزار سفارشی)',
        desc: `شما می‌توانید نوار ابزار ویرایشگر را با پراپ <code>customToolBar</code> سفارشی‌سازی کنید.`,
        component: <CustomToolbar />,
    },
    {
        mdName: 'CustomConfig',
        mdPath: mdPath,
        title: 'Custom config (پیکربندی سفارشی)',
        desc: `شما می‌توانید کل پیکربندی را با پراپ <code>customToolBar</code> سفارشی کنید. توجه: اگر از StarterKit به عنوان اکستنشن استفاده نمی‌کنید، وجود مستندات و اکستنشن Text ضروری است.`,
        component: <CustomConfig />,
    },
    {
        mdName: 'WithForm',
        mdPath: mdPath,
        title: 'With form (با فرم)',
        desc: `مثالی همراه با فرم.`,
        component: <WithForm />,
    },
]


const tiptapUsage = (
    <div className="demo-api-table mb-12">
        <h4 className="mb-5">وابستگی‌ها</h4>
        <h6 id="react-syntax-highlighter-api" className="mb-3">
            tiptap
        </h6>
        <p>
            برای استفاده بیشتر از tiptap، می‌توانید به{' '}
            <a
                className="underline text-primary"
                href="https://tiptap.dev/docss"
                target="_blank"
                rel="noreferrer"
            >
                مستندات رسمی
            </a>{' '}
            مراجعه کنید تا لیست کامل API را مشاهده کنید.
        </p>
    </div>
)


const demoApi = [
    {
        component:'RichTextEditor (ویرایشگر متن غنی)',
        api: [
            {
                propName: 'content',
                type: '<code>string</code>',
                default: '-',
                desc: 'محتوای اولیه ویرایشگر. این می‌تواند یک رشته HTML یا متن ساده باشد.',
            },
            {
                propName: 'invalid',
                type: '<code>boolean</code>',
                default: '-',
                desc: 'سبک‌هایی را اعمال می‌کند که نشان دهد محتوای ویرایشگر نامعتبر است، معمولاً برای اعتبارسنجی فرم استفاده می‌شود.',
            },
            {
                propName: 'customToolBar',
                type: `<code>(editor: Editor, components: {
                    ToolButtonBold: ({ editor }: BaseToolButtonProps) => JSX.Element,
                    ToolButtonItalic: ({ editor }: BaseToolButtonProps) => JSX.Element,
                    ToolButtonStrike: ({ editor }: BaseToolButtonProps) => JSX.Element,
                    ToolButtonCode: ({ editor }: BaseToolButtonProps) => JSX.Element,
                    ToolButtonBlockquote:  ({ editor }: BaseToolButtonProps) => JSX.Element,
                    ToolButtonHeading: ({ editor }: BaseToolButtonProps & { headingLevel?: HeadingLevel[] }) => JSX.Element,
                    ToolButtonBulletList: ({ editor }: BaseToolButtonProps) => JSX.Element,
                    ToolButtonOrderedList: ({ editor }: BaseToolButtonProps) => JSX.Element,
                    ToolButtonCodeBlock:  ({ editor }: BaseToolButtonProps) => JSX.Element,
                    ToolButtonHorizontalRule: ({ editor }: BaseToolButtonProps) => JSX.Element,
                    ToolButtonParagraph: ({ editor }: BaseToolButtonProps) => JSX.Element,
                    ToolButtonUndo: ({ editor }: BaseToolButtonProps) => JSX.Element,
                    ToolButtonRedo: ({ editor }: BaseToolButtonProps) => JSX.Element,
                }) => ReactNode</code>`,
                default: '-',
                desc: 'تابعی برای سفارشی‌سازی نوار ابزار با ارائه دکمه‌های دلخواه. این تابع نمونه جاری `editor` و یک شی شامل کامپوننت‌های پیش‌فرض نوار ابزار را دریافت می‌کند.',
            },
            {
                propName: 'onChange',
                type: '<code>(content: {text: string, html: string, json: JSONContent}) => void</code>',
                default: '-',
                desc: 'تابع بازخوانی که هر بار محتوای ویرایشگر تغییر می‌کند، فراخوانی می‌شود. این تابع محتوای به‌روزرسانی‌شده را در سه فرمت ارائه می‌دهد: متن ساده، HTML و JSON.',
            },
            {
                propName: 'editorContentClass',
                type: '<code>string</code>',
                default: '-',
                desc: 'کلاس‌های CSS اضافی که به ناحیه محتوای ویرایشگر اعمال می‌شوند.',
            },
            {
                propName: 'customEditor',
                type: '<code>Editor | null</code>',
                default: '-',
                desc: 'یک نمونه سفارشی از `Editor` Tiptap. اگر ارائه شود، این نمونه به جای ایجاد یک نمونه جدید استفاده خواهد شد.',
            },
        ],
    },
]


const RichTextEditorDoc = () => {
    return (
        <DemoLayout
            innerFrame={false}
            header={demoHeader}
            demos={demos}
            mdPrefixPath="shared"
            api={demoApi}
            extra={tiptapUsage}
        />
    )
}

export default RichTextEditorDoc
