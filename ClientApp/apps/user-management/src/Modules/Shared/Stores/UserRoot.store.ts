import { UserStore } from './User.store';
import { GroupStore } from './Group.store';
import { FederationMappingStore } from './FederationMapping.store';
import { SessionStore } from './Session.store';
import { SessionViolationsStore } from './SessionViolations.store';
import { SyncTroubleshootStore } from './SyncTroubleshoot.store';
import { LogStore } from './Logs.store';
import { CustomersStore } from './Customers.store';
import { ServicesStore } from './Services.store';
import { ApplicationsStore } from './Applications.store';
import { BaseCustomerStore } from '@wings/shared';

class UserRoot {
  public userStore: UserStore = new UserStore();
  public groupStore: GroupStore = new GroupStore();
  public federationMappingStore: FederationMappingStore = new FederationMappingStore();
  public sessionStore: SessionStore = new SessionStore();
  public sessionViolationsStore: SessionViolationsStore = new SessionViolationsStore();
  public syncTroubleshootStore: SyncTroubleshootStore = new SyncTroubleshootStore();
  public logStore: LogStore = new LogStore();
  public customerStore: CustomersStore = new CustomersStore();
  public serviceStore: ServicesStore = new ServicesStore();
  public applicationStore: ApplicationsStore = new ApplicationsStore();
  public registryStore: BaseCustomerStore = new BaseCustomerStore();
}

const userRootStore = new UserRoot();

export default userRootStore;
