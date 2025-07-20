import React, { FC, useMemo } from 'react';
import { UserResponseModel } from '../../../Shared/Models';
import { inject, observer } from 'mobx-react';
import { GroupStore, UserStore } from '../../../Shared/Stores';
import { EditIcon } from '@uvgo-shared/icons';
import { ManageUserGroups, UserGroups } from '../index';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { Button, Typography, withStyles } from '@material-ui/core';
import { styles } from './GroupEditor.styles';
import { Scrollable } from '@uvgo-shared/scrollable';
import { IClasses } from '@wings-shared/core';
import { SVGIcon } from '@wings-shared/layout';
import ManageUserGroupsV2 from '../ManageUserGroups/ManageUserGroupsV2';
import { AuthStore, useRoles } from '@wings-shared/security';

type Props = {
  selectedUser: UserResponseModel;
  classes?: IClasses;
  userStore?: UserStore;
  groupStore?: GroupStore;
};

const GroupEditor: FC<Props> = inject('userStore', 'groupStore')(observer((props: Props) => {
  const openGroupManagementDialog = () => {
    ModalStore.open(
      <ManageUserGroupsV2 userStore={props.userStore} groupStore={props.groupStore} user={props.selectedUser} />
    );
  }

  const hasWritePermission = useMemo(() => AuthStore.permissions.hasAnyPermission([ 'write' ]), [
    AuthStore.permissions,
  ]);

  const hasUMAdminRole = useMemo(() => AuthStore.permissions.hasAnyRole([ 'um_admin' ]), [
    AuthStore.permissions,
  ]);

  if (!props.selectedUser) {
    return (
      <div className={props.classes.container}>
        <div className={props.classes.message}>
          <div className={props.classes.icon}>
            <SVGIcon name="EmptyBox" />
          </div>

          <Typography variant="subtitle2">No user selected</Typography>
          <Typography variant="caption" className={props.classes.subtitle}>
            Please Select User from the table to see all Groups assigned.
          </Typography>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={props.classes.boxheading}>
        <div className={props.classes.title}>MANAGE GROUPS</div>
        <div className={props.classes.edit}>
          <Button
            color="primary"
            disabled={!hasUMAdminRole}
            className={props.classes.editBtn}
            onClick={() => openGroupManagementDialog()}
            startIcon={<EditIcon />}
          ></Button>
        </div>
      </div>
      <div className={props.classes.scroll}>
        <UserGroups userGroups={props.userStore.userGroups} />
      </div>
    </>
  );
}));

export default withStyles(styles)(GroupEditor);
