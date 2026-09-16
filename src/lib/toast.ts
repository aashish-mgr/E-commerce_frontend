import { toast as sonnerToast } from "sonner";

const DURATION = 3000;

interface ToastAction {
  label: string;
  onClick: () => void;
}

export const toast = {
  success: (message: string) => sonnerToast.success(message, { duration: DURATION }),
  error: (message: string) => sonnerToast.error(message, { duration: DURATION }),
  info: (message: string) => sonnerToast(message, { duration: DURATION }),
  confirm: (message: string, action: ToastAction) =>
    sonnerToast(message, { duration: DURATION, action }),
  promise: <T,>(promise: Promise<T>, msgs: { loading: string; success: string; error: string }) =>
    sonnerToast.promise(promise, msgs),
};