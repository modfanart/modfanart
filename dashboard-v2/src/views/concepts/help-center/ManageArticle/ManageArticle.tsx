import Container from '@/components/shared/Container'
import ManageArticleHeader from './components/ManageArticleHeader'
import ArticleListTable from './components/ArticleListTable'
import ArticleListSelected from './components/ArticleListSelected'

const ManageArticle = () => {
    return (
        <>
            <Container>
                <ManageArticleHeader />
                <ArticleListTable />
            </Container>
            <ArticleListSelected />
            <div className="h-6"></div>
        </>
    )
}

export default ManageArticle
