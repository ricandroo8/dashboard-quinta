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
                flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500
                ${
                    isActive
                        ? "bg-sky-500/15 text-sky-700 dark:text-sky-300"
                        : "text-slate-600 hover:bg-slate-200 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                }
            `}    
        >
            <Icon className = "h-5 w-5 shrink-0" />
            <span>{label}</span>
        </button>
    );
}

export default SidebarItem;