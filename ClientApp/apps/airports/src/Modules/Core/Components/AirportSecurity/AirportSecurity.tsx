import React, { FC, ReactNode, useEffect } from 'react';
import { VIEW_MODE, useBaseUpsertComponent } from '@wings/shared';
import { inject, observer } from 'mobx-react';
import { useNavigate, useParams } from 'react-router';
import {
  AirportModel,
  AirportSettingsStore,
  AirportStore,
  EntityMapStore,
  AirportSecurityModel,
  useAirportModuleSecurity,
  updateAirportSidebarOptions,
  airportBasePath,
} from '../../../Shared';
import { useStyles } from './AirportSecurity.styles';
import { UIStore, Utilities, baseEntitySearchFilters, GRID_ACTIONS } from '@wings-shared/core';
import { EDITOR_TYPES, ViewInputControlsGroup, IGroupInputControls } from '@wings-shared/form-controls';
import { ConfirmNavigate, DetailsEditorHeaderSection, DetailsEditorWrapper, SidebarStore } from '@wings-shared/layout';
import { useUnsubscribe } from '@wings-shared/hooks';
import { fields } from './Fields';
import { finalize, takeUntil } from 'rxjs/operators';
import { AlertStore } from '@uvgo-shared/alert';

interface Props {
  airportStore?: AirportStore;
  airportSettingsStore?: AirportSettingsStore;
  entityMapStore?: EntityMapStore;
  sidebarStore?: typeof SidebarStore;
}

const AirportSecurity: FC<Props> = ({ airportStore, airportSettingsStore, entityMapStore, sidebarStore }: Props) => {
  const params = useParams();
  const navigate = useNavigate();
  const classes = useStyles();
  const useUpsert = useBaseUpsertComponent(params, fields, baseEntitySearchFilters);
  const unsubscribe = useUnsubscribe();
  const _airportStore = airportStore as AirportStore;
  const _airportSettingStore = airportSettingsStore as AirportSettingsStore;
  const _entityMapStore = entityMapStore as EntityMapStore;
  const _selectedAirport = _airportStore.selectedAirport as AirportModel;
  const airportModuleSecurity = useAirportModuleSecurity();

  /* istanbul ignore next */
  useEffect(() => {
    const { airportId, icao, viewMode } = params;
    useUpsert.setViewMode((viewMode?.toUpperCase() as VIEW_MODE) || VIEW_MODE.DETAILS);
    sidebarStore?.setNavLinks(
      updateAirportSidebarOptions('Airport Security', !Boolean(airportId)),
      airportBasePath(airportId, icao, viewMode)
    );
    const security = _selectedAirport ? _selectedAirport.airportSecurity : new AirportSecurityModel();
    useUpsert.setFormValues(security);
  }, []);

  /* istanbul ignore next */
  const upsertAirportSecurity = (): void => {
    const values = useUpsert.form.values();
    const request = new AirportSecurityModel({
      ..._selectedAirport.airportSecurity,
      ...values,
      airportId: Number(params.airportId),
    });
    UIStore.setPageLoader(true);
    _airportStore
      .upsertAirportSecurity(request.serialize())
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: response => {
          _airportStore?.setSelectedAirport({
            ..._selectedAirport,
            airportSecurity: response,
          });
          useUpsert.form.reset();
          useUpsert.setFormValues(response);
        },
        error: error => AlertStore.critical(error.message),
      });
  };

  const onFocus = (fieldKey: string) => {
    switch (fieldKey) {
      case 'rampSideAccess3rdParty':
        useUpsert.observeSearch(_airportSettingStore.loadRampSideAccessThirdParty());
        break;
      case 'rampSideAccess':
        useUpsert.observeSearch(_airportSettingStore.loadRampSideAccess());
        break;
      default:
        useUpsert.observeSearch(_entityMapStore.loadEntities(fieldKey));
        break;
    }
  };

  const onAction = (action: GRID_ACTIONS): void => {
    switch (action) {
      case GRID_ACTIONS.SAVE:
        upsertAirportSecurity();
        break;
      case GRID_ACTIONS.EDIT:
        useUpsert.setViewMode(VIEW_MODE.EDIT);
        break;
      case GRID_ACTIONS.CANCEL:
      default:
        useUpsert.setFormValues(_selectedAirport?.airportSecurity);
        if (Utilities.isEqual(params.viewMode?.toUpperCase() as VIEW_MODE, VIEW_MODE.DETAILS)) {
          useUpsert.setViewMode(VIEW_MODE.DETAILS);
          return;
        }
        navigate('/airports');
        break;
    }
  };

  const groupInputControls = (): IGroupInputControls[] => [
    {
      title: '',
      inputControls: [
        {
          fieldKey: 'rampSideAccess',
          type: EDITOR_TYPES.DROPDOWN,
          options: _airportSettingStore.rampSideAccess,
        },
        {
          fieldKey: 'rampSideAccess3rdPartyVendors',
          type: EDITOR_TYPES.DROPDOWN,
          multiple: true,
          options: _entityMapStore.rampSideAccess3rdPartyVendors,
        },
        {
          fieldKey: 'rampSideAccess3rdParty',
          type: EDITOR_TYPES.DROPDOWN,
          options: _airportSettingStore.rampSideAccess3rdParty,
        },
        {
          fieldKey: 'rampSideAccessNonOpsDuringStay',
          type: EDITOR_TYPES.TEXT_FIELD,
        },
      ],
    },
    {
      title: '',
      inputControls: [
        {
          fieldKey: 'airportFencing',
          type: EDITOR_TYPES.SELECT_CONTROL,
          isBoolean: true,
          containerClass: classes.containerClass,
        },
        {
          fieldKey: 'airportPolice',
          type: EDITOR_TYPES.SELECT_CONTROL,
          isBoolean: true,
          containerClass: classes.containerClass,
        },
        {
          fieldKey: 'crewScreening',
          type: EDITOR_TYPES.SELECT_CONTROL,
          isBoolean: true,
          containerClass: classes.containerClass,
        },
        {
          fieldKey: 'passengerScreening',
          type: EDITOR_TYPES.SELECT_CONTROL,
          isBoolean: true,
          containerClass: classes.containerClass,
        },
        {
          fieldKey: 'baggageScreening',
          type: EDITOR_TYPES.SELECT_CONTROL,
          isBoolean: true,
          containerClass: classes.containerClass,
        },
        {
          fieldKey: 'securityPatrols',
          type: EDITOR_TYPES.SELECT_CONTROL,
          isBoolean: true,
          containerClass: classes.containerClass,
        },
        {
          fieldKey: 'privateSecurityAllowed',
          type: EDITOR_TYPES.SELECT_CONTROL,
          isBoolean: true,
          containerClass: classes.containerClass,
        },
        {
          fieldKey: 'uniformRequiredForCrew',
          type: EDITOR_TYPES.SELECT_CONTROL,
          isBoolean: true,
          containerClass: classes.containerClass,
        },
        {
          fieldKey: 'airportSecurity24Hours',
          type: EDITOR_TYPES.SELECT_CONTROL,
          isBoolean: true,
          containerClass: classes.containerClass,
        },
        {
          fieldKey: 'securityOrCompanyIdRqrdForCrew',
          type: EDITOR_TYPES.SELECT_CONTROL,
          isBoolean: true,
          containerClass: classes.containerClass,
        },
        {
          fieldKey: 'airportSecurityViaAirportAuthorityOnly',
          type: EDITOR_TYPES.SELECT_CONTROL,
          isBoolean: true,
          containerClass: classes.containerClass,
        },
      ],
    },
    {
      title: '',
      inputControls: [
        {
          fieldKey: 'parkingAreaSecurityMeasures',
          type: EDITOR_TYPES.DROPDOWN,
          multiple: true,
          options: _entityMapStore.securityMeasures,
        },

        {
          fieldKey: 'gaParkingSecurityMeasures',
          type: EDITOR_TYPES.DROPDOWN,
          multiple: true,
          options: _entityMapStore.securityMeasures,
        },

        {
          fieldKey: 'airportSecurityMeasures',
          multiple: true,
          type: EDITOR_TYPES.DROPDOWN,
          options: _entityMapStore.securityMeasures,
        },
        {
          fieldKey: 'recommendedSecurityServices',
          multiple: true,
          type: EDITOR_TYPES.DROPDOWN,
          options: _entityMapStore.recommendedServices,
        },
      ],
    },
    {
      title: '',
      inputControlClassName: classes.securityNotes,
      inputControls: [
        {
          fieldKey: 'securityNotes',
          type: EDITOR_TYPES.TEXT_FIELD,
          multiline: true,
          rows: 3,
        },
      ],
    },
  ];

  const headerActions = (): ReactNode => {
    return (
      <DetailsEditorHeaderSection
        title={_selectedAirport.title}
        backNavLink="/airports"
        backNavTitle="Airports"
        isActive={_selectedAirport?.isActive}
        disableActions={useUpsert.isActionDisabled}
        isEditMode={useUpsert.isEditable}
        hasEditPermission={airportModuleSecurity.isEditable}
        onAction={action => onAction(action)}
      />
    );
  };

  return (
    <ConfirmNavigate isBlocker={useUpsert.form.changed}>
      <DetailsEditorWrapper
        headerActions={headerActions()}
        isEditMode={useUpsert.isEditable}
        classes={{ container: classes.editorWrapperContainer, headerActionsEditMode: classes.headerActionsEditMode }}
      >
        <ViewInputControlsGroup
          groupInputControls={groupInputControls()}
          field={useUpsert.getField}
          isEditing={useUpsert.isEditable}
          isLoading={useUpsert.isLoading}
          onValueChange={useUpsert.onValueChange}
          onFocus={(fieldKey: string) => onFocus(fieldKey)}
        />
      </DetailsEditorWrapper>
    </ConfirmNavigate>
  );
};

export default inject(
  'airportSettingsStore',
  'airportStore',
  'entityMapStore',
  'sidebarStore'
)(observer(AirportSecurity));
