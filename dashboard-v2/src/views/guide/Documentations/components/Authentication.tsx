/* eslint-disable react/no-unescaped-entities */
import SyntaxHighlighter from '@/components/shared/SyntaxHighlighter'
import DemoComponentApi from '@/components/docs/DemoComponentApi'

const Authentication = () => {
    return (
        <>
            <p>
                این راهنما یک نمای کلی از سیستم احراز هویت پیاده‌سازی‌شده در الگو را ارائه می‌دهد.
            </p>
            <div className="mt-10" id="useAuth">
                <h5>useAuth</h5>
                <p className="mt-1">
                    سیستم احراز هویت از طریق کامپوننت{' '}
                    <code>AuthProvider</code> مدیریت می‌شود که باید اپلیکیشن یا بخش‌های مربوطه آن را در بر گیرد.
                    این کامپوننت وضعیت‌های احراز هویت را مدیریت می‌کند و متدهای زیر را از طریق هوک{' '}
                    <code>useAuth</code> فراهم می‌کند:
                </p>
                <DemoComponentApi
                    hideApiTitle
                    keyText="ویژگی‌ها"
                    api={[
                        {
                            api: [
                                {
                                    propName: 'authenticated',
                                    type: `<code>boolean</code>`,
                                    default: `-`,
                                    desc: 'یک مقدار boolean که نشان می‌دهد آیا کاربر در حال حاضر احراز هویت شده است.',
                                },
                                {
                                    propName: 'user',
                                    type: `<code> {
                                    userId: string,
                                    userName: string,
                                    authority: string[],
                                    avatar: string,
                                    email: string
                                }</code>`,
                                    default: `-`,
                                    desc: `یک شی که جزئیات کاربر مانند <code>userName</code>، <code>email</code> و <code>authority</code> را شامل می‌شود.`,
                                },
                                {
                                    propName: 'signIn',
                                    type: `<code>(values: {email: string, password: string}) => Promise<{status: 'success' | 'failed', message: string}></code>`,
                                    default: `-`,
                                    desc: `یک متد برای ورود کاربر با استفاده از اطلاعات احراز هویت.`,
                                },
                                {
                                    propName: 'signUp',
                                    type: `<code>(values: {userName: string, email: string, password: string}) => Promise<{status: 'success' | 'failed', message: string}></code>`,
                                    default: `-`,
                                    desc: `یک متد برای ثبت‌نام یک کاربر جدید.`,
                                },
                                {
                                    propName: 'signOut',
                                    type: `<code>() => void</code>`,
                                    default: `-`,
                                    desc: `یک متد برای خروج از حساب کاربری فعلی.`,
                                },
                                {
                                    propName: 'oAuthSignIn',
                                    type: `<code>callback: (payload: { 
                                    onSignIn: (tokens: Token, user?: User) => void,
                                    redirect: () => void
                                }) => void</code>`,
                                    default: `-`,
                                    desc: `یک متد برای مدیریت بازگشت‌های OAuth برای احراز هویت با سرویس‌دهندگان شخص ثالث.`,
                                },
                            ],
                        },
                    ]}
                />
                <p>این‌طور می‌توانید از هوک useAuth در کامپوننت‌ها استفاده کنید:</p>
                <SyntaxHighlighter language="tsx">{`import { useAuth } from '@/auth'
    
    const YourComponent = () => {
        const { signIn, signOut, user, authenticated } = useAuth();
    
        const handleLogin = async () => {
            const credentials = { email: 'user@example.com', password: 'password' };
            const result = await signIn(credentials);
            if (result?.status === 'success') {
                console.log('ورود موفقیت‌آمیز بود');
            }
            if (result?.status === 'failed') {
                console.error('ورود ناموفق بود')
            }
        };
    
        const handleLogout = () => {
            signOut();
        };
    
        return (
            <div>
                {authenticated ? <p>خوش آمدید، {user.userName}</p> : <p>لطفاً وارد شوید</p>}
                <button onClick={handleLogin}>ورود</button>
                <button onClick={handleLogout}>خروج</button>
            </div>
        );
    };
    `}</SyntaxHighlighter>
            </div>
            <div className="mt-10" id="OAuth">
                <h5>ورود با OAuth</h5>
                <p className="mt-1">
                    اگر شما از OAuth با سرویس‌دهندگان شخص ثالث استفاده می‌کنید، متد{' '}
                    <code>oAuthSignIn</code> ضروری خواهد بود. می‌توانید از آن در درون
                    بازگشت OAuth خود برای تکمیل فرایند ورود و مدیریت توکن‌ها استفاده کنید.
                </p>
                <SyntaxHighlighter language="tsx">{`import { useAuth } from '@/auth'
    import SomeOauthSdkSignInMethod from 'SomeOauthSdk'
    
    const YourComponent = () => {
        const { oAuthSignIn } = useAuth();
    
        const handleOAuthSignIn = () => {
            oAuthSignIn(async ({redirect, onSignIn}) => {
                try {
                    const resp = await SomeOauthSdkSignInMethod()
                    if (resp) {
                        /** استخراج توکن و اطلاعات کاربر از پاسخ */ 
                        const { token, user } = resp
                        onSignIn({accessToken: token}, user)
                        redirect()
                    }
                } catch (error) {
                    console.error('ورود ناموفق بود')
                }
            })
        }
    
        const handleLogout = () => {
            signOut();
        };
    
        return (
            <button onClick={handleOAuthSignIn}>ورود با OAuth</button>
        );
    };
    `}</SyntaxHighlighter>
            </div>
            <div className="mt-10" id="customizing-data-model">
                <h5>سفارشی‌سازی مدل‌های داده</h5>
                <p className="mt-1">
                    از آنجا که همه‌ی برنامه‌ها مدل داده یکسانی ندارند، شما می‌توانید
                    ساختارهای داده را در{' '}
                    <code>@/types/auth.ts</code> و{' '}
                    <code>@/auth/AuthProvider.ts</code> برای متناسب‌سازی با نیازهای خود
                    سفارشی کنید. انواع و رابط‌ها تعریف‌شده برای{' '}
                    <code>User</code>، <code>Token</code> و سایر موجودیت‌های مرتبط با
                    احراز هویت را طبق نیازهای برنامه خود تنظیم کنید.
                </p>
                <SyntaxHighlighter language="ts">{`// مثال: تغییر نوع User
    export type User = {
        userId?: string | null
        avatar?: string | null
        userName?: string | null
        email?: string | null
        authority?: string[]
        // فیلدهای سفارشی خود را اینجا اضافه کنید
        role?: string | null
    };
    `}</SyntaxHighlighter>
                <div className="mt-10" id="useAuth">
                    <h5>ورود به جزئیات AuthProvider</h5>
                    <p className="mt-1">
                        اگر پیاده‌سازی پیش‌فرض احراز هویت نیازهای شما را برآورده نمی‌کند،
                        می‌توانید به درون{' '}
                        <code>AuthProvider</code> بروید و تغییرات لازم را اعمال کنید.
                        این کامپوننت منطق اصلی احراز هویت، از جمله مدیریت توکن‌ها، مدیریت
                        جلسه‌ها و موارد دیگر را مدیریت می‌کند. سفارشی‌سازی این منطق می‌تواند
                        به شما کمک کند که سیستم احراز هویت را متناسب با نیازهای خاص
                        برنامه خود تنظیم کنید.
                    </p>
                    <SyntaxHighlighter language="tsx">{`...
    import { apiSignIn, apiSignOut, apiSignUp } from '@/services/AuthService'
    
    function AuthProvider({ children }: AuthProviderProps) {
        ...
    
        const handleSignIn = (...) => {
            ... /** پیاده‌سازی خود را اینجا انجام دهید */
        }
    
        const handleSignOut = () => {
            ... /** پیاده‌سازی خود را اینجا انجام دهید */
        }
    
        const signIn = async (values: SignInCredential): AuthResult => {
            try {
                const resp = await apiSignIn(values)
                if (resp) {
                    handleSignIn(...)
                }
            } catch (errors: any) {
                return {
                    status: 'failed',
                    message: errors?.response?.data?.message || errors.toString(),
                }
            }
        }
    
        const signOut = async () => {
            try {
                await apiSignOut()
            } finally {
                handleSignOut()
                navigate(appConfig.unAuthenticatedEntryPath)
            }
        }
        ...   
        
        return (
            <AuthContext.Provider value={{
                signIn,
                signOut,
                ...
            }}>
                {children}
            </AuthContext.Provider>
        )
    }
    `}</SyntaxHighlighter>
                </div>
            </div>
        </>
    )
}

export default Authentication
