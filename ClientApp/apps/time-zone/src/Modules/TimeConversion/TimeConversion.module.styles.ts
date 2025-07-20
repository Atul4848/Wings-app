import { Theme, createStyles, makeStyles } from '@material-ui/core';

export const useStyles = makeStyles((theme: Theme) => ({
  inputsContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    '& > *': { margin: theme.spacing(0.5) },
  },
  textField: {
    display: 'flex',
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '280px',
    padding: '0 !important',
  },

  textFieldLabel: {
    width: '45%',
  },
  conversionDateField: {
    maxWidth: '220px',
  },
  selectedOption: {
    width: 120,
  },
  inputField:{
    minHeight:'40px',
  },
}));


