import { IAPIFlightPlanAccount, IAPIFlightPlanAccountRegistries } from '../Interfaces';
import { CoreModel, modelProtection, Utilities, SettingsTypeModel } from '@wings-shared/core';
@modelProtection
export class FlightPlanFormatAccountModel extends CoreModel {
  tempId: number = 0;
  flightPlanFormatAccountId: number = 0;
  accountNumber: string = '';
  registriesName: string = '';
  flightPlanFormatAccountRegistries: SettingsTypeModel[];

  constructor(data?: Partial<FlightPlanFormatAccountModel>) {
    super(data);
    Object.assign(this, data);
    this.flightPlanFormatAccountRegistries =
      data?.flightPlanFormatAccountRegistries?.map(a => new SettingsTypeModel(a)) || [];
  }

  static deserialize(apiData: IAPIFlightPlanAccount): FlightPlanFormatAccountModel {
    if (!apiData) {
      return new FlightPlanFormatAccountModel();
    }
    const flightPlanFormatAccountRegistries = apiData.flightPlanFormatAccountRegistries.map(
      flightPlanFormatAccountRegistry =>
        SettingsTypeModel.deserialize({
          ...flightPlanFormatAccountRegistry,
          id: flightPlanFormatAccountRegistry.flightPlanFormatAccountRegistryId,
        })
    );

    const data: Partial<FlightPlanFormatAccountModel> = {
      ...apiData,
      id: apiData.flightPlanFormatAccountId,
      flightPlanFormatAccountRegistries,
      registriesName: flightPlanFormatAccountRegistries.map(a => a.name).join(';'),
    };
    return new FlightPlanFormatAccountModel(data);
  }

  public serialize(): IAPIFlightPlanAccount {
    return {
      id: this.flightPlanFormatAccountId,
      name: this.name,
      accountNumber: this.accountNumber.padStart(5, '0'),
      flightPlanFormatAccountRegistries: this.getFlightPlanFormatAccountRegistries(),
    };
  }

  private getFlightPlanFormatAccountRegistries(): IAPIFlightPlanAccountRegistries[] {
    return this.registriesName
      ?.split(';')
      .filter(name => name.trim().length)
      .map(name => {
        const index = this.flightPlanFormatAccountRegistries.findIndex(reg => Utilities.isEqual(reg.name, name));
        if (index > -1) {
          return this.flightPlanFormatAccountRegistries[index].serialize();
        }
        return new SettingsTypeModel({ name, id: 0 }).serialize();
      });
  }

  static deserializeList(apiDataList: Partial<IAPIFlightPlanAccount>[]): FlightPlanFormatAccountModel[] {
    return apiDataList ? apiDataList.map((apiData: any) => FlightPlanFormatAccountModel.deserialize(apiData)) : [];
  }

  public isSameData(data: FlightPlanFormatAccountModel): boolean {
    return this.id ? Utilities.isEqual(this.id, data.id) : Utilities.isEqual(this.tempId, data.tempId);
  }
}
