import React, { FC, ReactNode, useEffect, useState, ReactElement } from 'react';
import {
  DATE_FORMAT,
  GRID_ACTIONS,
  IAPIGridRequest,
  IOptionValue,
  ISelectOption,
  IdNameCodeModel,
  SEARCH_ENTITY_TYPE,
  UIStore,
  Utilities,
  ViewPermission,
  baseEntitySearchFilters,
} from '@wings-shared/core';
import { AuditFields, EDITOR_TYPES, ViewInputControlsGroup, IGroupInputControls } from '@wings-shared/form-controls';
import { useConfirmDialog, useUnsubscribe } from '@wings-shared/hooks';
import { DetailsEditorHeaderSection, DetailsEditorWrapper, MenuItem, SidebarStore } from '@wings-shared/layout';
import {
  AirportModel,
  BulletinEntityModel,
  EntityOptionsStore,
  IAPILocationAirport,
  ModelStatusOptions,
  NO_SQL_COLLECTIONS,
  useBaseUpsertComponent,
  VIEW_MODE,
} from '@wings/shared';
import { inject, observer } from 'mobx-react';
import { useNavigate, useParams } from 'react-router';
import { finalize, takeUntil } from 'rxjs/operators';
import { BulletinModel } from '../Models';
import { BulletinStore } from '../Stores/Bulletin.store';
import { fields } from './Fields';
import { useStyles } from './UpsertBulletin.styles';
import { SecondaryButton } from '@uvgo-shared/buttons';
import { ModalStore } from '@uvgo-shared/modal-keeper';
export interface INavigationLink {
  to: string;
  title: string;
  icon?: string | ReactElement;
  isHidden?: boolean;
  isDisabled?: boolean;
}

interface Props {
  updatedSidebarOptions?: (
    tabQuery: string,
    searchQueryParams?: string,
    isDisabled?: boolean
  ) => MenuItem[] | INavigationLink[];
  bulletinStore?: BulletinStore;
  entityOptionsStore?: EntityOptionsStore;
  sidebarStore?: typeof SidebarStore;
  securityModule: any;
  basePath: string;
  purgedBulletins?: boolean;
  isCountryBulletins?: boolean;
  defaultSidebarOptions?: (defaultOptions: boolean, isDisabled?: boolean) => MenuItem[] | INavigationLink[];
  isAssociatedBulletins?: boolean;
}

const UpsertBulletin: FC<Props> = ({
  updatedSidebarOptions,
  entityOptionsStore,
  bulletinStore,
  basePath,
  securityModule,
  sidebarStore,
  purgedBulletins = false,
  defaultSidebarOptions,
  isAssociatedBulletins = false,
  ...props
}: Props) => {
  const message =
    'Total count of Characters for Bulletin Text, Internal Notes and  Source Notes should not exceed 1950.';
  const [ selectedBulletin, setSelectedBulletin ] = useState(new BulletinModel());
  const [ bulletinEntityOptions, setBulletinEntityOptions ] = useState([]);
  const params = useParams();
  const unsubscribe = useUnsubscribe();
  const useUpsert = useBaseUpsertComponent<BulletinModel>(params, fields, baseEntitySearchFilters);
  const navigate = useNavigate();
  const classes = useStyles();
  const backNavLink = `${basePath}/${purgedBulletins ? 'purged-bulletins' : 'bulletins'}`;
  const bulletinLevel = useUpsert.getField('bulletinLevel').value?.name;
  const _useConfirmDialog = useConfirmDialog();
  const [ notesErrorsMap, setNotesErrorsMap ] = useState<Map<string, string>>(new Map());
  const _collection = props.isCountryBulletins
    ? NO_SQL_COLLECTIONS.COUNTRY_BULLETIN
    : NO_SQL_COLLECTIONS.AIRPORT_BULLETIN;

  useEffect(() => {
    if (isAssociatedBulletins) {
      const { airportId } = params;
      sidebarStore?.setNavLinks(updatedSidebarOptions('Associated Bulletins', '', !Boolean(airportId)), basePath);
    }
    if (updatedSidebarOptions) sidebarStore.setNavLinks(updatedSidebarOptions('Bulletins'), basePath);
    useUpsert.setViewMode((params.viewMode.toUpperCase() as VIEW_MODE) || VIEW_MODE.DETAILS);
    loadInitialData();
    validateNotes();
    return () => {
      if (defaultSidebarOptions) sidebarStore?.setNavLinks(defaultSidebarOptions(true), basePath);
    };
  }, [ params.bulletinId, params.purgedBulletinId ]);

  /* istanbul ignore next */
  const fetchBulletinsApi = (): any => {
    const request: IAPIGridRequest = {
      filterCollection: JSON.stringify([ Utilities.getFilter('BulletinId', parseInt(params.bulletinId)) ]),
    };
    return purgedBulletins
      ? bulletinStore.getBulletinById(parseInt(params.purgedBulletinId), purgedBulletins)
      : bulletinStore.getBulletinsNoSql(request, _collection);
  };

  /* istanbul ignore next */
  const loadInitialData = (): void => {
    const _id = purgedBulletins ? params.purgedBulletinId : params.bulletinId;
    if (!_id) {
      useUpsert.setFormValues(selectedBulletin);
      setRequiredRule();
      return;
    }
    UIStore.setPageLoader(true);
    fetchBulletinsApi()
      ?.pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(response => {
        const _response = purgedBulletins ? response : response.results[0];
        setSelectedBulletin(_response);
        useUpsert.setFormValues(_response);
        useUpsert.setFormRules('endDate', !_response?.isUFN);
        setRequiredRule();
      });
  };

  // Save Bulletin data
  const upsertBulletin = (): void => {
    const _airport = useUpsert.getField('vendorLocationAirport')?.value;
    const request = new BulletinModel({
      ...selectedBulletin,
      ...useUpsert.form.values(),
      vendorLocationAirport: _airport
        ? new IdNameCodeModel({
          ..._airport,
          id: _airport?.airportId,
        })
        : null,
    });
    UIStore.setPageLoader(true);
    bulletinStore
      ?.upsertBulletin(request.serialize())
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: BulletinModel) => {
          useUpsert.form.reset();
          useUpsert.setFormValues(response);
          useUpsert.setViewMode(params.viewMode.toUpperCase() as VIEW_MODE);
          if (!request.id) {
            setTimeout(() => {
              navigate(`/${props.isCountryBulletins ? 'countries' : 'airports'}/bulletins/${response.id}/edit`, {
                replace: true,
              });
            }, 1000);
          }
        },
        error: error => useUpsert.showAlert(error.message, 'upsertBulletin'),
      });
  };

  const validateNotes = () => {
    const isWFSCappsCategory = Utilities.isEqual(useUpsert.getField('bulletinCAPPSCategory').value?.code, 'WFS');
    const notesFields = [ 'bulletinText', 'internalNotes', 'sourceNotes' ];
    if (!isWFSCappsCategory) {
      notesFields.forEach(key => setNotesErrorsMap(new Map(notesErrorsMap.set(key, ''))));
      return;
    }
    let _sum = 0;
    notesFields.forEach(key => {
      const _value = useUpsert.getField(key)?.value?.trim();
      if (Boolean(_value)) {
        _sum += _value.length;
        notesFields.forEach(key => setNotesErrorsMap(new Map(notesErrorsMap.set(key, _sum > 1950 ? message : ''))));
      }
    });
  };

  const setRequiredRule = (): void => {
    const { accessLevel, internalNotes, dmNotes } = useUpsert.form.values();
    const isPublic = Utilities.isEqual(accessLevel?.name, 'Public');
    useUpsert.setFormRules('bulletinText', isPublic);
    useUpsert.setFormRules('internalNotes', !Boolean(dmNotes) && !isPublic);
    useUpsert.setFormRules('dmNotes', !Boolean(internalNotes) && !isPublic);
    useUpsert.form.validate();
  };

  const onValueChange = (value: IOptionValue, fieldKey: string): void => {
    useUpsert.getField(fieldKey).set(value);
    switch (fieldKey) {
      case 'bulletinLevel':
        useUpsert.clearFormFields([ 'bulletinEntity', 'country', 'state' ]);
        setBulletinEntityOptions([]);
        entityOptionsStore.countries = [];
        entityOptionsStore.states = [];
        const isCity = Utilities.isEqual((value as ISelectOption)?.label, 'city');
        const isState = Utilities.isEqual((value as ISelectOption)?.label, 'state');
        useUpsert.getField('state').set('rules', isCity ? 'required' : '');
        useUpsert.getField('country').set('rules', isCity || isState ? 'required' : '');
        break;
      case 'country':
        useUpsert.clearFormFields([ 'bulletinEntity', 'state' ]);
        setBulletinEntityOptions([]);
        entityOptionsStore.states = [];
        break;
      case 'state':
        useUpsert.getField('bulletinEntity').clear();
        setBulletinEntityOptions([]);
        break;
      case 'isUFN':
        useUpsert.setFormRules('endDate', !value);
        useUpsert.getField('endDate').validate();
        break;
      case 'accessLevel':
      case 'dmNotes':
        setRequiredRule();
        break;
      case 'bulletinEntity':
        if (!value) {
          useUpsert.getField('vendorLocationAirport').clear();
          return;
        }
        const airportReference = (value as { airportReference: AirportModel }).airportReference;
        useUpsert.getField('vendorLocationAirport').set(airportReference);
        break;
      case 'internalNotes':
        setRequiredRule();
        validateNotes();
        break;
      case 'bulletinCAPPSCategory':
      case 'bulletinText':
      case 'sourceNotes':
        validateNotes();
        break;
      default:
        useUpsert.getField(fieldKey).set(value);
    }
  };

  const getEntitySearchRequest = (searchValue, codeProperty, searchEntity): IAPIGridRequest => {
    const _countryId = useUpsert.getField('country').value?.entityId;
    const _stateId = useUpsert.getField('state').value?.entityId;
    const _collection = [
      Utilities.getFilter('CommonName', searchValue),
      Utilities.getFilter('Code', searchValue, 'or'),
    ];
    const filters = _stateId
      ? Utilities.getFilter('State.StateId', _stateId)
      : Utilities.getFilter('Country.CountryId', _countryId);

    if ([ 'City', 'State' ].includes(searchEntity)) {
      return codeProperty
        ? {
          ...useUpsert.getSearchRequest(searchValue, searchEntity, [ filters ]),
          searchCollection: JSON.stringify(_collection),
        }
        : useUpsert.getSearchRequest(searchValue, searchEntity, [ filters ]);
    }
    return useUpsert.getSearchRequest(searchValue, searchEntity);
  };

  // Search Entity based on field value
  const onSearch = (searchValue, fieldKey, searchEntityType): void => {
    if (!searchValue.length) {
      setBulletinEntityOptions([]);
      entityOptionsStore.states = [];
      entityOptionsStore.countries = [];
      return;
    }
    const codeProperty = Utilities.isEqual(bulletinLevel, 'state') ? 'stateCode' : '';
    useUpsert.loader.showLoader();
    entityOptionsStore
      .searchEntity(
        searchEntityType,
        getEntitySearchRequest(searchValue, codeProperty, searchEntityType),
        searchValue,
        codeProperty
      )
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => useUpsert.loader.hideLoader())
      )
      .subscribe(response => {
        if (Utilities.isEqual(fieldKey, 'country')) {
          entityOptionsStore.countries = response;
          return;
        }
        if (Utilities.isEqual(fieldKey, 'state')) {
          entityOptionsStore.states = response;
          return;
        }
        const options = codeProperty ? response.filter(x => Boolean(x.code)) : response;
        setBulletinEntityOptions(options);
      });
  };

  const activateBulletin = () => {
    UIStore.setPageLoader(true);
    bulletinStore
      ?.activateBulletin(Number(params.purgedBulletinId))
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: () => {
          navigate(backNavLink);
        },
        error: error => {
          useUpsert.showAlert(error.message, 'activateBulletin');
        },
      });
  };

  const confirmActivateBulletin = () => {
    _useConfirmDialog.confirmAction(
      () => {
        activateBulletin();
        ModalStore.close();
      },
      {
        message: 'Are you sure you want to clone this bulletin?',
        title: 'Confirm clone',
      }
    );
  };

  const onAction = (action: GRID_ACTIONS): void => {
    switch (action) {
      case GRID_ACTIONS.SAVE:
        upsertBulletin();
        break;
      case GRID_ACTIONS.EDIT:
        useUpsert.setViewMode(VIEW_MODE.EDIT);
        break;
      case GRID_ACTIONS.TOGGLE_STATUS:
        confirmActivateBulletin();
        break;
      case GRID_ACTIONS.CANCEL:
      default:
        if (Utilities.isEqual(params.viewMode, VIEW_MODE.DETAILS)) {
          useUpsert.form.reset();
          useUpsert.setFormValues(selectedBulletin);
          useUpsert.setViewMode(VIEW_MODE.DETAILS);
          return;
        }
        navigate(backNavLink);
        break;
    }
  };

  const onFocus = (fieldKey: string): void => {
    switch (fieldKey) {
      case 'bulletinLevel':
        useUpsert.observeSearch(bulletinStore?.getBulletinLevels());
        setBulletinEntityOptions([]);
        break;
      case 'appliedBulletinTypes':
        useUpsert.observeSearch(bulletinStore?.getBulletinTypes());
        break;
      case 'bulletinPriority':
        useUpsert.observeSearch(bulletinStore?.getBulletinPriorities());
        break;
      case 'uaOffice':
        useUpsert.observeSearch(bulletinStore?.loadUAOffices());
        break;
      case 'bulletinSource':
        useUpsert.observeSearch(bulletinStore?.getSources());
        break;
      case 'accessLevel':
        useUpsert.observeSearch(bulletinStore?.getAccessLevels());
        break;
      case 'bulletinCAPPSCategory':
        useUpsert.observeSearch(bulletinStore?.loadCappsCategory());
        break;
    }
  };

  const entityOptionTooltip = (option): string => {
    const _state = option.state ? option.state.name.toUpperCase() : '';
    const _country = option.country ? option.country.name.toUpperCase() : '';
    if (Utilities.isEqual(bulletinLevel, 'city')) {
      return _state && _country ? `${_state} - ${_country}` : _state || _country;
    }
    return Utilities.isEqual(bulletinLevel, 'state') && _country ? _country : '';
  };

  const disableBulletinEntity = (): boolean => {
    if (Utilities.isEqual(bulletinLevel, 'state')) {
      return !Boolean(useUpsert.getField('country').value?.name);
    }
    if (Utilities.isEqual(bulletinLevel, 'city')) {
      return !Boolean(useUpsert.getField('state').value?.name);
    }
    return !Boolean(bulletinLevel) || useUpsert.isEditView;
  };

  const groupInputControls = (): IGroupInputControls[] => {
    return [
      {
        title: '',
        inputControls: [
          {
            fieldKey: 'bulletinLevel',
            type: EDITOR_TYPES.DROPDOWN,
            options: bulletinStore.bulletinLevels,
            isDisabled: useUpsert.isEditView,
          },
          {
            fieldKey: 'country',
            type: EDITOR_TYPES.DROPDOWN,
            searchEntityType: SEARCH_ENTITY_TYPE.COUNTRY,
            options: entityOptionsStore.countries,
            isServerSideSearch: true,
            isLoading: useUpsert.loader.isLoading,
            isDisabled: !Boolean(bulletinLevel),
            isHidden: useUpsert.isEditView || !Boolean(bulletinLevel) || ![ 'City', 'State' ].includes(bulletinLevel),
          },
          {
            fieldKey: 'state',
            type: EDITOR_TYPES.DROPDOWN,
            searchEntityType: SEARCH_ENTITY_TYPE.STATE,
            options: entityOptionsStore.states,
            isServerSideSearch: true,
            isLoading: useUpsert.loader.isLoading,
            isDisabled: !Boolean(useUpsert.getField('country').value?.name),
            isHidden: useUpsert.isEditView || !Boolean(bulletinLevel) || !Utilities.isEqual('city', bulletinLevel),
          },
          {
            fieldKey: 'bulletinEntity',
            type: EDITOR_TYPES.DROPDOWN,
            searchEntityType: bulletinLevel,
            options: bulletinEntityOptions,
            isServerSideSearch: true,
            isLoading: useUpsert.loader.isLoading,
            isDisabled: disableBulletinEntity(),
            getOptionLabel: option => (option as BulletinEntityModel)?.label,
            showTooltip: true,
            getOptionTooltip: entityOptionTooltip,
          },
          {
            fieldKey: 'vendorLocationAirport',
            type: EDITOR_TYPES.DROPDOWN,
            getOptionLabel: (option: IAPILocationAirport) => {
              if (option?.displayCode) {
                return `${option.airportName} (${option.displayCode})`;
              }
              return option?.airportName || '';
            },
            isDisabled: true,
            options: [],
            isHidden: props.isCountryBulletins,
          },
        ],
      },
      {
        title: '',
        inputControls: [
          {
            fieldKey: 'appliedBulletinTypes',
            type: EDITOR_TYPES.DROPDOWN,
            options: bulletinStore.bulletinTypes,
          },
          {
            fieldKey: 'bulletinPriority',
            type: EDITOR_TYPES.DROPDOWN,
            options: bulletinStore.bulletinPriorities,
          },
          {
            fieldKey: 'bulletinCAPPSCategory',
            type: EDITOR_TYPES.DROPDOWN,
            options: bulletinStore.cappsCategory,
          },
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
            fieldKey: 'isUFN',
            type: EDITOR_TYPES.CHECKBOX,
          },
          {
            fieldKey: 'notamNumber',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'uaOffice',
            type: EDITOR_TYPES.DROPDOWN,
            options: bulletinStore.uaOffices,
          },
          {
            fieldKey: 'vendorName',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'syncToCAPPS',
            type: EDITOR_TYPES.CHECKBOX,
            isHidden: true, // as per 159401
          },
          {
            fieldKey: 'runTripChecker',
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
            fieldKey: 'bulletinText',
            type: EDITOR_TYPES.TEXT_FIELD,
            multiline: true,
            isFullFlex: true,
            rows: 3,
            customErrorMessage: notesErrorsMap.get('bulletinText'),
            showCounter: true,
          },
        ],
      },
      {
        title: '',
        inputControls: [
          {
            fieldKey: 'internalNotes',
            type: EDITOR_TYPES.TEXT_FIELD,
            multiline: true,
            isFullFlex: true,
            rows: 3,
            customErrorMessage: notesErrorsMap.get('internalNotes'),
            showCounter: true,
          },
        ],
      },
      {
        title: '',
        inputControls: [
          {
            fieldKey: 'dmNotes',
            type: EDITOR_TYPES.TEXT_FIELD,
            multiline: true,
            isFullFlex: true,
            rows: 3,
          },
        ],
      },
      {
        title: '',
        inputControls: [
          {
            fieldKey: 'sourceNotes',
            type: EDITOR_TYPES.TEXT_FIELD,
            multiline: true,
            isFullFlex: true,
            rows: 3,
            customErrorMessage: notesErrorsMap.get('sourceNotes'),
            showCounter: true,
          },
        ],
      },
      {
        title: '',
        inputControls: [
          {
            fieldKey: 'bulletinSource',
            type: EDITOR_TYPES.DROPDOWN,
            options: bulletinStore.sources,
          },
          {
            fieldKey: 'accessLevel',
            type: EDITOR_TYPES.DROPDOWN,
            options: bulletinStore.accessLevels,
          },
          {
            fieldKey: 'status',
            type: EDITOR_TYPES.DROPDOWN,
            options: ModelStatusOptions,
          },
        ],
      },
    ];
  };

  const headerActions = (): ReactNode => {
    const _title = isAssociatedBulletins ? 'Associated Bulletins' : purgedBulletins ? 'Purged Bulletins' : 'Bulletins';
    return (
      <>
        <DetailsEditorHeaderSection
          title={_title}
          backNavTitle={_title}
          disableActions={
            useUpsert.form.hasError ||
            UIStore.pageLoading ||
            !useUpsert.form.changed ||
            [ ...notesErrorsMap.values() ].some(v => v)
          }
          backNavLink={isAssociatedBulletins ? `/${basePath}/${'associated-bulletins'}` : backNavLink}
          isEditMode={useUpsert.isEditable}
          hasEditPermission={securityModule.isEditable && !purgedBulletins}
          onAction={action => onAction(action)}
          hideActionButtons={isAssociatedBulletins}
        />
        <ViewPermission hasPermission={securityModule.isEditable && purgedBulletins}>
          <SecondaryButton
            variant="contained"
            onClick={() => onAction(GRID_ACTIONS.TOGGLE_STATUS)}
            disabled={UIStore.pageLoading}
          >
            Clone
          </SecondaryButton>
        </ViewPermission>
      </>
    );
  };

  return (
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
        onFocus={onFocus}
        onSearch={onSearch}
      />
      <AuditFields
        isNew={useUpsert.isAddNew}
        isEditable={useUpsert.isEditable}
        fieldControls={useUpsert.auditFields}
        onGetField={(fieldKey: string) => useUpsert.getField(fieldKey)}
      />
    </DetailsEditorWrapper>
  );
};

export default inject('bulletinStore', 'sidebarStore', 'entityOptionsStore')(observer(UpsertBulletin));
