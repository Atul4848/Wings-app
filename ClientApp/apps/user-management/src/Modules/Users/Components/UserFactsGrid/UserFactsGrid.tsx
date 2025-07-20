import React, { FC, ReactNode, useEffect } from 'react';
import {
  CustomAgGridReact,
  AgGridActions,
  AgGridGroupHeader,
  AgGridFilterHeader,
  useGridState,
  useAgGrid,
} from '@wings-shared/custom-ag-grid';
import { ColDef, GridOptions } from 'ag-grid-community';
import { observer, inject } from 'mobx-react';
import { Typography, withStyles } from '@material-ui/core';
import { useStyles } from './UserFacts.style';
import { UserFactsModel, UserStore } from '../../../Shared';
import { IClasses, UIStore, SelectOption } from '@wings-shared/core';
import { finalize } from 'rxjs/operators';
import { SelectInputControl, ExpandCollapseButton } from '@wings-shared/form-controls';
import { useUnsubscribe } from '@wings-shared/hooks';
import { LOGS_FILTERS } from '../../../Shared/Enums';

interface Props {
  classes?: IClasses;
  userStore?: UserStore;
  onSetClick?: ({ predicate }) => null;
  facts: UserFactsModel[];
  id: string;
}

export const categoryList: SelectOption[] = [
  new SelectOption({ name: 'allow', value: 'allow' }),
  new SelectOption({ name: 'has_role', value: 'has_role' }),
  new SelectOption({ name: 'has_relation', value: 'has_relation' }),
];

const UserFactsGrid: FC<Props> = ({ ...props }) => {
  const unsubscribe = useUnsubscribe();
  const gridState = useGridState();
  const agGrid = useAgGrid<LOGS_FILTERS, UserFactsModel>([], gridState);
  const classes = useStyles();

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = () => {
    props.userStore?.setPredicateFilter('allow');
    loadFacts();
  }

  const columnDefs: ColDef[] = [
    {
      headerName: 'Value',
      field: 'Value',
    },
    {
      headerName: 'Resource',
      field: 'Type_2',
    },
    {
      headerName: 'Resource ID',
      field: 'Type_2Id',
    },
  ];

  const loadFacts = () => {
    UIStore.setPageLoader(true);
    props.userStore?.getUserFacts(props.id)
      .pipe(finalize(() => UIStore.setPageLoader(false)))
      .subscribe(response => {
        let header: string = '';
        switch (response.predicate) {
          case 'allow': header = 'Allow';
            break;
          case 'has_role': header = 'Role';
            break;
          case 'has_relation': header = 'Relation';
            break;
        }
        UpdateGridHeader('Value', header);

        gridState.data = response.facts.map(x => {
          return {
            Value: x.Args[1].Id,
            Type_2: x.Args[2].Type,
            Type_2Id: x.Args[2].Id,
          };
        });
      });
  }

  const UpdateGridHeader = (current: string, newHeader: string) => {
    gridState.gridApi.getColumnDef(current).headerName = newHeader;
    gridState.gridApi.refreshHeader();
  }

  const gridActionProps = (): object => {
    return {
      showDeleteButton: true,
      getDisabledState: () => gridState.hasError,
      getEditableState: () => false,
    };
  }

  const onSelection = (option: string) => {
    props.userStore?.setPredicateFilter(option);
    loadFacts();
  }

  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: this,
      columnDefs,
      isEditable: false,
      gridActionProps,
    });
    return {
      ...baseOptions,
      suppressClickEdit: true,
      groupHeaderHeight: 0,
      defaultColDef: {
        ...baseOptions.defaultColDef,
        suppressMovable: true,
        filter: true,
        minWidth: 180,
        menuTabs: [ 'filterMenuTab' ],
      },
      frameworkComponents: {
        actionRenderer: AgGridActions,
        customHeader: AgGridGroupHeader,
        agColumnHeader: AgGridFilterHeader,
      },
      pagination: false,
    };
  }

  return (
    <div className={classes.container}>
      <div className={classes.flexSection}>
        <div className={classes.searchContainer}>
          <Typography variant="h6" className={classes.title}>
          View Facts
          </Typography>
          <ExpandCollapseButton onExpandCollapse={() => agGrid.autoSizeColumns()} />
        </div>
        <div className={classes.selectInput}>
          <Typography variant="h6" className={classes.subTitle}>
            Predicate / Fact Type
          </Typography>
          <SelectInputControl
            containerClass={classes.dropDown}
            value={props.userStore?.predicateFilter}
            selectOptions={categoryList}
            onOptionChange={item => onSelection(item)}
          />
        </div>
      </div>
      <div className={classes.mainroot}>
        <CustomAgGridReact isRowEditing={gridState.isRowEditing} rowData={gridState.data} gridOptions={gridOptions()} />
      </div>
    </div>
  );
}

export default observer(UserFactsGrid);
