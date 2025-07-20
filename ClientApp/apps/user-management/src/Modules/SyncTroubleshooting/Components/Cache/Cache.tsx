import React, { ChangeEvent, FC, useMemo, useState } from 'react';
import { Theme, TextField, Button, CardContent } from '@material-ui/core';
import { styles } from './Cache.styles';
import { inject, observer } from 'mobx-react';
import { SyncTroubleshootStore } from '../../../Shared';
import { finalize, takeUntil } from 'rxjs/operators';
import { IClasses, UIStore, regex } from '@wings-shared/core';
import { AlertStore } from '@uvgo-shared/alert';
import { AxiosError } from 'axios';
import { useUnsubscribe } from '@wings-shared/hooks';
import { AuthStore, useRoles } from '@wings-shared/security';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { Dialog } from '@uvgo-shared/dialog';
import { InfoIcon } from '@uvgo-shared/icons';

interface Props {
  syncTroubleshootStore: SyncTroubleshootStore;
}

const Cache: FC<Props> = ({ ...props }: Props) => {

  const [ userId, setUserId ] = useState<string>('');
  const [ email, setEmail ] = useState<string>('');
  const _syncTroubleshootStore = props.syncTroubleshootStore as SyncTroubleshootStore;
  const unsubscribe = useUnsubscribe();
  const classes: Record<string, string> = styles();

  /* istanbul ignore next */
  const isUserIdValid = (): boolean => {
    if(userId === '' || userId === null){
      return false;
    }
    return regex.numberOnly.test(userId);
  }

  /* istanbul ignore next */
  const openConfirmationDeleteTokenEnrichmentJobDialog = (): void =>
    ModalStore.open(
      <Dialog
        key="Dialog"
        title={'Clear Token Enrichment'}
        open={true}
        onClose={() => { ModalStore.close() }}
        dialogContent={() => {
          return (
            <>
              <div className={classes.titleBox}>
                Are you sure you want to clear Token Enrichment?
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
                    onClick={() => deleteTokenEnrichment()}
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

  /* istanbul ignore next */
  const deleteTokenEnrichment = () => {
    UIStore.setPageLoader(true);
    _syncTroubleshootStore
      .deleteTokenEnrichment(userId)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          ModalStore.close();
          UIStore.setPageLoader(false)
        }),
      )
      .subscribe(() => setUserId(''));
  }


  /* istanbul ignore next */
  const isEmailValid = (): boolean => {
    if (email === '' || email === null) {
      return false;
    }
    return regex.email.test(email);
  }

  /* istanbul ignore next */
  const cacheCleaning = () => {
    UIStore.setPageLoader(true);
    _syncTroubleshootStore
      .cacheCleaning(email)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          ModalStore.close();
          UIStore.setPageLoader(false)
        }),
      )
      .subscribe(
        (response: string) => {
          setEmail('');
          AlertStore.info(`Cache Cleaning for Email Id ${email} Successfully`);
        },
        (error: AxiosError) => AlertStore.critical(error.message)
      );
  }

  /* istanbul ignore next */
  const openConfirmationCacheCleaningDialog = (): void =>
    ModalStore.open(
      <Dialog
        key="Dialog"
        title={'Clear CSD Products and Services'}
        open={true}
        onClose={() => { ModalStore.close() }}
        dialogContent={() => {
          return (
            <>
              <div className={classes.titleBox}>
                Are you sure you want to clear CSD Products and Services?
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
                    onClick={() => cacheCleaning()}
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
    <div className={classes.scrollable}>
      <div className={classes.content}>
        <TextField
          label="Token Enrichment Reset"
          placeholder="Enter CSD user Id"
          className={classes.usernameInput}
          onChange={({ target }: ChangeEvent<HTMLInputElement>) => setUserId(target.value)}
          value={userId}
          error={!isUserIdValid() && Boolean(userId)}
          helperText={!isUserIdValid() && Boolean(userId) ? 'Enter CSD user Id only' : ''}
        />
        <Button
          color="primary"
          variant="contained"
          size="small"
          className={classes.btnSubmit}
          disabled={!isUserIdValid()}
          onClick={() => openConfirmationDeleteTokenEnrichmentJobDialog()}
        >
          Submit
        </Button>
        <div className={classes.infoIcon}>
          <InfoIcon></InfoIcon>Clear Redis token enrichment values for a User
        </div>
      </div>
      <div className={classes.content}>
        <TextField
          label="Clear CSD Products and Services"
          placeholder="Enter username"
          className={classes.usernameInput}
          onChange={({ target }: ChangeEvent<HTMLInputElement>) => setEmail(target.value)}
          value={email}
          error={!isEmailValid() && Boolean(email)}
          helperText={!isEmailValid() && Boolean(email) ? 'Enter Email only' : ''}
        />
        <Button
          color="primary"
          variant="contained"
          size="small"
          className={classes.btnSubmit}
          disabled={!isEmailValid()}
          onClick={() => openConfirmationCacheCleaningDialog()}
        >
          Submit
        </Button>
        <div className={classes.infoIcon}>
          <InfoIcon></InfoIcon>Clear Redis CSD Products & Services values for a User
        </div>
      </div>
    </div>
  );
};

export default inject('syncTroubleshootStore')(observer(Cache));
