import { ISelectOption, IdNameModel, modelProtection } from '@wings-shared/core';
import { IAPIChannel } from '../Interfaces';
import { DeliveryTypeModel, ProviderModel } from '.';
import { DELIVERY_TYPE } from '../Enums';

@modelProtection
export class ChannelModel extends IdNameModel implements ISelectOption {
  type: DeliveryTypeModel = null;
  provider: ProviderModel = null;
  contentSize: number = 0;
  systemCreated: boolean = false;
  systemEnabled: boolean = false;
  publicEnabled: boolean = false;
  description: string = '';
  isUsedInTemplate: boolean = false;

  constructor(data?: Partial<ChannelModel>) {
    super();
    Object.assign(this, data);
    this.type = new DeliveryTypeModel(data?.type);
    this.provider = new ProviderModel(data?.provider);
  }

  static deserialize(channel: IAPIChannel): ChannelModel {
    if (!channel) {
      return new ChannelModel();
    }

    const data: Partial<ChannelModel> = {
      id: channel.ChannelId,
      name: channel.Name,
      type: DeliveryTypeModel.deserialize(channel.Type),
      provider: ProviderModel.deserialize(channel.Provider),
      contentSize: channel.ContentSize,
      systemCreated: channel.SystemCreated,
      systemEnabled: channel.SystemEnabled,
      publicEnabled: channel.PublicEnabled,
      description: channel.Description,
      isUsedInTemplate: channel.IsUsedInTemplate,
    };

    return new ChannelModel(data);
  }

  // serialize object for create/update API
  public serialize(): IAPIChannel {
    return {
      ChannelId: this.id,
      Name: this.name,
      Type: this.type.value as DELIVERY_TYPE,
      ProviderId: this.provider.id,
      ContentSize: this.contentSize,
      SystemCreated: this.systemCreated,
      SystemEnabled: this.systemEnabled,
      PublicEnabled: this.publicEnabled,
      Description: this.description,
      IsUsedInTemplate: this.isUsedInTemplate,
    };
  }

  static deserializeList(channels: IAPIChannel[]): ChannelModel[] {
    return channels ? channels.map((channel: IAPIChannel) => ChannelModel.deserialize(channel)) : [];
  }

  // required in auto complete
  public get label(): string {
    return this.name;
  }

  public get value(): string | number {
    return this.id;
  }
}
