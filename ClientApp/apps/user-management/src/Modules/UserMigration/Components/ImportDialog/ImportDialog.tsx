import {
  withStyles,
  CardContent,
  FormControlLabel,
  Button,
  Theme,
  FormControl,
  RadioGroup,
  Radio,
  Checkbox,
} from '@material-ui/core';
import React, { ChangeEvent, FC, ReactNode, useEffect, useState } from 'react';
import { Dialog } from '@uvgo-shared/dialog';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { inject, observer } from 'mobx-react';
import { UserStore } from '../../../Shared/Stores';
import { action, observable } from 'mobx';
import { finalize } from 'rxjs/operators';
import { AlertStore } from '@uvgo-shared/alert';
import { styles } from './ImportDialog.style';
import { CSDUserModel, IAPIMigrateUserResponse, UserModel } from '../../../Shared';
import { IAPIResponse } from '@wings/airport-logistics/src/Modules/Shared';
import { IClasses, UIStore, UnsubscribableComponent } from '@wings-shared/core';

interface Props {
  userStore?: UserStore;
  selectedUser: CSDUserModel;
}

const ImportDialog: FC<Props> = ({ ...props }: Props) => {
  const [ overrideImport, setOverrideImport ] = useState<boolean>(false);
  const [ isFederated, setIsFederated ] = useState<boolean>(false);
  const [ disableSubmits, setDisableSubmits ] = useState<boolean>(false);
  const [ selectedCsdUser, setSelectedCsdUser ] = useState<CSDUserModel>(new CSDUserModel());
  const classes: Record<string, string> = styles();
  const _userStore = props.userStore as UserStore;

  useEffect(() => {
    setSelectedCsdUser(props.selectedUser);
  }, []);

  const onOverrideChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setOverrideImport(event.target.checked);
  }

  const onFederatedChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setIsFederated(event.target.checked);
  }

  /* istanbul ignore next */
  const migrateUser = (): void => {
    UIStore.setPageLoader(true);
    setDisableSubmits(true);
    _userStore
      .migrateUser(
        selectedCsdUser?.name,
        overrideImport,
        isFederated,
        selectedCsdUser?.id
      )
      .pipe(
        finalize(() => {
          UIStore.setPageLoader(false);
          setDisableSubmits(false);
        })
      )
      .subscribe({
        next: (response: IAPIResponse<IAPIMigrateUserResponse>) => {
          ModalStore.close();
          AlertStore.info(response.Data.Message);
        },
        error: (error: any) => {
          AlertStore.critical(error.response.data.Errors[0].Message);
        },
      });
  }

  /* istanbul ignore next */
  const dialogContent = (): ReactNode => {
    return (
      <>
        <FormControl className={classes.redioSection}>
          <div>
            <RadioGroup
              aria-labelledby="demo-radio-buttons-group-label"
              defaultValue="Standard"
              name="radio-buttons-group"
            >
              <FormControlLabel
                value="Standard"
                control={<Radio color="primary" onChange={e => onOverrideChange(e)} />}
                label="Standard"
              />
              <FormControlLabel
                value="Federated"
                control={<Radio color="primary" onChange={e => onFederatedChange(e)} />}
                label="Federated"
              />
            </RadioGroup>
          </div>
        </FormControl>
        <CardContent className={classes.cardRowBtn}>
          <div className={classes.btnContainer}>
            <div className={classes.btnSection}>
              <Button variant="contained" color="primary" onClick={() => ModalStore.close()}>
                Cancel
              </Button>
            </div>
            <Button
              color="primary"
              variant="contained"
              size="small"
              className={classes.btnAlign}
              onClick={() => migrateUser()}
              disabled={disableSubmits || !Boolean(selectedCsdUser.email)}
            >
              Import
            </Button>
          </div>
        </CardContent>
      </>
    );
  }

  return (
    <Dialog
      title="Import to OKTA"
      open={true}
      classes={{
        dialogWrapper: classes.modalRoot,
        paperSize: classes.userMappedWidth,
        header: classes.headerWrapper,
        content: classes.content,
      }}
      dialogContent={() => dialogContent()}
    />
  );
};

export default inject('userStore')(observer(ImportDialog));