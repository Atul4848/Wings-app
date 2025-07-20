import { USER_GROUP, MODULE_ACTIONS } from '../Enums';

export type ModulePermissions = Partial<Record<MODULE_ACTIONS, USER_GROUP[]>>;
