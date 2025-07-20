import { makeStyles, Theme } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: Theme) => ({
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
  flexSection: {
    marginBottom: 20,
    '& button': {
      backgroundColor: 'transparent',
      border: `1px solid ${theme.palette.basicPalette.primary}`,
      color: `${theme.palette.basicPalette.primary} !important`,
      height: 40,
      '&:hover': {
        backgroundColor: 'rgba(99, 164, 255, 0.1) !important',
      },
    },
  },
  active: {
    '& p': {
      color: theme.palette.basicPalette.additionalColors.green,
      fontWeight: '600',
    },
  },
  inActive: {
    '& p': {
      color: theme.palette.error.main,
      fontWeight: '600',
    },
  },
  inputControl: {
    color: theme.palette.grey.A700,
    paddingBottom: 0,
    paddingRight: theme.spacing(3),
    flexBasis: '25%',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    '& p': {
      fontSize: 12,
    },
    '& label': {
      fontWeight: '600',
      color: theme.palette.grey.A700,
      fontSize: 12,
    },
  },
}));
