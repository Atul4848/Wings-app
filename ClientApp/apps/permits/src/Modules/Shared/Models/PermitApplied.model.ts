import { CoreModel, modelProtection, Utilities, SettingsTypeModel } from '@wings-shared/core';
import { IAPIPermitApplied, IAPIPermitAppliedRequest } from '../Interfaces';
import { FIRModel } from '@wings/shared';

@modelProtection
export class PermitAppliedModel extends CoreModel {
  extendedByNM: number = null;
  isPolygon: boolean = false;
  permitAppliedTo: SettingsTypeModel;
  permitAppliedFIRs: FIRModel[] = [];
  geoJson: string = '';

  constructor(data?: Partial<PermitAppliedModel>) {
    super(data);
    Object.assign(this, data);
    this.permitAppliedTo = new SettingsTypeModel(data?.permitAppliedTo);
    this.permitAppliedFIRs = data?.permitAppliedFIRs?.map((fir: FIRModel) => new FIRModel(fir)) || [];
  }

  static deserialize(apiPermitApplied: IAPIPermitApplied): PermitAppliedModel {
    if (!apiPermitApplied) {
      return new PermitAppliedModel();
    }
    return new PermitAppliedModel({
      ...apiPermitApplied,
      id: apiPermitApplied.permitAppliedId || apiPermitApplied.id,
      permitAppliedTo: SettingsTypeModel.deserialize({
        ...apiPermitApplied?.permitAppliedTo,
        id: apiPermitApplied?.permitAppliedTo?.permitAppliedToId,
      }),
      permitAppliedFIRs: apiPermitApplied?.permitAppliedFIRs?.map(
        fir => new FIRModel({ ...fir, id: fir.id || fir.firId })
      ),
    });
  }

  static deserializeList(apiPermitsApplied: IAPIPermitApplied[]): PermitAppliedModel[] {
    return apiPermitsApplied
      ? apiPermitsApplied.map((apiPermitApplied: IAPIPermitApplied) => PermitAppliedModel.deserialize(apiPermitApplied))
      : [];
  }

  public serialize(): IAPIPermitAppliedRequest {
    return {
      id: this.id || 0,
      isPolygon: this.isPolygon,
      permitAppliedToId: this.permitAppliedTo?.id,
      permitAppliedToName: this.permitAppliedTo?.name,
      extendedByNM: Utilities.getNumberOrNullValue(this.extendedByNM),
      permitAppliedFIRs: this.permitAppliedFIRs?.map((appliedFIR: FIRModel) => ({
        ...appliedFIR.serialize(),
      })),
      geoJson: this.geoJson,
    };
  }
}
