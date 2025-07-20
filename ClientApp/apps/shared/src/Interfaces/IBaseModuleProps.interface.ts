import { SidebarStore } from '@wings-shared/layout';
export interface IBaseModuleProps {
  theme?: any;
  basePath: string;
  sidebarStore?: typeof SidebarStore;
}
