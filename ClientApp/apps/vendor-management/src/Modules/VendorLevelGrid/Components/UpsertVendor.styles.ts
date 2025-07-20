import { createStyles, makeStyles, Theme } from '@material-ui/core';

export const useStyles = makeStyles((theme: Theme) =>
  createStyles({
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
    buttonContainer: {
      display: 'flex',
      justifyContent: 'end',
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(1),
    },
    modalContainer: {
      '& .MuiAutocomplete-inputRoot[class*="MuiOutlinedInput-root"] .MuiAutocomplete-input:first-child':{
        height: '40px',
        padding: '8px',
      }
    },
    defaultButton: {
      marginLeft: '10px',
      '& button': {
        padding: '4px 10px',
        height: '40px',
        fontSize: '14px',
        fontWeight: '400',
        width: '140px',
        textTransform: 'capitalize',
        color: '#1976D2',
        marginRight: '0',
      },
    },
    primaryButton: {
      '& button': {
        background: '#1976D2',
        color: '#fff',
        padding: '4px 10px',
        height: '40px',
        fontSize: '14px',
        fontWeight: '400',
        width: '140px',
        textTransform: 'capitalize',
      },
      '& button:disabled': {
        background: '#afafaf',
        border: 'none',
      },
      '& button:hover': {
        background: '#63A4FF'
      }
    },
    warningIcon: {
      fontSize: 60,
      color: '#F2C12C',
    },
    customHeight: {
      height: 'calc(100vh - 290px)',
    },
    editorWrapperContainer: {
      overflow: 'auto',
    },
    gridHeight: {
      paddingBottom: '70px',
    },
    heading: {
      fontSize: '12px !important',
      fontWeight: 'bold',
      margin: '12px 0px 8px 0',
    },
    heading2: {
      textAlign: 'center',
      fontSize: '20px !important',
      fontWeight: 'bold',
      paddingBottom: '20px',
    },
    inputDropdown: {
      width: '100%',
    },
    titlefont: {
      fontSize: '18px',
      fontWeight: 600,
    },
  }));
