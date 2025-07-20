import { IdNameModel, modelProtection } from '@wings-shared/core';
import { IAPITemplate } from '../Interfaces';
import { ChannelModel } from './Channel.model';
import { EventTypeModel } from './EventType.model';
import { DeliveryTypeModel } from '.';
import { DELIVERY_TYPE } from '..';

@modelProtection
export class TemplateModel extends IdNameModel {
  templateGuid: string = '';
  deliveryType: DELIVERY_TYPE  = DELIVERY_TYPE.EMAIL;
  deliveryTypeName: string = '';
  channel: ChannelModel = null;
  eventType: EventTypeModel = null;
  content: string = '';
  description: string = '';
  testData: string = '';
  defaultTemplate: boolean = false;
  emailContent: string = '';
  version: number = 1;
  subject: string = '';
  useSendGrid: boolean = false
  sendGridTemplateId: string = '';

  constructor(data?: Partial<TemplateModel>) {
    super();
    Object.assign(this, data);
  }

  static deserialize(template: IAPITemplate): TemplateModel {
    if (!template) {
      return new TemplateModel();
    }

    const data: Partial<TemplateModel> = {
      id: template.TemplateId,
      templateGuid: template.TemplateGuid,
      name: template.Name,
      deliveryType: template.Channel?.Type,
      deliveryTypeName: template.DeliveryTypeName,
      channel: ChannelModel.deserialize(template.Channel),
      eventType: EventTypeModel.deserialize(template.EventType),
      content: template.Content,
      description: template.Description,
      testData: template.TestData,
      defaultTemplate: template.DefaultTemplate,
      version: template.Version,
      emailContent: template.Content,
      subject: template.Subject,
      sendGridTemplateId: template.SendGridTemplateId,
      useSendGrid: Boolean(template.SendGridTemplateId),
    };

    return new TemplateModel(data);
  }

  // serialize object for create/update API
  public serialize(): IAPITemplate {
    return {
      TemplateId: this.id,
      TemplateGuid: this.templateGuid,
      Name: this.name,
      DeliveryType: DeliveryTypeModel.searilize(this.channel?.type),
      DeliveryTypeName: this.deliveryTypeName,
      ChannelId: this.channel.id,
      EventTypeId: this.eventType.id,
      Content: this.content,
      Description: this.description,
      TestData: this.testData,
      DefaultTemplate: this.defaultTemplate,
      Version: this.version,
      Subject: this.subject,
      SendGridTemplateId: this.sendGridTemplateId,
    };
  }

  static deserializeList(templates: IAPITemplate[]): TemplateModel[] {
    return templates ? templates.map((template: IAPITemplate) => TemplateModel.deserialize(template)) : [];
  }
}
