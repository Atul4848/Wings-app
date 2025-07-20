import React, { FC, ReactNode, useEffect, useRef, useState } from 'react';
import {
  UIStore,
  SearchStore,
  IClasses,
  IAPIGridRequest,
  GridPagination,
  Utilities,
  GRID_ACTIONS,
} from '@wings-shared/core';
import {
  ColDef,
  ColGroupDef,
  GridOptions,
  ICellEditorParams,
  RowEditingStartedEvent,
  RowNode,
} from 'ag-grid-community';
import { inject, observer } from 'mobx-react';
import { finalize, takeUntil } from 'rxjs/operators';
import { SidebarStore } from '@wings-shared/layout';
import { ISearchHeaderRef, SearchHeaderV2 } from '@wings-shared/form-controls';
import {
  AgGridActions,
  AgGridAutoComplete,
  AgGridCellEditor,
  AgGridGroupHeader,
  AgGridSelectControl,
  AgGridViewRenderer,
  CustomAgGridReact,
  agGridUtilities,
  useAgGrid,
  useGridFilters,
  useGridState,
} from '@wings-shared/custom-ag-grid';
import { useUnsubscribe } from '@wings-shared/hooks';
import { useLocation } from 'react-router';
import {
  LocationOnBoardingApprovalStore,
  SettingsStore,
  SlidesApprovalStore,
  VendorManagementStore,
} from '../../Stores';
import { LOCATION_ONBOARDING_APPROVAL_FILTERS } from '../Shared/Enums/LocationOnBoardingApprovals.enum';
import { LocationOnBoardingApprovalsModel } from '../Shared/Models/LocationOnBoardingApprovals.model';
import { sidebarMenus } from '../Shared/Components/SidebarMenu/SidebarMenu';
import {
  Accordion,
  AccordionDetails,
  AccordionProps,
  AccordionSummary,
  Box,
  Chip,
  Divider,
  Drawer,
  IconButton,
  styled,
  Tooltip,
  Typography,
  withStyles,
} from '@material-ui/core';
import { styles } from './LocationOnBoardingApprovals.styles';
import { gridFilters } from './fields';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import SlidesApproval from './SlidesApproval/SlidesApproval';
import { EditIcon, ViewIcon, ArrowRightIcon } from '@uvgo-shared/icons';
import { Dialog } from '@uvgo-shared/dialog';
import Slide1 from './SlidesApproval/Components/Slide1/Slide1';
import Slide2 from './SlidesApproval/Components/Slide2/Slide2';
import Slide3 from './SlidesApproval/Components/Slide3/Slide3';
import Slide4 from './SlidesApproval/Components/Slide4/Slide4';
import Slide5 from './SlidesApproval/Components/Slide5/Slide5';
import Slide6 from './SlidesApproval/Components/Slide6/Slide6';
import { VendorOnBoardTrackingModel } from '../Shared/Models/VendorOnBoardTracking.model';

interface Props {
  sidebarStore?: typeof SidebarStore;
  locationOnBoardingApprovalStore?: LocationOnBoardingApprovalStore;
  settingsStore?: SettingsStore;
  slidesApprovalStore?: SlidesApprovalStore;
  classes?: IClasses;
}

const CustomAccordionSummary = styled(props => (
  <AccordionSummary expandIcon={<ArrowRightIcon size="large" />} {...props} />
))(({ theme }) => ({
  flexDirection: 'row-reverse',
  color: '#000000',
  '& .MuiAccordionSummary-expandIcon': {
    backgroundColor: '#1976D226',
    color: '#004BA0',
  },
  '& .MuiAccordionSummary-expandIcon.Mui-expanded': {
    transform: 'rotate(90deg)',
  },
  '& .MuiIconButton-root': {
    marginRight: theme.spacing(1),
    borderRadius: '4px',
  },
}));

const CustomAccordion = styled((props: AccordionProps) => <Accordion elevation={0} square {...props} />)(
  ({ theme }) => ({
    border: 'none',
    '&:not(:last-child)': {
      borderBottom: 0,
    },
    '&::before': {
      display: 'none',
    },
  })
);

const LocationOnBoardingApprovals: FC<Props> = ({
  locationOnBoardingApprovalStore,
  slidesApprovalStore,
  settingsStore,
  classes,
}) => {
  const unsubscribe = useUnsubscribe();
  const gridState = useGridState();
  const location = useLocation();
  const searchHeaderRef = useRef<ISearchHeaderRef>();
  const [ open, setOpen ] = useState(false);
  const [ expandedDigit, setExpandedDigit ] = useState<string | false>(false);
  const [ dialogData, setDialogData ] = useState<any[]>([]);
  const [ dialogOpen, setDialogOpen ] = useState(false);

  const handleAccordionChange = (digit: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedDigit(isExpanded ? digit : false);
  };

  const agGrid = useAgGrid<LOCATION_ONBOARDING_APPROVAL_FILTERS, LocationOnBoardingApprovalsModel>(
    gridFilters,
    gridState
  );

  useEffect(() => {
    SidebarStore.setNavLinks(sidebarMenus, 'vendor-management');
    const searchData = SearchStore.searchData.get(location.pathname);
    if (searchData) {
      gridState.setPagination(searchData.pagination);
      searchHeaderRef.current?.setupDefaultFilters(searchData);
      SearchStore.clearSearchData(location.pathname);
      return;
    }
    loadInitialData();
  }, []);

  const searchCollection = (): IAPIGridRequest | null => {
    const propertyValue = getSearchValue();
    if (propertyValue === '') {
      return null;
    }
    const property = gridFilters.find(({ uiFilterType }) =>
      Utilities.isEqual(uiFilterType, searchHeaderRef.current.selectedOption)
    );
    const filters = [
      {
        propertyName: property?.apiPropertyName,
        propertyValue: propertyValue,
        operator: 'string',
        filterType: 'string',
      },
    ];
    return {
      filterCollection: JSON.stringify(filters),
    };
  };

  const getSearchValue = (): string => {
    const searchHeader = searchHeaderRef.current;
    const chip = searchHeader?.getFilters().chipValue?.valueOf();
    if (!searchHeader) {
      return null;
    }

    const propertyValue = chip?.length > 0 ? chip[0]?.label : searchHeader.searchValue ? searchHeader.searchValue : '';
    return propertyValue;
  };

  const loadInitialData = (pageRequest?: IAPIGridRequest): void => {
    const request: IAPIGridRequest = {
      pageNumber: locationOnBoardingApprovalStore?.pageNumber,
      pageSize: gridState.pagination.pageSize,
      ...pageRequest,
      ...searchCollection(),
      ...agGrid.filtersApi.gridSortFilters(),
    };
    UIStore.setPageLoader(true);
    locationOnBoardingApprovalStore
      .getLocationOnboardApprovalList(request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(Response => {
        gridState.setGridData(Response.results);
        gridState.setPagination(new GridPagination({ ...Response }));
        locationOnBoardingApprovalStore.pageNumber = gridState.pagination.pageNumber;
        agGrid.reloadColumnState();
        agGrid.refreshSelectionState();
      });
  };

  const loadOnBoardTrackingList = (tempLocationId: string) => {
    UIStore.setPageLoader(true);
    locationOnBoardingApprovalStore
      .getByVendorOnboardTracking(tempLocationId)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false);
        })
      )
      .subscribe(response => {
        getConfirmation(groupSlides(response));
      });
  };

  const groupSlides = (response: VendorOnBoardTrackingModel[]): VendorOnBoardTrackingModel[] => {
    const groupedSlides = response.reduce((acc, current) => {
      const slideNo = parseInt(getLastDigit(current.slideNo));
      if (slideNo === 1) {
        acc.push(current);
      } else if ([ 2, 3 ].includes(slideNo)) {
        const existingSlide = acc.find(s => s.slideNo === 'Slide2');
        if (!existingSlide) {
          acc.push({ ...current, slideNo: 'Slide2' });
        }
      } else if ([ 4, 5, 6 ].includes(slideNo)) {
        const existingSlide = acc.find(s => s.slideNo === 'Slide3');
        if (!existingSlide) {
          acc.push({ ...current, slideNo: 'Slide3' });
        }
      } else if (slideNo === 7) {
        acc.push({ ...current, slideNo: 'Slide4' });
      } else if (slideNo === 8) {
        acc.push({ ...current, slideNo: 'Slide5' });
      } else if (slideNo === 9) {
        acc.push({ ...current, slideNo: 'Slide6' });
      }

      return acc;
    }, []);

    return groupedSlides;
  };

  function getLastDigit(str) {
    const digits = str?.match(/\d/g);
    return digits ? digits[digits.length - 1] : null;
  }

  const getConfirmation = (data): void => {
    setDialogData(data);
    setDialogOpen(true);
  };

  const columnDefs: (ColDef | ColGroupDef)[] = [
    {
      headerName: 'Vendor Name',
      field: 'vendor.name',
      editable: false,
      headerTooltip: 'Vendor Name',
    },
    {
      headerName: 'Vendor Code',
      field: 'vendor.code',
      editable: false,
      headerTooltip: 'Vendor Code',
    },
    {
      headerName: 'Location Name',
      field: 'locationName',
      editable: false,
      headerTooltip: 'Location Name',
      comparator: (valueA, valueB) => {
        return valueA.toLowerCase().localeCompare(valueB.toLowerCase());
      },
    },
    {
      headerName: 'Airport',
      field: 'airportReference.label',
      editable: false,
      headerTooltip: 'Airport',
      comparator: (valueA, valueB) => {
        return valueA.toLowerCase().localeCompare(valueB.toLowerCase());
      },
    },
    {
      headerName: 'Status',
      field: 'combinedApprovalStatus',
      cellRenderer: 'viewRenderer',
      editable: false,
      headerTooltip: 'Status',
      cellRendererParams: {
        getViewRenderer: (rowIndex: number, node: RowNode, classes: IClasses) =>
          viewRenderer(rowIndex, node?.data?.combinedApprovalStatus),
      },
    },
    ...agGrid.auditFields(gridState.isRowEditing),
    {
      headerName: 'Actions',
      field: 'actionRenderer',
      cellRenderer: 'actionViewRenderer',
      cellEditor: 'actionRenderer',
      maxWidth: 250,
      minWidth: 250,
      filter: false,
      suppressSizeToFit: true,
      suppressNavigable: true,
    },
  ];

  function viewRenderer(rowIndex: number, status: string): ReactNode {
    let chipStyles = {
      backgroundColor: '#E9F0E1',
      color: '#65A61B',
      padding: '6px 8px 6px 8px',
      borderRadius: '20px',
    };

    switch (status.toLowerCase()) {
      case 'pending':
        chipStyles = {
          backgroundColor: '#1976D226',
          color: '#1976D2',
          padding: '6px 8px 6px 8px',
          borderRadius: '20px',
        };
        break;

      case 'rejected':
        chipStyles = {
          backgroundColor: '#DB063B26',
          color: '#DB063B',
          padding: '6px 8px 6px 8px',
          borderRadius: '20px',
        };
        break;

      default:
        chipStyles = {
          backgroundColor: '#E9F0E1',
          color: '#65A61B',
          padding: '6px 8px 6px 8px',
          borderRadius: '20px',
        };
    }

    return (
      <div>
        <Tooltip title={status || ''}>
          <Chip key={rowIndex} label={status} style={chipStyles} />
        </Tooltip>
      </div>
    );
  }

  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: {
        onDropDownChange: (params: ICellEditorParams, value: string) => {
          gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
        },
        onInputChange: (params: ICellEditorParams, value: string) => {
          gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
        },
        onOptionChange: (params: ICellEditorParams, value: string) => {
          gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
        },
      },
      columnDefs: columnDefs,
      isEditable: true,
      gridActionProps: {
        getDisabledState: () => gridState.hasError,
        getEditableState: () => gridState.isRowEditing,
        getViewRenderer: (rowIndex: number, { data }: RowNode) => {
          return (
            <>
              <Tooltip
                classes={{ tooltip: classes.customToolTip, arrow: classes.customArrow }}
                placement="top"
                title="Edit"
                arrow
              >
                <IconButton
                  className={classes.infoManage}
                  color="primary"
                  disabled={false}
                  onClick={() => {
                    slidesApprovalStore.vendorId = data?.vendor?.id;
                    slidesApprovalStore.locationUniqueCode = data?.locationUniqueCode;
                    slidesApprovalStore.tempLocationId = data?.tempLocationId;
                    setOpen(true);
                  }}
                >
                  <EditIcon />
                </IconButton>
              </Tooltip>
              {data.combinedApprovalStatus?.toLowerCase() === 'rejected' && (
                <Tooltip
                  classes={{ tooltip: classes.customToolTip, arrow: classes.customArrow }}
                  placement="top"
                  title="Details"
                  arrow
                >
                  <IconButton
                    className={classes.infoManage}
                    color="primary"
                    onClick={() => {
                      slidesApprovalStore.vendorId = data?.vendor?.id;
                      slidesApprovalStore.locationUniqueCode = data?.locationUniqueCode;
                      slidesApprovalStore.tempLocationId = data?.tempLocationId;
                      loadOnBoardTrackingList(data?.tempLocationId);
                    }}
                  >
                    <ViewIcon />
                  </IconButton>
                </Tooltip>
              )}
            </>
          );
        },

        onAction: (action: GRID_ACTIONS, rowIndex: number) => {
          if (action === GRID_ACTIONS.SAVE) {
            gridState.gridApi.stopEditing();
            return;
          }
          gridState.gridApi.stopEditing(true);
        },
      },
    });

    return {
      ...baseOptions,
      pagination: false,

      suppressClickEdit: true,
      suppressRowClickSelection: true,
      suppressCellSelection: true,
      suppressScrollOnNewData: true,
      rowHeight: 40,
      defaultColDef: {
        ...baseOptions.defaultColDef,
        suppressMovable: true,
        sortable: true,
        cellEditor: '',
      },
      frameworkComponents: {
        customHeader: AgGridGroupHeader,
        customAutoComplete: AgGridAutoComplete,
        actionViewRenderer: AgGridViewRenderer,
        viewRenderer: AgGridViewRenderer,
        actionRenderer: AgGridActions,
        customCellEditor: AgGridCellEditor,
        customSelect: AgGridSelectControl,
      },
      onFilterChanged: () => loadInitialData({ pageNumber: locationOnBoardingApprovalStore.pageNumber }),
      onSortChanged: e => {
        agGrid.filtersApi.onSortChanged(e);
        loadInitialData({ pageNumber: locationOnBoardingApprovalStore.pageNumber });
      },
    };
  };

  const CustomDrawer = styled(Drawer)({
    '& .MuiDrawer-paper': {
      width: '55%',
    },
  });

  const steps = [
    {
      slide: 1,
      component: <Slide1 activeStep={slidesApprovalStore.activeStep} />,
    },
    {
      slide: 2,
      component: <Slide2 activeStep={slidesApprovalStore.activeStep} />,
    },
    {
      slide: 3,
      component: <Slide3 activeStep={slidesApprovalStore.activeStep} />,
    },
    {
      slide: 4,
      component: <Slide4 activeStep={slidesApprovalStore.activeStep} />,
    },
    {
      slide: 5,
      component: <Slide5 activeStep={slidesApprovalStore.activeStep} />,
    },
    {
      slide: 6,
      component: <Slide6 activeStep={slidesApprovalStore.activeStep} />,
    },
  ];

  return (
    <>
      <CustomDrawer anchor={'right'} open={open} onClose={() => setOpen(false)} hideBackdrop className={classes.drawer}>
        <SlidesApproval loadApprovalData={loadInitialData} setOpen={setOpen} />
      </CustomDrawer>
      <SearchHeaderV2
        placeHolder="Start typing to search"
        ref={searchHeaderRef}
        onExpandCollapse={agGrid.autoSizeColumns}
        selectInputs={[
          agGridUtilities.createSelectOption(
            LOCATION_ONBOARDING_APPROVAL_FILTERS,
            LOCATION_ONBOARDING_APPROVAL_FILTERS.VENDOR_NAME,
            'defaultOption'
          ),
        ]}
        onClear={() => {
          loadInitialData();
        }}
        onResetFilterClick={() => {
          agGrid.cancelEditing(0);
          agGrid.filtersApi.resetColumnFilters();
        }}
        onFilterChange={isInitEvent => {
          loadInitialData({ pageNumber: isInitEvent ? gridState.pagination.pageNumber : 1 });
          agGrid.cancelEditing(0);
        }}
      />

      <CustomAgGridReact
        isRowEditing={gridState.isRowEditing}
        rowData={gridState.data}
        gridOptions={gridOptions()}
        serverPagination={true}
        paginationData={gridState.pagination}
        onPaginationChange={loadInitialData}
        classes={{ customHeight: classes.customHeight }}
        disablePagination={gridState.isRowEditing || gridState.isProcessing}
      />
      {dialogOpen && (
        <Dialog
          title="Reason for rejection"
          classes={{ dialogWrapper: classes.dialogPaper }}
          open={dialogOpen}
          onClose={() => {
            slidesApprovalStore.vendorId = null;
            slidesApprovalStore.locationUniqueCode = null;
            slidesApprovalStore.tempLocationId = null;
            setExpandedDigit(false);
            setDialogOpen(false);
          }}
          dialogContent={() => (
            <>
              {dialogData.map(item => {
                const digit = getLastDigit(item.slideNo)?.toString();
                const isExpanded = expandedDigit === digit;

                return (
                  <CustomAccordion
                    key={digit}
                    expanded={isExpanded}
                    onChange={handleAccordionChange(digit)}
                    elevation={0}
                  >
                    <CustomAccordionSummary
                      expandIcon={<ArrowRightIcon />}
                      className={`${classes.accordianSummary} ${!isExpanded && classes.nonExpandedIcon}`}
                    >
                      <Typography component="span">{item.slideNo} Details</Typography>
                    </CustomAccordionSummary>
                    <AccordionDetails className={classes.accordianDetails}>
                      {isExpanded && (
                        <Box className={classes.innerBox2}>
                          {(() => {
                            const stepDigit = getLastDigit(item.slideNo);
                            const stepComponent = stepDigit
                              ? steps.find(step => step.slide == stepDigit)?.component
                              : null;
                            return stepComponent;
                          })()}
                        </Box>
                      )}
                      <Divider />
                      <div className={classes.accordianDetails}>
                        <Typography className={classes.rejectionRemarks}>Rejection Remarks:</Typography>
                        <Typography component="span">{item.remark || 'No remarks available'}</Typography>
                      </div>
                    </AccordionDetails>
                  </CustomAccordion>
                );
              })}
            </>
          )}
          closeBtn={true}
          disableBackdropClick={true}
        />
      )}
    </>
  );
};

export default inject(
  'slidesApprovalStore',
  'locationOnBoardingApprovalStore',
  'settingsStore'
)(withStyles(styles)(observer(LocationOnBoardingApprovals)));
