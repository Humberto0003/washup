export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

const getApiUrl = () => {
  if (!API_URL) {
    throw new ApiError(
      "Configure NEXT_PUBLIC_API_URL no .env.local para conectar a API.",
      0
    );
  }

  return API_URL;
};

const getErrorMessage = (body: unknown, fallback: string) => {
  if (!body || typeof body !== "object") {
    return fallback;
  }

  const message = (body as { message?: unknown }).message;

  if (Array.isArray(message)) {
    return message.join(" ");
  }

  if (typeof message === "string") {
    return message;
  }

  return fallback;
};

export async function apiRequest<TResponse>(
  path: string,
  init?: RequestInit
) {
  const response = await fetch(`${getApiUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  const text = await response.text();
  const body = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new ApiError(
      getErrorMessage(body, "Não foi possível concluir a operação."),
      response.status
    );
  }

  return body as TResponse;
}

export function getApiErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Não foi possível concluir a operação.";
}
