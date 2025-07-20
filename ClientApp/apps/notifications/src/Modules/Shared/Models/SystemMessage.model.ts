import { modelProtection, DATE_FORMAT, IdNameModel } from '@wings-shared/core';
import { IAPISystemMessage } from '../Interfaces';
import moment from 'moment';
import { SystemMessageTypeModel } from './SystemMessageType.model';

@modelProtection
export class SystemMessageModel extends IdNameModel {
  type: SystemMessageTypeModel = null;
  value: string = '';
  createdOn: string = '';
  description: string = '';

  constructor(data?: Partial<SystemMessageModel>) {
    super();
    Object.assign(this, data);
    this.type = new SystemMessageTypeModel(data?.type);
  }

  static deserialize(systemMessage: IAPISystemMessage): SystemMessageModel {
    if (!systemMessage) {
      return new SystemMessageModel();
    }

    const data: Partial<SystemMessageModel> = {
      id: systemMessage.SystemMessageId,
      type: SystemMessageTypeModel.deserialize(systemMessage.Type),
      value: systemMessage.Value,
      description: systemMessage.Description,
      createdOn: moment.utc(systemMessage.CreatedOn).local().format(DATE_FORMAT.API_FORMAT),
    };
    return new SystemMessageModel(data);
  }

  // serialize object for create/update API
  public serialize(): IAPISystemMessage {
    return {
      SystemMessageId: this.id,
      Type: this.type.value,
      Value: this.value,
      Description: this.description,
    };
  }

  static deserializeList(systemMessages: IAPISystemMessage[]): SystemMessageModel[] {
    return systemMessages
      ? systemMessages.map((systemMessage: IAPISystemMessage) => SystemMessageModel.deserialize(systemMessage))
      : [];
  }
}
