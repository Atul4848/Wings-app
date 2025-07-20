import React from 'react';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
import { finalize, takeUntil } from 'rxjs/operators';
import { AxiosError } from 'axios';
import { Observable } from 'rxjs';
import { AlertStore } from '@uvgo-shared/alert';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { IAPIFAAImportProcess } from '../../Interfaces';
import MobxReactForm from 'mobx-react-form';
import { UnsubscribableComponent } from '@wings-shared/core';
import { ImportDialog } from '@wings-shared/layout';
import { IViewInputControl } from '@wings-shared/form-controls';

interface Props {
  onImportFileData: (file: File) => Observable<IAPIFAAImportProcess>;
  onImportDone: () => void;
  title: string;
  successMessage: string;
  form: MobxReactForm;
  inputControl: IViewInputControl
}

@observer
class ImportFAAFile extends UnsubscribableComponent<Props> {
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
  }

  render() {
    return (
      <ImportDialog
        title={this.props.title}
        fileType="txt|xlsx"
        isLoading={() => this.isLoading}
        onUploadFile={file => this.uploadFileData(file)}
        closeBtnText="Close"
        form={this.props.form}
        inputControl={this.props.inputControl}
      />
    );
  }
}

export default ImportFAAFile;
