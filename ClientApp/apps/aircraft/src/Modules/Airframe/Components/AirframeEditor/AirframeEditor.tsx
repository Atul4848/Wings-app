import React, { FC, ReactNode, useEffect, useState } from 'react';
import { VIEW_MODE, ModelStatusOptions, useBaseUpsertComponent, BaseCustomerStore } from '@wings/shared';
import {
  EDITOR_TYPES,
  ViewInputControl,
  AuditFields,
  ChipViewInputControl,
  IViewInputControl,
  IGroupInputControls,
  IPagination,
} from '@wings-shared/form-controls';
import { inject, observer } from 'mobx-react';
import { fields } from './Fields';
import { useStyles } from './AirframeEditor.style';
import {
  SettingsStore,
  AirframeModel,
  AirframeStore,
  AircraftVariationStore,
  PerformanceStore,
  AircraftVariationModel,
  AircraftCollapsable,
  useAircraftModuleSecurity,
  EngineSerialNumberModel,
  AirframeRegistryModel,
} from '../../../Shared';
import { finalize, map, switchMap, takeUntil } from 'rxjs/operators';
import { useNavigate, useParams } from 'react-router';
import { ArrowBack, Cached } from '@material-ui/icons';
import { Observable, of, forkJoin } from 'rxjs';
import { IconButton } from '@material-ui/core';
import classNames from 'classnames';
import { AlertStore } from '@uvgo-shared/alert';
import { SelectVariationView, VariationSearchDialog } from '../index';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import { Dialog } from '@uvgo-shared/dialog';
import { AircraftVariationEditor } from '../../../AircraftVariation';
import {
  Utilities,
  UIStore,
  IAPIGridRequest,
  IOptionValue,
  SelectOption,
  GRID_ACTIONS,
  baseEntitySearchFilters,
  IdNameCodeModel,
  EntityMapModel,
  tapWithAction,
  ViewPermission,
} from '@wings-shared/core';
import {
  Collapsable,
  CollapsibleWithButton,
  CustomLinkButton,
  DetailsEditorWrapper,
  EditSaveButtons,
  SidebarStore,
} from '@wings-shared/layout';
import { useUnsubscribe } from '@wings-shared/hooks';
import AirframeEngineGrid from './AirframeEngineGrid';
import AirframeRegistryGrid from './AirframeRegistryGrid';

interface Props {
  airframeStore?: AirframeStore;
  settingsStore?: SettingsStore;
  aircraftVariationStore?: AircraftVariationStore;
  performanceStore?: PerformanceStore;
  customerStore?: BaseCustomerStore;
  sidebarStore?: typeof SidebarStore;
}

const AirframeEditor: FC<Props> = ({ ...props }) => {
  const params = useParams();
  const unsubscribe = useUnsubscribe();
  const useUpsert = useBaseUpsertComponent<AirframeModel>(params, fields, baseEntitySearchFilters);
  const navigate = useNavigate();
  const classes = useStyles();
  const _airframeStore = props.airframeStore as AirframeStore;
  const _settingsStore = props.settingsStore as SettingsStore;
  const _aircraftVariationStore = props.aircraftVariationStore as AircraftVariationStore;
  const _performanceStore = props.performanceStore as PerformanceStore;
  const _customerStore = props.customerStore as BaseCustomerStore;
  const verificationOptions = [
    new SelectOption({ name: 'Yes', value: true }),
    new SelectOption({ name: 'No', value: false }),
  ];
  const [ airframe, setAirframe ] = useState(new AirframeModel({ id: 0 }));
  const [ aircraftNationalities, setAircraftNationalities ] = useState<IdNameCodeModel[]>([]);
  const [ uplinkVendors, setUplinkVendors ] = useState<EntityMapModel[]>([]);
  const [ cateringHeatingElements, setCateringHeatingElements ] = useState<EntityMapModel[]>([]);
  const [ editingGrid, setEditingGrid ] = useState<string[]>([]);
  const [ isDataUpdated, setDataUpdate ] = useState(false);
  const aircraftModuleSecurity = useAircraftModuleSecurity();

  /* istanbul ignore next */
  useEffect(() => {
    useUpsert.setViewMode((params.mode?.toUpperCase() as VIEW_MODE) || VIEW_MODE.DETAILS);
    loadInitialData();
    return () => {
      _customerStore.registries = [];
    };
  }, []);

  const loadInitialData = () => {
    UIStore.setPageLoader(true);
    const req: IAPIGridRequest = {
      pageSize: 0,
      specifiedFields: [ 'AirframeId', 'SerialNumber', 'AirframeRegistries' ],
    };
    forkJoin([ getAirframById(), _airframeStore.getAirframesNoSQL(req) ])
      .pipe(
        switchMap(([ airframe ]) => {
          if (airframe.aircraftVariation?.id) {
            const request: IAPIGridRequest = {
              filterCollection: JSON.stringify([
                { propertyName: 'AircraftVariationId', propertyValue: airframe.aircraftVariation?.id },
              ]),
            };
            return _aircraftVariationStore
              .getAircraftVariationById(request)
              .pipe(map(aircraftVariation => new AirframeModel({ ...airframe, aircraftVariation })));
          }
          return of(airframe);
        }),
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(airframe => {
        setAirframe(airframe);
        useUpsert.setFormValues(airframe);
      });
  };

  /* istanbul ignore next */
  const getAirframById = (): Observable<AirframeModel> => {
    if (!Number(params.id)) {
      return of(airframe);
    }
    return _airframeStore.getAirframById(Number(params.id));
  };

  const getUpdatedModel = (): AirframeModel => {
    return new AirframeModel({
      ...airframe,
      ...useUpsert.form.values(),
    });
  };

  /* istanbul ignore next */
  const isAlreadyExists = (airframe: AirframeModel): boolean => {
    return _airframeStore.airframes.some(
      x => Utilities.isEqual(x.serialNumber, airframe.serialNumber) && !Utilities.isEqual(x.id, airframe.id)
    );
  };

  const isEngineDetailsExist = (airframe: AirframeModel): boolean => {
    const { engineSerialNumbers, aircraftVariation } = airframe;
    return engineSerialNumbers.length !== aircraftVariation?.numberOfEngines;
  };

  /* istanbul ignore next */
  const upsertAirframe = (): void => {
    const airframeData = getUpdatedModel();
    airframeData.airframeRegistries = airframeData.airframeRegistries.map(({ id, ...rest }) => {
      return new AirframeRegistryModel({ id: Math.floor(id), ...rest });
    });

    if (isEngineDetailsExist(airframeData)) {
      useUpsert.showAlert(
        `Please enter the details of ${airframeData.aircraftVariation.numberOfEngines} engines`,
        'engineAlert'
      );
      return;
    }
    if (isAlreadyExists(airframeData)) {
      useUpsert.showAlert('Serial number should be unique', 'airframeAlert');
      return;
    }
    UIStore.setPageLoader(true);
    _airframeStore
      .upsertAirframe(airframeData)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (airframe: AirframeModel) => {
          useUpsert.form.reset();
          if (!airframeData.id) {
            navigate(`/aircraft/airframe/${airframe.id}/edit`, useUpsert.noBlocker);
          }
          if (airframe.aircraftVariation?.id) {
            const request: IAPIGridRequest = {
              filterCollection: JSON.stringify([
                { propertyName: 'AircraftVariationId', propertyValue: airframe.aircraftVariation?.id },
              ]),
            };
            _aircraftVariationStore.getAircraftVariationById(request).subscribe(aircraftVariation => {
              const updatedAirframe = { ...airframe, aircraftVariation: aircraftVariation } as AirframeModel;
              setAirframe(updatedAirframe);
              useUpsert.setFormValues(updatedAirframe);
            });
          }
        },
        error: error => AlertStore.critical(error.message),
      });
  };

  const updateRowEditing = (isEditing: boolean, girdName: string): void => {
    const _editingGrids = editingGrid.filter(a => !Utilities.isEqual(a, girdName));
    if (isEditing) {
      editingGrid.push(girdName);
      return;
    }
    setEditingGrid(_editingGrids);
  };

  const updateEngineSerialnfo = (engineSerialNumberInfo: EngineSerialNumberModel[]): void => {
    const formData = useUpsert.form.values();
    useUpsert.setFormValues({ ...formData, engineSerialNumbers: engineSerialNumberInfo });
    setDataUpdate(true);
  };

  const updateRegistryInfo = (registryInfo: AirframeRegistryModel[]): void => {
    const formData = useUpsert.form.values();
    useUpsert.setFormValues({ ...formData, airframeRegistries: registryInfo });
    setDataUpdate(true);
  };

  const onValueChange = (value: IOptionValue, fieldKey: string): void => {
    useUpsert.getField(fieldKey).onChange();
    useUpsert.getField(fieldKey).set(value);
  };

  const onCancel = (): void => {
    const viewMode = params.mode?.toUpperCase() || VIEW_MODE.DETAILS;
    if (!Utilities.isEqual(viewMode, VIEW_MODE.DETAILS)) {
      navigate('/aircraft/airframe');
      return;
    }
    useUpsert.setViewMode(VIEW_MODE.DETAILS);
    useUpsert.form.reset();
    useUpsert.setFormValues(airframe);
  };

  const onAction = (action: GRID_ACTIONS) => {
    switch (action) {
      case GRID_ACTIONS.EDIT:
        useUpsert.setViewMode(VIEW_MODE.EDIT);
        break;
      case GRID_ACTIONS.SAVE:
        upsertAirframe();
        break;
      case GRID_ACTIONS.CANCEL:
        onCancel();
        break;
    }
  };

  // Search Entity based on field value
  const onSearch = (searchValue: string, fieldKey: string, pagination?: IPagination): void => {
    if (![ 'aircraftNationality' ].includes(fieldKey)) return;
    if (searchValue.length < 2) return;

    if (fieldKey === 'aircraftNationality') {
      const request = {
        searchCollection: JSON.stringify([{ propertyName: 'CommonName', propertyValue: searchValue }]),
      };
      UIStore.setPageLoader(true);
      _settingsStore
        .getCountries(request)
        .pipe(
          takeUntil(unsubscribe.destroy$),
          finalize(() => UIStore.setPageLoader(false))
        )
        .subscribe(response => {
          const options = response.results.map(
            country => new IdNameCodeModel({ id: country.id, name: country.commonName, code: country.isO2Code })
          );

          setAircraftNationalities(options);
        });
      return;
    }
  };

  const onFocus = (fieldKey: string): void => {
    let observableOfType = of<any>([]);
    switch (fieldKey) {
      case 'noiseChapter':
        observableOfType = _settingsStore.getNoiseChapters();
        break;
      case 'airframeUplinkVendors':
        observableOfType = _settingsStore.getUplinkVendor().pipe(
          tapWithAction(res => {
            const options = res.map(x => new EntityMapModel({ ...x, id: 0, entityId: x.id }));
            setUplinkVendors(options);
          })
        );
        break;
      case 'airframeCateringHeatingElements':
        observableOfType = _settingsStore.getCateringHeatingElement().pipe(
          tapWithAction(res => {
            const options = res.map(x => new EntityMapModel({ ...x, id: 0, entityId: x.id }));
            setCateringHeatingElements(options);
          })
        );
        break;
      case 'acas':
        observableOfType = _settingsStore.getAcases();
        break;
      case 'outerMainGearWheelSpan':
        observableOfType = _settingsStore.getOuterMainGearWheelSpan();
        break;
      case 'weightUOM':
        observableOfType = _settingsStore.getWeightUOMs();
        break;
      case 'distanceUOM':
        observableOfType = _settingsStore.getDistanceUOMs();
        break;
      case 'airframeStatus':
        observableOfType = _settingsStore.getAirframeStatus();
        break;
      case 'sourceType':
        observableOfType = _settingsStore.getSourceTypes();
        break;
      default:
        observableOfType = of([]);
        break;
    }
    useUpsert.observeSearch(observableOfType);
  };

  const { engineSerialNumbers, airframeRegistries } = useUpsert.form.values();

  /* istanbul ignore next */
  const groupInputControls = (): IGroupInputControls[] => {
    return [
      {
        title: 'Airframe*',
        inputControls: [
          {
            fieldKey: 'serialNumber',
            type: EDITOR_TYPES.TEXT_FIELD,
            isFullFlex: true,
          },
          {
            fieldKey: 'manufactureDate',
            type: EDITOR_TYPES.DATE,
          },
          {
            fieldKey: 'aircraftNationality',
            type: EDITOR_TYPES.DROPDOWN,
            options: aircraftNationalities,
          },
          {
            fieldKey: 'airworthinessRecentDate',
            type: EDITOR_TYPES.DATE,
          },
          {
            fieldKey: 'airworthinessCertificateDate',
            type: EDITOR_TYPES.DATE,
            showTooltip: true,
          },
          {
            fieldKey: 'beacon406MHzELTId',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'airframeUplinkVendors',
            type: EDITOR_TYPES.DROPDOWN,
            multiple: true,
            options: uplinkVendors,
          },
          {
            fieldKey: 'airframeCateringHeatingElements',
            type: EDITOR_TYPES.DROPDOWN,
            multiple: true,
            options: cateringHeatingElements,
          },
          {
            fieldKey: 'acas',
            type: EDITOR_TYPES.DROPDOWN,
            options: _settingsStore.acases,
          },
          {
            fieldKey: 'airframeStatus',
            type: EDITOR_TYPES.DROPDOWN,
            options: _settingsStore.airframeStatus,
          },
          {
            fieldKey: 'isVerificationComplete',
            type: EDITOR_TYPES.DROPDOWN,
            options: verificationOptions,
          },
        ],
      },
      {
        title: 'Airframe Registry*',
        inputControls: [],
      },
      {
        title: 'Aircraft Variation',
        inputControls: [],
      },
      {
        title: 'Weights and Lengths',
        inputControls: [
          {
            fieldKey: 'airframeWeightAndLength.maxLandingWeight',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'airframeWeightAndLength.basicOperatingWeight',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'airframeWeightAndLength.bowCrewCount',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'airframeWeightAndLength.maxTakeOffWeight',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'airframeWeightAndLength.maxTakeOffFuel',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'airframeWeightAndLength.zeroFuelWeight',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'airframeWeightAndLength.weightUOM',
            type: EDITOR_TYPES.DROPDOWN,
            options: _settingsStore.weightUOMs,
          },
          {
            fieldKey: 'airframeWeightAndLength.aeroplaneReferenceFieldLength',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'airframeWeightAndLength.wingspan',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'airframeWeightAndLength.outerMainGearWheelSpan',
            type: EDITOR_TYPES.DROPDOWN,
            options: _settingsStore.outerMainGearWheelSpan,
          },
          {
            fieldKey: 'airframeWeightAndLength.distanceUOM',
            type: EDITOR_TYPES.DROPDOWN,
            options: _settingsStore.distanceUOMs,
          },
        ],
      },
      {
        title: 'Capability',
        inputControls: [
          {
            fieldKey: 'airframeCapability.minimumRunwayLengthInFeet',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'airframeCapability.rangeInNM',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'airframeCapability.rangeInMin',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'airframeCapability.cappsRange',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'airframeCapability.maxCrossWindInKnots',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'airframeCapability.maxTailWindInKnots',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
        ],
      },
      {
        title: 'Noise*',
        inputControls: [
          {
            fieldKey: 'airframeCapability.noiseChapter',
            type: EDITOR_TYPES.DROPDOWN,
            options: _settingsStore.noiseChapters,
          },
          {
            fieldKey: 'airframeCapability.qcNoise',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'airframeCapability.approachEPNDb',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'airframeCapability.flyoverEPNDb',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'airframeCapability.lateralEPNDb',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
        ],
      },
      {
        title: 'Seating Configuration*',
        inputControls: [
          {
            fieldKey: 'crewSeatCap',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'paxSeatCap',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'seatConfiguration',
            type: EDITOR_TYPES.LINK,
          },
        ],
      },
      {
        title: 'Tire Pressure',
        inputControls: [
          {
            fieldKey: 'tirePressureMain',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'tirePressureNose',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
        ],
      },
    ];
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
          <CustomLinkButton to="/aircraft/airframe" title="Airframe" startIcon={<ArrowBack />} />
        </ViewPermission>
        <EditSaveButtons
          disabled={disableAction()}
          hasEditPermission={aircraftModuleSecurity.isEditable}
          isEditMode={useUpsert.isEditable}
          onAction={onAction}
        />
      </>
    );
  };

  const systemDataFields = (): ReactNode => {
    return (
      <Collapsable title="System*" defaultExpanded={false}>
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
            onGetField={(fieldKey: string) => useUpsert.getField(fieldKey)}
            isNew={useUpsert.isAddNew}
          />
        </>
      </Collapsable>
    );
  };

  /* istanbul ignore next */
  const aircraftVariationDialogContent = (): ReactNode => {
    const { aircraftVariation } = useUpsert.form.values();
    return (
      <AircraftVariationEditor
        key="aircraftVariationDetail"
        settingsStore={_settingsStore}
        aircraftVariationStore={_aircraftVariationStore}
        performanceStore={_performanceStore}
        variationDetailId={aircraftVariation?.id}
        isModal={true}
      />
    );
  };

  /* istanbul ignore next */
  const showAircraftVariationDetail = (): void => {
    ModalStore.open(
      <Dialog
        key="Dialog"
        title={'Aircraft Variation'}
        open={true}
        classes={{
          paperSize: classes.paperSize,
        }}
        onClose={() => ModalStore.close()}
        dialogContent={aircraftVariationDialogContent}
      />
    );
  };

  /* istanbul ignore next */
  const refreshAircraftVariation = (): void => {
    const { aircraftVariation } = useUpsert.form.values();
    if (aircraftVariation?.id) {
      UIStore.setPageLoader(true);
      const request: IAPIGridRequest = {
        filterCollection: JSON.stringify([
          { propertyName: 'AircraftVariationId', propertyValue: aircraftVariation?.id },
        ]),
      };
      _aircraftVariationStore
        .getAircraftVariationById(request)
        .pipe(
          takeUntil(unsubscribe.destroy$),
          finalize(() => UIStore.setPageLoader(false))
        )
        .subscribe(aircraftVariation => {
          useUpsert.getField('aircraftVariation').set(aircraftVariation);
        });
    }
  };

  /* istanbul ignore next */
  const aircraftVariation = (): ReactNode => {
    const { aircraftVariation } = useUpsert.form.values();
    return (
      <div key="aircraftVariation">
        <CollapsibleWithButton
          defaultOpen={false}
          key="collapsableWithButton"
          titleVariant="h5"
          title="Aircraft Variation*"
          buttonText="Select Aircraft Variation"
          titleChildren={
            aircraftVariation?.id ? (
              <IconButton
                classes={{ root: classes.infoIcon }}
                onClick={event => {
                  event.stopPropagation();
                  showAircraftVariationDetail();
                }}
              >
                <InfoOutlinedIcon />
              </IconButton>
            ) : (
              <></>
            )
          }
          onButtonClick={() => {
            ModalStore.open(
              <VariationSearchDialog
                key="variationSearchDialog"
                onSelect={value => {
                  onValueChange(value, 'aircraftVariation');
                  ModalStore.close();
                }}
              />
            );
          }}
          isButtonDisabled={!useUpsert.isEditable || !aircraftModuleSecurity.isEditable}
        >
          <SelectVariationView
            key="selectVariationView"
            aircraftVariation={useUpsert.getField('aircraftVariation').value || new AircraftVariationModel()}
            isEditable={useUpsert.isEditable}
          />
        </CollapsibleWithButton>
      </div>
    );
  };

  const isAircraftVariationSelected = () => {
    return Boolean(useUpsert.form.values().aircraftVariation);
  };

  return (
    <DetailsEditorWrapper headerActions={headerActions()} isEditMode={useUpsert.isEditable}>
      <div className={classes.container}>
        {groupInputControls().map(({ title, inputControls }) => {
          if (Utilities.isEqual('Aircraft Variation', title)) {
            return aircraftVariation();
          }
          return (
            <AircraftCollapsable
              isWithButton={title === 'Airframe*'}
              classes={classes}
              key={title}
              title={title}
              onButtonClick={refreshAircraftVariation}
              customIconButton={<Cached color="primary" />}
              defaultExpanded={title === 'Airframe'}
            >
              <div className={classes.flexWrap}>
                {inputControls
                  .filter(inputControl => !inputControl.isHidden)
                  .map((inputControl: IViewInputControl, index: number) => {
                    if (inputControl.type === EDITOR_TYPES.CHIP_INPUT) {
                      return (
                        <ChipViewInputControl
                          key={index}
                          field={useUpsert.getField(inputControl.fieldKey || '')}
                          onChipAddOrRemove={option => useUpsert.getField(inputControl.fieldKey || '').set(option)}
                          isEditable={useUpsert.isEditable}
                          isLeftIndent={inputControl.isIndent}
                          customErrorMessage={inputControl.customErrorMessage}
                        />
                      );
                    }
                    return (
                      <ViewInputControl
                        {...inputControl}
                        key={index}
                        field={useUpsert.getField(inputControl.fieldKey || '')}
                        isEditable={useUpsert.isEditable}
                        classes={{
                          flexRow: classNames({
                            [classes.inputControl]: true,
                            [classes.fullFlex]: inputControl.isFullFlex,
                          }),
                          textInput: classNames({
                            [classes.textInput]: inputControl.isFullFlex,
                          }),
                        }}
                        onValueChange={(option, fieldKey) => onValueChange(option, inputControl.fieldKey || '')}
                        onFocus={onFocus}
                        onSearch={onSearch}
                      />
                    );
                  })}
                {title === 'Airframe Registry*' && (
                  <AirframeRegistryGrid
                    key={`engine-serial-${useUpsert.isEditable}`}
                    isEditable={useUpsert.isEditable || !useUpsert.isDetailView}
                    onDataSave={registryInfo => updateRegistryInfo(registryInfo)}
                    airframeRegistries={airframeRegistries}
                    onRowEditing={isEditing => updateRowEditing(isEditing, 'airframeRegistryGrid')}
                  />
                )}
                {title === 'Airframe*' && (
                  <AirframeEngineGrid
                    key={`engine-serial-${useUpsert.isEditable}`}
                    isEditable={(useUpsert.isEditable || !useUpsert.isDetailView) && isAircraftVariationSelected()}
                    engineSerialNumbers={engineSerialNumbers}
                    isEngineDetailsExist={isEngineDetailsExist(getUpdatedModel())}
                    onDataSave={engineInfo => updateEngineSerialnfo(engineInfo)}
                    onRowEditing={isEditing => updateRowEditing(isEditing, 'airframeEngineGrid')}
                  />
                )}
              </div>
            </AircraftCollapsable>
          );
        })}
        {systemDataFields()}
      </div>
    </DetailsEditorWrapper>
  );
};

export default inject(
  'airframeStore',
  'settingsStore',
  'aircraftVariationStore',
  'performanceStore',
  'sidebarStore',
  'customerStore'
)(observer(AirframeEditor));
