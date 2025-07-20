import React, { ChangeEvent, FC, useMemo, useRef, useState } from 'react';
import { styles } from './Jobs.styles';
import {
  Button,
  Typography,
  TextField,
  FormControlLabel,
  CardContent,
  Checkbox,
} from '@material-ui/core';
import { SyncTroubleshootStore } from '../../../Shared';
import { inject, observer } from 'mobx-react';
import { finalize, flatMap, takeUntil } from 'rxjs/operators';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { AlertStore } from '@uvgo-shared/alert';
import { AxiosError } from 'axios';
import { UIStore, regex } from '@wings-shared/core';
import { ConfirmDialog } from '@wings-shared/layout';
import { Dialog } from '@uvgo-shared/dialog';
import { useUnsubscribe } from '@wings-shared/hooks';
import { AuthStore, useRoles } from '@wings-shared/security';
import { InfoIcon } from '@uvgo-shared/icons';

interface Props {
  syncTroubleshootStore?: SyncTroubleshootStore;
}

const Jobs: FC<Props> = ({ ...props }: Props) => {

  const overwritePreferences = useRef<boolean>(false);
  const _syncTroubleshootStore = props.syncTroubleshootStore as SyncTroubleshootStore;
  const unsubscribe = useUnsubscribe();
  const classes: Record<string, string> = styles();

  const onOverwritePreferencesChange = (event: ChangeEvent<HTMLInputElement>): void => {
    overwritePreferences.current = event.target.checked;
  }

  const hasWritePermission = useMemo(() => AuthStore.permissions.hasAnyPermission([ 'write' ]), [
    AuthStore.permissions,
  ]);

  const hasUMAdminRole = useRoles([ 'um_admin' ]).hasAnyRole

  /* istanbul ignore next */
  const refreshUsers = (): void => {
    UIStore.setPageLoader(true);
    _syncTroubleshootStore
      .refreshUsers()
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          ModalStore.close();
          UIStore.setPageLoader(false);
        })
      )
      .subscribe(
        response => {
          AlertStore.info(response.Message);
        },
        (error: AxiosError) => AlertStore.critical(error.message)
      );
  }

  /* istanbul ignore next */
  const triggerRefreshCustomers = (): void => {
    UIStore.setPageLoader(true);
    _syncTroubleshootStore
      .triggerRefreshCustomers()
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          ModalStore.close();
          UIStore.setPageLoader(false);
        })
      )
      .subscribe(
        (response: any) => {
          AlertStore.info(response.Message);
        },
        (error: AxiosError) => AlertStore.critical(error.message)
      );
  }

  /* istanbul ignore next */
  const triggerSyncUserPreferences = (): void => {
    UIStore.setPageLoader(true);
    _syncTroubleshootStore
      .triggerSyncUserPreferences(overwritePreferences.current)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          ModalStore.close();
          overwritePreferences.current = false;
          UIStore.setPageLoader(false);
        })
      )
      .subscribe(
        (response: any) => {
          AlertStore.info(response.Message);
        },
        (error: AxiosError) => AlertStore.critical(error.message)
      );
  }

  const openConfirmationDialog = (title: string, action: () => void): void => {
    ModalStore.open(
      <ConfirmDialog
        title="Refresh MongoDb Customers"
        message={
          <>
            <div
              className={classes.titleBox}
            >{`This action cannot be undone. Are you sure you want to Refresh ${title}?`}</div>
          </>
        }
        yesButton="Yes"
        onNoClick={() => ModalStore.close()}
        onYesClick={action}
      />
    );
  }

  /* istanbul ignore next */
  const syncPreferencesConfirmationDialog = (): void => {
    ModalStore.open(
      <Dialog
        key="Dialog"
        title={'Sync User Preferences'}
        open={true}
        onClose={() => {
          overwritePreferences.current = false;
          ModalStore.close();
        }}
        dialogContent={() => {
          return (
            <>
              <div className={classes.overwriteBox}>
                <FormControlLabel
                  value="Overwrite"
                  control={<Checkbox color="primary" onChange={e => onOverwritePreferencesChange(e)} />}
                  label="Overwrite"
                />
              </div>
              <CardContent className={classes.cardRowBtn}>
                <div className={classes.btnContainer}>
                  <div className={classes.btnSection}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => {
                        overwritePreferences.current = false;
                        ModalStore.close();
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                  <Button
                    color="primary"
                    variant="contained"
                    size="small"
                    className={classes.btnAlign}
                    onClick={() => triggerSyncUserPreferences()}
                  >
                    Yes
                  </Button>
                </div>
              </CardContent>
            </>
          );
        }}
      />
    );
  }

  /* istanbul ignore next */
  const openConfirmationUpsertUsersJobDialog = (): void =>
    ModalStore.open(
      <Dialog
        key="Dialog"
        title={'Upsert MongoDb Users'}
        open={true}
        onClose={() => { ModalStore.close() }}
        dialogContent={() => {
          return (
            <>
              <div className={classes.titleBox}>
                This action cannot be undone. Are you sure you want to run this job ?
              </div>
              <CardContent className={classes.cardRowBtn}>
                <div className={classes.btnContainer}>
                  <div className={classes.btnSection}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => {
                        ModalStore.close();
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                  <Button
                    color="primary"
                    variant="contained"
                    size="small"
                    className={classes.btnAlign}
                    onClick={() => refreshUsers()}
                  >
                    Yes
                  </Button>
                </div>
              </CardContent>
            </>
          );
        }}
      />
    );

  return (
    <>
      <div className={classes.scrollable}>
        <div className={classes.singleContent}>
          <div className={classes.inputBox}>
            <Typography variant="body2" component="h6">
              Upsert MongoDb Users
            </Typography>
            <Button
              color="primary"
              variant="contained"
              size="small"
              className={classes.btnSubmit}
              disabled={!hasWritePermission || !hasUMAdminRole}
              onClick={() => openConfirmationUpsertUsersJobDialog()}
            >
              Refresh Users
            </Button>
            <div className={classes.infoIcon}>
              <InfoIcon></InfoIcon>This background job upserts all active users into the UM MongoDB Users collection
              using data from CSD and Okta sources.
            </div>
          </div>
          <div className={classes.inputBox}>
            <Typography variant="body2" component="h6">
              Upsert MongoDb Customers
            </Typography>
            <Button
              color="primary"
              variant="contained"
              size="small"
              className={classes.btnSubmit}
              disabled={!hasWritePermission || !hasUMAdminRole}
              onClick={() => openConfirmationDialog('Customers', () => triggerRefreshCustomers())}
            >
              Refresh Customers
            </Button>
            <div className={classes.infoIcon}>
              <InfoIcon></InfoIcon>This background job upserts customers into the UM MongoDB Customer collection using
              data from ReferenceData customers.
            </div>
          </div>
          <div className={classes.inputBox}>
            <Typography variant="body2" component="h6">
              Sync User's Preferences
            </Typography>
            <Button
              color="primary"
              variant="contained"
              size="small"
              className={classes.btnSubmit}
              disabled={!hasWritePermission || !hasUMAdminRole}
              onClick={() => syncPreferencesConfirmationDialog()}
            >
              Sync User Preferences
            </Button>
            <div className={classes.infoIcon}>
              <InfoIcon></InfoIcon>This background job updates user preferences for all active users in the UM MongoDB
              Users collection using the preference attribute from Okta.
            </div>
          </div>
        </div>
      </div>
    </>
  );
};


export default inject('syncTroubleshootStore')(observer(Jobs));
