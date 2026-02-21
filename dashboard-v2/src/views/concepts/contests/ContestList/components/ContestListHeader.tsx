// src/views/contests/ContestListHeader.tsx

import { useState } from 'react'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import NewContestForm from './NewContestForm' // ← you'll need to create this
import { useGetContestsQuery } from '@/services/contestsApi'
import contestsApi from '@/services/contestsApi' // optional – for manual invalidation

const ContestListHeader = () => {
    const [dialogOpen, setDialogOpen] = useState(false)

    // Optional: if you want to manually refetch after creation
    const { refetch } = useGetContestsQuery({})

    // Alternative: use mutation hook directly in NewContestForm (recommended)
    // const [createContest] = contestsApi.endpoints.createContest.useMutation()

    const handleContestCreated = () => {
        setDialogOpen(false)
        refetch() // simple refresh — better to use tag invalidation in real app
    }

    return (
        <>
            <div className="flex items-center justify-between gap-4 mb-6">
                <h3>Contests</h3>
                <div>
                    <Button variant="solid" onClick={() => setDialogOpen(true)}>
                        Create New Contest
                    </Button>
                </div>
            </div>

            <Dialog
                isOpen={dialogOpen}
                onClose={() => setDialogOpen(false)}
                // Optional: make dialog wider for form
                // contentClassName="max-w-4xl"
            >
                <div className="px-2 sm:px-6 pb-6">
                    <h4 className="mb-5 text-xl font-bold">Add New Contest</h4>
                    <NewContestForm
                        onClose={handleContestCreated}
                        // Alternative: handle submission here instead of inside form
                        // onSubmit={async (values) => {
                        //     await createContest(values).unwrap()
                        //     handleContestCreated()
                        // }}
                    />
                </div>
            </Dialog>
        </>
    )
}

export default ContestListHeader
