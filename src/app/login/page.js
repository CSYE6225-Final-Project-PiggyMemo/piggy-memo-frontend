"use client";
import { login } from "@/api/auth"
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useUsernameCheck, usePasswordCheck } from "@/hooks/useLoginCheck";

export default function Home() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPwd, setShowPwd] = useState(false);

    const submit = async() => {
        try {
            await login({username, password});
        }
        catch(error) {
            setResult(error.response?.data?.message ?? error.message ?? "Something went wrong.");
        }
    }

    function handleEnter(e) {
        if(e.key === "Enter") submit();
    }
}