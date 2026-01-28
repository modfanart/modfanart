/* eslint-disable react/no-unescaped-entities */
import SyntaxHighlighter from '@/components/shared/SyntaxHighlighter'

const FirebaseIntegration = () => {
    return (
        <>
            <p>
                فایر بیس یک پلتفرم توسعه یافته توسط گوگل است که مجموعه‌ای از ابزارها و خدمات را برای کمک به شما در ساخت برنامه‌های موبایل و وب ارائه می‌دهد. این پلتفرم خدماتی مانند احراز هویت، پایگاه داده‌های زمان واقعی، فضای ذخیره‌سازی ابری و هاستینگ را فراهم می‌کند که آن را به انتخابی قدرتمند برای توسعه‌دهندگان تبدیل می‌کند.
            </p>
            <p>
                قالب ما شامل ادغام اولیه فایر بیس است. اگر برنامه شما از فایر بیس استفاده می‌کند، این راهنما به شما کمک می‌کند تا فایر بیس را به راحتی در قالب ادغام کنید.
            </p>

            <div className="mt-10" id="prerequisites">
                <h5>پیش‌نیازها</h5>
                <ul className="mt-1">
                    <li>
                        <p>
                            یک پروژه فایر بیس در کنسول فایر بیس ایجاد کنید.
                        </p>
                        <ol>
                            <li>
                                به{' '}
                                <a target="_new" href="https://console.firebase.google.com/">
                                    کنسول فایر بیس
                                </a>{' '}
                                بروید و یک پروژه جدید ایجاد کنید.
                            </li>
                            <li>
                                پس از راه‌اندازی پروژه، گزینه "وب" را انتخاب کنید تا یک اپلیکیشن وب به پروژه‌تان اضافه کنید.
                            </li>
                            <li>
                                دستورالعمل‌ها را برای ثبت اپلیکیشن و دریافت شیء پیکربندی فایر بیس دنبال کنید.
                            </li>
                        </ol>
                    </li>
                </ul>
            </div>

            <div className="mt-10" id="setup-firebase-config">
                <h5>پیکربندی فایر بیس</h5>
                <ul>
                    <li>
                        <p>
                            به فایل <code>firebase.config.ts</code> در دایرکتوری <code>/configs</code> بروید. اطلاعات پیکربندی فایر بیس خود را در این فایل قرار دهید که می‌توانید آن را در کنسول فایر بیس پیدا کنید. برای امنیت بیشتر، توصیه می‌شود این مقادیر را در فایل <code>.env</code> ذخیره کنید.
                        </p>
                        <SyntaxHighlighter language="js">{`const firebaseConfig = {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
    };
    
    export default firebaseConfig`}</SyntaxHighlighter>
                    </li>
                    <li>
                        <p>مثال پیکربندی فایر بیس در فایل <code>.env</code>:</p>
                        <SyntaxHighlighter language="js">{`VITE_FIREBASE_API_KEY=xxxxxxxxxxxxxxxxx
    VITE_FIREBASE_AUTH_DOMAIN=xxxxxxxxxx.firebaseapp.com
    VITE_FIREBASE_PROJECT_ID=xxxxxxxxxx
    VITE_FIREBASE_STORAGE_BUCKET=xxxxxxxxxx.appspot.com
    VITE_FIREBASE_MESSAGING_SENDER_ID=xxxxxxxxxx
    VITE_FIREBASE_APP_ID=xxxxxxxxxx
    VITE_FIREBASE_MEASUREMENT_ID=G-xxxxxxxxxx`}</SyntaxHighlighter>
                    </li>
                </ul>
            </div>

            <div className="mt-10" id="initialize-firebase">
                <h5>راه‌اندازی فایر بیس</h5>
                <p>
                    ما یک نمونه ساده از فایر بیس را در{' '}
                    <code>src/services/firebase/FirebaseApp.ts</code> راه‌اندازی کرده‌ایم. این راه‌اندازی به عنوان پایه‌ای برای تنظیم سایر خدمات فایر بیس مانند احراز هویت فایر بیس و فایر بیس فایر استور عمل می‌کند. شما می‌توانید بسته‌های اضافی فایر بیس را به دلخواه اضافه کنید.
                </p>
                <SyntaxHighlighter language="ts">{`import { initializeApp } from "firebase/app"
    
    import firebaseConfig from '@/configs/firebase.config';
    
    const FirebaseApp = initializeApp(firebaseConfig);
    
    export default FirebaseApp`}</SyntaxHighlighter>
            </div>

            <div className="mt-10" id="integrating-firebase">
                <h5>ادغام فایر بیس</h5>
                <p>
                    این بخش شما را از طریق مثال‌هایی برای ورود به سیستم با فایر بیس و بازیابی داده‌ها از فایر بیس راهنمایی می‌کند.
                </p>
                <ul>
                    <li>
                        <strong>ورود به سیستم با فایر بیس</strong>
                        <p>
                            فایر بیس از روش‌های مختلف احراز هویت پشتیبانی می‌کند، از جمله رمز عبور، شماره تلفن و ارائه‌دهندگان شناخته‌شده هویت مانند گوگل، فیسبوک و توییتر.
                        </p>
                        <p>
                            در زیر مثالی از ادغام OAuth گوگل آورده شده است. ابتدا یک فایل به نام{' '}
                            <code>FirebaseGoogleAuth.ts</code> ایجاد کرده و یک متد{' '}
                            <code>signInWithFirebaseGoogle</code> تنظیم کنید:
                        </p>
                        <SyntaxHighlighter language="ts">{`import {
        GoogleAuthProvider,
        signInWithPopup,
    } from 'firebase/auth'
    import FirebaseAuth from './FirebaseAuth';
    
    const googleAuthProvider = new GoogleAuthProvider();
    
    export const signInWithFirebaseGoogle = async () => {
        try {
            const resp = await signInWithPopup(FirebaseAuth, googleAuthProvider);
            const token = await resp.user.getIdToken()
            return {
                token,
                user: resp.user
            }
        } catch (error) {
            throw error
        }
    }`}</SyntaxHighlighter>
                        <p>
                            سپس این متد را در فایل{' '}
                            <code>OAuthService.ts</code> در تابع{' '}
                            <code>apiGoogleOauthSignIn</code> وارد کنید:
                        </p>
                        <SyntaxHighlighter language="ts">{`import { signInWithFirebaseGoogle } from './firebase/FirebaseGoogleAuth'
    
    export async function apiGoogleOauthSignIn() {
        return await signInWithFirebaseGoogle()
    }`}</SyntaxHighlighter>
                        <p>
                            حالا آن را با دکمه ورود خود ادغام کنید. اطمینان حاصل کنید که{' '}
                            <code>apiGoogleOauthSignIn</code> درون متد{' '}
                            <code>oAuthSignIn</code> از هوک{' '}
                            <code>useAuth</code> فراخوانی شود تا وضعیت پس از ورود با OAuth به‌روزرسانی شود.
                        </p>
                        <SyntaxHighlighter language="tsx">{`import Button from '@/components/ui/Button'
    import { useAuth } from '@/auth'
    import { apiGoogleOauthSignIn } from '@/services/OAuthServices'
    
    const OauthSignIn = () => {
    
        const { oAuthSignIn } = useAuth()
    
        const handleGoogleSignIn = async () => {
            oAuthSignIn(async ({redirect, onSignIn}) => {
                try {
                    const resp = await apiGoogleOauthSignIn()
                    if (resp) {
                        const { token, user } = resp
                        onSignIn({accessToken: token}, user)
                        redirect()
                    }
                } catch (error) {
                    console.error(error)
                }
            })
        }
    
        return (
            <Button className="flex-1" onClick={handleGoogleSignIn} type="button">
                <div className="flex items-center justify-center gap-2">
                    <span>ورود با گوگل</span>
                </div>
            </Button>
        )
    }
    
    export default OauthSignIn`}</SyntaxHighlighter>
                    </li>
                    <li>
                        <strong>بازیابی داده‌ها از فایر بیس</strong>
                        <p>
                            در اینجا مثالی از چگونگی بازیابی داده‌ها از فایر بیس فایر استور آورده شده است. در این مثال، داده‌های یک کاربر از پایگاه داده فایر استور بازیابی شده و در یک کامپوننت نمایش داده می‌شود.
                        </p>
                        <SyntaxHighlighter language="tsx">{`import { doc, getDoc } from "firebase/firestore"; 
    import db from "@/services/firebase/FirebaseDB";
    import { useEffect, useState } from "react";
    
    const Example = () => {
    
        const [data, setData] = useState<{firstName?: string, lastName?: string}>({})
    
        useEffect(() => {
            const getData = async () => {
                try {
                    const docRef = doc(db, "users", "1");
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        setData(docSnap.data())
                    } else {
                        console.log("هیچ سندی یافت نشد!");
                    }
                } catch (error) {
                    console.error('خطا در بازیابی سند:', error)
                }
            }
            getData()
        }, [])
    
        return (
            <div>
                <p>نام: {data.firstName}</p>
                <p>نام خانوادگی: {data.lastName}</p>
            </div>
        )
    }
    
    export default Example`}</SyntaxHighlighter>
                    </li>
                </ul>
            </div>
        </>
    )
}

export default FirebaseIntegration
