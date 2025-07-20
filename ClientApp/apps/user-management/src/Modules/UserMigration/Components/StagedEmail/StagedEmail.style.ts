import { makeStyles } from '@material-ui/core/styles';

export const styles = makeStyles(({ palette }) => ({
  modalDetail: {
    display: 'flex',
    paddingBottom: '20px',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  modalRoot: {
    '& div.MuiPaper-root': {
      background: palette.background.default,
      width: '630px',
    },
  },
  textLabel: {
    width: '160px',
  },
  btnBox: {
    marginLeft: 10,
  },
}));
