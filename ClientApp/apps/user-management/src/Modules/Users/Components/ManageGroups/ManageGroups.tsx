import { Typography, withStyles, Button } from '@material-ui/core';
import React, { FC, ReactNode, useEffect, useState } from 'react';
import { useStyles } from './ManageGroups.styles';
import { GroupStore, UserGroupModel, UserStore } from '../../../Shared';
import { inject, observer } from 'mobx-react';
import { action, observable } from 'mobx';
import { finalize, takeUntil, switchMap } from 'rxjs/operators';
import { Dialog } from '@uvgo-shared/dialog';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { PROGRESS_TYPES } from '@uvgo-shared/progress';
import GroupDetails from '../GroupDetails/GroupDetails';
import { ArrowCircleLeftIcon, ArrowCircleRightIcon } from '@uvgo-shared/icons';
import { IClasses, Loader, UnsubscribableComponent } from '@wings-shared/core';
import { SearchInputControl } from '@wings-shared/form-controls';
import { useUnsubscribe } from '@wings-shared/hooks';
import { useParams } from 'react-router';

type Props = {
  classes?: IClasses;
  groupStore?: GroupStore;
  userStore?: UserStore;
  userId: string;
};

const ManageGroups: FC<Props> = ({ ...props }) => {
  const [ groups, setGroups ] = useState<UserGroupModel[]>([]);
  const progressLoader: Loader = new Loader(false);
  const [ searchValue, setSearchValue ] = useState<string>('');
  const [ selectedAvailableGroup, setSelectedAvailableGroup ] = useState<string>('');
  const [ selectedCurrentGroup, setSelectedCurrentGroup ] = useState<string>('');
  const classes = useStyles();
  const unsubscribe = useUnsubscribe();

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = (query?: string): void =>{
    const { groupStore } = props;
    progressLoader.showLoader();
    groupStore?.loadGroups(query)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => progressLoader.hideLoader())
      )
      .subscribe((groups: UserGroupModel[]) => {
        setGroups(groups);
      });
  }

  const filteredGroups = (): UserGroupModel[] => {
    if (searchValue) {
      return groups.filter(
        item =>
          !props.userStore?.userGroups.some(x => x.id === item.id) &&
          item.name?.toLowerCase().includes(searchValue)
      );
    }
    return groups.filter(item => !props.userStore?.userGroups.some(x => x.id === item.id));
  }

  const assignGroup = (groupId: string): void => {
    const { userId, userStore } = props;
    progressLoader.showLoader();
    userStore?.assignGroup(userId, groupId)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        switchMap(() => userStore.loadUserGroups(userId)),
        finalize(() => progressLoader.hideLoader())
      )
      .subscribe(() => resetSelectedGroup());
  }

  const removeGroup = (groupId: string): void => {
    const { userId, userStore } = props;
    progressLoader.showLoader();
    userStore?.removeGroup(userId, groupId)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => progressLoader.hideLoader())
      )
      .subscribe(() => resetSelectedGroup());
  }

  const renderGroups = (): ReactNode => {
    if (progressLoader.isLoading) {
      return progressLoader.spinner;
    }
    return (
      <GroupDetails
        groups={filteredGroups()}
        onAction={id => {
          setSelectedCurrentGroup(id.toString());
          setSelectedAvailableGroup('');
        }}
        selectedGroupId={selectedCurrentGroup}
      />
    );
  }

  const resetSelectedGroup = () => {
    setSelectedAvailableGroup('');
    setSelectedCurrentGroup('');
  }

  const dialogContent = (): ReactNode => {
    const { userStore } = props;
    return (
      <>
        <div className={classes.modaldetail}>
          <div className={classes.groupsection}>
            <Typography variant="h6" component="h2" className={classes.modalheading}>
              Current Groups
            </Typography>
            <div className={classes.detaillist}>
              <GroupDetails
                groups={userStore.userGroups}
                onAction={id => {
                  setSelectedCurrentGroup('');
                  setSelectedAvailableGroup(id.toString());
                }}
                isUserGroups={true}
                selectedGroupId={selectedAvailableGroup}
              />
            </div>
          </div>
          <div className={classes.iconBtn}>
            <Button
              disabled={Boolean(selectedAvailableGroup)}
              onClick={() => assignGroup(selectedCurrentGroup)}
            >
              <ArrowCircleLeftIcon size="x-large" />
            </Button>
            <div>
              <Button
                disabled={Boolean(selectedCurrentGroup)}
                onClick={() => removeGroup(selectedAvailableGroup)}
              >
                <ArrowCircleRightIcon size="x-large" />
              </Button>
            </div>
          </div>
          <div className={classes.selectedgroup}>
            <Typography variant="h6" component="h2" className={classes.modalheading}>
              Available Groups
            </Typography>
            <div className={classes.availableGroups}>
              <div className={classes.groupheading}>
                <div className={classes.selectgroup}>
                  <SearchInputControl
                    onSearch={(searchValue: string) => (setSearchValue(searchValue))}
                    placeHolder="Search Here"
                  />
                </div>
              </div>
              <div className={classes.groupsList}>{renderGroups()}</div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <Dialog
      title="Manage Groups"
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
export default inject('groupStore', 'userStore')(observer(ManageGroups));
