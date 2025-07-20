import { styled } from '@mui/material/styles';
import { TextField, Chip, ChipProps, Popper, Box } from '@mui/material';

export const Wrapper = styled('div')<any>(({ theme }) => ({
  position: 'relative',
  width: '100%',
}));

export const StyledChip: React.ComponentType<ChipProps> = styled(Chip)<ChipProps>(({ theme }) => ({
  margin: theme.spacing(0.5, 0.25),
  borderRadius: 4,
  height: 28,
  fontWeight: 500,
}));

export const LoadingBox = styled('div')(({ theme }) => ({
  padding: theme.spacing(1.5),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

export const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiFormLabel-root': {
    fontSize: '12px',
  },
  '& .MuiFormLabel-asterisk': {
    color: 'red',
    fontWeight: 600,
  },
  '&.Mui-disabled': {
    opacity: 1,
  },
  '& label.Mui-required:has(div)': {
    '& span.MuiInputLabel-asterisk': {
      display: 'none',
    },
  },
  '& label.Mui-required div span::after': {
    content: '"*"',
    color: 'red',
    fontWeight: 600,
  },
}));

export const StyledPopper = styled(Popper)(() => ({
  '& ul': {
    pointerEvents: 'unset !important',
  },
}));
