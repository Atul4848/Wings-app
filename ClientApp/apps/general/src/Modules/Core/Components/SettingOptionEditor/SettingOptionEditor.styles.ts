import { makeStyles } from '@material-ui/core/styles';

export const styles = makeStyles(({ palette }) => ({
  userMappedWidth: { width: 660 },
  contentModal: {
    display: 'flex',
    width: '595px',
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
}));
