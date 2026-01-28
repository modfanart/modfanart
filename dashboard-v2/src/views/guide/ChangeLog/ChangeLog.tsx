import Container from '@/components/shared/Container'
import type { ReactNode } from 'react'

type Log = {
    version: string
    date: string
    updateContent: string[]
}

type LogProps = Omit<Log, 'updateContent'> & {
    border?: boolean
    children?: ReactNode
}

const logData: Log[] = [
    {
        version: '1.0.4',
        date: '18 Oct 2024',
        updateContent: [
            `[Fixed] missing .env file in both starter & demo version.`,
            `[Fixed] error message overflows the border when the content is too long in all auth pages.`,
        ],
    },
    {
        version: '1.0.3',
        date: '07 Oct 2024',
        updateContent: [
            `[Fixed] chart not resize when parent element resize.`
        ],
    },
    {
        version: '1.0.2',
        date: '01 Oct 2024',
        updateContent: [
            `[Fixed] invisible configuration panel in blank layout.`
        ],
    },
    {
        version: '1.0.1',
        date: '28 Sep 2024',
        updateContent: [`[Fixed] token retrieve from localStorage instead of sessionStorage when accessTokenPersistStrategy is 'sessionStorage'.`],
    },
    {
        version: '1.0.0',
        date: '27 Sep 2024',
        updateContent: ['[Release] Initial Release.'],
    },
]

const Log = (props: LogProps) => {
    return (
        <div className={`py-4 ${props.border && 'border-bottom'}`}>
            <div className="flex items-center">
                <h5 className="font-weight-normal mb-0 mr-3">
                    {props.version}
                </h5>
                <code>{props.date}</code>
            </div>
            <div className="api-container p-0 border-0 mt-3">
                {props.children}
            </div>
        </div>
    )
}

const Changelog = () => {
    return (
        <Container>
            <div>
                <h4>Changelog</h4>
                {logData.map((elm) => (
                    <Log
                        key={elm.version}
                        version={`v${elm.version}`}
                        date={elm.date}
                    >
                        {elm.updateContent.length > 0 ? (
                            <ul>
                                {elm.updateContent.map((item, i) => (
                                    <li key={i}>- {item}</li>
                                ))}
                            </ul>
                        ) : null}
                    </Log>
                ))}
            </div>
        </Container>
    )
}

export default Changelog
