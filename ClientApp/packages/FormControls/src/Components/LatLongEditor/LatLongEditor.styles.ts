import { createStyles } from '@material-ui/core/styles';
import { ITheme } from '@wings-shared/core';

export const styles = (theme: ITheme) =>
  createStyles({
    flexRow: {
      display: 'flex',
    },
    inputAdornment: {
      paddingRight: theme.spacing(1.5),
      margin: 0,
      backgroundColor: 'transparent',
    },
    root: {
      padding: theme.spacing(2.5),
      width: '560px',
      paddingRight: '0',
    },
    actions: {
      flex: '0 0 auto',
      display: 'flex',
      paddingRight: theme.spacing(3),
      alignItems: 'center',
      justifyContent: 'flex-end',
    },
    container: {
      display: 'flex',
      alignItems: 'center',
    },
    textRoot: {
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      width: '210px',
    },
    flex: {
      display: 'flex',
    },
    center: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    labelRoot: {
      fontWeight: 600,
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      lineHeight: 1.58,
      '& [class*="MuiFormLabel-asterisk"]': {
        color: 'red',
        fontWeight: 600,
      },
    },
    textInput: {
      '& [class*="Mui-disabled"]': {
        opacity: 1,
      },
    },
    helperText: {
      whiteSpace: 'initial',
    },
    flexRowRoot: {
      paddingBottom: theme.spacing(3),
      paddingRight: theme.spacing(3),
      flexBasis: '33.3%',
      overflow: 'hidden',
      whiteSpace:'nowrap',
      textOverflow: 'ellipsis',
      '& .MuiInputBase-root.Mui-disabled': {
        backgroundColor: theme.palette.form?.backgroundColor.disabled,
        '& .MuiInputAdornment-positionEnd': {
          backgroundColor: 'transparent',
          '& .MuiIconButton-root.Mui-disabled': {
            color: theme.palette.grey[500],
          },
        },
      },
      '& .MuiFormHelperText-root.Mui-error':{
        whiteSpace: 'break-spaces',
      },
      '& .MuiInputLabel-outlined':{
        fontWeight: 600,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      },
      '& .MuiInputBase-root:has(input[readOnly])': {
        backgroundColor: theme.palette.form?.backgroundColor.disabled,
      },
    },
  });
