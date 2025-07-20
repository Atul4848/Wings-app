import React, { useEffect, useState } from 'react';
import { TextField, debounce } from '@material-ui/core';
import { ConfirmDialog } from '@wings-shared/layout';
import { Utilities } from '@wings-shared/core';

interface Props {
  queryData: { id: string; name: string };
  isRename: boolean;
  onCancel: () => void;
  onSaveTemplate: (newName) => void;
  options: { id: string; name: string; isNew: boolean }[];
}

export const QueryNameEditorDialog = ({
  isRename,
  queryData,
  ...props
}: Props) => {
  const [hasError, setHasError] = useState(false);

  // Save new Query
  const [queryName, setNewQueryName] = useState(isRename ? queryData.name : '');

  useEffect(() => {
    const isExist = props.options.some(
      ({ name, id }) =>
        Utilities.isEqual(name, queryName) && id !== queryData.id
    );
    setHasError(isExist);
  }, [queryName]);

  return (
    <ConfirmDialog
      title={isRename ? 'Rename your Query' : 'Add New Query'}
      dialogContent={
        <TextField
          label="Enter Name of your query"
          variant="outlined"
          value={queryName}
          error={hasError}
          helperText={hasError ? 'Query already exist with same name' : ''}
          onChange={e => setNewQueryName(e.target.value)}
        />
      }
      isDisabledYesButton={!queryName || hasError}
      yesButton={isRename ? 'Rename' : 'Save'}
      onNoClick={props.onCancel}
      onYesClick={() => props.onSaveTemplate(queryName)}
    />
  );
};
