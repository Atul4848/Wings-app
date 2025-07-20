import * as React from 'react';
import { NavLink } from 'react-router-dom';

import { IMainNavLink } from './types';

export interface Link extends IMainNavLink {
  classes: { [name: string]: string };
  classKey?: string;
  exact?: boolean;
}

export const MainNavLink = (props: Link) => {
  const { to, modifier, clicked, badge, label, icon, classes, classKey = 'navLink', exact } = props;
  const getClassNames = (): string => {
    const classesList: string[] = [ classes[classKey] ];

    if (modifier) classesList.push(modifier);

    return classesList.join(' ');
  };

  return (
    <div className={getClassNames()}>
      <NavLink to={to} end={exact || false} onClick={clicked}>
        <div className={`${classes[classKey]}__icon`}>
          {icon}
          {badge}
        </div>
        <div className={`${classes[classKey]}__text`}>{label}</div>
      </NavLink>
    </div>
  );
};
