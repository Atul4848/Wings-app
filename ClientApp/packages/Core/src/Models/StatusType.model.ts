import { MODEL_STATUS } from '../Enums';
import { IBaseApiResponse, ISelectOption } from '../Interfaces';
import { IdNameModel } from './IdName.model';

export class StatusTypeModel extends IdNameModel<MODEL_STATUS> implements ISelectOption {
  constructor(data?: Partial<StatusTypeModel>) {
    super();
    Object.assign(this, data);
    this.id = data?.id || MODEL_STATUS.ACTIVE;
    this.name = data?.name || 'Active';
  }

  static deserialize(apiData: IBaseApiResponse): StatusTypeModel {
    if (!apiData) {
      return new StatusTypeModel();
    }
    const data: Partial<StatusTypeModel> = {
      id: apiData.statusId || apiData.id,
      name: apiData.name,
    };
    return new StatusTypeModel(data);
  }

  static deserializeList(apiDataList: IBaseApiResponse[]): StatusTypeModel[] {
    return apiDataList ? apiDataList.map((apiData: IBaseApiResponse) => StatusTypeModel.deserialize(apiData)) : [];
  }

  // required in auto complete
  public get label(): string {
    return this.name;
  }

  public get value(): number {
    return this.id;
  }
}
