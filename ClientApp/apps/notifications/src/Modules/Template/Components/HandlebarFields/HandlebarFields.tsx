import React from 'react';
import { Typography, withStyles } from '@material-ui/core';
import { useStyles } from './HandlebarFields.style';

interface Props {
  fields?: string[];
}

const HandlebarFields = ({ fields = [] }: Props) => {
  const classes = useStyles();
  return (
    <div className={classes.fieldsContainer}>
      <div>
        <Typography>Handlebar Fields:</Typography>
      </div>
      <div className={classes.fields}>
        <ul>
          {fields.map(x => (
            <li>{x}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};
export default HandlebarFields;
