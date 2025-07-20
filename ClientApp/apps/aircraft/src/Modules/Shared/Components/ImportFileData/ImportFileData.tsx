import React from 'react';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
import { finalize, takeUntil } from 'rxjs/operators';
import { AxiosError } from 'axios';
import { Observable } from 'rxjs';
import { AlertStore } from '@uvgo-shared/alert';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { IAPIImportEtpScenario } from '../../../Shared/Interfaces';
import { CustomResponseDialog } from '../index';
import { UnsubscribableComponent } from '@wings-shared/core';
import { ImportDialog } from '@wings-shared/layout';

interface Props {
  onImportFileData: (file: File) => Observable<IAPIImportEtpScenario>;
  onImportDone: () => void;
  title: string;
  successMessage: string;
}

@observer
class ImportFileData extends UnsubscribableComponent<Props> {
  @observable private isLoading: boolean = false;

  /* istanbul ignore next */
  @action
  private uploadFileData(file: File): void {
    this.isLoading = true;
    const { onImportFileData, onImportDone, successMessage } = this.props;
    onImportFileData(file)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isLoading = false;
          onImportDone();
        })
      )
      .subscribe({
        next: ({ hasAllSuccess, message }) => {
          if (hasAllSuccess) {
            AlertStore.info(successMessage);
            ModalStore.close();
          } else {
            ModalStore.open(<CustomResponseDialog heading="Records imported with errors" message={message} />);
          }
        },
        error: (error: AxiosError) => ModalStore.open(<CustomResponseDialog message={error.message} />),
      });
  }

  render() {
    return (
      <ImportDialog
        title={this.props.title}
        fileType=".txt"
        isLoading={() => this.isLoading}
        onUploadFile={file => this.uploadFileData(file)}
      />
    );
  }
}

export default ImportFileData;
