import { makeStyles } from '@material-ui/core/styles';

export const styles = makeStyles(({ palette }) => ({
  inputBox: {
    flexBasis: '50%',
    whiteSpace: 'nowrap',
    paddingRight: 24,
    textOverflow: 'ellipsis',
    paddingBottom: 24,
  },
  btnSubmit: {
    marginLeft: 15,
    marginTop: 19,
    textTransform: 'capitalize',
  },
  singleContent: {
    backgroundColor: palette.background.paper,
    padding: 15,
    display: 'flex',
    flexWrap: 'wrap',
    '& h6': {
      fontSize: 12,
      color: palette.basicPalette.text,
      fontWeight: 600,
    },
    '& button': {
      marginLeft: 0,
      marginTop: 4,
    },
  },
  scrollable: {
    border: `1px solid ${palette.divider}`,
    marginBottom: 20,
    borderTop: 0,
  },
  overwriteBox: {
    '& span.MuiFormControlLabel-label': {
      fontSize: 14,
      fontWeight: 600,
    }
  },
  cardRowBtn: {
    display: 'flex',
    justifyContent: 'end',
    paddingRight: 0,
  },
  btnContainer: {
    display: 'flex',
  },
  btnAlign: {
    backgroundColor: '#1976D2',
    textTransform: 'capitalize',
    height: 40,
    width: 150,
    marginLeft: 50,
  },
  btnSection: {
    '& button': {
      border: 0,
      paddingLeft: 0,
      color: '#1976d2',
      boxShadow: 'none',
      backgroundColor: 'transparent',
      textTransform: 'capitalize',
      '&:hover': {
        color: '#1976d2',
        backgroundColor: 'transparent !important',
        textDecoration: 'underline',
        boxShadow: 'none',
      },
    },
  },
  titleBox: {
    marginBottom: 10,
  },
  infoIcon: {
    display: 'flex',
    fontSize: 11,
    color: palette.basicPalette.textColors.secondary,
    opacity: 0.7,
    alignItems: 'end',
    marginTop: 5,
    '& > div': {
      width: 12,
      marginRight: 4,
    }
  },
}));
