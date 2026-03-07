const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class APIError extends Error {
  constructor(message, statusCode, requestId) {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;
    this.requestId = requestId;
  }
}

async function handleResponse(response) {
  const data = await response.json();
  
  if (!response.ok) {
    throw new APIError(
      data.error || 'API request failed',
      response.status,
      data.requestId
    );
  }
  
  return data;
}

async function apiRequest(url, options = {}) {
  try {
    const response = await fetch(`${BASE_URL}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    return await handleResponse(response);
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    
    // Network error
    console.error('Network error:', error);
    throw new APIError('Network error - please check your connection', 0);
  }
}

export const api = {
  login: (email, password) =>
    apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),

  startSession: (teacherId, subject) =>
    apiRequest('/api/session/start', {
      method: 'POST',
      body: JSON.stringify({ teacherId, subject, sectionName: 'Section 10-B' })
    }),

  endSession: (teacherId, sessionId, finalEmotions, avgEngagement, subject) =>
    apiRequest('/api/session/end', {
      method: 'POST',
      body: JSON.stringify({ teacherId, sessionId, finalEmotions, avgEngagement, subject })
    }),

  analyzeFrame: (imageBase64, sessionId, teacherId, settings) =>
    apiRequest('/api/analyze/frame', {
      method: 'POST',
      body: JSON.stringify({ imageBase64, sessionId, teacherId, settings })
    }),

  getDailyInsight: (data) =>
    apiRequest('/api/insights/daily', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  getLiveInsight: (emotions, subject, durationMinutes) =>
    apiRequest('/api/insights/live', {
      method: 'POST',
      body: JSON.stringify({ emotions, subject, durationMinutes })
    }),

  getReports: (teacherId, minSessionDuration = 1) =>
    apiRequest(`/api/reports/summary?teacherId=${teacherId}&minSessionDuration=${minSessionDuration}`),

  getWeeklySummary: (sessions) =>
    apiRequest('/api/insights/weekly', {
      method: 'POST',
      body: JSON.stringify({ sessions })
    }),

  getAlerts: (teacherId, dismissed = false, limit = 10) =>
    apiRequest(`/api/alerts?teacherId=${teacherId}&dismissed=${dismissed}&limit=${limit}`),

  dismissAlert: (teacherId, alertId) =>
    apiRequest('/api/alerts/dismiss', {
      method: 'POST',
      body: JSON.stringify({ teacherId, alertId })
    }),

  dismissAllAlerts: (teacherId) =>
    apiRequest('/api/alerts/dismiss-all', {
      method: 'POST',
      body: JSON.stringify({ teacherId })
    })
};

export { APIError };
