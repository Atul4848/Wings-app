import React, { FC, ReactNode, useEffect, useState } from 'react';
import { VIEW_MODE, useBaseUpsertComponent } from '@wings/shared';
import {
  GeneralInfoModel,
  HealthAuthModel,
  HealthAuthStore,
  SettingsStore,
  useRestrictionModuleSecurity,
} from '../../../Shared';
import { inject, observer } from 'mobx-react';
import { finalize, takeUntil } from 'rxjs/operators';
import { useParams, useNavigate } from 'react-router-dom';
import { fields } from './Fields';
import { observable } from 'mobx';
import { GeneralRequirement } from './Components';
import { useStyles } from './HealthAuthorizationGeneralInformation.style';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { AlertStore } from '@uvgo-shared/alert';
import { UIStore, ViewPermission, GRID_ACTIONS } from '@wings-shared/core';
import { EDITOR_TYPES, ViewExpandInput } from '@wings-shared/form-controls';
import { InfoPaneStore, DetailsEditorWrapper, ConfirmNavigate, DetailsEditorHeaderSection } from '@wings-shared/layout';
import { useConfirmDialog, useUnsubscribe } from '@wings-shared/hooks';

interface Props {
  healthAuthStore?: HealthAuthStore;
  settingsStore?: SettingsStore;
  openInfoPane?: () => void;
}

const HealthAuthorizationGeneralInformation: FC<Props> = ({ ...props }) => {
  const classes = useStyles();
  const params = useParams();
  const unsubscribe = useUnsubscribe();
  const navigate = useNavigate();
  const _useConfirmDialog = useConfirmDialog();
  const restrictionModuleSecurity = useRestrictionModuleSecurity();
  const useUpsert = useBaseUpsertComponent<HealthAuthModel>(params, fields);
  const _healthAuthStore = props.healthAuthStore as HealthAuthStore;
  const [ isRowEditing, setIsRowEditing ] = useState<boolean>(false);
  const _observable = observable({ healthAuthorization: new HealthAuthModel(_healthAuthStore.selectedHealthAuth) });

  /* istanbul ignore next */
  useEffect(() => {
    useUpsert.setFormValues(_observable.healthAuthorization);
  }, []);

  /* istanbul ignore next */
  const setToDetailMode = (): void => {
    useUpsert.setViewMode(VIEW_MODE.DETAILS);
    useUpsert.form.reset();
    useUpsert.setRichEditorFocused(false);
    useUpsert.setFormValues(_observable.healthAuthorization);
  };

  /* istanbul ignore next */
  const onCancel = (): void => {
    const viewMode = params?.viewMode?.toUpperCase();
    if (viewMode === VIEW_MODE.DETAILS) {
      if (useUpsert.form.touched || useUpsert.isRichEditorFocused) {
        _useConfirmDialog.confirmAction(
          () => {
            setToDetailMode(), ModalStore.close();
          },
          {
            onNo: () => ModalStore.close(),
            title: 'Confirm Cancellation',
            onClose: () => ModalStore.close(),
          }
        );
        return;
      }
      setToDetailMode();
      return;
    }
    navigate('/restrictions', useUpsert.noBlocker);
  };

  /* istanbul ignore next */
  const upsertGeneralInformation = (): void => {
    const { generalInformation } = _observable.healthAuthorization;
    const updatedHealthAuthorization = new HealthAuthModel({
      ..._observable.healthAuthorization,
      generalInformation: new GeneralInfoModel({
        ...generalInformation,
        ...useUpsert.form.values().generalInformation,
      }),
    });
    UIStore.setPageLoader(true);
    _healthAuthStore
      .upsertGeneralInformation(updatedHealthAuthorization)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: () => {
          _observable.healthAuthorization = new HealthAuthModel(_healthAuthStore.selectedHealthAuth);
          useUpsert.setRichEditorFocused(false);
          useUpsert.form.reset();
          useUpsert.setViewMode(VIEW_MODE.DETAILS);
          useUpsert.setFormValues(_observable.healthAuthorization);
          const { selectedGeneralInfoField } = _healthAuthStore;
          if (selectedGeneralInfoField?.key && InfoPaneStore.isOpen) {
            _healthAuthStore.setSelectedGeneralInfoField(
              useUpsert.getField(`generalInformation.${selectedGeneralInfoField.key}`)
            );
            props.openInfoPane && props.openInfoPane();
          }
        },
        error: error => AlertStore.critical(error.message),
      });
  };

  const onAction = (action: GRID_ACTIONS) => {
    switch (action) {
      case GRID_ACTIONS.EDIT:
        useUpsert.setViewMode(VIEW_MODE.EDIT);
        break;
      case GRID_ACTIONS.SAVE:
        upsertGeneralInformation();
        break;
      case GRID_ACTIONS.CANCEL:
        onCancel();
        break;
    }
  };

  const headerActions = (): ReactNode => {
    return (
      <DetailsEditorHeaderSection
        title={_observable.healthAuthorization.title}
        backNavLink="/restrictions"
        backNavTitle="Health Authorizations"
        disableActions={useUpsert.form.hasError || UIStore.pageLoading || isRowEditing}
        isEditMode={useUpsert.isEditable}
        hasEditPermission={restrictionModuleSecurity.isEditable}
        onAction={onAction}
        isRowEditing={isRowEditing}
      />
    );
  };

  return (
    <ConfirmNavigate isBlocker={useUpsert.form.touched || useUpsert.isRichEditorFocused}>
      <DetailsEditorWrapper
        headerActions={headerActions()}
        isEditMode={useUpsert.isEditable}
        classes={{ container: classes.editorWrapperContainer, headerActionsEditMode: classes.headerActionsEditMode }}
      >
        <ViewPermission hasPermission={useUpsert.expandMode}>
          <div className={classes.expandContentWrapper}>
            <ViewExpandInput
              isExpandMode={useUpsert.expandMode}
              isEditable={useUpsert.isEditable}
              expandModeField={useUpsert.expandModeField}
              onGetField={useUpsert.getField}
              onValueChange={useUpsert.onValueChange}
              onLabelClick={(label, fieldKey) => useUpsert.setExpandedMode(label, fieldKey, EDITOR_TYPES.TEXT_FIELD)}
              onFocus={fieldKey => useUpsert.setRichEditorFocused(true)}
            />
          </div>
        </ViewPermission>
        <ViewPermission hasPermission={!useUpsert.expandMode}>
          <GeneralRequirement
            getField={fieldKey => useUpsert.getField(fieldKey)}
            isEditable={useUpsert.isEditable}
            onChange={(value, fieldKey) => useUpsert.onValueChange(value, fieldKey)}
            setRules={(fieldKey, required, label) => {
              useUpsert.setFormRules(fieldKey, required, label);
              useUpsert.form.validate();
            }}
            clearFields={fields => useUpsert.clearFormFields(fields)}
            healthAuth={useUpsert.form.values()}
            onRowEdit={isRowEditing => {
              setIsRowEditing(isRowEditing);
            }}
            isRowEditing={isRowEditing}
          />
        </ViewPermission>
      </DetailsEditorWrapper>
    </ConfirmNavigate>
  );
};

export default inject('settingsStore', 'healthAuthStore')(observer(HealthAuthorizationGeneralInformation));
