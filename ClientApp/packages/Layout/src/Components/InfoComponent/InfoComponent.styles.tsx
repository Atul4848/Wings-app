import { createStyles } from '@material-ui/core/styles';
import { ITheme } from '@wings-shared/core';

export const styles = (theme: ITheme) =>
  createStyles({
    customLabel: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
    },
    textRoot: {
      textAlign: 'left',
      fontSize: '12px',
      fontWeight: 600,
    },
    icon: {
      padding: 3,
      cursor: 'pointer',
      color: theme.palette.primary.main,
    },
  });
