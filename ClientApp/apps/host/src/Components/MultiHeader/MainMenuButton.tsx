import React, { MouseEventHandler } from 'react';

import { IMainNavLink } from './types';

export interface MenuButton extends IMainNavLink {
  classes: { [name: string]: string };
  hasActiveClass: boolean;
  buttonClicked?: MouseEventHandler<HTMLButtonElement>;
}

const MainMenuButton = (props: MenuButton) => {
  const { modifier, buttonClicked, badge, label, icon, classes, hasActiveClass } = props;

  const getClassNames = (isActive: boolean) => {
    const classesList: string[] = [ classes.menuButton ];

    if (modifier) classesList.push(modifier);
    if (hasActiveClass) classesList.push(`${classes.menuButton}--active`);

    return classesList.join(' ');
  };

  return (
    <button className={getClassNames(false)} onClick={buttonClicked}>
      <div className={`${classes.menuButton}__icon`}>
        {icon}
        {badge}
      </div>
      <div className={`${classes.menuButton}__text`}>{label}</div>
    </button>
  );
};
export default MainMenuButton;
