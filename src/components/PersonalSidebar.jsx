"use client";
import { useState } from "react";
import * as Collapsible from "@radix-ui/react-collapsible";
import * as Tooltip from "@radix-ui/react-tooltip";
import {
    ChevronLeft,
    ChevronRight,
    CircleUserRound,
    House,
    PiggyBank,
    BarChart2,
    PenLine,
} from "lucide-react";

const menuItems = [
    { label: "Overview",   href: "/dashboard",  icon: House },
    { label: "Statistics", href: "/statistics",  icon: BarChart2 },
    { label: "Log",        href: "/log",         icon: PenLine },
    { label: "Profile",    href: "/profile",     icon: CircleUserRound },
];

function SidebarLink({ item, expanded, activePath }) {
    const Icon = item.icon;
    const active = activePath === item.href;
    const link = (
        <a
            href={item.href}
            aria-current={active ? "page" : undefined}
            aria-label={!expanded ? item.label : undefined}
            className={[
                "group flex h-10 items-center rounded-lg text-sm font-medium",
                "transition-colors duration-150",
                expanded ? "gap-3 px-3" : "justify-center px-0",
                active
                    ? "bg-zinc-100 text-zinc-950"
                    : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-950",
            ].join(" ")}
        >
            <Icon
                aria-hidden="true"
                className={[
                    "size-[18px] shrink-0",
                    active
                        ? "text-zinc-800"
                        : "text-zinc-400 group-hover:text-zinc-700",
                ].join(" ")}
            />

            {expanded && (
                <span className="truncate">
                    {item.label}
                </span>
            )}
        </a>
    );

    if (expanded) {
        return link;
    }

    return (
        <Tooltip.Root delayDuration={300}>
            <Tooltip.Trigger asChild>
                {link}
            </Tooltip.Trigger>

            <Tooltip.Portal>
                <Tooltip.Content
                    side="right"
                    sideOffset={10}
                    className={[
                        "z-50 rounded-md bg-zinc-950 px-2.5 py-1.5",
                        "text-xs font-medium text-white shadow-md",
                        "select-none",
                        "data-[state=delayed-open]:animate-in",
                        "data-[state=closed]:animate-out",
                        "data-[state=delayed-open]:fade-in",
                        "data-[state=closed]:fade-out",
                    ].join(" ")}
                >
                    {item.label}

                    <Tooltip.Arrow className="fill-zinc-950" />
                </Tooltip.Content>
            </Tooltip.Portal>
        </Tooltip.Root>
    );
}

export default function PersonalSidebar({
                                            activePath = "/profile",
                                            expanded: controlledExpanded,
                                            defaultExpanded = true,
                                            onExpandedChange,
                                        }) {
    const [uncontrolledExpanded, setUncontrolledExpanded] = useState(defaultExpanded);
    const expanded = controlledExpanded ?? uncontrolledExpanded;

    function handleExpandedChange(nextExpanded) {
        if (controlledExpanded === undefined) {
            setUncontrolledExpanded(nextExpanded);
        }
        onExpandedChange?.(nextExpanded);
    }

    return (
        <Tooltip.Provider>
            <Collapsible.Root
                open={expanded}
                onOpenChange={handleExpandedChange}
                asChild
            >
                <aside
                    className={[
                        "fixed inset-y-0 left-0 z-40",
                        "flex flex-col border-r border-zinc-200 bg-white",
                        "transition-[width] duration-200 ease-out",
                        expanded ? "w-60" : "w-[72px]",
                    ].join(" ")}
                >
                    <div
                        className={[
                            "flex h-16 shrink-0 items-center border-b border-zinc-100",
                            expanded ? "justify-between px-4" : "justify-center px-2",
                        ].join(" ")}
                    >
                        <a
                            href="/dashboard"
                            aria-label="PiggyMemo home"
                            className={[
                                "flex min-w-0 items-center",
                                expanded ? "gap-3" : "",
                            ].join(" ")}
                        >
                            <span
                                className={[
                                    "flex size-9 shrink-0 items-center justify-center",
                                    "rounded-xl bg-rose-500 text-white",
                                ].join(" ")}
                            >
                                <PiggyBank
                                    className="size-5"
                                    aria-hidden="true"
                                />
                            </span>

                            {expanded && (
                                <span className="truncate text-sm font-semibold tracking-tight text-zinc-950">
                                    PiggyMemo
                                </span>
                            )}
                        </a>

                        {expanded && (
                            <Collapsible.Trigger asChild>
                                <button
                                    type="button"
                                    aria-label="Collapse sidebar"
                                    className={[
                                        "flex size-8 shrink-0 items-center justify-center",
                                        "rounded-lg text-zinc-400",
                                        "transition-colors",
                                        "hover:bg-zinc-100 hover:text-zinc-800",
                                        "focus-visible:outline-none",
                                        "focus-visible:ring-2 focus-visible:ring-rose-500",
                                        "focus-visible:ring-offset-2",
                                    ].join(" ")}
                                >
                                    <ChevronLeft
                                        className="size-4"
                                        aria-hidden="true"
                                    />
                                </button>
                            </Collapsible.Trigger>
                        )}
                    </div>

                    {!expanded && (
                        <div className="px-3 pt-3">
                            <Tooltip.Root delayDuration={300}>
                                <Tooltip.Trigger asChild>
                                    <Collapsible.Trigger asChild>
                                        <button
                                            type="button"
                                            aria-label="Expand sidebar"
                                            className={[
                                                "flex h-9 w-full items-center justify-center",
                                                "rounded-lg text-zinc-400",
                                                "transition-colors",
                                                "hover:bg-zinc-100 hover:text-zinc-800",
                                                "focus-visible:outline-none",
                                                "focus-visible:ring-2 focus-visible:ring-rose-500",
                                                "focus-visible:ring-offset-2",
                                            ].join(" ")}
                                        >
                                            <ChevronRight
                                                className="size-4"
                                                aria-hidden="true"
                                            />
                                        </button>
                                    </Collapsible.Trigger>
                                </Tooltip.Trigger>

                                <Tooltip.Portal>
                                    <Tooltip.Content
                                        side="right"
                                        sideOffset={10}
                                        className="z-50 rounded-md bg-zinc-950 px-2.5 py-1.5 text-xs font-medium text-white shadow-md"
                                    >
                                        Expand sidebar
                                        <Tooltip.Arrow className="fill-zinc-950" />
                                    </Tooltip.Content>
                                </Tooltip.Portal>
                            </Tooltip.Root>
                        </div>
                    )}

                    <nav
                        aria-label="Personal navigation"
                        className="flex-1 overflow-y-auto px-3 py-5"
                    >
                        <div className="space-y-1">
                            {menuItems.map((item) => (
                                <SidebarLink
                                    key={item.href}
                                    item={item}
                                    expanded={expanded}
                                    activePath={activePath}
                                />
                            ))}
                        </div>
                    </nav>
                </aside>
            </Collapsible.Root>
        </Tooltip.Provider>
    );
}