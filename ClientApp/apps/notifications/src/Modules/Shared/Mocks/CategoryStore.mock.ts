import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CategoryModel } from '../Models';
import { CategoryStore } from '../Stores';

export class CategoryStoreMock extends CategoryStore {
  public getCategories(): Observable<CategoryModel[]> {
    return of([ new CategoryModel(), new CategoryModel() ]).pipe(tap(categories => (this.categories = categories)));
  }

  public removeCategory({ id }: CategoryModel): Observable<boolean> {
    return of(true);
  }

  public upsertCategory(category: CategoryModel): Observable<CategoryModel> {
    return of(new CategoryModel());
  }
}
