import { IAPIGridRequest } from '@wings-shared/core';

export interface IAPIPagedUserRequest extends IAPIGridRequest {
  limit?: number;
  after?: string;
}
