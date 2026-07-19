import { useState } from "react";
import { checkUsername } from "@/api/user";
import { registraInfoType, Info } from "@/lib/RegistraCheck"

/**
 * Username check function for frontend filtering. Username must obey following rules:
 * 1. Not empty
 * 2. Only contains letters, numbers or underlines.
 * 3. Must be within 3-20 characters
 * 4. Must be unique
 * @returns nameInfo: Message of username and its corresponding type
 * @returns validateName: Function to help check the availability of username
 */
export function useUsernameCheck() {
    const [nameInfo, setInfo] = useState<Info>({ message: "", type: registraInfoType.EMPTY });

    const USERNAME_REGEX = /^[A-Za-z0-9_]+$/

    const validateName = async (username: string) => {
        if (!username.trim()) {
            setInfo({ message: "Username cannot be empty!", type: registraInfoType.WARNING });
            return;
        }

        if (!USERNAME_REGEX.test(username)) {
            setInfo({ message: "Username must only contains letters, numbers or underline!", type: registraInfoType.WARNING });
            return;
        }

        if (username.length < 3 || username.length > 20) {
            setInfo({ message: "Username length must between 3-20!", type: registraInfoType.WARNING });
            return;
        }

        try {
            setInfo({ message: "Validating...", type: registraInfoType.VALIDATING })
            const response = await checkUsername(username);
            const exist = response.data;

            if (exist) {
                setInfo({ message: `Username ${username} exists!`, type: registraInfoType.WARNING });
            }
            else
                setInfo({ message: "Username available!", type: registraInfoType.AVAILABLE });
        }

        catch (e: any) {
            setInfo({ message: "Error" + (e.response?.data?.message ?? e.message), type: registraInfoType.WARNING })
        }
    };

    return { nameInfo, validateName };
}

/**
 * Password check function for frontend filtering. Password must obey following rules:
 * 1. Not empty
 * 2. Within 8-30 characters
 * 3. Contains at least 3 types of following characters: one of '!@#$%^&*()_+=-'
 * @returns pwdInfo: Message of username and its corresponding type
 * @returns validatePwd: Function to help check the availability of password
 */
export function usePasswordCheck() {
    const [pwdInfo, setPwdInfo] = useState<Info>({ message: "", type: registraInfoType.EMPTY });

    const specialList = "!@#$%^&*()_+=-";

    const validatePwd = (password: string) => {
        if (!password.trim()) {
            setPwdInfo({ message: "Password cannot be empty!", type: registraInfoType.WARNING });
            return;
        }
        if (password.length < 8 || password.length > 30) {
            setPwdInfo({ message: "Password must be within 8-30 characters!", type: registraInfoType.WARNING });
            return;
        }

        let num = false, upper = false, lower = false, special = false;
        //Filter out invalid characters
        for (const c of password) {
            if (c >= '0' && c <= '9')
                num = true;
            else if (c >= 'a' && c <= 'z')
                lower = true;
            else if (c >= 'A' && c <= 'Z')
                upper = true;
            else if (specialList.includes(c))
                special = true;
            else {
                num = false, upper = false, lower = false, special = false;
                break;
            }
        }

        const checklist = [num, upper, lower, special].filter(Boolean).length;
        if (checklist < 3) {
            setPwdInfo({ message: "Password must contains at least 3 types of following characters: one of '!@#$%^&*()_+=-', uppercase, lowercase, and number!", type: registraInfoType.WARNING });
            return;
        }

        setPwdInfo({ message: "Password valid.", type: registraInfoType.AVAILABLE })
    };

    return { pwdInfo, validatePwd };
}