"use client";

import { usePathname } from "next/navigation";
import PersonalShell from "@/components/PersonalShell";

export default function PersonalLayout({ children }) {
    const pathname = usePathname();

    return (
        <PersonalShell activePath={pathname}>
            {children}
        </PersonalShell>
    );
}
