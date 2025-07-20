import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { EventTypeModel, TemplateModel } from '../Models';
import { TemplateStore } from '../Stores';

export class TemplateStoreMock extends TemplateStore {
  public getTemplates(): Observable<TemplateModel[]> {
    return of([ new TemplateModel({ name: 'Template1', eventType: new EventTypeModel({ id: 1 }) }),
      new TemplateModel({ name: 'Template2', eventType: new EventTypeModel({ id: 2 }) }) ]).pipe(
      tap(templates => (this.templates = templates))
    );
  }

  public removeTemplate({ id }: TemplateModel): Observable<boolean> {
    return of(true);
  }

  public upsertTemplate(template: TemplateModel): Observable<TemplateModel> {
    return of(new TemplateModel());
  }

  public loadTemplateById(id: number): Observable<TemplateModel> {
    return of(
      new TemplateModel({
        id: 1,
        name: 'Template-1',
        content: 'A test email for username: {{username}}.',
      })
    );
  }
}
