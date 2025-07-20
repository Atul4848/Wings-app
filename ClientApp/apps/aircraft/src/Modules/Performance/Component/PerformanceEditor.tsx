import React, { FC, ReactNode, useEffect, useState } from 'react';
import { VIEW_MODE, ModelStatusOptions, useBaseUpsertComponent } from '@wings/shared';
import {
  AuditFields,
  EDITOR_TYPES,
  ViewInputControl,
  IViewInputControl,
  IGroupInputControls,
} from '@wings-shared/form-controls';
import { inject, observer } from 'mobx-react';
import { fields } from './Fields';
import { useStyles } from './PerformanceEditor.styles';
import classNames from 'classnames';
import { finalize, takeUntil } from 'rxjs/operators';
import { useNavigate, useParams } from 'react-router';
import { ArrowBack } from '@material-ui/icons';
import { forkJoin, Observable, of } from 'rxjs';
import GenericRegistryGrid from './GenericRegistryGrid/GenericRegistryGrid';
import { AlertStore } from '@uvgo-shared/alert';
import {
  CruisePolicyScheduleModel,
  PerformanceLinkModel,
  PerformanceModel,
  PerformanceStore,
  PolicyScheduleModel,
  SettingsProfileModel,
  SettingsStore,
  SpeedScheduleSettingsStore,
  updateAircraftSidebarOptions,
  useAircraftModuleSecurity,
} from '../../Shared';
import {
  IAPIGridRequest,
  IOptionValue,
  UIStore,
  Utilities,
  ViewPermission,
  SettingsTypeModel,
  GRID_ACTIONS,
  baseEntitySearchFilters,
} from '@wings-shared/core';
import {
  CustomLinkButton,
  EditSaveButtons,
  DetailsEditorWrapper,
  Collapsable,
  SidebarStore,
} from '@wings-shared/layout';
import { useUnsubscribe } from '@wings-shared/hooks';
import ScheduleGrid from './ScheduleGrid/SchedulerGrid';
import PerformanceLinkGrid from './PerformanceLinkGrid/PerformanceLinkGrid';
import CruiseScheduleGrid from './CruiseScheduleGrid/CruiseScheduleGrid';

interface Props {
  performanceStore?: PerformanceStore;
  settingsStore?: SettingsStore;
  speedScheduleSettingsStore?: SpeedScheduleSettingsStore;
  sidebarStore?: typeof SidebarStore;
}

const PerformanceEditor: FC<Props> = ({
  performanceStore,
  settingsStore,
  speedScheduleSettingsStore,
  sidebarStore,
}) => {
  const classes = useStyles();
  const navigate = useNavigate();
  const params = useParams();
  const unsubscribe = useUnsubscribe();
  const alertId: string = 'PerformanceEditorAlert';
  const useUpsert = useBaseUpsertComponent<PerformanceModel>(params, fields, baseEntitySearchFilters);
  const _performanceStore = performanceStore as PerformanceStore;
  const _settingsStore = settingsStore as SettingsStore;
  const _speedScheduleSettingsStore = speedScheduleSettingsStore as SpeedScheduleSettingsStore;
  const _sidebarStore = sidebarStore as typeof SidebarStore;
  const [ editingGrid, setEditingGrid ] = useState<string[]>([]);
  const [ performanceData, setPerformanceData ] = useState(new PerformanceModel());
  const [ previousData, setPreviousData ] = useState(new PerformanceModel());
  const [ isDataUpdated, setDataUpdate ] = useState(false);
  const aircraftModuleSecurity = useAircraftModuleSecurity();

  useEffect(() => {
    useUpsert.setViewMode((params.mode?.toUpperCase() as VIEW_MODE) || VIEW_MODE.DETAILS);
    _sidebarStore?.setNavLinks(updateAircraftSidebarOptions('Performance'), 'aircraft');
    loadInitialData();
  }, []);

  const updateRowEditing = (isEditing: boolean, girdName: string): void => {
    const _editingGrids = editingGrid.filter(a => !Utilities.isEqual(a, girdName));
    if (isEditing) {
      editingGrid.push(girdName);
      return;
    }
    setEditingGrid(_editingGrids);
  };

  const performanceId = (): number => {
    return Number(params?.id);
  };

  const loadInitialData = () => {
    UIStore.setPageLoader(true);
    forkJoin([ loadPerformanceById(), _performanceStore.getPerformances(), loadScheduleData(), loadBaseData() ])
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(([ performance ]) => {
        if (!performanceId()) {
          useUpsert.setFormValues(performanceData);
          return;
        }
        setPerformanceData(performance);
        setPreviousData(performance);
        useUpsert.setFormValues(performance);
      });
  };

  const loadPerformanceById = (): Observable<PerformanceModel> => {
    if (!performanceId()) {
      return of(new PerformanceModel());
    }
    const request: IAPIGridRequest = {
      filterCollection: JSON.stringify([ Utilities.getFilter('PerformanceId', performanceId()) ]),
    };
    return _performanceStore.getPerformanceById(request);
  };

  const loadScheduleData = (): Observable<[
    SettingsProfileModel[],
    SettingsProfileModel[],
    SettingsProfileModel[],
    SettingsProfileModel[]
  ]> => {
    return forkJoin([
      _speedScheduleSettingsStore.getClimbSchedules(),
      _speedScheduleSettingsStore.getHoldSchedules(),
      _speedScheduleSettingsStore.getCruiseSchedules(),
      _speedScheduleSettingsStore.getDescentSchedules(),
    ]);
  };

  const loadBaseData = (): Observable<[
    SettingsTypeModel[],
    SettingsTypeModel[],
    SettingsTypeModel[],
    SettingsTypeModel[]
  ]> => {
    return forkJoin([
      _settingsStore.getSourceTypes(),
      _settingsStore.getAccessLevels(),
      _settingsStore.getWakeTurbulenceCategories(),
      _settingsStore.getICAOTypeDesignators(),
    ]);
  };

  const isScheduleValid = (schedules: PolicyScheduleModel[]): boolean => {
    return schedules.length ? schedules.some(a => a.isDefault) : true;
  };

  /* istanbul ignore next */
  const isValidData = (performanceData: PerformanceModel): boolean => {
    const { performances } = _performanceStore;
    const { climbSchedules, cruiseSchedules, descentSchedules, holdSchedules } = performanceData;
    const isDuplicate = performances.some(
      x => Utilities.isEqual(x.name, performanceData.name) && !Utilities.isEqual(x.id, performanceData.id)
    );
    if (isDuplicate) {
      useUpsert.showAlert('Name should be unique.', alertId);
      return false;
    }
    if (!isScheduleValid(climbSchedules)) {
      useUpsert.showAlert('Climb Schedule should have default schedule', alertId);
      return false;
    }
    if (!isScheduleValid(cruiseSchedules)) {
      useUpsert.showAlert('Cruise Schedule should have default schedule', alertId);
      return false;
    }
    if (!isScheduleValid(descentSchedules)) {
      useUpsert.showAlert('Descent Schedule should have default schedule', alertId);
      return false;
    }
    if (!isScheduleValid(holdSchedules)) {
      useUpsert.showAlert('Hold Schedule should have default schedule', alertId);
      return false;
    }
    return true;
  };

  /* istanbul ignore next */
  const upsertPerformance = (): void => {
    const performanceData: PerformanceModel = getUpdatedModel();
    if (!isValidData(performanceData)) {
      return;
    }
    UIStore.setPageLoader(true);
    _performanceStore
      .upsertPerformance(performanceData)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: () => {
          useUpsert.setRichEditorFocused(false);
          useUpsert.form.reset();
          navigateToPerformance();
        },
        error: error => AlertStore.critical(error.message),
      });
  };

  const onCancel = (model: PerformanceModel): void => {
    const viewMode = params.mode?.toUpperCase();
    if (viewMode === VIEW_MODE.DETAILS) {
      useUpsert.setViewMode(VIEW_MODE.DETAILS);
      useUpsert.setFormValues(previousData);
      setPerformanceData(new PerformanceModel({ ...previousData }));
      return;
    }
    navigateToPerformance();
  };

  const onAction = (action: GRID_ACTIONS): void => {
    switch (action) {
      case GRID_ACTIONS.EDIT:
        useUpsert.setViewMode(VIEW_MODE.EDIT);
        break;
      case GRID_ACTIONS.SAVE:
        upsertPerformance();
        break;
      case GRID_ACTIONS.CANCEL:
        onCancel(performanceData);
        break;
    }
  };

  const navigateToPerformance = (): void => {
    navigate('/aircraft/performance');
  };

  const groupInputControls = (): IGroupInputControls => {
    return {
      title: 'General',
      inputControls: [
        {
          fieldKey: 'name',
          type: EDITOR_TYPES.TEXT_FIELD,
        },
        {
          fieldKey: 'maxFlightLevel',
          type: EDITOR_TYPES.TEXT_FIELD,
        },
        {
          fieldKey: 'mtowInPounds',
          type: EDITOR_TYPES.TEXT_FIELD,
        },
        {
          fieldKey: 'mtowInKilos',
          type: EDITOR_TYPES.TEXT_FIELD,
          isDisabled: true,
        },
        {
          fieldKey: 'icaoTypeDesignator',
          type: EDITOR_TYPES.DROPDOWN,
          options: _settingsStore.icaoTypeDesignators,
        },
        {
          fieldKey: 'wakeTurbulenceCategory',
          type: EDITOR_TYPES.DROPDOWN,
          options: _settingsStore.wakeTurbulenceCategories,
        },
        {
          fieldKey: 'isRestricted',
          type: EDITOR_TYPES.CHECKBOX,
        },
        {
          fieldKey: 'isVerificationComplete',
          type: EDITOR_TYPES.CHECKBOX,
        },
        {
          fieldKey: 'fomS230',
          type: EDITOR_TYPES.TEXT_FIELD,
          isFullFlex: true,
          multiline: true,
          rows: 5,
        },
      ],
    };
  };

  const systemInputControls = (): IGroupInputControls => {
    return {
      title: 'System',
      inputControls: [
        {
          fieldKey: 'accessLevel',
          type: EDITOR_TYPES.DROPDOWN,
          options: _settingsStore.accessLevels,
        },
        {
          fieldKey: 'sourceType',
          type: EDITOR_TYPES.DROPDOWN,
          options: _settingsStore.sourceTypes,
        },
        {
          fieldKey: 'status',
          type: EDITOR_TYPES.DROPDOWN,
          options: ModelStatusOptions,
          isHalfFlex: !useUpsert.isDetailView,
        },
      ],
    };
  };

  const getDefaultSchedule = (schedule: PolicyScheduleModel[]): SettingsTypeModel => {
    return new SettingsTypeModel(schedule.find(a => a.isDefault)?.schedule);
  };

  const getUpdatedModel = (): PerformanceModel => {
    const formValues: PerformanceModel = useUpsert.form.values();
    const { climbSchedules, cruiseSchedules, descentSchedules, holdSchedules, performanceLinks } = formValues;
    const updatedModel = new PerformanceModel({
      ...performanceData,
      ...formValues,
      climbSchedules,
      cruiseSchedules,
      descentSchedules,
      holdSchedules,
      performanceLinks,
      defaultClimbSchedule: getDefaultSchedule(climbSchedules),
      defaultCruiseSchedule: getDefaultSchedule(cruiseSchedules),
      defaultDescentSchedule: getDefaultSchedule(descentSchedules),
      defaultHoldSchedule: getDefaultSchedule(holdSchedules),
    });
    return updatedModel;
  };

  const onValueChange = (value: IOptionValue, fieldKey: string): void => {
    if (Utilities.isEqual(fieldKey, 'mtowInPounds')) {
      useUpsert.getField('mtowInKilos').set('');
    }
    useUpsert.getField(fieldKey).set(value);
  };

  const systemDataFields = (): ReactNode => {
    return (
      <Collapsable title="System">
        <>
          <div className={classes.flexWrap}>
            {systemInputControls()
              .inputControls.filter(inputControl => !inputControl.isHidden)
              .map((inputControl: IViewInputControl, index: number) => (
                <ViewInputControl
                  {...inputControl}
                  key={index}
                  field={useUpsert.getField(inputControl.fieldKey || '')}
                  isEditable={useUpsert.isEditable}
                  onValueChange={(option, _) => onValueChange(option, inputControl.fieldKey || '')}
                />
              ))}
          </div>
          <AuditFields
            isEditable={useUpsert.isEditable}
            fieldControls={useUpsert.auditFields}
            onGetField={(fieldKey: string) => useUpsert.getField(fieldKey)}
            isNew={useUpsert.isAddNew}
          />
        </>
      </Collapsable>
    );
  };

  const disableAction = () => {
    if (isDataUpdated) {
      return useUpsert.form.hasError || UIStore.pageLoading;
    }
    if (Boolean(editingGrid.length)) {
      return true;
    }
    return useUpsert.isActionDisabled;
  };

  const headerActions = (): ReactNode => {
    return (
      <>
        <ViewPermission hasPermission={!useUpsert.isEditable}>
          <CustomLinkButton to="/aircraft/performance" title="Performance" startIcon={<ArrowBack />} />
        </ViewPermission>
        <EditSaveButtons
          disabled={disableAction()}
          hasEditPermission={aircraftModuleSecurity.isEditable}
          isEditMode={useUpsert.isEditable}
          onAction={action => onAction(action)}
        />
      </>
    );
  };

  const updateClimbSchedules = (climbSchedules): void => {
    const _performance = new PerformanceModel({
      ...useUpsert.form.values(),
      climbSchedules: climbSchedules,
      id: Number(params?.id) || 0,
    });
    useUpsert.setFormValues(_performance);
    setPerformanceData(_performance);
    setDataUpdate(true);
  };

  const updateCruiseSchedules = (cruiseSchedules: CruisePolicyScheduleModel[]): void => {
    const _performance = new PerformanceModel({
      ...useUpsert.form.values(),
      cruiseSchedules: cruiseSchedules,
      id: Number(params?.id) || 0,
    });
    useUpsert.setFormValues(_performance);
    setPerformanceData(_performance);
    setDataUpdate(true);
  };

  const updateDescentSchedules = (descentSchedules: PolicyScheduleModel[]): void => {
    const _performance = new PerformanceModel({
      ...useUpsert.form.values(),
      descentSchedules: descentSchedules,
      id: Number(params?.id) || 0,
    });
    useUpsert.setFormValues(_performance);
    setPerformanceData(_performance);
    setDataUpdate(true);
  };

  const updateHoldSchedules = (holdSchedules: PolicyScheduleModel[]): void => {
    const _performance = new PerformanceModel({
      ...useUpsert.form.values(),
      holdSchedules: holdSchedules,
      id: Number(params?.id) || 0,
    });
    useUpsert.setFormValues(_performance);
    setPerformanceData(_performance);
    setDataUpdate(true);
  };

  const updatePerformanceLinks = (performanceLinks: PerformanceLinkModel[]): void => {
    const _performance = new PerformanceModel({
      ...useUpsert.form.values(),
      performanceLinks: performanceLinks,
      id: Number(params?.id) || 0,
    });
    useUpsert.setFormValues(_performance);
    setPerformanceData(_performance);
    setDataUpdate(true);
  };

  return (
    <DetailsEditorWrapper headerActions={headerActions()} isEditMode={useUpsert.isEditable}>
      <div className={classes.flexRow}>
        <Collapsable title={'Performance'}>
          <div className={classes.flexWrap}>
            {groupInputControls()
              .inputControls.filter(inputControl => !inputControl.isHidden)
              .map((inputControl: IViewInputControl, index: number) => {
                return (
                  <ViewInputControl
                    {...inputControl}
                    key={index}
                    field={useUpsert.getField(inputControl.fieldKey || '')}
                    isEditable={useUpsert.isEditable}
                    classes={{
                      flexRow: classNames({
                        [classes.halfFlex]: inputControl.isHalfFlex,
                        [classes.inputControl]: !inputControl.isHalfFlex,
                        [classes.fullFlex]: inputControl.isFullFlex,
                      }),
                    }}
                    onValueChange={(option, _) => onValueChange(option, inputControl.fieldKey || '')}
                  />
                );
              })}
          </div>
        </Collapsable>
        <GenericRegistryGrid
          key="genericRegistry"
          rowData={useUpsert.getField('navBlueGenericRegistries').values()}
        />
        <ScheduleGrid
          key={`"climbSchedules=${_speedScheduleSettingsStore.climbSchedules?.length}-${useUpsert.isEditable}`}
          rowData={useUpsert.getField('climbSchedules').values()}
          onDataSave={schedule => updateClimbSchedules(schedule)}
          onRowEdit={isRowEditing => updateRowEditing(isRowEditing, 'climbSchedules')}
          isEditable={useUpsert.isEditable}
          policyList={_speedScheduleSettingsStore.climbSchedules}
          title="Climb Schedule"
        />
        <CruiseScheduleGrid
          key={`"cruiseSchedules=${_speedScheduleSettingsStore.cruiseSchedules?.length}-${useUpsert.isEditable}`}
          rowData={useUpsert.getField('cruiseSchedules').values()}
          onDataSave={schedule => updateCruiseSchedules(schedule)}
          onRowEdit={isRowEditing => updateRowEditing(isRowEditing, 'cruiseSchedules')}
          isEditable={useUpsert.isEditable}
          policyList={_speedScheduleSettingsStore.cruiseSchedules}
          title="Cruise Schedule"
        />
        <ScheduleGrid
          key={`"descentSchedules=${_speedScheduleSettingsStore.descentSchedules?.length}-${useUpsert.isEditable}`}
          rowData={useUpsert.getField('descentSchedules').values()}
          onDataSave={schedule => updateDescentSchedules(schedule)}
          onRowEdit={isRowEditing => updateRowEditing(isRowEditing, 'descentSchedules')}
          isEditable={useUpsert.isEditable}
          policyList={_speedScheduleSettingsStore.descentSchedules}
          title="Descent Schedule"
        />
        <ScheduleGrid
          key={`"holdSchedules=${_speedScheduleSettingsStore.holdSchedules?.length}-${useUpsert.isEditable}`}
          rowData={useUpsert.getField('holdSchedules').values()}
          onDataSave={schedule => updateHoldSchedules(schedule)}
          onRowEdit={isRowEditing => updateRowEditing(isRowEditing, 'holdSchedules')}
          isEditable={useUpsert.isEditable}
          policyList={_speedScheduleSettingsStore.holdSchedules}
          title="Hold Schedule"
        />
        <PerformanceLinkGrid
          key={`PerformanceLink-${useUpsert.isEditable}`}
          performanceLinkData={useUpsert.getField('performanceLinks').values()}
          onDataSave={performanceLinks => updatePerformanceLinks(performanceLinks)}
          onRowEdit={isRowEditing => updateRowEditing(isRowEditing, 'performanceLinks')}
          isEditable={useUpsert.isEditable}
        />
        <Collapsable title="Comments">
          <ViewInputControl
            field={useUpsert.getField('comments')}
            isEditable={useUpsert.isEditable}
            onValueChange={(option, _) => useUpsert.getField('comments').set(option)}
            type={EDITOR_TYPES.RICH_TEXT_EDITOR}
            showExpandButton={false}
          />
        </Collapsable>
        {systemDataFields()}
      </div>
    </DetailsEditorWrapper>
  );
};

export default inject(
  'performanceStore',
  'settingsStore',
  'speedScheduleSettingsStore',
  'sidebarStore'
)(observer(PerformanceEditor));
