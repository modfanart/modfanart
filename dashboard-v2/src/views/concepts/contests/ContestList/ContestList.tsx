// src/views/contests/ContestList.tsx  (or wherever you place your list page)

import ContestListHeader from './components/ContestListHeader'
import ContestListContent from './components/ContestListContent'

const ContestList = () => {
    return (
        <div className="container mx-auto px-4 py-6 md:py-8">
            {/* Header with title + "Create Contest" button + creation dialog */}
            <ContestListHeader />

            {/* Main content: favorite contests (cards) + other contests (list rows) */}
            <ContestListContent />
        </div>
    )
}

export default ContestList
