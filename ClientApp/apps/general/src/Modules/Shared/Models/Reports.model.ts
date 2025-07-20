import { IAPIReport } from '../Interfaces';
import { IdNameModel, modelProtection } from '@wings-shared/core';

@modelProtection
export class Reports extends IdNameModel {
  controllerName: string = '';
  methodName: string = '';
  keyGroup: string = '';
  route: string = '';

  constructor(data?: Partial<Reports>) {
    super();
    Object.assign(this, data);
  }

  static deserialize(report: IAPIReport): Reports {
    if (!report) {
      return new Reports();
    }

    const data: Partial<Reports> = {
      controllerName: report.ControllerName,
      methodName: report.MethodName,
      keyGroup: report.KeyGroup,
      route: report.Route,
    };

    return new Reports(data);
  }

  static deserializeList(report: IAPIReport[]): Reports[] {
    return report ? report.map((reports: IAPIReport) => Reports.deserialize(reports)) : [];
  }
}
