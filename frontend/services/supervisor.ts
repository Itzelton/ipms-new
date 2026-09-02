import { apiGet } from './api';

export async function getSupervisorDashboard() {
  return await apiGet('/supervisors/dashboard');
}
