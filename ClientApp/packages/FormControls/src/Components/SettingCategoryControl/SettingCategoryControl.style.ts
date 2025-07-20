import { createStyles, Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) =>
  createStyles({
    dropDownContainer: {
      display: 'flex',
      flex: 0,
      flexDirection: 'column',
      minWidth: '49.5%',
      '& label':{
        fontSize: '12px',
        fontWeight: 600,
      }
    },
    title: {
      marginBottom: theme.spacing(1.25),
    },
    dropDown: {
      display: 'flex',
      flex: 1,
    },
   
  });
