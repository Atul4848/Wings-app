import { withStyles } from '@material-ui/core';
import { Dialog } from '@uvgo-shared/dialog';
import React from 'react';
import { styles } from './PreviewDetailsDialog.style';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { UserSubscriptionModel } from '../../../Shared/Models/UserSubscription.model';
import { IAPIEvent } from '../../../Shared';
import { IClasses } from '@wings-shared/core';

interface Props {
    classes: IClasses;
    details: UserSubscriptionModel | IAPIEvent;
    title: string;
}

const PreviewSubscriptionDetailsDialog = ({ classes, title, details }: Props) => {
  return (
    <Dialog
      title={title}
      open={true}
      onClose={() => ModalStore.close()}
      dialogContent={() => (
        <div className={classes.inputControlSection}>
          <textarea
            className={classes.inputControlContent}
            rows={30}
            cols={60}
            disabled={true}
            readOnly={true}
            value={JSON.stringify(details, null, 2)}
          ></textarea>
        </div>
      )}
    />
  );
}

export default withStyles(styles)(PreviewSubscriptionDetailsDialog);