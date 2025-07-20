import { modelProtection, DATE_FORMAT, IdNameModel } from '@wings-shared/core';
import { IAPIEvent } from '../Interfaces';
import { MessageLevelModel, EventTypeModel, FieldDefinitionModel } from './index';
import moment from 'moment';
import { MESSAGE_LEVEL } from '../Enums';

@modelProtection
export class EventModel extends IdNameModel {
  triggerTime: string = '';
  eventGuid: string = '';
  status: string = '';
  eventTypeId: number = 0;
  eventType: EventTypeModel = null;
  attributeDefinition: FieldDefinitionModel[] = [];
  level: MessageLevelModel = null;
  subject: string = '';
  content: string = '';

  constructor(data?: Partial<EventModel>) {
    super();
    Object.assign(this, data);
    this.eventType = data?.eventType ? new EventTypeModel(data.eventType) : null;
    this.attributeDefinition = data?.attributeDefinition?.map(x => new FieldDefinitionModel(x)) || [];
    this.level = new MessageLevelModel(data?.level);
  }

  static deserialize(event: IAPIEvent): EventModel {
    if (!event) {
      return new EventModel();
    }

    const data: Partial<EventModel> = {
      id: event.EventId,
      eventGuid: event.EventGuid,
      triggerTime: event.TriggerTime ? moment.utc(event.TriggerTime).local().format(DATE_FORMAT.API_FORMAT) : null,
      status: event.Status,
      eventTypeId: event.EventTypeId,
      eventType: EventTypeModel.deserialize(event.EventType),
      attributeDefinition: FieldDefinitionModel.deserializeList(event.AttributeDefinition),
      level: MessageLevelModel.deserialize(event.Level),
      subject: event.Subject,
      content: event.Content,
    };

    return new EventModel(data);
  }

  // serialize object for create/update API
  public serialize(): IAPIEvent {
    return {
      EventId: this.id,
      TriggerTime: this.triggerTime ? moment(this.triggerTime).utc().format(DATE_FORMAT.API_FORMAT) : null,
      EventTypeId: this.eventType.id,
      Level: this.level.value as MESSAGE_LEVEL,
      Subject: this.subject,
      Content: this.content,
      AttributeDefinition:
        this.attributeDefinition?.map((fieldDefinition: FieldDefinitionModel) => fieldDefinition.serialize()) || [],
    };
  }

  static deserializeList(events: IAPIEvent[]): EventModel[] {
    return events ? events.map((event: IAPIEvent) => EventModel.deserialize(event)) : [];
  }
}
