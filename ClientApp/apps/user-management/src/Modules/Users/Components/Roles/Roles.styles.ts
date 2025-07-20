import { makeStyles, Theme } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: Theme) => ({
  flexRow: {
    display: 'flex',
    flex: 1,
    width: '100%',
    overflowY: 'auto',
    flexDirection: 'column',
    paddingBottom: 0,
    '& > div:first-child': {
      width: '100%',
    },
    '& h5': {
      fontWeight: '600',
      color: theme.palette.grey.A700,
    },
  },
  mainContainer: {
    '& div.MuiPaper-root': {
      boxShadow: 'none',
    },
  },
  inputControl: {
    color: theme.palette.grey.A700,
    paddingBottom: 0,
    paddingRight: 0,
    flexBasis: '25%',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    '& input': {
      height: 40,
      fontSize: 12,
    },
    '& label': {
      fontWeight: '600',
      color: theme.palette.grey.A700,
      margin: 0,
      lineHeight: 'inherit',
    },
    '& div.MuiInputAdornment-positionEnd svg': {
      color: theme.palette.basicPalette.primary,
    },
    '& label.MuiInputLabel-root.Mui-disabled': {
      color: theme.palette.grey.A700,
    },
    '& span.MuiFormControlLabel-label.Mui-disabled': {
      color: theme.palette.grey.A700,
    },
    '& span': {
      fontWeight: 600,
      color: theme.palette.grey.A700,
      fontSize: 12,
    },
    '& span.MuiChip-label': {
      color: theme.palette.background.paper,
    },
    '& svg.MuiChip-deleteIconColorPrimary': {
      color: theme.palette.background.paper,
    },
    '& div.MuiAutocomplete-tag': {
      borderRadius: 4,
      maxHeight: 30,
      height: 30,
    },
  },
}));