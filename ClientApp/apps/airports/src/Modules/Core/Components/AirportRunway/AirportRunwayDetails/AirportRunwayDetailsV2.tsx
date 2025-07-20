import React, { FC, ReactNode, useEffect, useState } from 'react';
import { VIEW_MODE, useBaseUpsertComponent } from '@wings/shared';
import { EDITOR_TYPES, ViewInputControl, IViewInputControl } from '@wings-shared/form-controls';
import { inject, observer } from 'mobx-react';
import { useStyles } from './AirportRunwayDetails.styles';
import { AlertStore } from '@uvgo-shared/alert';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import classNames from 'classnames';
import {
  AirportRunwayModel,
  RunwayDetailModel,
  AirportModel,
  updateAirportSidebarOptions,
  AirportSettingsStore,
  AirportStore,
  useAirportModuleSecurity,
  airportBasePath,
} from '../../../../Shared';
import { finalize, takeUntil } from 'rxjs/operators';
import { AxiosError } from 'axios';
import PrimaryRunwayEditor from './PrimaryRunwayEditor';
import { IOptionValue, UIStore, Utilities, GRID_ACTIONS, baseEntitySearchFilters } from '@wings-shared/core';
import {
  DetailsEditorWrapper,
  ConfirmNavigate,
  ConfirmDialog,
  Collapsable,
  DetailsEditorHeaderSection,
  SidebarStore,
} from '@wings-shared/layout';
import { useUnsubscribe } from '@wings-shared/hooks';
import { useParams, useNavigate } from 'react-router';
import { fields } from './Fields';
import { useAirportRunwayDetailsBase } from './UseAirportRunwayDetailsBase';

export interface Props {
  airportStore?: AirportStore;
  airportSettingsStore?: AirportSettingsStore;
  sidebarStore?: typeof SidebarStore;
  viewMode?: VIEW_MODE;
}

const AirportRunwayDetails: FC<Props> = ({ airportStore, airportSettingsStore, ...props }) => {
  const params = useParams();
  const navigate = useNavigate();
  const classes = useStyles();
  const useUpsert = useBaseUpsertComponent(params, fields, baseEntitySearchFilters);
  const unsubscribe = useUnsubscribe();
  const _airportStore = airportStore as AirportStore;
  const _airportSettingStore = airportSettingsStore as AirportSettingsStore;
  const _selectedAirport = _airportStore.selectedAirport as AirportModel;
  const airportModuleSecurity = useAirportModuleSecurity();

  const hasBaseRunwayNumber = Boolean(useUpsert.getField('base.runwayNumber').value);
  const hasReciprocalRunwayNumber = Boolean(useUpsert.getField('reciprocal.runwayNumber').value);
  const _runwayDetailBase = useAirportRunwayDetailsBase(
    _selectedAirport,
    _airportSettingStore,
    hasBaseRunwayNumber,
    hasReciprocalRunwayNumber
  );

  const [ runway, setRunway ] = useState<AirportRunwayModel>(new AirportRunwayModel());

  /* istanbul ignore next */
  useEffect(() => {
    const { airportId, icao, runwayViewMode } = params;
    useUpsert.setViewMode((runwayViewMode?.toUpperCase() as VIEW_MODE) || VIEW_MODE.EDIT);
    if (Boolean(params)) {
      props.sidebarStore?.setNavLinks(
        updateAirportSidebarOptions('Runways', !Boolean(airportId)),
        airportBasePath(airportId, icao, props.viewMode)
      );
    }
    loadData();
    return () => {
      _airportStore.clearRunways();
    };
  }, []);

  /* istanbul ignore next */
  const loadData = (): void => {
    if (!params?.runwayId) {
      useUpsert.setFormValues(runway);
      return;
    }
    const _runway = _selectedAirport.runways.find(a => a.id === Number(params?.runwayId)) as AirportRunwayModel;
    setRunway(_runway);
    useUpsert.setFormValues(_runway);
  };

  const onValueChange = (value: IOptionValue | IOptionValue[], fieldKey: string): void => {
    useUpsert.getField(fieldKey).set(value);
  };

  const onFocus = (fieldKey: string): void => {
    switch (fieldKey) {
      case 'runwaySurfaceTreatment':
        useUpsert.observeSearch(_airportSettingStore.loadRunwaySurfaceTreatments());
        break;
      case 'runwaySurfacePrimaryType':
      case 'runwaySurfaceSecondaryType':
        useUpsert.observeSearch(_airportSettingStore.loadRunwaySurfaceTypes());
        break;
      case 'runwayLightType':
        useUpsert.observeSearch(_airportSettingStore.loadRunwayLightTypes());
        break;
      case 'runwayCondition':
        useUpsert.observeSearch(_airportSettingStore.loadRunwayConditions());
        break;
      case 'runwayUsageType':
        useUpsert.observeSearch(_airportSettingStore.loadRunwayUsageTypes());
        break;
      case 'appliedRunwayRVRs':
        useUpsert.observeSearch(_airportSettingStore.loadRunwayRVR());
        break;
      case 'runwayApproachLight':
        useUpsert.observeSearch(_airportSettingStore.loadRunwayApproachLight());
        break;
      case 'runwayVGSI':
        useUpsert.observeSearch(_airportSettingStore.loadRunwayVGSI());
        break;
      case 'appliedRunwayApproachTypes':
        useUpsert.observeSearch(_airportSettingStore.loadRunwayApproachType());
        break;
      case 'appliedRunwayNavaids':
        useUpsert.observeSearch(_airportSettingStore.loadRunwayNavaids());
        break;
      case 'accessLevel':
        useUpsert.observeSearch(_airportSettingStore.getAccessLevels());
        break;
      case 'sourceType':
        useUpsert.observeSearch(_airportSettingStore.getSourceTypes());
        break;
    }
  };

  const onAction = (action: GRID_ACTIONS) => {
    switch (action) {
      case GRID_ACTIONS.EDIT:
        useUpsert.setViewMode(VIEW_MODE.EDIT);
        break;
      case GRID_ACTIONS.SAVE:
        upsertRunway();
        break;
      case GRID_ACTIONS.CANCEL:
        confirmClose();
        break;
    }
  };

  const onCancel = (): void => {
    const _mode = params.runwayViewMode as VIEW_MODE;
    if (_mode.toUpperCase() === VIEW_MODE.DETAILS) {
      useUpsert.setViewMode(VIEW_MODE.DETAILS);
      useUpsert.form.reset();
      useUpsert.setFormValues(runway);
      return;
    }
    navigateToRunways();
  };

  /* istanbul ignore next */
  const navigateToRunways = (): void => {
    if (Boolean(params)) {
      const { airportId, icao } = params;
      navigate(`/airports/upsert/${airportId}/${icao}/${props.viewMode}/runway`, useUpsert.noBlocker);
      props.sidebarStore?.setNavLinks(
        updateAirportSidebarOptions('Runways', !Boolean(params.airportId)),
        airportBasePath(airportId, icao, props.viewMode)
      );
    }
  };

  const confirmClose = (): void => {
    if (params?.runwayViewMode?.toUpperCase() === VIEW_MODE.DETAILS) {
      if (!useUpsert.form.touched) {
        onCancel();
        return;
      }
      ModalStore.open(
        <ConfirmDialog
          title="Confirm Cancellation"
          message="Leaving Edit Mode will cause your changes to be lost. Are you sure you want to exit Edit Mode?"
          yesButton="Yes"
          onNoClick={() => {
            ModalStore.close();
          }}
          onYesClick={() => {
            onCancel();
            ModalStore.close();
          }}
        />
      );
      return;
    }
    navigateToRunways();
    return;
  };

  /* istanbul ignore next */
  const isValidData = (data: AirportRunwayModel): boolean => {
    const { runways } = _selectedAirport;
    const { base, reciprocal, id, runwayId } = data;
    const isDuplicateId = runways.some(x => Utilities.isEqual(x.runwayId, runwayId) && !Utilities.isEqual(x.id, id));
    if (isDuplicateId) {
      useUpsert.showAlert('Runway ID should be unique in Airport', 'Runway');
      return false;
    }
    const isDuplicate = runways.some(
      x =>
        (Utilities.isEqual(x.base.runwayNumber, base.runwayNumber) ||
          Utilities.isEqual(x.reciprocal.runwayNumber, reciprocal.runwayNumber)) &&
        !Utilities.isEqual(x.id, id)
    );
    if (isDuplicate) {
      useUpsert.showAlert('Runway Number should be unique in Airport', 'Runway');
      return false;
    }
    return true;
  };

  const upsertRunway = (): void => {
    const { reciprocal, base, ...rest } = useUpsert.form.values();
    const data = new AirportRunwayModel({
      ...rest,
      id: Utilities.getNumberOrNullValue(runway.id),
      airportId: Number(params.airportId),
      base: new RunwayDetailModel({ ...runway.base, ...base, runwayTypeId: 1 }),
      reciprocal: new RunwayDetailModel({ ...runway.reciprocal, ...reciprocal, runwayTypeId: 2 }),
    });
    if (!isValidData(data)) {
      return;
    }
    UIStore.setPageLoader(true);
    _airportStore
      .upsertRunway(Number(params.airportId), data)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: response => {
          useUpsert.setViewMode(VIEW_MODE.DETAILS);
          useUpsert.form.reset();
          useUpsert.setFormValues(response);
          setRunway(response);
          setSelectedAirport(response, !Boolean(data.id));
        },
        error: (error: AxiosError) => AlertStore.critical(error.message),
      });
  };

  const openPrimaryRunwayEditor = (): void => {
    ModalStore.open(<PrimaryRunwayEditor airportStore={_airportStore} />);
  };

  const setSelectedAirport = (updatedRunway: AirportRunwayModel, isNew: boolean): void => {
    const { runways, primaryRunway, ...rest } = _selectedAirport;
    const updatedRunways: AirportRunwayModel[] = isNew
      ? [ ...runways, updatedRunway ]
      : runways.map(a => (a.id === updatedRunway.id ? updatedRunway : a));
    const updatedPrimaryRunway = updatedRunways.find(a => a.id === primaryRunway.id);
    _airportStore.setSelectedAirport(
      new AirportModel({ ...rest, runways: updatedRunways, primaryRunway: updatedPrimaryRunway || primaryRunway })
    );
    openPrimaryRunwayEditor();
  };

  const headerActions = (): ReactNode => {
    return (
      <DetailsEditorHeaderSection
        title={_selectedAirport?.title}
        backNavTitle="Countries Details"
        disableActions={useUpsert.form.hasError || UIStore.pageLoading || !useUpsert.form.changed}
        isEditMode={useUpsert.isEditable}
        onAction={onAction}
        //backNavLink={`/${historyBasePath.current}`}
        hasEditPermission={Boolean(airportModuleSecurity.isEditable && _selectedAirport?.isActive)}
        showBreadcrumb={true}
      />
    );
  };

  return (
    <ConfirmNavigate isBlocker={useUpsert.form.touched}>
      <DetailsEditorWrapper
        headerActions={headerActions()}
        isEditMode={useUpsert.isEditable}
        classes={{ container: classes.editorWrapperContainer }}
        isBreadCrumb={true}
      >
        <div className={classes.flexRow}>
          {_runwayDetailBase
            .groupInputControls()
            .filter(groupInputControl => !groupInputControl.isHidden)
            .map(groupInputControl => {
              return (
                <Collapsable key={groupInputControl.title} title={groupInputControl.title}>
                  <div className={classes.flexWrap}>
                    {groupInputControl.inputControls
                      .filter(inputControl => !inputControl.isHidden)
                      .map((inputControl: IViewInputControl, index: number) => {
                        return (
                          <ViewInputControl
                            {...inputControl}
                            key={index}
                            customErrorMessage={inputControl.customErrorMessage}
                            field={useUpsert.getField(inputControl.fieldKey || '')}
                            isEditable={useUpsert.isEditable}
                            isExists={inputControl.isExists}
                            classes={{
                              flexRow: classNames({
                                [classes.inputControl]: true,
                                [classes.labelFields]: inputControl.type === EDITOR_TYPES.LABEL,
                              }),
                            }}
                            onValueChange={(option, fieldKey) => onValueChange(option, inputControl.fieldKey || '')}
                            onFocus={onFocus}
                            showLabel={inputControl.showLabel}
                          />
                        );
                      })}
                  </div>
                </Collapsable>
              );
            })}
        </div>
      </DetailsEditorWrapper>
    </ConfirmNavigate>
  );
};

export default inject('airportStore', 'airportSettingsStore', 'sidebarStore')(observer(AirportRunwayDetails));
