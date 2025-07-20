import { IAPIExecutionSummary } from '../Interfaces';
import { IdNameModel, modelProtection } from '@wings-shared/core';
import { ExecutionEntry } from './ExecutionEntry.model';

@modelProtection
export class ExecutionSummaryModel extends IdNameModel {
  executionSummaryId: number = 0;
  message: string = '';
  eventId: number = 0;
  eventGuid: string = '';
  eventType: string = '';
  subscriptionsAffected: number = 0;
  startTime: string = '';
  endTime: string = '';
  result: string = '';
  createdOn: string = '';
  executionEntry: ExecutionEntry[] = [];

  constructor(data?: Partial<ExecutionSummaryModel>) {
    super();
    Object.assign(this, data);
    this.executionEntry = data?.executionEntry?.map(x => new ExecutionEntry(x)) || [];
  }

  static deserialize(executionSummary: IAPIExecutionSummary): ExecutionSummaryModel {
    if (!executionSummary) {
      return new ExecutionSummaryModel();
    }

    const data: Partial<ExecutionSummaryModel> = {
      executionSummaryId: executionSummary.ExecutionSummaryId,
      message: executionSummary.Message,
      eventId: executionSummary.EventId,
      eventGuid: executionSummary.EventGuid,
      eventType: executionSummary.EventType,
      subscriptionsAffected: executionSummary.SubscriptionsAffected,
      startTime: executionSummary.StartTime,
      endTime: executionSummary.EndTime,
      result: executionSummary.Result,
      createdOn: executionSummary.CreatedOn,
      executionEntry: ExecutionEntry.deserializeList(executionSummary.ExecutionEntry),
    };

    return new ExecutionSummaryModel(data);
  }

  static deserializeList(executionSummary: IAPIExecutionSummary[]): ExecutionSummaryModel[] {
    return executionSummary
      ? executionSummary
        .map((executionsSummary: IAPIExecutionSummary) =>
          ExecutionSummaryModel.deserialize(executionsSummary))
      : [];
  }
}