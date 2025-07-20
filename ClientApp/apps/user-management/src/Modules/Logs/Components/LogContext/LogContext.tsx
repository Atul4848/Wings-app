import React, { FC, ReactNode, useEffect } from 'react';
import {
  useGridState,
  useAgGrid
} from '@wings-shared/custom-ag-grid';
import { Dialog } from '@uvgo-shared/dialog';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { Button } from '@material-ui/core';
import { styles } from './LogContext.style';
import { inject, observer } from 'mobx-react';
import ReactJsonView from '@microlink/react-json-view'
import { LogModel } from '../../../Shared/Models/Log.model';

interface Props {
  context: LogModel
}

const LogContextDetail: FC<Props> = ({ ...props }: Props) => {

  const classes: Record<string, string> = styles();

  /* istanbul ignore next */
  const dialogContent = (): ReactNode => {
    return (
      <>
        <ReactJsonView src={props.context} name="Context" displayDataTypes={false} />
        <div className={classes.contextSection}>
          <div className={classes.btnContainer}>
            <Button
              color="primary"
              variant="contained"
              size="small"
              className={classes.btnAlign}
              onClick={() => ModalStore.close()}
            >
              Close
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <Dialog
      title='Log Details'
      classes={{
        dialogWrapper: classes.modalRoot,
        header: classes.headerWrapper,
      }}
      open={true}
      onClose={() => ModalStore.close()}
      dialogContent={dialogContent}
    />
  )
}

export default inject('logStore')(observer(LogContextDetail));

