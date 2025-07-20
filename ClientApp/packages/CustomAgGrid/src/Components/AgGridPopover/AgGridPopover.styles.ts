import { createStyles, Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) =>
  createStyles({
    inputAdornment: {
      paddingRight: theme.spacing(1.5),
      margin: 0,
      backgroundColor: 'transparent',
      '& svg':{
        color: theme.palette.primary.main,
      },
    },
    root: {
      padding: theme.spacing(2.5),
      width: '560px',
      paddingRight: '0',
    },
    actions: {
      flex: '0 0 auto',
      display: 'flex',
      paddingRight: theme.spacing(3),
      alignItems: 'center',
      justifyContent: 'flex-end',
    },
    container: {
      display: 'flex',
      alignItems: 'center',
    },
    textRoot: {
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      width: '210px',
      '& p':{
        marginTop: 0,
      },
    },
    flex: {
      display: 'flex',
    },
    center: {
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
