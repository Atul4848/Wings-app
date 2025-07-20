import { createStyles, Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) =>
  createStyles({
    modalRoot: {
      '& div.MuiPaper-root': {
        background: theme.palette.background.paper,
        width: 480,
        padding: 20,
      },
    },
    headerWrapper: {
      '& h3':{
        fontWeight: 600,
        fontSize: 18,
        display: 'block',
        color: theme.palette.grey.A700,
      },
      '& div':{
        display: 'none',
      },
    },
    content:{
      color: theme.palette.grey.A700,
      marginBottom: 20,
    },
    btnContainer: { display: 'flex',
    },
    btnSection: {
      '& button': {
        border: 0,
        paddingLeft: 0,
        color: '#1976d2',
        boxShadow: 'none',
        backgroundColor: 'transparent',
        textTransform: 'capitalize',
        '&:hover': {
          color: '#1976d2',
          backgroundColor: 'transparent !important',
          textDecoration: 'underline',
          boxShadow: 'none',
        },
      },
    },
    btnAlign: {
      '& button': {
        backgroundColor: '#1976D2',
        textTransform: 'capitalize',
        height: 40,
        width: 150,
        marginLeft: 50,
      },
    },
  });
