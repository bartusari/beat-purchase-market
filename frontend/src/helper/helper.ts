import { toast } from "sonner";

export function isDigit(str: string) {
  const rakamRegex = /^[0-9]*$/;
  return rakamRegex.test(str);
}

export function showErrors(error: any) {
  error.response.data.message.forEach((m: string) => {
    toast.error(m);
  });
}
