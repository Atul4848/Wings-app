import React, { ChangeEvent, FC, RefObject, useEffect, useMemo, useRef } from 'react';
import { Typography, Theme, FormControlLabel, Checkbox } from '@material-ui/core';
import { VIEW_MODE } from '@wings/shared';
import { observable } from 'mobx';
import { ColDef, GridOptions, ValueFormatterParams, RowNode } from 'ag-grid-community';
import { inject, observer } from 'mobx-react';
import { finalize, takeUntil } from 'rxjs/operators';
import { FeatureNoteModel, FeatureNoteStore, FEATURE_NOTE_FILTERS } from '../Shared';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import NotesIcon from '@material-ui/icons/Notes';
import { PrimaryButton } from '@uvgo-shared/buttons';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { AlertStore } from '@uvgo-shared/alert';
import { AxiosError } from 'axios';
import { useStyles } from './FeatureNote.styles';
import { MarkdownPreviewControl } from './Components';
import { useNavigate } from 'react-router';
import { Dialog } from '@uvgo-shared/dialog';
import IconButton from '@material-ui/core/IconButton';
import RemoveRedEye from '@material-ui/icons/RemoveRedEye';
import {
  DATE_FORMAT,
  IClasses,
  ISelectOption,
  UIStore,
  Utilities,
  GRID_ACTIONS,
  cellStyle,
  SearchStore,
} from '@wings-shared/core';
import { ConfirmDialog } from '@wings-shared/layout';
import { ISearchHeaderRef, SearchHeaderV2 } from '@wings-shared/form-controls';
import {
  CustomAgGridReact,
  useGridState,
  useAgGrid,
  agGridUtilities,
} from '@wings-shared/custom-ag-grid';
import { useUnsubscribe } from '@wings-shared/hooks';
import FeatureNoteDialog from './Components/FeatureNoteDialog/FeatureNoteDialog';
import { AuthStore } from '@wings-shared/security';

type Props = {
  classes?: IClasses;
  theme?: Theme;
  featureNoteStore?: FeatureNoteStore;
};

const FeatureNote: FC<Props> = ({ ...props }: Props) => {
  const localStates = observable({ includeArchive: false });
  const gridState = useGridState();
  const agGrid = useAgGrid<FEATURE_NOTE_FILTERS, FeatureNoteModel>([], gridState);
  const unsubscribe = useUnsubscribe();
  const classes = useStyles();
  const navigate = useNavigate();
  const searchHeaderRef = useRef<ISearchHeaderRef>();
  
  useEffect(() => {
    const searchData = SearchStore.searchData.get(location.pathname);
    if (searchData?.searchValue) {
      gridState.setPagination(searchData.pagination);
      searchHeaderRef.current?.setupDefaultFilters(searchData);
      SearchStore.clearSearchData(location.pathname);
      return;
    }
    loadInitialData();
  }, []);

  const loadInitialData = () => {
    UIStore.setPageLoader(true);
    props.featureNoteStore
      ?.getFeatureNotes(localStates.includeArchive)
      .pipe(finalize(() => UIStore.setPageLoader(false)))
      .subscribe((data: FeatureNoteModel[]) => {
        gridState.setGridData(data);
      });
  }

  const hasAnyPermission = useMemo(() => AuthStore.permissions.hasAnyPermission([ 'write' ]), [
    AuthStore.permissions,
  ]);

  const removeFeatureNote = (rowIndex: number): void => {
    ModalStore.close();
    const featureNote: FeatureNoteModel = agGrid._getTableItem(rowIndex);
    UIStore.setPageLoader(true);
    props.featureNoteStore
      ?.removeFeatureNote(featureNote)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: boolean) => {
          if (response) {
            agGrid._removeTableItems([ featureNote ]);
            gridState.setGridData(agGrid._getAllTableRows());
          }
        },
        error: (error: AxiosError) => AlertStore.critical(error.message),
      });
  }

  const addFeatureNote = (featureNote: FeatureNoteModel): void => {
    UIStore.setPageLoader(true);
    props.featureNoteStore
      ?.addFeatureNote(featureNote)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false);
          ModalStore.close();
        })
      )
      .subscribe({
        next: (featureNote: FeatureNoteModel) =>
          navigate &&
          navigate(`/general/feature-notes/${featureNote?.id}/${VIEW_MODE.EDIT.toLowerCase()}`),
        error: error => AlertStore.critical(error.message),
      });
  }

  const updateFeatureNote = (rowIndex: number, featureNote: FeatureNoteModel): void => {
    UIStore.setPageLoader(true);
    props.featureNoteStore
      ?.updateFeatureNote(featureNote)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false);
          ModalStore.close();
        })
      )
      .subscribe({
        next: response => {
          if (response) {
            if (featureNote.isArchived && !localStates.includeArchive) {
              agGrid._removeTableItems([ featureNote ]);
              return;
            }
            agGrid._updateTableItem(rowIndex, featureNote);
            loadInitialData();
          }
        },
        error: error => AlertStore.critical(error.message),
      });
  }

  const columnDefs: ColDef[] = [
    {
      headerName: 'Start Date',
      field: 'startDate',
      valueFormatter: ({ value }: ValueFormatterParams) => Utilities.getformattedDate(value, DATE_FORMAT.GRID_DISPLAY),
    },
    {
      headerName: 'Title',
      field: 'title',
    },
    {
      headerName: 'Category',
      field: 'category',
      comparator: (current: ISelectOption, next: ISelectOption) => Utilities.customComparator(current, next, 'value'),
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
    },
    {
      headerName: 'Version',
      field: 'releaseVersion',
    },
    {
      headerName: 'Internal',
      field: 'isInternal',
      filter: true,
      filterParams: { applyMiniFilterWhileTyping: true },
      cellRenderer: 'checkBoxRenderer',
      cellRendererParams: {
        readOnly: true,
      },
    },
    {
      headerName: 'Published',
      field: 'isPublished',
      filter: true,
      filterParams: { applyMiniFilterWhileTyping: true },
      cellRenderer: 'checkBoxRenderer',
      cellRendererParams: {
        readOnly: true,
      },
    },
    {
      headerName: 'Archived',
      field: 'isArchived',
      cellRenderer: 'checkBoxRenderer',
      cellRendererParams: {
        readOnly: true,
      },
    },
    {
      headerName: 'Created On',
      field: 'createdOn',
      valueFormatter: ({ value }: ValueFormatterParams) => Utilities.getformattedDate(value, DATE_FORMAT.GRID_DISPLAY),
    },
    {
      headerName: 'Preview',
      field: 'message',
      cellRenderer: 'viewRenderer',
      minWidth: 100,
      cellRendererParams: {
        getViewRenderer: (rowIndex: number, { data }: RowNode) =>
          data?.message ? (
            <div className={props.classes?.center}>
              <IconButton edge="end" onClick={() => previewMarkdown(data.message)}>
                <RemoveRedEye fontSize="small" />
              </IconButton>
            </div>
          ) : (
            ''
          ),
      },
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
            title: 'Edit',
            isHidden: false,
            action: GRID_ACTIONS.EDIT,
            isDisabled: !hasAnyPermission,
            to: node => `/general/feature-notes/${node.data?.id}/${VIEW_MODE.EDIT.toLowerCase()}`,
          },
          {
            title: 'Publish',
            isDisabled: !hasAnyPermission,
            isHidden: Boolean(node.data.isPublished) || Boolean(node.data.isArchived),
            action: GRID_ACTIONS.PUBLISH,
          },
          {
            title: 'Archive',
            isDisabled: !hasAnyPermission,
            isHidden: Boolean(node.data.isArchived),
            action: GRID_ACTIONS.ARCHIVE,
          },
          {
            title: 'UnArchive',
            isDisabled: !hasAnyPermission,
            isHidden: !Boolean(node.data.isArchived),
            action: GRID_ACTIONS.UNARCHIVE,
          },
          {
            title: 'Delete',
            isDisabled: !hasAnyPermission,
            isHidden: false,
            action: GRID_ACTIONS.DELETE,
          },
        ],
        onAction: (action: GRID_ACTIONS, rowIndex: number) => gridActions(action, rowIndex),
      },
    },
  ];

  const gridOptions = (): GridOptions => {
    return {
      ...agGrid.gridOptionsBase({
        context: this,
        columnDefs,
        isEditable: true,
        gridActionProps: {
          showDeleteButton: false,
          getDisabledState: () => gridState.hasError,
          onAction: (action: GRID_ACTIONS, rowIndex: number) => {},
        },
      }),
      isExternalFilterPresent: () => searchHeaderRef.current?.hasSearchValue || false,
      doesExternalFilterPass: node => {
        const searchHeader = searchHeaderRef.current;
        if (!searchHeader) {
          return false;
        }
        const { id, startDate, title, releaseVersion, category } = node.data as FeatureNoteModel;
        return agGrid.isFilterPass(
          {
            [FEATURE_NOTE_FILTERS.START_DATE]: Utilities.getformattedDate(startDate, DATE_FORMAT.GRID_DISPLAY),
            [FEATURE_NOTE_FILTERS.TITLE]: title,
            [FEATURE_NOTE_FILTERS.VERSION]: releaseVersion,
            [FEATURE_NOTE_FILTERS.CATEGORY]: category?.value as string,
          },
          searchHeader.searchValue,
          searchHeader.selectedOption
        );
      },
    };
  }

  const openAddFeatureNoteDialog = (): void => {
    ModalStore.open(
      <FeatureNoteDialog featureNotes={gridState.data} addFeatureNote={featureNote => addFeatureNote(featureNote)} />
    );
  }

  const gridActions = (gridAction: GRID_ACTIONS, rowIndex: number): void => {
    if (rowIndex === null) {
      return;
    }
    switch (gridAction) {
      case GRID_ACTIONS.DELETE:
        confirmRemoveFeatureNote(rowIndex);
        break;
      case GRID_ACTIONS.PUBLISH:
        confirmPublishFeatureNote(rowIndex);
        break;
      case GRID_ACTIONS.ARCHIVE:
        confirmArchiveFeatureNote(rowIndex);
        break;
      case GRID_ACTIONS.UNARCHIVE:
        confirmUnArchiveFeatureNote(rowIndex);
        break;
    }
  }

  const previewMarkdown = (value: string): void => {
    ModalStore.open(
      <Dialog
        title={'Markdown Preview'}
        open={true}
        onClose={() => ModalStore.close()}
        classes={{ paperSize: classes.paperSize }}
        dialogContent={() => (
          <div className={classes.root}>
            <MarkdownPreviewControl value={value} />
          </div>
        )}
      />
    );
  }

  const confirmRemoveFeatureNote = (rowIndex: number): void => {
    const model: FeatureNoteModel = agGrid._getTableItem(rowIndex);
    if (model.id === '') {
      agGrid._removeTableItems([ model ]);
      return;
    }

    ModalStore.open(
      <ConfirmDialog
        title="Confirm Delete"
        message="Are you sure you want to remove this Feature Note?"
        yesButton="Delete"
        onNoClick={() => ModalStore.close()}
        onYesClick={() => removeFeatureNote(rowIndex)}
      />
    );
  }

  const confirmPublishFeatureNote = (rowIndex: number): void => {
    const model: FeatureNoteModel = agGrid._getTableItem(rowIndex);
    if (model.id === '') {
      agGrid._removeTableItems([ model ]);
      return;
    }

    ModalStore.open(
      <ConfirmDialog
        title="Confirm Publish"
        message="Are you sure you want to publish this Feature Note?"
        yesButton="Publish"
        onNoClick={() => ModalStore.close()}
        onYesClick={() => {
          model.isPublished = true;
          updateFeatureNote(rowIndex, model);
        }}
      />
    );
  }

  const confirmArchiveFeatureNote = (rowIndex: number): void => {
    const model: FeatureNoteModel = agGrid._getTableItem(rowIndex);
    if (model.id === '') {
      agGrid._removeTableItems([ model ]);
      return;
    }

    ModalStore.open(
      <ConfirmDialog
        title="Confirm Archive"
        message="Are you sure you want to archive this Feature Note?"
        yesButton="Archive"
        onNoClick={() => ModalStore.close()}
        onYesClick={() => {
          model.isArchived = true;
          updateFeatureNote(rowIndex, model);
        }}
      />
    );
  }

  const confirmUnArchiveFeatureNote = (rowIndex: number): void => {
    const model: FeatureNoteModel = agGrid._getTableItem(rowIndex);
    if (model.id === '') {
      agGrid._removeTableItems([ model ]);
      return;
    }

    ModalStore.open(
      <ConfirmDialog
        title="Confirm UnArchive"
        message="Are you sure you want to unarchive this Feature Note?"
        yesButton="UnArchive"
        onNoClick={() => ModalStore.close()}
        onYesClick={() => {
          model.isArchived = false;
          updateFeatureNote(rowIndex, model);
        }}
      />
    );
  }

  const includeArchivedChange = (event: ChangeEvent<HTMLInputElement>): void => {
    localStates.includeArchive = event.target.checked;
    loadInitialData();
  }

  return (
    <>
      <div className={classes.headerContainer}>
        <div className={classes.subSection}>
          <NotesIcon className={classes.icon} />
          <Typography component="h3" className={classes.heading}>
            Feature Notes
          </Typography>
        </div>
        <div className={classes.searchContainer}>
          <SearchHeaderV2
            ref={searchHeaderRef as RefObject<ISearchHeaderRef>}
            selectInputs={[ agGridUtilities.createSelectOption(FEATURE_NOTE_FILTERS, FEATURE_NOTE_FILTERS.START_DATE) ]}
            onFilterChange={() => gridState.gridApi.onFilterChanged()}
            disableControls={gridState.isRowEditing}
            onExpandCollapse={agGrid.autoSizeColumns}
          />
          <FormControlLabel
            control={<Checkbox onChange={e => includeArchivedChange(e)} />}
            label="Include Archived"
          />
        </div>
        <div>
          <PrimaryButton
            variant="contained"
            color="primary"
            disabled={!hasAnyPermission}
            onClick={() => openAddFeatureNoteDialog()}
            startIcon={<AddIcon />}
          >
            Add Feature Note
          </PrimaryButton>
        </div>
      </div>
      <div className={classes.mainroot}>
        <div className={classes.mainContent}>
          <CustomAgGridReact gridOptions={gridOptions()} rowData={gridState.data} />
        </div>
      </div>
    </>
  );
}

export default inject('featureNoteStore')(observer(FeatureNote));