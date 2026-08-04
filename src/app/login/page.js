"use client";
import { login } from "@/api/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useUsernameCheck, usePasswordCheck } from "@/hooks/useLoginCheck";
import * as loginCheck from "@/lib/LoginCheck";
import { PiggyMark, EyeIcon, EyeOffIcon, Spinner } from "@/components/icons";
import { Field, inputClass } from "@/components/field";
import { GradientBackdrop } from "@/components/backdrop";
import styles from "@/components/animations.module.css";

export default function Home() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [result, setResult] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { nameInfo, validateName } = useUsernameCheck();
  const { pwdInfo, validatePwd } = usePasswordCheck();

  const canSubmit = loginCheck.allValid([nameInfo, pwdInfo]) && !submitting;

  function switchMode(admin) {
    setIsAdmin(admin);
    setUsername("");
    setPassword("");
    setResult("");
  }

  const submit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setResult("");
    try {
      await login({ username, password });
      router.push("/dashboard");
    } catch (error) {
      setResult(error.response?.data?.message ?? error.message ?? "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  function handleEnter(e) {
    if (e.key === "Enter") submit();
  }

  // Visual theme switches between rose (user) and violet (admin)
  const accent = isAdmin
    ? "bg-violet-500 hover:bg-violet-600"
    : "bg-rose-500 hover:bg-rose-600";
  const iconBg = isAdmin
    ? "bg-violet-100 text-violet-500 dark:bg-violet-500/10 dark:text-violet-400"
    : "bg-rose-100 text-rose-500 dark:bg-rose-500/10 dark:text-rose-400";
  const activeTab =
    "rounded-full bg-white dark:bg-zinc-800 shadow-sm text-black dark:text-rose-100 font-medium";
  const inactiveTab =
    "rounded-full text-zinc-500 dark:text-rose-300/60 hover:text-zinc-700 dark:hover:text-rose-200 transition-colors";

  return (
    <GradientBackdrop className="flex flex-1 items-center justify-center px-4 py-16 font-sans">
      <div className={`relative w-full max-w-sm ${styles.fadeInUp}`}>

        {/* Brand + heading */}
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <span className={`flex h-11 w-11 items-center justify-center rounded-full transition-colors duration-200 ${iconBg}`}>
            <PiggyMark className="h-6 w-6" />
          </span>
          <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-rose-100">
            {isAdmin ? "Admin login" : "Welcome back"}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-rose-300/70">
            {isAdmin
              ? "Sign in with your administrator credentials."
              : "Log in to pick up where you left off with PiggyMemo."}
          </p>
        </div>

        {/* Mode toggle */}
        <div className="mb-4 flex gap-1 rounded-full bg-zinc-100 p-1 dark:bg-zinc-900">
          <button
            onClick={() => switchMode(false)}
            className={`flex-1 py-1.5 text-sm transition-all duration-150 ${!isAdmin ? activeTab : inactiveTab}`}
          >
            User
          </button>
          <button
            onClick={() => switchMode(true)}
            className={`flex-1 py-1.5 text-sm transition-all duration-150 ${isAdmin ? activeTab : inactiveTab}`}
          >
            Admin
          </button>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex flex-col gap-5">
            <Field label="Username" htmlFor="username" info={nameInfo}>
              <input
                id="username"
                className={inputClass}
                placeholder={isAdmin ? "Admin username" : "Your username"}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onBlur={(e) => validateName(e.target.value)}
                onKeyDown={handleEnter}
                autoComplete="username"
              />
            </Field>

            <Field label="Password" htmlFor="password" info={pwdInfo}>
              <div className="relative">
                <input
                  id="password"
                  type={showPwd ? "text" : "password"}
                  className={`${inputClass} pr-11`}
                  placeholder={isAdmin ? "Admin password" : "Your password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={(e) => validatePwd(e.target.value)}
                  onKeyDown={handleEnter}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  aria-label={showPwd ? "Hide password" : "Show password"}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 transition-all hover:scale-110 hover:text-zinc-600 dark:hover:text-zinc-300"
                >
                  {showPwd ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                </button>
              </div>
            </Field>

            <button
              onClick={submit}
              disabled={!canSubmit}
              className={`mt-1 flex h-11 w-full items-center justify-center gap-2 rounded-full text-sm font-medium text-white transition-all duration-150 hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:scale-100 disabled:bg-zinc-300 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-500 ${canSubmit ? accent : ""}`}
            >
              {submitting && <Spinner className="h-4 w-4" />}
              {submitting ? "Logging in..." : "Log in"}
            </button>

            {result && (
              <p
                key={result}
                className={`${styles.popIn} text-center text-sm text-rose-600 dark:text-rose-400`}
              >
                {result}
              </p>
            )}
          </div>
        </div>

        {!isAdmin && (
          <p className="mt-6 text-center text-sm text-zinc-500 dark:text-rose-300/70">
            Don&apos;t have an account?{" "}
            <a href="/register" className="font-medium text-black underline underline-offset-2 dark:text-rose-100">
              Create one
            </a>
          </p>
        )}
      </div>
    </GradientBackdrop>
  );
}
