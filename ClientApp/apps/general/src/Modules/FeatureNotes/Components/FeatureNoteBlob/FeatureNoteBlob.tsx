import React, { FC } from 'react';
import { Theme } from '@material-ui/core';
import { CustomAgGridReact, BaseGrid, AgGridActions, useGridState, useAgGrid } from '@wings-shared/custom-ag-grid';
import { ColDef, GridOptions, RowNode } from 'ag-grid-community';
import { inject, observer } from 'mobx-react';
import { BlobModel, FEATURE_NOTE_FILTERS, FeatureNoteModel, FeatureNoteStore } from '../../../Shared';
import { useStyles } from './FeatureNoteBlob.styles';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { finalize, takeUntil } from 'rxjs/operators';
import { AlertStore } from '@uvgo-shared/alert';
import { IClasses, UIStore, GRID_ACTIONS, cellStyle } from '@wings-shared/core';
import { ChildGridWrapper, ConfirmDialog, CollapsibleWithButton, ImportDialog } from '@wings-shared/layout';
import { useUnsubscribe } from '@wings-shared/hooks';
import { useBaseUpsertComponent } from '@wings/shared';
import { useParams } from 'react-router-dom';

type Props = {
  classes?: IClasses;
  theme?: Theme;
  featureNoteId: string;
  rowData: BlobModel[];
  onDataUpdate?: (blobs: BlobModel[]) => void;
  featureNoteStore?: FeatureNoteStore;
};


const FeatureNoteBlob: FC<Props> = ({ ...props }: Props) => {
  const gridState = useGridState();
  const agGrid = useAgGrid<FEATURE_NOTE_FILTERS, BlobModel>([], gridState);
  const unsubscribe = useUnsubscribe();
  const classes = useStyles();
  const params = useParams();
  const useUpsert = useBaseUpsertComponent(params, null);

  const columnDefs: ColDef[] = [
    {
      headerName: 'Name',
      field: 'name',
    },
    {
      headerName: 'Url',
      field: 'url',
    },
    {
      headerName: 'Action',
      cellRenderer: 'actionRenderer',
      cellEditor: 'actionRenderer',
      sortable: false,
      filter: false,
      minWidth: 150,
      maxWidth: 210,
      suppressSizeToFit: true,
      suppressNavigable: true,
      cellStyle: { ...cellStyle() },
      cellRendererParams: {
        isActionMenu: true,
        actionMenus: (node: RowNode) => [
          {
            title: `Copy as ${node?.data?.name.split('.').pop() === 'gif' ? 'GIF' : 'Image'}`,
            isHidden: false,
            action: GRID_ACTIONS.SAVE,
          },
          {
            title: 'Delete',
            isHidden: false,
            action: GRID_ACTIONS.DELETE,
          },
        ],
        onAction: (action: GRID_ACTIONS, rowIndex: number) => gridActions(action, rowIndex),
      },
    },
  ];

  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: this,
      columnDefs: columnDefs,
      isEditable: false,
    });

    return {
      ...baseOptions,
      defaultColDef: {
        ...baseOptions.defaultColDef,
        suppressMovable: true,
        minWidth: 150,
      },
      frameworkComponents: {
        actionRenderer: AgGridActions,
      },
    };
  }

  const uploadBlob = (file: File): void => {
    const { featureNoteId } = props;
    UIStore.setPageLoader(true);
    props.featureNoteStore
      ?.uploadBlob(featureNoteId, file)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false);
          ModalStore.close();
        })
      )
      .subscribe({
        next: (response: FeatureNoteModel) => {
          if (response) {
            props.onDataUpdate && props.onDataUpdate(response.blobUrls);
          }
        },
        error: error => AlertStore.critical(error.message),
      });
  }

  const removeBlob = (rowIndex: number): void => {
    const { featureNoteId, featureNoteStore } = props;
    const blob: BlobModel = agGrid._getTableItem(rowIndex);
    UIStore.setPageLoader(true);
    featureNoteStore
      ?.removeBlob(featureNoteId, blob.url)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false);
          ModalStore.close();
        })
      )
      .subscribe({
        next: (response: boolean) => {
          if (response) {
            agGrid._removeTableItems([ blob ]);
            props.onDataUpdate && props.onDataUpdate(agGrid._getAllTableRows());
          }
        },
        error: error => AlertStore.critical(error.message),
      });
  }

  const openUploadBlobModal = (): void => {
    ModalStore.open(
      <ImportDialog
        title="Select Media"
        btnText="Upload"
        fileType="jpg|jpeg|png|gif|JPG|JPEG|PNG|GIF"
        isLoading={() => useUpsert.loader.isLoading}
        onUploadFile={file => uploadBlob(file)}
      />
    );
  }

  const gridActions = (gridAction: GRID_ACTIONS, rowIndex: number): void => {
    if (rowIndex === null) {
      return;
    }
    switch (gridAction) {
      case GRID_ACTIONS.DELETE:
        confirmRemoveBlob(rowIndex);
        break;
      case GRID_ACTIONS.SAVE:
        copyBlobUrl(rowIndex);
        break;
    }
  }

  const copyBlobUrl = (rowIndex: number) => {
    const blob: BlobModel = agGrid._getTableItem(rowIndex);
    navigator.clipboard.writeText(`<img src="${blob.url}" alt="${blob.name}" width="800"/>`);
    AlertStore.info('Copied.!!');
  }

  const confirmRemoveBlob = (rowIndex: number): void => {
    const model: BlobModel = agGrid._getTableItem(rowIndex);
    if (model.id === '') {
      agGrid._removeTableItems([ model ]);
      return;
    }

    ModalStore.open(
      <ConfirmDialog
        title="Confirm Delete"
        message="Deleting this media doesn't delete the media tagged in content.
         Are you sure you want to remove this media?"
        yesButton="Delete"
        onNoClick={() => ModalStore.close()}
        onYesClick={() => removeBlob(rowIndex)}
      />
    );
  }

  return (
    <CollapsibleWithButton
      title="Media"
      buttonText="Upload Media"
      onButtonClick={() => openUploadBlobModal()}
    >
      <ChildGridWrapper>
        <CustomAgGridReact
          isRowEditing={gridState.isRowEditing}
          rowData={props.rowData}
          gridOptions={gridOptions()}
          disablePagination={gridState.isRowEditing}
        />
      </ChildGridWrapper>
    </CollapsibleWithButton>
  );
}

export default inject('featureNoteStore')(observer(FeatureNoteBlob));
