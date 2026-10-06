import { Toaster } from 'sonner'
import { useMediaQuery } from '../hooks/useMediaQuery.ts'

export function AppToaster() {
  // 600px matches sonner's own mobile breakpoint so position and offsets stay in sync.
  const isMobile = useMediaQuery('(max-width: 600px)')

  return (
    <Toaster
      position={isMobile ? 'top-center' : 'bottom-right'}
      richColors={false}
      mobileOffset={{
        top: 'calc(var(--nav-h) + 0.75rem)',
        right: '0.75rem',
        bottom: '0.75rem',
        left: '0.75rem',
      }}
      toastOptions={{
        classNames: {
          toast:
            '!rounded-panel !border !border-line !bg-surface !text-ink !shadow-lift',
          title: '!text-sm !font-semibold !text-ink',
          description: '!text-sm !text-muted',
          actionButton:
            '!rounded-control !bg-pine !px-3 !text-sm !font-semibold !text-paper',
          cancelButton:
            '!rounded-control !bg-paper-2 !px-3 !text-sm !font-medium !text-ink-2',
        },
      }}
    />
  )
}
