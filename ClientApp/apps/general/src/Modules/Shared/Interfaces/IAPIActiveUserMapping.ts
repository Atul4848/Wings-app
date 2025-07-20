import { IAPIUsers } from './IAPIUsers';

export class IAPIActiveUserMapping {
    LiveUser: ActiveUsers;
    StaleUser: ActiveUsers;
    OfflineUser: ActiveUsers;
    DropOutUser: ActiveUsers;
}

export class ActiveUsers {
    TierType: string;
    TierTime: string;
    TotalCount: string;
    Users: IAPIUsers[];
}