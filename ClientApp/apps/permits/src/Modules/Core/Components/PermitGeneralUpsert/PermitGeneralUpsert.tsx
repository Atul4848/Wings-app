import React, { FC, ReactNode, useEffect, useState } from 'react';
import { forkJoin, Observable, of } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { inject, observer } from 'mobx-react';
import { TextareaAutosize, Typography, Tooltip } from '@material-ui/core';
import { VIEW_MODE, ModelStatusOptions, CountryModel, FIRModel } from '@wings/shared';
import { PermitAppliedModel, PermitModel, RouteExtensionModel } from '../../../Shared';
import { PermitEditorActions, PermitGroupViewInputControls, PermitUpsert } from '../../Components';
import { BaseProps } from '../PermitUpsert/PermitUpsert';
import { fields } from './Fields';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import {
  IAPIGridRequest,
  IOptionValue,
  UIStore,
  Utilities,
  SettingsTypeModel,
  ViewPermission,
} from '@wings-shared/core';
import RouteAirwayGrid from './RouteAirwayGrid';
import { AuditFields, EDITOR_TYPES, IGroupInputControls } from '@wings-shared/form-controls';
import { DetailsEditorWrapper, ConfirmNavigate } from '@wings-shared/layout';
import { AddCircleOutlined, Visibility } from '@material-ui/icons';
import { Dialog } from '@uvgo-shared/dialog';
import { PrimaryButton, SecondaryButton } from '@uvgo-shared/buttons';
import { useConfirmDialog, useUnsubscribe } from '@wings-shared/hooks';
import { observable } from 'mobx';

type Props = BaseProps;

const PermitGeneralUpsert: FC<Props> = ({ ...props }) => {
  const unsubscribe = useUnsubscribe();
  const _useConfirmDialog = useConfirmDialog();
  const [ isAlreadyExists, setIsAlreadyExists ] = useState(false);
  const [ isRowEditing, setIsRowEditing ] = useState<Boolean>(false);
  const [ isDataSave, setIsDataSave ] = useState(false);
  const permitGeoJson = observable({
    data: '',
    errorMessage: '',
  });
  const {
    params,
    setPermitModel,
    setPermitDataChanged,
    navigateToPermits,
    permitModel,
    hasError,
    _permitSettingsStore,
    _permitStore,
    groupTitle,
    onUpsertAction,
    permitId,
    useUpsert,
    classes,
  } = PermitUpsert({
    ...props,
    fields,
  });

  useEffect(() => {
    useUpsert.setViewMode((params.viewMode?.toUpperCase() as VIEW_MODE) || VIEW_MODE.DETAILS);
    setInitialFormData(false);
  }, []);

  const setViewModeAction = (mode: VIEW_MODE): void => {
    useUpsert.setViewMode(mode);
  };

  useEffect(() => renderOptions(), [ useUpsert.isEditable ]);

  const renderOptions = () => {
    UIStore.setPageLoader(true);
    loadTypes()
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe();
  };

  /* istanbul ignore next */
  const loadTypes = (): Observable<[
    CountryModel[],
    FIRModel[],
    SettingsTypeModel[],
    SettingsTypeModel[],
    SettingsTypeModel[],
    SettingsTypeModel[]
  ]> => {
    if (useUpsert.isEditable) {
      return forkJoin([
        _permitStore.getCountries(),
        _permitStore.getFIRs(),
        _permitSettingsStore.getPermitTypes(),
        _permitSettingsStore.getPermitAppliedTo(),
        _permitSettingsStore.getSourceTypes(),
        _permitSettingsStore.getAccessLevels(),
      ]);
    }
    return of([[], [], [], [], [], []]);
  };

  const checkIsPermitExists = (fieldKey: string): void => {
    const permitTypes = useUpsert.getField('permitType').value || '';
    const country = useUpsert.getField('country')?.value;
    if (!Boolean(country?.id) || !Boolean(permitTypes?.id)) {
      setIsAlreadyExists(false);
      return;
    }
    switch (fieldKey) {
      case 'country':
      case 'permitType':
        const request: IAPIGridRequest = {
          filterCollection: JSON.stringify([
            { propertyName: 'Country.CountryId', propertyValue: country?.id },
            { propertyName: 'PermitType.PermitTypeId', propertyValue: permitTypes.id },
          ]),
        };
        UIStore.setPageLoader(true);
        _permitStore
          .isPermitExists(request, Number(permitId()))
          .pipe(
            takeUntil(unsubscribe.destroy$),
            finalize(() => UIStore.setPageLoader(false))
          )
          .subscribe((isExists: boolean) => setIsAlreadyExists(isExists));
        break;
    }
  };

  /* istanbul ignore next */
  const setInitialFormData = (shouldSetDetail: boolean = true): void => {
    if (!permitId()) {
      const permitData = new PermitModel({ id: 0, sourceType: null as any });
      useUpsert.setFormValues(permitData);
      setPermitModel(permitData);
      _permitStore.setPermitDataModel(permitData);
      return;
    }
    const { permitDataModel } = _permitStore;
    const { permitApplied } = permitDataModel;
    setPermitModel(new PermitModel({ ...permitDataModel }));
    useUpsert.form.reset();
    useUpsert.setFormValues(permitDataModel);
    setNauticalMilesRules(permitApplied?.permitAppliedTo.name);
    setIsPolygonRules(permitApplied?.permitAppliedTo.name);
    permitGeoJson.data = permitApplied.geoJson;
    if (shouldSetDetail) {
      useUpsert.setViewMode(VIEW_MODE.DETAILS);
      setIsAlreadyExists(false);
    }
  };

  const onCancel = (): void => {
    const viewMode = params?.viewMode?.toUpperCase();
    if (viewMode === VIEW_MODE.DETAILS) {
      if (useUpsert.form.touched) {
        return _useConfirmDialog.confirmAction(
          () => {
            setInitialFormData(), ModalStore.close();
          },
          {
            title: 'Confirm Cancellation',
            message: 'Leaving Edit Mode will cause your changes to be lost. Are you sure you want to exit Edit Mode?',
          }
        );
      }
      setInitialFormData();
      return;
    }
    navigateToPermits();
  };

  const updateRouteExtension = (permitRouteAirwayExtensions: RouteExtensionModel[]): void => {
    const formData = useUpsert.form.values();
    const permitRouteAirway = new PermitModel({
      ...permitModel,
      ...formData,
      permitRouteAirwayExtensions: permitRouteAirwayExtensions,
    });
    useUpsert.setFormValues(permitRouteAirway);
    setPermitModel(permitRouteAirway);
    setIsDataSave(true);
  };

  const confirmRemoveAllRouteAirwayExtension = (fieldKey: string, value: IOptionValue): void => {
    _useConfirmDialog.confirmAction(
      () => {
        updateRouteExtension([]);
        useUpsert.getField(fieldKey).set(value);
        updatePermitModel();
        checkIsPermitExists(fieldKey);
        ModalStore.close();
      },
      {
        title: 'Confirm Delete',
        message:
          // eslint-disable-next-line max-len
          'Disabling the Route/Airway Extension will remove the associated Route/Airway Extenions. Are you sure you want to continue?',
      }
    );
  };

  const onValueChange = (value: IOptionValue, fieldKey: string): void => {
    const { permitRouteAirwayExtensions } = useUpsert.form.values();
    switch (fieldKey) {
      case 'permitApplied.permitAppliedTo':
        const _value = value as SettingsTypeModel;
        resetPermitAppliedToBasedFields(_value);
        useUpsert.getField(fieldKey).set(value);
        useUpsert.getField('permitApplied.permitAppliedFIRs').clear();
        break;
      case 'permitApplied.isPolygon':
        setIsPolygonValue(value);
        break;
      case 'permitType':
        resetPermitTypeBasedFields(value);
        useUpsert.getField(fieldKey).set(value);
        break;
      case 'hasRouteOrAirwayExtension':
        if (!value && Boolean(permitRouteAirwayExtensions?.length)) {
          confirmRemoveAllRouteAirwayExtension(fieldKey, value);
          return;
        }
        useUpsert.getField(fieldKey).set(value);
        break;
      default:
        useUpsert.getField(fieldKey).set(value);
        break;
    }
    updatePermitModel();
    checkIsPermitExists(fieldKey);
  };

  const updatePermitModel = (): void => {
    const { permitApplied } = useUpsert.form.values();
    const { permitDataModel } = _permitStore;
    setPermitModel(
      new PermitModel({
        ...permitDataModel,
        ...useUpsert.form.values(),
        permitApplied: new PermitAppliedModel({
          ...permitDataModel?.permitApplied,
          ...permitApplied,
          isPolygon: permitApplied.isPolygon || false,
          geoJson: permitApplied.geoJson,
        }),
        permitRouteAirwayExtensions:
          useUpsert.getField('permitRouteAirwayExtensions').value || permitModel.permitRouteAirwayExtensions || [],
      })
    );
    setPermitDataChanged(true);
  };

  const resetPermitTypeBasedFields = (value: IOptionValue): void => {
    const _value = value as SettingsTypeModel;
    const isLanding = Utilities.isEqual(_value?.name, 'Landing');
    if (isLanding) {
      useUpsert.getField('permitApplied.permitAppliedTo').set(null);
      resetExtendedByNMField();
      resetPolygonField();
    }
  };

  const resetPermitAppliedToBasedFields = (value: SettingsTypeModel): void => {
    resetPolygonField();
    resetExtendedByNMField();
    setNauticalMilesRules(value?.name);
    setIsPolygonRules(value?.name);
  };

  const resetExtendedByNMField = (): void => {
    useUpsert.getField('permitApplied.extendedByNM').set(null);
    setNauticalMilesRules('');
  };

  const resetPolygonField = (): void => {
    useUpsert.getField('permitApplied.isPolygon').set(false);
    useUpsert.getField('permitApplied.geoJson').set('');
    permitGeoJson.data = '';
    setIsPolygonRules('');
  };

  const setNauticalMilesRules = (value: string): void => {
    const isNauticalMiles: boolean = isLandmassNauticalMiles(value) || isLandmassPlusNmPlus(value);
    useUpsert.setFormRules('permitApplied.extendedByNM', isNauticalMiles, 'Extended by Nautical Miles');
    if (isNauticalMiles) {
      if (isLandmassNauticalMiles(value)) {
        resetPolygonField();
      }
      return;
    }
  };

  const setIsPolygonRules = (value: string): void => {
    const isPolygon: boolean = isLandmassPlusNmPlus(value) || isPolygonOnly(value);

    useUpsert.setFormRules('permitApplied.isPolygon', isPolygon, 'Is Polygon');
    useUpsert.setFormRules('permitApplied.geoJson', isPolygon, 'Polygon GEOJSON');
    if (isPolygon) {
      const { permitApplied } = useUpsert.form.values();
      setIsPolygonValue(permitApplied.isPolygon);
      if (isLandmassPlusNmPlus(value)) {
        useUpsert.setFormRules('permitApplied.extendedByNM', isPolygon, 'Extended by Nautical Miles');
      }
    }
  };

  const setIsPolygonValue = (value: IOptionValue): void => {
    useUpsert.getField('permitApplied.isPolygon').set(!Boolean(value) ? '' : value);
    if (!Boolean(value)) {
      useUpsert.getField('permitApplied.geoJson').set('');
      permitGeoJson.data = '';
    }
  };

  const isLandmassNauticalMiles = (value: string): boolean => {
    return Utilities.isEqual(value, 'Landmass Plus NM');
  };

  const isLandmassPlusFIRPlus = (value: string): boolean => {
    return Utilities.isEqual(value, 'Landmass Plus FIR Plus');
  };

  const isLandmassPlus = (value: string): boolean => {
    return Utilities.isEqual(value, 'Landmass Plus');
  };

  const isLandmassPlusNmPlus = (value: string): boolean => {
    return Utilities.isEqual(value, 'Landmass Plus NM Plus');
  };

  const isPolygonOnly = (value: string): boolean => {
    return Utilities.isEqual(value, 'Polygon Only');
  };

  const isPermitTypeLanding = (): boolean => {
    const { permitType } = useUpsert.form.values();
    return Utilities.isEqual(permitType?.name, 'Landing');
  };

  const isExtendedByNMDisabled = (): boolean => {
    const { permitApplied } = useUpsert.form.values();
    return (
      isLandmassNauticalMiles(permitApplied?.permitAppliedTo?.name) ||
      isLandmassPlus(permitApplied?.permitAppliedTo?.name) ||
      isLandmassPlusNmPlus(permitApplied?.permitAppliedTo?.name) ||
      isLandmassPlusFIRPlus(permitApplied?.permitAppliedTo?.name) ||
      isPolygonOnly(permitApplied?.permitAppliedTo?.name)
    );
  };

  const isPolygonDisabled = (): boolean => {
    const { permitApplied } = useUpsert.form.values();
    return (
      isLandmassPlusFIRPlus(permitApplied?.permitAppliedTo?.name) ||
      isLandmassPlus(permitApplied?.permitAppliedTo?.name) ||
      isPolygonOnly(permitApplied?.permitAppliedTo?.name) ||
      isLandmassPlusNmPlus(permitApplied?.permitAppliedTo?.name)
    );
  };

  const hasGeneralError = (): boolean => {
    if (isDataSave) {
      return isAlreadyExists || isRowEditing || useUpsert.form.hasError;
    }
    return isAlreadyExists || isRowEditing || hasError;
  };

  const disableAppliedFIRs = (): boolean => {
    const permitAppliedTo = useUpsert.getField('permitApplied.permitAppliedTo').value?.name;
    return !permitAppliedTo?.includes('FIR');
  };

  const onGeoJsonChange = (value: string): void => {
    permitGeoJson.errorMessage = '';
    permitGeoJson.data = value;
  };

  /* istanbul ignore next */
  const updateGeoJson = (): void => {
    permitGeoJson.errorMessage = '';
    try {
      JSON.parse(permitGeoJson.data);
      // If parsing succeeds, handle the valid JSON data here
      useUpsert.getField('permitApplied.geoJson').set(permitGeoJson.data);
      updatePermitModel();
      ModalStore.close();
      setIsDataSave(true);
    } catch (error) {
      // If parsing fails, handle the error here
      permitGeoJson.errorMessage = 'Invalid JSON';
      return;
    }
  };

  /* istanbul ignore next */
  const addGeoJson = (): void => {
    const { permitApplied } = useUpsert.form.values();
    permitGeoJson.data = permitApplied.geoJson || '';
    ModalStore.open(
      <Dialog
        title="Polygon GEOJSON"
        open={true}
        onClose={() => {
          ModalStore.close();
          permitGeoJson.errorMessage = '';
        }}
        isLoading={() => useUpsert.loader.isLoading}
        classes={{ paperSize: classes?.modalWidth, content: classes?.content }}
        dialogContent={() => (
          <TextareaAutosize
            value={permitGeoJson.data}
            className={classes?.textBox}
            minRows={30}
            disabled={!permitApplied.isPolygon || useUpsert.isDetailView}
            maxLength={75000}
            minLength={3}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onGeoJsonChange(e.target.value)}
          />
        )}
        dialogActions={() => (
          <ViewPermission hasPermission={permitApplied.isPolygon && !useUpsert.isDetailView}>
            <div className={classes?.actionWrapper}>
              <div className={classes?.wrapper}>
                <Typography variant="body2" className={classes?.error}>
                  {permitGeoJson.errorMessage}
                </Typography>
                <span>
                  <em>Count:</em> {permitGeoJson.data?.length}/75000
                </span>
              </div>
              <div>
                <PrimaryButton
                  variant="outlined"
                  onClick={() => {
                    permitGeoJson.data = permitApplied.geoJson;
                    ModalStore.close();
                    permitGeoJson.errorMessage = '';
                  }}
                >
                  Cancel
                </PrimaryButton>
                <SecondaryButton
                  variant="contained"
                  onClick={() => updateGeoJson()}
                  disabled={!permitGeoJson.data?.length}
                >
                  Save
                </SecondaryButton>
              </div>
            </div>
          </ViewPermission>
        )}
      />
    );
  };

  const profileEndAdornment = (): ReactNode => {
    const { permitApplied } = useUpsert.form.values();

    if (!permitApplied.isPolygon) {
      return <></>;
    }
    return <AddCircleOutlined onClick={() => addGeoJson()} />;
  };

  /* istanbul ignore next */
  const hasJson = (): boolean => {
    const { permitApplied } = useUpsert.form.values();
    return Boolean(permitApplied.geoJson);
  };

  /* istanbul ignore next */
  const groupInputControls = (): IGroupInputControls[] => {
    return [
      {
        title: groupTitle(),
        inputControls: [
          {
            fieldKey: 'country',
            type: EDITOR_TYPES.DROPDOWN,
            options: _permitStore.countries,
            isExists: isAlreadyExists,
          },
          {
            fieldKey: 'permitType',
            type: EDITOR_TYPES.DROPDOWN,
            options: _permitSettingsStore.permitTypes,
            isExists: isAlreadyExists,
          },
          {
            fieldKey: 'isRequired',
            type: EDITOR_TYPES.CHECKBOX,
          },
          {
            fieldKey: 'permitApplied.permitAppliedTo',
            type: EDITOR_TYPES.DROPDOWN,
            options: _permitSettingsStore.permitAppliedTo,
            isDisabled: isPermitTypeLanding(),
          },
          {
            fieldKey: 'permitApplied.extendedByNM',
            type: EDITOR_TYPES.TEXT_FIELD,
            isDisabled: !isExtendedByNMDisabled(),
          },
          {
            fieldKey: 'permitApplied.permitAppliedFIRs',
            type: EDITOR_TYPES.DROPDOWN,
            multiple: true,
            options: _permitStore.firs,
            isDisabled: disableAppliedFIRs(),
            getChipLabel: fir => (fir as FIRModel)?.code,
          },
          {
            fieldKey: 'permitApplied.isPolygon',
            type: EDITOR_TYPES.CHECKBOX,
            isDisabled: !isPolygonDisabled(),
          },
          {
            fieldKey: 'permitApplied.geoJson',
            type: EDITOR_TYPES.TEXT_FIELD,
            isReadOnly: true,
            endAdormentValue: profileEndAdornment(),
            isFullFlex: true,
            customLabel: field => {
              if (hasJson() && useUpsert.isDetailView) {
                return (
                  <>
                    <span>{field.label}</span>
                    <Tooltip title="View JSON">
                      <Visibility onClick={() => addGeoJson()} className={classes?.eyeIcon} />
                    </Tooltip>
                  </>
                );
              }
              return field.label;
            },
          },
          {
            fieldKey: 'accessLevel',
            type: EDITOR_TYPES.DROPDOWN,
            options: _permitSettingsStore.accessLevels,
          },
          {
            fieldKey: 'sourceType',
            type: EDITOR_TYPES.DROPDOWN,
            options: _permitSettingsStore.sourceTypes,
          },
          {
            fieldKey: 'status',
            type: EDITOR_TYPES.DROPDOWN,
            options: ModelStatusOptions,
          },
          {
            fieldKey: 'hasRouteOrAirwayExtension',
            type: EDITOR_TYPES.CHECKBOX,
          },
        ],
      },
    ];
  };

  const upsertData = () => {
    const permitRouteAirway = new PermitModel({
      ..._permitStore?.permitDataModel,
      ...permitModel,
      id: _permitStore?.permitDataModel.id,
    });
    useUpsert.setFormValues(permitRouteAirway);
    setPermitModel(permitRouteAirway);
    onUpsertAction(permitRouteAirway);
  };

  const headerActions = (): ReactNode => {
    return (
      <PermitEditorActions
        hasError={hasGeneralError() || UIStore.pageLoading}
        isDetailsView={useUpsert.isDetailView}
        onCancelClick={onCancel}
        onUpsert={upsertData}
        onSetViewMode={(mode: VIEW_MODE) => setViewModeAction(mode)}
        title={permitModel.permitTitle}
      />
    );
  };

  const updateRowEditing = (isEditing: boolean): void => {
    setIsRowEditing(isEditing);
  };

  const { hasRouteOrAirwayExtension, permitRouteAirwayExtensions } = useUpsert.form.values();
  return (
    <ConfirmNavigate isBlocker={useUpsert.form.touched}>
      <DetailsEditorWrapper
        headerActions={headerActions()}
        isEditMode={!useUpsert.isDetailView}
        classes={{ container: classes.editorWrapperContainer, headerActionsEditMode: classes.headerActionsEditMode }}
      >
        <PermitGroupViewInputControls
          isEditable={useUpsert.isEditable}
          groupInputControls={groupInputControls()}
          onGetField={useUpsert.getField}
          onValueChange={onValueChange}
        />

        <RouteAirwayGrid
          isEditable={(useUpsert.isEditable || !useUpsert.isDetailView) && hasRouteOrAirwayExtension}
          permitRouteAirwayExtensions={permitRouteAirwayExtensions}
          onDataSave={revisions => updateRouteExtension(revisions)}
          onRowEditingChange={isEditing => updateRowEditing(isEditing)}
        />
        <AuditFields
          isNew={useUpsert.isAddNew}
          isEditable={useUpsert.isEditable}
          fieldControls={useUpsert.auditFields}
          onGetField={useUpsert.getField}
        />
      </DetailsEditorWrapper>
    </ConfirmNavigate>
  );
};

export default inject('permitStore', 'permitSettingsStore', 'sidebarStore')(observer(PermitGeneralUpsert));
