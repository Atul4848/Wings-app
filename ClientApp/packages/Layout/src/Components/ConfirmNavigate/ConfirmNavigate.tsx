import React, { ReactElement, useEffect } from 'react';
import { unstable_useBlocker as useBlocker } from 'react-router-dom';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import ConfirmDialog from '../ConfirmDialog/ConfirmDialog';

interface Props {
  isBlocker?: boolean;
  children?: ReactElement;
}

const ConfirmNavigate = ({ isBlocker, children }: Props) => {
  /* istanbul ignore next */
  const blocker = useBlocker(({ currentLocation, nextLocation }) => {
    if (
      currentLocation.pathname === nextLocation.pathname ||
      currentLocation.state?.noBlocker ||
      currentLocation.pathname.endsWith('/new')
    ) {
      return false;
    }
    return isBlocker;
  });

  /* istanbul ignore next */
  useEffect(() => {
    if (blocker.state === 'blocked') {
      ModalStore.open(
        <ConfirmDialog
          title="Confirm Save Data"
          message="Leaving this page will lost your changes. Are you sure you want to leave this page?"
          yesButton="Leave this Page"
          noButton="Stay on this Page"
          noButtonVariant="outlined"
          onNoClick={() => {
            ModalStore.close();
            blocker.reset();
            return false;
          }}
          onYesClick={() => {
            ModalStore.close();
            blocker.proceed();
            return false;
          }}
          onCloseClick={() => {
            ModalStore.close();
            blocker.reset();
          }}
        />
      );
    }
  }, [blocker.state]);

  return children;
};

export default ConfirmNavigate;
