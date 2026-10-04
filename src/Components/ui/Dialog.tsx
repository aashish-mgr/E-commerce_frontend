import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "../../lib/cn";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export function DialogContent({
  title,
  description,
  children,
  className,
  variant = "dialog",
  hideClose = false,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  variant?: "dialog" | "sheet";
  hideClose?: boolean;
}) {
  const isSheet = variant === "sheet";

  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        className={cn(
          "fixed inset-0 z-50 bg-ink/45",
          "data-[state=open]:animate-[se-panel-in_150ms_ease-out]",
        )}
      />
      <DialogPrimitive.Content
        className={cn(
          "fixed z-50 bg-surface shadow-lift focus:outline-none",
          isSheet
            ? "inset-y-0 right-0 flex w-[min(20rem,88vw)] flex-col border-l border-line"
            : cn(
                "left-1/2 top-1/2 w-[min(30rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2",
                "max-h-[min(88vh,48rem)] overflow-y-auto rounded-panel border border-line",
                "data-[state=open]:animate-[se-panel-in_150ms_ease-out]",
              ),
          className,
        )}
      >
        <div
          className={cn(
            "flex items-start justify-between gap-4 border-b border-line px-5 py-4",
            isSheet && "px-4",
          )}
        >
          <div className="min-w-0">
            <DialogPrimitive.Title className="font-display text-lg font-semibold text-ink">
              {title}
            </DialogPrimitive.Title>
            {description && (
              <DialogPrimitive.Description className="mt-0.5 text-sm text-muted">
                {description}
              </DialogPrimitive.Description>
            )}
          </div>
          {!hideClose && (
            <DialogPrimitive.Close
              aria-label="Close"
              className="-mr-1 -mt-1 flex size-10 shrink-0 items-center justify-center rounded-control text-ink-2 hover:bg-paper-2 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine"
            >
              <X aria-hidden className="size-5" />
            </DialogPrimitive.Close>
          )}
        </div>
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}