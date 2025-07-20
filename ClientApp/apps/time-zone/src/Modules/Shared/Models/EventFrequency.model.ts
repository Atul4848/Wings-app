import { IAPIEventFrequency } from '../Interfaces';
import { CoreModel, ISelectOption, modelProtection } from '@wings-shared/core';

@modelProtection
export class EventFrequencyModel extends CoreModel implements ISelectOption {
  frequencyType: string = '';
  description: string = '';

  constructor(data?: Partial<EventFrequencyModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(eventFrequency: IAPIEventFrequency): EventFrequencyModel {
    if (!eventFrequency) {
      return new EventFrequencyModel();
    }
    const data: Partial<EventFrequencyModel> = {
      id: eventFrequency.id,
      frequencyType: eventFrequency.frequencyType,
      description: eventFrequency.description,
    };
    return new EventFrequencyModel(data);
  }

  static deserializeList(apiResponse: IAPIEventFrequency[]): EventFrequencyModel[] {
    return apiResponse
      ? apiResponse.map((response: IAPIEventFrequency) => EventFrequencyModel.deserialize(response))
      : [];
  }

  // required in auto complete
  public get label(): string {
    return this.frequencyType;
  }

  public get value(): string | number {
    return this.id;
  }
}
