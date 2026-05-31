import Link from "next/link";

type Crumb = {
  label: string;
  href?: string;
};

type BreadcrumbsProps = {
  crumbs: Crumb[];
};

export function Breadcrumbs({ crumbs }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4 text-sm text-[var(--color-text-muted)]">
      <ol className="inline-flex flex-wrap items-center gap-2 rounded-full border border-[var(--color-border)] bg-[color-mix(in_oklch,var(--color-surface)_88%,white)] px-4 py-2 shadow-[var(--shadow-sm)]">
        {crumbs.map((crumb, index) => (
          <li key={`${crumb.label}-${index}`} className="flex items-center gap-2">
            {crumb.href ? (
              <Link href={crumb.href} className="transition hover:text-[var(--color-text)]">
                {crumb.label}
              </Link>
            ) : (
              <span className="font-medium text-[var(--color-text)]">{crumb.label}</span>
            )}
            {index < crumbs.length - 1 ? (
              <span className="text-[var(--color-text-muted)]/70">/</span>
            ) : null}
          </li>
        ))}
      </ol>
    </nav>
  );
}
