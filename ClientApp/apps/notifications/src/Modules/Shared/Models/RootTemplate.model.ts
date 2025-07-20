import { IAPIRootTemplate } from '../Interfaces';
import { IdNameModel, modelProtection } from '@wings-shared/core';
import { TEMPLATE_TYPE } from '../Enums';

@modelProtection
export class RootTemplateModel extends IdNameModel {
  subject: string = '';
  content: string = '';
  templateType: TEMPLATE_TYPE;

  constructor(data?: Partial<RootTemplateModel>) {
    super();
    Object.assign(this, data);
  }

  static deserialize(rootTemplate: IAPIRootTemplate): RootTemplateModel {
    if (!rootTemplate) {
      return new RootTemplateModel();
    }

    const data: Partial<RootTemplateModel> = {
      id: rootTemplate.RootTemplateId,
      subject: rootTemplate.Subject,
      content: rootTemplate.Content,
      templateType: rootTemplate.TemplateType,
    };

    return new RootTemplateModel(data);
  }
}