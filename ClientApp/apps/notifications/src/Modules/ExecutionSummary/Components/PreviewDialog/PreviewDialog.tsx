import { withStyles } from '@material-ui/core';
import { Dialog } from '@uvgo-shared/dialog';
import React from 'react';
import { styles } from './PreviewDialog.style';
import { DELIVERY_TYPE, ExecutionEntry } from '../../../Shared';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { IClasses } from '@wings-shared/core';

interface Props {
    classes: IClasses;
    executionEntry: ExecutionEntry;
}

const PreviewDialog = ({ classes, executionEntry }: Props) => {
  return (
    <Dialog
      title={executionEntry.deliveryType == DELIVERY_TYPE.EMAIL ? 'Delivered Email Content' : 'Delivered SMS Content'}
      open={true}
      classes={{ paperSize: classes.paperSize }}
      onClose={() => ModalStore.close()}
      dialogContent={() => (
        <div className={classes.root}>
          <div dangerouslySetInnerHTML={{ __html: executionEntry.deliveredContent }}></div>
        </div>
      )}
    />
  );
}

export default withStyles(styles)(PreviewDialog);