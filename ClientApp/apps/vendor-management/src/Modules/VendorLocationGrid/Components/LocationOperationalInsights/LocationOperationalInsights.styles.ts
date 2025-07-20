import { lighten, makeStyles, Theme } from '@material-ui/core';

export const useStyles = makeStyles((theme: Theme) => ({
  root: {
    flex: '1',
    display: 'flex',
    padding: '12px',
    flexDirection: 'column',
    backgroundColor: theme.palette.background.paper,
  },
  editorWrapperContainer: {
    overflow: 'auto',
    '& .MuiOutlinedInput-adornedEnd svg': {
      cursor: 'pointer',
    },
  },
  headerActions: {
    justifyContent: 'space-between',
    '& button': {
      backgroundColor: '#005295!important',
      color: '#ffffff',
      '&:hover': {
        backgroundColor: '#003968!important',
      },
    },
    '& .MuiTypography-h6': {
      width: '300px',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      wordWrap: 'normal',
      whiteSpace: 'nowrap',
    },
  },
  customButton: {
    '& button': {
      border: '1px solid #1976D2',
      padding: '4px 10px',
      height: '40px',
      borderRadius: '4px',
      fontSize: '14px',
      fontWeight: '400',
      width: '100%',
      textTransform: 'capitalize',
      color: '#1976D2',
    },
  },
  primaryButton: {
    '& button:hover': {
      backgroundColor: 'rgba(99, 164, 255, 0.1)',
    },
    '& button:disabled': {
      background: '#afafaf',
      border: 'none',
    },
  },
  uploadPhotos:{
    width: '98%',
    marginBottom: theme.spacing(3)
  },
  uploadedFileBox: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
    marginTop: theme.spacing(2)
  },
  fileBox: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '6px 10px 6px 0px',
    borderRadius: '4px',
    borderColor: `${lighten(theme.palette.divider, 0.6)}`,
    borderWidth: '2px',
    borderStyle: 'dashed',
    alignItems: 'center',
    height: '42px',
    fontWeight: 400,
    boxSizing: 'border-box',
    flex: '1 1 calc(33.33% - 10px)',
    maxWidth: 'calc(33.33% - 10px)',
    [theme.breakpoints.down('md')]: {
      flex: '1 1 calc(50% - 10px)',
      maxWidth: 'calc(50% - 10px)',
    },
    [theme.breakpoints.down('sm')]: {
      flex: '1 1 calc(100% - 10px)',
      maxWidth: 'calc(100% - 10px)',
    },
  },
  innerFileBox: {
    display: 'flex',
    alignItems: 'center',
  },
  fileSizeBox: {
    display: 'flex',
    gap: '10px',
    color: '#202020',
    alignItems: 'center',
    '& .MuiIconButton-root': {
      color: '#7C7C7C',
    },
  },
  // fileName: {
  //   fontSize: '14px !important',
  //   fontWeight: '400 !important',
  //   color: '#202020',
  // },
  radioLabel: {
    fontSize: '12px',
    fontWeight: 600,
    margin: '0px 0 4px 0',
  },
}));
