import { MouseEvent, ReactNode } from 'react';

export interface IMainNavLink {
  to: string | any;
  icon: ReactNode;
  label: string;
  badge?: ReactNode;
  isVisible?: boolean;
  modifier?: string;
  clicked?: (event?: MouseEvent<HTMLAnchorElement>) => void;
  isMenuButton: boolean;
  childLinks?: IMainNavLink[];
}
