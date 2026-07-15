import api from './api';

/**
 * Send a message to the ASRE agent.
 * @param {string} message – User's message text
 * @param {string[]} [history] – Prior conversation messages (optional)
 * @returns {Promise<{ reply: string, execution: object }>}
 */
export async function sendMessage(message, history = []) {
  const { data } = await api.post('/chat', { message, history });
  return data;
}

/**
 * Retrieve the execution trace for a specific run.
 * @param {string} runId
 */
export async function getExecutionTrace(runId) {
  const { data } = await api.get(`/runs/${runId}/trace`);
  return data;
}
