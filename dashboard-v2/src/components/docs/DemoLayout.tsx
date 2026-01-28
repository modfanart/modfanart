import Container from '@/components/shared/Container'
import Affix from '@/components/shared/Affix'
import DemoCard from './DemoCard'
import DemoTitleSection from './DemoTitleSection'
import DemoComponentApi from './DemoComponentApi'
// eslint-disable-next-line import/named
import { Link } from 'react-scroll'
import type { DemoComponentApiProps } from './DemoComponentApi'
import type { ReactNode } from 'react'

type Demo = {
    mdName: string
    mdPath: string
    title: string
    desc: string
    component: JSX.Element
}

interface DemoLayoutProps extends DemoComponentApiProps {
    demos?: Demo[]
    header?: {
        title?: string
        desc?: string
    }
    demoCardClass?: string
    hideFooter?: boolean
    extra?: ReactNode | string
    note?: ReactNode | string
    mdPrefixPath?: string
    innerFrame?: boolean
}

const DemoLayout = (props: DemoLayoutProps) => {
    const {
        demos = [],
        header = {},
        api,
        demoCardClass,
        hideApiTitle,
        hideFooter,
        extra,
        note,
        mdPrefixPath,
        keyText,
    } = props
    return (
        <Container>
            <div>
                <div className="grid grid-cols-1 xl:grid-cols-5 gap-12">
                    <div className="xl:col-span-4">
                        <DemoTitleSection
                            className="mb-10"
                            title={header.title}
                            desc={header.desc}
                        />
                        {demos.map((card) => (
                            <div key={card.mdName} id={card.mdName}>
                                <DemoCard
                                    title={card.title}
                                    desc={card.desc}
                                    mdName={card.mdName}
                                    mdPath={card.mdPath}
                                    mdPrefixPath={mdPrefixPath}
                                    demoComponent={card.component}
                                    cardClass={demoCardClass}
                                    hideFooter={hideFooter}
                                />
                            </div>
                        ))}
                        {note && <div className="mt-10">{note}</div>}
                        {api && (
                            <div className="mt-10" id="api">
                                <DemoComponentApi
                                    hideApiTitle={hideApiTitle}
                                    api={api}
                                    keyText={keyText}
                                />
                            </div>
                        )}
                        {extra && <div className="mt-10">{extra}</div>}
                    </div>
                    <div className="hidden xl:block">
                        <Affix offset={80}>
                            <h6 className="heading-text font-bold uppercase tracking-wide mb-3 text-sm lg:text-xs">
                                فهرست مطالب
                            </h6>
                            <ul className="text-gray-500 dark:text-gray-400 font-medium ltr:border-l rtl:border-r border-gray-200 dark:border-gray-700 px-4">
                                {demos.map((link) => (
                                    <li
                                        key={`anchor${link.mdName}`}
                                        className="relative"
                                    >
                                        <Link
                                            activeClass="text-gray-900 dark:text-gray-50 after:content-[''] after:absolute after:-left-[18px] after:bg-primary after:w-[3px] after:h-5"
                                            className="cursor-pointer block transform transition-colors duration-200 py-2 hover:text-gray-900 dark:hover:text-gray-100"
                                            to={link.mdName}
                                            spy={true}
                                            smooth={true}
                                            duration={500}
                                            offset={-80}
                                        >
                                            {link.title}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </Affix>
                    </div>
                </div>
            </div>
        </Container>
    )
}

export default DemoLayout
