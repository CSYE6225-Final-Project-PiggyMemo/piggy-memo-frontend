"use client";
import { useState } from "react";
import { registraInfoType } from "@/lib/RegistraCheck";
import { createUser } from "@/api/user";
import { usePasswordCheck, useUsernameCheck } from "@/hooks/useRegistraCheck";
import * as regCheck from "@/lib/RegistraCheck"

export default function Home() {
  //Hooks for the page
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [result, setResult] = useState("");

  //According to message type, change the rendering color
  const infoColor = {
    [registraInfoType.EMPTY]: "",
    [registraInfoType.VALIDATING]: "text-gray-500",
    [registraInfoType.WARNING]: "text-red-500",
    [registraInfoType.AVAILABLE]: "text-green-700"
  };

  //Validate username and password before submission
  const {nameInfo, validateName} = useUsernameCheck();
  const {pwdInfo, validatePwd} = usePasswordCheck();

  //Must pass all the validation before submission
  const canSubmit = regCheck.allValid([nameInfo, pwdInfo]);
  //Post new user request
  async function submit() {
    try {
      if(canSubmit) {
        const response = await createUser({username, password});
        setResult("Success!" + JSON.stringify(response.data))
      }
    }
    //Error message display: 
    catch(error) {
      setResult("Failed to register!" + error.response?.data?.message ?? e.message);
    }
  }

  //Page components
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black">
        <div className="flex flex-col items-center gap-6 text-center">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            Sign Up
          </h1>
        </div>

        <div className="flex max-w-xs flex-col items-center gap-4">
          <input
            className="h-8 w-full text-center text-[#000000] transition-colors focus:border-[#8dadce] focus:outline-none caret-[#787878] placeholder-[#787878] rounded-full border-3 border-solid border-[#c8c8c8] dark:border-[#7d7d7d] bg-[#b6b6b6] dark:bg-white"
            placeholder="Set username"
            value={username}
            onChange={(e) => { setUsername(e.target.value) }}
            onBlur={(e) => validateName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
          />
          {/* Message for username validation */}
          {nameInfo.message && <p className={`text-sm ${infoColor[nameInfo.type]}`}>{nameInfo.message}</p>}

          <input
            type={showPwd ? "text" : "password"}
            className="h-8 w-full text-center text-[#000000] transition-colors focus:border-[#8dadce] focus:outline-none caret-[#787878] placeholder-[#787878] rounded-full border-3 border-solid border-[#c8c8c8] dark:border-[#7d7d7d] bg-[#b6b6b6] dark:bg-white"
            placeholder="Set password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); }}
            onBlur={(e) => validatePwd(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
          />
          {/* Message for password validation */}
          {pwdInfo.message && <p className={`text-sm ${infoColor[pwdInfo.type]}`}>{pwdInfo.message}</p>}
          <label className="flex items-center gap-2 text-[#000000] dark:text-[#FFFFFF]">
            <input
              id="show_password"
              type="checkbox"
              checked={showPwd}
              onChange={(e) => setShowPwd(e.target.checked)}
            />
            Show password
          </label>
        </div>

        <div className="flex w-full flex-col gap-4 items-center justify-center font-medium sm:flex-row">
          <button
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
            onClick={submit}
          >
            Register
          </button>
        </div>

        <div>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            {result}
          </p>
        </div>
      </main>
    </div>
  );
}
