
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://mi-back-en-render.com"; 

export async function apiGet<T>(
  endpoint: string,
  params?: Record<string, string | number>
): Promise<T> {
  const query = params
    ? "?" + new URLSearchParams(params as Record<string, string>).toString()
    : "";

  const response = await fetch(`${API_BASE_URL}${endpoint}${query}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include", 
    cache: "no-store", 
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Error al obtener datos");
  }

  return response.json();
}



export async function apiPost<T>(endpoint: string, body?: any): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", 
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Error al enviar datos");
  }

  return response.json();
}

export async function apiPut<T>(endpoint: string, body?: any): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include", 
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Error al enviar datos");
  }

  return response.json();
}

export async function apiDelete(endpoint: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    credentials: "include", 
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Error al eliminar datos");
  }
}
