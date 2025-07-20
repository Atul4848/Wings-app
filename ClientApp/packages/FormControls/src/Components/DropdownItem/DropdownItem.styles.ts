import { createStyles, Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => {
  const grey = theme.palette.grey['100'];
  return createStyles({
    item: {
      '&.MuiButtonBase-root': {
        display: 'flex',
        width: '100%',
        height: '100%',
        borderBottom: `1px solid ${grey}`,
        color: theme.palette.text.primary,
        cursor: 'pointer',
        fontSize: '13px',
        justifyContent: 'start',
        '&:hover': {
          backgroundColor: grey,
        },
      },
    },
    headerItem: {
      '&.MuiButtonBase-root': {
        padding: '10px 12px',
      },
    },
    subtitle: {
      color: theme.palette.text.primary,
      textTransform: 'uppercase',
      padding: '18px 12px 5px 12px',
      fontSize: '11px',
      fontWeight: 700,
    },
    red: {
      color: theme.palette.error.main,
    },
    itemNoPadding: {
      padding: 0,
    },
  });
};
