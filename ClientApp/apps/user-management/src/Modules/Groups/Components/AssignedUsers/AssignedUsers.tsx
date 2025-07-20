import React, { FC, ReactNode, useState } from 'react';
import { VIEW_MODE } from '@wings/shared';
import { inject, observer } from 'mobx-react';
import { Dialog } from '@uvgo-shared/dialog';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { Typography, Button } from '@material-ui/core';
import { IAPIPagedUserRequest, UserResponseModel, UserStore } from '../../../Shared';
import { useStyles } from './AssignedUsers.styles';
import { filter, finalize, takeUntil } from 'rxjs/operators';
import { IClasses, UIStore } from '@wings-shared/core';
import { useUnsubscribe } from '@wings-shared/hooks';
import { AutoCompleteControl } from '@wings-shared/form-controls';
import { PrimaryButton } from '@uvgo-shared/buttons';

type Props = {
  viewMode?: VIEW_MODE;
  classes?: IClasses;
  userStore?: UserStore;
  onAssignUser: (userId: string) => void;
};

const AssignedUsers: FC<Props> = ({ ...props }: Props) => {
  const unsubscribe = useUnsubscribe();
  const classes = useStyles();
  const [ users, setUsers ] = useState<UserResponseModel[]>([]);
  const [ selectedUser, setSelectedCSDUser ] = useState<UserResponseModel | null>(new UserResponseModel());

  const loadUsers = (searchValue: string): void => {
    if (searchValue.length <= 2) {
      return;
    }
    const request: IAPIPagedUserRequest = {
      searchCollection: JSON.stringify([{ PropertyName: 'username', propertyValue: searchValue, Operator: 'and' },
        { PropertyName: 'status', PropertyValue: 'ACTIVE', Comparison: 'eq', Operator: 'and' }])  
    };
    UIStore.setPageLoader(true);
    props.userStore?.loadUsers(request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        filter(response => Boolean(response.results)),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(({ results }) => {
        setUsers(results);
      });
  }

  const setSearchValue = (_selectedCSDUser: UserResponseModel): void => {
    if (!_selectedCSDUser) {
      setUsers([]);
      setSelectedCSDUser(new UserResponseModel());
    }
    setSelectedCSDUser(_selectedCSDUser);
  };

  const dialogContent = (): ReactNode => {
    return (
      <>
        <div className={classes.modalDetail}>
          <Typography variant="h6" component="h2" className={classes.modalHeading}>
            Search Users
          </Typography>
          <AutoCompleteControl
            placeHolder="Search Users"
            options={users.filter(x => Boolean(x.email) && Boolean(x.fullName))}
            value={selectedUser || { label: '', value: '' }}
            filterOption={options =>
              options.map(option => {
                return {
                  ...option,
                  label: (option as UserResponseModel).email,
                };
              })
            }
            onDropDownChange={selectedOption => setSearchValue(selectedOption as UserResponseModel)}
            onSearch={(searchValue: string) => loadUsers(searchValue)}
          />
          <div className={classes.btnContainer}>
            <div className={classes.btnContainerCancel}>
              <PrimaryButton color="primary" variant="contained" onClick={() => ModalStore.close()}>
                Cancel
              </PrimaryButton>
            </div>
            <div className={classes.btnContainerSave}>
              <Button color="primary" variant="contained" size="small"
                onClick={() => {
                  ModalStore.close();
                  props.onAssignUser(users[0].oktaUserId)
                }}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <Dialog
      title="Assign User to Group"
      open={true}
      classes={{
        dialogWrapper: classes.modalRoot,
        header: classes.headerWrapper,
      }}
      onClose={() => ModalStore.close()}
      dialogContent={() => dialogContent()}
    />
  )
}

export default inject('userStore')(observer(AssignedUsers));