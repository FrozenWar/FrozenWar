import { createAction } from 'redux-actions';

// You can transfer to line number.... nevermind.
// Anyway, this transfers (or 'gives') entity ownership to target user.
// This is a debug feature, and it should be removed in production
export const TRANSFER = 'owner/transfer';

export const transfer = createAction(TRANSFER, (id, owner) => ({
  id, owner
}));
