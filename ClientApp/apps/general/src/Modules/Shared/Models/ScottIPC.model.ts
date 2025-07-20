import { IAPIScottIPCResponse } from '../Interfaces';
import { modelProtection } from '@wings-shared/core';

@modelProtection
export class ScottIPCModel {
  id: string = '';
  sipcUserId: number = 0;
  sipcName: string = '';
  uwaAccountNumber: string = '';
  captainName: string = '';
  crewPaxId: number = null;
  
  constructor(data?: Partial<ScottIPCModel>) {
    Object.assign(this, data);
  }

  static deserialize(sipc: IAPIScottIPCResponse): ScottIPCModel {
    if (!sipc) {
      return new ScottIPCModel();
    }

    const data: Partial<ScottIPCModel> = {
      id: sipc.id,
      sipcUserId: sipc.sipcUserId,
      sipcName: sipc.sipcName,
      uwaAccountNumber: sipc.universalAccountNumber,
      captainName: sipc.captainName,
      crewPaxId: sipc.crewPaxId,
    };

    return new ScottIPCModel(data);
  }

  static deserializeList(sipc: IAPIScottIPCResponse[]): ScottIPCModel[] {
    return sipc
      ? sipc
        .map((sipcResponse: IAPIScottIPCResponse) =>
          ScottIPCModel.deserialize(sipcResponse))
      : [];
  }
}