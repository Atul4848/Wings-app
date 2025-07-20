import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: Theme) => ({
  modalDetail: {
    padding: '0 20px 20px',
  },
  modalDetailSection:{
    alignContent: 'center',
    display: 'flex',
    flexWrap: 'wrap',
  },
  modalDetailEdit: {
    padding: '0 20px 20px',
    '& div': {
      pointerEvents: 'none',
    },
    '& button': {
      display: 'none',
    },
  },
  btnContainer: {
    display: 'flex',
    width: '100%',
    justifyContent: 'flex-end',
  },
  modalRoot: {
    '& div.MuiPaper-root': {
      background: theme.palette.background.default,
      width: '900px',
      padding: 0,
    },
  },
  fullFlex: {
    paddingBottom: 0,
    paddingRight: 0,
    flexBasis: '33%',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    '& span': {
      padding: '2px 9px',
    },
  },
  checkSection:{
    display: 'flex',
    justifyContent: 'end',
    marginTop: 10,
    '& span': {
      fontSize: 16,
    },
  },
  headerWrapper: {
    background: '#1976D2',
    color: theme.palette.background.default,
    height: 60,
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    margin: 0,
    '& h3': {
      justifyContent: 'center',
    },
    '& div': {
      marginRight: '20px !important',
      color: theme.palette.background.default,
    },
  },
}));