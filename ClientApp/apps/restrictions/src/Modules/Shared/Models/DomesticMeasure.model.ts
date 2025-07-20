import { CoreModel, ISelectOption, modelProtection, Utilities, SettingsTypeModel } from '@wings-shared/core';
import { DomesticMeasureCurfewHourModel } from './DomesticMeasureCurfewHour.model';
import {
  IAPIDomesticMeasure,
  IAPIDomesticMeasureRestrictedActivity,
  IAPIDomesticMeasurePPERequired,
  IAPIDomesticMeasureIdRequired,
} from '../Interfaces';

@modelProtection
export class DomesticMeasureModel extends CoreModel implements ISelectOption {
  id: number = 0;
  isAgeExemption: boolean = null;
  ageExemptionInfo: string = '';
  age: number = 0;
  isPPERequired: boolean = null;
  isAllowedTravelInCountry: boolean = null;
  isRegionalCurfewHours: boolean = null;
  isNationalCurfewHours: boolean = null;
  domesticTravelRequirements: string = '';
  isCrewVaccineExemption: boolean = null;
  isPassengerVaccineExemption: boolean = null;
  curfewHours: string = '';
  businessAvailable: string = '';
  isIdentificationRequiredOnPerson: boolean = null;
  extraInformation: string = '';
  domesticMeasurePPERequired: SettingsTypeModel[] = [];
  domesticMeasureRestrictedActivities: SettingsTypeModel[] = [];
  domesticMeasureRestrictedActivitiesName: string[] = [];
  domesticMeasureCurfewHours: DomesticMeasureCurfewHourModel[] = [];
  domesticMeasureIdRequired: SettingsTypeModel[] = [];
  isInherited: boolean = false;
  stateRegionSpecificInfo: string = '';

  constructor(data?: Partial<DomesticMeasureModel>) {
    super(data);
    Object.assign(this, data);
    this.domesticMeasureRestrictedActivities =
      data?.domesticMeasureRestrictedActivities?.map(a => new SettingsTypeModel(a)) || [];
    this.domesticMeasurePPERequired = data?.domesticMeasurePPERequired?.map(x => new SettingsTypeModel(x)) || [];
    this.domesticMeasureIdRequired = data?.domesticMeasureIdRequired?.map(x => new SettingsTypeModel(x)) || [];
  }

  static deserialize(apiData: IAPIDomesticMeasure): DomesticMeasureModel {
    if (!apiData) {
      return new DomesticMeasureModel();
    }
    const data: Partial<DomesticMeasureModel> = {
      ...apiData,
      id: apiData.domesticMeasureId,
      domesticMeasureRestrictedActivities:
        apiData.domesticMeasureRestrictedActivities?.map(a =>
          SettingsTypeModel.deserialize({ ...a, id: a.domesticMeasureRestrictedActivityId })
        ) || [],
      domesticMeasureRestrictedActivitiesName: apiData.domesticMeasureRestrictedActivities?.map(a => a.name),
      domesticMeasurePPERequired: (apiData.domesticMeasurePPERequired as IAPIDomesticMeasurePPERequired[])?.map(x =>
        SettingsTypeModel.deserialize({ ...x.ppeType, id: x.ppeType?.ppeTypeId })
      ),
      domesticMeasureIdRequired: (apiData.domesticMeasureIdRequired as IAPIDomesticMeasureIdRequired[])?.map(x =>
        SettingsTypeModel.deserialize({ ...x.idType, id: x.idType?.idTypeId })
      ),
      domesticMeasureCurfewHours: apiData.domesticMeasureCurfewHours?.map(a =>
        DomesticMeasureCurfewHourModel.deserialize(a)
      ),
    };
    return new DomesticMeasureModel(data);
  }

  public serialize(): IAPIDomesticMeasure {
    return {
      id: this.id,
      domesticMeasureId: this.id,
      isAgeExemption: this.isAgeExemption,
      ageExemptionInfo: this.isAgeExemption ? this.ageExemptionInfo : null,
      age: this.isAgeExemption ? this.age : null,
      isPPERequired: this.isPPERequired,
      isAllowedTravelInCountry: this.isAllowedTravelInCountry,
      businessAvailable: this.businessAvailable,
      isIdentificationRequiredOnPerson: this.isIdentificationRequiredOnPerson,
      extraInformation: this.extraInformation,
      domesticMeasurePPERequired: this.isPPERequired ? this.domesticMeasurePPERequired?.map(x => x.id) : [],
      domesticMeasureIdRequired: this.isIdentificationRequiredOnPerson
        ? this.domesticMeasureIdRequired?.map(x => x.id)
        : [],
      domesticMeasureRestrictedActivities: this.getDomesticMeasuredRestrictedActivites(),
      domesticTravelRequirements: this.domesticTravelRequirements,
      domesticMeasureCurfewHours: this.domesticMeasureCurfewHours.map(a => a.serialize()),
      isInherited: this.isInherited,
      stateRegionSpecificInfo: this.stateRegionSpecificInfo,
    };
  }

  private getDomesticMeasuredRestrictedActivites(): IAPIDomesticMeasureRestrictedActivity[] {
    return this.domesticMeasureRestrictedActivitiesName
      ?.filter(name => name.trim().length)
      .map(name => {
        const index = this.domesticMeasureRestrictedActivities.findIndex(reg => Utilities.isEqual(reg.name, name));
        if (index > -1) {
          return this.domesticMeasureRestrictedActivities[index].serialize();
        }
        return new SettingsTypeModel({ name, id: 0 }).serialize();
      });
  }

  static deserializeList(apiDataList: IAPIDomesticMeasure[]): DomesticMeasureModel[] {
    return apiDataList
      ? apiDataList.map((apiData: IAPIDomesticMeasure) => DomesticMeasureModel.deserialize(apiData))
      : [];
  }

  // required in auto complete
  public get label(): string {
    return this.name;
  }

  public get value(): string | number {
    return this.id;
  }
}
