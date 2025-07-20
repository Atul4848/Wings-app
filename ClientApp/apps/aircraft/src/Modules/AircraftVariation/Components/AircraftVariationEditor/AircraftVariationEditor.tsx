import React, { FC, MouseEvent, ReactNode, useEffect, useState } from 'react';
import { Typography, IconButton } from '@material-ui/core';
import { VIEW_MODE, ModelStatusOptions, useBaseUpsertComponent } from '@wings/shared';
import {
  EDITOR_TYPES,
  ViewInputControl,
  AuditFields,
  IViewInputControl,
  IGroupInputControls,
} from '@wings-shared/form-controls';
import {
  Utilities,
  UIStore,
  IAPIGridRequest,
  IOptionValue,
  ViewPermission,
  SettingsTypeModel,
  GRID_ACTIONS,
  baseEntitySearchFilters,
} from '@wings-shared/core';
import { inject, observer } from 'mobx-react';
import { useStyles } from './AircraftVariation.styles';
import {
  AircraftVariationStore,
  AircraftVariationModel,
  PerformanceStore,
  SettingsStore,
  EngineTypeModel,
  SeriesModel,
  AircraftModel,
  SubCategoryModel,
  AircraftVariationPictureModel,
  PerformanceModel,
  AircraftCollapsable,
  updateAircraftSidebarOptions,
  useAircraftModuleSecurity,
  TypeDesignatorModel,
} from '../../../Shared';
import { finalize, switchMap, takeUntil } from 'rxjs/operators';
import { useNavigate, useParams } from 'react-router';
import { ArrowBack, Cached } from '@material-ui/icons';
import { AlertStore } from '@uvgo-shared/alert';
import { forkJoin, Observable, of } from 'rxjs';
import { fields } from './Fields';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import classNames from 'classnames';
import {
  Collapsable,
  CollapsibleWithButton,
  CustomLinkButton,
  DetailsEditorWrapper,
  EditSaveButtons,
  ImportDialog,
  SidebarStore,
} from '@wings-shared/layout';
import { useUnsubscribe } from '@wings-shared/hooks';

interface Props {
  aircraftVariationStore?: AircraftVariationStore;
  settingsStore?: SettingsStore;
  performanceStore?: PerformanceStore;
  isModal?: boolean;
  sidebarStore?: typeof SidebarStore;
  variationDetailId?: number;
}

const AircraftVariationEditor: FC<Props> = ({
  aircraftVariationStore,
  settingsStore,
  performanceStore,
  isModal,
  sidebarStore,
  ...props
}) => {
  const classes = useStyles();
  const navigate = useNavigate();
  const params = useParams();
  const unsubscribe = useUnsubscribe();
  const [ aircraftVariations, setAircraftVariation ] = useState(new AircraftVariationModel());
  const useUpsert = useBaseUpsertComponent<AircraftVariationModel>(params, fields, baseEntitySearchFilters);
  const _aircraftVariationStore = aircraftVariationStore as AircraftVariationStore;
  const _settingsStore = settingsStore as SettingsStore;
  const _performanceStore = performanceStore as PerformanceStore;
  const aircraftModuleSecurity = useAircraftModuleSecurity();

  const [ file, setFile ] = useState<File | null>(null);
  /* istanbul ignore next */
  useEffect(() => {
    useUpsert.setViewMode((params?.mode?.toUpperCase() as VIEW_MODE) || VIEW_MODE.DETAILS);
    if (!isModal) {
      sidebarStore?.setNavLinks(updateAircraftSidebarOptions('Aircraft Variation'), 'aircraft');
    }
    loadInitialData();
  }, []);

  const loadInitialData = () => {
    UIStore.setPageLoader(true);
    forkJoin([ loadAircraftVariationById(), _settingsStore.getAerodromeRefCodes() ])
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(([ response ]) => {
        useUpsert.setFormValues(response);
        setCappsRecordId();
        setCappsModel();
        setAircraftVariation(response);
      });
  };

  const cappsRecordId = (): string => {
    const { icaoTypeDesignator, make, model, series, engineType } = useUpsert.form.values();
    return [ icaoTypeDesignator?.label, make?.label, model?.label, series?.label, engineType?.label ]
      .filter(x => x)
      .join('_');
  };

  const cappsModel = (): string => {
    const { popularNames, otherNames, stcManufactures, modifications, model } = useUpsert.form.values();
    const result = [
      popularNames?.map((x: SettingsTypeModel) => x.label).join(' - '),
      otherNames?.map((x: SettingsTypeModel) => x.label).join(' - '),
      stcManufactures?.map((x: SettingsTypeModel) => x.label).join(' - '),
      modifications?.map((x: SettingsTypeModel) => x.label).join(' - '),
    ]
      .filter(x => x)
      .join(', ');
    return `${model?.label || ''} ${result ? `( ${result} )` : ''}`;
  };

  const setCappsRecordId = (): void => {
    useUpsert.getField('cappsRecordId').set(cappsRecordId());
  };

  const setCappsModel = (): void => {
    useUpsert.getField('cappsModel').set(cappsModel());
  };

  /* istanbul ignore next */
  const loadAircraftVariationById = (): Observable<AircraftVariationModel> => {
    if (!Number(params?.id || props.variationDetailId)) {
      return of(aircraftVariations);
    }
    const request: IAPIGridRequest = {
      filterCollection: JSON.stringify([
        { propertyName: 'AircraftVariationId', propertyValue: Number(params?.id || props.variationDetailId) },
      ]),
    };
    return _aircraftVariationStore.getAircraftVariationById(request);
  };

  const pictureUrl = (): string => {
    return useUpsert.getField('pictureUrl').value || '';
  };

  /* istanbul ignore next */
  const uploadAircraftVariationPicture = (): Observable<AircraftVariationPictureModel> => {
    if (!file) {
      return of(new AircraftVariationPictureModel({ url: pictureUrl() }));
    }
    return _aircraftVariationStore.uploadAircraftVariationPicture(file, aircraftVariations?.id);
  };

  /* istanbul ignore next */
  const navigateToAircraftVariations = (): void => {
    navigate('/aircraft/aircraft-variation');
  };

  /* istanbul ignore next */
  const upsertAircraftVariation = (aircraftVariation: AircraftVariationModel): void => {
    UIStore.setPageLoader(true);
    uploadAircraftVariationPicture()
      .pipe(
        switchMap(aircraftVariationPicture =>
          _aircraftVariationStore.upsertAircraftVariation(
            new AircraftVariationModel({ ...aircraftVariation, pictureUrl: aircraftVariationPicture.url })
          )
        ),
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: AircraftVariationModel) => {
          const viewMode = params.mode?.toUpperCase();
          if (viewMode === VIEW_MODE.DETAILS) {
            useUpsert.setViewMode(VIEW_MODE.DETAILS);
            useUpsert.form.reset();
            setAircraftVariation(response);
            useUpsert.setFormValues(response);
            return;
          }
          navigateToAircraftVariations();
        },
        error: error => AlertStore.critical(error.message),
      });
  };

  /* istanbul ignore next */
  const validateUnique = (): void => {
    const aircraftVariation: AircraftVariationModel = new AircraftVariationModel({
      ...aircraftVariations,
      ...useUpsert.form.values(),
    });
    UIStore.setPageLoader(true);
    _aircraftVariationStore
      .validateUnique(aircraftVariation)
      .pipe(takeUntil(unsubscribe.destroy$))
      .subscribe(
        response => {
          if (response.isValid) {
            upsertAircraftVariation(aircraftVariation);
            return;
          }
          UIStore.setPageLoader(false);
          const message = 'A record already exists with the combination selected. Please edit existing record.';
          useUpsert.showAlert(message, 'aircraftVariationId');
        },
        () => UIStore.setPageLoader(false)
      );
  };

  const onCancel = (): void => {
    const viewMode = params.mode?.toUpperCase();
    if (viewMode === VIEW_MODE.DETAILS) {
      useUpsert.setViewMode(VIEW_MODE.DETAILS);
      useUpsert.form.reset();
      useUpsert.setFormValues(new AircraftVariationModel({ ...aircraftVariations }));
      setCappsRecordId();
      setCappsModel();
      return;
    }
    navigateToAircraftVariations();
  };

  const onAction = (action: GRID_ACTIONS): void => {
    switch (action) {
      case GRID_ACTIONS.EDIT:
        useUpsert.setViewMode(VIEW_MODE.EDIT);
        break;
      case GRID_ACTIONS.SAVE:
        validateUnique();
        break;
      case GRID_ACTIONS.CANCEL:
        onCancel();
        break;
    }
  };

  const onFocus = (fieldKey: string): void => {
    switch (fieldKey) {
      case 'make':
        useUpsert.observeSearch(_settingsStore.getMakes());
        break;
      case 'model':
        useUpsert.observeSearch(_settingsStore.getAircraftModels());
        break;
      case 'series':
        useUpsert.observeSearch(_settingsStore.getSeries());
        break;
      case 'performances':
        useUpsert.observeSearch(_performanceStore.getPerformances());
        break;
      case 'engineType':
        useUpsert.observeSearch(_settingsStore.getEngineTypes());
        break;
      case 'modifications':
        useUpsert.observeSearch(_settingsStore.getAircraftModifications());
        break;
      case 'icaoTypeDesignator':
        useUpsert.observeSearch(_settingsStore.getICAOTypeDesignators());
        break;
      case 'fuelType':
        useUpsert.observeSearch(_settingsStore.getFuelTypeProfile());
        break;
      case 'subCategory':
        useUpsert.observeSearch(_settingsStore.getSubCategories());
        break;
      case 'category':
        useUpsert.observeSearch(_settingsStore.getCategories());
        break;
      case 'fireCategory':
        useUpsert.observeSearch(_settingsStore.getFireCategory());
        break;
      case 'wakeTurbulenceCategory':
        useUpsert.observeSearch(_settingsStore.getWakeTurbulenceCategories());
        break;
      case 'distanceUOM':
        useUpsert.observeSearch(_settingsStore.getDistanceUOMs());
        break;
      case 'rangeUOM':
        useUpsert.observeSearch(_settingsStore.getRangeUOMs());
        break;
      case 'windUOM':
        useUpsert.observeSearch(_settingsStore.getWindUOMs());
        break;
      case 'stcManufactures':
        useUpsert.observeSearch(_settingsStore.getStcManufactures());
        break;
      case 'militaryDesignations':
        useUpsert.observeSearch(_settingsStore.getMilitaryDesignations());
        break;
      case 'otherNames':
        useUpsert.observeSearch(_settingsStore.getOtherNames());
        break;
      case 'sourceType':
        useUpsert.observeSearch(_settingsStore.getSourceTypes());
        break;
      case 'popularNames':
        useUpsert.observeSearch(_settingsStore.getPopularNames());
        break;
    }
  };

  /* istanbul ignore next */
  const onValueChange = (value: IOptionValue, fieldKey: string): void => {
    switch (fieldKey) {
      case 'make':
        useUpsert.clearFormFields([ 'series', 'model' ]);
        useUpsert.getField(fieldKey).set(value);
        break;
      case 'model':
        useUpsert.clearFormFields([ 'series' ]);
        useUpsert.getField(fieldKey).set(value);
        break;
      case 'series':
        useUpsert.clearFormFields([ 'engineType' ]);
        useUpsert.getField(fieldKey).set(value);
        break;
      case 'icaoTypeDesignator':
        useUpsert.clearFormFields([ 'propulsionType' ]);
        useUpsert.getField(fieldKey).set(value);
        useUpsert.getField('propulsionType').set((value as TypeDesignatorModel)?.propulsionType);
        break;
      default:
        useUpsert.getField(fieldKey).set(value);
    }
    setCappsRecordId();
    setCappsModel();
  };

  /* istanbul ignore next */
  const modelOptions = (): AircraftModel[] => {
    const makeId: number = useUpsert.getField('make').value?.value;
    return _settingsStore.aircraftModels.filter(x => x.modelMakes?.some(y => y.id === makeId));
  };

  /* istanbul ignore next */
  const seriesOptions = (): SeriesModel[] => {
    const modelId: number = useUpsert.getField('model').value?.value;
    return _settingsStore.series.filter(x => x.seriesModels?.some(y => y.id === modelId));
  };

  /* istanbul ignore next */
  const engineTypeOptions = (): EngineTypeModel[] => {
    const seriesId: number = useUpsert.getField('series').value?.value;
    if (!seriesId) {
      return _settingsStore.engineTypes;
    }
    return _settingsStore.engineTypes.filter(x => x.engineTypeSeries?.some(y => y.id === seriesId));
  };

  /* istanbul ignore next */
  const subCategoryOptions = (): SubCategoryModel[] => {
    const categoryId: number = useUpsert.getField('category').value?.value;
    if (!categoryId) {
      return _settingsStore.subCategories;
    }
    return _settingsStore.subCategories.filter(x => x.category?.id === categoryId);
  };

  /* istanbul ignore next */
  const groupInputControls = (): IGroupInputControls[] => {
    return [
      {
        title: 'Variation',
        inputControls: [
          {
            fieldKey: 'make',
            type: EDITOR_TYPES.DROPDOWN,
            options: _settingsStore.makes,
            isLoading: useUpsert.loader.isLoading,
          },
          {
            fieldKey: 'model',
            type: EDITOR_TYPES.DROPDOWN,
            options: modelOptions(),
            isDisabled: !Boolean(useUpsert.getField('make').value?.label),
            isLoading: useUpsert.loader.isLoading,
          },
          {
            fieldKey: 'series',
            type: EDITOR_TYPES.DROPDOWN,
            options: seriesOptions(),
            isDisabled: !Boolean(useUpsert.getField('model').value?.label),
            isLoading: useUpsert.loader.isLoading,
          },
          {
            fieldKey: 'icaoTypeDesignator',
            type: EDITOR_TYPES.DROPDOWN,
            options: _settingsStore.icaoTypeDesignators,
            isLoading: useUpsert.loader.isLoading,
          },
          {
            fieldKey: 'propulsionType',
            type: EDITOR_TYPES.DROPDOWN,
            options: [],
            isDisabled: true,
          },
          {
            fieldKey: 'engineType',
            type: EDITOR_TYPES.DROPDOWN,
            options: engineTypeOptions(),
            isLoading: useUpsert.loader.isLoading,
          },
          {
            fieldKey: 'numberOfEngines',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'wakeTurbulenceCategory',
            type: EDITOR_TYPES.DROPDOWN,
            options: _settingsStore.wakeTurbulenceCategories,
            isLoading: useUpsert.loader.isLoading,
          },
          {
            fieldKey: 'popularNames',
            type: EDITOR_TYPES.DROPDOWN,
            multiple: true,
            options: _settingsStore.popularNames,
            isLoading: useUpsert.loader.isLoading,
          },
          {
            fieldKey: 'otherNames',
            type: EDITOR_TYPES.DROPDOWN,
            multiple: true,
            options: _settingsStore.otherNames,
            isLoading: useUpsert.loader.isLoading,
          },
          {
            fieldKey: 'modifications',
            type: EDITOR_TYPES.DROPDOWN,
            multiple: true,
            options: _settingsStore.aircraftModifications,
            isLoading: useUpsert.loader.isLoading,
          },
          {
            fieldKey: 'stcManufactures',
            type: EDITOR_TYPES.DROPDOWN,
            multiple: true,
            options: _settingsStore.stcManufactures,
            isLoading: useUpsert.loader.isLoading,
          },
          {
            fieldKey: 'militaryDesignations',
            type: EDITOR_TYPES.DROPDOWN,
            multiple: true,
            options: _settingsStore.militaryDesignations,
            isLoading: useUpsert.loader.isLoading,
          },
          {
            fieldKey: 'cappsModel',
            type: EDITOR_TYPES.TEXT_FIELD,
            isDisabled: true,
            isHidden: true,
          },
          {
            fieldKey: 'cappsEngineType',
            type: EDITOR_TYPES.TEXT_FIELD,
            isHidden: true,
          },
          {
            fieldKey: 'cappsCruiseSchedule',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'cappsSeries',
            type: EDITOR_TYPES.TEXT_FIELD,
            isHidden: true,
          },
          {
            fieldKey: 'cappsRecordId',
            type: EDITOR_TYPES.TEXT_FIELD,
            isDisabled: true,
          },
          {
            fieldKey: 'isUwaFlightPlanSupported',
            type: EDITOR_TYPES.CHECKBOX,
          },
          {
            fieldKey: 'isVerificationComplete',
            type: EDITOR_TYPES.CHECKBOX,
          },
        ],
      },
      {
        title: 'General',
        inputControls: [
          {
            fieldKey: 'fuelType',
            type: EDITOR_TYPES.DROPDOWN,
            options: _settingsStore.fuelTypeProfile,
            isLoading: useUpsert.loader.isLoading,
          },
          {
            fieldKey: 'fireCategory',
            type: EDITOR_TYPES.DROPDOWN,
            options: _settingsStore.fireCategories.slice()?.sort((a, b) => Number(a.label) - Number(b.label)),
            isLoading: useUpsert.loader.isLoading,
          },
          {
            fieldKey: 'category',
            type: EDITOR_TYPES.DROPDOWN,
            options: _settingsStore.categories,
            isLoading: useUpsert.loader.isLoading,
          },
          {
            fieldKey: 'subCategory',
            type: EDITOR_TYPES.DROPDOWN,
            options: subCategoryOptions(),
            isLoading: useUpsert.loader.isLoading,
          },
          {
            fieldKey: 'wingspan',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
        ],
      },
      {
        title: 'Performance',
        inputControls: [
          {
            fieldKey: 'performances',
            type: EDITOR_TYPES.DROPDOWN,
            options: _performanceStore.performances,
            isLoading: useUpsert.loader.isLoading,
            multiple: true,
            isFullFlex: true,
          },
        ],
      },
      {
        title: 'Limitations',
        inputControls: [
          {
            fieldKey: 'minimumRunwayLength',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'range',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'maxCrosswind',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'maxTailWind',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
        ],
      },
      {
        title: 'Comments',
        inputControls: [
          {
            fieldKey: 'comments',
            type: EDITOR_TYPES.RICH_TEXT_EDITOR,
            isFullFlex: true,
            showExpandButton: false,
          },
        ],
      },
      {
        title: 'Picture',
        inputControls: [],
      },
    ];
  };

  const headerActions = (): ReactNode => {
    return (
      <>
        {!useUpsert.isEditable && !isModal && (
          <CustomLinkButton to="/aircraft/aircraft-variation" title="Aircraft Variations" startIcon={<ArrowBack />} />
        )}
        <EditSaveButtons
          disabled={useUpsert.form.hasError || UIStore.pageLoading || !useUpsert.form.changed}
          hasEditPermission={!isModal && aircraftModuleSecurity.isEditable}
          isEditMode={useUpsert.isEditable}
          onAction={action => onAction(action)}
        />
      </>
    );
  };

  /* istanbul ignore next */
  const openUploadPictureModal = (): void => {
    ModalStore.open(
      <ImportDialog
        title="Select Picture"
        fileType="jpg|jpeg|png|gif|JPG|JPEG|PNG|GIF"
        isLoading={() => useUpsert.isLoading}
        onUploadFile={file => {
          setFile(file);
          useUpsert.getField('pictureUrl').set('');
          ModalStore.close();
          return;
        }}
      />
    );
  };

  /* istanbul ignore next */
  const getPerformanceById = (): Observable<PerformanceModel | null> => {
    const { performance } = useUpsert.form.values();
    if (!performance?.id) {
      return of(null);
    }
    const request: IAPIGridRequest = {
      filterCollection: JSON.stringify([ Utilities.getFilter('PerformanceId', performance?.id) ]),
    };
    return _performanceStore.getPerformanceById(request);
  };

  /* istanbul ignore next */
  const refreshPerformance = (): void => {
    UIStore.setPageLoader(true);
    forkJoin([ getPerformanceById(), _performanceStore.getPerformances(true) ])
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(([ performance ]) => {
        if (performance) {
          useUpsert.getField('performances').set(performance);
        }
      });
  };

  const hasPicture = (): boolean => {
    const { pictureUrl } = useUpsert.form.values();
    return Boolean(file || pictureUrl);
  };

  const aircraftVariationPicture = (): ReactNode => {
    const imageSrc = file ? URL.createObjectURL(file) : aircraftVariations?.pictureAccessTokenUrl;
    return (
      <div key="aircaftVariationPicture">
        <CollapsibleWithButton
          titleVariant="h5"
          title="Picture"
          buttonText="Upload Picture"
          hasPermission={!isModal}
          titleChildren={
            !isModal && hasPicture() ? (
              <IconButton
                disabled={!useUpsert.isEditable}
                classes={{ root: classes.deleteIcon }}
                onClick={(event: MouseEvent<Element>) => {
                  event.stopPropagation();
                  setFile(null);
                  useUpsert.getField('pictureUrl').set('');
                }}
              >
                <DeleteOutlineIcon />
              </IconButton>
            ) : (
              <></>
            )
          }
          onButtonClick={() => openUploadPictureModal()}
          isButtonDisabled={hasPicture() || !useUpsert.isEditable || !aircraftModuleSecurity.isEditable}
        >
          <div className={classes.pictureRoot}>
            <ViewPermission hasPermission={hasPicture()}>
              <img className={classes.picture} src={imageSrc} onClick={() => window.open(imageSrc)} />
            </ViewPermission>
            <ViewPermission hasPermission={!hasPicture()}>
              <Typography>No image to display.</Typography>
            </ViewPermission>
          </div>
        </CollapsibleWithButton>
      </div>
    );
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
                  onFocus={(fieldKey: string) => onFocus(fieldKey)}
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

  return (
    <DetailsEditorWrapper headerActions={headerActions()} isEditMode={useUpsert.isEditable}>
      <div className={classes.flexRow}>
        {groupInputControls().map(groupInputControl => {
          if (groupInputControl.title === 'Picture') {
            return aircraftVariationPicture();
          }
          return (
            <AircraftCollapsable
              isWithButton={groupInputControl.title === 'Variation'}
              classes={classes}
              key={groupInputControl.title}
              title={groupInputControl.title}
              onButtonClick={() => refreshPerformance()}
              customIconButton={<Cached color="primary" />}
              hasPermission={!isModal}
            >
              <div className={classes.flexWrap}>
                {groupInputControl.inputControls
                  .filter(inputControl => !inputControl.isHidden)
                  .map((inputControl: IViewInputControl, index: number) => (
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
                          [classes.fullFlex]: inputControl.isFullFlex,
                        }),
                      }}
                      onValueChange={(option, _) => onValueChange(option, inputControl.fieldKey || '')}
                      onFocus={(fieldKey: string) => onFocus(fieldKey)}
                    />
                  ))}
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
  'settingsStore',
  'performanceStore',
  'aircraftVariationStore',
  'sidebarStore'
)(observer(AircraftVariationEditor));
