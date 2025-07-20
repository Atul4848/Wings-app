import React, { FC, ReactNode, useState } from 'react';
import { VIEW_MODE } from '@wings/shared';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { Menu, Typography } from '@material-ui/core';
import { inject, observer } from 'mobx-react';
import { styles } from './FilterLogs.style';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { LogStore, UserModel, UserStore } from '../../../Shared';
import { AutoCompleteControl, SelectInputControl } from '@wings-shared/form-controls';
import { IAPIGridRequest, SelectOption, UIStore } from '@wings-shared/core';
import { finalize, takeUntil, debounceTime } from 'rxjs/operators';
import { useUnsubscribe } from '@wings-shared/hooks';

interface Props {
  viewMode?: VIEW_MODE;
  logStore?: LogStore;
  onSetClick: ({ status, event, actorId, targetId }) => void;
  anchorEl: HTMLElement;
  userStore?: UserStore;
}

const FilterLogs: FC<Props> = ({ ...props }: Props) => {
  const [ actorIDs, setActorIDs ] = useState<UserModel[]>([]);
  const [ actorId, setActorId ] = useState<string>('');
  const _userStore = props.userStore as UserStore;
  const unsubscribe = useUnsubscribe();
  const [ targetIDs, setTargetIDs ] = useState<UserModel[]>([]);
  const [ targetId, setTargetId ] = useState<string>('');
  const _logStore = props.logStore as LogStore;
  const classes: Record<string, string> = styles();
  
  const categoryList: SelectOption[] = [
    new SelectOption({ name: 'ALL', value: 'ALL' }),
    new SelectOption({ name: 'SUCCESS', value: 'SUCCESS' }),
    new SelectOption({ name: 'FAILURE', value: 'FAILURE' }),
  ];

  const eventList: SelectOption[] = [
    new SelectOption({ name: 'NONE', value: 'NONE' }),
    new SelectOption({ name: 'UM_PROFILE_CREATED', value: 'UM_PROFILE_CREATED' }),
    new SelectOption({ name: 'UM_PROFILE_UPDATED', value: 'UM_PROFILE_UPDATED' }),
    new SelectOption({ name: 'CSD_PROFILE_MIGRATED', value: 'CSD_PROFILE_MIGRATED' }),
    new SelectOption({ name: 'TEMPORARY_EMAIL_CODE_SENT', value: 'TEMPORARY_EMAIL_CODE_SENT' }),
    new SelectOption({ name: 'TEMPORARY_EMAIL_CODE_VERIFIED', value: 'TEMPORARY_EMAIL_CODE_VERIFIED' }),
    new SelectOption({ name: 'UM_TRIAL_ROLE_ASSIGNED', value: 'UM_TRIAL_ROLE_ASSIGNED' }),
    new SelectOption({ name: 'UM_TRIAL_ROLE_UNASSIGNED', value: 'UM_TRIAL_ROLE_UNASSIGNED' }),
    new SelectOption({ name: 'UM_TRIAL_ROLE_EXPIRED', value: 'UM_TRIAL_ROLE_EXPIRED' }),
    new SelectOption({ name: 'UM_TRIAL_ROLE_EXTENDED', value: 'UM_TRIAL_ROLE_EXTENDED' }),
    new SelectOption({ name: 'UM_TRIAL_ROLE_PROMOTED', value: 'UM_TRIAL_ROLE_PROMOTED' }),
    new SelectOption({ name: 'UM_ROLE_ASSIGNED', value: 'UM_ROLE_ASSIGNED' }),
    new SelectOption({ name: 'UM_ROLE_UNASSIGNED', value: 'UM_ROLE_UNASSIGNED' }),
    new SelectOption({ name: 'UM_ROLE_EXPIRED', value: 'UM_ROLE_EXPIRED' }),
    new SelectOption({ name: 'UM_ROLE_EXTENDED', value: 'UM_ROLE_EXTENDED' }),
    new SelectOption({ name: 'OKTA_PROFILE_DEACTIVATED', value: 'OKTA_PROFILE_DEACTIVATED' }),
    new SelectOption({ name: 'OKTA_PROFILE_ACTIVATED', value: 'OKTA_PROFILE_ACTIVATED' }),
    new SelectOption({ name: 'OKTA_PROFILE_REACTIVATED', value: 'OKTA_PROFILE_REACTIVATED' }),
    new SelectOption({ name: 'OKTA_PROFILE_CREATED', value: 'OKTA_PROFILE_CREATED' }),
    new SelectOption({ name: 'OKTA_PROFILE_PASSWORD_RESET', value: 'OKTA_PROFILE_PASSWORD_RESET' }),
    new SelectOption({ name: 'OKTA_PROFILE_DELETED', value: 'OKTA_PROFILE_DELETED' }),
    new SelectOption({ name: 'OKTA_PROFILE_LOCKED', value: 'OKTA_PROFILE_LOCKED' }),
    new SelectOption({ name: 'OKTA_PROFILE_UNLOCKED', value: 'OKTA_PROFILE_UNLOCKED' }),
    new SelectOption({ name: 'OKTA_PROFILE_UPDATED', value: 'OKTA_PROFILE_UPDATED' }),
    new SelectOption({ name: 'OKTA_PROFILE_MAPPING_UPDATED', value: 'OKTA_PROFILE_MAPPING_UPDATED' }),
    new SelectOption({ name: 'OKTA_GROUP_ASSIGNMENT', value: 'OKTA_GROUP_ASSIGNMENT' }),
    new SelectOption({ name: 'OKTA_GROUP_REMOVAL', value: 'OKTA_GROUP_REMOVAL' }),
    new SelectOption({ name: 'JOB_UPSERT_CUSTOMERS', value: 'JOB_UPSERT_CUSTOMERS' }),
    new SelectOption({ name: 'JOB_UPSERT_USERS', value: 'JOB_UPSERT_USERS' }),
    new SelectOption({ name: 'JOB_UPSERT_UVX_ROLES', value: 'JOB_UPSERT_UVX_ROLES' }),
    new SelectOption({ name: 'JOB_UPDATE_USER_ROLES', value: 'JOB_UPDATE_USER_ROLES' }),
    new SelectOption({ name: 'JOB_REMOVE_USER_ROLES', value: 'JOB_REMOVE_USER_ROLES' }),
    new SelectOption({ name: 'JOB_SYNC_USERS_PREFERENCES', value: 'JOB_SYNC_USERS_PREFERENCES' }),
    new SelectOption({ name: 'JOB_CSD_PROFILE_SYNCED', value: 'JOB_CSD_PROFILE_SYNCED' }),
    new SelectOption({ name: 'JOB_BULK_ASSIGN_ROLE', value: 'JOB_BULK_ASSIGN_ROLE' }),
    new SelectOption({ name: 'JOB_BULK_UNASSIGN_ROLE', value: 'JOB_BULK_UNASSIGN_ROLE' }),
  ];

  const handleReset = () => {
    _logStore?.setLogsFilter('ALL');
    _logStore?.setEventFilter('NONE');
    _logStore?.setSelectedActorIDs(null);
    _logStore?.setSelectedTargetIDs(null);
    props.onSetClick({
      status: 'ALL',
      event: 'NONE',
      actorId: _logStore?.selectedActorIDs,
      targetId: _logStore?.selectedTargetIDs,
    });
  }

  const setActorValue = (selectedUser: UserModel): void => {
    if (!selectedUser) {
      setActorIDs([]);
      _logStore.setSelectedActorIDs(null);
      setActorId('');
      return;
    }
    _logStore.setSelectedActorIDs(selectedUser);
    setActorId(selectedUser.value as string);
  }

  const searchActorIDs = (value: string): void => {
    if (value.length <= 2) {
      return;
    }
    const request: IAPIGridRequest = {
      q: value,
    };
    _userStore
      .getUsers(request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        debounceTime(500),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(users => (setActorIDs(users.results)));
  }

  const setTargetValue = (selectedUser: UserModel): void => {
    if (!selectedUser) {
      setTargetIDs([]);
      _logStore.setSelectedTargetIDs(null);
      setTargetId('');
      return;
    }
    _logStore.setSelectedTargetIDs(selectedUser);
    setTargetId(selectedUser.value as string);
  }

  const searchTargetIDs = (value: string): void => {
    if (value.length <= 2) {
      return;
    }
    const request: IAPIGridRequest = {
      q: value,
    };
    _userStore
      .getUsers(request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        debounceTime(500),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(users => (setTargetIDs(users.results)));
  }

  /* istanbul ignore next */
  const content = (): ReactNode => {
    return (
      <>
        <div className={classes.modalDetail}>
          <div className={classes.flexRow}>
            <Typography variant="h6" className={classes.subTitle}>
              Status
            </Typography>
            <SelectInputControl
              containerClass={classes.dropDown}
              value={_logStore?.logsFilter}
              selectOptions={categoryList}
              onOptionChange={item => _logStore?.setLogsFilter(item)}
            />
            <Typography variant="h6" className={classes.subTitle}>
              Event Type
            </Typography>
            <SelectInputControl
              containerClass={classes.dropDown}
              value={_logStore?.eventFilter}
              selectOptions={eventList}
              onOptionChange={item => _logStore?.setEventFilter(item)}
            />
            <Typography variant="h6" className={classes.subTitle}>
              Actor
            </Typography>
            <AutoCompleteControl
              useFitToContentWidth={true}
              placeHolder="Search Actor Name"
              options={actorIDs}
              value={_logStore.selectedActorIDs}
              onDropDownChange={selectedOption => setActorValue(selectedOption as UserModel)}
              onSearch={(searchValue: string) => searchActorIDs(searchValue)}
            />
            <Typography variant="h6" className={classes.subTitle}>
              Target
            </Typography>
            <AutoCompleteControl
              useFitToContentWidth={true}
              placeHolder="Search Target Name"
              options={targetIDs}
              value={_logStore.selectedTargetIDs}
              onDropDownChange={selectedOption => setTargetValue(selectedOption as UserModel)}
              onSearch={(searchValue: string) => searchTargetIDs(searchValue)}
            />
          </div>
          <div className={classes.btnContainer}>
            <div className={classes.btnSection}>
              <PrimaryButton variant="contained" color="primary" onClick={handleReset}>
                Reset
              </PrimaryButton>
            </div>
            <PrimaryButton
              variant="contained"
              color="primary"
              onClick={() =>
                props.onSetClick({
                  status: _logStore?.logsFilter,
                  event: _logStore?.eventFilter,
                  actorId: _logStore.selectedActorIDs,
                  targetId: _logStore.selectedTargetIDs,
                })
              }
            >
              Set
            </PrimaryButton>
          </div>
        </div>
      </>
    );
  }

  return (
    <Menu
      id="basic-menu"
      anchorEl={props.anchorEl}
      open={true}
      onClose={() => ModalStore.close()}
      className={classes.modalRoot}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
    >
      {content()}
    </Menu>

  );
}

export default inject('logStore', 'userStore')(observer(FilterLogs));
