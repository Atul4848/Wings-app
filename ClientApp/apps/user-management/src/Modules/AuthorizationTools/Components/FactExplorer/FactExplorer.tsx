import React, { FC, useMemo, useState } from 'react';
import {
  AgGridActions,
  AgGridChipView,
  AgGridGroupHeader,
  AgGridFilterHeader,
  CustomAgGridReact,
  AgGridActionButton,
  useGridState,
  useAgGrid,
} from '@wings-shared/custom-ag-grid';
import { styles } from './FactExplorer.styles';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { Typography, TextField } from '@material-ui/core';
import { IAPIGridRequest, IClasses, SelectOption, UIStore, cellStyle } from '@wings-shared/core';
import { UserFactsModel, UserModel, UserStore } from '../../../Shared';
import { SelectInputControl, AutoCompleteControl } from '@wings-shared/form-controls';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { inject, observer } from 'mobx-react';
import { finalize, takeUntil, debounceTime } from 'rxjs/operators';
import { ColDef, GridOptions } from 'ag-grid-community';
import UserInfo from '../UserInfo/UserInfo';
import { AuthStore } from '@wings-shared/security';
import { useUnsubscribe } from '@wings-shared/hooks';

type Props = {
  classes?: IClasses;
  userStore?: UserStore;
};

export const actorTypeOptions: SelectOption[] = [ new SelectOption({ name: 'User', value: 'User' }) ];

export const resourceTypeOptions: SelectOption[] = [
  new SelectOption({ name: 'FIQReport', value: 'FIQReport' }),
  new SelectOption({ name: 'Trip', value: 'Trip' }),
  new SelectOption({ name: 'CustomerSite', value: 'CustomerSite' }),
];

export const predicateList: SelectOption[] = [
  new SelectOption({ name: 'allow', value: 'allow' }),
  new SelectOption({ name: 'has_role', value: 'has_role' }),
  new SelectOption({ name: 'has_relation', value: 'has_relation' }),
  new SelectOption({ name: 'is_public', value: 'is_public' }),
];

const FactExplorer: FC<Props> = ({ ...props }: Props) => {
  const [ predicate, setPredicate ] = useState<string>('allow');
  const [ actorType, setActorType ] = useState<string>('User');
  const [ actorId, setActorId ] = useState<string>('');
  const [ action, setAction ] = useState<string>('');
  const [ resourceId, setResourceId ] = useState<string>('');
  const [ resourceType, setResourceType ] = useState<string>('FIQReport');
  const [ actorIDs, setActorIDs ] = useState<UserModel[]>([]);
  const [ selectedActor, setSelectedActor ] = useState<UserModel>(new UserModel());
  const [ isActive, setIsActive ] = useState<string>('');
  const classes: Record<string, string> = styles();
  const _userStore = props.userStore as UserStore;
  const unsubscribe = useUnsubscribe();
  const gridState = useGridState();
  const agGrid = useAgGrid<string, UserFactsModel>([], gridState);

  const hasUMRole = useMemo(() => AuthStore.permissions.hasAnyRole([ 'um_admin', 'um_manager', 'um_reader' ]), [
    AuthStore.permissions,
  ]);

  const setActorValue = (selectedUser: UserModel): void => {
    if (!selectedUser) {
      setActorIDs([]);
      setSelectedActor(null);
      setActorId('');
      return;
    }
    setSelectedActor(selectedUser);
    setActorId(selectedUser.value as string);
  }

  const searchActorIDs = (value: string): void => {
    if (value.length <= 2) {
      return;
    }
    const { userStore } = props;
    const request: IAPIGridRequest = {
      q:  value,
    };
    _userStore
      .getUsers(request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        debounceTime(500),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(users => (setActorIDs(users.results)));
  }

  /* istanbul ignore next */
  const checkFilter = (): void => {
    UIStore.setPageLoader(true);
    _userStore
      .getFactExplorer(predicate, actorType, actorId, action, resourceType, resourceId)
      .pipe(
        finalize(() => {
          UIStore.setPageLoader(false);
        })
      )
      .subscribe(response => {
        const data = response.facts.map(x => {
          return {
            Type_1: x.Args[0].Type,
            Type_1Id: x.Args[0].Id,
            Value: x.Args[1].Id,
            Type_2: x.Args[2].Type,
            Type_2Id: x.Args[2].Id,
          };
        });
        gridState.setGridData(data);
        agGrid.reloadColumnState();
      });
  }

  /* istanbul ignore next */
  const columnDefs: ColDef[] = [
    {
      headerName: 'Type_1',
      field: 'Type_1',
    },
    {
      headerName: 'Type_1 ID',
      field: 'Type_1Id',
    },
    {
      headerName: 'Value',
      field: 'Value',
    },
    {
      headerName: 'Type_2',
      field: 'Type_2',
    },
    {
      headerName: 'Type_2 ID',
      field: 'Type_2Id',
    },
    {
      headerName: '',
      cellRenderer: 'actionButtonRenderer',
      suppressSizeToFit: true,
      suppressNavigable: true,
      maxWidth: 150,
      cellStyle: { ...cellStyle() },
      cellRendererParams: {
        onClick: node => {
          setIsActive(`${node.data?.Type_1Id}-${node.data?.Type_2Id}-${node.data?.Value}`)
          usersInfo(node.data?.Type_1Id);
        },
        info: true,
        isDisabled: () => false,
        isActive: (node) => {
          return `${node.data?.Type_1Id}-${node.data?.Type_2Id}-${node.data?.Value}` == isActive
        }
      },
    },
  ];

  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: this,
      columnDefs: columnDefs,
      isEditable: false,
      gridActionProps: {
        showDeleteButton: true,
        getDisabledState: () => gridState.hasError,
        getEditableState: () => false,
      },
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
      isExternalFilterPresent: () => false,
      frameworkComponents: {
        actionRenderer: AgGridActions,
        agGridChipView: AgGridChipView,
        customHeader: AgGridGroupHeader,
        agColumnHeader: AgGridFilterHeader,
        actionButtonRenderer: AgGridActionButton,
      },
      pagination: false,
    };
  }

  /* istanbul ignore next */
  
  const usersInfo = (userId: string): void => {
    gridState.gridApi.redrawRows();
    ModalStore.open(
      <UserInfo userId={userId} onClose={() => {
        setIsActive('');
        gridState.gridApi.redrawRows();
      }} />
    );

  }

  return (
    <>
      <div className={classes.headerContainerTop}>
        <div className={classes.flexSection}>
          <div className={classes.selectionSection}>
            <div className={classes.selectInput}>
              <Typography variant="h6" className={classes.subTitle}>
                Predicate
              </Typography>
              <SelectInputControl
                containerClass={classes.dropDown}
                value={predicate}
                selectOptions={predicateList}
                onOptionChange={item => setPredicate(item)}
              />
            </div>
            <div className={classes.selectInput}>
              <Typography variant="h6" className={classes.subTitle}>
                Actor Type
              </Typography>
              <SelectInputControl
                containerClass={classes.dropDown}
                value={actorType}
                selectOptions={actorTypeOptions}
                onOptionChange={item => setActorType(item)}
              />
            </div>
            <div className={classes.selectInput}>
              <Typography variant="h6" className={classes.subTitle}>
                Actor Name
              </Typography>
              <AutoCompleteControl
                useFitToContentWidth={true}
                placeHolder="Search Actor Name"
                options={actorIDs}
                value={selectedActor}
                onDropDownChange={selectedOption => setActorValue(selectedOption as UserModel)}
                onSearch={(searchValue: string) => searchActorIDs(searchValue)}
              />
            </div>
            <div className={classes.selectInput}>
              <Typography variant="h6" className={classes.subTitle}>
                Action
              </Typography>
              <TextField
                className={classes.textInput}
                value={action}
                onChange={event => setAction(event.target.value as string)}
              />
            </div>
            <div className={classes.selectInput}>
              <Typography variant="h6" className={classes.subTitle}>
                Resource Type
              </Typography>
              <SelectInputControl
                containerClass={classes.dropDown}
                value={resourceType}
                selectOptions={resourceTypeOptions}
                onOptionChange={item => setResourceType(item)}
              />
            </div>
            <div className={classes.selectInput}>
              <Typography variant="h6" className={classes.subTitle}>
                Resource ID
              </Typography>
              <TextField
                className={classes.textInput}
                value={resourceId}
                onChange={event => setResourceId(event.target.value as string)}
              />
            </div>
          </div>
          <div className={classes.filterBtn}>
            <PrimaryButton
              disabled={!hasUMRole}
              variant="contained"
              color="primary"
              onClick={() => checkFilter()}
            >
              Filter
            </PrimaryButton>
          </div>
        </div>
        {gridState.data.length != 0 && (
          <div className={classes.mainroot}>
            <CustomAgGridReact
              isRowEditing={gridState.isRowEditing}
              rowData={gridState.data} gridOptions={gridOptions()} />
          </div>
        )}
      </div>
    </>
  );
};

export default inject('userStore')(observer(FactExplorer));
