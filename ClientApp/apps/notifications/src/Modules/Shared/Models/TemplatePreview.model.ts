export class TemplatePreviewModel {
  type: string = '';
  subject: string = '';
  sendTo: string = '';
  content: string = '';
  includeRootTemplate: boolean = false;

  constructor(data?: Partial<TemplatePreviewModel>) {
    Object.assign(this, data);
  }
}