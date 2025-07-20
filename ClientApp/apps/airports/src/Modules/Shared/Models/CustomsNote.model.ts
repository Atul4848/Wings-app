import { CoreModel, ISelectOption, SelectOption, SettingsTypeModel } from '@wings-shared/core';
import { IAPICustomsNote } from '../Interfaces';

export class CustomsNoteModel extends CoreModel implements ISelectOption {
  notes: string;
  noteType: SettingsTypeModel;
  typeCode: SelectOption;
  customsDetailId: number;
  startDate: string;
  endDate: string;

  constructor(data?: Partial<CustomsNoteModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPICustomsNote): CustomsNoteModel {
    if (!apiData) {
      return new CustomsNoteModel();
    }
    const data: Partial<CustomsNoteModel> = {
      ...apiData,
      id: apiData.id || apiData.noteId,
      customsDetailId: apiData.customsDetailId,
      startDate: apiData.startDate,
      endDate: apiData.endDate,
      noteType: new SettingsTypeModel({
        ...apiData.noteType,
        id: apiData.noteType?.id || apiData.noteType?.noteTypeId,
      }),
      typeCode: new SelectOption({
        name: apiData.typeCode,
        value: apiData.typeCode,
      }),
    };
    return new CustomsNoteModel(data);
  }

  static deserializeList(apiDataList: IAPICustomsNote[]): CustomsNoteModel[] {
    return apiDataList ? apiDataList.map((apiData: IAPICustomsNote) => CustomsNoteModel.deserialize(apiData)) : [];
  }

  public serialize(): IAPICustomsNote {
    return {
      id: this.id,
      customsDetailId: this.customsDetailId,
      notes: this.notes,
      noteTypeId: this.noteType?.id,
      typeCode: this.typeCode?.name,
      startDate: this.startDate || null,
      endDate: this.endDate || null,
    };
  }

  // we need value and label getters for Autocomplete
  public get label(): string {
    return this.name;
  }

  public get value(): number {
    return this.id;
  }
}
