export const api = {
  get: async (path, token) => {
    const res = await fetch(`/api/${path}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
    return res.json();
  },
  post: async (path, body, token) => {
    const res = await fetch(`/api/${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(body)
    });
    return res.json();
  },
  put: async (path, body, token) => {
    const res = await fetch(`/api/${path}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(body)
    });
    return res.json();
  },
  del: async (path, token) => {
    const res = await fetch(`/api/${path}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return res.json();
  }
};
