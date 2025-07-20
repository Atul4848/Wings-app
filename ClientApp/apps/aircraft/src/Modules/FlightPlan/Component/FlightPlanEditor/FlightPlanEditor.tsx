import React, { FC, ReactNode, useEffect, useState } from 'react';
import { ModelStatusOptions, VIEW_MODE, useBaseUpsertComponent } from '@wings/shared';
import {
  EDITOR_TYPES,
  ViewInputControl,
  AuditFields,
  IViewInputControl,
  IGroupInputControls,
} from '@wings-shared/form-controls';
import {
  Utilities,
  DATE_FORMAT,
  UIStore,
  IAPIGridRequest,
  IOptionValue,
  ISelectOption,
  ViewPermission,
  SettingsTypeModel,
  GRID_ACTIONS,
  baseEntitySearchFilters,
} from '@wings-shared/core';
import { AuthStore } from '@wings-shared/security';
import { inject, observer } from 'mobx-react';
import { useNavigate, useParams } from 'react-router';
import {
  FlightPlanFormatAccountModel,
  FlightPlanFormatChangeRecordModel,
  FlightPlanFormatDocumentModel,
  FlightPlanModel,
  FlightPlanStore,
  SettingsStore,
  updateAircraftSidebarOptions,
  useAircraftModuleSecurity,
} from '../../../Shared';
import { fields } from './Fields';
import { ArrowBack } from '@material-ui/icons';
import { useStyles } from './FlightPlanEditor.style';
import { takeUntil, finalize } from 'rxjs/operators';
import { AlertStore } from '@uvgo-shared/alert';
import { AxiosError } from 'axios';
import {
  FlightPlanViewInputControls,
  FlightPlanFormatMasterDetails,
  FlightPlanChangeRecordGrid,
  FlightPlanDocumentGrid,
} from '../index';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import {
  CustomLinkButton,
  EditSaveButtons,
  DetailsEditorWrapper,
  Collapsable,
  SidebarStore,
} from '@wings-shared/layout';
import { useConfirmDialog, useUnsubscribe } from '@wings-shared/hooks';

interface Props {
  flightPlanStore?: FlightPlanStore;
  settingsStore?: SettingsStore;
  sidebarStore?: typeof SidebarStore;
}

const FlightPlanEditor: FC<Props> = ({ ...props }) => {
  const params = useParams();
  const classes = useStyles();
  const navigate = useNavigate();
  const unsubscribe = useUnsubscribe();
  const _useConfirmDialog = useConfirmDialog();
  const useUpsert = useBaseUpsertComponent<FlightPlanModel>(params, fields, baseEntitySearchFilters);
  const _flightPlanStore = props.flightPlanStore as FlightPlanStore;
  const _settingsStore = props.settingsStore as SettingsStore;
  const [ flightPlan, setFlightPlan ] = useState(new FlightPlanModel());
  const [ flightPlanDetails, setFlightPlanDetails ] = useState(new FlightPlanModel());
  const title = useUpsert.getField('format').value || 'Name';
  const [ editingGrids, setEditingGrids ] = useState<string[]>([]);
  const [ isDataUpdated, setDataUpdate ] = useState(false);
  const aircraftModuleSecurity = useAircraftModuleSecurity();

  useEffect(() => {
    props.sidebarStore?.setNavLinks(updateAircraftSidebarOptions('Flight Plan Format'), 'aircraft');
    useUpsert.setViewMode((params.mode?.toUpperCase() as VIEW_MODE) || VIEW_MODE.DETAILS);
    loadInitialData();
  }, []);

  /* istanbul ignore next */
  const loadInitialData = () => {
    if (!Number(params?.id)) {
      useUpsert.setFormValues(flightPlan);
      return;
    }
    const filterCollection = JSON.stringify([
      { propertyName: 'FlightPlanFormatId', propertyValue: Number(params?.id) || 0 },
    ]);
    const request: IAPIGridRequest = {
      pageNumber: 1,
      pageSize: 10,
      filterCollection,
    };
    UIStore.setPageLoader(true);
    _flightPlanStore
      .getFlightPlanById(request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(_flightPlan => {
        setFlightPlan(new FlightPlanModel(_flightPlan.results[0]));
        setFlightPlanDetails(new FlightPlanModel({ ..._flightPlan.results[0] }));
        setBuiltByValidationRules(_flightPlan.results[0].flightPlanFormatStatus);
        useUpsert.setFormValues(_flightPlan.results[0]);
      });
  };

  /* istanbul ignore next */
  const updateRowEditing = (isEditing: boolean, girdName: string): void => {
    const _editingGrids = editingGrids.filter(a => !Utilities.isEqual(a, girdName));
    if (isEditing) {
      _editingGrids.push(girdName);
    }
    setEditingGrids(_editingGrids);
  };

  const isFpfOpenButtonDisabled = (): boolean => {
    const fpfStatus = useUpsert.getField('flightPlanFormatStatus').value;
    return Utilities.isEqual(fpfStatus?.label, 'Open') || Number(params?.id) === 0 || useUpsert.isDetailView;
  };

  const groupInputControls = (): IGroupInputControls => {
    return {
      title: 'General',
      inputControls: [
        {
          fieldKey: 'format',
          type: EDITOR_TYPES.TEXT_FIELD,
          isDisabled: Boolean(Number(params?.id)),
        },
        {
          fieldKey: 'flightPlanFormatStatus',
          type: EDITOR_TYPES.DROPDOWN,
          options: _settingsStore.flightPlanFormatStatus,
        },
        {
          fieldKey: 'contactForChanges',
          type: EDITOR_TYPES.TEXT_FIELD,
        },
        {
          fieldKey: 'builtBy',
          type: EDITOR_TYPES.TEXT_FIELD,
        },
        {
          fieldKey: 'builtDate',
          type: EDITOR_TYPES.DATE,
          dateTimeFormat: DATE_FORMAT.DATE_PICKER_FORMAT,
        },
        {
          fieldKey: 'lastUsedDate',
          type: EDITOR_TYPES.DATE,
          dateTimeFormat: DATE_FORMAT.DATE_PICKER_FORMAT,
        },
        {
          fieldKey: 'accessLevel',
          type: EDITOR_TYPES.DROPDOWN,
          options: _settingsStore.accessLevels,
        },
        {
          fieldKey: 'includeEscapeRoutes',
          type: EDITOR_TYPES.SELECT_CONTROL,
          isBoolean: true,
          excludeEmptyOption: true,
          containerClass: classes?.containerClass,
        },
        {
          fieldKey: 'notes',
          type: EDITOR_TYPES.TEXT_FIELD,
          multiline: true,
          rows: 4,
          isFullFlex: true,
        },
      ],
    };
  };

  const systemInputControls = (): IViewInputControl[] => {
    return [
      {
        fieldKey: 'sourceType',
        type: EDITOR_TYPES.DROPDOWN,
        options: _settingsStore.sourceTypes,
      },
      {
        fieldKey: 'status',
        type: EDITOR_TYPES.DROPDOWN,
        options: ModelStatusOptions,
      },
    ];
  };

  const isAlreadyExists = (flightPlan: FlightPlanModel): boolean => {
    return _flightPlanStore.flightPlans.some(
      x => Utilities.isEqual(x.format, flightPlan.format) && !Utilities.isEqual(x.id, flightPlan.id)
    );
  };

  const upsertFlightPlan = (redirect: boolean = true): void => {
    const model = getUpdatedModel();
    if (isAlreadyExists(model)) {
      useUpsert.showAlert('Format should be unique', 'flightPlanAlert');
      return;
    }
    UIStore.setPageLoader(true);
    _flightPlanStore
      .upsertFlightPlan(model)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: () => {
          if (redirect) {
            navigate('/aircraft');
            return;
          }
          useUpsert.setViewMode(VIEW_MODE.DETAILS);
        },
        error: (error: AxiosError) => AlertStore.critical(error.message),
      });
  };

  /* istanbul ignore next */
  const getUpdatedModel = (): FlightPlanModel => {
    const {
      flightPlanFormatDocuments,
      flightPlanFormatChangeRecords,
      flightPlanFormatAccounts,
      ...rest
    } = useUpsert.form.values();
    return new FlightPlanModel({
      ...rest,
      id: Number(params?.id) || 0,
      flightPlanFormatDocuments: flightPlanFormatDocuments.map(({ id, ...rest }) => {
        return new FlightPlanFormatDocumentModel({ id: Math.floor(id), ...rest });
      }),
      flightPlanFormatChangeRecords: flightPlanFormatChangeRecords.map(({ id, ...rest }) => {
        return new FlightPlanFormatChangeRecordModel({ id: Math.floor(id), ...rest });
      }),
      flightPlanFormatAccounts: flightPlanFormatAccounts.map(({ id, ...rest }) => {
        return new FlightPlanFormatAccountModel({ id: Math.floor(id), ...rest });
      }),
    });
  };

  const onCancel = (model: FlightPlanModel): void => {
    const viewMode = params.mode?.toUpperCase();
    if (viewMode === VIEW_MODE.DETAILS) {
      useUpsert.setViewMode(VIEW_MODE.DETAILS);
      useUpsert.setFormValues(model);
      setFlightPlan(new FlightPlanModel({ ...model }));
      return;
    }
    navigate('/aircraft');
  };

  const onValueChange = (value: IOptionValue | IOptionValue[], fieldKey: string): void => {
    if (Utilities.isEqual(fieldKey, 'format') && useUpsert.isAddNew) {
      setFlightPlan(new FlightPlanModel({ ...flightPlan, format: value as string }));
    }
    if (Utilities.isEqual(fieldKey, 'flightPlanFormatStatus')) {
      setBuiltByValidationRules(value as ISelectOption);
    }
    useUpsert.getField(fieldKey).set(value);
  };

  const onFocus = (fieldKey: string): void => {
    switch (fieldKey) {
      case 'flightPlanFormatStatus':
        useUpsert.observeSearch(_settingsStore.getFlightPlanFormatStatus());
        break;
      case 'accessLevel':
        useUpsert.observeSearch(_settingsStore.getAccessLevels());
        break;
      case 'sourceType':
        useUpsert.observeSearch(_settingsStore.getSourceTypes());
        break;
    }
  };

  const setBuiltByValidationRules = (option: ISelectOption): void => {
    const isRequired: boolean = Utilities.isEqual(option?.label, 'Assigned');
    useUpsert.setFormRules('builtBy', isRequired, 'Built By');
  };

  const disableAction = () => {
    if (Boolean(editingGrids.length)) {
      return true;
    }
    if (isDataUpdated) {
      return useUpsert.form.hasError || UIStore.pageLoading;
    }
    return useUpsert.isActionDisabled;
  };

  const headerActions = (): ReactNode => {
    return (
      <>
        <ViewPermission hasPermission={!useUpsert.isEditable}>
          <CustomLinkButton to="/aircraft" title="Flight Plan" startIcon={<ArrowBack />} />
        </ViewPermission>
        <EditSaveButtons
          disabled={disableAction()}
          hasEditPermission={aircraftModuleSecurity.isEditable}
          isEditing={Boolean(editingGrids.length)}
          isEditMode={useUpsert.isEditable}
          onAction={onAction}
        />
      </>
    );
  };

  const getConfirmation = (): void => {
    _useConfirmDialog.confirmAction(
      () => {
        ModalStore.close();
        setFlightPlanValues();
      },
      {
        title: 'Confirm Changes',
        message: `Do you want to set the status of format ${flightPlan.format} to Open?`,
      }
    );
  };

  /* istanbul ignore next */
  const setFlightPlanValues = (): void => {
    const flightPlanFormatStatus = new SettingsTypeModel({ id: 2, name: 'Open' });
    const changeRecord = new FlightPlanFormatChangeRecordModel({
      requestedBy: 'Internal',
      changedBy: AuthStore.user?.name,
      notes: 'Set to Open',
      changedDate: Utilities.getCurrentDate,
    });
    updateFlightPlanAccounts([]);
    updateFlightPlanChangeRecords([ ...flightPlan?.flightPlanFormatChangeRecords, ...[ changeRecord ] ]);
    const _flightPlan = new FlightPlanModel({
      ...useUpsert.form.values(),
      contactForChanges: '',
      builtBy: '',
      builtDate: '',
      notes: '',
      lastUsedDate: '',
      flightPlanFormatStatus,
    });
    setBuiltByValidationRules(flightPlanFormatStatus);
    useUpsert.setFormValues(_flightPlan);
    setFlightPlanDetails(new FlightPlanModel({ ...getUpdatedModel() }));
    upsertFlightPlan(false);
  };

  const onAction = (action: GRID_ACTIONS): void => {
    switch (action) {
      case GRID_ACTIONS.EDIT:
        useUpsert.setViewMode(VIEW_MODE.EDIT);
        break;
      case GRID_ACTIONS.SAVE:
        upsertFlightPlan();
        break;
      case GRID_ACTIONS.CANCEL:
        onCancel(flightPlanDetails);
        break;
    }
  };

  /* istanbul ignore next */
  const updateFlightPlanAccounts = (accounts: FlightPlanFormatAccountModel[]): void => {
    const _flightPlan = new FlightPlanModel({
      ...useUpsert.form.values(),
      id: Number(params?.id),
      flightPlanFormatAccounts: accounts,
    });
    useUpsert.setFormValues(_flightPlan);
    setFlightPlan(_flightPlan);
    setDataUpdate(true);
  };

  /* istanbul ignore next */
  const updateFlightPlanChangeRecords = (changeRecords: FlightPlanFormatChangeRecordModel[]): void => {
    const _flightPlan = new FlightPlanModel({
      ...useUpsert.form.values(),
      id: Number(params?.id),
      flightPlanFormatChangeRecords: changeRecords,
    });
    useUpsert.setFormValues(_flightPlan);
    setFlightPlan(_flightPlan);
    setDataUpdate(true);
  };

  const updateFlightPlanDocuments = (documents: FlightPlanFormatDocumentModel[]): void => {
    const _flightPlan = new FlightPlanModel({
      ...useUpsert.form.values(),
      id: Number(params?.id),
      flightPlanFormatDocuments: documents,
    });
    useUpsert.setFormValues(_flightPlan);
    setFlightPlan(_flightPlan);
    setDataUpdate(true);
  };

  const flightPlanChildGrid = (): ReactNode => {
    const {
      flightPlanFormatAccounts,
      flightPlanFormatChangeRecords,
      flightPlanFormatDocuments,
    } = useUpsert.form.values();
    return (
      <>
        <FlightPlanFormatMasterDetails
          key={`accounts-${useUpsert.isEditable}`}
          isEditable={useUpsert.isEditable}
          flightPlanFormatAccounts={flightPlanFormatAccounts}
          onDataSave={updateFlightPlanAccounts}
          onRowEditing={isEditing => updateRowEditing(isEditing, 'flightPlanFormatAccounts')}
        />
        <FlightPlanChangeRecordGrid
          key={`change-records-${useUpsert.isEditable}`}
          isEditable={useUpsert.isEditable}
          flightPlanFormatChangeRecords={flightPlanFormatChangeRecords}
          onDataSave={updateFlightPlanChangeRecords}
          onRowEditing={isEditing => updateRowEditing(isEditing, 'flightPlanFormatChangeRecords')}
        />
        <FlightPlanDocumentGrid
          key={`documents-${useUpsert.isEditable}`}
          isEditable={useUpsert.isEditable}
          flightPlanFormatDocuments={flightPlanFormatDocuments}
          onDataSave={updateFlightPlanDocuments}
          onRowEditing={isEditing => updateRowEditing(isEditing, 'flightPlanFormatDocuments')}
        />
      </>
    );
  };

  const systemDataFields = (): ReactNode => {
    return (
      <Collapsable title="System">
        <>
          <div className={classes.flexWrap}>
            {systemInputControls()
              .filter(inputControl => !inputControl.isHidden)
              .map((inputControl: IViewInputControl, index: number) => (
                <ViewInputControl
                  {...inputControl}
                  key={index}
                  field={useUpsert.getField(inputControl.fieldKey || '')}
                  isEditable={useUpsert.isEditable}
                  onValueChange={(option, _) => onValueChange(option, inputControl.fieldKey || '')}
                  onFocus={onFocus}
                />
              ))}
          </div>
          <AuditFields
            isEditable={useUpsert.isEditable}
            fieldControls={useUpsert.auditFields}
            onGetField={useUpsert.getField}
            isNew={useUpsert.isAddNew}
          />
        </>
      </Collapsable>
    );
  };

  return (
    <DetailsEditorWrapper headerActions={headerActions()} isEditMode={useUpsert.isEditable}>
      <div className={classes.flexRow}>
        <FlightPlanViewInputControls
          title={title}
          isEditable={useUpsert.isEditable}
          groupInputControls={groupInputControls()}
          onGetField={useUpsert.getField}
          onValueChange={onValueChange}
          onButtonClick={getConfirmation}
          isFpfOpenButtonDisabled={isFpfOpenButtonDisabled()}
          onFocus={onFocus}
        />
        {flightPlanChildGrid()}
        {systemDataFields()}
      </div>
    </DetailsEditorWrapper>
  );
};

export default inject('flightPlanStore', 'settingsStore', 'sidebarStore')(observer(FlightPlanEditor));
