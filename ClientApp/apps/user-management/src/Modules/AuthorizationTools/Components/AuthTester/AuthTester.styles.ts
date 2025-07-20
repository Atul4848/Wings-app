import { makeStyles } from '@material-ui/core/styles';

export const styles = makeStyles(({ palette }) =>({
  headerContainerTop: {
    border: `1px solid ${palette.divider}`,
    padding: '25px 25px',
    height: 'calc(100vh - 200px)',
    borderTop: 0,
  },
  flexSection: {
    display: 'flex',
  },
  selectionSection: {
    width: '85%',
  },
  selectInput: {
    width: 200,
    marginRight: 10,
    float: 'left',
    height: 80,
    '& div.MuiSelect-select': {
      height: 40,
      paddingTop: 9,
      color: palette.grey.A700,
      fontSize: 12,
    },
    '& input': {
      height: 40,
      fontSize: 12,
      color: palette.grey.A700,
    },
  },
  manageRoleBtn: {
    width: '15%',
    textAlign: 'right',
    '& button': {
      backgroundColor: palette.basicPalette.primary,
      height: 40,
      marginTop: 18,
      width: 127,
    },
  },
  subTitleRes:{
    fontSize: 14,
    color: palette.grey.A700,
    marginTop: 1,
  },
  textWarningMessages: {
    margin: '1px 30px 0 0',
    fontSize: 14,
    fontWeight: 600,
    color: palette.error.light,
  },
  textGoodMessages: {
    margin: '1px 30px 0 0',
    fontWeight: 600,
    fontSize: 14,
    color: palette.basicPalette.additionalColors.green,
  },
  textInput: {
    '& input': {
      height: 40,
    },
  },
  subTitle: {
    fontSize: 12,
    fontWeight: 600,
    color: palette.grey.A700,
  },
  resultSection: {
    color: palette.grey.A700,
    fontSize: 18,
    fontWeight: 600,
    marginTop: 20,
    marginBottom: 10,
  },
}));
