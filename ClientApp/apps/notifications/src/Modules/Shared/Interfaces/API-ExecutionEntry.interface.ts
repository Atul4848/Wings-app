import { DELIVERY_TYPE } from '../Enums';

export class IAPIExecutionEntry {
    ExecutionEntryId: number;
    ExecutionSummaryId: number;
    SubscriptionId: number;
    SubscriptionValue: string;
    SubscriptionIdentifier: string;
    ChannelId: number;
    Result: string;
    DeliveryType?: DELIVERY_TYPE;
    DeliveredContent: string;
}

