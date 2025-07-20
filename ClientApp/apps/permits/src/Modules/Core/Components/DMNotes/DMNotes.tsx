import React, { FC, ReactNode, useEffect, useState } from 'react';
import { finalize, takeUntil } from 'rxjs/operators';
import { inject, observer } from 'mobx-react';
import { DMNoteModel, PermitSettingsStore, PermitStore, usePermitModuleSecurity } from '../../../Shared';
import { PermitEditorActions } from '../../Components';
import { IOptionValue, UIStore, baseEntitySearchFilters } from '@wings-shared/core';
import { ConfirmNavigate, DetailsEditorWrapper, SidebarStore } from '@wings-shared/layout';
import { useConfirmDialog, useUnsubscribe } from '@wings-shared/hooks';
import { fields } from './Fields';
import { EDITOR_TYPES, ViewInputControl } from '@wings-shared/form-controls';
import { VIEW_MODE, useBaseUpsertComponent } from '@wings/shared';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { useNavigate, useParams } from 'react-router';
import { Logger } from '@wings-shared/security';
import { AxiosError } from 'axios';
import { AlertStore } from '@uvgo-shared/alert';
import { useStyles } from './DMNotes.styles';

interface Props {
  sidebarStore?: typeof SidebarStore;
  permitStore?: PermitStore;
  permitSettingsStore?: PermitSettingsStore;
}
const DMNotes: FC<Props> = ({ ...props }) => {
  const [ dmNote, setDMNote ] = useState<DMNoteModel>(new DMNoteModel());
  const unsubscribe = useUnsubscribe();
  const params = useParams();
  const classes = useStyles();
  const _useConfirmDialog = useConfirmDialog();
  const navigate = useNavigate();
  const _permitStore = props.permitStore as PermitStore;
  const useUpsert = useBaseUpsertComponent<any>(params, fields, baseEntitySearchFilters);
  const permitModuleSecurity = usePermitModuleSecurity();

  useEffect(() => {
    useUpsert.setViewMode((params.viewMode?.toUpperCase() as VIEW_MODE) || VIEW_MODE.DETAILS);
    loadInitialData();
  }, []);

  const loadInitialData = () => {
    const permitId = params?.permitId;
    UIStore.setPageLoader(true);
    _permitStore
      ?.loadPermitDMNote(Number(permitId))
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )

      .subscribe({
        next: response => {
          setDMNote(response);
          useUpsert.setFormValues(response);
        },
        error: (error: AxiosError) => console.log('error', error.code),
      });
  };

  /* istanbul ignore next */
  const upsertData = () => {
    const permitId = Number(params?.permitId);
    const value = useUpsert.form.values();
    const request = new DMNoteModel({
      id: dmNote.id || 0,
      dmNote: value.dmNote,
      permitId: permitId,
    });

    UIStore.setPageLoader(true);
    _permitStore
      .upsertPermitDMNote(Number(permitId), request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: DMNoteModel) => {
          setDMNote(response);
          useUpsert.form.reset();
          useUpsert.setFormValues(response);
        },
        error: (error: AxiosError) => {
          AlertStore.critical(error.message);
          Logger.error(error.message);
        },
      });
  };

  const permitTitle = (): string => {
    return props.permitStore?.permitDataModel.permitTitle || '';
  };

  const onCancel = (): void => {
    const viewMode = params?.viewMode?.toUpperCase();
    if (viewMode === VIEW_MODE.DETAILS) {
      return _useConfirmDialog.confirmAction(() => {
        ModalStore.close(), navigate('/permits');
      }, {});
    }
    navigate('/permits');
    return;
  };

  const headerActions = (): ReactNode => {
    return (
      <PermitEditorActions
        hasError={UIStore.pageLoading || useUpsert.form.hasError || !useUpsert.form.changed}
        isDetailsView={useUpsert.isDetailView}
        onCancelClick={onCancel}
        onUpsert={upsertData}
        onSetViewMode={(mode: VIEW_MODE) => useUpsert.setViewMode(mode)}
        hideSaveButton={!permitModuleSecurity.isEditable}
        title={permitTitle()}
      />
    );
  };

  return (
    <ConfirmNavigate isBlocker={useUpsert.form.touched}>
      <DetailsEditorWrapper headerActions={headerActions()} isEditMode={!useUpsert.isDetailView}>
        <ViewInputControl
          isEditable={useUpsert.isEditable || !useUpsert.isDetailView}
          type={EDITOR_TYPES.TEXT_FIELD}
          field={useUpsert.getField('dmNote')}
          multiline={true}
          rows={5}
          classes={{ flexRow: classes.flexRow }}
          onValueChange={(option: IOptionValue, fieldKey: string) => useUpsert.onValueChange(option, fieldKey)}
        />
      </DetailsEditorWrapper>
    </ConfirmNavigate>
  );
};

export default inject('permitSettingsStore', 'permitStore')(observer(DMNotes));
