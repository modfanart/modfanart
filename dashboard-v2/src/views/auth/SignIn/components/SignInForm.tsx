// src/components/auth/SignInForm.tsx
import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { FormItem, Form } from '@/components/ui/Form'
import PasswordInput from '@/components/shared/PasswordInput'
import classNames from '@/utils/classNames'

import { useAuth } from '@/auth'

const validationSchema = z.object({
    email: z
        .string()
        .min(1, 'Please enter your email')
        .email('Invalid email format'),
    password: z.string().min(1, 'Please enter your password'),
})

type SignInFormSchema = z.infer<typeof validationSchema>

interface SignInFormProps {
    disableSubmit?: boolean
    passwordHint?: string | React.ReactNode
    setMessage: (msg: string) => void
    className?: string
}

const SignInForm = ({
    disableSubmit = false,
    passwordHint,
    setMessage,
    className,
}: SignInFormProps) => {
    const { signIn, isLoading } = useAuth()
    const [submitting, setSubmitting] = useState(false)

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<SignInFormSchema>({
        resolver: zodResolver(validationSchema),
        defaultValues: {
            email: 'admin-01@ecme.com',
            password: '123Qwe',
        },
    })

    const onSubmit = async (values: SignInFormSchema) => {
        if (disableSubmit || submitting) return
        setSubmitting(true)
        setMessage('')

        try {
            const result = await signIn({
                email: values.email,
                password: values.password,
            })
            if (result.status === 'success') {
                setMessage(result.message || 'Signed in successfully!')
                reset()
            } else {
                setMessage(result.message || 'Login failed')
            }
        } catch (err) {
            setMessage('Unexpected error occurred')
            console.error('Sign in error:', err)
        } finally {
            setSubmitting(false)
        }
    }

    const isButtonLoading = submitting || isLoading

    return (
        <div className={className}>
            <Form onSubmit={handleSubmit(onSubmit)}>
                <FormItem
                    label="Email"
                    invalid={!!errors.email}
                    errorMessage={errors.email?.message}
                >
                    <Controller
                        name="email"
                        control={control}
                        render={({ field }) => (
                            <Input
                                type="email"
                                placeholder="Email"
                                autoComplete="email"
                                {...field}
                            />
                        )}
                    />
                </FormItem>

                <FormItem
                    label="Password"
                    invalid={!!errors.password}
                    errorMessage={errors.password?.message}
                    className={classNames(
                        passwordHint && 'mb-0',
                        errors.password && 'mb-8',
                    )}
                >
                    <Controller
                        name="password"
                        control={control}
                        render={({ field }) => (
                            <PasswordInput
                                placeholder="Password"
                                autoComplete="current-password"
                                {...field}
                            />
                        )}
                    />
                </FormItem>

                {passwordHint}

                <Button
                    block
                    loading={isButtonLoading}
                    variant="solid"
                    type="submit"
                    disabled={isButtonLoading || disableSubmit}
                >
                    {isButtonLoading ? 'Signing in...' : 'Sign In'}
                </Button>
            </Form>
        </div>
    )
}

export default SignInForm
