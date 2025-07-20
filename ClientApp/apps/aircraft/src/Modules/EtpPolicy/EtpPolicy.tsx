import React, { FC, ReactNode, useEffect } from 'react';
import { ColDef, GridOptions, ValueFormatterParams, ValueGetterParams, RowNode } from 'ag-grid-community';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { inject, observer } from 'mobx-react';
import { finalize, takeUntil } from 'rxjs/operators';
import { SearchHeaderV3, useSearchHeader } from '@wings-shared/form-controls';
import { UIStore, GRID_ACTIONS, IClasses, SearchStore, ViewPermission, Utilities } from '@wings-shared/core';
import { CustomAgGridReact, useAgGrid, useGridState, agGridUtilities } from '@wings-shared/custom-ag-grid';
import { useUnsubscribe } from '@wings-shared/hooks';
import {
  ETP_POLICY_FILTERS,
  EtpPolicyModel,
  EtpPolicyStore,
  ImportFileDataV2,
  updateAircraftSidebarOptions,
  useAircraftModuleSecurity,
} from '../Shared';
import { VIEW_MODE } from '@wings/shared';
import { CustomLinkButton, SidebarStore } from '@wings-shared/layout';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { AutocompleteGetTagProps } from '@material-ui/lab';
import { Chip } from '@material-ui/core';
import { PrimaryButton } from '@uvgo-shared/buttons';
import CloudUploadIcon from '@material-ui/icons/CloudUploadOutlined';
import { useStyles } from './EtpPolicies.styles';

interface Props {
  etpPolicyStore?: EtpPolicyStore;
  sidebarStore?: typeof SidebarStore;
}

const EtpPolicy: FC<Props> = ({ etpPolicyStore, sidebarStore }) => {
  const unsubscribe = useUnsubscribe();
  const classes = useStyles();
  const searchHeader = useSearchHeader();
  const gridState = useGridState();
  const agGrid = useAgGrid<ETP_POLICY_FILTERS, EtpPolicyModel>([], gridState);
  const _etpPolicyStore = etpPolicyStore as EtpPolicyStore;
  const aircraftModuleSecurity = useAircraftModuleSecurity();

  /* istanbul ignore next */
  useEffect(() => {
    sidebarStore?.setNavLinks(updateAircraftSidebarOptions('ETP Policy'), 'aircraft');
    loadInitialData();
  }, []);

  const viewRenderer = (etpScenario: string[], getTagProps?: AutocompleteGetTagProps): ReactNode => {
    return etpScenario
      .sort((a, b) => Number(a) - Number(b))
      .map((etpScenario: string, index) => (
        <Chip
          classes={{ root: classes?.root }}
          key={etpScenario}
          label={etpScenario}
          {...(getTagProps instanceof Function ? getTagProps({ index }) : {})}
        />
      ));
  };

  /* istanbul ignore next */
  const columnDefs: ColDef[] = [
    {
      headerName: 'Policy Code',
      field: 'code',
      filter: true,
    },
    {
      headerName: 'ETP Scenario',
      field: 'etpScenarios',
      cellRenderer: 'viewRenderer',
      minWidth: 450,
      filter: true,
      filterValueGetter: ({ data }: ValueGetterParams) => data.etpScenarios?.map(x => x.label).join(','),
      valueFormatter: ({ value }: ValueFormatterParams) => value?.map(x => x.label).join(',') || '',
      cellRendererParams: {
        getViewRenderer: (rowIndex: number, node: RowNode, classes: IClasses) =>
          viewRenderer(node.data?.etpScenarios.map(x => x.label)),
      },
    },
    {
      headerName: 'Description',
      field: 'description',
      filter: true,
    },
    ...agGrid.auditFields(gridState.isRowEditing),
    {
      ...agGrid.actionColumn({
        headerName: 'Action',
        minWidth: 150,
        maxWidth: 210,
        cellRendererParams: {
          isActionMenu: true,
          actionMenus: () => [
            {
              title: 'Edit',
              isHidden: !aircraftModuleSecurity.isEditable,
              action: GRID_ACTIONS.EDIT,
              to: node => `/aircraft/etp-policy/${node?.data.id}/${VIEW_MODE.EDIT.toLowerCase()}`,
            },
            {
              title: 'Details',
              action: GRID_ACTIONS.DETAILS,
              to: node => `/aircraft/etp-policy/${node?.data.id}/${VIEW_MODE.DETAILS.toLowerCase()}`,
            },
          ],
        },
      }),
    },
  ];

  /* istanbul ignore next */
  const loadInitialData = (): void => {
    UIStore.setPageLoader(true);
    _etpPolicyStore
      .getEtpPolicies(true)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(EtpScenarios => {
        gridState.setGridData(EtpScenarios);
      });
  };

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: {
        onInputChange: () => gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi)),
        onDropdownChange: () => gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi)),
      },
      columnDefs,
      isEditable: false,
      gridActionProps: {
        tooltip: 'ETP Policy',
        getDisabledState: () => gridState.hasError,
      },
    });

    return {
      ...baseOptions,
      isExternalFilterPresent: () => Boolean(searchHeader.getFilters().searchValue) || false,
      doesExternalFilterPass: node => {
        if (!searchHeader) {
          return false;
        }
        const { etpScenarios, id, description, code } = node.data as EtpPolicyModel;
        const scenarioFilterOption = [
          etpScenarios.map(a => a.name).find(x => x === searchHeader.getFilters().searchValue),
        ];
        return (
          !id ||
          agGrid.isFilterPass(
            {
              [ETP_POLICY_FILTERS.CODE]: code,
              [ETP_POLICY_FILTERS.SCENARIO_NUMBER]: scenarioFilterOption as string[],
              [ETP_POLICY_FILTERS.DESCRIPTION]: description,
            },
            searchHeader.getFilters().searchValue,
            searchHeader.getFilters().selectInputsValues.get('defaultOption')
          )
        );
      },
    };
  };

  const onRequestImportEtpPolicies = (): void => {
    ModalStore.open(
      <ImportFileDataV2
        onImportFileData={file => _etpPolicyStore.importEtpPolicies(file)}
        onImportDone={() => loadInitialData()}
        title="Import ETP Policies"
        successMessage="All ETP Policies Imported successfully!"
      />
    );
  };

  const rightContent = (): ReactNode => {
    return (
      <ViewPermission hasPermission={aircraftModuleSecurity.isEditable}>
        <>
          <CustomLinkButton
            variant="contained"
            startIcon={<AddIcon />}
            to="new"
            title="Add ETP Policy"
            disabled={gridState.isRowEditing || UIStore.pageLoading}
          />
          <PrimaryButton
            variant="contained"
            color="primary"
            startIcon={<CloudUploadIcon />}
            onClick={() => onRequestImportEtpPolicies()}
            disabled={gridState.isRowEditing || UIStore.pageLoading}
          >
            Import ETP Policy
          </PrimaryButton>
        </>
      </ViewPermission>
    );
  };

  return (
    <>
      <SearchHeaderV3
        useSearchHeader={searchHeader}
        // eslint-disable-next-line max-len
        selectInputs={[ agGridUtilities.createSelectOption(ETP_POLICY_FILTERS, ETP_POLICY_FILTERS.CODE) ]}
        onExpandCollapse={agGrid.autoSizeColumns}
        onResetFilterClick={() => {
          agGrid.cancelEditing(0);
          agGrid.filtersApi.resetColumnFilters();
        }}
        onFiltersChanged={() => gridState.gridApi.onFilterChanged()}
        onSearch={sv => gridState.gridApi.onFilterChanged()}
        rightContent={rightContent}
        disableControls={gridState.isRowEditing}
      />
      <CustomAgGridReact isRowEditing={gridState.isRowEditing} rowData={gridState.data} gridOptions={gridOptions()} />
    </>
  );
};

export default inject('etpPolicyStore', 'sidebarStore')(observer(EtpPolicy));
