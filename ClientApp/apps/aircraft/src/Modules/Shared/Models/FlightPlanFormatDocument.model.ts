import { IAPIFlightPlanDocument } from '../Interfaces';
import { CoreModel, modelProtection } from '@wings-shared/core';

@modelProtection
export class FlightPlanFormatDocumentModel extends CoreModel {
  name: string = '';
  link: string = '';

  constructor(data?: Partial<FlightPlanFormatDocumentModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPIFlightPlanDocument): FlightPlanFormatDocumentModel {
    if (!apiData) {
      return new FlightPlanFormatDocumentModel();
    }
    const data: Partial<FlightPlanFormatDocumentModel> = {
      ...apiData,
      id: apiData.flightPlanFormatDocumentId,
    };
    return new FlightPlanFormatDocumentModel(data);
  }

  public serialize(): IAPIFlightPlanDocument {
    return {
      id: this.id,
      name: this.name,
      link: this.link,
    };
  }

  static deserializeList(apiDataList: Partial<IAPIFlightPlanDocument>[]): FlightPlanFormatDocumentModel[] {
    return apiDataList ? apiDataList.map((apiData: any) => FlightPlanFormatDocumentModel.deserialize(apiData)) : [];
  }
}
