import React, { FC, ReactNode, useEffect, useState } from 'react';
import { VIEW_MODE, useBaseUpsertComponent } from '@wings/shared';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { SETTING_ID, SettingBaseModel, useVMSModuleSecurity, VendorLocationModel } 
  from '../../../Shared';
import {
  SettingsStore,
  VendorLocationStore,
  OperationalInsightsStore,
  VendorLocationPhotoStore,
  BaseStore,
} from '../../../../Stores';
import { useUnsubscribe } from '@wings-shared/hooks';
import { useStyles } from './LocationOperationalInsights.styles';
import { inject, observer } from 'mobx-react';
import { ViewInputControls } from '../../../Shared/Components/ViewInputControls/ViewInputControls';
import { fields } from './Fields';
import {
  IAPISearchFiltersDictionary,
  IOptionValue,
  UIStore,
  GRID_ACTIONS,
  IAPIGridRequest,
  Loader,
} from '@wings-shared/core';
import { finalize, takeUntil } from 'rxjs/operators';
import { useNavigate, useParams } from 'react-router';
import { DetailsEditorHeaderSection, DetailsEditorWrapper, ConfirmNavigate, ConfirmDialog } from '@wings-shared/layout';
import { EDITOR_TYPES, IGroupInputControls } from '@wings-shared/form-controls';
import { forkJoin } from 'rxjs';
import { CustomersModel } from '../../../Shared/Models/Customers.model';
import { Dialog } from '@uvgo-shared/dialog';
import CustomTooltip from '../../../Shared/Components/Tooltip/CustomTooltip';
import { LocationOperationalInsightsModel } from '../../../Shared/Models/LocationOperationalInsights.model';
import LocationOn from '@material-ui/icons/LocationOn';
import { MapBoxViewV1 } from '@wings-shared/mapbox';
import { Box, Typography, IconButton } from '@material-ui/core';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { CloseIcon, DownloadIcon, UploadIcon } from '@uvgo-shared/icons';
import { VendorLocationPhotosModel } from '../../../Shared/Models/VendorLocationPhotos.model';
import { useGridState } from '@wings-shared/custom-ag-grid';
import {
  IAPIDownloadPhotoFile,
  IAPIPhotoFile,
} from '../../../Shared/Interfaces/Request/API-Request-DocumentUpload.interface';
import { PROGRESS_TYPES } from '@uvgo-shared/progress';
import UploadDocumentFile from '../../../Shared/Components/UploadDocumentFile/UploadDocumentFile';

interface Props {
  vendorLocationStore: VendorLocationStore;
  vendorLocationPhotoStore: VendorLocationPhotoStore;
  settingsStore: SettingsStore;
  operationalInsightsStore: OperationalInsightsStore;
  params?: { id: number; vendorId: number };
  searchFilters: IAPISearchFiltersDictionary;
}

const LocationOperationalInsights: FC<Props> = observer(
  ({ settingsStore, vendorLocationStore, operationalInsightsStore, vendorLocationPhotoStore, searchFilters }) => {
    const classes = useStyles();
    const unsubscribe = useUnsubscribe();
    const params = useParams();
    const vmsModuleSecurityV2 = useVMSModuleSecurity();
    const progressLoader: Loader = new Loader(false, { type: PROGRESS_TYPES.CIRCLE });
    const [ selectedVendorLocation, setSelectedVendorLocation ] = useState(new VendorLocationModel());
    const useUpsert = useBaseUpsertComponent<LocationOperationalInsightsModel>(params, fields, searchFilters);
    const gridState = useGridState();
    const formRef = useUpsert.form;
    const navigate = useNavigate();
    const [ latitude, setLatitude ] = useState(0);
    const [ longitude, setLongitude ] = useState(0);
    const [ mapValueChanged, setMapValueChanged ] = useState(false);
    const [ isOtherFieldVisible, setIsOtherFieldVisible ] = useState<boolean>(false);
    const [ isDepartureOtherFieldVisible, setIsDepartureOtherFieldVisible ] = useState<boolean>(false);

    useEffect(() => {
      useUpsert.setViewMode((params.viewMode.toUpperCase() as VIEW_MODE) || VIEW_MODE.DETAILS);
      if (params.id) {
        loadVendorLocationData();
      }
      loadInitialData();
      loadLocationPhotos();
      vendorLocationPhotoStore.photoUri = null;
      vendorLocationPhotoStore.file = null;
    }, []);

    const loadLocationPhotos = () => {
      const request: IAPIGridRequest = {
        pageNumber: gridState.pagination.pageNumber,
        pageSize: gridState.pagination.pageSize,
        filterCollection: JSON.stringify([
          {
            propertyName: 'Id',
            propertyValue: params.id,
          },
        ]),
      };
      UIStore.setPageLoader(true);
      vendorLocationPhotoStore
        ?.getVendorLocationPhotos(request)
        .pipe(
          takeUntil(unsubscribe.destroy$),
          finalize(() => UIStore.setPageLoader(false))
        )
        .subscribe();
    };

    const isEditable = useUpsert.isEditable && vmsModuleSecurityV2.isEditable;

    const loadVendorLocationData = () => {
      UIStore.setPageLoader(true);
      vendorLocationStore
        ?.getVendorLocationById(params.id)
        .pipe(
          takeUntil(unsubscribe.destroy$),
          finalize(() => UIStore.setPageLoader(false))
        )
        .subscribe((response: VendorLocationModel) => {
          setSelectedVendorLocation(response);
        });
    };

    const otherFieldValidationRules = 'string|required|between:1,200';
    const setOtherFieldValue = resp => {
      resp.appliedInternationalDepartureProcedures.filter(item => {
        if (item.internationalDepartureProcedures.name.toLowerCase() === 'other') {
          setIsOtherFieldVisible(true);
          useUpsert.getField('otherValue').set(`${item.internationalDepartureProcedures.description}`);
          useUpsert.getField('otherValue').set('rules', otherFieldValidationRules);
          useUpsert.getField('otherValue').set('label', 'Other*');
        } else {
          setIsOtherFieldVisible(false);
          useUpsert.getField('otherValue').set('');
          useUpsert.getField('otherValue').set('rules', '');
          useUpsert.getField('otherValue').set('label', 'Other');
        }

        if (
          item.internationalDepartureProcedures?.name ===
            'Crew/pax will go to the specified location and proceed through customs/security on their own.' ||
          item.internationalDepartureProcedures?.name ===
            'Ground handling agent will greet them at the specified' +
              ' pickup location landside and assist with customs/security.'
        ) {
          setIsDepartureOtherFieldVisible(true);
          useUpsert
            .getField('departureProceduresOtherValue')
            .set(`${item.internationalDepartureProcedures.description}`);
          useUpsert.getField('departureProceduresOtherValue').set('rules', otherFieldValidationRules);
          useUpsert.getField('departureProceduresOtherValue').set('label', 'Departure Procedures Location*');
        } else {
          setIsDepartureOtherFieldVisible(false);
          useUpsert.getField('departureProceduresOtherValue').set('');
          useUpsert.getField('departureProceduresOtherValue').set('rules', otherFieldValidationRules);
          useUpsert.getField('departureProceduresOtherValue').set('label', 'Departure Procedures Location*');
        }
      });
    };

    const loadInitialData = () => {
      UIStore.setPageLoader(true);
      forkJoin([
        vendorLocationStore.getVendorLocationById(parseInt(params.id)),
        settingsStore.getSettings(SETTING_ID.SETTING_DRIVER_LOCATION_CREW, 'AppliedCrewLocationType'),
        settingsStore.getSettings(SETTING_ID.SETTING_DRIVER_LOCATION_PAX, 'AppliedPaxLocationType'),
        settingsStore.getSettings(SETTING_ID.SETTING_AMENITIES, 'AppliedAmenities'),
        settingsStore.getSettings(SETTING_ID.SETTING_AIRCRAFT_PARKING_OPTIONS, 'appliedAircraftParkingOptions'),
        settingsStore.getSettings(SETTING_ID.SETTING_AIRCRAFT_PARKING_DISTANCE_FBO, 'aircraftParkingDistanceFBO'),
        settingsStore.getSettings(SETTING_ID.SETTING_AIRCRAFT_SPOT_ACCOMMODATION, 'appliedAircraftSpotAccommodation'),
        settingsStore.getSettings(SETTING_ID.SETTING_TOWBAR_SCENARIOS, 'appliedTowbarScenarios'),
        settingsStore.getSettings(SETTING_ID.SETTING_AVAILABLE_FACILITIES, 'availableFacilities'),
        settingsStore.getSettings(SETTING_ID.SETTING_DISABILITY_ACCOMMODATIONS, 'disabilityAccommodations'),
        settingsStore.getSettings(
          SETTING_ID.SETTING_INTERNATIONAL_ARRIVAL_PROCEDURES,
          'internationalArrivalProcedures'
        ),
        settingsStore.getSettings(
          SETTING_ID.SETTING_INTERNATIONAL_DEPARTURE_PROCEDURES,
          'internationalDepartureProcedures'
        ),
        settingsStore.getSettings(
          SETTING_ID.SETTING_ARRIVAL_CREW_PAX_PASSPORT_HANDLING,
          'arrivalCrewPaxPassportHandling'
        ),
        settingsStore.getSettings(SETTING_ID.SETTING_LUGGAGE_HANDLING, 'luggageHandling'),
        settingsStore.getSettings(SETTING_ID.SETTING_HANGER_AVAILABLE_UOM, 'hangerAvailableUom'),

        settingsStore.getSettings(SETTING_ID.SETTING_DRIVER_LOCATION_CREW, 'AppliedDriverDropOffLocationTypeCrew'),
        settingsStore.getSettings(SETTING_ID.SETTING_DRIVER_LOCATION_PAX, 'AppliedDriverDropOffLocationTypePax'),

        vendorLocationStore.getCustomers(),
      ])
        .pipe(
          takeUntil(unsubscribe.destroy$),
          finalize(() => UIStore.setPageLoader(false))
        )
        .subscribe(
          (response: [LocationOperationalInsightsModel, VendorLocationModel, SettingBaseModel, CustomersModel]) => {
            if (response[0].operationalInsight === null) {
              useUpsert.setFormValues(new LocationOperationalInsightsModel());
              setFormValues(response[0]);
            } else {
              useUpsert.setFormValues(response[0].operationalInsight);
              setFormValues(response[0].operationalInsight);
              setOtherFieldValue(response[0].operationalInsight);
            }
          }
        );
    };

    const formattedCoordinates = (latitude, longitude) => {
      return `${latitude === null ? 0 : latitude}, ${longitude === null ? 0 : longitude}`;
    };

    const setFormValues = response => {
      if (response.isOvertimeAvailable === true) {
        vendorLocationStore.isLeadOvertimeRequired = true;
        useUpsert
          .getField('leadTimeForOvertime')
          .set('label', 'How far in advance does overtime need to be requested ?*');
        useUpsert.getField('isOvertimeAvailable').set(
          SettingBaseModel.deserialize({
            id: 1,
            name: 'Yes',
          })
        );
      } else if (response.isOvertimeAvailable === false) {
        vendorLocationStore.isLeadOvertimeRequired = false;
        useUpsert
          .getField('leadTimeForOvertime')
          .set('label', 'How far in advance does overtime need to be requested ?');
        useUpsert.getField('isOvertimeAvailable').set(
          SettingBaseModel.deserialize({
            id: 2,
            name: 'No',
          })
        );
      } else if (response.isOvertimeAvailable === null) {
        vendorLocationStore.isLeadOvertimeRequired = false;
        useUpsert
          .getField('leadTimeForOvertime')
          .set('label', 'How far in advance does overtime need to be requested ?');
        useUpsert.getField('isOvertimeAvailable').set(null);
      }
      useUpsert
        .getField('crewLatitudeLongitude')
        .set(formattedCoordinates(response.crewLatitude, response.crewLongitude));
      useUpsert.getField('paxLatitudeLongitude').set(formattedCoordinates(response.paxLatitude, response.paxLongitude));
      useUpsert
        .getField('aircraftParkingOptionLatitudeLongitude')
        .set(formattedCoordinates(response.aircraftParkingOptionLatitude, response.aircraftParkingOptionLongitude));
      useUpsert
        .getField('aircraftHandlingLocationLatitudeLongitude')
        .set(
          formattedCoordinates(response.aircraftHandlingLocationLatitude, response.aircraftHandlingLocationLongitude)
        );
      useUpsert
        .getField('driverDropOffLocationLatitudeLongitudeCrew')
        .set(formattedCoordinates(response.driverDropOffLocationLatCrew, response.driverDropOffLocationLonCrew));
      useUpsert
        .getField('driverDropOffLocationLatitudeLongitudePax')
        .set(formattedCoordinates(response.driverDropOffLocationLatPax, response.driverDropOffLocationLonPax));
    };

    const errorHandler = (errors: object, id): void => {
      Object.values(errors)?.forEach(errorMessage => useUpsert.showAlert(errorMessage[0], id));
    };

    const getFieldValue = (fieldKey, index) => {
      const fieldValue = useUpsert.getField(fieldKey)?.value;
      const coordinatesArray = fieldValue && fieldValue?.split(',').map(parseFloat);
      return coordinatesArray[index];
    };

    const upsertVendorLocationOperationalInsights = (): void => {
      const request = new LocationOperationalInsightsModel({
        ...useUpsert.form.values(),
        isOvertimeAvailable:
          useUpsert.getField('isOvertimeAvailable').value?.id === 1
            ? true
            : useUpsert.getField('isOvertimeAvailable').value?.id === 2
              ? false
              : null,
      });
      request.crewLatitude = getFieldValue('crewLatitudeLongitude', 0);
      request.crewLongitude = getFieldValue('crewLatitudeLongitude', 1);
      request.paxLatitude = getFieldValue('paxLatitudeLongitude', 0);
      request.paxLongitude = getFieldValue('paxLatitudeLongitude', 1);
      request.aircraftParkingOptionLatitude = getFieldValue('aircraftParkingOptionLatitudeLongitude', 0);
      request.aircraftParkingOptionLongitude = getFieldValue('aircraftParkingOptionLatitudeLongitude', 1);
      request.aircraftHandlingLocationLatitude = getFieldValue('aircraftHandlingLocationLatitudeLongitude', 0);
      request.aircraftHandlingLocationLongitude = getFieldValue('aircraftHandlingLocationLatitudeLongitude', 1);

      request.driverDropOffLocationLatCrew = getFieldValue('driverDropOffLocationLatitudeLongitudeCrew', 0);
      request.driverDropOffLocationLonCrew = getFieldValue('driverDropOffLocationLatitudeLongitudeCrew', 1);
      request.driverDropOffLocationLatPax = getFieldValue('driverDropOffLocationLatitudeLongitudePax', 0);
      request.driverDropOffLocationLonPax = getFieldValue('driverDropOffLocationLatitudeLongitudePax', 1);
      UIStore.setPageLoader(true);
      operationalInsightsStore
        ?.upsertVendorLocationOperationalInsights(request.serialize(parseInt(params.id)))
        .pipe(
          takeUntil(unsubscribe.destroy$),
          finalize(() => UIStore.setPageLoader(false))
        )
        .subscribe({
          next: (response: LocationOperationalInsightsModel) => {
            useUpsert.form.reset();
            useUpsert.setFormValues(response);
            setFormValues(response);
            setOtherFieldValue(response);
            if (!request.id) {
              useUpsert.resetFormValidations(response, () => {
                navigate(
                  params.operationCode === 'upsert'
                    ? `/vendor-management/vendor-location/upsert/${params.vendorId}/${
                      response.vendorLocationId
                    }/${VIEW_MODE.EDIT.toLocaleLowerCase()}/vendor-location-operational-insights`
                    : `/vendor-management/vendor-location/${params.operationCode}/${params.vendorId}/${
                      response.vendorLocationId
                    }/${VIEW_MODE.EDIT.toLocaleLowerCase()}/vendor-location-operational-insights`
                );
              });
            }
          },
          error: error => {
            if (error.response.data.errors) {
              errorHandler(error.response.data.errors, request.id.toString());
              return;
            }
            useUpsert.showAlert(error?.message, request.id);
          },
        });
    };

    const onValueChange = (value: IOptionValue, fieldKey: string): void => {
      useUpsert.getField(fieldKey).set(value);
      switch (fieldKey) {
        case 'appliedInternationalDepartureProcedures':
          if (value?.length === 0) {
            setIsOtherFieldVisible(false);
            setIsDepartureOtherFieldVisible(false);
            useUpsert.getField('otherValue').set('');
            useUpsert.getField('departureProceduresOtherValue').set('');
            useUpsert.getField('otherValue').set('rules', '');
            useUpsert.getField('departureProceduresOtherValue').set('rules', '');
            return;
          }
          const firstTwoValues = Array.isArray(value)
            ? value.map(item => item?.internationalDepartureProcedures?.name)
            : [];
          (value as any[]).filter(item => {
            const isOtherOptionAvailable = Array.isArray(value)
              ? value.map(item => item?.internationalDepartureProcedures?.name?.toLocaleLowerCase())
              : [];
            if (isOtherOptionAvailable.includes('other')) {
              setIsOtherFieldVisible(true);
              if (!useUpsert.getField('otherValue')?.value) {
                useUpsert.getField('otherValue').set(`${item.internationalDepartureProcedures.description}`);
              }
              useUpsert.getField('otherValue').set('rules', otherFieldValidationRules);
              useUpsert.getField('otherValue').set('label', 'Other*');
            } else {
              setIsOtherFieldVisible(false);
              useUpsert.getField('otherValue').set('');
              useUpsert.getField('otherValue').set('rules', '');
              useUpsert.getField('otherValue').set('label', 'Other');
            }
            console.log(item.internationalDepartureProcedures);
            
            if (
              firstTwoValues.includes(
                'Crew/pax will go to the specified location and proceed through customs/security on their own.'
              ) ||
              firstTwoValues.includes(
                'Ground handling agent will greet them at the specified' +
                  ' pickup location landside and assist with customs/security.'
              )
            ) {
              setIsDepartureOtherFieldVisible(true);
              if (!useUpsert.getField('departureProceduresOtherValue')?.value) {
                useUpsert
                  .getField('departureProceduresOtherValue')
                  .set(`${item.internationalDepartureProcedures.description}`);
              }
              useUpsert.getField('departureProceduresOtherValue').set('rules', otherFieldValidationRules);
              useUpsert.getField('departureProceduresOtherValue').set('label', 'Departure Procedures Location*');
            } else {
              setIsDepartureOtherFieldVisible(false);
              useUpsert.getField('departureProceduresOtherValue').set('');
              useUpsert.getField('departureProceduresOtherValue').set('rules', '');
              useUpsert.getField('departureProceduresOtherValue').set('label', 'Departure Procedures Location');
            }
          });
          break;
        case 'isOvertimeAvailable':
          const leadOverTimeValue = useUpsert.getField('leadTimeForOvertime').value;
          if (value?.id === 1) {
            vendorLocationStore.isLeadOvertimeRequired = true;
            useUpsert
              .getField('leadTimeForOvertime')
              .set('label', 'How far in advance does overtime need to be requested ?*');
            if (!leadOverTimeValue) {
              vendorLocationStore.leadOvertimeValidate =
                'This How far in advance does overtime need to be requested ?* is required';
            } else {
              vendorLocationStore.leadOvertimeValidate = '';
              vendorLocationStore.isLeadOvertimeRequired = false;
            }
          } else {
            vendorLocationStore.isLeadOvertimeRequired = false;
            useUpsert
              .getField('leadTimeForOvertime')
              .set('label', 'How far in advance does overtime need to be requested ?');
            vendorLocationStore.leadOvertimeValidate = '';
          }
          break;
        case 'leadTimeForOvertime':
          if (vendorLocationStore.isLeadOvertimeRequired) {
            if (!value) {
              vendorLocationStore.leadOvertimeValidate =
                'This How far in advance does overtime need to be requested ?* is required';
            } else {
              vendorLocationStore.leadOvertimeValidate = '';
            }
          }
          break;
        default:
          break;
      }
    };

    const onSearch = (searchValue: string, fieldKey: string): void => {
      switch (fieldKey) {
        case '':
          break;
        default:
          break;
      }
      return;
    };

    const onMarkerDragEnd = (letlng: any, fieldKey) => {
      setLatitude(letlng.lat);
      setLongitude(letlng.lng);
      useUpsert.getField(fieldKey)?.set(`${letlng.lng}, ${letlng.lat}`);
      setMapValueChanged(true);
    };

    const openMapViewDialogue = fieldKey => {
      const fieldValue = useUpsert.getField(fieldKey)?.value;
      const fieldLabel = useUpsert.getField(fieldKey)?.label;
      const coordinatesArray = fieldValue && fieldValue?.split(',').map(parseFloat);
      ModalStore.open(
        <Dialog
          title={fieldLabel}
          open={true}
          onClose={() => ModalStore.close()}
          dialogContent={() => (
            <MapBoxViewV1
              onMarkerDragEnd={data => onMarkerDragEnd(data, fieldKey)}
              value={coordinatesArray ? coordinatesArray : [ 28.853220553990308, 53.12500655651093 ]}
            />
          )}
        />
      );
    };

    const openMapIcon = (fieldKey): ReactNode => {
      return <LocationOn onClick={() => openMapViewDialogue(fieldKey)} className={classes.buttonStyle} />;
    };

    const groupInputControls = (): IGroupInputControls[] => {
      return [
        {
          title: 'Operational Insights:',
          inputControls: [
            {
              fieldKey: 'id',
              type: EDITOR_TYPES.TEXT_FIELD,
              isHidden: true,
            },
            {
              fieldKey: 'customsClearanceFBO',
              type: EDITOR_TYPES.SELECT_CONTROL,
              showLabel: true,
              isBoolean: true,
              excludeEmptyOption: true,
            },
            {
              fieldKey: 'crewLatitudeLongitude',
              type: EDITOR_TYPES.TEXT_FIELD,
              endAdormentValue: openMapIcon('crewLatitudeLongitude'),
              isReadOnly: true,
            },
            {
              fieldKey: 'paxLatitudeLongitude',
              type: EDITOR_TYPES.TEXT_FIELD,
              endAdormentValue: openMapIcon('paxLatitudeLongitude'),
              isReadOnly: true,
            },
            {
              fieldKey: 'appliedCrewLocationType',
              type: EDITOR_TYPES.DROPDOWN,
              options: operationalInsightsStore.getOperationalInsightsSettingOptions<SettingBaseModel>(
                settingsStore?.pickupLocationCrew,
                'crewLocationType'
              ),
              multiple: true,
            },
            {
              fieldKey: 'appliedPaxLocationType',
              type: EDITOR_TYPES.DROPDOWN,
              options: operationalInsightsStore.getOperationalInsightsSettingOptions<SettingBaseModel>(
                settingsStore?.pickupLocationPax,
                'paxLocationType'
              ),
              multiple: true,
            },
            {
              fieldKey: 'aircraftParkingOptionLatitudeLongitude',
              type: EDITOR_TYPES.TEXT_FIELD,
              endAdormentValue: openMapIcon('aircraftParkingOptionLatitudeLongitude'),
              isReadOnly: true,
            },
            {
              fieldKey: 'aircraftHandlingLocationLatitudeLongitude',
              type: EDITOR_TYPES.TEXT_FIELD,
              endAdormentValue: openMapIcon('aircraftHandlingLocationLatitudeLongitude'),
              isReadOnly: true,
            },
            {
              fieldKey: 'agentFeesApply',
              type: EDITOR_TYPES.SELECT_CONTROL,
              showLabel: true,
              isBoolean: true,
              excludeEmptyOption: true,
            },
            {
              fieldKey: 'appliedAmenities',
              type: EDITOR_TYPES.DROPDOWN,
              options: operationalInsightsStore.getOperationalInsightsSettingOptions<SettingBaseModel>(
                settingsStore?.amenities,
                'amenities'
              ),
              multiple: true,
            },
            {
              fieldKey: 'aircraftParkingField',
              type: EDITOR_TYPES.TEXT_FIELD,
            },
            {
              fieldKey: 'appliedAircraftParkingOptions',
              type: EDITOR_TYPES.DROPDOWN,
              options: operationalInsightsStore.getOperationalInsightsSettingOptions<SettingBaseModel>(
                settingsStore?.aircraftParkingOptions,
                'aircraftParkingOptions'
              ),
              multiple: true,
            },
            {
              fieldKey: 'aircraftParkingDistanceFBO',
              type: EDITOR_TYPES.DROPDOWN,
              options: settingsStore?.aircraftParkingDistanceFBO,
            },
            {
              fieldKey: 'appliedAircraftSpotAccommodation',
              type: EDITOR_TYPES.DROPDOWN,
              options: operationalInsightsStore.getOperationalInsightsSettingOptions<SettingBaseModel>(
                settingsStore?.aircraftSpotAccommodation,
                'aircraftSpotAccommodation'
              ),
              multiple: true,
            },
            {
              fieldKey: 'hangarAvailable',
              type: EDITOR_TYPES.SELECT_CONTROL,
              showLabel: true,
              isBoolean: true,
              excludeEmptyOption: true,
            },
            {
              fieldKey: 'hangarAvailableSpace',
              type: EDITOR_TYPES.TEXT_FIELD,
            },
            {
              fieldKey: 'hangerAvailableUom',
              type: EDITOR_TYPES.DROPDOWN,
              options: settingsStore?.hangerAvailableUom,
            },
            {
              fieldKey: 'towbarRequired',
              type: EDITOR_TYPES.DROPDOWN,
              options: LocationOperationalInsightsModel.getYesNoSometimes(),
            },
            {
              fieldKey: 'appliedTowbarScenarios',
              type: EDITOR_TYPES.DROPDOWN,
              options: operationalInsightsStore.getOperationalInsightsSettingOptions<SettingBaseModel>(
                settingsStore?.towbarScenarios,
                'towbarScenarios'
              ),
              multiple: true,
            },
            {
              fieldKey: 'towbarRequirement',
              type: EDITOR_TYPES.TEXT_FIELD,
            },
            {
              fieldKey: 'appliedAvailableFacilities',
              type: EDITOR_TYPES.DROPDOWN,
              options: operationalInsightsStore.getOperationalInsightsSettingOptions<SettingBaseModel>(
                settingsStore?.availableFacilities,
                'availableFacilities'
              ),
              multiple: true,
            },
            {
              fieldKey: 'appliedInternationalArrivalProcedures',
              type: EDITOR_TYPES.DROPDOWN,
              options: operationalInsightsStore.getOperationalInsightsSettingOptions<SettingBaseModel>(
                settingsStore?.internationalArrivalProcedures,
                'internationalArrivalProcedures'
              ),
              multiple: true,
            },
            {
              fieldKey: 'domesticArrivalProcedures',
              type: EDITOR_TYPES.TEXT_FIELD,
            },
            {
              fieldKey: 'appliedInternationalDepartureProcedures',
              // type: EDITOR_TYPES.TEXT_FIELD,
              type: EDITOR_TYPES.DROPDOWN,
              options: operationalInsightsStore.getOperationalInsightsSettingOptions<SettingBaseModel>(
                settingsStore?.internationalDepartureProcedures,
                'internationalDepartureProcedures'
              ),
              multiple: true,
            },
            {
              fieldKey: 'otherValue',
              type: EDITOR_TYPES.TEXT_FIELD,
              isDisabled: !isOtherFieldVisible,
            },
            {
              fieldKey: 'departureProceduresOtherValue',
              type: EDITOR_TYPES.TEXT_FIELD,
              isDisabled: !isDepartureOtherFieldVisible,
            },
            {
              fieldKey: 'domesticDepartureProcedures',
              type: EDITOR_TYPES.TEXT_FIELD,
            },
            {
              fieldKey: 'appliedDisabilityAccommodation',
              type: EDITOR_TYPES.DROPDOWN,
              options: operationalInsightsStore.getOperationalInsightsSettingOptions<SettingBaseModel>(
                settingsStore?.disabilityAccommodations,
                'disabilityAccommodations'
              ),
              multiple: true,
            },
            {
              fieldKey: 'arrivalCrewPaxPassportHandling',
              type: EDITOR_TYPES.DROPDOWN,
              options: settingsStore?.arrivalCrewPaxPassportHandling,
            },
            {
              fieldKey: 'luggageHandling',
              type: EDITOR_TYPES.DROPDOWN,
              options: settingsStore?.luggageHandling,
            },
            {
              fieldKey: 'arrivalMeetingPoint',
              type: EDITOR_TYPES.TEXT_FIELD,
            },
            {
              fieldKey: 'earlyCrewArrival',
              type: EDITOR_TYPES.TEXT_FIELD,
            },
            {
              fieldKey: 'earlyPaxArrival',
              type: EDITOR_TYPES.TEXT_FIELD,
            },
            {
              fieldKey: 'customsClearanceTiming',
              type: EDITOR_TYPES.TEXT_FIELD,
            },
            {
              fieldKey: 'driverDropOffLocationLatitudeLongitudeCrew',
              type: EDITOR_TYPES.TEXT_FIELD,
              endAdormentValue: openMapIcon('driverDropOffLocationLatitudeLongitudeCrew'),
              isReadOnly: true,
            },
            {
              fieldKey: 'driverDropOffLocationLatitudeLongitudePax',
              type: EDITOR_TYPES.TEXT_FIELD,
              endAdormentValue: openMapIcon('driverDropOffLocationLatitudeLongitudePax'),
              isReadOnly: true,
            },
            {
              fieldKey: 'transportationAdditionalInfo',
              type: EDITOR_TYPES.TEXT_FIELD,
            },
            {
              fieldKey: 'appliedDriverDropOffLocationTypeCrew',
              type: EDITOR_TYPES.DROPDOWN,
              options: operationalInsightsStore.getOperationalInsightsSettingOptions<SettingBaseModel>(
                settingsStore?.pickupLocationCrew,
                'driverDropOffLocationTypeCrew'
              ),
              multiple: true,
            },
            {
              fieldKey: 'appliedDriverDropOffLocationTypePax',
              type: EDITOR_TYPES.DROPDOWN,
              options: operationalInsightsStore.getOperationalInsightsSettingOptions<SettingBaseModel>(
                settingsStore?.pickupLocationPax,
                'driverDropOffLocationTypePax'
              ),
              multiple: true,
            },
            {
              fieldKey: 'isOvertimeAvailable',
              type: EDITOR_TYPES.DROPDOWN,
              options: LocationOperationalInsightsModel.getYesNo(),
            },
            {
              fieldKey: 'leadTimeForOvertime',
              type: EDITOR_TYPES.TEXT_FIELD,
              customErrorMessage: vendorLocationStore.leadOvertimeValidate,
            },
          ],
        },
      ];
    };

    const headerActions = (): ReactNode => {
      return (
        <>
          <DetailsEditorHeaderSection
            title={<CustomTooltip title={selectedVendorLocation?.label} />}
            backNavTitle="Vendor Location"
            hideActionButtons={false}
            backNavLink={vendorLocationStore.getVendorLocationBackNavLink(params)}
            disableActions={
              mapValueChanged
                ? !mapValueChanged
                : !formRef.isValid || !formRef.changed || formRef.hasError || vendorLocationStore.leadOvertimeValidate
            }
            isEditMode={isEditable}
            hasEditPermission={vmsModuleSecurityV2.isEditable}
            onAction={action => onAction(action)}
            showStatusButton={false}
            isActive={true}
          />
        </>
      );
    };

    const onAction = (action: GRID_ACTIONS): void => {
      switch (action) {
        case GRID_ACTIONS.EDIT:
          const redirectUrl =
            params.operationCode === 'upsert'
              ? `/vendor-management/vendor-location/upsert/${params.vendorId}/${params.id}/edit/vendor-location-operational-insights`
              : `/vendor-management/vendor-location/${params.operationCode}/${params.vendorId}/${params.id}/edit`;
          navigate(redirectUrl);
          useUpsert.setViewMode(VIEW_MODE.EDIT);
          break;
        case GRID_ACTIONS.SAVE:
          upsertVendorLocationOperationalInsights();
          setMapValueChanged(false);
          break;
        default:
          navigate(
            params.operationCode === 'upsert'
              ? '/vendor-management/vendor-location'
              : `/vendor-management/upsert/${params.vendorId}/${params.operationCode}/edit/vendor-location`
          );
          break;
      }
    };

    const onFocus = (fieldKey: string): void => {
      switch (fieldKey) {
        case '':
          break;
        default:
          break;
      }
    };

    const downloadFile = data => {
      UIStore.setPageLoader(true);
      vendorLocationPhotoStore
        ?.downloadVendorLocationPhoto(parseInt(params.id), data.photoUri, data.id)
        .pipe(
          takeUntil(unsubscribe.destroy$),
          finalize(() => {
            UIStore.setPageLoader(false);
          })
        )
        .subscribe({
          next: (response: IAPIDownloadPhotoFile) => {
            const link = document.createElement('a');
            link.href = response?.photoUri;
            link.target = '_blank';
            link.download = data.photoUri;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          },
          error: error => {
            BaseStore.showAlert(`Error Downloading ${error.message}`, 0);
          },
        });
    };

    const deleteLocationPhoto = (item: VendorLocationPhotosModel): void => {
      UIStore.setPageLoader(true);
      const request = new VendorLocationPhotosModel({
        ...item,
        id: item.id,
        vendorLocationId: params.id,
        photoUri: item.photoUri,
        statusId: 2,
      });
      vendorLocationPhotoStore
        ?.deleteLocationPhoto(request.serialize())
        .pipe(
          takeUntil(unsubscribe.destroy$),
          finalize(() => {
            UIStore.setPageLoader(false);
            ModalStore.close();
          })
        )
        .subscribe({
          next: (response: VendorLocationPhotosModel) => {
            loadLocationPhotos();
          },
          error: error => {
            if (error?.response?.data?.errors) {
              errorHandler(error.response.data.errors, request.id.toString());
              return;
            }
            BaseStore.showAlert(error?.message, request.id);
          },
        });
    };

    const upsertLocationPhotos = (photoUri: string, photoName: string): void => {
      UIStore.setPageLoader(true);
      const request = new VendorLocationPhotosModel({
        id: 0,
        vendorLocationId: params.id,
        photoUri: photoUri,
        fileName: photoName,
        statusId: 1,
      });
      vendorLocationPhotoStore
        ?.upsertLocationPhoto([ request.serialize() ])
        .pipe(
          takeUntil(unsubscribe.destroy$),
          finalize(() => {
            UIStore.setPageLoader(false);
            ModalStore.close();
          })
        )
        .subscribe({
          next: (response: VendorLocationPhotosModel) => {
            vendorLocationPhotoStore.photoUri = null;
            vendorLocationPhotoStore.file = null;
            ModalStore.close();
            loadLocationPhotos();
          },
          error: error => {
            if (error?.response?.data?.errors) {
              errorHandler(error.response.data.errors, request.id.toString());
              return;
            }
            BaseStore.showAlert(error?.message, request.id);
          },
        });
    };

    const getConfirmation = (item: VendorLocationPhotosModel): void => {
      ModalStore.open(
        <ConfirmDialog
          title="Remove this Photo"
          message={'Are you sure you want to remove this Photo?'}
          noButton="Cancel"
          yesButton="Confirm"
          onNoClick={() => ModalStore.close()}
          onYesClick={() => deleteLocationPhoto(item)}
        />
      );
    };

    const uploadDocumentFile = (): void => {
      UIStore.setPageLoader(true);
      progressLoader.setLoadingState(true);
      vendorLocationPhotoStore
        ?.uploadPhotos(vendorLocationPhotoStore.file[0], params.id)
        .pipe(
          takeUntil(unsubscribe.destroy$),
          finalize(() => {
            UIStore.setPageLoader(false);
            progressLoader.setLoadingState(false);
          })
        )
        .subscribe({
          next: (response: IAPIPhotoFile) => {
            if (response) {
              vendorLocationPhotoStore.photoUri = response.results[0].photoUri;
              const photoName = response.results[0]?.fileName || 'Unknown';
              upsertLocationPhotos(vendorLocationPhotoStore.photoUri, photoName);
            }
          },
          error: error => {
            BaseStore.showAlert(`Records imported with errors ${error.message}`, 0);
          },
        });
    };

    const openUploadPhotoModal = (): void => {
      ModalStore.open(
        <UploadDocumentFile
          fileType=".jpg, .jpeg, .png"
          title="Upload Photo"
          uploadDocumentFile={() => uploadDocumentFile()}
          loader={progressLoader}
          documentUploadStore={vendorLocationPhotoStore}
        />
      );
    };

    return (
      <>
        <ConfirmNavigate isBlocker={formRef.changed || mapValueChanged}>
          <DetailsEditorWrapper
            headerActions={headerActions()}
            isEditMode={isEditable}
            classes={{ headerActions: classes.headerActions }}
          >
            <div className={classes.editorWrapperContainer}>
              <ViewInputControls
                isEditable={isEditable}
                groupInputControls={groupInputControls()}
                onGetField={(fieldKey: string) => useUpsert.getField(fieldKey)}
                onValueChange={(option, fieldKey) => onValueChange(option, fieldKey)}
                field={fieldKey => useUpsert.getField(fieldKey)}
                onSearch={(searchValue: string, fieldKey: string) => onSearch(searchValue, fieldKey)}
                onFocus={fieldKey => onFocus(fieldKey)}
              />
              <Box className={classes.uploadPhotos}>
                <Typography className={classes.radioLabel}>Upload Photos</Typography>
                <div className={`${classes.primaryButton} ${classes.customButton}`}>
                  <PrimaryButton
                    variant="outlined"
                    color="primary"
                    className={classes.primaryButton}
                    startIcon={<UploadIcon />}
                    onClick={openUploadPhotoModal}
                  >
                    Upload
                  </PrimaryButton>
                </div>
                <Box className={classes.uploadedFileBox}>
                  {vendorLocationPhotoStore.vendorLocationPhotos?.map((photos, index) => (
                    <Box key={photos.id || index} className={classes.fileBox}>
                      <Box className={classes.innerFileBox}>
                        <PrimaryButton variant="text" onClick={() => downloadFile(photos)}>
                          <DownloadIcon />
                        </PrimaryButton>
                        <Typography>{photos?.fileName || 'Unknown'}</Typography>
                      </Box>
                      <Box className={classes.fileSizeBox}>
                        <IconButton
                          onClick={() => {
                            getConfirmation(photos);
                          }}
                        >
                          <CloseIcon />
                        </IconButton>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            </div>
          </DetailsEditorWrapper>
        </ConfirmNavigate>
      </>
    );
  }
);
export default inject(
  'settingsStore',
  'vendorLocationStore',
  'vendorLocationPhotoStore',
  'operationalInsightsStore'
)(LocationOperationalInsights);
