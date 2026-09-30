// World, life-moment score and checklist. Now served by the mock server, later by the real API.

import type { ChecklistResponse, MomentResponse, WorldResponse } from '../state/types';
import { request } from './http';

export const momentService = {
  getWorld: (customerId: string) => request<WorldResponse>('GET', `/customers/${customerId}/world`),

  getFamilyMoment: (customerId: string) =>
    request<MomentResponse>('GET', `/customers/${customerId}/moments/family`),

  answer: (customerId: string, answer: 'confirm' | 'reject') =>
    request<MomentResponse>('POST', `/customers/${customerId}/moments/family/answer`, { answer }),

  getChecklist: (customerId: string) =>
    request<ChecklistResponse>('GET', `/customers/${customerId}/moments/family/checklist`),
};
