import React, { FC } from 'react';
import { Grid, Tooltip, Typography } from '@material-ui/core';
import { observer } from 'mobx-react';
import { useStyles } from './StagingFieldsRenderer.styles';

interface Props {
  oldValue: any[];
  newValue: any[];
  title: string;
  formatFn: (item) => string;
  showHeaders?: boolean;
}

const StagingFieldsRenderer: FC<Props> = ({ oldValue, newValue, title, formatFn, showHeaders = true }) => {
  const classes = useStyles();
  const headerName = title => {
    return (
      showHeaders && (
        <Typography variant="subtitle1" className={classes.boldSubtitle}>
          {title}
        </Typography>
      )
    );
  };

  const fieldValue = values => {
    return values?.length > 0 ? (
      <Typography variant="subtitle2">{values.map(formatFn).join(', ')}</Typography>
    ) : (
      <Typography>-</Typography>
    );
  };

  return (
    <Grid container>
      {/* Title Column */}
      <Grid item xs={4}>
        {headerName('Name')}
        <Typography variant="subtitle2" className={classes.title}>
          <Tooltip title={title}>
            <span>{title}</span>
          </Tooltip>
        </Typography>
      </Grid>
      {/* Old Value Column */}
      <Grid item xs={4}>
        {headerName('Old Value')}
        {fieldValue(oldValue)}
      </Grid>
      {/* New Value Column */}
      <Grid item xs={4}>
        {headerName('New Value')}
        {fieldValue(newValue)}
      </Grid>
    </Grid>
  );
};

export default observer(StagingFieldsRenderer);
