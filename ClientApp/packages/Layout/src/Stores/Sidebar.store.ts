import { action, observable } from 'mobx';
import { INavigationLink, MenuItem } from '../Interfaces';

class SidebarStore {
  @observable navLinks: INavigationLink[] = [];
  @observable menuItems: MenuItem[] = [];
  @observable basePath: string = '';

  @action
  public setNavLinks(items: any[], basePath?: string): void {
    this.basePath = basePath || '';
    this.navLinks = [...items];
    this.menuItems = [...items];
  }
}

const instance = new SidebarStore();
export default instance;
