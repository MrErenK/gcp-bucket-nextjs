const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

export async function verifyApiKey(apiKey: string) {
  const response = await fetch(
    `${API_BASE_URL}/api/keys/verify?key=${apiKey}`,
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    },
  );
  const data = await response.json();
  return data.valid;
}

export async function getApiKeyDescription(apiKey: string) {
  const response = await fetch(
    `${API_BASE_URL}/api/keys/verify?key=${apiKey}`,
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    },
  );
  const data = await response.json();
  return data.description;
}
