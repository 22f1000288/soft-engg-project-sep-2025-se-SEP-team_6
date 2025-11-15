export const ROLE_ADMIN = 'admin';
export const ROLE_HR = 'hr';
export const ROLE_CANDIDATE = 'candidate';

export const ROLE_LABELS = {
  [ROLE_ADMIN]: 'Administrator',
  [ROLE_HR]: 'HR Manager',
  [ROLE_CANDIDATE]: 'Candidate',
};

export const DASHBOARD_ROUTE_BY_ROLE = {
  [ROLE_ADMIN]: '/admin-dashboard',
  [ROLE_HR]: '/hr-dashboard',
  [ROLE_CANDIDATE]: '/candidate-dashboard',
};
