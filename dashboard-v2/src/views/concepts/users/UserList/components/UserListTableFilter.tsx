// src/features/users/components/UserListTableFilter.tsx
import { useState } from 'react'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import Checkbox from '@/components/ui/Checkbox'
import { Form, FormItem } from '@/components/ui/Form'
import { TbFilter } from 'react-icons/tb'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { ZodType } from 'zod'

type FormSchema = {
    status: string // '' = all
    roles: string[] // selected role names / ids
}

const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'suspended', label: 'Suspended' },
    { value: 'pending_verification', label: 'Pending Verification' },
    { value: 'deactivated', label: 'Deactivated' },
]

const roleOptions = [
    'admin',
    'moderator',
    'user',
    'guest',
    // Add more roles based on your actual system
]

const validationSchema: ZodType<FormSchema> = z.object({
    status: z.string(),
    roles: z.array(z.string()),
})

type UserListTableFilterProps = {
    // Recommended: controlled from parent
    onApply?: (filters: FormSchema) => void
}

const UserListTableFilter = ({ onApply }: UserListTableFilterProps) => {
    const [isOpen, setIsOpen] = useState(false)

    const form = useForm<FormSchema>({
        resolver: zodResolver(validationSchema),
        defaultValues: {
            status: '',
            roles: [],
        },
    })

    const { handleSubmit, control, reset } = form

    const onSubmit = (values: FormSchema) => {
        // Normalize empty status to undefined (API-friendly)
        const clean = {
            ...values,
            status: values.status || undefined,
        }
        onApply?.(clean)
        setIsOpen(false)
    }

    const handleReset = () => {
        reset({ status: '', roles: [] })
        onApply?.({ status: undefined, roles: [] })
        setIsOpen(false)
    }

    return (
        <>
            <Button
                icon={<TbFilter className="text-lg" />}
                variant="default"
                onClick={() => setIsOpen(true)}
            >
                Filter Users
            </Button>

            <Dialog
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                onRequestClose={() => setIsOpen(false)}
                width="md"
            >
                <h4 className="mb-5">Filter Users</h4>

                <Form onSubmit={handleSubmit(onSubmit)}>
                    <FormItem label="Account Status">
                        <Controller
                            name="status"
                            control={control}
                            render={({ field }) => (
                                <div className="flex flex-wrap gap-3 mt-2">
                                    {statusOptions.map((opt) => (
                                        <Checkbox
                                            key={opt.value}
                                            checked={field.value === opt.value}
                                            onChange={() =>
                                                field.onChange(opt.value)
                                            }
                                            className="flex items-center gap-2"
                                        >
                                            {opt.label}
                                        </Checkbox>
                                    ))}
                                </div>
                            )}
                        />
                    </FormItem>

                    <FormItem label="Roles" className="mt-6">
                        <Controller
                            name="roles"
                            control={control}
                            render={({ field }) => (
                                <Checkbox.Group
                                    vertical
                                    className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2"
                                    {...field}
                                >
                                    {roleOptions.map((role) => (
                                        <Checkbox
                                            key={role}
                                            value={role}
                                            className="justify-between flex-row-reverse heading-text"
                                        >
                                            {role === 'admin'
                                                ? 'Admin'
                                                : role === 'moderator'
                                                  ? 'Moderator'
                                                  : role === 'user'
                                                    ? 'Regular User'
                                                    : role === 'guest'
                                                      ? 'Guest'
                                                      : role}
                                        </Checkbox>
                                    ))}
                                </Checkbox.Group>
                            )}
                        />
                    </FormItem>

                    <div className="flex justify-end gap-3 mt-8">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleReset}
                        >
                            Reset
                        </Button>
                        <Button type="submit" variant="solid">
                            Apply Filters
                        </Button>
                    </div>
                </Form>
            </Dialog>
        </>
    )
}

export default UserListTableFilter
