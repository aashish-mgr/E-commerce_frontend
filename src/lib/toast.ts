import { toast as sonnerToast } from "sonner";
import axios, { type AxiosError } from "axios";

const DURATION = 3000;

interface ToastAction {
  label: string;
  onClick: () => void;
}

export function isRateLimited(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 429;
}

export function getServerMessage(error: unknown, fallback: string): string {
  if (
    error &&
    typeof error === "object" &&
    "isAxiosError" in error &&
    (error as AxiosError).response?.data
  ) {
    const data = (error as AxiosError<{ message?: string }>).response!.data;
    if (data && typeof data.message === "string") return data.message;
  }
  return fallback;
}

export function showErrorToast(error: unknown, fallback: string): void {
  if (isRateLimited(error)) return;
  toast.error(getServerMessage(error, fallback));
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