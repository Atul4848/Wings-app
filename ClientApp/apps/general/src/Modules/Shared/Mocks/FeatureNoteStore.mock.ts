import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { FeatureNoteModel } from '../Models';
import { FeatureNoteStore } from '../Stores';

export class FeatureNoteStoreMock extends FeatureNoteStore {
  public getFeatureNotes(): Observable<FeatureNoteModel[]> {
    return of([ new FeatureNoteModel(), new FeatureNoteModel() ]).
      pipe(tap(featureNotes => (this.featureNotes = featureNotes)));
  }

  public removeFeatureNote({ id }: FeatureNoteModel): Observable<boolean> {
    return of(true);
  }

  public updateFeatureNote(featureNote: FeatureNoteModel): Observable<boolean> {
    return of(true);
  }

  public loadFeatureNoteById(id: string): Observable<FeatureNoteModel> {
    return of(
      new FeatureNoteModel({
        id: '62273d6dfb6255e36a491cb0',
        startDate: '2022-03-18',
        title: 'test1',
        message: 'test markdown',
      })
    );
  }
}
