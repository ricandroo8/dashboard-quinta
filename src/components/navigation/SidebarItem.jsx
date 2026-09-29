function SidebarItem({
    label,
    icon: Icon,
    isActive,
    onClick,
}) {
    return (
        <button
            type = "button"
            onClick = {onClick}
            className = {`
                flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400
                ${
                    isActive
                        ? "border-sky-400/30 bg-sky-400/15 text-sky-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.16)] dark:text-sky-200"
                        : "border-transparent text-slate-700 hover:border-white/15 hover:bg-white/15 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white"
                }
            `}    
        >
            <Icon className = "h-5 w-5 shrink-0" />
            <span>{label}</span>
        </button>
    );
}

export default SidebarItem;
