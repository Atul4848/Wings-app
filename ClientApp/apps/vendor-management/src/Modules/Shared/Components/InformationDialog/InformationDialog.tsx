import React, { FC } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from '@material-ui/core';
import { observer, inject } from 'mobx-react';
import { useStyles } from './InformationDialog.style';
import { CloseIcon } from '@uvgo-shared/icons';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { VendorLocationStore } from '../../../../Stores';
import { UIStore } from '@wings-shared/core';

type Props = {
  dialogWrapperWidth;
  title: string;
  message: React.ReactNode;
  saveDataAction: () => void;
  isActionVisible: boolean;
  vendorLocationStore?: VendorLocationStore;
};

const InformationDialog: FC<Props> = ({
  dialogWrapperWidth,
  title,
  message,
  isActionVisible,
  saveDataAction,
  vendorLocationStore,
}) => {
  const classes = useStyles();

  const [ open, setOpen ] = React.useState(true);

  const handleClose = () => {
    setOpen(false);
    ModalStore.close();
    vendorLocationStore.isTimeChanged = false;
  };

  const saveDataAndClosePopup = () => {
    saveDataAction();
  };

  return (
    <Dialog open={open} onClose={handleClose} className={dialogWrapperWidth} disableBackdropClick={true}>
      <div className="mainDialogWrapper">
        <div className={classes.dialog}>
          <div className={classes.titleWrapper}>
            <DialogTitle className={classes.title}>
              <strong>{title}</strong>
            </DialogTitle>
            {isActionVisible ? (
              ''
            ) : (
              <IconButton onClick={handleClose}>
                <CloseIcon />
              </IconButton>
            )}
          </div>
          <DialogContent className={`hoursDataContent ${classes.content}`}>{message}</DialogContent>
          {isActionVisible ? (
            <DialogActions>
              <Box sx={{ display: 'flex', gap: '10px' }}>
                <div className={`${classes.button}`}>
                  <Button color="primary" variant="outlined" onClick={() => handleClose()} size="large">
                    Cancel
                  </Button>
                </div>
                <div className={`${classes.primaryButton} ${classes.button}`}>
                  <Button
                    color="primary"
                    variant="contained"
                    onClick={() => saveDataAndClosePopup()}
                    size="large"
                    disabled={
                      !vendorLocationStore.isTimeChanged || vendorLocationStore.isDuplicateTime || UIStore.pageLoading
                    }
                  >
                    Save
                  </Button>
                </div>
              </Box>
            </DialogActions>
          ) : (
            ''
          )}
        </div>
      </div>
    </Dialog>
  );
};

export default inject('vendorLocationStore')(observer(InformationDialog));
