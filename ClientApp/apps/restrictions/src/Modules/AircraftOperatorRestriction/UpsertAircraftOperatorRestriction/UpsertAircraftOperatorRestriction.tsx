import { ModalStore } from '@uvgo-shared/modal-keeper';
import {
  DATE_FORMAT,
  EntityMapModel,
  GRID_ACTIONS,
  IAPIGridRequest,
  IAPIPageResponse,
  IClasses,
  IOptionValue,
  SEARCH_ENTITY_TYPE,
  StatusTypeModel,
  UIStore,
  Utilities,
  baseEntitySearchFilters,
  tapWithAction,
} from '@wings-shared/core';
import { AuditFields, EDITOR_TYPES, IGroupInputControls, ViewInputControlsGroup } from '@wings-shared/form-controls';
import { useConfirmDialog, useUnsubscribe } from '@wings-shared/hooks';
import { ConfirmNavigate, DetailsEditorHeaderSection, DetailsEditorWrapper, SidebarStore } from '@wings-shared/layout';
import { CountryModel, EntityOptionsStore, ModelStatusOptions, VIEW_MODE, useBaseUpsertComponent } from '@wings/shared';
import { inject, observer } from 'mobx-react';
import React, { FC, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { finalize, takeUntil } from 'rxjs/operators';
import {
  AircraftOperatorRestrictionsModel,
  AircraftOperatorRestrictionsStore,
  AircraftOperatorSettings,
  SettingsStore,
  updateRestrictionSidebarOptions,
  useRestrictionModuleSecurity,
} from '../../Shared';
import { fields } from './Fields';
import { useStyles } from './UpsertAircraftOperatorRestriction.styles';

interface Props {
  params?: { id: string; viewMode: VIEW_MODE };
  viewMode?: VIEW_MODE;
  aircraftOperatorRestrictionsStore?: AircraftOperatorRestrictionsStore;
  aircraftOperatorSettingsStore?: AircraftOperatorSettings;
  entityOptionsStore?: EntityOptionsStore;
  settingsStore?: SettingsStore;
  classes?: IClasses;
  sidebarStore?: typeof SidebarStore;
}

const UpsertAircraftOperatorRestriction: FC<Props> = ({ ...props }) => {
  const params = useParams();
  const classes = useStyles();
  const unsubscribe = useUnsubscribe();
  const navigate = useNavigate();
  const _useConfirmDialog = useConfirmDialog();
  const useUpsert = useBaseUpsertComponent<AircraftOperatorRestrictionsModel>(params, fields, baseEntitySearchFilters);
  const backNavLink: string = '/restrictions/aircraft-operator-restrictions';
  const restrictionChecks = [
    'restrictionAppliedToLicenseHolder',
    'restrictionAppliedToRegistries',
    'restrictionAppliedToAllFlights',
    'restrictionAppliedToOperators',
    'restrictionAppliedToPassportedPassenger',
  ];
  const [ aircraftOperatorRestrictionModel, setAircraftOperatorRestrictionModel ] = useState<
    AircraftOperatorRestrictionsModel
  >();
  const [ restrictionForms, setRestrictionForms ] = useState<EntityMapModel[]>([]);
  const [ uwaAllowableServices, setUWAAllowableServices ] = useState<EntityMapModel[]>([]);
  const aircraftOperatorRestrictionId = Utilities.getNumberOrNullValue(params.id);
  const restrictionModuleSecurity = useRestrictionModuleSecurity();
  const _sidebarStore = props.sidebarStore as typeof SidebarStore;
  // eslint-disable-next-line max-len
  const _aircraftOperatorRestrictionsStore = props.aircraftOperatorRestrictionsStore as AircraftOperatorRestrictionsStore;
  const _settingsStore = props.settingsStore as SettingsStore;
  const _entityOptionsStore = props.entityOptionsStore as EntityOptionsStore;
  const _aircraftOperatorSettings = props.aircraftOperatorSettingsStore as AircraftOperatorSettings;

  useEffect(() => {
    _sidebarStore?.setNavLinks(updateRestrictionSidebarOptions('Aircraft Operator Restrictions'), 'restrictions');
    useUpsert.setViewMode((params.viewMode?.toUpperCase() as VIEW_MODE) || VIEW_MODE.EDIT);
    loadAircraftOperatorRestrictions();
  }, []);

  /* istanbul ignore next */
  const effectedEntityType = useUpsert.getField('effectedEntityType').value?.label;

  const hasValidRestrictionChecks = restrictionChecks.some(fieldKey => useUpsert.getField(fieldKey).value);

  const hasError = useUpsert.form.hasError || !hasValidRestrictionChecks;

  const isAllowedServicesEditable = (): boolean => {
    const allowableActions = useUpsert.getField('uwaAllowableActions').value;
    return (
      Utilities.isEqual(allowableActions?.label, 'Partial Support') ||
      Utilities.isEqual(allowableActions?.label, 'Partial Support - Russia')
    );
  };

  /* istanbul ignore next */
  const groupInputControls = (): IGroupInputControls[] => {
    return [
      {
        title: 'General Information:',
        inputControls: [
          {
            fieldKey: 'effectedEntityType',
            type: EDITOR_TYPES.DROPDOWN,
            options: _aircraftOperatorSettings.effectedEntityTypes,
          },
          {
            fieldKey: 'effectedEntity',
            type: EDITOR_TYPES.DROPDOWN,
            options: _entityOptionsStore.getEntityOptions(effectedEntityType),
            isDisabled: !Boolean(effectedEntityType),
          },
          {
            fieldKey: 'nationalities',
            type: EDITOR_TYPES.DROPDOWN,
            multiple: true,
            options: _aircraftOperatorRestrictionsStore.countries,
            getChipLabel: country => (country as CountryModel).isO2Code,
            showChipTooltip: true,
          },
        ],
      },
      {
        title: 'Restriction Areas:',
        inputControls: [
          {
            fieldKey: 'restrictionType',
            type: EDITOR_TYPES.DROPDOWN,
            options: _aircraftOperatorSettings.aircraftOperatorRestrictionTypes,
          },
          {
            fieldKey: 'restrictionAppliedToLicenseHolder',
            type: EDITOR_TYPES.CHECKBOX,
          },
          {
            fieldKey: 'restrictionAppliedToRegistries',
            type: EDITOR_TYPES.CHECKBOX,
          },
          {
            fieldKey: 'restrictionAppliedToAllFlights',
            type: EDITOR_TYPES.CHECKBOX,
          },
          {
            fieldKey: 'restrictionAppliedToOperators',
            type: EDITOR_TYPES.CHECKBOX,
          },
          {
            fieldKey: 'restrictionAppliedToPassportedPassenger',
            type: EDITOR_TYPES.CHECKBOX,
          },
          {
            fieldKey: 'exceptForeignOperators',
            type: EDITOR_TYPES.CHECKBOX,
          },
        ],
      },
      {
        title: '',
        inputControls: [
          {
            fieldKey: 'sfc',
            type: EDITOR_TYPES.CHECKBOX,
          },
          {
            fieldKey: 'lowerLimitFL',
            type: EDITOR_TYPES.TEXT_FIELD,
            isDisabled: useUpsert.getField('sfc').value,
          },
        ],
      },
      {
        title: '',
        inputControls: [
          {
            fieldKey: 'unl',
            type: EDITOR_TYPES.CHECKBOX,
          },
          {
            fieldKey: 'upperLimitFL',
            type: EDITOR_TYPES.TEXT_FIELD,
            isDisabled: useUpsert.getField('unl').value,
          },
        ],
      },
      {
        title: '',
        inputControls: [
          {
            fieldKey: 'restrictionSource',
            type: EDITOR_TYPES.DROPDOWN,
            options: _settingsStore.restrictionSources,
          },
          {
            fieldKey: 'restrictingCountry',
            type: EDITOR_TYPES.DROPDOWN,
            options: _aircraftOperatorRestrictionsStore.countries,
          },
          {
            fieldKey: 'restrictionSeverity',
            type: EDITOR_TYPES.DROPDOWN,
            options: _aircraftOperatorSettings.restrictionSeverities,
          },
          {
            fieldKey: 'approvalTypeRequired',
            type: EDITOR_TYPES.DROPDOWN,
            options: _aircraftOperatorSettings.approvalTypesRequired,
          },
          {
            fieldKey: 'aircraftOperatorRestrictionForms',
            type: EDITOR_TYPES.DROPDOWN,
            options: restrictionForms,
            multiple: true,
          },
        ],
      },
      {
        title: '',
        inputControls: [
          {
            fieldKey: 'startDate',
            type: EDITOR_TYPES.DATE,
            dateTimeFormat: DATE_FORMAT.DATE_PICKER_FORMAT,
            maxDate: useUpsert.getField('endDate').value,
          },
          {
            fieldKey: 'endDate',
            type: EDITOR_TYPES.DATE,
            dateTimeFormat: DATE_FORMAT.DATE_PICKER_FORMAT,
            minDate: useUpsert.getField('startDate').value,
          },
          {
            fieldKey: 'uwaAllowableActions',
            type: EDITOR_TYPES.DROPDOWN,
            options: _settingsStore.uwaAllowableActions,
          },
          {
            fieldKey: 'uwaAllowableServices',
            type: EDITOR_TYPES.DROPDOWN,
            isDisabled: !isAllowedServicesEditable(),
            options: uwaAllowableServices,
            multiple: true,
          },
          {
            fieldKey: 'enforcementAgency',
            type: EDITOR_TYPES.DROPDOWN,
            options: _aircraftOperatorSettings.enforcementAgencies,
          },
        ],
      },
      {
        title: '',
        inputControls: [
          {
            fieldKey: 'notamId',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'notamExpiryDate',
            type: EDITOR_TYPES.DATE,
            dateTimeFormat: DATE_FORMAT.DATE_PICKER_FORMAT,
          },
          {
            fieldKey: 'link',
            type: EDITOR_TYPES.LINK,
          },
        ],
      },
      {
        title: '',
        inputControlClassName: classes.summary,
        inputControls: [
          {
            fieldKey: 'summary',
            type: EDITOR_TYPES.TEXT_FIELD,
            isDisabled: true,
            multiline: true,
            isHidden: useUpsert.isAddNew,
            rows: 5,
          },
        ],
      },
      {
        title: '',
        inputControls: [
          {
            fieldKey: 'accessLevel',
            type: EDITOR_TYPES.DROPDOWN,
            options: _settingsStore.accessLevels,
          },
          {
            fieldKey: 'status',
            type: EDITOR_TYPES.DROPDOWN,
            options: ModelStatusOptions.map(m => StatusTypeModel.deserialize({ id: Number(m.value), name: m.label })),
          },
          {
            fieldKey: 'sourceType',
            type: EDITOR_TYPES.DROPDOWN,
            options: _settingsStore.sourceTypes,
          },
        ],
      },
    ];
  };

  /* istanbul ignore next */
  const validateInputs = () => {
    // validate checkbox
    restrictionChecks.forEach(_key => {
      useUpsert.getField(_key).set('label', `${useUpsert.getFieldLabel(_key)}${hasValidRestrictionChecks ? '' : '*'}`);
    });
  };

  /* istanbul ignore next */
  const loadAircraftOperatorRestrictions = () => {
    if (!aircraftOperatorRestrictionId) {
      return;
    }
    const request: IAPIGridRequest = {
      filterCollection: JSON.stringify([
        { propertyName: 'AircraftOperatorRestrictionId', propertyValue: aircraftOperatorRestrictionId },
      ]),
    };
    UIStore.setPageLoader(true);
    _aircraftOperatorRestrictionsStore
      .getAircraftOperatorRestrictions(request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe((response: IAPIPageResponse) => {
        setAircraftOperatorRestrictionModel(response.results[0]);
        useUpsert.setFormValues(response.results[0]);
        validateInputs();
      });
  };

  /* istanbul ignore next */
  const upsertAircraftOperatorRestrictions = () => {
    const model = new AircraftOperatorRestrictionsModel({
      ...aircraftOperatorRestrictionModel,
      ...useUpsert.form.values(),
    });
    UIStore.setPageLoader(true);
    _aircraftOperatorRestrictionsStore
      .upsertAircraftOperatorRestrictions(model.serialize())
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (responseModel: AircraftOperatorRestrictionsModel) => {
          setAircraftOperatorRestrictionModel(responseModel);
          useUpsert.form.reset();
          useUpsert.setFormValues(responseModel);
          const viewMode = params?.viewMode?.toUpperCase();
          // if new aircraft operator then redirect to edit screen
          if (!Boolean(model?.id) && viewMode === VIEW_MODE.NEW) {
            navigate(`${backNavLink}/${responseModel.id}/edit`);
            return;
          }
          if (viewMode === VIEW_MODE.DETAILS) {
            useUpsert.setViewMode(VIEW_MODE.DETAILS);
          }
          validateInputs();
        },
        error: error => useUpsert.showAlert(error.message, 'upsertAirportBase'),
      });
  };

  const onAction = (action: GRID_ACTIONS) => {
    switch (action) {
      case GRID_ACTIONS.SAVE:
        upsertAircraftOperatorRestrictions();
        break;
      case GRID_ACTIONS.EDIT:
        useUpsert.setViewMode(VIEW_MODE.EDIT);
        break;
      case GRID_ACTIONS.CANCEL:
      default:
        confirmClose();
        break;
    }
  };

  const confirmClose = () => {
    const viewMode = params.viewMode?.toUpperCase();

    if (viewMode !== VIEW_MODE.DETAILS) {
      navigate(backNavLink, useUpsert.noBlocker);
      return;
    }
    if (!(useUpsert.form.touched || useUpsert.form.changed)) {
      onCancel();
      return;
    }
    _useConfirmDialog.confirmAction(() => {
      onCancel();
      ModalStore.close();
    }, {});
  };

  const onCancel = () => {
    const viewMode = params.viewMode?.toUpperCase();
    if (viewMode === VIEW_MODE.DETAILS) {
      useUpsert.setViewMode(VIEW_MODE.DETAILS);
      useUpsert.form.reset();
      useUpsert.setFormValues(aircraftOperatorRestrictionModel as AircraftOperatorRestrictionsModel);
      return;
    }
    navigate(backNavLink, useUpsert.noBlocker);
  };

  const onValueChange = (value: IOptionValue, fieldKey: string) => {
    useUpsert.getField(fieldKey).set(value);
    switch (fieldKey) {
      case 'nationalities':
        if (!(value as CountryModel[])?.length) {
          _aircraftOperatorRestrictionsStore.countries = [];
        }
        break;
      case 'restrictingCountry':
        if (!value) {
          _aircraftOperatorRestrictionsStore.countries = [];
        }
        break;
      case 'effectedEntityType':
        useUpsert.clearFormFields([ 'effectedEntity' ]);
        _entityOptionsStore.clearEntity(effectedEntityType);
        break;
      case 'uwaAllowableActions':
        // clear UWA Allowable Services
        useUpsert.getField('uwaAllowableServices').clear();
        break;
      case 'restrictionAppliedToLicenseHolder':
      case 'restrictionAppliedToRegistries':
      case 'restrictionAppliedToAllFlights':
      case 'restrictionAppliedToOperators':
      case 'restrictionAppliedToPassportedPassenger':
        validateInputs();
        break;
      case 'sfc':
        // clear Lower Limit FL
        useUpsert.getField('lowerLimitFL').set('');
        break;
      case 'unl':
        // clear Upper Limit FL
        useUpsert.getField('upperLimitFL').set('');
        break;
    }
  };

  // Search Entity based on field value
  const onSearch = (searchValue: string, fieldKey: string) => {
    switch (fieldKey) {
      case 'nationalities':
      case 'restrictingCountry':
        const countryRequest: IAPIGridRequest = useUpsert.getSearchRequest(searchValue, SEARCH_ENTITY_TYPE.COUNTRY);
        useUpsert.observeSearch(_aircraftOperatorRestrictionsStore.getCountries(countryRequest));
        break;
      case 'effectedEntity':
        const request: IAPIGridRequest = useUpsert.getSearchRequest(searchValue, effectedEntityType);
        useUpsert.observeSearch(_entityOptionsStore.searchEntity(effectedEntityType, request, searchValue));
        break;
    }
  };

  const onFocus = (fieldKey: string) => {
    switch (fieldKey) {
      case 'effectedEntityType':
        useUpsert.observeSearch(_aircraftOperatorSettings.getEffectedEntityTypes());
        break;
      case 'restrictionSource':
        useUpsert.observeSearch(_settingsStore.getRestrictionSources());
        break;
      case 'restrictionType':
        useUpsert.observeSearch(_aircraftOperatorSettings.getAircraftOperatorRestrictionTypes());
        break;
      case 'restrictionSeverity':
        useUpsert.observeSearch(_aircraftOperatorSettings.getRestrictionSeverities());
        break;
      case 'aircraftOperatorRestrictionForms':
        useUpsert.observeSearch(
          _aircraftOperatorSettings.getRestrictionForms().pipe(
            tapWithAction(response => {
              setRestrictionForms(response.map(x => new EntityMapModel({ entityId: x.id, name: x.name })));
            })
          )
        );
        break;
      case 'uwaAllowableServices':
        useUpsert.observeSearch(
          _settingsStore.getUWAAllowableServices().pipe(
            tapWithAction(response => {
              setUWAAllowableServices(response.map(x => new EntityMapModel({ entityId: x.id, name: x.name })));
            })
          )
        );
        break;
      case 'approvalTypeRequired':
        useUpsert.observeSearch(_aircraftOperatorSettings.getApprovalTypesRequired());
        break;
      case 'uwaAllowableActions':
        useUpsert.observeSearch(_settingsStore.getUWAAllowableActions());
        break;
      case 'enforcementAgency':
        useUpsert.observeSearch(_aircraftOperatorSettings.getEnforcementAgencies());
        break;
      case 'accessLevel':
        useUpsert.observeSearch(_settingsStore.getAccessLevels());
        break;
      case 'sourceType':
        useUpsert.observeSearch(_settingsStore.getSourceTypes());
        break;
    }
  };

  const headerActions = () => {
    return (
      <DetailsEditorHeaderSection
        title=""
        backNavLink={backNavLink}
        backNavTitle="Aircraft Operator Restrictions"
        disableActions={hasError || UIStore.pageLoading || !useUpsert.form.changed}
        isEditMode={useUpsert.isEditable}
        hasEditPermission={restrictionModuleSecurity.isEditable}
        onAction={onAction}
      />
    );
  };

  return (
    <ConfirmNavigate isBlocker={useUpsert.form.changed || useUpsert.form.touched}>
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
          onValueChange={(option: IOptionValue, fieldKey: string) => onValueChange(option, fieldKey)}
          onFocus={(fieldKey: string) => onFocus(fieldKey)}
          onSearch={(searchValue: string, fieldKey: string) => onSearch(searchValue, fieldKey)}
        />
        <AuditFields
          isEditable={useUpsert.isEditable}
          fieldControls={useUpsert.auditFields}
          onGetField={(fieldKey: string) => useUpsert.getField(fieldKey)}
          isNew={useUpsert.isAddNew}
        />
      </DetailsEditorWrapper>
    </ConfirmNavigate>
  );
};

export default inject(
  'settingsStore',
  'aircraftOperatorRestrictionsStore',
  'entityOptionsStore',
  'aircraftOperatorSettingsStore',
  'sidebarStore'
)(observer(UpsertAircraftOperatorRestriction));
