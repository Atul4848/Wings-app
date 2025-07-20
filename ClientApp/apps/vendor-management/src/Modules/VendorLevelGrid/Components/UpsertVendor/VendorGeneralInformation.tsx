import React, { FC, useRef, ReactNode, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  IGroupInputControls,
  VIEW_MODE,
  BaseUpsertComponent,
  useGridState,
  useAgGrid,
  CountryModel,
  StateModel,
  CityModel,
  CustomAgGridReact,
  AgGridMasterDetails,
} from '@wings/shared';
import { PrimaryButton } from '@uvgo-shared/buttons';
import {
  Airports,
  StatusBaseModel,
  useVMSModuleSecurity,
  VENDOR_LOCATION_COMPARISON_FILTERS,
  VendorLocationModel, VendorManagmentModel } from '../../../Shared';
import { ColDef, GridOptions, RowNode, } from 'ag-grid-community';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { 
  BaseStore, 
  SettingsStore, 
  VendorManagementStore, 
  VendorLocationStore } from '../../../../Stores';
import { useUnsubscribe } from '@wings-shared/hooks';
import { inject, observer } from 'mobx-react';
import { AddVendorViewInputControls } 
  from '../../../Core/Components/AddVendorViewInputControls/AddVendorViewInputControls';
import { fields } from './Fields';
import { withStyles } from '@material-ui/core';
import { styles } from './VendorGeneralInformation.styles';
import { 
  IAPISearchFiltersDictionary, 
  IOptionValue, 
  UIStore, 
  GRID_ACTIONS, 
  Utilities, 
  regex, 
  SelectOption, 
  cellStyle, 
  IAPIGridRequest, 
  IAPIPageResponse, 
  GridPagination, 
  SEARCH_ENTITY_TYPE,
  ViewPermission,
  IClasses
} from '@wings-shared/core';
import { finalize, takeUntil } from 'rxjs/operators';
import { NavigateFunction, useNavigate } from 'react-router';
import { 
  DetailsEditorHeaderSection, 
  DetailsEditorWrapper, 
  ConfirmDialog 
} from '@wings-shared/layout';

import { EDITOR_TYPES } from '@wings-shared/form-controls';
import { gridFilters } from '../../../VendorLocationGrid/fields';
import { forkJoin } from 'rxjs';
import { IAPIVMSVendorLocationComparison } from '../../../Shared/Interfaces';
import { VendorAddressModel } from '../../../Shared/Models/VendorAddress.model';
import CustomTooltip from '../../../Shared/Components/Tooltip/CustomTooltip';

interface Props {
  classes:IClasses,
  settingsStore?: SettingsStore;
  vendorManagementStore?: VendorManagementStore;
  searchFilters: IAPISearchFiltersDictionary;
  vendorLocationStore?: VendorLocationStore;
  navigate: NavigateFunction;
  params?: {vendorCode: string, vendorName: string };
}

const VendorGeneralInformation: FC<Props> = ({ 
  classes,
  settingsStore, 
  vendorManagementStore,
  searchFilters, 
  vendorLocationStore 
}) => {
  const params = useParams();
  const gridState = useGridState();
  const agGrid = useAgGrid<VENDOR_LOCATION_COMPARISON_FILTERS, VendorLocationModel>(gridFilters, gridState);
  const unsubscribe = useUnsubscribe();
  const baseUpsert = useRef(new BaseUpsertComponent<Props,VendorLocationModel>(
    { settingsStore,vendorManagementStore,searchFilters } , fields,searchFilters));
  const formRef = baseUpsert.current;
  const navigate= useNavigate();
  const vmsModuleSecurityV2 = useVMSModuleSecurity();
  const [ selectedVendor, setSelectedVendor ] = useState({});
  const [ countryList, setCountryList ] = useState([]);
  const [ statesList, setStatesList ] = useState([]);
  const [ isSaved, setIsSaved ] = useState(false);
  const [ viewMode, setViewMode ] = useState((params.viewMode?.toUpperCase() as VIEW_MODE) || VIEW_MODE.DETAILS);

  const isEditable =(): boolean => {
    return Utilities.isEqual(viewMode, VIEW_MODE.EDIT) || Utilities.isEqual(viewMode, VIEW_MODE.NEW);
  }
  const [ isGridEditing, setIsGridEditing ] = useState(!isEditable());
  
  useEffect(() => {
    loadInitialData();
    loadLocationData();
    vendorManagementStore?.getVmsCountryCode().subscribe((response)=>{
      setCountryList(response.results);
    });     
  }, []);
 

  const columnDefs: ColDef[] = [
    {
      headerName: 'Vendor',
      field: 'vendor.name',
      editable: false,
      headerTooltip:'Vendor',
    },
    {
      headerName: 'Vendor Code',
      field: 'vendor.code',
      editable: false,
      headerTooltip:'Vendor Code',
    },
    {
      headerName: 'Location Name',
      field: 'name',
      headerTooltip:'Location Name',
      cellEditorParams: {
        placeHolder: 'name',
        ignoreNumber: true,
        rules: 'required|string|between:3,200',
      },
    },
    {
      headerName: 'Location Code',
      field: 'code',
      headerTooltip:'Location Code',
      cellEditorParams: {
        placeHolder: 'code',
        ignoreNumber: true,
        rules: `string|between:2,3|regex:${regex.alphaNumericWithoutSpaces}`,
      },
    },
    {
      headerName: 'Airport',
      field: 'airportReference',
      cellEditor: 'customAutoComplete',
      valueFormatter: ({ value }) => airportValueFormatter(value),
      comparator: (current, next) => Utilities.customComparator(current, next, 'airportName'),
      headerTooltip:'Airport',
      cellEditorParams: {
        getAutoCompleteOptions: () => vendorLocationStore?.airportList,
        onSearch: (value: string) => vendorLocationStore?.searchAirport(value),
        valueGetter: (option: SelectOption) => option?.value,
        placeHolder: 'airportCode',
        ignoreNumber: true,
        isRequired: true,
      },
    },
    {
      headerName: 'Status',
      field: 'vendorLocationStatus',
      cellEditor: 'customAutoComplete',
      valueFormatter: ({ value }) => value?.name || '',
      comparator: (current, next) => Utilities.customComparator(current, next, 'name'),
      headerTooltip:'Status',
      cellEditorParams: {
        getAutoCompleteOptions: () => settingsStore?.vendorLocationSettings,
        valueGetter: (option: SelectOption) => option.value,
        placeHolder: 'locationStatus',
        ignoreNumber: true,
        isRequired: true,
      },
    },
    {
      field: 'actionRenderer',
      suppressNavigable: true,
      headerName: '',
      cellRenderer: 'actionRenderer',
      cellEditor: 'actionRenderer',
      suppressMenu: true,
      suppressMovable: true,
      hide:!isEditable(),
      suppressSizeToFit: true,
      minWidth: 150,
      maxWidth: 150,
      cellStyle: { ...cellStyle() },
    },
  ];

  const groupInputControls = (): IGroupInputControls[] => {
    return [
      {
        title: 'General Information:',
        inputControls: [
          {
            fieldKey: 'id',
            type: EDITOR_TYPES.TEXT_FIELD,
            isHidden:true
          },
          {
            fieldKey: 'name',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'code',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'vendorStatus',
            type: EDITOR_TYPES.DROPDOWN,
            options: settingsStore?.vendorSettings
          },
          {
            fieldKey: 'legalCompanyName',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'headquartersAddressStreet',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'hqAddressCountry',
            type: EDITOR_TYPES.DROPDOWN,
            options: countryList,
            searchEntityType: SEARCH_ENTITY_TYPE.COUNTRY,
          },
          {
            fieldKey: 'hqAddressState',
            type: EDITOR_TYPES.DROPDOWN,
            options: statesList,
            isDisabled: !isCountrySelected(),
            searchEntityType: SEARCH_ENTITY_TYPE.STATE,
            getOptionLabel: state => (state as StateModel)?.label,
          },
          {
            fieldKey: 'hqAddressCity',
            type: EDITOR_TYPES.DROPDOWN,
            options: vendorManagementStore?.cities,
            isDisabled: !isCountrySelected(),
          },
          {
            fieldKey: 'hqAddressZipCode',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'is3rdPartyLocation',
            type: EDITOR_TYPES.CHECKBOX,
          },
          {
            fieldKey: 'vendorEmailId',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
        ],
      },
    ];
  }

  const upsertVendor = ():void =>{
    if(!isSaved){
      const request = new VendorManagmentModel(formRef.form.values());
      request.id = (request.id==undefined|| request.id==null||request.id=='')?0:request.id;
      request.vendorStatusId = request.vendorStatus.id;
      request.is3rdPartyLocation = Boolean(request.is3rdPartyLocation);
      request.vendorAddress.push(VendorManagmentModel.buildVendorAddress(request));
      setIsSaved(true);
      vendorManagementStore?.upsertVendor(request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: VendorManagmentModel) => {
          vendorManagementStore.selectedVendor = response;
          formRef.form.reset();
          vendorManagementStore.countries = [];
          vendorManagementStore.states = [];
          vendorManagementStore.cities = [];
          navigate('/vendor-management');
        },
        error: error => {
          setIsSaved(false);
          BaseStore.showAlert(error.message, request.id);
        },
      });
    }
  };

  const getField = (fieldKey) =>{
    return formRef.form.$(fieldKey);
  }

  const onSearch = (searchValue: string, fieldKey: string): void => {
    switch (fieldKey) {
      case 'hqAddressCountry':
        const filteredList = vendorManagementStore.countries.filter(country => {
          return (
            country.commonName?.toLowerCase().includes(searchValue.toLowerCase()) ||
            country.isO2Code?.toLowerCase().includes(searchValue.toLowerCase())
          );
        });
        setCountryList(filteredList);
        break;
      case 'hqAddressCity':
        loadCities(searchValue);
        break;
      default:
        break;
    }
    return;
  }

  const removeUnSavedRow= (rowIndex:number)=>{
    const data: VendorLocationModel = agGrid._getTableItem(rowIndex);
    if(data.id==0)
    {
      const model = agGrid._getTableItem(rowIndex);
      const modelList = new  Array(model);
      agGrid._removeTableItems(modelList);
    }
  }

  const getConfirmation = (rowIndex:number): void => {
    ModalStore.open(
      <ConfirmDialog
        title="Confirm Changes"
        message={'Leaving this page will lost your changes. Are you sure you want to leave this page?'}
        yesButton="Confirm"
        onNoClick={() => ModalStore.close()}
        onYesClick={() => {
          ModalStore.close();
          navigate('/vendor-management');
        }}
      />
    );
  }

  
  const loadInitialData = (pageRequest?: IAPIGridRequest) => {
    const request: IAPIGridRequest = {
      pageNumber: gridState.pagination.pageNumber,
      pageSize: gridState.pagination.pageSize,
      searchCollection:JSON.stringify([{
        propertyName: 'Code',
        propertyValue: params.vendorCode
      }]),
      ...agGrid.filtersApi.gridSortFilters(),
      ...pageRequest,
    };
    UIStore.setPageLoader(true);
    vendorManagementStore?.getVMSComparison(request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe((response: IAPIPageResponse<VendorManagmentModel>) => {
        setSelectedVendor(response.results[0]);
        Object.keys(response.results[0]).forEach((data)=>{
          if(data === 'name' 
          || data === 'code' 
          || data === 'vendorStatus'
          || data === 'legalCompanyName' 
          || data === 'is3rdPartyLocation'
          || data === 'vendorEmailId'
          || data === 'id'){
            getField(data).set(response.results[0][data])  
          }
          else if(data === 'vendorAddress')
          {
            const vendorAddressList:VendorAddressModel[] = 
            VendorAddressModel.deserializeList(response.results[0][data]);
            if(vendorAddressList && vendorAddressList.length>0)
            {
              const hqAddress = vendorAddressList.find(va=>va.addressTypeId==1);
              if(hqAddress)
              {
                const countryModel = new CountryModel({
                  id:hqAddress?.countryId,
                  commonName:hqAddress?.countryName,
                  isO2Code:hqAddress?.countryCode
                });
                const stateModel = new StateModel({
                  id:hqAddress?.stateId,
                  commonName:hqAddress?.stateName,
                  code:hqAddress?.stateCode
                });
                const cityModel = new CityModel({
                  id:hqAddress?.cityId,
                  cappsCode:hqAddress?.cityCode,
                  commonName:hqAddress?.cityName
                });
                getField('hqAddressCountry').set(countryModel); 
                getField('hqAddressState').set(stateModel); 
                getField('hqAddressCity').set(cityModel); 
                getField('hqAddressZipCode').set(hqAddress?.zipCode); 
                getField('headquartersAddressStreet').set(hqAddress?.street); 
              }
            }
          }
        })
      });
  };

  const loadLocationData = (pageRequest?: IAPIGridRequest) => {
    const request: IAPIGridRequest = {
      pageNumber: gridState.pagination.pageNumber,
      pageSize: gridState.pagination.pageSize,
      searchCollection:JSON.stringify([{
        propertyName: 'Vendor.Code',
        propertyValue: params.vendorCode
      }]),
      ...agGrid.filtersApi.gridSortFilters(),
      ...pageRequest,
    };
    UIStore.setPageLoader(true);
    forkJoin([
      vendorLocationStore.getVMSComparison(request),
      settingsStore.getVendorLocationSettings(),
      vendorLocationStore?.getVmsIcaoCode(),
    ])
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe((response: [IAPIPageResponse<IAPIVMSVendorLocationComparison>, StatusBaseModel[]]) => {
        gridState.setPagination(new GridPagination({ ...response[0] }));
        const results = VendorLocationModel.deserializeList(response[0].results);
        gridState.setGridData(results);
       
        const allowSelectAll = response[0].totalNumberOfRecords <= response[0].pageSize;
        gridState.setAllowSelectAll(allowSelectAll);
        agGrid.reloadColumnState();
        agGrid.refreshSelectionState();
      });
  };

  const onValueChange = (value:IOptionValue,fieldKey : string): void => {
    getField(fieldKey).set(value);
    if(value!=undefined && value!=null)
    {
      switch(fieldKey){
        case 'hqAddressCountry':
          vendorManagementStore.cities = [];
          vendorManagementStore.states = [];
          getField('hqAddressState').clear();
          getField('hqAddressCity').clear();
          filterStateByCountry(value);
          setCountryList(vendorManagementStore?.countries);
          loadCities('');
          break;
        case 'hqAddressState':
          vendorManagementStore.cities = [];
          getField('hqAddressCity').clear();
          break;
        case 'hqAddressCity':
          vendorManagementStore.cities=[];
          break;
        default:
          break;
      }
    }
    gridState.hasError = Utilities.hasInvalidRowData(gridState.gridApi);
  }

  const filterStateByCountry=(value?:any)=>{
   
    const filter = (value)?JSON.stringify([{
      propertyName: 'Country.CountryId',
      propertyValue: value.id,
    }]):'';
   
    const request: IAPIGridRequest = {
      filterCollection:filter
    };
    vendorManagementStore?.getVmsStates(request,undefined).subscribe((response)=>{
      setStatesList(response.results);    
    });
  }

  const loadCities=(searchValue: string): void =>{
    const countryId: number = getField('hqAddressCountry').value?.id;
    // if (!countryId || !searchValue) {
    //   vendorManagementStore.cities = [];
    //   return;
    // }
    const stateId: number = getField('hqAddressState').value?.id;
    const filters = stateId
      ? Utilities.getFilter('State.StateId', stateId)
      : Utilities.getFilter('Country.CountryId', countryId);

    const searchCityFilter= (searchValue)?[{
      propertyName: 'CommonName',
      propertyValue: searchValue
    },
    {
      propertyName: 'OfficialName',
      operator: 'or',
      propertyValue: searchValue
    }]:[];

    const filterCollection = [ filters ];
    const request: IAPIGridRequest = {
      filterCollection:JSON.stringify(filterCollection),
      searchCollection: JSON.stringify(searchCityFilter)
    };
    vendorManagementStore?.getVmsCities(request).subscribe();
  }

  const isCountrySelected = (): boolean => {
    const { value } = getField('hqAddressCountry');
    return Boolean((value as CountryModel)?.id);
  }
  
  const dialogHeader = (): ReactNode => {
    return (
      viewMode === VIEW_MODE.NEW ? 
        'Add Vendor'
        :
        viewMode === VIEW_MODE.EDIT?
          'Update Vendor'
          :
          'Vendor Details'
    )
  }

  const headerActions = (): ReactNode => {
    return (
      <DetailsEditorHeaderSection
        title={<CustomTooltip title={dialogHeader()} />}
        backNavTitle="Vendors"
        hideActionButtons={false}
        disableActions={!formRef.form.isValid || !isHasPermissionToAddLocation()}
        backNavLink="/vendor-management"
        isEditMode={isEditable()}
        hasEditPermission={true}
        onAction={action => onAction(action)}
        showStatusButton={false}
        isActive={true}
      />
    );
  }
  
  const onAction = (action: GRID_ACTIONS, rowIndex: number): void => {
    switch (action) {
      case GRID_ACTIONS.EDIT:
        navigate(`/vendor-management/upsert/${params.vendorCode}/edit`);
        setIsGridEditing(false);
        setViewMode(VIEW_MODE.EDIT);
        break;
      case GRID_ACTIONS.SAVE:
        upsertVendor();
        break;
      case GRID_ACTIONS.CANCEL:
        getConfirmation(rowIndex);
        break;
      default:
        if (Utilities.isEqual(params, VIEW_MODE.DETAILS)) {
          formRef.form.reset();
          setViewMode(VIEW_MODE.DETAILS);
          setIsGridEditing(true);
          return;
        }
        navigate('/vendor-management');
        break;
    }
  }

  const onFocus = (fieldKey: string): void => {
    switch (fieldKey) {
      case 'vendorStatus':
        settingsStore?.getVendorSettings().subscribe();  
        break;
      case 'hqAddressState':
        const { value }=getField('hqAddressCountry');
        filterStateByCountry(value);
        break;
      default:
        break
      
    }
  }

  const airportValueFormatter=(airport:Airports)=>{
    if(airport?.airportId)
      return `${airport?.airportName} (${airport?.displayCode||airport?.icaoCode||airport?.uwaCode||airport?.faaCode||airport?.iataCode||airport?.regionalCode})`;
    else
      return '';
  }

  const onInputChange = (): void => {
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
  };

  const onDropDownChange = (): void => {
    gridState.hasError = Utilities.hasInvalidRowData(gridState.gridApi);
  };

  const saveRowData = (rowIndex: number) => {
    upsertVendorLocation(rowIndex);
  };

  const addLocationRow=(): void=> {
    agGrid.setColumnVisible('actionRenderer', true);
    setIsGridEditing(true);
    const model: VendorLocationModel = new VendorLocationModel();
    model.vendor={ code:selectedVendor.code,id:selectedVendor.id,name:selectedVendor.name };
    model.vendorId=selectedVendor.id;
    agGrid.addNewItems([ model ], { startEditing: false, colKey: 'name' });
    gridState.hasError = true;
  }

  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: { onInputChange, onDropDownChange },
      columnDefs,
      isEditable: viewMode == VIEW_MODE.EDIT,
      gridActionProps: {
        isActionMenu: (vmsModuleSecurityV2.isEditable && isEditable()),
        showDeleteButton: false,
        getEditableState: ({ data }: RowNode) => {
          return !Boolean(data.id);
        },
        actionMenus: ({ data }: RowNode) => [
          {
            title: 'Edit',
            action: GRID_ACTIONS.EDIT,
          },
        ],
        getDisabledState: () => gridState.hasError,
        onAction: (action: GRID_ACTIONS, rowIndex: number) => {
          switch (action) {
            case GRID_ACTIONS.EDIT:
              setIsGridEditing(true);
              agGrid._startEditingCell(rowIndex, 'name');
              break;
            case GRID_ACTIONS.SAVE:
              saveRowData(rowIndex);
              break;
            case GRID_ACTIONS.CANCEL:
              removeUnsavedRow(rowIndex);
              break;
          }
        },
      },
    });
    return {
      ...baseOptions,
      pagination: false,
      suppressRowClickSelection: true,
      suppressCellSelection: true,
      suppressScrollOnNewData: true,       
      isExternalFilterPresent: () => false,
      onFilterChanged: () => loadLocationData({ pageNumber: 1 }),
      onCellDoubleClicked: ({ rowIndex, colDef }) => {
        setIsGridEditing(true);
        agGrid._startEditingCell(rowIndex, colDef.field);
      },
      onSortChanged: e => {
        agGrid.filtersApi.onSortChanged(e);
        loadLocationData();
      }
    };
  };

  const removeUnsavedRow=(rowIndex:number)=>{
    agGrid.cancelEditing(rowIndex);
    setIsGridEditing(false);
    const data: VendorLocationModel = agGrid._getTableItem(rowIndex);
    if(!data.id)
    {
      const model = agGrid._getTableItem(rowIndex);
      const modelList = new  Array(model);
      agGrid._removeTableItems(modelList);
    }
    agGrid.filtersApi.resetColumnFilters();
  }

  const isHasPermissionToAddLocation=():boolean=>{
    return !isGridEditing && vmsModuleSecurityV2.isEditable
  }

  const upsertVendorLocation = (rowIndex: number): void => {
    gridState.gridApi.stopEditing();
    const model = agGrid._getTableItem(rowIndex);
    const request = new VendorLocationModel({ ...model });
    const airportModel= request.airportReference as any;
    request.airportReference=airportModel;
    request.airportReferenceId = airportModel.id!=0?airportModel.id:0;
    request.vendorLocationStatusId= request.vendorLocationStatus.id;
    request.vendorId=request.vendor.id;
    request.code=request.code || null;

    UIStore.setPageLoader(true);
        vendorLocationStore
        ?.upsertVendorLocation(request)
        .pipe(
            takeUntil(unsubscribe.destroy$),
            finalize(() => UIStore.setPageLoader(false))
        )
        .subscribe({
          next: (response: VendorLocationModel) => {
            setIsGridEditing(false);
            response.vendorLocationStatus = new StatusBaseModel(response.vendorLocationStatus);
            response.airportReference = Airports.deserializeAirportReference(response.airportReference)
            agGrid._updateTableItem(
              rowIndex,
              response
            );
          },
          error: error => {
            setIsGridEditing(false);
            agGrid._startEditingCell(rowIndex, 'name');
            BaseStore.showAlert(error.message, request.id);
          },
        });
  };

  return (
    <div className={classes.addEditVendorWrapper}>
      <DetailsEditorWrapper headerActions={headerActions()} 
        isEditMode={isEditable()}
        classes={{ headerActions: classes.headerActions }}
      >
        <div className={classes.editorWrapperContainer}>
          <AddVendorViewInputControls                                  
            isEditable={isEditable()}
            groupInputControls={groupInputControls()}
            onGetField={(fieldKey: string) => getField(fieldKey)}
            onValueChange={(option, fieldKey) => onValueChange(option, fieldKey)}
            field={fieldKey => getField(fieldKey)}
            onSearch={(searchValue: string, fieldKey: string) =>
              onSearch(searchValue, fieldKey)}
            onFocus={(fieldKey)=>onFocus(fieldKey)}
          />
          {
            viewMode !== VIEW_MODE.NEW ?
              <>
                <AgGridMasterDetails
                  addButtonTitle="Add Location"
                  onAddButtonClick={() => addLocationRow()}
                  hasAddPermission={isHasPermissionToAddLocation()}
                  disabled={false}
                  key={`master-details-${isEditable()}`}
                  resetHeight={true}
                  isPrimaryBtn={true}
                >

                  <CustomAgGridReact
                    isRowEditing={gridState.isRowEditing}
                    rowData={gridState.data}
                    gridOptions={gridOptions()}
                    serverPagination={true}
                    paginationData={gridState.pagination}
                    onPaginationChange={loadLocationData}
                    classes={{ customHeight: classes.customHeight }}
                  />
                </AgGridMasterDetails>
              </>
              :
              ''
          }
        </div>
        
      </DetailsEditorWrapper>
    </div>
  );
};
export default inject(
  'settingsStore',
  'vendorLocationStore',
  'vendorManagementStore'
)(withStyles(styles)(observer(VendorGeneralInformation)));