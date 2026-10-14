/**
 * API Client for FastAPI backend integration
 * Seamlessly connects React to the FastAPI server running on port 8001 (via Vite proxy /api)
 */

export async function checkBackendHealth() {
  try {
    const res = await fetch('/api/health');
    return res.ok;
  } catch {
    return false;
  }
}

export async function fetchCustomersApi() {
  try {
    const res = await fetch('/api/customers');
    if (!res.ok) throw new Error('Failed to fetch customers');
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] fetchCustomersApi offline, using local data', err);
    return null;
  }
}

export async function addCustomerApi(data) {
  try {
    const res = await fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create customer');
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] addCustomerApi offline, falling back', err);
    return null;
  }
}

export async function updateCustomerApi(id, updates) {
  try {
    const res = await fetch(`/api/customers/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Failed to update customer');
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] updateCustomerApi offline, falling back', err);
    return null;
  }
}

export async function deleteCustomerApi(id) {
  try {
    const res = await fetch(`/api/customers/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
    return res.ok;
  } catch (err) {
    console.warn('[FastAPI] deleteCustomerApi offline, falling back', err);
    return false;
  }
}

export async function resetCustomersApi() {
  try {
    const res = await fetch('/api/customers/reset', {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Failed to reset customers');
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] resetCustomersApi offline, falling back', err);
    return null;
  }
}

export async function sendCopilotChatApi(message, context = {}, history = []) {
  try {
    const res = await fetch('/api/copilot/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, context, history })
    });
    if (!res.ok) throw new Error('Failed to get copilot response');
    return await res.json();
  } catch (err) {
    console.warn('[FastAPI] sendCopilotChatApi offline, falling back to local Copilot engine', err);
    return null;
  }
}

export async function fetchCopilotHistoryApi() {
  try {
    const res = await fetch('/api/copilot/history');
    if (!res.ok) throw new Error('Failed to fetch history');
    const data = await res.json();
    return data.messages || [];
  } catch (err) {
    console.warn('[FastAPI] fetchCopilotHistoryApi offline', err);
    return null;
  }
}

export async function saveCopilotMessageApi(msg) {
  try {
    const res = await fetch('/api/copilot/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(msg)
    });
    return res.ok;
  } catch (err) {
    console.warn('[FastAPI] saveCopilotMessageApi offline', err);
    return false;
  }
}

export async function clearCopilotHistoryApi() {
  try {
    const res = await fetch('/api/copilot/history', {
      method: 'DELETE'
    });
    return res.ok;
  } catch (err) {
    console.warn('[FastAPI] clearCopilotHistoryApi offline', err);
    return false;
  }
}

