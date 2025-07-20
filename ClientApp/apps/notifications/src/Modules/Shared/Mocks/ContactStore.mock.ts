import { Observable, of } from 'rxjs';
import { IAPIUpsertContactRequest } from '../Interfaces';
import { ContactModel } from '../Models';
import { ContactStore } from '../Stores';

export class ContactStoreMock extends ContactStore {
  public loadContacts(userId: number): Observable<ContactModel[]> {
    return of([ new ContactModel(), new ContactModel() ])
  }

  public upsertContact(request: IAPIUpsertContactRequest): Observable<ContactModel> {
    return of(new ContactModel());
  }

  public deleteContact(contactId: number): Observable<boolean> {
    return of(true);
  }

  public getContact(contactId: number): Observable<ContactModel> {
    return of(new ContactModel());
  }
}