import React, { FC } from 'react';
import { IconButton, Tooltip } from '@material-ui/core';
import { Link } from 'react-router-dom';
import classNames from 'classnames';

import { EditIcon } from '@uvgo-shared/icons';

import { usePermissions } from '@wings-shared/security';
import { VIEW_MODE } from '@wings/shared';
import { UserModel } from '../../../Shared';

import { useUsersActionRendererClasses } from './UsersActionRenderer.styles';

export type UsersActionRendererProps = {
  data: UserModel;
  onAction: () => void;
}

const UsersActionRenderer: FC<UsersActionRendererProps> = ({ data, onAction }: UsersActionRendererProps) => {
  const classes: Record<string, string> = useUsersActionRendererClasses();
  const { hasAnyPermission } = usePermissions([ 'write' ]);

  return (
    <div className={classes.root}>
      <Tooltip
        classes={{ tooltip: classes.customToolTip, arrow: classes.customArrow }}
        title="Edit"
        placement="top"
        arrow
      >
        <Link
          className={classNames({ [classes.disabled]: !hasAnyPermission })}
          to={`/user-management/users/${data?.id}/${VIEW_MODE.EDIT.toLowerCase()}`}
          onClick={onAction}
        >
          <IconButton color="primary">
            <EditIcon />
          </IconButton>
        </Link>
      </Tooltip>
    </div>
  );
}

export default UsersActionRenderer;