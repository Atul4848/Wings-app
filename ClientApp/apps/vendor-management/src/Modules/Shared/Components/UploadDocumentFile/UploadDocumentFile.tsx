import { withStyles } from '@material-ui/core';
import React, { FC, useRef, useState } from 'react';
import { Dialog } from '@uvgo-shared/dialog';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { IClasses, Loader } from '@wings-shared/core';
import { inject, observer } from 'mobx-react';
import { styles } from './UploadDocumentFile.style';
import { DocumentUploadStore } from '../../../../Stores';
import { AlertStore } from '@uvgo-shared/alert';

type Props = {
  classes?: IClasses;
  documentUploadStore?: any;
  fileType: string;
  title: string;
  uploadDocumentFile: () => void;
  loader: Loader;
};

const UploadDocumentFile: FC<Props> = ({
  classes,
  documentUploadStore,
  fileType,
  title,
  uploadDocumentFile,
  loader,
}) => {
  const [ dragActive, setDragActive ] = useState(false);
  const [ hasError, setHasError ] = useState(false);
  const inputRef = useRef(null);

  const handleDrag = e => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const invalidFile = (name: string) => {
    const parts = name.split('.');
    const extension = parts[parts.length - 1];
    const allowedExtensions = fileType.split(',').map(extension => extension.trim());

    if (!allowedExtensions.includes(`.${extension}`)) {
      AlertStore.info(`Application only supports ${allowedExtensions}`);
      setHasError(true);
    }
  };

  const handleDrop = e => {
    e.preventDefault();
    e.stopPropagation();
    setHasError(false);
    loader.setLoadingState(false)
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      documentUploadStore.file = e.dataTransfer.files;
      invalidFile(e.dataTransfer.files[0].name);
    }
  };

  const handleChange = e => {
    e.preventDefault();
    setHasError(false);
    loader.setLoadingState(false)
    if (e.target.files && e.target.files[0]) {
      documentUploadStore.file = e.target.files;
      invalidFile(e.target.files[0].name);
    }
  };

  const onButtonClick = () => {
    inputRef.current.click();
  };

  const dialogAction = () => {
    return (
      <>
        <PrimaryButton
          variant="contained"
          color="primary"
          disabled={loader.isLoading}
          onClick={() => {
            ModalStore.close();
            documentUploadStore.file = null;
          }}
        >
          Close
        </PrimaryButton>
        <PrimaryButton
          variant="contained"
          color="primary"
          disabled={!documentUploadStore.file || hasError || loader.isLoading}
          onClick={()=>uploadDocumentFile()}
        >
          Import
        </PrimaryButton>
      </>
    );
  };

  const dialogContent = (fileType: string, classes: IClasses) => {
    return (
      <form onDragEnter={handleDrag} onSubmit={e => e.preventDefault()} className={classes.formFileUpload}>
        {loader.spinner}
        <input
          ref={inputRef}
          type="file"
          accept={fileType}
          className={classes.inputFileUpload}
          onChange={handleChange}
        />
        <label
          htmlFor={classes.inputFileUpload}
          className={dragActive ? `${classes.labelFileUpload} ${classes.dragActive}` : `${classes.labelFileUpload}`}
          onClick={onButtonClick}
        >
          <div>
            <p>Drag and drop your file here or</p>
            <button className={classes.uploadButton}>
              {documentUploadStore.file ? `${documentUploadStore.file[0].name}` : 'Upload a file'}
            </button>
          </div>
        </label>
        {dragActive && (
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={classes.dragFileElement}
          ></div>
        )}
      </form>
    );
  };

  return (
    <Dialog
      title={title}
      open={true}
      onClose={() => {
        if(!loader.isLoading){
          ModalStore.close();
          documentUploadStore.file = null;
        }
      }}
      dialogContent={() => dialogContent(fileType, classes)}
      closeBtn={true}
      dialogActions={dialogAction}
      disableBackdropClick={true}
    />
  );
};

export default inject('documentUploadStore','vendorLocationStore')(withStyles(styles)(observer(UploadDocumentFile)));
