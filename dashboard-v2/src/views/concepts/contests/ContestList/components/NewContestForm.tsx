import { useState } from 'react'
import { FormItem, Form } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import Avatar from '@/components/ui/Avatar'
import hooks from '@/components/ui/hooks'
import NewTaskField from './NewTaskField'
import { useProjectListStore } from '../store/projectListStore'
import { useForm, Controller } from 'react-hook-form'
import { apiPostProject } from '@/services/ProjectService'
import { TbChecks } from 'react-icons/tb'
import { components } from 'react-select'
import cloneDeep from 'lodash/cloneDeep'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { MemberListOption, Member, Project } from '../types'
import type { ZodType } from 'zod'
import type { MultiValueGenericProps, OptionProps } from 'react-select'

type FormSchema = {
    title: string
    content: string
    assignees: {
        img: string
        value: string
        label: string
    }[]
}

type TaskCount = {
    completedTask?: number
    totalTask?: number
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
            className={`flex items-center justify-between p-2 ${
                isSelected
                    ? 'bg-gray-100 dark:bg-gray-500'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-600'
            }`}
            {...innerProps}
        >
            <div className="flex items-center gap-2">
                <Avatar shape="circle" size={20} src={data.img} />
                <span className="font-semibold heading-text">{label}</span>
            </div>
            {isSelected && <TbChecks className="text-emerald-500 text-xl" />}
        </div>
    )
}

const CustomControlMulti = ({ children, ...props }: MultiValueGenericProps) => {
    const { img } = props.data

    return (
        <MultiValueLabel {...props}>
            <div className="inline-flex items-center">
                <Avatar
                    className="mr-2 rtl:ml-2"
                    shape="circle"
                    size={15}
                    src={img}
                />
                {children}
            </div>
        </MultiValueLabel>
    )
}

const validationSchema: ZodType<FormSchema> = z.object({
    title: z.string().min(1, { message: 'عنوان الزامی است' }),
    content: z.string().min(1, { message: 'محتوا الزامی است' }),
    assignees: z.array(
        z.object({ value: z.string(), label: z.string(), img: z.string() }),
    ),
})

const NewProjectForm = ({ onClose }: { onClose: () => void }) => {
    const { memberList, updateProjectList } = useProjectListStore()

    const newId = useUniqueId()

    const [taskCount, setTaskCount] = useState<TaskCount>({})
    const [isSubmiting, setSubmiting] = useState(false)

    const {
        handleSubmit,
        formState: { errors },
        control,
    } = useForm<FormSchema>({
        defaultValues: {
            title: '',
            content: '',
            assignees: [],
        },
        resolver: zodResolver(validationSchema),
    })

    const handleAddNewTask = (count: TaskCount) => {
        setTaskCount(count)
    }

    const onSubmit = async (formValue: FormSchema) => {
        setSubmiting(true)
        const { title, content, assignees } = formValue

        const { totalTask, completedTask } = taskCount

        const member: Member[] = cloneDeep(assignees).map((assignee) => {
            return {
                name: assignee.label,
                img: assignee.img,
            }
        })

        const values: Project = {
            id: newId,
            name: title,
            desc: content,
            totalTask: totalTask as number,
            completedTask: completedTask as number,
            progression:
                ((completedTask as number) / (totalTask as number)) * 100 || 0,
            member,
        }

        updateProjectList(values)
        await apiPostProject(values)
        setSubmiting(false)
        onClose()
    }

    return (
        <Form onSubmit={handleSubmit(onSubmit)}>
            <FormItem
                label="عنوان"
                invalid={Boolean(errors.title)}
                errorMessage={errors.title?.message}
            >
                <Controller
                    name="title"
                    control={control}
                    render={({ field }) => (
                        <Input type="text" autoComplete="off" {...field} />
                    )}
                />
            </FormItem>
            <FormItem
                label="مسئولین"
                invalid={Boolean(errors.assignees)}
                errorMessage={errors.assignees?.message}
            >
                <Controller
                    name="assignees"
                    control={control}
                    render={({ field }) => (
                        <Select<MemberListOption, true>
                            placeholder='انتخاب کنید...'
                            isMulti
                            className="min-w-[120px]"
                            components={{
                                Option: CustomSelectOption,
                                MultiValueLabel: CustomControlMulti,
                            }}
                            value={field.value}
                            options={memberList as MemberListOption[]}
                            onChange={field.onChange}
                        />
                    )}
                />
            </FormItem>
            <FormItem
                label="محتوا"
                invalid={Boolean(errors.content)}
                errorMessage={errors.content?.message}
            >
                <Controller
                    name="content"
                    control={control}
                    render={({ field }) => (
                        <Input textArea autoComplete="off" {...field} />
                    )}
                />
            </FormItem>
            <NewTaskField onAddNewTask={handleAddNewTask} />
            <Button block variant="solid" type="submit" loading={isSubmiting}>
                ارسال
            </Button>
        </Form>
    )
}

export default NewProjectForm
