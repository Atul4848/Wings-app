import { TEMPLATE_TYPE } from '../Enums'

export interface IAPIRootTemplate {
  RootTemplateId: number,
  Subject: string,
  Content: string,
  TemplateType: TEMPLATE_TYPE
}