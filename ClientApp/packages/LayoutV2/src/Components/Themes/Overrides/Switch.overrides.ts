import { ComponentsOverrides, Theme } from '@mui/material/styles';

export const switchOverrides = (theme: Theme): ComponentsOverrides['MuiSwitch'] => {
  const palette = theme.palette.switchPalette;

  return {
    root: {
      width: 40,
      height: 20,
      margin: '8px 0',
      padding: 0,
      transform: 'none',

      '&.MuiSwitch-colorPrimary.Mui-disabled': {
        '.MuiSwitch-thumb': {
          color: palette.thumb.default,
        },
        '+ .MuiSwitch-track': {
          opacity: 1,
          backgroundColor: `${palette.track.default} !important`,
        },
      },

      '& .MuiSwitch-switchBase': {
        width: 40,
        padding: 0,

        '&:hover': {
          backgroundColor: 'transparent !important',
          '.MuiSwitch-thumb': {
            color: palette.thumb.hovered,
          },
          '+ .MuiSwitch-track': {
            opacity: 1,
            backgroundColor: `${palette.track.hovered} !important`,
          },
        },

        '&:focus': {
          backgroundColor: 'transparent !important',
          '.MuiSwitch-thumb': {
            color: palette.thumb.focused,
          },
          '+ .MuiSwitch-track': {
            opacity: 1,
            backgroundColor: `${palette.track.focused} !important`,
          },
        },
      },

      '& .MuiSwitch-thumb': {
        width: 20,
        height: 20,
        borderRadius: 20,
        boxShadow: 'none',
        flexShrink: 0,
        color: palette.thumb.default,
        transition: 'color 0.2s linear',
        transform: 'translateX(-10px)',
      },

      '& .MuiSwitch-track': {
        height: 12,
        width: 40,
        marginTop: 4,
        borderRadius: 12,
        backgroundColor: palette.track.default,
        opacity: 1,
        position: 'absolute',
      },

      '& .MuiSwitch-input': {
        width: '100%',
        height: '100%',
        left: 0,
      },
    },
  };
};
