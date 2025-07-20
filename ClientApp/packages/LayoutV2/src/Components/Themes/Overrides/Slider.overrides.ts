import { ComponentsOverrides, Theme } from '@mui/material/styles';

export const sliderOverrides = (theme: Theme): ComponentsOverrides['MuiSlider'] => {
  const palette = theme.palette.slider;

  return {
    root: {
      '&.MuiSlider-vertical': {
        '& .MuiSlider-rail': {
          width: 5,
          borderRadius: 5,
          color: palette.rail,
          opacity: 1,
        },
        '& .MuiSlider-track': {
          width: 5,
          borderRadius: 5,
          color: palette.track,
        },
        '& .MuiSlider-mark': {
          display: 'none',
        },
        '& .MuiSlider-thumb': {
          width: 18,
          height: 18,
          background: palette.thumb,
          boxShadow: 'none !important',
          marginLeft: -6.5,
          marginBottom: -9,
        },
      },
    },
    thumb: {
      width: 18,
      height: 18,
      marginTop: -7,
      background: palette.thumb,
      boxShadow: 'none !important',
    },
    valueLabel: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 116,
      height: 30,
      fontSize: 14,
      top: 32,
      left: 'auto',
      textAlign: 'center' as any,
      background: palette.label,
      borderRadius: 200,

      '& *': {
        width: 116,
        height: 30,
        fontSize: 14,
        display: 'inline',
        background: 'none',
        transform: 'none',
        whiteSpace: 'nowrap',
        textAlign: 'center',
        lineHeight: '30px',
      },
    },
    mark: {
      background: palette.mark,
      width: 1,
      height: 24,
      top: -10,
    },
    markLabel: {
      top: -30,
      fontSize: 14,
    },
    track: {
      height: 5,
      borderRadius: 5,
      color: palette.track,
    },
    rail: {
      height: 5,
      borderRadius: 5,
      color: palette.rail,
      opacity: 1,
    },
  };
};
