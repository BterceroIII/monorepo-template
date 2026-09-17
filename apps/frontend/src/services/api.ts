import axios from "axios";

export const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:4000/api/v1";

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export type ApiErrorResponse = {
  message?: string | string[] | { message?: string | string[]; error?: string };
  error?: string;
  statusCode?: number;
};

export function getApiErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return "Ocurrió un error inesperado";
  }

  return (
    toErrorText(error.response?.data.message) ??
    toErrorText(error.response?.data.error) ??
    "No se pudo completar la solicitud"
  );
}

function toErrorText(
  message: ApiErrorResponse["message"],
): string | undefined {
  if (!message) return undefined;

  if (Array.isArray(message)) {
    return message.flatMap((item) => {
      const text = toErrorText(item);
      return text ? [text] : [];
    }).join(". ");
  }

  if (typeof message === "object") {
    return toErrorText(message.message) ?? message.error;
  }

  return String(message);
}
