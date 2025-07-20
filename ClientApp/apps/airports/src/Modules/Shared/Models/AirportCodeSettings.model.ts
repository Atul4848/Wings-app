import { CoreModel, ISelectOption, modelProtection } from '@wings-shared/core';
import { IAPICodeSettings } from '../Interfaces';

@modelProtection
export class AirportCodeSettingsModel extends CoreModel implements ISelectOption {
  code: string = '';

  constructor(data?: Partial<AirportCodeSettingsModel>) {
    super(data);
    Object.assign(this, data);
  }
  static deserialize(apiData: IAPICodeSettings): AirportCodeSettingsModel {
    if (!apiData) {
      return new AirportCodeSettingsModel();
    }
    return new AirportCodeSettingsModel({ ...apiData, ...CoreModel.deserializeAuditFields(apiData) });
  }

  static deserializeList(codeSettingsList: IAPICodeSettings[]): AirportCodeSettingsModel[] {
    return codeSettingsList
      ? codeSettingsList.map((apiData: IAPICodeSettings) => AirportCodeSettingsModel.deserialize({ ...apiData }))
      : [];
  }

  public serialize(): IAPICodeSettings {
    return {
      id: this.id,
      code: this.code,
      sourceTypeId: this.sourceTypeId,
      accessLevelId: this.accessLevelId,
      statusId: this.status?.value,
    };
  }

  // required for dropdown
  public get label(): string {
    return this.code;
  }

  public get value(): number {
    return this.id;
  }
}
