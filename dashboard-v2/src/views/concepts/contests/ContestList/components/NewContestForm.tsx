// src/views/contests/NewContestForm.tsx

import { useState } from 'react'
import { FormItem, Form } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import Avatar from '@/components/ui/Avatar'
import hooks from '@/components/ui/hooks'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { components } from 'react-select'
import cloneDeep from 'lodash/cloneDeep'
import { TbChecks, TbCalendar, TbUsers } from 'react-icons/tb'
import type { OptionProps, MultiValueGenericProps } from 'react-select'

import { useCreateContestMutation } from '@/services/contestsApi'
import type { Contest } from '@/services/contestsApi'

// ────────────────────────────────────────────────
// Adjust types according to your actual member/user structure
// ────────────────────────────────────────────────
type MemberListOption = {
    value: string // user id
    label: string // username or full name
    img?: string // avatar url
}

type FormSchema = {
    title: string
    description: string
    startDate: string // ISO date string
    submissionEndDate: string // ISO date string
    judges: MemberListOption[] // selected judges
    visibility: 'public' | 'private' | 'unlisted'
    maxEntriesPerUser: number
    // prizes?: ... → can be added later as array field
}

const { MultiValueLabel } = components
const { useUniqueId } = hooks

const CustomSelectOption = ({
    innerProps,
    label,
    data,
    isSelected,
}: OptionProps<MemberListOption>) => {
    return (
        <div
            className={`flex items-center justify-between p-2 cursor-pointer ${
                isSelected
                    ? 'bg-gray-100 dark:bg-gray-600'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
            {...innerProps}
        >
            <div className="flex items-center gap-2">
                <Avatar shape="circle" size={20} src={data.img} />
                <span className="font-medium">{label}</span>
            </div>
            {isSelected && <TbChecks className="text-emerald-500 text-xl" />}
        </div>
    )
}

const CustomMultiValueLabel = ({
    children,
    ...props
}: MultiValueGenericProps) => {
    const { img } = props.data

    return (
        <MultiValueLabel {...props}>
            <div className="inline-flex items-center gap-1.5 py-0.5">
                <Avatar
                    className="rtl:mr-1"
                    shape="circle"
                    size={16}
                    src={img}
                />
                <span>{children}</span>
            </div>
        </MultiValueLabel>
    )
}

const validationSchema = z.object({
    title: z
        .string()
        .min(3, { message: 'Title must be at least 3 characters' }),
    description: z.string().min(10, { message: 'Description is too short' }),
    startDate: z.string().min(1, { message: 'Start date is required' }),
    submissionEndDate: z
        .string()
        .min(1, { message: 'Submission deadline is required' }),
    judges: z
        .array(
            z.object({
                value: z.string(),
                label: z.string(),
                img: z.string().optional(),
            }),
        )
        .min(1, { message: 'Please select at least one judge' }),
    visibility: z.enum(['public', 'private', 'unlisted']),
    maxEntriesPerUser: z
        .number()
        .min(1, { message: 'At least 1 entry per user is allowed' }),
})

interface NewContestFormProps {
    onClose: () => void
    // Optional: onSuccess?: () => void
}

const NewContestForm = ({ onClose }: NewContestFormProps) => {
    const [createContest, { isLoading: isSubmitting }] =
        useCreateContestMutation()

    // Assume you have a list of potential judges (users) — in real app fetch from API
    // For now we simulate / reuse memberList — replace with real data source
    const { memberList } = useProjectListStore() // ← replace with actual hook or query

    const {
        handleSubmit,
        formState: { errors },
        control,
        reset,
    } = useForm<FormSchema>({
        defaultValues: {
            title: '',
            description: '',
            startDate: '',
            submissionEndDate: '',
            judges: [],
            visibility: 'public',
            maxEntriesPerUser: 3,
        },
        resolver: zodResolver(validationSchema),
    })

    const onSubmit = async (values: FormSchema) => {
        try {
            const judges = cloneDeep(values.judges).map((j) => j.value) // just ids

            const payload: Partial<Contest> = {
                title: values.title.trim(),
                description: values.description.trim(),
                start_date: values.startDate,
                submission_end_date: values.submissionEndDate,
                visibility: values.visibility,
                max_entries_per_user: values.maxEntriesPerUser,
                judges: judges.map((judgeId) => ({
                    judge_id: judgeId,
                    accepted: false,
                })),
                status: 'draft', // or 'published' if immediate live
                prizes: [], // can be extended later
                entry_requirements: null,
                judging_criteria: null,
            }

            await createContest(payload).unwrap()

            reset()
            onClose()
            // Optional: toast.success("Contest created successfully")
        } catch (err) {
            console.error('Contest creation failed:', err)
            // toast.error("Failed to create contest")
        }
    }

    return (
        <Form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <FormItem
                label="Contest Title"
                invalid={!!errors.title}
                errorMessage={errors.title?.message}
            >
                <Controller
                    name="title"
                    control={control}
                    render={({ field }) => (
                        <Input
                            placeholder="e.g. Best Advertising Poster 2025"
                            {...field}
                        />
                    )}
                />
            </FormItem>

            <FormItem
                label="Description / Rules"
                invalid={!!errors.description}
                errorMessage={errors.description?.message}
            >
                <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                        <Input
                            textArea
                            rows={4}
                            placeholder="Describe the contest, prizes, entry conditions, judging criteria..."
                            {...field}
                        />
                    )}
                />
            </FormItem>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormItem
                    label="Start Date"
                    invalid={!!errors.startDate}
                    errorMessage={errors.startDate?.message}
                >
                    <Controller
                        name="startDate"
                        control={control}
                        render={({ field }) => (
                            <Input
                                type="date"
                                icon={<TbCalendar />}
                                {...field}
                            />
                        )}
                    />
                </FormItem>

                <FormItem
                    label="Submission Deadline"
                    invalid={!!errors.submissionEndDate}
                    errorMessage={errors.submissionEndDate?.message}
                >
                    <Controller
                        name="submissionEndDate"
                        control={control}
                        render={({ field }) => (
                            <Input
                                type="date"
                                icon={<TbCalendar />}
                                {...field}
                            />
                        )}
                    />
                </FormItem>
            </div>

            <FormItem
                label="Judges"
                invalid={!!errors.judges}
                errorMessage={errors.judges?.message}
            >
                <Controller
                    name="judges"
                    control={control}
                    render={({ field }) => (
                        <Select<MemberListOption, true>
                            isMulti
                            placeholder="Select judges..."
                            components={{
                                Option: CustomSelectOption,
                                MultiValueLabel: CustomMultiValueLabel,
                            }}
                            value={field.value}
                            options={memberList as MemberListOption[]}
                            onChange={field.onChange}
                        />
                    )}
                />
            </FormItem>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormItem label="Visibility" invalid={!!errors.visibility}>
                    <Controller
                        name="visibility"
                        control={control}
                        render={({ field }) => (
                            <Select
                                options={[
                                    { value: 'public', label: 'Public' },
                                    { value: 'private', label: 'Private' },
                                    { value: 'unlisted', label: 'Unlisted' },
                                ]}
                                value={field.value}
                                onChange={field.onChange}
                            />
                        )}
                    />
                </FormItem>

                <FormItem
                    label="Max Entries per User"
                    invalid={!!errors.maxEntriesPerUser}
                    errorMessage={errors.maxEntriesPerUser?.message}
                >
                    <Controller
                        name="maxEntriesPerUser"
                        control={control}
                        render={({ field }) => (
                            <Input
                                type="number"
                                min={1}
                                icon={<TbUsers />}
                                {...field}
                                onChange={(e) =>
                                    field.onChange(Number(e.target.value))
                                }
                            />
                        )}
                    />
                </FormItem>
            </div>

            {/* 
                Future sections you can add:
                - Prizes (dynamic array)
                - Categories
                - Judging Criteria
                - Rules PDF upload
            */}

            <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="plain" onClick={onClose}>
                    Cancel
                </Button>
                <Button
                    type="submit"
                    variant="solid"
                    loading={isSubmitting}
                    icon={<TbChecks />}
                >
                    Create Contest
                </Button>
            </div>
        </Form>
    )
}

export default NewContestForm
