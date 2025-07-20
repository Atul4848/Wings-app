import { CoreModel, modelProtection } from '@wings-shared/core';
import { IAPIAirportDiagram } from '../Interfaces';

@modelProtection
export class AirportDiagramModel extends CoreModel {
  diagramUrl?: string;

  constructor(data?: Partial<AirportDiagramModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPIAirportDiagram): AirportDiagramModel {
    if (!apiData) {
      return new AirportDiagramModel();
    }
    const data: Partial<AirportDiagramModel> = {
      ...apiData,
    };
    return new AirportDiagramModel(data);
  }

  public serialize(): IAPIAirportDiagram {
    return {
      id: 0,
      diagramUrl: this.diagramUrl,
    };
  }
}
