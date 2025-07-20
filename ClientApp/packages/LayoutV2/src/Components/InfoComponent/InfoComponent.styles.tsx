import { styled } from '@mui/material/styles';
import { Box, BoxProps, FormLabel, FormLabelProps } from '@mui/material';
import { StyledComponent } from '@emotion/styled';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

export const Root: StyledComponent<BoxProps> = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
});

export const StyledFormLabel: StyledComponent<FormLabelProps> = styled(FormLabel)({
  textAlign: 'left',
  fontSize: '12px',
  fontWeight: 600,
});

export const StyledIcon: StyledComponent<any> = styled(InfoOutlinedIcon)(({ theme }) => ({
  padding: 3,
  cursor: 'pointer',
  color: theme.palette.primary.main,
}));
