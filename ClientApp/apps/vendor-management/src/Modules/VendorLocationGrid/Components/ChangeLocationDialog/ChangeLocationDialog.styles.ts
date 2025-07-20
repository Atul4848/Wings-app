import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles({
  dialogTitle: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  radioSection: {
    paddingLeft: '10px',
  },
  airportSelect: {
    marginTop: '10px',
  },
  tableContainer: {
    marginTop: '10px',
  },
  customHeight: {
    height: 'calc(100vh - 280px)',
  },
  formWrapper: {
    '& label': {
      marginTop: 0,
      fontSize: '1rem !important',
      fontWeight: '400 !important',
    },
    '& .flexWrap:first-child': {
      paddingBottom: 0,
    },
  },
});
