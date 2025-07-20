import React, { FC, ReactNode, useEffect, useState } from 'react';
import { VIEW_MODE, useBaseUpsertComponent } from '@wings/shared';
import { EDITOR_TYPES, ViewInputControl, IGroupInputControls, IViewInputControl } from '@wings-shared/form-controls';
import { useNavigate, useParams } from 'react-router';
import { BlobModel, FeatureNoteModel, FeatureNoteStore } from '../../../Shared';
import { useStyles } from './FeatureNoteEditor.styles';
import { inject, observer } from 'mobx-react';
import { AlertStore } from '@uvgo-shared/alert';
import { fields } from './Fields';
import { finalize, takeUntil } from 'rxjs/operators';
import classNames from 'classnames';
import { forkJoin } from 'rxjs';
import {
  DATE_FORMAT,
  IClasses,
  IOptionValue,
  ISelectOption,
  UIStore,
  GRID_ACTIONS,
} from '@wings-shared/core';
import { DetailsEditorWrapper, EditSaveButtons } from '@wings-shared/layout';
import { useUnsubscribe } from '@wings-shared/hooks';
import FeatureNoteBlob from '../FeatureNoteBlob/FeatureNoteBlob';

interface Props {
  classes?: IClasses;
  featureNoteStore?: FeatureNoteStore;
  viewMode?: VIEW_MODE;
}

const FeatureNoteEditor: FC<Props> = ({ ...props }: Props) => {
  const [ featureNote, setFeatureNote ] = useState(new FeatureNoteModel({ id: '' }));
  const classes = useStyles();
  const unsubscribe = useUnsubscribe();
  const params = useParams();
  const useUpsert = useBaseUpsertComponent(params, fields);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!featureNoteId()) {
      navigateToFeatureNotes();
      return;
    }
    const { featureNoteStore } = props;
    UIStore.setPageLoader(true);
    forkJoin([ featureNoteStore?.loadFeatureNoteById(featureNoteId()), featureNoteStore?.getFeatureNotes() ])
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(([ featureNote ]: FeatureNoteModel[]) => {
        setFeatureNote(new FeatureNoteModel(featureNote));
        useUpsert.setFormValues(featureNote);
      });
  }, []);

  const updateFeatureNote = (): void => {
    const formValues: FeatureNoteModel = useUpsert.form.values();
    const featureNoteSetting = new FeatureNoteModel({ ...featureNote, ...formValues });
    UIStore.setPageLoader(true);
    props.featureNoteStore
      ?.updateFeatureNote(featureNoteSetting)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: () => navigateToFeatureNotes(),
        error: error => AlertStore.critical(error.message),
      });
  }

  const loadCategories = (): ISelectOption[] =>{
    const featureNoteStore = props.featureNoteStore as FeatureNoteStore;
    return featureNoteStore?.featureNotes
      .map(item => item.category?.value as string)
      .filter((value, index, self) => value && self.indexOf(value) === index)
      .map(item => ({ label: item, value: item }));
  }

  const groupInputControls = (): IGroupInputControls => {
    return {
      title: 'FeatureNote',
      inputControls: [
        {
          fieldKey: 'startDate',
          type: EDITOR_TYPES.DATE_TIME,
          dateTimeFormat: DATE_FORMAT.GRID_DISPLAY,
          allowKeyboardInput: false,
        },
        {
          fieldKey: 'title',
          type: EDITOR_TYPES.TEXT_FIELD,
        },
        {
          fieldKey: 'category',
          type: EDITOR_TYPES.DROPDOWN,
          options: loadCategories(),
          freeSolo: true,
          isExists: Boolean(customErrorMessage()),
          customErrorMessage: customErrorMessage(),
        },
        {
          fieldKey: 'releaseVersion',
          type: EDITOR_TYPES.TEXT_FIELD,
        },
        {
          fieldKey: 'isInternal',
          type: EDITOR_TYPES.CHECKBOX,
        },
        {
          fieldKey: 'isPublished',
          type: EDITOR_TYPES.CHECKBOX,
          isDisabled: true,
        },
        {
          fieldKey: 'isArchived',
          type: EDITOR_TYPES.CHECKBOX,
          isDisabled: true,
        },
        {
          fieldKey: 'blobUrls',
          type: EDITOR_TYPES.CUSTOM_COMPONENT,
        },
        {
          fieldKey: 'message',
          type: EDITOR_TYPES.MARKDOWN_EDITOR,
          isFullFlex: true,
        },
      ],
    };
  }

  const customErrorMessage = (): string => {
    return useUpsert.getField('category').value?.label?.length > 100
      ? 'The Category field must be between 1 and 100.'
      : '';
  }

  const featureNoteId = (): string => {
    const { id } = params;
    return id ? id || '' : null;
  };

  const navigateToFeatureNotes = (): void => {
    navigate && navigate('/general/feature-notes');
  }

  const onAction = (action: GRID_ACTIONS): void => {
    if (action === GRID_ACTIONS.CANCEL) {
      navigateToFeatureNotes();
      return;
    }
    updateFeatureNote();
  }

  const hasError = (): boolean => {
    return useUpsert.form.hasError || UIStore.pageLoading || Boolean(customErrorMessage);
  }

  const headerActions = (): ReactNode => {
    return (
      <EditSaveButtons
        hasEditPermission={true}
        isEditMode={true}
        onAction={action => onAction(action)}
      />
    );
  }

  const blobData = (): BlobModel[] => {
    return useUpsert.getField('blobUrls')?.values() || [];
  }

  const blobGrid = (): ReactNode => {
    const { featureNoteStore } = props;
    return (
      <FeatureNoteBlob
        featureNoteId={featureNoteId()}
        rowData={blobData()}
        featureNoteStore={featureNoteStore}
        onDataUpdate={(blobs: BlobModel[]) => useUpsert.getField('blobUrls').set(blobs)}
      />
    );
  }

  const onValueChange = (value: IOptionValue | IOptionValue[], fieldKey: string): void => {
    useUpsert.getField(fieldKey).set(value);
  };

  return (
    <DetailsEditorWrapper headerActions={headerActions()} isEditMode={useUpsert.isEditable}>
      <h2>Edit Feature Note</h2>
      <div className={classes.flexRow}>
        <div className={classes.flexWrap}>
          {groupInputControls().inputControls.map((inputControl: IViewInputControl, index: number) => {
            if (inputControl.fieldKey === 'blobUrls') {
              return (
                <div key={index} className={classes.blobGrid}>
                  {' '}
                  {blobGrid()}{' '}
                </div>
              );
            }
            return (
              <ViewInputControl
                {...inputControl}
                key={index}
                field={useUpsert.getField(inputControl.fieldKey || '')}
                isEditable={true}
                classes={{
                  flexRow: classNames({
                    [classes.inputControl]: true,
                    [classes.isFullFlex]: inputControl.isFullFlex,
                  }),
                }}
                onValueChange={(option: IOptionValue, _: string) =>
                  onValueChange(option, inputControl.fieldKey || '')
                }
              />
            );
          })}
        </div>
      </div>
    </DetailsEditorWrapper>
  );
}
export default inject('featureNoteStore')(observer(FeatureNoteEditor));