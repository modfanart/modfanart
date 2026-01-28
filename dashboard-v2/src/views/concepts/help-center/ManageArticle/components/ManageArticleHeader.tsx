import ArticleListSearch from './ArticleListSearch'
import ArticleTableFilter from './ArticleTableFilter'

const ManageArticleHeader = () => {
    return (
        <div className="mb-6">
            <h3>مدیریت مقاله</h3>
            <div className="flex items-center justify-between gap-4 mt-4">
                <ArticleListSearch />
                <ArticleTableFilter />
            </div>
        </div>
    )
}

export default ManageArticleHeader
