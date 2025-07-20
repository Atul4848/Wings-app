import React, { FC, useState } from 'react';
import { observer } from 'mobx-react';
import { finalize, takeUntil } from 'rxjs/operators';
import { AxiosError } from 'axios';
import { Observable } from 'rxjs';
import { AlertStore } from '@uvgo-shared/alert';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { IAPIImportEtpScenario, CustomResponseDialog } from '../../../Shared';
import { ImportDialog } from '@wings-shared/layout';
import { useUnsubscribe } from '@wings-shared/hooks';

interface Props {
  onImportFileData: (file: File) => Observable<IAPIImportEtpScenario>;
  onImportDone: () => void;
  title: string;
  successMessage: string;
}

const ImportFileDataV2: FC<Props> = ({ ...props }) => {
  const unsubscribe = useUnsubscribe();
  const [ isLoading, setIsLoading ] = useState(false);

  /* istanbul ignore next */
  const uploadFileData = (file: File): void => {
    setIsLoading(true);
    const { onImportFileData, onImportDone, successMessage } = props;
    onImportFileData(file)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          setIsLoading(false);
          onImportDone();
        })
      )
      .subscribe({
        next: ({ hasAllSuccess, message }) => {
          if (hasAllSuccess) {
            AlertStore.info(successMessage);
            ModalStore.close();
            return
          }
          ModalStore.open(<CustomResponseDialog heading="Records imported with errors" message={message || ''} />);
        },
        error: (error: AxiosError) => ModalStore.open(<CustomResponseDialog message={error.message} />),
      });
  };

  return <ImportDialog title={props.title} fileType=".txt" isLoading={() => isLoading} onUploadFile={uploadFileData} />;
};

export default observer(ImportFileDataV2);
