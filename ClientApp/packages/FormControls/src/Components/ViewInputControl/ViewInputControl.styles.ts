import { createStyles } from '@material-ui/core/styles';
import { ITheme } from '@wings-shared/core';

export const styles = (theme: ITheme) =>
  createStyles({
    flexRow: {
      paddingBottom: theme.spacing(3),
      paddingRight: theme.spacing(3),
      flexBasis: '33.3%',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
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
      '& .MuiFormHelperText-root.Mui-error': {
        whiteSpace: 'break-spaces',
      },
      '& .MuiInputLabel-outlined': {
        fontWeight: 600,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      },
      '& .MuiInputBase-root:has(input[readOnly])': {
        backgroundColor: theme.palette.form?.backgroundColor.disabled,
      },
    },
    fullFlex: {
      flexBasis: '100%',
    },
    halfFlex: {
      flexBasis: '50%',
    },
    quarterFlex: {
      flexBasis: '66.6%',
    },
    textInput: {
      '& [class*="Mui-disabled"]': {
        opacity: 1,
      },
    },
    autoCompleteRoot: {
      width: '100%',
      minWidth: 120,
    },
    labelRoot: {
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      lineHeight: 1.58,
      fontSize: '12px',
      fontWeight: 600,
      '& [class*="MuiFormLabel-asterisk"]': {
        color: 'red',
        fontWeight: 600,
      },
    },
    helperText: {
      whiteSpace: 'initial',
    },
    textRoot: {
      textAlign: 'left',
      fontWeight: 600,
      fontSize: '12px',
    },
    textArea: {
      width: 'auto',
      minWidth: '100%',
    },
    formValue: {
      paddingTop: theme.spacing(1.2),
      whiteSpace: 'pre-line',
      wordBreak: 'break-word',
      fontSize: '14px',
    },
    checkboxRoot: {
      marginTop: theme.spacing(2.8),
      '& .MuiCheckbox-root + .MuiFormControlLabel-label': {
        fontSize: '12px',
        fontWeight: 600,
        lineHeight: 1.58,
      },
      '& $labelRoot': {
        fontSize: '12px',
        fontWeight: 600,
        paddingTop: 3,
      },
    },
    dateTimeRoot: {
      '& [class*="MuiInputLabel-outlined"]': {
        fontSize: '12px',
        fontWeight: 600,
      },
      '& [class*="Mui-disabled"]': {
        opacity: 0.6,
      },
      '& svg': {
        color: theme.palette.primary.main,
      },
    },
    button: { marginTop: theme.spacing(3) },
    autoCompleteInputRoot: {
      '&&[class*="MuiOutlinedInput-root"]': {
        padding: 0,
      },
      '& [class*="MuiAutocomplete-input"]': {
        marginRight: '14px',
      },
    },
    editorOuter: {
      border: `1px solid ${theme.palette.grey['600']}`,
      overflowY: 'auto',
      minHeight: 150,
      maxHeight: 200,
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1),
    },
    expandedEditor: {
      maxHeight: 'calc(100vh - 280px)',
    },
    expandEditor: {
      height: 'calc(100% - 50px)',
    },
    icon: {
      display: 'inline-flex',
      fontSize: '1.2rem',
      color: theme.palette.grey['600'],
      verticalAlign: 'middle',
      marginTop: theme.spacing(1.6),
    },
    errorLabel: {
      fontSize: '0.75rem',
    },
    chip: {
      minWidth: 40,
      maxHeight: 30,
      height: 30,
      marginRight: theme.spacing(0.5),
      padding: theme.spacing(1),
      marginBottom: theme.spacing(0.25),
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      maxWidth: '100%',
    },
    optionContainer: {
      display: 'flex',
      justifyContent: 'space-between',
    },
    allOutIcon: {
      padding: 0,
      color: theme.palette.primary.main,
    },
    formHelperText: {
      float: 'right',
    },
    selectContainer: {
      width: '32%',
    },
  });
