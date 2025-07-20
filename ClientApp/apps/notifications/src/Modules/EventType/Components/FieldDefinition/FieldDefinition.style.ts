import { createStyles, Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) =>
  createStyles({
    btnContainer: {
      display: 'flex',
      width: '100%',
      justifyContent: 'flex-end',
    },
    dialogWidth: { width: 700 },
    modalRoot: {
      '& div.MuiPaper-root': {
        background: theme.palette.background.default,
      },
    },
    inputControl: {
      width: '350px',
    },
    formatContainer: {
      display: 'flex',
      alignItems: 'center',
    },
    adornmentField: {
      '& .MuiOutlinedInput-adornedEnd': {
        paddingLeft: 0,
        position: 'relative',
        bottom: '1px',
        width: '260px',
      },
    },
  });
