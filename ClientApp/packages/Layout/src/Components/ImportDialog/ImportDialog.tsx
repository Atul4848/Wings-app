import React, { FC, ReactNode } from 'react';
import { Typography } from '@material-ui/core';
import AttachFileIcon from '@material-ui/icons/AttachFile';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { AlertStore } from '@uvgo-shared/alert';
import { Dialog } from '@uvgo-shared/dialog';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import { GridOptions } from 'ag-grid-community';
import { useStyles } from './ImportDialog.styles';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { CustomAgGridReact } from '@wings-shared/custom-ag-grid';
import {
  IClasses,
  IOptionValue,
  UIStore,
} from '@wings-shared/core';
import { IViewInputControl, ViewInputControl } from '@wings-shared/form-controls';
import MobxReactForm, { Field } from 'mobx-react-form';
import classNames from 'classnames';

export interface Props {
  classes?: IClasses;
  title: string;
  onUploadFile: (file: File) => void;
  isLoading: () => boolean;
  gridOptions?: GridOptions;
  exceptionData?: any[]; // this can be any type of array object
  fileType?: string;
  btnText?: string;
  closeBtnText?: string;
  fields?: any;
  form?: MobxReactForm;
  inputControl?: IViewInputControl;
}

const ImportDialog: FC<Props> = observer(({
  btnText = 'Import',
  closeBtnText = 'Cancel',
  ...props
}: Props) => {

  const classes = useStyles();
  const fileType = props.fileType || '.xlsx'
  const requiredFileTypeRegexp = new RegExp(`(${fileType})$`, 'g')

  const _observable = observable({
    files: [] as File[],
  });

  const getField = (key: string): Field => {
    return props.form?.$(key);
  };

  const setFiles = (files: File[]) => {
    if (!files || !files.length) {
      return;
    }
    if (!requiredFileTypeRegexp.test(files[0].name)) {
      AlertStore.critical(`File extension not supported, please select a ${fileType} file !`);
      return;
    }
    _observable.files = files;
  }

  const fileName = (): string => {
    if (_observable.files && _observable.files.length) {
      return _observable.files[0].name;
    }
    return '';
  }

  const isButtonDisabled = (): boolean => {
    const disabled = _observable.files.length === 0 ||
      props.isLoading() ||
      UIStore.pageLoading ||
      Boolean(props.exceptionData?.length)

    if (props.inputControl) {
      const fieldValue = getField(props.inputControl.fieldKey).value
      const isDisabled = typeof fieldValue === 'object' ? !Boolean(fieldValue?.id) : !Boolean(fieldValue)
      return isDisabled || disabled
    }
    return disabled;
  }

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    return {
      defaultColDef: { flex: 1, resizable: true, maxWidth: 400 },
      context: {},
      pagination: true,
      paginationPageSize: 30,
      rowHeight: 50,
      ...props.gridOptions,
    };
  }

  const onValueChange = (value: IOptionValue, fieldKey: string): void => {
    getField(fieldKey).set(value);
  }

  const uploadSection = (): ReactNode => {
    if (props.exceptionData?.length) {
      return <CustomAgGridReact gridOptions={gridOptions()} rowData={props.exceptionData} />;
    }
    return (
      <>
        {props.inputControl && (
          <ViewInputControl
            {...props.inputControl}
            isEditable={true}
            field={getField(props.inputControl.fieldKey)}
            onValueChange={onValueChange}
          />
        )}
        <Typography component="label" className={classes.selectFileSection}>
          <div className={classes.selectFile}>
            <AttachFileIcon />
            <Typography variant="subtitle2">{_observable.files.length ? fileName() : 'Select File'}</Typography>
          </div>
          <input
            type="file"
            style={{ display: 'none' }}
            onChange={event => setFiles(Array.from(event.currentTarget.files))}
            accept={fileType}
          />
        </Typography>
      </>
    );
  }

  const dialogActions = (): ReactNode => {
    return (
      <>
        <PrimaryButton
          variant="outlined"
          color="primary"
          onClick={() => {
            props.form?.reset();
            ModalStore.close();
          }}
        >
          {closeBtnText}
        </PrimaryButton>
        <PrimaryButton
          variant="contained"
          disabled={isButtonDisabled()}
          onClick={() => props.onUploadFile(_observable.files[0])}
        >
          {btnText}
        </PrimaryButton>
      </>
    );
  }

  return (
    <Dialog
      title={props.title}
      open={true}
      isLoading={props.isLoading}
      classes={{
        paperSize: classNames({
          [classes.paperSize]: !props.classes,
        }),
      }}
      onClose={() => {
        props.form?.reset();
        ModalStore.close();
      }}
      dialogActions={dialogActions}
      dialogContent={() => <div className={classes.root}>{uploadSection()}</div>}
    />
  );
})

export default ImportDialog;
