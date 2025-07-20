import { GRID_ACTIONS, IOptionValue, UIStore, Utilities, baseEntitySearchFilters } from '@wings-shared/core';
import { AuditFields, EDITOR_TYPES, ViewInputControlsGroup, IGroupInputControls } from '@wings-shared/form-controls';
import { ConfirmNavigate, DetailsEditorHeaderSection, DetailsEditorWrapper } from '@wings-shared/layout';
import { ModelStatusOptions, useBaseUpsertComponent, VIEW_MODE } from '@wings/shared';
import { inject, observer } from 'mobx-react';
import React, { FC, ReactNode, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fields } from './fields';
import { useStyles } from './RegistryGeneralInformation.style';
import { RegistryStore, RegistryModel, SettingsStore, useCustomerModuleSecurity } from '../../../Shared';
import { finalize, takeUntil } from 'rxjs/operators';
import { useUnsubscribe } from '@wings-shared/hooks';

interface Props {
  registryStore?: RegistryStore;
  settingsStore?: SettingsStore;
  title?: string;
}

const RegistryGeneralInformation: FC<Props> = ({ registryStore, settingsStore, title }: Props) => {
  const params = useParams();
  const useUpsert = useBaseUpsertComponent<RegistryModel>(params, fields, baseEntitySearchFilters);
  const classes = useStyles();
  const navigate = useNavigate();
  const unsubscribe = useUnsubscribe();
  const _registryStore = registryStore as RegistryStore;
  const _settingsStore = settingsStore as SettingsStore;
  const customerModuleSecurity = useCustomerModuleSecurity();
  /* istanbul ignore next */
  useEffect(() => {
    loadRegistry();
  }, []);

  /* istanbul ignore next */
  const loadRegistry = (): void => {
    if (!params.registryId) {
      return;
    }
    useUpsert.setFormValues(_registryStore.selectedRegistry);
  };

  /* istanbul ignore next */
  const onValueChange = (value: IOptionValue, fieldKey: string): void => {
    useUpsert.getField(fieldKey).set(value);
  };

  /* istanbul ignore next */
  const onFocus = (fieldKey: string): void => {
    switch (fieldKey) {
      case 'sourceType':
        useUpsert.observeSearch(_settingsStore.getSourceTypes());
        break;
      case 'accessLevel':
        useUpsert.observeSearch(_settingsStore.getAccessLevels());
        break;
    }
  };

  const groupInputControls = (): IGroupInputControls[] => {
    return [
      {
        title: '',
        inputControls: [
          {
            fieldKey: 'name',
            type: EDITOR_TYPES.TEXT_FIELD,
            isDisabled: !useUpsert.isAddNew,
          },
          {
            fieldKey: 'sourceType',
            type: EDITOR_TYPES.DROPDOWN,
            options: _settingsStore.sourceTypes,
          },
          {
            fieldKey: 'accessLevel',
            type: EDITOR_TYPES.DROPDOWN,
            options: _settingsStore.accessLevels,
          },
          {
            fieldKey: 'status',
            type: EDITOR_TYPES.DROPDOWN,
            options: ModelStatusOptions,
          },
        ],
      },
    ];
  };

  /* istanbul ignore next */
  const upsertRegistry = (): void => {
    const request = new RegistryModel({
      ..._registryStore.selectedRegistry,
      ...useUpsert.form.values(),
    });
    UIStore.setPageLoader(true);
    _registryStore
      .upsertRegistry(request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: RegistryModel) => {
          useUpsert.form.reset();
          _registryStore.selectedRegistry = response;
          useUpsert.setFormValues(response);
          if (Utilities.isEqual(params.viewMode || '', VIEW_MODE.DETAILS)) {
            useUpsert.setViewMode(VIEW_MODE.DETAILS);
          }
          if (!request?.id) {
            navigate(`/customer/registry/${response.id}/edit`, useUpsert.noBlocker);
          }
        },
        error: error => {
          useUpsert.showAlert(error.message, 'upsertRegistry');
        },
        complete: () => UIStore.setPageLoader(false),
      });
  };

  const onAction = (action: GRID_ACTIONS): void => {
    switch (action) {
      case GRID_ACTIONS.SAVE:
        upsertRegistry();
        break;
      case GRID_ACTIONS.EDIT:
        useUpsert.setViewMode(VIEW_MODE.EDIT);
        break;
      case GRID_ACTIONS.CANCEL:
      default:
        if (Utilities.isEqual(params.viewMode || '', VIEW_MODE.DETAILS)) {
          useUpsert.form.reset();
          useUpsert.setFormValues(_registryStore.selectedRegistry);
          useUpsert.setViewMode(VIEW_MODE.DETAILS);
          return;
        }
        navigate('/customer/registry');
        break;
    }
  };

  const headerActions = (): ReactNode => {
    return (
      <DetailsEditorHeaderSection
        title={title}
        backNavTitle="Registry"
        disableActions={useUpsert.isActionDisabled}
        backNavLink="/customer/registry"
        isEditMode={useUpsert.isEditable}
        onAction={action => onAction(action)}
      />
    );
  };

  return (
    <ConfirmNavigate isBlocker={useUpsert.form.touched || useUpsert.form.changed}>
      <DetailsEditorWrapper
        headerActions={headerActions()}
        isEditMode={useUpsert.isEditable}
        classes={{ container: classes.editorWrapperContainer, headerActionsEditMode: classes.headerActionsEditMode }}
      >
        <ViewInputControlsGroup
          groupInputControls={groupInputControls()}
          field={useUpsert.getField}
          isEditing={useUpsert.isEditable && customerModuleSecurity.isEditable}
          isLoading={useUpsert.loader.isLoading}
          onValueChange={onValueChange}
          onFocus={onFocus}
        />
        <AuditFields
          isNew={useUpsert.isAddNew}
          isEditable={useUpsert.isEditable && customerModuleSecurity.isEditable}
          fieldControls={useUpsert.auditFields}
          onGetField={useUpsert.getField}
        />
      </DetailsEditorWrapper>
    </ConfirmNavigate>
  );
};

export default inject('registryStore', 'settingsStore')(observer(RegistryGeneralInformation));
