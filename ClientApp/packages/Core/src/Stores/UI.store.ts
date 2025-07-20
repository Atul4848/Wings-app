import { action, observable } from 'mobx';

class UIStore {
  @observable public pageLoading = false;
  @observable public forcePageNotFound = false;
  @observable public isHeaderExpanded = false;

  @action
  public setPageLoader(flag: boolean): void {
    this.pageLoading = flag;
  }

  @action
  public setIsHeaderExpanded(): void {
    this.isHeaderExpanded = !this.isHeaderExpanded;
  }

  @action
  public setforcePageNotFound(flag: boolean): void {
    this.forcePageNotFound = flag;
  }
}
const instance = new UIStore();
export default instance;
