import { ApprovalStatus } from './ApprovalStatus.interface';

export interface WithStatus<T> {
  status: ApprovalStatus;
}
