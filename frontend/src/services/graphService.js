import api from './api';

/**
 * Fetch the execution graph nodes and edges for a given run.
 * @param {string} runId
 */
export async function getExecutionGraph(runId) {
  const { data } = await api.get(`/runs/${runId}/graph`);
  return data; // { nodes: [], edges: [] }
}

/**
 * Fetch the retrieval chunks used in a run.
 * @param {string} runId
 */
export async function getRetrievalChunks(runId) {
  const { data } = await api.get(`/runs/${runId}/retrieval`);
  return data; // { chunks: [] }
}

/**
 * Fetch tool calls made during a run.
 * @param {string} runId
 */
export async function getToolCalls(runId) {
  const { data } = await api.get(`/runs/${runId}/tools`);
  return data; // { tools: [] }
}

/**
 * Fetch the prompt chain (system, user, response) for a run.
 * @param {string} runId
 */
export async function getPromptChain(runId) {
  const { data } = await api.get(`/runs/${runId}/prompts`);
  return data; // { system: string, user: string, response: object, tokens: object }
}
