import { makeStyles } from '@material-ui/core/styles';


export const styles = makeStyles(({ palette }) =>({
  headerContainerTop: {
    border: `1px solid ${palette.divider}`,
    borderTop: 0,
    padding: '25px 25px 0',
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
  filterBtn: {
    width: '15%',
    textAlign: 'right',
    '& button': {
      backgroundColor: palette.basicPalette.primary,
      height: 40,
      marginTop: 18,
      width: 130,
    },
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
  mainroot: {
    height: 'calc(100vh - 310px)',
    '& div.ag-header-cell': {
      '&:first-child': {
        '& div.ag-react-container img': {
          display: 'none',
        },
      },
    },
    '& div.ag-cell': {
      color: palette.grey.A700,
    },
    '& div.ag-header-row': {
      background: palette.basicPalette.additionalColors.gray,
    },
    '& div.ag-header-viewport': {
      background: palette.basicPalette.additionalColors.gray,
    },
    '& div.ag-row-odd': {
      background: 'transparent',
    },
    '& div.MuiChip-colorPrimary': {
      background: palette.basicPalette.primary,
    },
  },
  filledError: {
    color: palette.error.main,
    fontSize: 12,
    marginTop: 2,
    '& ~ div fieldset': {
      border: `1px solid ${palette.error.main}`,
    },
  },
}));
