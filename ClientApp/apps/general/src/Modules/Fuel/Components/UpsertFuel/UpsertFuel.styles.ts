import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

export const styles = ({ palette, spacing }: Theme) =>
  createStyles({
    modalDetail: {
      paddingBottom: '20px',
      alignContent: 'center',
      justifyContent: 'space-around',
    },
    btnContainer: {
      display: 'flex',
      width: '100%',
      justifyContent: 'flex-end',
    },
    modalRoot: {
      '& div.MuiPaper-root': {
        background: palette.background.default,
        width: '630px',
      },
    },
    fullFlex: {
      paddingBottom: spacing(3),
      paddingRight: spacing(0),
      flexBasis: '100%',
    },
  });
export const useStyles = makeStyles((theme: Theme) => ({
  modalDetail: {
    paddingBottom: '20px',
    alignContent: 'center',
    justifyContent: 'space-around',
  },
  btnContainer: {
    display: 'flex',
    width: '100%',
    justifyContent: 'flex-end',
  },
  modalRoot: {
    '& div.MuiPaper-root': {
      background: theme.palette.background.default,
      width: '630px',
    },
  },
  fullFlex: {
    paddingBottom: theme.spacing(3),
    paddingRight: theme.spacing(0),
    flexBasis: '100%',
  },
}));