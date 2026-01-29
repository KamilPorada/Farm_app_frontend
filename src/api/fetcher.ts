export async function apiFetch<T>(
    url: string,
    token?: string
  ): Promise<T> {
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...(token && {
          Authorization: `Bearer ${token}`,
        }),
      },
    });
  
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
  
    return res.json();
  }
  