import { ComponentsOverrides, Theme } from '@mui/material/styles';

export const menuOverrides = ({ palette }: Theme): ComponentsOverrides['MuiMenu'] => ({
  paper: {
    borderRadius: 4,
    border: `1px solid ${palette?.menuItem?.frameColor}`,
    boxShadow: '0 3px 6px 0 rgba(0, 0, 0, 0.16)',
  },
  list: {
    paddingTop: 0,
    paddingBottom: 0,
  },
});