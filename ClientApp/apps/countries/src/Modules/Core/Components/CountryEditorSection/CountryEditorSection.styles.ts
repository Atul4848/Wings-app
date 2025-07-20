import { makeStyles, Theme } from '@material-ui/core';

export const useStyles = makeStyles((theme: Theme) => ({
  flexColumn: {
    paddingBottom: theme.spacing(3),
    paddingRight: theme.spacing(3),
    flexBasis: '33.3%',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    '& .MuiFormHelperText-root.Mui-error': {
      whiteSpace: 'break-spaces',
    },
    '& .MuiInputLabel-outlined': {
      fontWeight: 400,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
  },
  custom: {
    '&$flexColumn': {
      paddingRight: 0,
    },
  },
  labelRoot: {
    fontSize: theme.spacing(2),
    '& [class*="MuiFormLabel-asterisk"]': {
      color: 'red',
      fontWeight: 800,
    },
  },
  textRoot: {
    textAlign: 'left',
    fontWeight: 600,
  },
  textInput: {
    '& [class*="Mui-disabled"]': {
      opacity: 0.6,
    },
  },
  formValue: {
    paddingTop: theme.spacing(1.2),
    paddingRight: theme.spacing(3),
  },
  checkboxRoot: {
    marginTop: theme.spacing(1.6),
    '& .MuiCheckbox-root + .MuiFormControlLabel-label': {
      fontSize: theme.spacing(2),
      lineHeight: 1.58,
    },
  },
  dateTimeRoot: {
    '& [class*="MuiInputLabel-outlined"]': {
      fontSize: theme.spacing(2),
    },
  },
}));
