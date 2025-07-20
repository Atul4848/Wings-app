import { makeStyles } from '@material-ui/core';

export const styles = makeStyles(({ palette }) => ({
  noDataLabel: {
    margin: '5px 0',
    color: palette.info.main,
  },
  surveyData: {
    marginTop: 0,
  },
}));
