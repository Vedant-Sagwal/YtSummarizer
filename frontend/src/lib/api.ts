import { supabase } from "@/lib/supabase";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

async function getAccessToken() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("You must be logged in");
  }

  return session.access_token;
}

export async function apiFetch(
  path: string,
  options: RequestInit = {},
) {
  const token = await getAccessToken();

  const headers = new Headers(options.headers);

  headers.set(
    "Authorization",
    `Bearer ${token}`,
  );

  if (!headers.has("Content-Type")) {
    headers.set(
      "Content-Type",
      "application/json",
    );
  }

  const response = await fetch(
    `${API_URL}${path}`,
    {
      ...options,
      headers,
    },
  );

  if (!response.ok) {
    const text = await response.text();

    throw new Error(
      text ||
        `Request failed: ${response.status}`,
    );
  }

  return response;
}