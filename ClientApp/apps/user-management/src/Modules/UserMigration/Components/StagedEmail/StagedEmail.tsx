import { withStyles, TextField } from '@material-ui/core';
import React, { ChangeEvent, FC, ReactNode, useEffect, useState } from 'react';
import { Dialog } from '@uvgo-shared/dialog';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { CSDUserModel } from '../../../Shared';
import { observer } from 'mobx-react';
import { observable } from 'mobx';
import { styles } from './StagedEmail.style';
import { IClasses, regex, UnsubscribableComponent } from '@wings-shared/core';

interface Props {
  selectedCsdUser?: CSDUserModel;
  updateStagedEmail: (userId: number, email: string) => void;
}

const StagedEmail: FC<Props> = ({ ...props }: Props) => {
  const [ selectedStagedEmail, setSelectedStagedEmail ] = useState<string>('');
  const classes: Record<string, string> = styles();

  useEffect(() => {
    setSelectedStagedEmail(props.selectedCsdUser.stagedEmail || '');
  }, []);

  /* istanbul ignore next */
  const isValidStagedEmail = (): boolean => {
    return regex.email.test(selectedStagedEmail?.trim());
  }

  /* istanbul ignore next */
  const dialogContent = (): ReactNode => {
    const { selectedCsdUser, updateStagedEmail } = props;
    return (
      <>
        <div className={classes.modalDetail}>
          <label className={classes.textLabel}>Staged Email:</label>
          <TextField
            placeholder="Enter Stage Email"
            value={selectedStagedEmail}
            onChange={({ target }: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
              (setSelectedStagedEmail(target.value))
            }
          />
          <PrimaryButton
            className={classes.btnBox}
            variant="contained"
            color="primary"
            disabled={!isValidStagedEmail()}
            onClick={() => updateStagedEmail(selectedCsdUser?.id, selectedStagedEmail)}
          >
            Submit
          </PrimaryButton>
        </div>
      </>
    );
  }

  return (
    <Dialog
      title={`Update staged email for: ${props.selectedCsdUser?.name}`}
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
};

export default (observer(StagedEmail));
