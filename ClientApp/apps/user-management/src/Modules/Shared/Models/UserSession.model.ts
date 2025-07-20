import { IdNameModel, modelProtection } from '@wings-shared/core';
import { IAPIUserSession } from '../Interfaces';

@modelProtection
export class UserSessionModel extends IdNameModel<string> {
  userId: string = '';
  connectionId: string = '';
  clientName: string = '';
  clientId: string = '';
  userAgent: string = '';
  ipAddress: string = '';
  timestamp: string = '';

  constructor(data?: Partial<UserSessionModel>) {
    super();
    Object.assign(this, data);
  }

  static deserialize(session: IAPIUserSession): UserSessionModel {
    if (!session) {
      return new UserSessionModel();
    }

    const data: Partial<UserSessionModel> = {
      userId: session.UserId,
      connectionId: session.ConnectionId,
      clientId: session.ClientId,
      clientName :session.ClientName,
      userAgent:session.UserAgent,
      ipAddress:session.IpAddress,
      timestamp:session.Timestamp,
     
    };

    return new UserSessionModel(data);
  }

  static deserializeList(sessions: IAPIUserSession[]): UserSessionModel[] { 
    return sessions
      ? sessions.map((session: IAPIUserSession) => UserSessionModel.deserialize(session))
      : [];
  }
}