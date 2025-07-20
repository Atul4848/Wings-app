import { IAPISessionViolationResponse } from '../Interfaces';
import { IdNameModel, modelProtection } from '@wings-shared/core';

@modelProtection
export class SessionViolationsModel extends IdNameModel {
  oktaUserId: string = '';
  username: string = '';
  customerNumber: string = '';
  violationCount: number = 0;
  clients: string = '';

  constructor(data?: Partial<SessionViolationsModel>) {
    super();
    Object.assign(this, data);
  }

  static deserialize(sessionViolation: IAPISessionViolationResponse): SessionViolationsModel {
    if (!sessionViolation) {
      return new SessionViolationsModel();
    }

    const data: Partial<SessionViolationsModel> = {
      oktaUserId: sessionViolation.OktaUserId,
      username: sessionViolation.Username,
      customerNumber: sessionViolation.CustomerNumber,
      violationCount: sessionViolation.ViolationCount,
      clients: sessionViolation.Clients,
    };

    return new SessionViolationsModel(data);
  }

  static deserializeList(sessionViolations: IAPISessionViolationResponse[]): SessionViolationsModel[] {
    return sessionViolations ?
      sessionViolations.map((sessionViolation: IAPISessionViolationResponse) =>
        SessionViolationsModel.deserialize(sessionViolation)) : [];
  }
}
