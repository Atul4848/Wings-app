import { IAPIAerodromeRefCode } from '../Interfaces';
import { CoreModel, ISelectOption, modelProtection } from '@wings-shared/core';

@modelProtection
export class AerodromeRefCodeModel extends CoreModel implements ISelectOption {
  code: string = '';
  fieldLength: String = '';
  wingSpan: string = '';
  outerWheelSpan: string = '';
  description: string = '';

  constructor(data?: Partial<AerodromeRefCodeModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiAerodromeRefCode: IAPIAerodromeRefCode): AerodromeRefCodeModel {
    if (!apiAerodromeRefCode) {
      return new AerodromeRefCodeModel();
    }
    const data: Partial<AerodromeRefCodeModel> = {
      ...apiAerodromeRefCode,
    };
    return new AerodromeRefCodeModel(data);
  }

  public serialize(): IAPIAerodromeRefCode {
    return {
      id: this.id,
      code: this.code,
      fieldLength: this.fieldLength,
      wingSpan: this.wingSpan,
      outerWheelSpan: this.outerWheelSpan,
      description: this.description,
      accessLevelId: this.accessLevel?.id,
      statusId: this.status?.id,
    };
  }

  static deserializeList(apiDataList: IAPIAerodromeRefCode[]): AerodromeRefCodeModel[] {
    return apiDataList
      ? apiDataList.map((apiData: IAPIAerodromeRefCode) => AerodromeRefCodeModel.deserialize(apiData))
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
