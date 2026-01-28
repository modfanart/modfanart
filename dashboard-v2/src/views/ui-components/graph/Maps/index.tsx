import DemoLayout from '@/components/docs/DemoLayout'

// Demo
import BasicAnnotation from './BasicAnnotation'
import BasicMarker from './BasicMarker'
import BasicWorldMap from './BasicWorldMap'
import CustomMarker from './CustomMarker'
import EuropeMapWithGraticule from './EuropeMapWithGraticule'
import Graticule from './Graticule'
import MapChartWithTooltip from './MapChartWithTooltip'
import ChoroplethQuantile from './ChoroplethQuantile'
import ChoroplethQuantize from './ChoroplethQuantize'
import UsaStatesMapWithLabels from './UsaStatesMapWithLabels'

const mdPath = 'Maps'

const demoHeader = {
    title: 'نمودارها (Charts)',
    desc: 'یک کامپوننت Wrapper برای هر نقشه‌چارتی که با react-simple-maps ساخته شده است. این کامپوننت، کانتکست نقشه را تعیین می‌کند که به تمامی کامپوننت‌های react-simple-maps ارسال می‌شود. این کانتکست شامل اطلاعاتی در مورد پروجکشن و ژنراتور مسیر، همچنین ابعاد نقشه‌چارت است.',
}

const demos = [
    {
        mdName: 'BasicAnnotation',
        mdPath: mdPath,
        title: 'یادداشت پایه (Basic Annotation)',
        desc: ``,
        component: <BasicAnnotation />,
    },
    {
        mdName: 'BasicMarker',
        mdPath: mdPath,
        title: 'مارکر پایه (Basic Marker)',
        desc: ``,
        component: <BasicMarker />,
    },
    {
        mdName: 'BasicWorldMap',
        mdPath: mdPath,
        title: 'نقشه جهانی پایه (Basic World Map)',
        desc: ``,
        component: <BasicWorldMap />,
    },
    {
        mdName: 'CustomMarker',
        mdPath: mdPath,
        title: 'مارکر سفارشی (Custom Marker)',
        desc: ``,
        component: <CustomMarker />,
    },
    {
        mdName: 'EuropeMapWithGraticule',
        mdPath: mdPath,
        title: 'نقشه اروپا با شبکه (Europe Map With Graticule)',
        desc: ``,
        component: <EuropeMapWithGraticule />,
    },
    {
        mdName: 'Graticule',
        mdPath: mdPath,
        title: 'شبکه (Graticule)',
        desc: ``,
        component: <Graticule />,
    },
    {
        mdName: 'MapChartWithTooltip',
        mdPath: mdPath,
        title: 'نقشه‌چارت با راهنمای ابزار (Map Chart With Tooltip)',
        desc: ``,
        component: <MapChartWithTooltip />,
    },
    {
        mdName: 'ChoroplethQuantile',
        mdPath: mdPath,
        title: 'نقشه کُروپُلِت ایالات متحده (Quantile)',
        desc: ``,
        component: <ChoroplethQuantile />,
    },
    {
        mdName: 'ChoroplethQuantize',
        mdPath: mdPath,
        title: 'نقشه کُروپُلِت ایالات متحده (Quantize)',
        desc: ``,
        component: <ChoroplethQuantize />,
    },
    {
        mdName: 'UsaStatesMapWithLabels',
        mdPath: mdPath,
        title: 'نقشه ایالات متحده با برچسب‌ها (USA States Map With Labels)',
        desc: ``,
        component: <UsaStatesMapWithLabels />,
    },
]


const demoApi = [
    {
        component: 'نقشه ترکیبی (ComposableMap)',
        api: [
            {
                propName: 'width',
                type: `<code>number</code>`,
                default: `<code>800</code>`,
                desc: '-',
            },
            {
                propName: 'height',
                type: `<code>number</code>`,
                default: `<code>600</code>`,
                desc: '-',
            },
            {
                propName: 'projection',
                type: `<code>string</code> | <code>() => void</code>`,
                default: `<code>'geoEqualEarth'</code>`,
                desc: '-',
            },
            {
                propName: 'projectionConfig',
                type: `<code>object</code>`,
                default: `<code>{}</code>`,
                desc: '-',
            },
        ],
    },
    {
        component: 'گروه قابل زوم (ZoomableGroup)',
        api: [
            {
                propName: 'center',
                type: `<code>array</code>`,
                default: `<code>[0, 0]</code>`,
                desc: '-',
            },
            {
                propName: 'zoom',
                type: `<code>number</code>`,
                default: `<code>1</code>`,
                desc: '-',
            },
            {
                propName: 'minZoom',
                type: `<code>number</code>`,
                default: `<code>1</code>`,
                desc: '-',
            },
            {
                propName: 'maxZoom',
                type: `<code>number</code>`,
                default: `<code>8</code>`,
                desc: '-',
            },
            {
                propName: 'translateExtent',
                type: `<code>array</code>`,
                default: `<code>[-∞, -∞, ∞, ∞]</code>`,
                desc: '-',
            },
            {
                propName: 'onMoveStart',
                type: `<code>(position: { coordinates: [number, number], zoom: number }, event: D3ZoomEvent< SVGElement, any>) => void</code>`,
                default: `-`,
                desc: '-',
            },
            {
                propName: 'onMove',
                type: `<code>(position: {x: number, y: number, k: number, dragging: WheelEvent }, event: D3ZoomEvent< SVGElement, any>) => void</code>`,
                default: `-`,
                desc: '-',
            },
            {
                propName: 'onMoveEnd',
                type: `<code>(position: { coordinates: [number, number], zoom: number }, event: D3ZoomEvent< SVGElement, any>) => void</code>`,
                default: `-`,
                desc: '-',
            },
        ],
    },
    {
        component: 'کره (Sphere)',
        api: [
            {
                propName: 'id',
                type: `<code>string</code>`,
                default: `<code>'rsm-sphere'</code>`,
                desc: '-',
            },
            {
                propName: 'fill',
                type: `<code>string</code>`,
                default: `<code>'transparent'</code>`,
                desc: '-',
            },
            {
                propName: 'stroke',
                type: `<code>string</code>`,
                default: `<code>'currentcolor'</code>`,
                desc: '-',
            },
            {
                propName: 'strokeWidth',
                type: `<code>number</code>`,
                default: `<code>0.5</code>`,
                desc: '-',
            },
        ],
    }, 
    {
        component: 'گراستیکول (Graticule)',
        api: [
            {
                propName: 'fill',
                type: `<code>string</code>`,
                default: `<code>'transparent'</code>`,
                desc: '-',
            },
            {
                propName: 'stroke',
                type: `<code>string</code>`,
                default: `<code>'currentcolor'</code>`,
                desc: '-',
            },
            {
                propName: 'step',
                type: `<code>Array</code>`,
                default: `<code>[10, 10]</code>`,
                desc: '-',
            },
        ],
    },
    {
        component: 'جغرافیاها (Geographies)',
        api: [
            {
                propName: 'geography',
                type: `<code>string</code>`,
                default: `-`,
                desc: '-',
            },
            {
                propName: 'children',
                type: `<code>(data: object) => void</code>`,
                default: `-`,
                desc: '-',
            },
            {
                propName: 'parseGeographies',
                type: `<code> (features: Array) => Array</code>`,
                default: `-`,
                desc: '-',
            },
        ],
    },
    {
        component: 'جغرافیا (Geography)',
        api: [
            {
                propName: 'geography',
                type: `<code>object</code>`,
                default: `-`,
                desc: '-',
            },
            {
                propName: 'style',
                type: `<code>object</code>`,
                default: `-`,
                desc: '-',
            },
        ],
    },
    {
        component: 'نشانگر (Marker)',
        api: [
            {
                propName: 'coordinates',
                type: `<code>array</code>`,
                default: `<code>[]</code>`,
                desc: '-',
            },
            {
                propName: 'style',
                type: `<code>object</code>`,
                default: `<code>{}</code>`,
                desc: '-',
            },
        ],
    },
    {
        component: 'خط (Line)',
        api: [
            {
                propName: 'from',
                type: `<code>[number, number]</code>`,
                default: `<code>[0, 0]</code>`,
                desc: '-',
            },
            {
                propName: 'to',
                type: `<code>[number, number]</code>`,
                default: `<code>[0, 0]</code>`,
                desc: '-',
            },
            {
                propName: 'coordinates',
                type: `<code>array</code>`,
                default: `<code>[]</code>`,
                desc: '-',
            },
            {
                propName: 'fill',
                type: `<code>string</code>`,
                default: `<code>'transparent'</code>`,
                desc: '-',
            },
            {
                propName: 'stroke',
                type: `<code>string</code>`,
                default: `<code>'currentcolor'</code>`,
                desc: '-',
            },
            {
                propName: 'strokeWidth',
                type: `<code>number</code>`,
                default: `<code>3</code>`,
                desc: '-',
            },
        ],
    },
    {
        component: 'یادداشت (Annotation)',
        api: [
            {
                propName: 'subject',
                type: `<code>array</code>`,
                default: `<code>[]</code>`,
                desc: '-',
            },
            {
                propName: 'dx',
                type: `<code>number</code>`,
                default: `<code>30</code>`,
                desc: '-',
            },
            {
                propName: 'dy',
                type: `<code>number</code>`,
                default: `<code>30</code>`,
                desc: '-',
            },
            {
                propName: 'curve',
                type: `<code>number</code>`,
                default: `<code>0</code>`,
                desc: '-',
            },
            {
                propName: 'connectorProps',
                type: `<code>object</code>`,
                default: `-`,
                desc: '-',
            },
        ],
    },
    
]

const Extra = () => {
    return (
        <>
            <h4 className="mb-4">استفاده‌های بیشتر و مثال‌ها؟</h4>
            <p>
                مستندات را بخوانید{' '}
                <a
                    className="heading-text underline"
                    target="_blank"
                    href="https://www.react-simple-maps.io/docs/getting-started/"
                    rel="noreferrer"
                >
                    مستندات
                </a>
                ، یا مثال‌ها را بررسی کنید{' '}
                <a
                    className="heading-text underline"
                    target="_blank"
                    href="https://www.react-simple-maps.io/examples/"
                    rel="noreferrer"
                >
                    مثال‌ها
                </a>
                .
            </p>
        </>
    )
}


const Maps = () => {
    return (
        <DemoLayout
            header={demoHeader}
            demos={demos}
            api={demoApi}
            extra={<Extra />}
        />
    )
}

export default Maps
