import {
  AccessLevelModel,
  CoreModel,
  ISelectOption,
  SourceTypeModel,
  StatusTypeModel,
  Utilities,
  modelProtection,
  SettingsTypeModel,
} from '@wings-shared/core';
import { IAPIFARType } from '../Interfaces';

@modelProtection
export class FARTypeModel extends CoreModel implements ISelectOption {
  cappsCode: string = '';
  flightOperationalCategory: SettingsTypeModel;
  purposeOfFlights: SettingsTypeModel[] = [];

  constructor(data?: Partial<FARTypeModel>) {
    super(data);
    Object.assign(this, data);
    this.flightOperationalCategory = new SettingsTypeModel(data?.flightOperationalCategory);
    this.purposeOfFlights = data?.purposeOfFlights?.map(a => new SettingsTypeModel(a));
  }

  static deserialize(apiData: IAPIFARType): FARTypeModel {
    if (!apiData) {
      return new FARTypeModel();
    }
    return new FARTypeModel({
      ...apiData,
      status: StatusTypeModel.deserialize(apiData.status),
      accessLevel: AccessLevelModel.deserialize(apiData.accessLevel),
      sourceType: SourceTypeModel.deserialize(apiData.sourceType),
      flightOperationalCategory: SettingsTypeModel.deserialize({
        ...apiData.flightOperationalCategory,
        id: apiData.flightOperationalCategory?.flightOperationalCategoryId || apiData.flightOperationalCategory?.id,
      }),
      purposeOfFlights: apiData.purposeOfFlights?.map(x => new SettingsTypeModel({ ...x, id: x.purposeOfFlightId })),
    });
  }

  // serialize object for create/update API
  public serialize(): IAPIFARType {
    return {
      id: this.id,
      cappsCode: this.cappsCode,
      name: this.name,
      accessLevelId: this.accessLevel?.id,
      sourceTypeId: this.sourceType?.id,
      statusId: Utilities.getNumberOrNullValue(this.status?.value),
      flightOperationalCategoryId: this.flightOperationalCategory?.id,
      farTypePurposeOfFlights: this.purposeOfFlights?.map(x => {
        return {
          farTypeId: this.id,
          purposeOfFlightId: x.id,
        };
      }),
    };
  }

  static deserializeList(apiDataList: IAPIFARType[]): FARTypeModel[] {
    return apiDataList ? apiDataList.map((apiData: IAPIFARType) => FARTypeModel.deserialize(apiData)) : [];
  }

  // required in auto complete
  public get label(): string {
    return this.name || this.cappsCode;
  }

  public get value(): string | number {
    return this.id;
  }
}
