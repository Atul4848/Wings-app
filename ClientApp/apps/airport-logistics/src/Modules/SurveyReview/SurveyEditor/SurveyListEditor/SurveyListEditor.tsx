import React, { FC, ReactNode } from 'react';
import { observer } from 'mobx-react';
import { Button, IconButton, TextField, withTheme } from '@material-ui/core';
import { Palette } from '@material-ui/core/styles/createPalette';
import { Add, Delete } from '@material-ui/icons';
import { Field } from 'mobx-react-form';

import { styles } from './SurveyListEditor.styles';

type Props = {
  field: Field;
  addHandler: () => void;
  palette?: Palette;
};

const SurveyListEditor: FC<Props> = (observer(({
  field,
  palette,
  addHandler,
}) => {
  const classes = styles(palette);

  const addButton: ReactNode = (
    <Button
      color="primary"
      variant="contained"
      size="small"
      onClick={() => addHandler()}
    >
      <Add />
      Add New
    </Button>
  );

  return (
    <div className={classes.container}>
      {field.map((childField: Field) => (
        <div className={classes.row} key={childField.key}>
          <TextField
            {...childField.bind()}
            type="text"
            margin="none"
            variant="outlined"
            value={childField.value}
            placeholder={childField.placeholder}
            error={!!childField.error}
            helperText={childField.error}
          />
          <IconButton
            className={classes.icon}
            size="small"
            onClick={() => field.del(childField.key)}
          > 
            <Delete />
          </IconButton>
        </div>
      ))}
      {addButton}
    </div>
  );
}));

export default withTheme(SurveyListEditor);
