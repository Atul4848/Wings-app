import { CountryModel } from '@wings/shared';
import { CoreModel, ISelectOption, modelProtection, Utilities, SettingsTypeModel } from '@wings-shared/core';
import { IAPIAeronauticalInformationPublication } from './../Interfaces';

@modelProtection
export class AeronauticalInformationPublicationModel extends CoreModel implements ISelectOption {
  aipLink: string = '';
  aipUsername: string = '';
  aipPassword: string = '';
  country: CountryModel = null;
  countryId: number = 0;
  description?: string = '';
  aipSourceType: SettingsTypeModel;
  link?: SettingsTypeModel;
  aeronauticalInformationPublicationId?: number;

  constructor(data?: Partial<AeronauticalInformationPublicationModel>) {
    super(data);
    Object.assign(this, data);
    this.link = new SettingsTypeModel(data?.link);
  }

  static deserialize(apiData: IAPIAeronauticalInformationPublication): AeronauticalInformationPublicationModel {
    if (!apiData) {
      return new AeronauticalInformationPublicationModel();
    }
    const data: Partial<AeronauticalInformationPublicationModel> = {
      ...CoreModel.deserializeAuditFields(apiData),
      id: apiData.aeronauticalInformationPublicationId || apiData.id,
      aipLink: apiData.aipLink,
      aipUsername: apiData.aipUsername || apiData.aipUserName,
      aipPassword: apiData.aipPassword,
      description: apiData.description,
      countryId: CountryModel.deserialize(apiData.country).id,
      aipSourceType: SettingsTypeModel.deserialize({
        id: apiData.aipSourceType?.aipSourceTypeId,
        name: apiData.aipSourceType?.name,
      }),
      link: SettingsTypeModel.deserialize({
        ...apiData,
        id: apiData.aeronauticalInformationPublicationId || apiData.id,
        name: apiData.aipLink,
      }),
    };
    return new AeronauticalInformationPublicationModel(data);
  }

  static deserializeList(
    apiDataList: IAPIAeronauticalInformationPublication[]
  ): AeronauticalInformationPublicationModel[] {
    return apiDataList
      ? apiDataList.map((apiData: IAPIAeronauticalInformationPublication) =>
        AeronauticalInformationPublicationModel.deserialize(apiData)
      )
      : [];
  }

  public serialize(): IAPIAeronauticalInformationPublication {
    return {
      ...this._serialize(),
      id: this.id,
      aipLink: this.aipLink || this.link?.name,
      aipUsername: this.aipUsername,
      aipPassword: this.aipPassword,
      countryId: this.countryId,
      description: this.description,
      aipSourceTypeId: Utilities.getNumberOrNullValue(this.aipSourceType?.id),
    };
  }

  public get label(): string {
    return this.aipLink || this.link?.name;
  }

  public get value(): string | number {
    return this.id;
  }
}
