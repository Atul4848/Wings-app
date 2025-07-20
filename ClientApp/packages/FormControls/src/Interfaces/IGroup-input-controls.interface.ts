import { IViewInputControl } from './IViewInputControl.interface';

export interface IGroupInputControls {
  title: string;
  inputControls: IViewInputControl[];
  collapsibleInputControls?: IViewInputControl[];
  // class for group root div
  className?: string;
  // class for input control root div
  inputControlClassName?: string;
  isCollapsibleGroup?: boolean;
  isHidden?: boolean;
  subTitle?:string;
}
