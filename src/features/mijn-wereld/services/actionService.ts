// Straight-Through Processing: Kate executes one checklist item. Now mocked.

import type { ActionResponse, TodoId } from '../state/types';
import { request } from './http';

export const actionService = {
  execute: (customerId: string, todoId: TodoId) =>
    request<ActionResponse>('POST', `/customers/${customerId}/actions/${todoId}`),
};
