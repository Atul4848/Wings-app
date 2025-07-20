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
        background: palette.background.paper,
        width: '450px',
        height:'450px',
      },
    },
    fullFlex: {
      paddingBottom: spacing(3),
      paddingRight: spacing(0),
      flexBasis: '100%',
    },
  });

export const useStyles = makeStyles(({ palette, spacing }: Theme) => ({
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
      background: palette.background.paper,
      width: '450px',
      height:'450px',
    },
  },
  fullFlex: {
    paddingBottom: spacing(3),
    paddingRight: spacing(0),
    flexBasis: '100%',
  },
}));
