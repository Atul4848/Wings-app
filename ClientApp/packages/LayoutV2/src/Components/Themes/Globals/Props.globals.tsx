import React from 'react';

export const props: any = {
  MuiTextField: {
    variant: 'outlined',
  },
  MuiFormControl: {
    variant: 'outlined',
  },
  MuiButtonBase: {
    disableRipple: true,
  },
  MuiCheckbox: {
    disableRipple: true,
    color: 'primary',
    icon: (<span />),
    checkedIcon: (
      <svg viewBox="0 0 24 24">
        <path
          fill="currentColor"
          strokeWidth="2"
          d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z"
        />
      </svg>
    ),
    indeterminateIcon: (
      <svg viewBox="0 0 8 8">
        <line stroke="currentColor" strokeWidth="2" x1="0" y1="4" x2="8" y2="4" />
      </svg>
    ),
  },
  MuiRadio: {
    disableRipple: true,
    color: 'primary',
    icon: (<span />),
    checkedIcon: (<span data-checked-icon />),
  },
  MuiTablePagination: {
    labelRowsPerPage: 'Page size:',
    labelDisplayedRows: () => null,
  },
};
