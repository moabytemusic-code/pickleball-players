'use client'

import { login, signup } from './actions'
import { useState } from 'react'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState("");
    const [err, setErr] = useState("");

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setMsg("");
        setErr("");

        if (isLogin) {
            const res = await login(formData);
            if (res?.error) setErr(res.error);
        } else {
            const res = await signup(formData);
            if (res?.error) setErr(res.error);
            if (res?.success) setMsg(res.success);
        }
        setLoading(false);
    }

    return (
        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <Link href="/">
                    <div className="mx-auto h-12 w-12 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-2xl">P</div>
                </Link>
                <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-foreground">
                    {isLogin ? "Sign in to your account" : "Create a new account"}
                </h2>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                <form className="space-y-6" action={handleSubmit}>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium leading-6 text-foreground">
                            Email address
                        </label>
                        <div className="mt-2">
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-white bg-white dark:bg-white/5 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-white/10 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 pl-2"
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between">
                            <label htmlFor="password" className="block text-sm font-medium leading-6 text-foreground">
                                Password
                            </label>
                        </div>
                        <div className="mt-2">
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                minLength={6}
                                required
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-white bg-white dark:bg-white/5 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-white/10 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 pl-2"
                            />
                        </div>
                    </div>

                    {err && (
                        <div className="text-red-500 text-sm text-center">{err}</div>
                    )}
                    {msg && (
                        <div className="text-green-500 text-sm text-center">{msg}</div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex w-full justify-center rounded-md bg-primary px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (isLogin ? "Sign in" : "Sign up")}
                        </button>
                    </div>
                </form>

                <p className="mt-10 text-center text-sm text-gray-500">
                    {isLogin ? "Not a member? " : "Already have an account? "}
                    <button
                        type="button"
                        className="font-semibold leading-6 text-primary hover:text-primary/80"
                        onClick={() => { setIsLogin(!isLogin); setErr(""); setMsg(""); }}
                    >
                        {isLogin ? "Sign up now" : "Sign in here"}
                    </button>
                </p>
            </div>
        </div>
    )
}
