import React, { FC, ReactNode } from 'react';
import { VIEW_MODE } from '@wings/shared';
import { Dialog } from '@uvgo-shared/dialog';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { Typography } from '@material-ui/core';
import { inject, observer } from 'mobx-react';
import { useStyles } from './FilterUsers.style';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { UserModel } from '../../../Shared/Models/User.model';
import { UserStore } from '../../../Shared';
import { AutoCompleteControl, SelectInputControl } from '@wings-shared/form-controls';
import { IClasses, ISelectOption, SelectOption } from '@wings-shared/core';

type Props = {
  viewMode?: VIEW_MODE;
  classes?: IClasses;
  userStore?: UserStore;
  onSetClick: ({ provider, status }) => null;
};

export const categoryList: SelectOption[] = [
  new SelectOption({ name: 'ACTIVE', value: 'ACTIVE' }),
  new SelectOption({ name: 'DEPROVISIONED', value: 'DEPROVISIONED' }),
  new SelectOption({ name: 'LOCKED_OUT', value: 'LOCKED_OUT' }),
  new SelectOption({ name: 'PASSWORD_EXPIRED', value: 'PASSWORD_EXPIRED' }),
  new SelectOption({ name: 'PROVISIONED', value: 'PROVISIONED' }),
  new SelectOption({ name: 'RECOVERY', value: 'RECOVERY' }),
  new SelectOption({ name: 'STAGED', value: 'STAGED' }),
  new SelectOption({ name: 'SUSPENDED', value: 'SUSPENDED' }),
  new SelectOption({ name: 'DELETED', value: 'DELETED' }),
  new SelectOption({ name: 'PENDING_IMPORT', value: 'PENDING_IMPORT' }),
];

export const ProfileSourceList: SelectOption[] = [
  new SelectOption({ name: 'All', value: 'All' }),
  new SelectOption({ name: 'Active Directory', value: 'active_directory' }),
  new SelectOption({ name: 'Okta', value: 'OKTA' }),
  new SelectOption({ name: 'Federation', value: 'FEDERATION' })
];

const FilterUsers: FC<Props> = ({ ...props }: Props) => {
  const classes = useStyles();

  const handleReset = () =>{
    props.userStore?.setUserFilter([]);
    props.userStore?.setProviderFilter('All');
    props.onSetClick({ provider: '', status: 'ACTIVE' });
  }

  const setUserFilter = (option: ISelectOption[]): void =>{
    props.userStore?.setUserFilter(option);
  }

  const setProfileSource = (option: string) =>{
    props.userStore?.setProviderFilter(option);
  }

  const dialogContent = (): ReactNode =>{
    return (
      <>
        <div className={classes.modalDetail}>
          <div className={classes.flexRow}>
            <Typography variant="h6" className={classes.subTitle}>
              Status
            </Typography>
            <AutoCompleteControl
              multiple={true}
              options={categoryList}
              onDropDownChange={item => setUserFilter(item as ISelectOption[])}
              value={props.userStore?.userFilter}
            />
            <Typography variant="h6" className={classes.subTitle}>
              Profile Source
            </Typography>
            <SelectInputControl
              containerClass={classes.dropDown}
              value={props.userStore?.providerFilter}
              selectOptions={ProfileSourceList}
              onOptionChange={item => setProfileSource(item)}
            />
          </div>
          <div className={classes.btnContainer}>
            <div className={classes.btnSection}>
              <PrimaryButton variant="contained" color="primary" onClick={() => handleReset()}>
                Reset
              </PrimaryButton>
            </div>
            <PrimaryButton
              variant="contained"
              color="primary"
              onClick={() =>
                props.onSetClick({ provider: props.userStore?.providerFilter, status: props.userStore?.userFilter })
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
    <Dialog
      title="Filter Users"
      open={true}
      classes={{
        dialogWrapper: classes.modalRoot,
        paperSize: classes.userMappedWidth,
        header: classes.headerWrapper,
        content: classes.content,
      }}
      onClose={() => ModalStore.close()}
      dialogContent={() => dialogContent()}
    />
  );
}

export default inject('userStore')(observer(FilterUsers));
