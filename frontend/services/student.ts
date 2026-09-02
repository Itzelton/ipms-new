import { apiGet } from './api';

export async function getStudentDashboard() {
  return await apiGet('/students/dashboard');
}
