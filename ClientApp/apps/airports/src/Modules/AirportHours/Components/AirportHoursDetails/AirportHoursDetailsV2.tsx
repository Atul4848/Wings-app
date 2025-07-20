import React, { FC, ReactNode, useEffect, useRef, useState } from 'react';
import { VIEW_MODE, AirportModel, ModelStatusOptions, useBaseUpsertComponent } from '@wings/shared';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { AlertStore } from '@uvgo-shared/alert';
import { inject, observer } from 'mobx-react';
import { Typography, IconButton, Paper } from '@material-ui/core';
import { useStyles } from './AirportHoursDetails.styles';
import {
  AirportHoursStore,
  AirportSettingsStore,
  AirportHoursModel,
  AirportHoursSubTypeModel,
  AirportHoursTypeModel,
  updatedAirportSidebarOptions,
} from '../../../Shared';
import { takeUntil, finalize } from 'rxjs/operators';
import { fields } from './Fields';
import { forkJoin, Observable } from 'rxjs';
import { ArrowBack, DescriptionOutlined, AspectRatio } from '@material-ui/icons';
import { AirportHeaderSection, AirportHoursGrid, AirportHoursInformation, OtOrHoursDetails } from '../../Components';
import {
  IAPIGridRequest,
  IOptionValue,
  ISelectOption,
  UIStore,
  Utilities,
  ViewPermission,
  IdNameCodeModel,
  baseEntitySearchFilters,
} from '@wings-shared/core';
import { CustomLinkButton, SidebarStore } from '@wings-shared/layout';
import { useNavigate, useParams } from 'react-router';
import { ExpandCollapseButton } from '@wings-shared/form-controls';
import { useConfirmDialog, useUnsubscribe } from '@wings-shared/hooks';
import { IHoursGridRef } from './AirportHoursGrid/AirportHoursGridV2';
import { useSearchParams } from 'react-router-dom';

interface Props {
  airportHoursStore?: AirportHoursStore;
  airportSettingsStore?: AirportSettingsStore;
  sidebarStore?: typeof SidebarStore;
}

const AirportHoursDetails: FC<Props> = ({
  airportHoursStore,
  airportSettingsStore,
  sidebarStore,
}: Props) => {
  const classes = useStyles();
  const navigate = useNavigate();
  const params = useParams();
  const [ searchParams ] = useSearchParams();
  const _useConfirmDialog = useConfirmDialog();
  const hoursGridRef = useRef<IHoursGridRef>();
  const [ airportHourSubTypes, setAirportHourSubTypes ] = useState<AirportHoursSubTypeModel[]>([]);
  const [ columnResizeSource, setColumnResizeSource ] = useState<string>('');
  const [ isRowEditing, setIsRowEditing ] = useState<boolean>(false);

  const isAirportScreen = Utilities.isEqual(searchParams?.get('backNav') || '', 'airports');

  const backNav = isAirportScreen
    ? `/upsert/${params?.airportId}/${params?.icao}/details/airport-hours`
    : '/airport-hours';

  const useUpsert = useBaseUpsertComponent<AirportHoursModel>(params, fields, baseEntitySearchFilters);

  const unsubscribe = useUnsubscribe();
  const _airportHoursStore = airportHoursStore as AirportHoursStore;
  const _airportSettingsStore = airportSettingsStore as AirportSettingsStore;
  const _sidebarStore = sidebarStore as typeof SidebarStore;

  const hasAirportAndHoursType = (): boolean => {
    const airport = useUpsert.getField('airport').value;
    const airportHoursType = useUpsert.getField('airportHoursType').value;
    return Boolean(airport && airportHoursType);
  };

  // Load Data on Mount
  useEffect(() => {
    _sidebarStore?.setNavLinks(updatedAirportSidebarOptions('Airport Hours', window.location.search), 'airports');
    loadInitialData();
    return () => _airportHoursStore.reset();
  }, []);

  /* istanbul ignore next */
  const setAirportHoursSubTypes = (airportHoursId: number): void => {
    setAirportHourSubTypes(
      _airportSettingsStore.airportHourSubTypes.filter(({ airportHoursType }) =>
        Utilities.isEqual(airportHoursType.id, airportHoursId)
      )
    );
  };

  /* istanbul ignore next */
  const loadAirportHours = (): void => {
    const { airport, associateAirport, airportHoursType } = useUpsert.form.values();
    if (!airport || !airportHoursType) {
      return;
    }
    UIStore.setPageLoader(true);

    const airportTypeFilter = Utilities.getFilter('AirportHoursType.Name', airportHoursType.label);

    // If Associated airport is selected then we needs to load airport hours for both type airports
    const isAssociatedAirports = Boolean(associateAirport?.id);
    const associateAirportFilter = isAssociatedAirports
      ? [ Utilities.getFilter('Airport.AirportId', associateAirport?.id) ]
      : [];
    const airportFilter = airport?.id
      ? Utilities.getFilter('Airport.AirportId', airport?.id)
      : Utilities.getFilter('ICAO', params?.icao || '');

    const mergedFilters = isAssociatedAirports
      ? associateAirportFilter.concat(airportTypeFilter)
      : [ airportFilter ].concat(airportTypeFilter);

    const request: IAPIGridRequest = {
      pageSize: 0,
      filterCollection: JSON.stringify(mergedFilters),
      sortCollection: JSON.stringify([
        { propertyName: 'CAPPSSequenceId', isAscending: true, sequenceNumber: 1 },
        { propertyName: 'AirportHoursType.Name', isAscending: true, sequenceNumber: 2 },
      ]),
    };

    _airportHoursStore
      .loadAirportHours(request)
      .pipe(
        finalize(() => UIStore.setPageLoader(false)),
        takeUntil(unsubscribe.destroy$)
      )
      .subscribe(response => {
        if (isAssociatedAirports) {
          // Auto Assign new capps sequence Id's
          _airportHoursStore.associatedAirportHours = response.results;
          const seqIdsList = response.results.map(x => x.cappsSequenceId).sort();
          const maxValue = seqIdsList.length ? Math.max(...seqIdsList) : 0;
          if (maxValue) {
            _airportHoursStore.airportHours = _airportHoursStore.airportHours.map((x, idx) => {
              x.cappsSequenceId = maxValue + idx + 1;
              return x;
            });
          }
        } else {
          _airportHoursStore.associatedAirportHours = [];
          _airportHoursStore.airportHours = response.results;
        }
        response.results = _airportHoursStore.airportHours.concat(_airportHoursStore.associatedAirportHours);
        response.totalNumberOfRecords = response.results?.length;
        hoursGridRef.current?.setTableData(response);
      });
  };

  /* istanbul ignore next */
  const loadInitialData = () => {
    UIStore.setPageLoader(true);
    forkJoin([
      searchWingsAirports(params?.icao || ''),
      _airportSettingsStore.loadAirportHourTypes(),
      _airportSettingsStore.loadAirportHourSubTypes(),
    ])
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(([ airports ]) => {
        if (params?.icao) {
          // In case ICAO not available then create inactive airport 48272
          const airport =
            airports.find(airport => Utilities.isEqual(airport.displayCode, params.icao as any)) ||
            new AirportModel({
              id: params?.airportId as any,
              icao: new IdNameCodeModel({ code: params?.icao }),
              displayCode: params?.icao,
              status: ModelStatusOptions[1],
            });
          useUpsert.getField('airport').set(airport);
        }

        if (params?.airportHoursTypeId) {
          const airportHoursType = _airportSettingsStore.airportHourTypes.find(({ id }) =>
            Utilities.isEqual(id, Number(params?.airportHoursTypeId))
          );
          useUpsert.getField('airportHoursType').set(airportHoursType);
          setAirportHoursSubTypes(Number(params?.airportHoursTypeId));
          loadAirportHours();
        }
      });
  };

  const onValueChange = (value: IOptionValue, fieldKey: string): void => {
    useUpsert.getField(fieldKey).set(value);
    switch (fieldKey) {
      case 'airport':
      case 'associateAirport':
        // clear TFO AIrports to get Updated Timezone information
        _airportHoursStore.wingsAirports = [];
        _airportHoursStore.tfoAirports = [];
        loadAirportHours();
        break;
      case 'airportHoursType':
        loadAirportHours();
        setAirportHoursSubTypes(Number((value as ISelectOption)?.value));
        break;
    }
  };

  /* istanbul ignore next */
  const searchWingsAirports = (searchValue: string): Observable<AirportModel[]> => {
    UIStore.setPageLoader(true);
    return _airportHoursStore.searchWingsAirportsByCode(searchValue, { excludeRetail: true }).pipe(
      takeUntil(unsubscribe.destroy$),
      finalize(() => UIStore.setPageLoader(false))
    );
  };

  // Initialize Airport Hour with default values add airport hours model
  /* istanbul ignore next */
  const addNewAirportHour = (): void => {
    const airportHoursType: AirportHoursTypeModel = useUpsert.getField('airportHoursType').value;
    const isCIQTypeHours: boolean = Utilities.isEqual(airportHoursType.label, 'ciq');
    const airportHoursSubType = isCIQTypeHours
      ? airportHourSubTypes.find(({ label }) => Utilities.isEqual(label, 'Available Hours')) // SET default 74215
      : null;

    const newAirportHour = new AirportHoursModel({
      id: 0,
      airportHoursSubType: airportHoursSubType as AirportHoursSubTypeModel,
      airportHoursType,
      airport: useUpsert.getField('airport').value,
    });
    hoursGridRef.current?.addNewAirportHour(newAirportHour);
  };

  /* istanbul ignore next */
  const confirmCreateOtOrRecords = (airportHour: AirportHoursModel, rowIndex: number): void => {
    _useConfirmDialog.confirmAction(
      () => {
        ModalStore.close();
        createOTORRecords(airportHour, rowIndex);
      },
      {
        onNo: () => ModalStore.close(),
        title: 'Create OTOR Records',
        message: 'Do you want to create OT/OR Hours with this Airport Hour?',
        onClose: () => ModalStore.close(),
      }
    );
  };


  /* istanbul ignore next */
  const createOTORRecords = (airportHour: AirportHoursModel, rowIndex: number): void => {
    ModalStore.open(
      <OtOrHoursDetails
        airportHoursModel={airportHour}
        airportHoursStore={_airportHoursStore}
        airportSettingsStore={_airportSettingsStore}
        updateGridItem={(otorHours: AirportHoursModel[]) => {
          _airportHoursStore.airportHours = [ ..._airportHoursStore.airportHours, ...otorHours ];
          hoursGridRef.current?.setTableData({
            ...hoursGridRef.current?.gridPagination,
            results: _airportHoursStore.airportHours,
            totalNumberOfRecords: hoursGridRef.current?.gridPagination.totalNumberOfRecords + otorHours.length,
          });
        }}
      />
    );
  };

  /* istanbul ignore next */
  const confirmAirportAssociation = (): void => {
    const { airport, associateAirport } = useUpsert.form.values();
    _useConfirmDialog.confirmAction(
      () => {
        ModalStore.close();
        UIStore.setPageLoader(true);
        const airports = [ ..._airportHoursStore.airportHours ].map(x => {
          x.airport = associateAirport;
          return x.serialize();
        });
        _airportHoursStore
          .upsertAirportHours(airports)
          .pipe(
            finalize(() => UIStore.setPageLoader(false)),
            takeUntil(unsubscribe.destroy$)
          )
          .subscribe({
            next: (response: AirportHoursModel[]) => {
              _airportHoursStore.associatedAirportHours = [];
              useUpsert.getField('airport').set(associateAirport);
              if (navigate) {
                const backNav = searchParams?.get('backNav');
                const url = `/airports/airport-hours/${associateAirport.id}/${associateAirport.displayCode}/${params?.airportHoursTypeId}/${params.viewMode}?backNav=${backNav}`;
                navigate(url, { replace: true });
              }
              useUpsert.getField('associateAirport').clear();
            },
            error: error => AlertStore.critical(error.message),
          });
      },
      {
        onNo: () => ModalStore.close(),
        title: 'Confirm Changes',
        message: `All Airport Hours with code ${airport.icao.label} will be associated to airport ${associateAirport.displayCode}. Are you sure you want to continue?`,
        onClose: () => ModalStore.close(),
      }
    );
  };

  /* istanbul ignore next */
  const saveChanges = (airportHour: AirportHoursModel, rowIndex: number): void => {
    UIStore.setPageLoader(true);
    _airportHoursStore
      .upsertAirportHours([ airportHour.serialize() ])
      .pipe(
        finalize(() => UIStore.setPageLoader(false)),
        takeUntil(unsubscribe.destroy$)
      )
      .subscribe({
        next: (response: AirportHoursModel[]) => {
          hoursGridRef.current?.updateTableItem(rowIndex, response[0]);
          if (_airportHoursStore?.canCreateOTORRecord(airportHour)) {
            confirmCreateOtOrRecords(airportHour, rowIndex);
          }
        },
        error: error => AlertStore.critical(error.message),
      });
  };

  const airportHoursGrid = (): ReactNode => {
    const airport = useUpsert.getField('airport').value;
    if (!hasAirportAndHoursType()) {
      return (
        <div className={classes.placeHolder}>
          <DescriptionOutlined fontSize="large" />
          <Typography variant="subtitle1">Select ICAO and Hours Type </Typography>
          <Typography variant="body2">
            Please Select ICAO and Hours Type to edit Hours and related information
          </Typography>
        </div>
      );
    }
    return (
      <>
        <div className={classes.headerTitle}>
          <div className={classes.headerDetails}>
            <Typography>Hours Details</Typography>
            <ExpandCollapseButton onExpandCollapse={() => hoursGridRef.current?.autoSizeColumns()} />
          </div>
          <IconButton onClick={() => useUpsert.setExpandMode(!useUpsert.expandMode)}>
            <AspectRatio />
          </IconButton>
        </div>
        <div className={classes.hoursGrid}>
          <AirportHoursGrid
            ref={hoursGridRef}
            isEditable={!useUpsert.isDetailView}
            airportModel={airport}
            columnResizeSource={columnResizeSource}
            airportHourSubTypes={airportHourSubTypes}
            onColumnResized={source => setColumnResizeSource(source) as any}
            airportHoursType={useUpsert.getField('airportHoursType').value}
            onSaveChanges={saveChanges}
            onRowEditingStarted={isEditing => {
              setIsRowEditing(isEditing);
              _airportSettingsStore.getAirportHoursRemarks().subscribe();
              _airportSettingsStore.loadTypes().subscribe();
            }}
          />
        </div>
      </>
    );
  };

  return (
    <div className={classes.root}>
      <div className={classes.backButton}>
        <CustomLinkButton
          to={`/airports${backNav}`}
          title={isAirportScreen ? 'Airport Details' : 'Airport Hours'}
          startIcon={<ArrowBack />}
        />
      </div>
      <Paper className={classes.container}>
        <AirportHeaderSection
          viewMode={params.viewMode as VIEW_MODE}
          isEditing={!useUpsert.isDetailView}
          isLoading={useUpsert.loader.isLoading || UIStore.pageLoading}
          wingsAirports={_airportHoursStore.wingsAirports}
          airportHourTypes={_airportSettingsStore.airportHourTypes}
          isDisabled={isRowEditing}
          onAddNewAirport={addNewAirportHour}
          getField={useUpsert.getField}
          onViewModeChange={useUpsert.setViewMode}
          onValueChange={onValueChange}
          onSearchAirport={searchValue => searchWingsAirports(searchValue).subscribe()}
          onAssociateAirport={confirmAirportAssociation}
        />
        <ViewPermission hasPermission={hasAirportAndHoursType() && !useUpsert.expandMode}>
          <AirportHoursInformation
            airport={useUpsert.getField('airport').value}
            airportHours={_airportHoursStore.summaryHours}
            defaultActiveTab={useUpsert.activeTab}
            onTabChange={activeTab => (useUpsert.activeTab = activeTab)}
          />
        </ViewPermission>
        <div className={classes.gridContainer}>{airportHoursGrid()}</div>
      </Paper>
    </div>
  );
};

export default inject('airportHoursStore', 'airportSettingsStore', 'sidebarStore')(observer(AirportHoursDetails));
