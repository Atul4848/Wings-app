import { CoreModel, modelProtection } from '@wings-shared/core';
import { IAPIDMNote } from '../Interfaces';

@modelProtection
export class DMNoteModel extends CoreModel {
  dmNote: string = '';
  permitId: number;

  constructor(data?: Partial<DMNoteModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiDMNote: IAPIDMNote): DMNoteModel {
    if (!apiDMNote) {
      return new DMNoteModel();
    }
    return new DMNoteModel({
      ...apiDMNote,
      id: apiDMNote.permitDMNoteId || apiDMNote.id,
    });
  }
  // serialize object for create/update API
  public serialize(): IAPIDMNote {
    return {
      id: this.id || 0,
      permitId: this.permitId,
      dmNote: this.dmNote,
    };
  }
}
