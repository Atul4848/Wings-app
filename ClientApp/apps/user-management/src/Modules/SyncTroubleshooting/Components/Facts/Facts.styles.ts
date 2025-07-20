import { makeStyles } from '@material-ui/core/styles';

export const styles = makeStyles(({ palette }) => ({
  inputBox: {
    paddingRight: 24,
    paddingBottom: 0,
  },
  scrollable: {
    border: `1px solid ${palette.divider}`,
    marginBottom: 20,
    borderTop: 0,
  },
  singleContent: {
    backgroundColor: palette.background.paper,
    padding: '15px 15px 0',
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
  infoIcon: {
    display: 'flex',
    fontSize: 11,
    color: palette.basicPalette.textColors.secondary,
    opacity: 0.7,
    alignItems: 'end',
    margin: '5px 15px 15px', 
    '& > div': {
      width: 12,
      marginRight: 4,
    }
  },
}));
