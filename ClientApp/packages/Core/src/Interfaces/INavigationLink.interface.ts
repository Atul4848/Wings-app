import { FC, ReactElement, ReactNode } from 'react';
import { IconProps } from '@uvgo-shared/icons';

export declare type MenuItemType = 'link' | 'section' | 'submenu';
export interface INavigationLink {
  to: string;
  title: string;
  icon?: string | ReactElement | FC<IconProps>;
  isHidden?: boolean;
  isDisabled?: boolean;
  isEnd?: boolean;
}
export interface MenuItem extends INavigationLink {
  label?: string;
  type?: MenuItemType;
  backButtonLabel?: string;
  backButtonLink?: string;
  isVisible?: boolean;
  children?: MenuItem[];
  isOpen?: boolean;
  isActive?: boolean;
  clicked?: () => void;
  isLocked?: boolean;
  rightAdornment?: ReactNode;
}
    
