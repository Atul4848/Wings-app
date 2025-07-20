import React, { FC, useMemo, useState } from 'react';
import { styles } from './AuthTester.styles';
import { Typography, TextField } from '@material-ui/core';
import { IAPIGridRequest, IClasses, SelectOption, UIStore } from '@wings-shared/core';
import { UserModel, UserStore } from '../../../Shared';
import { SelectInputControl, AutoCompleteControl } from '@wings-shared/form-controls';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { inject, observer } from 'mobx-react';
import { finalize, takeUntil, debounceTime } from 'rxjs/operators';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { AlertStore } from '@uvgo-shared/alert';
import { AxiosError } from 'axios';
import { AuthStore } from '@wings-shared/security';
import { useUnsubscribe } from '@wings-shared/hooks';
import { Notification } from '@uvgo-shared/notifications';

interface Props {
  classes?: IClasses;
  userStore?: UserStore;
}

export const actorTypeOptions: SelectOption[] = [ new SelectOption({ name: 'User', value: 'User' }) ];

export const resourceTypeOptions: SelectOption[] = [
  new SelectOption({ name: 'FIQReport', value: 'FIQReport' }),
  new SelectOption({ name: 'Trip', value: 'Trip' }),
  new SelectOption({ name: 'CustomerSite', value: 'CustomerSite' }),
];

const AuthTester: FC<Props> = ({ ...props }: Props) => {

  const [ isAllowed, setIsAllowed ] = useState<Boolean>(false);
  const [ predicate, setPredicate ] = useState<string>('allow');
  const [ actorType, setActorType ] = useState<string>('User');
  const [ actorId, setActorId ] = useState<string>('');
  const [ action, setAction ] = useState<string>('view_fiq_report');
  const [ resourceId, setResourceId ] = useState<string>('64313264f40e47dc94bb7cba');
  const [ resourceType, setResourceType ] = useState<string>('FIQReport');
  const [ isResourceId, setIsResourceId ] = useState<string>('');
  const [ isResourceType, setIsResourceType ] = useState<string>('');
  const [ actorIDs, setActorIDs ] = useState<UserModel[]>([]);
  const [ selectedActorIDs, setSelectedActorIDs ] = useState<UserModel>(new UserModel());
  const [ currentUser, setCurrentUser ] = useState<any>(null);
  const classes: Record<string, string> = styles();
  const _userStore = props.userStore as UserStore;
  const unsubscribe = useUnsubscribe();

  const hasUMRole = useMemo(() => AuthStore.permissions.hasAnyRole([ 'um_admin', 'um_manager', 'um_reader' ]), [
    AuthStore.permissions,
  ]);

  const setActorValue = (selectedUser: UserModel): void => {
    if (!selectedUser) {
      setActorIDs([]);
      setSelectedActorIDs(null);
      setActorId('');
      return;
    }
    setSelectedActorIDs(selectedUser);
    setActorId(selectedUser.value as string);
  }

  const searchActorIDs = (value: string): void => {
    if (value.length <= 2) {
      return;
    }
    const { userStore } = props;
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

  /* istanbul ignore next */
  const checkAuthorize = (): void => {
    UIStore.setPageLoader(true);
    _userStore
      .checkAuthorize(resourceId, action, actorId, actorType, resourceType)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          ModalStore.close();
          UIStore.setPageLoader(false);
        })
      )
      .subscribe(
        (response: any) => {
          setIsAllowed(response.Allowed);
          setCurrentUser(selectedActorIDs);
          setIsResourceType(response.ResourceType);
          setIsResourceId(response.ResourceId);
        },
        (error: AxiosError) => {
          AlertStore.critical(error.message);
          setCurrentUser(null)
        }
      );
  }

  return (
    <>
      <div className={classes.headerContainerTop}>
        <div className={classes.flexSection}>
          <div className={classes.selectionSection}>
            <div className={classes.selectInput}>
              <Typography variant="h6" className={classes.subTitle}>
                Actor Type
              </Typography>
              <SelectInputControl
                containerClass={classes.dropDown}
                value={actorType}
                selectOptions={actorTypeOptions}
                onOptionChange={item => setActorType(item)}
              />
            </div>
            <div className={classes.selectInput}>
              <Typography variant="h6" className={classes.subTitle}>
                Actor Name
              </Typography>
              <AutoCompleteControl
                useFitToContentWidth={true}
                placeHolder="Search Actor Name"
                options={actorIDs}
                value={selectedActorIDs}
                onDropDownChange={selectedOption => setActorValue(selectedOption as UserModel)}
                onSearch={(searchValue: string) => searchActorIDs(searchValue)}
              />
            </div>
            <div className={classes.selectInput}>
              <Typography variant="h6" className={classes.subTitle}>
                Action
              </Typography>
              <TextField
                className={classes.textInput}
                value={action}
                onChange={event => setAction(event.target.value as string)}
              />
            </div>
            <div className={classes.selectInput}>
              <Typography variant="h6" className={classes.subTitle}>
                Resource Type
              </Typography>
              <SelectInputControl
                containerClass={classes.dropDown}
                value={resourceType}
                selectOptions={resourceTypeOptions}
                onOptionChange={item => setResourceType(item)}
              />
            </div>
            <div className={classes.selectInput}>
              <Typography variant="h6" className={classes.subTitle}>
                Resource ID
              </Typography>
              <TextField
                className={classes.textInput}
                value={resourceId}
                onChange={event => setResourceId(event.target.value as string)}
              />
            </div>
          </div>
          <div className={classes.manageRoleBtn}>
            <PrimaryButton
              disabled={!hasUMRole}
              variant="contained"
              color="primary"
              onClick={() => checkAuthorize()}
            >
              Check Authorize
            </PrimaryButton>
          </div>
        </div>
        <div className={classes.resultSection}>Results</div>
        {isAllowed === false && currentUser && (
          <Notification
            type="error"
            message={<div className={classes.flexSection}><span className={classes.textWarningMessages}>Denied</span>
              <Typography className={classes.subTitleRes}>
                <b>{currentUser.fullName}</b>: {currentUser.username} |
                <b> Access:</b> {isResourceType} <b>- ID:</b> {isResourceId} |
                <b> Action: </b>{action}
              </Typography></div>}
          />
        )}
        {isAllowed === true && currentUser && (
          <Notification
            type="success"
            message={<div className={classes.flexSection}><span className={classes.textGoodMessages}>Allowed</span>
              <Typography className={classes.subTitleRes}>
                <b>{currentUser.fullName}</b>: {currentUser.username} |
                <b> Access:</b> {isResourceType} <b>- ID:</b> {isResourceId} |
                <b> Action: </b>{action}
              </Typography></div>}
          />
        )}
      </div>
    </>
  );
};

export default inject('userStore')(observer(AuthTester));
