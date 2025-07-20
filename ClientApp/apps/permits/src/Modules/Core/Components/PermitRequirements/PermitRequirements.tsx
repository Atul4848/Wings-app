import React, { FC, ReactNode, useEffect, useState } from 'react';
import { forkJoin } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { inject, observer } from 'mobx-react';
import { PermitDocumentModel, PermitModel } from '../../../Shared';
import { PermitEditorActions, PermitUpsert } from '../../Components';
import { EntityMapModel, UIStore } from '@wings-shared/core';
import { Collapsable, ConfirmNavigate, DetailsEditorWrapper } from '@wings-shared/layout';
import { useConfirmDialog, useUnsubscribe } from '@wings-shared/hooks';
import { BaseProps } from '../PermitUpsert/PermitUpsert';
import { fields } from './Fields';
import { EDITOR_TYPES, ViewInputControl } from '@wings-shared/form-controls';
import { VIEW_MODE } from '@wings/shared';
import PermitDocument from './PermitDocument';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { useStyles } from '../PermitUpsert/PermitUpsert.styles';

type Props = BaseProps;

const PermitRequirements: FC<Props> = ({ ...props }) => {
  const [ isRowEditing, setIsRowEditing ] = useState(false);
  const unsubscribe = useUnsubscribe();
  const {
    _permitSettingsStore,
    _permitStore,
    isDataChanged,
    useUpsert,
    permitModel,
    navigateToPermits,
    setPermitModel,
    params,
    onUpsertAction,
    hasError,
  } = PermitUpsert({ ...props, fields });
  const _useConfirmDialog = useConfirmDialog();
  const [ isDataSave, setIsDataSave ] = useState(false);
  const classes = useStyles();

  /* istanbul ignore next */
  useEffect(() => {
    useUpsert.setViewMode((params.viewMode?.toUpperCase() as VIEW_MODE) || VIEW_MODE.DETAILS);
    loadInitialData();
  }, []);

  /* istanbul ignore next */
  const loadInitialData = () => {
    forkJoin([
      _permitSettingsStore?.getDocuments(),
      _permitSettingsStore?.getFARTypes(),
      _permitSettingsStore?.getElements(),
    ])
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe();
    useUpsert.setFormValues(_permitStore?.permitDataModel as PermitModel);
  };
  const permitTitle = (): string => {
    return _permitStore?.permitDataModel?.permitTitle;
  };

  const upsertData = () => {
    const formData = useUpsert.form.values();
    // Update permitModel with new values
    const permitRouteAirway = new PermitModel({
      ..._permitStore?.permitDataModel,
      ...permitModel,
      ...formData,
    });
    useUpsert.setFormValues(permitRouteAirway);
    setPermitModel(permitRouteAirway);
    onUpsertAction(permitRouteAirway);
  };

  const updateDocuments = (permitDocuments: PermitDocumentModel[]): void => {
    setPermitModel(
      new PermitModel({
        ..._permitStore?.permitDataModel,
        permitDocuments: permitDocuments.map(({ id, ...rest }) => {
          return new PermitDocumentModel({ id: Math.floor(id), ...rest });
        }),
      })
    );
    setIsDataSave(true);
  };

  const updateRowEditing = (isEditing: boolean): void => {
    setIsRowEditing(isEditing);
  };

  const hasGeneralError = (): boolean => {
    if (isDataSave) {
      return isRowEditing;
    }
    return hasError || isRowEditing;
  };

  /* istanbul ignore next */
  const setInitialData = (): void => {
    useUpsert.setViewMode(VIEW_MODE.DETAILS);
    updateRowEditing(false);
    useUpsert.form.reset();
    useUpsert.setFormValues(_permitStore.permitDataModel);
    setPermitModel(
      new PermitModel({
        ..._permitStore.permitDataModel,
      })
    );
    return;
  };

  /* istanbul ignore next */
  const onCancel = (): void => {
    const viewMode = params.viewMode?.toUpperCase();
    if (viewMode === VIEW_MODE.DETAILS) {
      if (useUpsert.form.touched || isDataChanged) {
        return _useConfirmDialog.confirmAction(
          () => {
            setInitialData(), ModalStore.close();
          },
          {
            title: 'Confirm Cancellation',
            message: 'Leaving Edit Mode will cause your changes to be lost. Are you sure you want to exit Edit Mode?',
          }
        );
      }
      setInitialData();
      return;
    }
    navigateToPermits();
  };

  const headerActions = (): ReactNode => {
    return (
      <PermitEditorActions
        hasError={hasGeneralError() || UIStore.pageLoading || isRowEditing}
        isDetailsView={useUpsert.isDetailView}
        onCancelClick={() => onCancel()}
        onUpsert={() => upsertData()}
        onSetViewMode={(mode: VIEW_MODE) => useUpsert.setViewMode(mode)}
        isRowEditing={isRowEditing}
        title={permitTitle()}
      />
    );
  };

  const elements = (): EntityMapModel[] => {
    return _permitSettingsStore?.elements.map(
      x => new EntityMapModel({ name: x.name, entityId: x.id })
    ) as EntityMapModel[];
  };

  return (
    <ConfirmNavigate isBlocker={isDataChanged}>
      <DetailsEditorWrapper
        headerActions={headerActions()}
        isEditMode={!useUpsert.isDetailView}
        classes={{ container: classes.editorWrapperContainer, headerActionsEditMode: classes.headerActionsEditMode }}
      >
        <Collapsable title="Elements">
          <ViewInputControl
            isEditable={useUpsert.isEditable || !useUpsert.isDetailView}
            type={EDITOR_TYPES.DROPDOWN}
            multiple={true}
            options={elements()}
            field={useUpsert.getField('permitRequiredElements')}
            onValueChange={(option, fieldKey) => useUpsert.onValueChange(option, fieldKey)}
          />
        </Collapsable>
        <PermitDocument
          isEditable={useUpsert.isEditable || !useUpsert.isDetailView}
          permitDocuments={permitModel.permitDocuments}
          onDataSave={permitDocument => updateDocuments(permitDocument)}
          onRowEditing={isEditing => updateRowEditing(isEditing)}
        />
      </DetailsEditorWrapper>
    </ConfirmNavigate>
  );
};

export default inject('permitSettingsStore', 'permitStore')(observer(PermitRequirements));
