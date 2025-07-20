import { Observable, of } from 'rxjs';
import { RootTemplateModel } from '../Models';
import { TemplateStore } from '../Stores';
import { IAPIRootTemplate } from '../Interfaces';
import { TEMPLATE_TYPE } from '../Enums';

export class RootTemplateStoreMock extends TemplateStore {
  public getRootTemplate(templateType: TEMPLATE_TYPE): Observable<RootTemplateModel> {
    return of(
      new RootTemplateModel({
        id: 1,
        name: 'Template-1',
        content: 'abc',
      })
    );
  }

  public updateRootTemplate(request: IAPIRootTemplate): Observable<RootTemplateModel> {
    return of(new RootTemplateModel());
  }
  
}
