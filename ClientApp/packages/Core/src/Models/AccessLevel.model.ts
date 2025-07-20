import { IBaseApiResponse, ISelectOption } from '../Interfaces';
import { modelProtection } from '../Decorators';
import { IdNameModel } from './IdName.model';

@modelProtection
export class AccessLevelModel extends IdNameModel implements ISelectOption {
  constructor(data?: Partial<AccessLevelModel>) {
    super();
    // Need this default id 1 for all models
    this.id = data?.id || 1;
    this.name = data?.name || 'Public';
  }

  static deserialize(apiData: IBaseApiResponse): AccessLevelModel {
    if (!apiData) {
      return new AccessLevelModel();
    }
    const data: Partial<AccessLevelModel> = {
      id: apiData.accessLevelId || apiData.id,
      name: apiData.name,
    };
    return new AccessLevelModel(data);
  }

  static deserializeList(apiDataList: IBaseApiResponse[]): AccessLevelModel[] {
    return apiDataList ? apiDataList.map((apiData: IBaseApiResponse) => AccessLevelModel.deserialize(apiData)) : [];
  }

  // required in auto complete
  public get label(): string {
    return this.name;
  }

  public get value(): number {
    return this.id;
  }
}
