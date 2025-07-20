import { ISelectOption, IdNameModel, modelProtection } from '@wings-shared/core';

@modelProtection
export class OptionKey extends IdNameModel<string> implements ISelectOption {
  constructor(data?: Partial<OptionKey>) {
    super();
    Object.assign(this, data);
  }

  static deserialize(apiData: string): OptionKey {
    if (!apiData) {
      return new OptionKey();
    }

    const data: Partial<OptionKey> = {
      id: apiData,
      name: apiData,
    };

    return new OptionKey(data);
  }
  static deserializeList(apiData: string[]): OptionKey[] {
    return apiData ? apiData.map((keyName: string) => OptionKey.deserialize(keyName)) : [];
  }

  // required in auto complete
  public get label(): string {
    return this.name;
  }

  public get value(): string | number {
    return this.id;
  }
}
