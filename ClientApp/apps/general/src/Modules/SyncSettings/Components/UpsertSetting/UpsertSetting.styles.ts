import { makeStyles } from '@material-ui/core/styles';

export const styles = makeStyles(({ palette }) => ({
  userMappedWidth: { width: 700 },
  contentModal: {
    display: 'flex',
    width: '600px',
  },
  nameInput: {
    width: 240,
    marginRight: '15px',
  },
  btnValue: {
    width: 80,
    marginLeft: 15,
    marginTop: 19,
  },
  btnSection: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  modalRoot: {
    '& div.MuiPaper-root': {
      background: palette.background.default,
    },
  },
  customLoader: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '20%',
  },
  contentLabel: {
    width: 300,
    marginTop: '20px',
    marginBottom: '20px',
    textAlign: 'center',
    fontSize: '20px',
  },
  cronDescription: {
    marginTop: -20,
    marginBottom: 20
  },
}));
