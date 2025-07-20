import React, { FC, RefObject, useEffect, useMemo, useRef } from 'react';
import { VIEW_MODE } from '@wings/shared';
import {
  CustomAgGridReact,
  AgGridActions,
  AgGridGroupHeader,
  AgGridActionButton,
  useGridState,
  useAgGrid,
  agGridUtilities
} from '@wings-shared/custom-ag-grid';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { styles } from './FederationMapping.styles';
import { Theme, Typography } from '@material-ui/core';
import { filter, finalize, switchMap, takeUntil } from 'rxjs/operators';
import { inject, observer } from 'mobx-react';
import { AxiosError } from 'axios';
import { AlertStore } from '@uvgo-shared/alert';
import { ColDef, GridOptions, GridReadyEvent } from 'ag-grid-community';
import { FederationMappingModel, FederationMappingStore, IAPIFederationMappingRequest } from '../Shared';
import { PrimaryButton } from '@uvgo-shared/buttons';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import SupervisedUserCircleIcon from '@material-ui/icons/SupervisedUserCircle';
import { FEDERATION_NAME } from '../Shared/Enums';
import UpsertFederationMapping from './Components/UpsertFederationMapping';
import { IClasses, UIStore, GRID_ACTIONS, IBaseGridFilterSetup, cellStyle } from '@wings-shared/core';
import { ConfirmDialog } from '@wings-shared/layout';
import { SearchHeaderV2, ISearchHeaderRef } from '@wings-shared/form-controls';
import { AuthStore, useRoles } from '@wings-shared/security';
import { useUnsubscribe } from '@wings-shared/hooks';

interface Props {
  classes?: IClasses;
  theme?: Theme;
  federationMappingStore?: FederationMappingStore;
}

const FederationMapping: FC<Props> = ({ federationMappingStore }: Props) => {
  const gridState = useGridState();
  const agGrid = useAgGrid<FEDERATION_NAME, FederationMappingModel>([], gridState);
  const _federationMappingStore = federationMappingStore as FederationMappingStore;
  const unsubscribe = useUnsubscribe();
  const classes: Record<string, string> = styles();
  const searchHeaderRef = useRef<ISearchHeaderRef>();
  useEffect(() => {
    loadInitialData();
  }, []);

  const filtersSetup: IBaseGridFilterSetup<FEDERATION_NAME> = {
    defaultPlaceHolder: 'Search Federation',
    filterTypesOptions: Object.values(FEDERATION_NAME),
    defaultFilterType: FEDERATION_NAME.FEDERATION,
  };

  const loadInitialData = (): void => {
    UIStore.setPageLoader(true);
    _federationMappingStore
      .loadFederation()
      .pipe(finalize(() => UIStore.setPageLoader(false)))
      .subscribe((data: FederationMappingModel[]) => {
        gridState.setGridData(data);
      })
  }

  const hasWritePermission = useMemo(() => AuthStore.permissions.hasAnyPermission([ 'write' ]), [
    AuthStore.permissions,
  ]);

  /* istanbul ignore next */
  const columnDefs: ColDef[] = [
    {
      headerName: 'IdentityProvider',
      field: 'identityProvider',
    },
    {
      headerName: 'CustomerNumber',
      field: 'customerNumber',
    },
    {
      headerName: 'ClientId',
      field: 'clientId',
    },
    {
      headerName: 'Action',
      cellRenderer: 'actionButtonRenderer',
      maxWidth: 100,
      suppressSizeToFit: true,
      suppressNavigable: true,
      cellStyle: { ...cellStyle() },
      cellRendererParams: {
        onAction: node => { },
        isEditOrDelete: true,
        isHidden: () => false,
        isDisabled: () => !hasWritePermission,
        onClick: (node, isEditable) => {
          if (isEditable) return openFederationDialog(VIEW_MODE.EDIT, node.data);
          return openDeleteFedrationDialog(node.data);
        },
      },
    },
  ];

  const deleteFederation = (federationMapping: FederationMappingModel): void => {

    UIStore.setPageLoader(true);
    _federationMappingStore
      .deleteFederation(federationMapping.identityProvider)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false);
          ModalStore.close();
        }),
        filter((isDeleted: boolean) => isDeleted)
      )
      .subscribe(
        () => {
          agGrid._removeTableItems([ federationMapping ]);
          AlertStore.info('Federation Mapping deleted successfully');
        },
        (error: AxiosError) => AlertStore.info(error.message)
      );
  };

  /* istanbul ignore next */
  const upsertIdpMapping = (upsertIdpMappingRequest: IAPIFederationMappingRequest, mode: VIEW_MODE): void => {
    UIStore.setPageLoader(true);
    if (mode == VIEW_MODE.NEW) {
      const alreadyExist = _federationMappingStore.federationMapping.some(
        x => x.identityProvider == upsertIdpMappingRequest.IdentityProvider
      );
      if (alreadyExist) {
        AlertStore.critical('Identity Provider already exists.');
        UIStore.setPageLoader(false);
        ModalStore.close();
        return;
      }
    }
    _federationMappingStore
      .upsertIdpMapping(upsertIdpMappingRequest, mode)
      .pipe(
        switchMap(() => _federationMappingStore.loadFederation()),
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false);
          ModalStore.close();
        })
      )
      .subscribe({
        next: response => (gridState.data = response),
        error: (error: AxiosError) => AlertStore.info(error.message),
      });
  };

  /* istanbul ignore next */
  const openFederationDialog = (mode: VIEW_MODE, federationMapping?: FederationMappingModel): void => {
    ModalStore.open(
      <UpsertFederationMapping
        federationMappingStore={_federationMappingStore}
        viewMode={mode}
        federationMapping={federationMapping}
        upsertIdpMapping={(upsertIdpMappingRequest: IAPIFederationMappingRequest) =>
          upsertIdpMapping(upsertIdpMappingRequest, mode)
        }
      />
    );
  };

  /* istanbul ignore next */
  const openDeleteFedrationDialog = (federationMapping: FederationMappingModel): void => {
    ModalStore.open(
      <ConfirmDialog
        title="Confirm Delete"
        message="Are you sure you want to delete this Federation Mapping?"
        yesButton="Yes"
        onNoClick={() => ModalStore.close()}
        onYesClick={() => deleteFederation(federationMapping)}
      />
    );
  }

  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: this,
      columnDefs: columnDefs,
      isEditable: false,
      gridActionProps: {
        showDeleteButton: false,
        getDisabledState: () => gridState.hasError,
        onAction: () => (action: GRID_ACTIONS, rowIndex: number) => { },
      },
    });
    return {
      ...baseOptions,
      isExternalFilterPresent: () => searchHeaderRef.current?.hasSearchValue || false,
      doesExternalFilterPass: node => {
        const searchHeader = searchHeaderRef.current;
        if (!searchHeader) {
          return false;
        }
        const { customerNumber, identityProvider, clientId } = node.data as FederationMappingModel;
        return (
          agGrid.isFilterPass(
            {
              [ FEDERATION_NAME.FEDERATION ]: [ clientId.toString(), customerNumber, identityProvider ],
            },
            searchHeader.searchValue,
            searchHeader.selectedOption
          )
        );
      },
      frameworkComponents: {
        actionRenderer: AgGridActions,
        customHeader: AgGridGroupHeader,
        actionButtonRenderer: AgGridActionButton,
      },

    };
  }


  return (
    <>
      <div className={classes.userListContainer}>
        <div className={classes.headerContainer}>
          <div className={classes.searchContainer}>
            <SearchHeaderV2
              ref={searchHeaderRef as RefObject<ISearchHeaderRef>}
              selectInputs={[
                agGridUtilities.createSelectOption(
                  FEDERATION_NAME,
                  FEDERATION_NAME.FEDERATION,
                )
              ]}
              hideSelectionDropdown={true}
              disableControls={Boolean(Array.from(gridState.columFilters).length)}
              onFilterChange={() => gridState.gridApi.onFilterChanged()}
            />
          </div>
          <div className={classes.btnButton}>
            <PrimaryButton
              variant="contained"
              color="primary"
              disabled={!hasWritePermission}
              onClick={() => openFederationDialog(VIEW_MODE.NEW, new FederationMappingModel())}
            >
            Add Federation Mapping
            </PrimaryButton>
          </div>
        </div>
        <div className={classes.mainroot}>
          <div className={classes.mainContent}>
            <CustomAgGridReact gridOptions={gridOptions()} rowData={gridState.data} />
          </div>
        </div>
      </div>
    </>
  );
};
export default inject('federationMappingStore')(observer(FederationMapping));
