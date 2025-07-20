import { IAPIExecutionEntry } from '.';

export class IAPIExecutionSummary {
    ExecutionSummaryId: number;
    Message: string;
    EventId: number;
    EventGuid: string;
    EventType: string;
    SubscriptionsAffected: number;
    StartTime: string;
    EndTime: string;
    Result: string;
    CreatedOn: string;
    ExecutionEntry: IAPIExecutionEntry[];
}

