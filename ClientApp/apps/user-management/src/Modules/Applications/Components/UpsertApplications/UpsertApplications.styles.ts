import { Theme, makeStyles } from '@material-ui/core';

export const styles = makeStyles((theme: Theme) =>({
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
  inputControl: {
    color: theme.palette.grey.A700,
    paddingBottom: theme.spacing(3),
    paddingRight: theme.spacing(3),
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
      fontSize: 12,
    },
    '& .MuiFormLabel-root':{
      fontSize: 12,
    },
    '& .MuiFormControlLabel-label':{
      color: theme.palette.grey.A700,
      fontSize: 13,
    },
    '& .MuiFormControlLabel-root':{
      marginLeft: 0,
    },
  },
  fullFlex:{
    flexBasis: '50%',
    paddingRight: 0,
  },
  title: {
    fontSize: 24,
    fontWeight: 600,
    marginBottom: 15,
    color: theme.palette.grey.A700,
  },
  titleHeading: {
    fontWeight: 400,
    color: theme.palette.grey.A700,
    fontSize: 12,
    marginBottom: 4,
  },
  flexRowSection: {
    position: 'absolute',
    '& div': {
      top: 30,
      paddingRight: 16,
      position: 'relative',
    },
    '& button': {
      '&:first-child': {
        backgroundColor: 'transparent',
        border: '1px solid #1976D2',
        color: '#1976D2 !important',
        height: 40,
        width: 100,
        '&:hover': {
          backgroundColor: '#EFF6FF !important',
        },
      },
      '&:last-child': {
        '&:hover': {
          backgroundColor: '#63A4FF',
        },
        backgroundColor: '#1976D2',
        height: 40,
        width: 100,
        '& span.MuiButton-label': {
          fontSize: 14,
        },
      },
    },
  },
}));
