import { MESSAGE_LEVEL } from '../Enums';
import { ISelectOption, IdNameModel } from '@wings-shared/core';

export class MessageLevelModel extends IdNameModel<MESSAGE_LEVEL> implements ISelectOption {
  constructor(data?: Partial<MessageLevelModel>) {
    super();
    this.id = data?.id || MESSAGE_LEVEL.GENERAL;
    this.name = data?.name || MESSAGE_LEVEL.GENERAL;
  }

  static deserialize(eventLevel: MESSAGE_LEVEL): MessageLevelModel {
    if (!eventLevel) {
      return new MessageLevelModel();
    }

    const data: Partial<MessageLevelModel> = {
      id: eventLevel,
      name: eventLevel,
    }

    return new MessageLevelModel(data);
  }

  // required in auto complete
  public get label(): string {
    return this.name;
  }

  public get value(): string {
    return this.id;
  }
}