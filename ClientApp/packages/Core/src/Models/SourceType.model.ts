import { IBaseApiResponse, ISelectOption } from '../Interfaces';
import { modelProtection } from '../Decorators';
import { IdNameModel } from './IdName.model';

@modelProtection
export class SourceTypeModel extends IdNameModel implements ISelectOption {
  constructor(data?: Partial<SourceTypeModel>) {
    super();
    Object.assign(this, data);
  }

  static deserialize(apiData: IBaseApiResponse): SourceTypeModel {
    if (!apiData) {
      return new SourceTypeModel();
    }

    const data: Partial<SourceTypeModel> = {
      id: apiData.sourceTypeId || apiData.id,
      name: apiData.name,
    };
    return new SourceTypeModel({ ...data });
  }

  static deserializeList(apiDataList: IBaseApiResponse[]): SourceTypeModel[] {
    return apiDataList ? apiDataList.map((apiData: IBaseApiResponse) => SourceTypeModel.deserialize(apiData)) : [];
  }

  // required in auto complete
  public get label(): string {
    return this.name;
  }

  public get value(): number {
    return this.id;
  }
}
