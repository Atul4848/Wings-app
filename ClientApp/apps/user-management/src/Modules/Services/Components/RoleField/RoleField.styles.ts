import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: Theme) => ({
  btnContainer:{
    display: 'flex',
    width: '100%',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  btnContainerSave: {
    '& button': {
      '&:hover': {
        backgroundColor: theme.palette.basicPalette.primaryLight,
      },
      backgroundColor: theme.palette.basicPalette.primary,
      height: 40,
      width: 100,
      textTransform: 'capitalize',
      '& span.MuiButton-label': {
        fontSize: 14,
      },
    },
    '& .MuiButton-contained.Mui-disabled': {
      backgroundColor: '#B5B5B5',
      color: theme.palette.background.paper,
    },
  },
  btnContainerCancel: {
    '& button': {
      backgroundColor: 'transparent',
      textTransform: 'capitalize',
      border: `1px solid ${theme.palette.basicPalette.primary}`,
      color: `${theme.palette.basicPalette.primary} !important`,
      height: 40,
      width: 100,
      marginRight: 20,
      '&:hover': {
        backgroundColor: 'rgba(99, 164, 255, 0.1) !important',
      },
    },
  },
  dialogWidth: { width: 700 },
  modalRoot: {
    '& div.MuiPaper-root': {
      background: theme.palette.background.paper,
      '& h3':{
        fontSize: 18,
        fontWeight: 600,
        color: theme.palette.grey.A700,
      },
    },
  },
  headerWrapper:{
    '& svg.MuiSvgIcon-root':{
      display: 'none',
    },
  },
  inputControl: {
    color: theme.palette.grey.A700,
    paddingBottom: theme.spacing(3),
    paddingRight: 0,
    flexBasis: 'calc(50% - 12px)',
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
      fontSize: '12px !important',
    },
    '& div.MuiAutocomplete-tag': {
      borderRadius: 4,
      maxHeight: 30,
      height: 30,
    },
  },
  formatContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    columnGap: '24px',
  },
  fullFlex:{
    flexBasis: '100%',
  },
  switch: {
    marginTop: 30,
  },
  switchLabel: {
    '& label': {
      marginLeft: 1,
    }
  },
  typeContainer: {
    width: '100%',
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: '30px',
  },
  enabledContainer: {
    paddingBottom: 12,

    '& > label': {
      marginTop: 0,
    }
  }
}));
