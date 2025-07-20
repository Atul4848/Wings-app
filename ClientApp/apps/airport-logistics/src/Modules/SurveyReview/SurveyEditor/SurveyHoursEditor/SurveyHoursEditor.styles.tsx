import { createStyles, Theme } from '@material-ui/core';

export const styles = (theme: Theme) =>
  createStyles({
    container: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '5px',
    },
    label: {
      width: 150,
    },
    timeFrom: {
      width: 80,
      margin: '0 10px',
    },
    timeTo: {
      width: 80,
    },
  });
