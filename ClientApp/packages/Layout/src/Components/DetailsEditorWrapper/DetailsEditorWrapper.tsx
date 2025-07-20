import React, { FC, ReactNode } from 'react';
import { withStyles, Paper } from '@material-ui/core';
import { styles } from './DetailsEditorWrapper.styles';
import classNames from 'classnames';
import { IClasses } from '@wings-shared/core';

interface Props {
  classes?: IClasses;
  headerActions: ReactNode;
  children: ReactNode;
  isEditMode: boolean;
  hasChanges?: boolean;
  isBreadCrumb?:boolean
}

const DetailsEditorWrapper: FC<Props> = ({ classes, headerActions, children, isEditMode,isBreadCrumb }: Props) => {
  const rootClass = classNames({ [classes.root]: true});
  const actions = classNames({ [classes.headerActions]: true, [classes.headerActionsEditMode]: isEditMode });
  const paperClasses = classNames({ [classes.container]: true, [classes.breadCrumbContainer]: isBreadCrumb });
  return (
    <div className={rootClass}>
      <div className={actions}>{headerActions}</div>
      <Paper className={paperClasses}>{children}</Paper>
    </div>
  );
};
export default withStyles(styles)(DetailsEditorWrapper);
