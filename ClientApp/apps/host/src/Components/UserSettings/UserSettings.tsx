import React, { useEffect, FC, ReactNode } from 'react';
import { Dialog } from '@uvgo-shared/dialog';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { Checkbox, FormControlLabel, TextField, Typography } from '@material-ui/core';
import { AuthStore } from '@wings-shared/security';
import { styles } from './UserSettings.styles';
import { ModeStore, MODE_TYPES } from '@wings-shared/mode-store';
import { IClasses, Utilities } from '@wings-shared/core';

interface Props {
  classes?: IClasses;
}

const UserSettings: FC<Props> = (props: Props) => {
  const toggleMode = (mode: MODE_TYPES): void => {
    const newModeState: boolean = !ModeStore.isModeEnabled(mode);
    ModeStore.switchMode(mode, newModeState);
  };

  useEffect(() => {
    // AuthStore.getBuildVersion();
  }, []);

  const renderModeItems = (): ReactNode => {
    // only admins able to change modes
    if (!AuthStore.user?.isAdminUser) {
      return null;
    }

    const items = [];

    for (const item in MODE_TYPES) {
      items.push(
        <FormControlLabel
          key={Utilities.getTempId()}
          control={
            <Checkbox
              style={styles.checkBox}
              color="primary"
              value={item}
              checked={ModeStore.isModeEnabled(MODE_TYPES[item])}
              onChange={() => toggleMode(MODE_TYPES[item])}
            />
          }
          label={MODE_TYPES[item].toUpperCase()}
        />
      );
    }

    return (
      <>
        <Typography>Available Modes:</Typography>
        {items}
        <Typography style={styles.version}>Version: {AuthStore.buildVersion}</Typography>
      </>
    );
  };

  const content = (): ReactNode => {
    return (
      <>
        <TextField
          style={styles.field}
          value={AuthStore.user?.name}
          label={'Logged as'}
          type="text"
          margin="none"
          disabled
        />
        <TextField
          style={styles.field}
          value={AuthStore.user?.authorizationGroups.join(', ')}
          label={'Access Groups'}
          type="text"
          margin="none"
          disabled
        />
        <TextField
          style={styles.field}
          value={AuthStore.user?.email}
          label={'Email'}
          type="text"
          margin="none"
          disabled
        />
        {renderModeItems()}
      </>
    );
  };

  return (
    <Dialog
      title="User Settings"
      open={true}
      onClose={() => ModalStore.close()}
      dialogContent={content}
      dialogActions={() => null}
    />
  );
};

export default UserSettings;
