import { cn } from "../../lib/cn";

export function PageHeader({
  title,
  description,
  action,
  className,
  titleAs = "h1",
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  titleAs?: "h1" | "h2";
}) {
  const Title = titleAs;
  return (
    <div
      className={cn(
        "flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-b border-line pb-5",
        className,
      )}
    >
      <div className="min-w-0">
        <Title className="font-display text-2xl font-semibold text-ink sm:text-[28px]">
          {title}
        </Title>
        {description && (
          <p className="mt-1 max-w-prose text-sm text-muted">{description}</p>
        )}
      </div>
      {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
    </div>
  );
}