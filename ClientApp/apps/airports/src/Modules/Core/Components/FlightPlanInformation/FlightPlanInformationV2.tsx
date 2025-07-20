import React, { FC, ReactNode, useEffect } from 'react';
import { inject, observer } from 'mobx-react';
import { useNavigate, useParams } from 'react-router';
import { fields } from './Fields';
import { AlertStore } from '@uvgo-shared/alert';
import { finalize, takeUntil } from 'rxjs/operators';
import { useUnsubscribe } from '@wings-shared/hooks';
import { useStyles } from './FlightPlanInformation.styles';
import { VIEW_MODE, useBaseUpsertComponent } from '@wings/shared';
import {
  airportBasePath,
  AirportFlightPlanInfoModel,
  AirportModel,
  AirportSettingsStore,
  AirportStore,
  updateAirportSidebarOptions,
  useAirportModuleSecurity,
} from '../../../Shared';
import {
  UIStore,
  Utilities,
  IOptionValue,
  GRID_ACTIONS,
  baseEntitySearchFilters,
  ISelectOption,
  IdNameCodeModel,
  IAPIGridRequest,
  SEARCH_ENTITY_TYPE,
} from '@wings-shared/core';
import { EDITOR_TYPES, ViewInputControlsGroup, IGroupInputControls } from '@wings-shared/form-controls';
import { ConfirmNavigate, DetailsEditorHeaderSection, DetailsEditorWrapper, SidebarStore } from '@wings-shared/layout';

interface Props {
  airportStore?: AirportStore;
  airportSettingsStore?: AirportSettingsStore;
  sidebarStore?: typeof SidebarStore;
}

const FlightPlanInformation: FC<Props> = ({ airportStore, airportSettingsStore, sidebarStore }) => {
  const backNavLink: string = '/airports';
  const params = useParams();
  const classes = useStyles();
  const navigate = useNavigate();
  const useUpsert = useBaseUpsertComponent(params, fields, baseEntitySearchFilters);
  const unsubscribe = useUnsubscribe();
  const _airportStore = airportStore as AirportStore;
  const _airportSettingsStore = airportSettingsStore as AirportSettingsStore;
  const _selectedAirport = _airportStore.selectedAirport as AirportModel;
  const airportModuleSecurity = useAirportModuleSecurity();
  const disableSaveButton =
    useUpsert.form.hasError || UIStore.pageLoading || !useUpsert.form.changed || useUpsert.hasDuplicateValue;

  /* istanbul ignore next */
  useEffect(() => {
    const { airportId, icao, viewMode } = params;
    useUpsert.setViewMode((viewMode?.toUpperCase() as VIEW_MODE) || VIEW_MODE.DETAILS);
    sidebarStore?.setNavLinks(
      updateAirportSidebarOptions('Flight Plan Information', !Boolean(airportId)),
      airportBasePath(airportId, icao, viewMode)
    );
    const airportFlightPlanInfo = _selectedAirport
      ? _selectedAirport.airportFlightPlanInfo
      : new AirportFlightPlanInfoModel();
    useUpsert.setFormValues(airportFlightPlanInfo);
  }, []);

  const fpAirspaceOptions = (): ISelectOption[] => {
    return _airportStore.firs.map(fir => new IdNameCodeModel({ ...fir }));
  };

  const groupInputControls = (): IGroupInputControls[] => {
    return [
      {
        title: '',
        inputControls: [
          {
            fieldKey: 'navBlueCode',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'apgCode',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'isACDMAirport',
            type: EDITOR_TYPES.CHECKBOX,
          },
          {
            fieldKey: 'isEuroControlFPLACDMAirport',
            type: EDITOR_TYPES.CHECKBOX,
          },
          {
            fieldKey: 'fplzzzz',
            type: EDITOR_TYPES.CHECKBOX,
          },
          {
            fieldKey: 'fplzzzzItem18',
            type: EDITOR_TYPES.TEXT_FIELD,
            isDisabled: !useUpsert.getField('fplzzzz').value,
          },
          {
            fieldKey: 'isCompositeFlightPlanRequired',
            type: EDITOR_TYPES.CHECKBOX,
          },
          {
            fieldKey: 'isVFRAirport',
            type: EDITOR_TYPES.CHECKBOX,
          },
          {
            fieldKey: 'appliedDestAltTOFs',
            type: EDITOR_TYPES.DROPDOWN,
            options: _airportSettingsStore.destinationAlternateTOFs,
            multiple: true,
          },
          {
            fieldKey: 'fpAirspace',
            type: EDITOR_TYPES.DROPDOWN,
            options: fpAirspaceOptions(),
          },
        ],
      },
    ];
  };

  const upsertAirportFlightPlanInfo = (): void => {
    const values = useUpsert.form.values();
    const request = new AirportFlightPlanInfoModel({
      ..._selectedAirport.airportFlightPlanInfo,
      ...values,
      airportId: params.airportId,
    });
    UIStore.setPageLoader(true);
    _airportStore
      .upsertAirportFlightPlanInfo(request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: response => {
          _airportStore.setSelectedAirport({
            ..._selectedAirport,
            airportFlightPlanInfo: response,
          });
          useUpsert.form.reset();
          useUpsert.setFormValues(response);
        },
        error: error => AlertStore.critical(error.message),
      });
  };

  const onValueChange = (value: IOptionValue, fieldKey: string): void => {
    useUpsert.getField(fieldKey).set(value);

    if (Utilities.isEqual(fieldKey, 'fplzzzz')) {
      useUpsert.getField('fplzzzzItem18').clear();
    }
  };

  const onSearch = (searchValue: string, fieldKey: string): void => {
    if (fieldKey === 'fpAirspace') {
      const request: IAPIGridRequest = useUpsert.getSearchRequest(searchValue, SEARCH_ENTITY_TYPE.FIR);
      useUpsert.observeSearch(_airportStore.getFIRs(request));
      return;
    }
  };

  const onFocus = (fieldKey: string): void => {
    if (fieldKey === 'appliedDestAltTOFs') {
      useUpsert.observeSearch(_airportSettingsStore.loadDestinationAlternateTOFs());
      return;
    }
  };

  const onAction = (action: GRID_ACTIONS): void => {
    switch (action) {
      case GRID_ACTIONS.SAVE:
        upsertAirportFlightPlanInfo();
        break;
      case GRID_ACTIONS.EDIT:
        useUpsert.setViewMode(VIEW_MODE.EDIT);
        break;
      case GRID_ACTIONS.CANCEL:
      default:
        if (Utilities.isEqual(params?.viewMode || '', VIEW_MODE.DETAILS)) {
          useUpsert.form.reset();
          useUpsert.setFormValues(_selectedAirport?.airportFlightPlanInfo);
          useUpsert.setViewMode(VIEW_MODE.DETAILS);
          return;
        }
        navigate(backNavLink, useUpsert.noBlocker);
        break;
    }
  };

  const headerActions = (): ReactNode => {
    return (
      <DetailsEditorHeaderSection
        title={_selectedAirport.title}
        backNavLink={backNavLink}
        backNavTitle="Airports"
        disableActions={disableSaveButton}
        isEditMode={useUpsert.isEditable}
        isActive={_selectedAirport.isActive}
        hasEditPermission={airportModuleSecurity.isEditable}
        onAction={onAction}
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
          field={fieldKey => useUpsert.getField(fieldKey)}
          isEditing={useUpsert.isEditable}
          isLoading={useUpsert.loader.isLoading}
          onValueChange={onValueChange}
          onSearch={(searchValue, fieldKey) => onSearch(searchValue, fieldKey)}
          onFocus={fieldKey => onFocus(fieldKey)}
        />
      </DetailsEditorWrapper>
    </ConfirmNavigate>
  );
};

export default inject('airportStore', 'airportSettingsStore', 'sidebarStore')(observer(FlightPlanInformation));
