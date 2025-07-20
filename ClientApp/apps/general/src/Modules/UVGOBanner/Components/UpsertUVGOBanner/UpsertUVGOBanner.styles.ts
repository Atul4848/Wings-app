import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

export const styles = makeStyles(({ spacing, palette }: Theme) => ({
  flexRow: {
    display: 'flex',
    flex: 1,
    width: '100%',
    overflowY: 'auto',
    flexDirection: 'column',
  },
  flexWrap: {
    flexWrap: 'wrap',
    display: 'flex',
  },
  modalDetail: {
    paddingBottom: '20px',
    alignContent: 'center',
    justifyContent: 'space-around',
  },
  btnContainer: {
    display: 'flex',
    width: '100%',
    paddingRight: '16px',
    justifyContent: 'flex-end',
  },
  modalRoot: {
    '& div.MuiPaper-root': {
      background: palette.background.default,
      width: '800px',
    },
  },
  halfFlex: {
    paddingBottom: spacing(3),
    paddingRight: spacing(2),
    flexBasis: '50%',
  },
  fullFlex: {
    paddingBottom: spacing(3),
    paddingRight: spacing(2),
    flexBasis: '100%',
  },
}));
