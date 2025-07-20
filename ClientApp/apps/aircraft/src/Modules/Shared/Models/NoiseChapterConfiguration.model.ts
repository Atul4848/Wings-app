import { CoreModel, ISelectOption, modelProtection, SettingsTypeModel } from '@wings-shared/core';
import { IAPINoiseChapterConfiguration } from '../Interfaces';

@modelProtection
export class NoiseChapterConfigurationModel extends CoreModel implements ISelectOption {
  noiseChapter: SettingsTypeModel;
  aircraftNoiseType: SettingsTypeModel;
  noiseDateTypeCertification: SettingsTypeModel;

  constructor(data?: Partial<NoiseChapterConfigurationModel>) {
    super(data);
    Object.assign(this, data);
    this.noiseChapter = new SettingsTypeModel(data?.noiseChapter);
    this.aircraftNoiseType = new SettingsTypeModel(data?.aircraftNoiseType);
    this.noiseDateTypeCertification = new SettingsTypeModel(data?.noiseDateTypeCertification);
  }

  static deserialize(apiData: IAPINoiseChapterConfiguration): NoiseChapterConfigurationModel {
    if (!apiData) {
      return new NoiseChapterConfigurationModel();
    }
    const data: Partial<NoiseChapterConfigurationModel> = {
      ...apiData,
      noiseChapter: SettingsTypeModel.deserialize({ ...apiData.noiseChapter, id: apiData.noiseChapter.noiseChapterId }),
      aircraftNoiseType: SettingsTypeModel.deserialize({
        ...apiData.aircraftNoiseType,
        id: apiData.aircraftNoiseType.aircraftNoiseTypeId,
      }),
      noiseDateTypeCertification: SettingsTypeModel.deserialize({
        ...apiData.noiseDateTypeCertification,
        id: apiData.noiseDateTypeCertification.noiseDateTypeCertificationId,
      }),
    };
    return new NoiseChapterConfigurationModel(data);
  }

  public serialize(): IAPINoiseChapterConfiguration {
    return {
      id: this.id,
      aircraftNoiseTypeId: this.aircraftNoiseType.id,
      noiseChapterId: this.noiseChapter.id,
      noiseDateTypeCertificationId: this.noiseDateTypeCertification.id,
    };
  }

  static deserializeList(apiDataList: IAPINoiseChapterConfiguration[]): NoiseChapterConfigurationModel[] {
    return apiDataList
      ? apiDataList.map((apiData: IAPINoiseChapterConfiguration) => NoiseChapterConfigurationModel.deserialize(apiData))
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
