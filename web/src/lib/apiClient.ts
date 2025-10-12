import type { ModuleResponse } from "../../../shared-types.ts";

const API_BASE_URL = "http://localhost:3001/api";

/**
 * Fetch wrapper that includes authentication headers
 */
async function fetchWithAuth(
  url: string,
  options?: RequestInit
): Promise<Response> {
  const headers = {
    ...options?.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers,
      credentials: "include", // include cookies for session management
    });
    return response;
  } catch (error) {
    console.error("Error fetching API:", error);
    throw new Error("Failed to fetch API");
  }
}

export async function getModuleBySlug(slug: string): Promise<ModuleResponse> {
  const response = await fetchWithAuth(`/modules/${slug}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch module: ${response.statusText}`);
  }
  const data = await response.json();
  return data;
}

export async function saveFiles(
  files: { id: string; name: string; content: string }[]
) {
  const response = await fetchWithAuth(`/modules/files`, {
    method: "POST",
    body: JSON.stringify({ files }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to save files: ${response.statusText}`);
  }
  const data = await response.json();
  console.log("Save files response:", data);
  return data;
}
