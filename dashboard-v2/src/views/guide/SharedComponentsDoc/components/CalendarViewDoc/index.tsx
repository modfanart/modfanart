import DemoLayout from '@/components/docs/DemoLayout'

// Demo
import Example from './Example'

const mdPath = 'CalendarViewDoc'

const demoHeader = {
    title: 'نمایش تقویم (CalendarView)',
    desc: 'کامپوننت CalendarView یک wrapper برای <a class="text-primary underline" href="https://fullcalendar.io/docs/react" target="_blank">FullCalendar</a> است.',
}

const demos = [
    {
        mdName: 'Example',
        mdPath: mdPath,
        title: 'مثال (Example)',
        desc: `به طور اساسی می‌توانید تمام props‌هایی که <a class="text-primary underline" href="https://fullcalendar.io/docs#toc" target="_blank">FullCalendar</a> ارائه می‌دهد، اعمال کنید. شما می‌توانید ویژگی <code>eventColor</code> را به <code>event</code> meta اضافه کنید تا رنگ رویداد را مشخص کنید.`,
        component: <Example />,
    },
]

const demoApi = [
    {
        component: 'نمایش تقویم (CalendarView)',
        api: [
            {
                propName: 'wrapperClass',
                type: `<code>string</code>`,
                default: `-`,
                desc: 'کلاس اضافی که به wrapper اضافه می‌شود',
            },
        ],
    },
    {
        component: 'ویژگی‌های اضافی برای رویداد (Extra properties for event prop)',
        api: [
            {
                propName: 'eventColors',
                type: `<code>(colors:EventColors) => EventColors</code>`,
                default: `-`,
                desc: 'یک callback برای بازتعریف لیست رنگ‌های رویداد',
            },
        ],
    },
]


const reactFullCalendarApi = (
    <div className="demo-api-table mb-12">
        <h4 className="mb-5">وابستگی‌ها</h4>
        <h6 id="react-syntax-highlighter-api" className="mb-3">
            Fullcalendar
        </h6>
        <p>
            تمام پراپرتی‌های Fullcalendar را می‌توان بر روی این کامپوننت اعمال کرد، برای مشاهده لیست کامل API به{' '}
            <a
                className="underline text-primary"
                href="https://fullcalendar.io/docs/react#props"
                target="_blank"
                rel="noreferrer"
            >
                مستندات رسمی
            </a>{' '}
            مراجعه کنید.{' '}
        </p>
    </div>
)

const CalendarViewDoc = () => {
    return (
        <DemoLayout
            innerFrame={false}
            header={demoHeader}
            demos={demos}
            api={demoApi}
            mdPrefixPath="shared"
            extra={reactFullCalendarApi}
        />
    )
}

export default CalendarViewDoc
