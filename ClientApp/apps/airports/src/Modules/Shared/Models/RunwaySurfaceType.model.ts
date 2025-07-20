import {
  modelProtection,
  getYesNoNull,
  YES_NO_NULL,
  getYesNoNullBoolean,
  CoreModel,
  ISelectOption,
  SelectOption,
} from '@wings-shared/core';
import { IAPIRunwaySurfaceType } from '../Interfaces';

@modelProtection
export class RunwaySurfaceTypeModel extends CoreModel implements ISelectOption {
  id: number = 0;
  code: string = '';
  description: string = '';
  isHardSurface: SelectOption;

  constructor(data?: Partial<RunwaySurfaceTypeModel>) {
    super();
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPIRunwaySurfaceType): RunwaySurfaceTypeModel {
    if (!apiData) {
      return new RunwaySurfaceTypeModel();
    }
    const data: Partial<RunwaySurfaceTypeModel> = {
      ...apiData,
      id: apiData.runwaySurfaceTypeId || apiData.id,
      isHardSurface: new SelectOption({
        value: getYesNoNullBoolean(apiData.isHardSurface),
        name: apiData.isHardSurface ? 'Yes' : apiData.isHardSurface === false ? 'No' : '',
      }),
    };
    return new RunwaySurfaceTypeModel(data);
  }

  static deserializeList(apiDataList: IAPIRunwaySurfaceType[]): RunwaySurfaceTypeModel[] {
    return apiDataList
      ? apiDataList.map((apiData: IAPIRunwaySurfaceType) => RunwaySurfaceTypeModel.deserialize(apiData))
      : [];
  }

  public serialize(): IAPIRunwaySurfaceType {
    return {
      id: this.id,
      code: this.code,
      name: this.name,
      description: this.description,
      isHardSurface: getYesNoNull(this.isHardSurface?.value as YES_NO_NULL),
      sourceTypeId: this.sourceTypeId,
      accessLevelId: this.accessLevelId,
      statusId: this.status?.value,
    };
  }

  // required for dropdown
  public get label(): string {
    return this.name;
  }

  public get value(): number {
    return this.id;
  }
}
