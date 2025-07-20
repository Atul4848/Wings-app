export interface IAPIUpsertUVGOBannerRequest {
  Id?: string;
  EffectiveEndDate: string;
  EffectiveStartDate: string;
  Message: string;
  ApplicationName?: string;
  RequestedDate: string;
  NotificationTypeId: number;
  NotificationServiceId: number;
  RequesterUserName: string;
  EmbeddedLink: string;
}
