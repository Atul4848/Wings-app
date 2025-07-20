import { CoreModel } from './Core.model';
import { modelProtection } from '../Decorators';
import { ISelectOption } from '../Interfaces';

@modelProtection
export class EntityMapModel extends CoreModel implements ISelectOption {
  id: number = 0;
  entityId: number = 0; // id from mapped model
  code: string = '';

  constructor(data?: Partial<EntityMapModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: EntityMapModel): EntityMapModel {
    if (!apiData) {
      return new EntityMapModel();
    }
    const data: Partial<EntityMapModel> = {
      id: apiData.id,
      entityId: apiData.entityId,
      name: apiData.name,
      code: apiData.code,
    };
    return new EntityMapModel(data);
  }

  public get label(): string {
    if (this.name && this.code) {
      return `${this.name} (${this.code})`;
    }
    return this.name || this.code;
  }

  public get value(): string | number {
    return this.entityId;
  }
}
