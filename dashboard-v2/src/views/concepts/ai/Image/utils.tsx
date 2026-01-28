import {
    LuSquare,
    LuRectangleHorizontal,
    LuRectangleVertical,
} from 'react-icons/lu'
import { TbRectangle, TbBan } from 'react-icons/tb'

export const aspectRatioOptions = [
    {
        label: 'چشم‌انداز (4:3)',
        value: 'lanscape',
        icon: <TbRectangle />,
        isIcon: true,
    },
    {
        label: 'پرتره (9:16)',
        value: 'portrait',
        icon: <LuRectangleVertical />,
        isIcon: true,
    },
    {
        label: 'مربع (1:1)',
        value: 'square',
        icon: <LuSquare />,
        isIcon: true,
    },
    {
        label: 'وایداسکرین (16:9)',
        value: 'widescreen',
        icon: <LuRectangleHorizontal />,
        isIcon: true,
    },
]

export const styleOptions = [
    { label: 'بدون سبک', value: 'noStyle', icon: <TbBan />, isIcon: true },
    { label: 'سه‌بعدی', value: 'd3', image: '/img/thumbs/styles/3d.jpg' },
    { label: 'انیمه', value: 'anime', image: '/img/thumbs/styles/anime.jpg' },
    {
        label: 'هنر دیجیتال',
        value: 'digitalArt',
        image: '/img/thumbs/styles/digital-art.jpg',
    },
    {
        label: 'فانتزی',
        value: 'fantasy',
        image: '/img/thumbs/styles/fantasy.jpg',
    },
    {
        label: 'فوتوریستی',
        value: 'futuristic',
        image: '/img/thumbs/styles/futuristic.jpg',
    },
    {
        label: 'هندسی',
        value: 'geometric',
        image: '/img/thumbs/styles/geometric.jpg',
    },
    {
        label: 'مینیمالیستی',
        value: 'minimalist',
        image: '/img/thumbs/styles/minimalist.jpg',
    },
    {
        label: 'نقاشی',
        value: 'painting',
        image: '/img/thumbs/styles/painting.jpg',
    },
    {
        label: 'طراحی با مداد',
        value: 'pencilDrawing',
        image: '/img/thumbs/styles/pencil-drawing.jpg',
    },
    { label: 'پیکسل', value: 'pixel', image: '/img/thumbs/styles/pixel.jpg' },
]

export const toneOptions = [
    { label: 'بدون تن', value: 'noTone', icon: <TbBan />, isIcon: true },
    {
        label: 'سیاه و سفید',
        value: 'blackAndWhite',
        image: '/img/thumbs/tone/black-and-white.jpg',
    },
    {
        label: 'تن سرد',
        value: 'coolTone',
        image: '/img/thumbs/tone/cool-tone.jpg',
    },
    { label: 'طلایی', value: 'golden', image: '/img/thumbs/tone/golden.jpg' },
    {
        label: 'رنگ ملایم',
        value: 'mutedColor',
        image: '/img/thumbs/tone/muted-color.jpg',
    },
    { label: 'پاستل', value: 'pastel', image: '/img/thumbs/tone/pastel.jpg' },
    {
        label: 'تن گرم',
        value: 'warmTone',
        image: '/img/thumbs/tone/warm-tone.jpg',
    },
]

export const lightingOptions = [
    {
        label: 'بدون نورپردازی',
        value: 'noLighting',
        icon: <TbBan />,
        isIcon: true,
    },
    {
        label: 'نورپردازی پشت',
        value: 'backLighting',
        image: '/img/thumbs/lighting/back-lighting.jpg',
    },
    {
        label: 'دراماتیک',
        value: 'dramatic',
        image: '/img/thumbs/lighting/dramatic.jpg',
    },
    {
        label: 'ساعت طلایی',
        value: 'goldenHour',
        image: '/img/thumbs/lighting/golden-hour.jpg',
    },
    { label: 'سخت', value: 'harsh', image: '/img/thumbs/lighting/harsh.jpg' },
    {
        label: 'نوردهی طولانی',
        value: 'longExpose',
        image: '/img/thumbs/lighting/long-expose.jpg',
    },
    {
        label: 'نور کم',
        value: 'lowLight',
        image: '/img/thumbs/lighting/low-light.jpg',
    },
    {
        label: 'نوردهی چندگانه',
        value: 'multiExpose',
        image: '/img/thumbs/lighting/multi-expose.jpg',
    },
    {
        label: 'استودیو',
        value: 'studio',
        image: '/img/thumbs/lighting/studio.jpg',
    },
    {
        label: 'سورئال',
        value: 'sunreal',
        image: '/img/thumbs/lighting/sunreal.jpg',
    },
]

export const cameraOptions = [
    { label: 'بدون دوربین', value: 'noCamera', icon: <TbBan />, isIcon: true },
    {
        label: 'نمای نزدیک',
        value: 'closeUp',
        image: '/img/thumbs/camera/close-up.jpg',
    },
    {
        label: 'جزئیات',
        value: 'detailed',
        image: '/img/thumbs/camera/detailed.jpg',
    },
    {
        label: 'چشم‌انداز',
        value: 'landscape',
        image: '/img/thumbs/camera/landscape.jpg',
    },
    {
        label: 'عکس از بالا',
        value: 'shotFromAbove',
        image: '/img/thumbs/camera/shot-from-above.jpg',
    },
    {
        label: 'عکس از پایین',
        value: 'shotFromBelow',
        image: '/img/thumbs/camera/shot-from-below.jpg',
    },
    {
        label: 'از طریق پنجره',
        value: 'throughWindow',
        image: '/img/thumbs/camera/through-window.jpg',
    },
    {
        label: 'زاویه باز',
        value: 'wideAngle',
        image: '/img/thumbs/camera/wide-angle.jpg',
    },
]
