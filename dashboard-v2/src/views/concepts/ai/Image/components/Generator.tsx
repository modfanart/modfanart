import GeneratorHeader from './GeneratorHeader'
import GeneratorPrompt from './GeneratorPrompt'

const Generator = () => {
    return (
        <>
            <GeneratorHeader />
            <div className="mt-4">
                <GeneratorPrompt />
            </div>
        </>
    )
}

export default Generator
