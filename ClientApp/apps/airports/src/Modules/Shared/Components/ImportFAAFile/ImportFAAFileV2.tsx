import React, { FC, useState } from 'react';
import { observer } from 'mobx-react';
import { finalize, takeUntil } from 'rxjs/operators';
import { AxiosError } from 'axios';
import { Observable } from 'rxjs';
import { AlertStore } from '@uvgo-shared/alert';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { IAPIFAAImportProcess } from '../../Interfaces';
import MobxReactForm from 'mobx-react-form';
import { ImportDialog } from '@wings-shared/layout';
import { useUnsubscribe } from '@wings-shared/hooks';
import { IViewInputControl } from '@wings-shared/form-controls';

interface Props {
  onImportFileData: (file: File) => Observable<IAPIFAAImportProcess>;
  onImportDone: () => void;
  title: string;
  successMessage: string;
  form: MobxReactForm;
  inputControl: IViewInputControl
}

const ImportFAAFile: FC<Props> = ({ ...props }) => {
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
        next: response => {
          if (response) {
            AlertStore.info(successMessage);
            ModalStore.close();
          }
        },
        error: (error: AxiosError) => {
          AlertStore.info(`Records imported with errors ${error.message}`);
          ModalStore.close();
        },
      });
  };

  return (
    <ImportDialog
      title={props.title}
      fileType="txt|xlsx"
      isLoading={() => isLoading}
      onUploadFile={file => uploadFileData(file)}
      closeBtnText="Close"
      form={props.form}
      inputControl={props.inputControl}
    />
  );
};

export default observer(ImportFAAFile);
