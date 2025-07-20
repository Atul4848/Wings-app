import { CoreModel, ISelectOption, modelProtection } from '@wings-shared/core';
import { IAPIAerodromeReferenceCode } from '../Interfaces';

@modelProtection
export class AerodromeReferenceCodeModel extends CoreModel implements ISelectOption {
  code: string = '';

  constructor(data?: Partial<AerodromeReferenceCodeModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiAerodromeReferenceCode: IAPIAerodromeReferenceCode): AerodromeReferenceCodeModel {
    if (!apiAerodromeReferenceCode) {
      return new AerodromeReferenceCodeModel();
    }
    return new AerodromeReferenceCodeModel({
      ...apiAerodromeReferenceCode,
    });
  }

  static deserializeList(apiAerodromeReferenceCodeList: IAPIAerodromeReferenceCode[]): AerodromeReferenceCodeModel[] {
    return apiAerodromeReferenceCodeList
      ? apiAerodromeReferenceCodeList.map((apiAerodromeReferenceCode: IAPIAerodromeReferenceCode) =>
        AerodromeReferenceCodeModel.deserialize(apiAerodromeReferenceCode)
      )
      : [];
  }

  // required in auto complete
  public get label(): string {
    return this.code;
  }

  public get value(): string | number {
    return this.id;
  }
}
