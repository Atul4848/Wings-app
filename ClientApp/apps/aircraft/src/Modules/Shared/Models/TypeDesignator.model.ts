import {
  AccessLevelModel,
  CoreModel,
  ISelectOption,
  SourceTypeModel,
  modelProtection,
  SettingsTypeModel,
} from '@wings-shared/core';
import { IAPITypeDesignator } from '../Interfaces';

@modelProtection
export class TypeDesignatorModel extends CoreModel implements ISelectOption {
  propulsionType: SettingsTypeModel;
  constructor(data?: Partial<TypeDesignatorModel>) {
    super(data);
    Object.assign(this, data);
    this.propulsionType = new SettingsTypeModel(data?.propulsionType)||null;
  }

  static deserialize(apiSubCategory: IAPITypeDesignator): TypeDesignatorModel {
    if (!apiSubCategory) {
      return new TypeDesignatorModel();
    }
    const data: Partial<TypeDesignatorModel> = {
      ...apiSubCategory,
      id: apiSubCategory.icaoTypeDesignatorId || apiSubCategory.id,
      accessLevel: AccessLevelModel.deserialize(apiSubCategory.accessLevel),
      sourceType: SourceTypeModel.deserialize(apiSubCategory.sourceType),
      propulsionType: SettingsTypeModel.deserialize({ ...apiSubCategory.propulsionType, 
        id: apiSubCategory.propulsionType?.propulsionTypeId }),
    };
    return new TypeDesignatorModel(data);
  }

  public serialize(): IAPITypeDesignator {
    return {
      id: this.id,
      name: this.name,
      propulsionTypeId: this.propulsionType?.id,
      statusId: this.statusId,
      accessLevelId: this.accessLevelId,
      sourceTypeId: this.sourceTypeId,
    };
  }

  static deserializeList(apiDataList: IAPITypeDesignator[]): TypeDesignatorModel[] {
    return apiDataList ? apiDataList.map((apiData: IAPITypeDesignator) => 
      TypeDesignatorModel.deserialize(apiData)) : [];
  }

  // required in auto complete
  public get label(): string {
    return this.name;
  }

  public get value(): string | number {
    return this.id;
  }
}
