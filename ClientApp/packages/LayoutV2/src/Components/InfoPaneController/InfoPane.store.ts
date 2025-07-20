import { action, observable } from 'mobx';
import { INFO_PANE_STATE } from './InfoPaneState.enum';

class InfoPaneStore {
  private bodyClassName: string = 'overflow-hidden';
  private readonly defaultHeight: number = 200;
  @observable public data: any;
  @observable public infoPaneCurrentHeight: number = 10;
  @observable public infoPaneHeight: number = 10;
  @observable public infoPaneState: INFO_PANE_STATE = INFO_PANE_STATE.NONE;

  @observable public minHeight: number = 40;
  @observable public maxHeight: number = window.innerHeight - 70;

  @action
  public configure(opt: { minHeight: number; maxHeight: number }): void {
    this.minHeight = opt.minHeight;
    this.maxHeight = opt.maxHeight;
  }

  @action
  public open(content: any): void {
    document.body.classList.add(this.bodyClassName);
    this.infoPaneState = INFO_PANE_STATE.NONE;
    this.infoPaneCurrentHeight = this.defaultHeight;
    this.infoPaneHeight = this.defaultHeight;
    this.data = content;
  }

  @action
  public close(): void {
    document.body.classList.remove(this.bodyClassName);
    this.setDefaultState();
  }

  @action
  private setDefaultState(): void {
    this.infoPaneState = INFO_PANE_STATE.NONE;
    this.infoPaneCurrentHeight = 10;
    this.infoPaneHeight = 10;
    this.data = null;
  }

  public get isOpen(): boolean {
    return !!this.data;
  }
}

const infoPaneStore = new InfoPaneStore();

export default infoPaneStore;
