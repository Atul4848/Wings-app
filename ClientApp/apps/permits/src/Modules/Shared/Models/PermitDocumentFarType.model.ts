import { modelProtection, CoreModel, IdNameCodeModel, ISelectOption } from '@wings-shared/core';
import { IAPIPermitDocumentFarType } from '../Interfaces';

@modelProtection
export class PermitDocumentFarTypeModel extends CoreModel implements ISelectOption {
  permitDocumentId: number;
  farType: IdNameCodeModel;
  code?: string;

  constructor(data?: Partial<PermitDocumentFarTypeModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPIPermitDocumentFarType): PermitDocumentFarTypeModel {
    if (!apiData) {
      return new PermitDocumentFarTypeModel();
    }
    const data: Partial<PermitDocumentFarTypeModel> = {
      ...apiData,
      id: apiData.id || apiData.permitDocumentFarTypeId,
      permitDocumentId: apiData.permitDocumentId,
      farType: IdNameCodeModel.deserialize({
        name: apiData.farType.name,
        code: apiData.farType.cappsCode,
        id: apiData.farType.farTypeId,
      }),
      code: apiData.farType.cappsCode,
    };

    return new PermitDocumentFarTypeModel(data);
  }

  static deserializeList(apiData: IAPIPermitDocumentFarType[]): PermitDocumentFarTypeModel[] {
    return apiData
      ? apiData.map((apiData: IAPIPermitDocumentFarType) => PermitDocumentFarTypeModel.deserialize(apiData))
      : [];
  }

  // required in auto complete
  public get label(): string {
    return this.farType?.name || this.name;
  }

  public get value(): string | number {
    return this.farType?.id || this.id;
  }
}
