import { makeStyles } from '@material-ui/core/styles';

export const styles = makeStyles(() => ({
  modalRoot: {
    '& div.MuiPaper-root': {
      height: 500,
      width: 900,
      padding: 20,
    },
    '& div.ag-row-odd': {
      background: 'transparent',
    },
    '& div.ag-body-viewport': {
      overflowY: 'hidden',
    },
  },
  btnAlign: {
    backgroundColor: '#1976D2',
    textTransform: 'capitalize',
    height: 40,
    width: 150,
    boxShadow: 'none',
    marginTop: 20,
  },
  btnContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  headerWrapper: {
    '& div': {
      display: 'none',
    },
  },
  contextSection: {
    position: 'absolute',
    bottom: '20px',
    right: '40px',
  }
}));
