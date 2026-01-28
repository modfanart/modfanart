import Card from '@/components/ui/Card'
import Container from '@/components/shared/Container'
import ActionLink from '@/components/shared/ActionLink'
import AntDesignIcons from './AntDesignIcons'
import BootstrapIcons from './BootstrapIcons'
import BoxIcons from './BoxIcons'
import CircumIcons from './CircumIcons'
import CssGg from './CssGg'
import DeviIcons from './DeviIcons'
import Feather from './Feather'
import FlatColorIcons from './FlatColorIcons'
import FontAwesome5 from './FontAwesome5'
import FontAwesome6 from './FontAwesome6'
import GameIcons from './GameIcons'
import GithubOcticonsIcons from './GithubOcticonsIcons'
import GrommetIcons from './GrommetIcons'
import HeroIcons from './HeroIcons'
import HeroIcons2 from './HeroIcons2'
import IcoMoonFree from './IcoMoonFree'
import Icon8LineAwesome from './Icon8LineAwesome'
import Ionicons4 from './Ionicons4'
import Ionicons5 from './Ionicons5'
import LucideIcons from './LucideIcons'
import MaterialDesignIcons from './MaterialDesignIcons'
import PhosphorIcons from './PhosphorIcons'
import RadixIcons from './RadixIcons'
import RemixIcons from './RemixIcons'
import SimpleIcons from './SimpleIcons'
import SimpleLineIcons from './SimpleLineIcons'
import TablerIcons from './TablerIcons'
import ThemifyIcons from './ThemifyIcons'
import Typicons from './Typicons'
import VsCodeIcons from './VsCodeIcons'
import WeatherIcons from './WeatherIcons'

import type { CommonProps } from '@/@types/common'

interface IconSetWrapperProps extends CommonProps {
    name?: string
    url: string
}

const IconSetWrapper = ({ children, name, url }: IconSetWrapperProps) => {
    return (
        <a href={url} target="_blank" rel="noopener noreferrer">
            <Card
                clickable
                className="hover:shadow-lg transition duration-150 ease-in-out hover:dark:border-gray-400"
                bodyClass="bg-gray-100 dark:bg-gray-700 rounded-xl p-3"
                bordered={false}
            >
                <div className="px-2 rounded-xl bg-white dark:bg-gray-800 py-4">
                    {children}
                </div>
                <div className="text-center mt-4">
                    <h6 className="font-bold">{name}</h6>
                </div>
            </Card>
        </a>
    )
}

const iconSets = [
    {
        name: 'Ant Design Icons',
        url: 'https://react-icons.github.io/react-icons/icons/ai',
        render: () => <AntDesignIcons />,
    },
    {
        name: 'Bootstrap Icons',
        url: 'https://react-icons.github.io/react-icons/icons/bs',
        render: () => <BootstrapIcons />,
    },
    {
        name: 'BoxIcons',
        url: 'https://react-icons.github.io/react-icons/icons/bi',
        render: () => <BoxIcons />,
    },
    {
        name: 'CircumIcons',
        url: 'https://react-icons.github.io/react-icons/icons/ci',
        render: () => <CircumIcons />,
    },
    {
        name: 'CircumIcons',
        url: 'https://react-icons.github.io/react-icons/icons/cg',
        render: () => <CssGg />,
    },
    {
        name: 'DeviIcons',
        url: 'https://react-icons.github.io/react-icons/icons/di',
        render: () => <DeviIcons />,
    },
    {
        name: 'Feather',
        url: 'https://react-icons.github.io/react-icons/icons/fi',
        render: () => <Feather />,
    },
    {
        name: 'Flat Color Icons',
        url: 'https://react-icons.github.io/react-icons/icons/fc',
        render: () => <FlatColorIcons />,
    },
    {
        name: 'Font Awesome 5',
        url: 'https://react-icons.github.io/react-icons/icons/fa',
        render: () => <FontAwesome5 />,
    },
    {
        name: 'Font Awesome 6',
        url: 'https://react-icons.github.io/react-icons/icons/fa6',
        render: () => <FontAwesome6 />,
    },
    {
        name: 'Game Icons',
        url: 'https://react-icons.github.io/react-icons/icons/gi',
        render: () => <GameIcons />,
    },
    {
        name: 'Github Octicons icons',
        url: 'https://react-icons.github.io/react-icons/icons/go',
        render: () => <GithubOcticonsIcons />,
    },
    {
        name: 'Grommet-Icons',
        url: 'https://react-icons.github.io/react-icons/icons/gr',
        render: () => <GrommetIcons />,
    },
    {
        name: 'Heroicons',
        url: 'https://react-icons.github.io/react-icons/icons/hi',
        render: () => <HeroIcons />,
    },
    {
        name: 'Heroicons 2',
        url: 'https://react-icons.github.io/react-icons/icons/hi2',
        render: () => <HeroIcons2 />,
    },
    {
        name: 'IcoMoon Free',
        url: 'https://react-icons.github.io/react-icons/icons/im',
        render: () => <IcoMoonFree />,
    },
    {
        name: 'Icon8 Line Awesome',
        url: 'https://react-icons.github.io/react-icons/icons/lia',
        render: () => <Icon8LineAwesome />,
    },
    {
        name: 'Ionicons 4',
        url: 'https://react-icons.github.io/react-icons/icons/io',
        render: () => <Ionicons4 />,
    },
    {
        name: 'Ionicons 5',
        url: 'https://react-icons.github.io/react-icons/icons/io5',
        render: () => <Ionicons5 />,
    },
    {
        name: 'Lucide',
        url: 'https://react-icons.github.io/react-icons/icons/lu',
        render: () => <LucideIcons />,
    },
    {
        name: 'Material Design Icons',
        url: 'https://react-icons.github.io/react-icons/icons/md',
        render: () => <MaterialDesignIcons />,
    },
    {
        name: 'Phosphor Icons',
        url: 'https://react-icons.github.io/react-icons/icons/pi',
        render: () => <PhosphorIcons />,
    },
    {
        name: 'Radix Icons',
        url: 'https://react-icons.github.io/react-icons/icons/rx',
        render: () => <RadixIcons />,
    },
    {
        name: 'Remix Icons',
        url: 'https://react-icons.github.io/react-icons/icons/ri',
        render: () => <RemixIcons />,
    },
    {
        name: 'Simple Icons',
        url: 'https://react-icons.github.io/react-icons/icons/si',
        render: () => <SimpleIcons />,
    },
    {
        name: 'Simple Line Icons',
        url: 'https://react-icons.github.io/react-icons/icons/sl',
        render: () => <SimpleLineIcons />,
    },
    {
        name: 'Tabler Icons',
        url: 'https://react-icons.github.io/react-icons/icons/tb',
        render: () => <TablerIcons />,
    },
    {
        name: 'Themify Icons',
        url: 'https://react-icons.github.io/react-icons/icons/tfi',
        render: () => <ThemifyIcons />,
    },
    {
        name: 'Typicons',
        url: 'https://react-icons.github.io/react-icons/icons/ti',
        render: () => <Typicons />,
    },
    {
        name: 'VsCodeIcons',
        url: 'https://react-icons.github.io/react-icons/icons/vsc',
        render: () => <VsCodeIcons />,
    },
    {
        name: 'Weather Icons',
        url: 'https://react-icons.github.io/react-icons/icons/wi',
        render: () => <WeatherIcons />,
    },
]

const Icons = () => {
    return (
        <Container>
            <div className="text-center mb-8">
                <h2 className="mb-2">آیکن‌های React</h2>
                <p className="max-w-xl mx-auto">
                    <ActionLink
                        href="https://react-icons.github.io/react-icons"
                        target="_blank"
                    >
                        react-icons
                    </ActionLink>
                    {` `}شامل مجموعه‌های متعددی از آیکن‌های محبوب است که از واردات ES6 استفاده می‌کند و به شما این امکان را می‌دهد که تنها آیکن‌های مورد نیاز خود را وارد کنید.
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-[1200px] mx-auto">
                {iconSets.map(({ name, render, url }) => (
                    <IconSetWrapper key={name} name={name} url={url}>
                        {render()}
                    </IconSetWrapper>
                ))}
            </div>
        </Container>
    )
}

export default Icons
