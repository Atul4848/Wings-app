import { Components, Theme } from '@mui/material/styles';
import {
  cssBaseLineOverrides,
  formControlOverrides,
  formControlLabelOverrides,
  formFieldOverrides,
  formLabelOverrides,
  formSelectOverrides,
  menuItemOverrides,
  tooltipOverrides,
  buttonIconOverrides,
  inputAdornmentOverrides,
  formHelperTextOverrides,
  autocompleteOverrides,
  toggleButtonGroupOverrides,
  toggleButtonOverrides,
  switchOverrides,
  typographyOverrides,
  chipOverrides,
  menuOverrides,
  tableBodyOverrides,
  tableCellOverrides,
  tableContainerOverrides,
  tableHeadOverrides,
  tableOverrides,
  tablePaginationOverrides,
  dialogOverrides,
  checkboxOverrides,
  radioOverrides,
  sliderOverrides,
  inputBaseOverrides,
  buttonBaseOverrides,
  inputLabelOverrides
} from './index';

export const getOverrides = (theme: Theme) => {
  const commonOverrides = {
    MuiCssBaseline: cssBaseLineOverrides(),
    MuiFormControl: formControlOverrides(theme),
    MuiFormControlLabel: formControlLabelOverrides(theme),
    MuiOutlinedInput: formFieldOverrides(theme),
    MuiFormInputLabel: formLabelOverrides(theme),
    MuiSelect: formSelectOverrides(theme),
    MuiMenu: menuOverrides(theme),
    MuiMenuItem: menuItemOverrides(theme),
    MuiTooltip: tooltipOverrides(theme),
    MuiIconButton: buttonIconOverrides(theme),
    MuiInputAdornment: inputAdornmentOverrides(),
    MuiFormHelperText: formHelperTextOverrides(theme),
    MuiAutocomplete: autocompleteOverrides(theme),
    MuiToggleButtonGroup: toggleButtonGroupOverrides(theme),
    MuiToggleButton: toggleButtonOverrides(theme),
    MuiSwitch: switchOverrides(theme),
    MuiTypography: typographyOverrides(),
    MuiChip: chipOverrides(theme),
    MuiDialog: dialogOverrides(),
    MuiCheckbox: checkboxOverrides(theme),
    MuiRadio: radioOverrides(theme),
    MuiSlider: sliderOverrides(theme),
    MuiInputBase: inputBaseOverrides(theme),
    MuiTable: tableOverrides(theme),
    MuiTableContainer: tableContainerOverrides(theme),
    MuiTableHead: tableHeadOverrides(theme),
    MuiTableBody: tableBodyOverrides(theme),
    MuiTableCell: tableCellOverrides(theme),
    MuiTablePagination: tablePaginationOverrides(theme),
    MuiInputLabel: inputLabelOverrides(theme),
    MuiButtonBase: buttonBaseOverrides(theme),
    MuiFormLabel: formLabelOverrides(theme),
  };

  //  Convert for MUI 6 (Wrap inside `styleOverrides`)
  const components = Object.keys(commonOverrides).reduce((acc, key) => {
    acc[key] = { styleOverrides: commonOverrides[key] };
    return acc;
  }, {} as Record<string, { styleOverrides: any }>);

  return {
    overrides: commonOverrides, //  MUI 4
    components, //  MUI 6
  };
};


export default getOverrides;