import api from './api';

/**
 * Fetch the list of all evaluation runs with optional pagination.
 * @param {number} page
 * @param {number} limit
 */
export async function getEvaluationRuns(page = 1, limit = 10) {
  const { data } = await api.get('/eval/runs', { params: { page, limit } });
  return data; // { runs: [], total: number }
}

/**
 * Fetch detailed results for a single evaluation run.
 * @param {string} runId
 */
export async function getEvaluationRun(runId) {
  const { data } = await api.get(`/eval/runs/${runId}`);
  return data;
}

/**
 * Trigger a new evaluation run against the golden dataset.
 */
export async function triggerEvaluation() {
  const { data } = await api.post('/eval/run');
  return data; // { run_id: string, status: string }
}

/**
 * Fetch the golden dataset entries.
 * @param {number} page
 * @param {number} limit
 */
export async function getGoldenDataset(page = 1, limit = 20) {
  const { data } = await api.get('/eval/golden', { params: { page, limit } });
  return data;
}
