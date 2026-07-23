"use client";
import { useState } from "react";
import { createUser } from "@/api/user";
import { usePasswordCheck, useUsernameCheck } from "@/hooks/useRegistraCheck";
import * as regCheck from "@/lib/RegistraCheck";
import { EyeIcon, EyeOffIcon, Spinner } from "./_components/icons";
import { Field, inputClass } from "./_components/field";
import styles from "./register.module.css";

export default function Home() {
  // Hooks for the page
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [result, setResult] = useState("");
  const [resultOk, setResultOk] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Validate username and password before submission
  const { nameInfo, validateName } = useUsernameCheck();
  const { pwdInfo, validatePwd } = usePasswordCheck();

  // Must pass all the validation before submission
  const canSubmit = regCheck.allValid([nameInfo, pwdInfo]) && !submitting;

  // Post new user request
  async function submit() {
    if (!canSubmit) return;
    setSubmitting(true);
    setResult("");
    try {
      const response = await createUser({ username, password });
      setResultOk(true);
      setResult(`Welcome, ${response.data.username}! Your account has been created.`);
    } catch (error) {
      setResultOk(false);
      setResult(error.response?.data?.message ?? error.message ?? "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleEnter(e) {
    if (e.key === "Enter") submit();
  }

  return (
    <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-gradient-to-b from-rose-50 via-zinc-50 to-white px-4 py-16 font-sans dark:from-zinc-950 dark:via-black dark:to-black">
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-rose-200/40 blur-3xl dark:bg-rose-500/10" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-amber-200/30 blur-3xl dark:bg-amber-500/10" />

      <div className={`relative w-full max-w-sm ${styles.fadeInUp}`}>
        {/* Brand + heading */}
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
            Create your account
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Start saving your memos with PiggyMemo.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex flex-col gap-5">
            <Field label="Username" htmlFor="username" info={nameInfo}>
              <input
                id="username"
                className={inputClass}
                placeholder="Pick a username"
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
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={(e) => validatePwd(e.target.value)}
                  onKeyDown={handleEnter}
                  autoComplete="new-password"
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
              className="mt-1 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-rose-500 text-sm font-medium text-white transition-all duration-150 hover:scale-[1.02] hover:bg-rose-600 active:scale-95 disabled:cursor-not-allowed disabled:scale-100 disabled:bg-zinc-300 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-500"
            >
              {submitting && <Spinner className="h-4 w-4" />}
              {submitting ? "Creating account..." : "Create account"}
            </button>

            {result && (
              <p
                key={result}
                className={`${styles.popIn} text-center text-sm ${
                  resultOk ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                }`}
              >
                {resultOk ? "🎉 " : ""}
                {result}
              </p>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
          Already have an account?{" "}
          <a href="/login" className="font-medium text-black underline underline-offset-2 dark:text-white">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
}