import { IAPILogResponse } from '../Interfaces';
import { UserModel } from '@wings/notifications/src/Modules';
import { ISelectOption, modelProtection } from '@wings-shared/core';

@modelProtection
export class LogModel {
  id: string = '';
  actor: ActorModel = { id : '', username: '' };
  target: ActorModel = { id : '', username: '' };
  message: string = '';
  event: ISelectOption;
  source: ISelectOption;
  status: ISelectOption;
  timeStamp: string = '';
  context: any;

  constructor(data?: Partial<LogModel>) {
    Object.assign(this, data);
  }

  static deserialize(log: IAPILogResponse): LogModel {
    if (!log) {
      return new LogModel();
    }

    const data: Partial<LogModel> = {
      id: log.Id,
      actor: { id: log.Actor.Id, username: log.Actor.Username },
      target: { id: log.Target.Id, username: log.Target.Username },
      message: log.Message,
      event: { label: log.Event, value: log.Event },
      source: { label: log.Source, value: log.Source },
      status: { label: log.Status, value: log.Status },
      timeStamp: log.Timestamp || '',
      context: log.Context,
    };
    return new LogModel(data);
  }

  static deserializeList(log: IAPILogResponse[]): LogModel[] {
    return log
      ? log
        .map((logs: IAPILogResponse) =>
          LogModel.deserialize(logs))
      : [];
  }
}

export class ActorModel{
  id: string = '';
  username: string = '';
}