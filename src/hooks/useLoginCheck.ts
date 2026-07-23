import { useState } from "react";
import { InfoType, Info } from "@/lib/Info";

/**
 * Username check function for frontend filtering. Must be not empty
 * @returns nameInfo: Message of username and its corresponding type
 * @returns validateName: Function to help check if username is empty
 */
export function useUsernameCheck() {
    const [nameInfo, setNameInfo] = useState<Info>({ message: "", type: InfoType.EMPTY });

    const validateName = async (username: string) => {
        if (!username.trim()) {
            setNameInfo({ message: "Username cannot be empty!", type: InfoType.WARNING });
            return;
        }
        
        setNameInfo({ message: "", type: InfoType.AVAILABLE })
    };

    return { nameInfo, validateName };
}

/**
 * Password check function for frontend filtering. Must be not empty
 * @returns pwdInfo: Message of username and its corresponding type
 * @returns validatePwd: help check if password is empty
 */
export function usePasswordCheck() {
    const [pwdInfo, setPwdInfo] = useState<Info>({ message: "", type: InfoType.EMPTY });

    const validatePwd = (password: string) => {
        if (!password.trim()) {
            setPwdInfo({ message: "Password cannot be empty!", type: InfoType.WARNING });
            return;
        }

        setPwdInfo({ message: "", type: InfoType.AVAILABLE })
    };

    return { pwdInfo, validatePwd };
}