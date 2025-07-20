import { Typography } from '@material-ui/core';
import React, { FC, ReactNode, useEffect, useState } from 'react';
import { useStyles } from './ManageUserGroups.styles';
import { GroupStore, UserGroupModel, UserResponseModel, UserStore } from '../../../Shared';
import { inject, observer } from 'mobx-react';
import { finalize, takeUntil, switchMap } from 'rxjs/operators';
import { Dialog } from '@uvgo-shared/dialog';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { Groups } from '../index';
import { IClasses, Loader } from '@wings-shared/core';
import { SearchInputControl } from '@wings-shared/form-controls';
import { useUnsubscribe } from '@wings-shared/hooks';
import { VIEW_MODE, useBaseUpsertComponent } from '@wings/shared';
import { useParams } from 'react-router-dom';

type Props = {
  classes?: IClasses;
  viewMode?: VIEW_MODE;
  user?: UserResponseModel;
  groupStore?: GroupStore;
  userStore?: UserStore;
};

const ManageUserGroupsV2: FC<Props> = ({ ...props }: Props) => {
  const [ groups, setGroups ] = useState<UserGroupModel[]>([]);
  const progressLoader: Loader = new Loader(false);
  const [ searchValue, setSearchValue ] = useState<string>('');
  const unsubscribe = useUnsubscribe();
  const params = useParams();
  const useUpsert = useBaseUpsertComponent(params, null);
  const classes = useStyles();

  useEffect(() => {
    useUpsert.setViewMode((params?.mode?.toUpperCase() as VIEW_MODE) || VIEW_MODE.NEW);
    loadGroups();
  }, []);

  const loadGroups = (query?: string): void => {
    progressLoader.showLoader();
    props.groupStore?.loadGroups(query)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => (progressLoader.hideLoader()))
      )
      .subscribe((groups: UserGroupModel[]) => {
        setGroups(groups);
      });
  }

  const filteredGroups = (): UserGroupModel[] => {
    if (searchValue) {
      return groups.filter(
        item => !props.userStore?.userGroups.some(x => x.id === item.id)
          && item.name?.toLowerCase().includes(searchValue)
      );
    }
    return groups.filter(item => !props.userStore?.userGroups.some(x => x.id === item.id));
  }

  const assignGroup = (groupId: string): void => {
    const { user, userStore } = props;
    progressLoader.showLoader();
    userStore?.assignGroup(user.id, groupId)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        switchMap(() => userStore.loadUserGroups(user.id)),
        finalize(() => (progressLoader.hideLoader()))
      )
      .subscribe();
  }

  const removeGroup = (groupId: string): void => {
    const { user, userStore } = props;
    progressLoader.showLoader();
    userStore
      .removeGroup(user.id, groupId)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => (progressLoader.hideLoader()))
      )
      .subscribe();
  }

  const renderGroups = (): ReactNode => {
    if (useUpsert.loader.isLoading) {
      return useUpsert.loader.spinner
    }
    return <Groups groups={filteredGroups()} onAction={(id) => assignGroup(id.toString())} />;
  }

  const dialogContent = (): ReactNode => {
    const { userStore, user } = props;
    return (
      <div className={classes.modaldetail}>
        <div className={classes.groupsection}>
          <div className={classes.groupSubHeader}><b>Manage Groups for:</b> {user?.username}</div>
          <div className={classes.groupheading}>
            <Typography variant="h6" component="h2" className={classes.modalheading}>
              User's Group Management
            </Typography>
          </div>
          <Groups
            groups={userStore.userGroups}
            onAction={(id) => removeGroup(id.toString())}
            isUserGroups={true}
          />
        </div>
        <div className={classes.selectedgroup}>
          <div className={classes.groupheading}>
            <Typography variant="h6" component="h2" className={classes.modalheading}>
              Available Groups
            </Typography>
            <div className={classes.selectgroup}>
              <SearchInputControl
                onSearch={(searchValue: string) => (setSearchValue(searchValue))}
                placeHolder="Search Groups"
              />
            </div>
          </div>
          {renderGroups()}
        </div>
      </div>
    );
  }

  return (
    <Dialog
      title='MANAGE GROUPS'
      open={true}
      classes={{
        dialogWrapper: classes.modalRoot,
        paperSize: classes.userGroupWidth,
        header: classes.headerWrapper,
      }}
      onClose={() => ModalStore.close()}
      dialogContent={() => dialogContent()}
    />
  );
}
export default inject('groupStore', 'userStore')(observer(ManageUserGroupsV2));
