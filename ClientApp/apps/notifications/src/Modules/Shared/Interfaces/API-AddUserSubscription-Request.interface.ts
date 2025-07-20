export interface IAPIAddUserSubscriptionRequest {
    CSDUserId: number;
    CustomerNumber: string;
    IsEnabled: boolean;
    Category: string;
    SubCategory: string;
    EventTypeId: number;
    ContactId: number;
    DeliveryType: string;
    Filter: string;
}