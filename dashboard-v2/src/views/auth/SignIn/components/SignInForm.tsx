// src/components/auth/SignInForm.tsx
import { useState } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { FormItem, Form } from '@/components/ui/Form'
import PasswordInput from '@/components/shared/PasswordInput'
import classNames from '@/utils/classNames'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { ZodType } from 'zod'
import type { CommonProps } from '@/@types/common'
import type { ReactNode } from 'react'

// ─── Import RTK Query login mutation ───
import { useLoginMutation } from '@/services/authApi'
interface SignInFormProps extends CommonProps {
    disableSubmit?: boolean
    passwordHint?: string | ReactNode
    setMessage?: (message: string) => void
    onSuccess?: () => void // optional: redirect, close modal, etc.
}

type SignInFormSchema = {
    email: string
    password: string
}

const validationSchema: ZodType<SignInFormSchema> = z.object({
    email: z
        .string({ required_error: 'Please enter your email' })
        .min(1, { message: 'Please enter your email' })
        .email({ message: 'Invalid email format' }),

    password: z
        .string({ required_error: 'Please enter your password' })
        .min(1, { message: 'Please enter your password' }),
})

const SignInForm = (props: SignInFormProps) => {
    const [isSubmitting, setSubmitting] = useState<boolean>(false)

    const {
        disableSubmit = false,
        className,
        setMessage,
        passwordHint,
        onSuccess,
    } = props

    const [login, { isLoading: isLoginLoading }] = useLoginMutation()

    const {
        handleSubmit,
        formState: { errors },
        control,
        reset,
    } = useForm<SignInFormSchema>({
        defaultValues: {
            email: 'admin-01@ecme.com',
            password: '123Qwe',
        },
        resolver: zodResolver(validationSchema),
    })

    const onSignIn = async (values: SignInFormSchema) => {
        if (disableSubmit) return

        setSubmitting(true)

        try {
            const response = await login({
                email: values.email,
                password: values.password,
            }).unwrap()

            // Success → RTK Query + your baseQueryWithReauth should have already:
            // • Stored the token(s)
            // • Updated auth slice via setCredentials (if you dispatch inside baseQuery)
            // • Invalidated 'CurrentUser' tag

            setMessage?.('Signed in successfully!')
            reset() // optional: clear sensitive fields
            onSuccess?.() // e.g. redirect to dashboard, close modal, etc.
        } catch (err: any) {
            let errorMessage = 'Login failed. Please try again.'

            if (err?.data?.message) {
                errorMessage = err.data.message
            } else if (err?.status === 401) {
                errorMessage = 'Invalid email or password'
            } else if (err?.status === 403) {
                errorMessage = 'Account not verified or suspended'
            }

            setMessage?.(errorMessage)
            console.error('[SignInForm]', err)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className={className}>
            <Form onSubmit={handleSubmit(onSignIn)}>
                <FormItem
                    label="Email"
                    invalid={Boolean(errors.email)}
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
                    invalid={Boolean(errors.password)}
                    errorMessage={errors.password?.message}
                    className={classNames(
                        passwordHint && 'mb-0',
                        errors.password?.message && 'mb-8',
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
                    loading={isSubmitting || isLoginLoading}
                    variant="solid"
                    type="submit"
                >
                    {isSubmitting || isLoginLoading
                        ? 'Signing in...'
                        : 'Sign In'}
                </Button>
            </Form>
        </div>
    )
}

export default SignInForm
