import { IAPIExecutionEntry } from '../Interfaces';
import { IdNameModel, modelProtection } from '@wings-shared/core';
import { DELIVERY_TYPE } from '../Enums';

@modelProtection
export class ExecutionEntry extends IdNameModel {
  executionEntryId: number = 0;
  executionSummaryId: number = 0;
  channelId: number = 0;
  subscriptionId: number = 0;
  subscriptionValue: string = '';
  subscriptionIdentifier: string = '';
  result: string = '';
  deliveredContent: string = '';
  deliveryType?: DELIVERY_TYPE = null;


  constructor(data?: Partial<ExecutionEntry>) {
    super();
    Object.assign(this, data);
  }

  static deserialize(executionEntry: IAPIExecutionEntry): ExecutionEntry {
    if (!executionEntry) {
      return new ExecutionEntry();
    }

    const data: Partial<ExecutionEntry> = {
      executionEntryId: executionEntry.ExecutionEntryId,
      executionSummaryId: executionEntry.ExecutionSummaryId,
      channelId: executionEntry.ChannelId,
      subscriptionId: executionEntry.SubscriptionId,
      subscriptionValue: executionEntry.SubscriptionValue,
      subscriptionIdentifier: executionEntry.SubscriptionIdentifier,
      result: executionEntry.Result,
      deliveredContent: executionEntry.DeliveredContent,
      deliveryType: executionEntry.DeliveryType,
    };

    return new ExecutionEntry(data);
  }

  static deserializeList(executionEntry: IAPIExecutionEntry[]): ExecutionEntry[] {
    return executionEntry
      ? executionEntry.map((executionsSummary: IAPIExecutionEntry) => ExecutionEntry.deserialize(executionsSummary))
      : [];
  }
}