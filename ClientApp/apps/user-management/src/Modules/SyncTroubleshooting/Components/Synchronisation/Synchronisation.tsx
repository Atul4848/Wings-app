import React, { ChangeEvent, FC, useMemo, useRef, useState } from 'react';
import {
  TextField,
  Button,
  Tooltip,
  FormControlLabel,
  CardContent,
  Checkbox,
} from '@material-ui/core';
import { styles } from './Synchronisation.styles';
import { inject, observer } from 'mobx-react';
import { SyncTroubleshootStore } from '../../../Shared';
import { finalize, takeUntil } from 'rxjs/operators';
import { AlertStore } from '@uvgo-shared/alert';
import { AxiosError } from 'axios';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { UIStore, regex } from '@wings-shared/core';
import { Dialog } from '@uvgo-shared/dialog';
import { useUnsubscribe } from '@wings-shared/hooks';
import { AuthStore } from '@wings-shared/security';
import { InfoIcon } from '@uvgo-shared/icons';

interface Props {
  syncTroubleshootStore: SyncTroubleshootStore;
}

const Synchronisation: FC<Props> = ({ ...props }: Props) => {

  const [ csdUsername, setCsdUsername ] = useState<string>('');
  const [ username, setUsername ] = useState<string>('');
  const overwrite = useRef<boolean>(false);
  const _syncTroubleshootStore = props.syncTroubleshootStore as SyncTroubleshootStore;
  const unsubscribe = useUnsubscribe();
  const classes: Record<string, string> = styles();

  const onOverwriteChange = (event: ChangeEvent<HTMLInputElement>): void => {
    overwrite.current = event.target.checked;
  }

  /* istanbul ignore next */
  const isCSDUsernameValid = (): boolean => {
    if (csdUsername === '' || csdUsername === null) {
      return false;
    }
    return regex.alphaNumericsWithDot.test(csdUsername);
  }

  /* istanbul ignore next */
  const isUsernameValid = (): boolean => {
    if (username === '' || username === null) {
      return false;
    }
    return true;
  }

  /* istanbul ignore next */
  const resyncUser = () => {
    UIStore.setPageLoader(true);
    _syncTroubleshootStore
      .resyncUser(csdUsername, username, overwrite.current)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false);
          overwrite.current = false;
          ModalStore.close();
        })
      )
      .subscribe(
        (response: string) => {
          setUsername('');
          setCsdUsername('');
          AlertStore.info(response);
        },
        (error: AxiosError) => AlertStore.critical(error.message)
      );
  }

  /* istanbul ignore next */
  const openConfirmationDialog = (): void => {
    ModalStore.open(
      <Dialog
        key="Dialog"
        title={'Resync User'}
        open={true}
        onClose={() => {
          overwrite.current = false;
          ModalStore.close();
        }}
        dialogContent={() => {
          return (
            <>
              <div className={classes.overwriteBox}>
                <FormControlLabel
                  value={overwrite.current}
                  control={<Checkbox color="primary" onChange={e => onOverwriteChange(e)} />}
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
                        overwrite.current = false;
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
                    onClick={() => resyncUser()}
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

  return (
    <div className={classes.scrollable}>
      <div className={classes.content}>
        <TextField
          label="CSD Username"
          placeholder="Enter CSD Username"
          className={classes.usernameInput}
          onChange={({ target }: ChangeEvent<HTMLInputElement>) => setCsdUsername(target.value)}
          value={csdUsername}
          error={!isCSDUsernameValid() && Boolean(csdUsername)}
          helperText={!isCSDUsernameValid() && Boolean(csdUsername) ? 'Enter CSDUsername only' : ''}
        />
        <TextField
          label="Username"
          placeholder="Enter Username"
          className={classes.usernameInput}
          onChange={({ target }: ChangeEvent<HTMLInputElement>) => setUsername(target.value)}
          value={username}
          error={!isUsernameValid() && Boolean(username)}
          helperText={!isUsernameValid() && Boolean(username) ? 'Enter Username only' : ''}
        />
        <Tooltip
          classes={{ tooltip: classes.customToolTip, arrow: classes.customArrow }}
          placement="top"
          title="This Resync tool will upsert a CSD user into the MongoDb"
          arrow
        >
          <Button
            color="primary"
            variant="contained"
            size="small"
            className={classes.btnSubmit}
            disabled={!isCSDUsernameValid() && !isUsernameValid()}
            onClick={() => openConfirmationDialog()}
          >
            Resync User
          </Button>
        </Tooltip>
        <div className={classes.infoIcon}>
          <InfoIcon></InfoIcon>This background job upserts a single User in UM Users collection with the latest values
          from Okta and an optional CSD profile.
        </div>
      </div>
    </div>
  );
};

export default inject('syncTroubleshootStore')(observer(Synchronisation));
