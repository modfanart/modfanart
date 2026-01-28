import { useState, useEffect } from 'react'
import StickyFooter from '@/components/shared/StickyFooter'
import Button from '@/components/ui/Button'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { useManageArticleStore } from '../store/manageArticleStore'
import useManageArticle from '../hooks/useManageArticle'
import { TbChecks } from 'react-icons/tb'
import classNames from '@/utils/classNames'

const ArticleListSelected = () => {
    const { articleList, mutate, articleTotal } = useManageArticle()

    const selectedArticle = useManageArticleStore(
        (state) => state.selectedArticle,
    )
    const setSelectAllArticle = useManageArticleStore(
        (state) => state.setSelectAllArticle,
    )

    const hasSelectedArticle = selectedArticle.length > 0

    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false)

    const handleDelete = () => {
        setDeleteConfirmationOpen(true)
    }

    const handleCancel = () => {
        setDeleteConfirmationOpen(false)
    }

    const handleConfirmDelete = () => {
        const newArticleList = articleList.filter((article) => {
            return !selectedArticle.some(
                (selected) => selected.id === article.id,
            )
        })
        setSelectAllArticle([])
        mutate(
            {
                list: newArticleList,
                total: articleTotal - selectedArticle.length,
            },
            false,
        )
        setDeleteConfirmationOpen(false)
    }

    useEffect(() => {
        if (hasSelectedArticle) {
            window.scrollBy({
                top: 20,
                left: 0,
                behavior: 'smooth',
            })
        }
    }, [hasSelectedArticle])

    return (
        <>
            <StickyFooter
                className={classNames(
                    'flex items-center justify-between py-4 bg-white dark:bg-gray-800',
                    !hasSelectedArticle && 'hidden',
                )}
                stickyClass="border-t border-gray-200 dark:border-gray-700 px-8 -mx-4 sm:-mx-8"
                defaultClass="container mx-auto px-8 rounded-xl border border-gray-200 dark:border-gray-600 mt-4"
            >
                <div className="container mx-auto">
                    <div className="flex items-center justify-between">
                        <span>
                            {selectedArticle.length > 0 && (
                                <span className="flex items-center gap-2">
                                    <span className="text-lg text-primary">
                                        <TbChecks />
                                    </span>
                                    <span className="font-semibold flex items-center gap-1">
                                        <span className="heading-text">
                                            {selectedArticle.length} مقالات
                                        </span>
                                        <span>انتخاب شده</span>
                                    </span>
                                </span>
                            )}
                        </span>

                        <div className="flex items-center">
                            <Button
                                size="sm"
                                className="ltr:mr-3 rtl:ml-3"
                                type="button"
                                customColorClass={() =>
                                    'border-error ring-1 ring-error text-error hover:border-error hover:ring-error hover:text-error'
                                }
                                onClick={handleDelete}
                            >
                                حذف
                            </Button>
                        </div>
                    </div>
                </div>
            </StickyFooter>
            <ConfirmDialog
                isOpen={deleteConfirmationOpen}
                type="danger"
                title="حذف مقالات"
                onClose={handleCancel}
                onRequestClose={handleCancel}
                onCancel={handleCancel}
                onConfirm={handleConfirmDelete}
            >
                <p>
                    {''}
                    آیا مطمئن هستید که می خواهید این مقالات را حذف کنید؟ این اقدام
                    قابل واگرد نیست.{' '}
                </p>
            </ConfirmDialog>
        </>
    )
}

export default ArticleListSelected
