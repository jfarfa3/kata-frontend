export function request<T>(url: string, method = 'GET', body?: unknown): Promise<T> {
  return fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  }).then((response) => {
    if (response.status === 204) {
      return {} as T;
    }
    return response.json();
  })
}