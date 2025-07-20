import { Delete, Edit, Save } from '@material-ui/icons';
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';

import { Box, Button, TextField, Tooltip } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { Utilities, ViewPermission } from '@wings-shared/core';
import { useConfirmDialog, useUnsubscribe } from '@wings-shared/hooks';
import { AuthStore } from '@wings-shared/security';
import { useSearchParams } from 'react-router-dom';
import { finalize, takeUntil } from 'rxjs/operators';
import { GraphQLStore } from '../../../Tools';
import { QueryNameEditorDialog } from './QueryNameEditorDialog';

const defaultOption = {
  id: Utilities.getTempId(),
  name: 'New',
  isNew: true,
  treeData: '',
  selectedFields: [],
};

interface Props {
  disableActions: boolean;
  onSaveTemplate: (newName) => void;
  onQueryChange: (selectedQuery) => void;
  onDeleteTemplate: (newName) => void;
  hasChanges: boolean;
}

const QueryTemplates = (props: Props, ref) => {
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState([defaultOption]);
  const [editingItem, setEditingItem] = useState(defaultOption);

  const [searchParams, setSearchParams] = useSearchParams();

  const confirm = useConfirmDialog();
  const unsubscribe = useUnsubscribe();

  useEffect(() => {
    getUserSavedQueries();
  }, []);

  // Call function from parent component
  useImperativeHandle(
    ref,
    () => ({
      syncQueryLists,
      setDefaultOption,
      removeQuery: id => {
        const _options = options.filter(x => x.id !== id && !x.isNew);
        setOptionsData(_options);
        setDefaultOption();
      },
    }),
    [options]
  );

  const setDefaultOption = () => {
    setEditingItem(defaultOption);
  };

  const setOptionsData = options => {
    const sortedData = options.sort((a, b) => a.name.localeCompare(b.name));
    setOptions([defaultOption].concat(sortedData));
  };

  // Sync Changes when user create New Query or Rename Existing
  const syncQueryLists = (item, tempId) => {
    item.treeData = item.treeData ? JSON.parse(item.treeData) : '';
    setEditingItem(item);

    // Update Item Data
    const filteredOptions = options
      .filter(x => (x.isNew ? false : x.id !== tempId))
      .concat(item);
    setOptionsData(filteredOptions);
  };

  // Load User Saved Queries Data when user focus in Input
  const getUserSavedQueries = () => {
    setLoading(true);
    GraphQLStore.loadUserQueries(
      AuthStore.user?.preferred_username || AuthStore.user?.email
    )
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => setLoading(false))
      )
      .subscribe(({ data }) => {
        const mappedData = data.results.map(x => {
          x.treeData = x.treeData ? JSON.parse(x.treeData) : '';
          return x;
        });
        setOptionsData(mappedData);

        // Auto Select Options if query id provided in url
        const queryId = searchParams.get('queryId');
        const item = mappedData.find(x => x.id === queryId);
        if (queryId && item) {
          setEditingItem(item);
          props.onQueryChange(item);
        }
      });
  };

  const confirmSaveChanges = () => {
    confirm.confirmAction(
      () => {
        props.onSaveTemplate(editingItem);
        ModalStore.close();
      },
      {
        title: 'Confirm Save Changes',
        message: 'Are you sure you want to save this changes?',
      }
    );
  };

  const renameOrCreateQuery = isRename => {
    if (isRename || editingItem?.isNew) {
      ModalStore.open(
        <QueryNameEditorDialog
          isRename={isRename}
          queryData={editingItem}
          onCancel={() => ModalStore.close()}
          options={options}
          onSaveTemplate={name => {
            props.onSaveTemplate({ ...editingItem, name });
            ModalStore.close();
          }}
        />
      );
      return;
    }
    confirmSaveChanges();
  };

  const confirmRemoveQuery = () => {
    confirm.confirmAction(
      () => {
        props.onDeleteTemplate(editingItem);
        ModalStore.close();
      },
      {
        title: 'Confirm Remove Report',
        message: 'Are you sure you want to remove this Report?',
      }
    );
  };

  const buttonStyle = { minWidth: '45px' };

  return (
    <Box
      display="flex"
      justifyContent="end"
      gridGap={10}
      alignItems="center"
      flexShrink={0}
      flexBasis="50%"
    >
      <Autocomplete
        style={{ flex: 1 }}
        options={options}
        value={editingItem}
        size="small"
        disableClearable={true}
        loading={loading}
        disabled={props.disableActions}
        getOptionLabel={p => p.name}
        onChange={(_, value: typeof defaultOption) => {
          searchParams.set('queryId', value?.id);
          setSearchParams(searchParams);
          setEditingItem(value);
          props.onQueryChange(value);
        }}
        renderInput={params => (
          <TextField
            {...(params as any)}
            variant="outlined"
            placeholder="Select a collection"
          />
        )}
      />

      <Box gridGap="10px" display="flex" flexShrink={0}>
        <Tooltip title="Save Report">
          <Button
            color="primary"
            variant="outlined"
            size="small"
            style={buttonStyle}
            disabled={!props.hasChanges}
            onClick={() => renameOrCreateQuery(false)}
          >
            <Save />
          </Button>
        </Tooltip>
        <ViewPermission hasPermission={!editingItem?.isNew}>
          <>
            <Tooltip title="Rename Report">
              <Button
                variant="outlined"
                color="default"
                size="small"
                style={buttonStyle}
                onClick={() => renameOrCreateQuery(true)}
              >
                <Edit />
              </Button>
            </Tooltip>
            <ViewPermission hasPermission={!editingItem?.isNew}>
              <Tooltip title="Remove Report">
                <Button
                  variant="outlined"
                  color="secondary"
                  size="small"
                  style={buttonStyle}
                  onClick={confirmRemoveQuery}
                >
                  <Delete />
                </Button>
              </Tooltip>
            </ViewPermission>
          </>
        </ViewPermission>
      </Box>
    </Box>
  );
};

export default forwardRef(QueryTemplates);
