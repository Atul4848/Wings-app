import { createStyles, Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) =>
  createStyles({
    textField: {
      width: 220,
    },
    labelRoot: {
      fontSize: theme.spacing(2),
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      '& [class*="MuiFormLabel-asterisk"]': {
        color: 'red',
        fontWeight: 600,
      },
    },
    inputRoot:{
      minHeight: '40px',
    },
    customAdornedEnd:{
      '& svg':{
        color:theme.palette.primary.main,
      }
    },
  });
