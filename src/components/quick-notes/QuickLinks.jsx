import {
  BookOpenCheck,
  Bot,
  ExternalLink,
  HardDrive,
} from "lucide-react";

const QUICK_LINKS = [
  {
    id: "argo",
    label: "Registro Argo",
    description: "Voti, compiti e comunicazioni",
    href: "https://www.portaleargo.it/famiglia/#/main/home",
    icon: BookOpenCheck,
  },
  {
    id: "drive",
    label: "Google Drive",
    description: "Documenti e materiale scolastico",
    href: "https://drive.google.com/drive/my-drive",
    icon: HardDrive,
  },
  {
    id: "chatgpt",
    label: "ChatGPT",
    description: "Studio e assistenza AI",
    href: "https://chatgpt.com/",
    icon: Bot,
  },
];

function QuickLinks() {
  return (
    <section
      aria-labelledby="quick-links-title"
      className="mb-6"
    >
      <div className="mb-3 flex items-center justify-between">
        <h3
          id="quick-links-title"
          className="font-semibold"
        >
          Link rapidi
        </h3>

        <span className="text-xs text-slate-500 dark:text-white/40">
          {QUICK_LINKS.length} collegamenti
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {QUICK_LINKS.map((quickLink) => {
          const Icon = quickLink.icon;

          return (
            <a
              key={quickLink.id}
              href={quickLink.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-white/5 p-4 transition hover:border-sky-400/40 hover:bg-sky-400/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
            >
              <div className="flex items-start justify-between gap-3">
                <Icon
                  size={20}
                  className="text-sky-700 dark:text-sky-300"
                  aria-hidden="true"
                />

                <ExternalLink
                  size={15}
                  className="text-slate-400 transition group-hover:text-sky-700 dark:text-white/30 dark:group-hover:text-sky-300"
                  aria-hidden="true"
                />
              </div>

              <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">
                {quickLink.label}
              </p>

              <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-white/50">
                {quickLink.description}
              </p>
            </a>
          );
        })}
      </div>
    </section>
  );
}

export default QuickLinks;
