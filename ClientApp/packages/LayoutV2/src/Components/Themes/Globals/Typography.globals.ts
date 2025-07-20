/**
 * Theme typography settings
 * Font functions pulled from Material UI codebase
 * https://github.com/mui/material-ui/blob/a0cf344f22abd251bcd1f7254b5e61f2224064d9/packages/mui-material/src/styles/createTypography.js
 */
const fontFamilyDefault = '"Open Sans", sans-serif';
const fontFamilyMonospace = '"Fira Code", monospace';

const fontSize = 14;
const htmlFontSize = 14;

const fontWeightLight = 300;
const fontWeightRegular = 400;
const fontWeightMedium = 500;
const fontWeightBold = 700;

function round(value: number) {
  return Math.round(value * 1e5) / 1e5;
}

const caseAllCaps = {
  textTransform: 'uppercase',
};

/**
 * Helper function for creating theme variants
 */
const buildVariant = (
  fontFamily: string,
  fontWeight: number,
  size: number,
  lineHeight: number,
  letterSpacing: number,
  casing?: Record<string, string>
) => ({
  fontFamily,
  fontWeight,
  // fontSize: pxToRem(size),
  fontSize: size,
  // Unitless following https://meyerweb.com/eric/thoughts/2006/02/08/unitless-line-heights/
  lineHeight,
  ...(letterSpacing
    ? { letterSpacing: `${round(letterSpacing / size)}em` }
    : {}),
  ...(casing || {}),
});
export const typography = {
  /**
   * Custom font-family
   */
  fontFamily: fontFamilyDefault,

  /**
   * Base font size for Material UI components
   */
  fontSize,

  /**
   * This value is used to compute relative font units. Keep in sync with value of the
   * root element in the uvGO app. Since `rem`s aren't being used this doesn't affect anything
   * but is being set for consistency
   */
  htmlFontSize,

  /**
   * The following weights are used in the custom font options and do not override the
   * Material UI's base settings
   */
  fontWeightLight,
  fontWeightRegular,
  fontWeightMedium,
  fontWeightBold,

  h1: buildVariant(fontFamilyDefault, fontWeightLight, 70, 1.2, -0.5),
  h2: buildVariant(fontFamilyDefault, fontWeightLight, 49, 1.167, 0),
  h3: buildVariant(fontFamilyDefault, fontWeightRegular, 38, 1.235, 0.25),
  h4: buildVariant(fontFamilyDefault, fontWeightRegular, 26, 1.334, 0),
  h5: buildVariant(fontFamilyDefault, fontWeightMedium, 18, 1.6, 0.15),
  h6: buildVariant(fontFamilyDefault, fontWeightBold, 16, 1.75, 0.15),
  subtitle1: buildVariant(fontFamilyDefault, fontWeightRegular, 12, 1.66, 0.4),
  subtitle2: buildVariant(fontFamilyDefault, fontWeightMedium, 12, 1.66, 0.4),
  body1: buildVariant(fontFamilyDefault, fontWeightRegular, 14, 1.4, 0.15),
  body2: buildVariant(fontFamilyDefault, fontWeightRegular, 14, 1.4, 0.15), // Not in Figma; duplicate body1
  button: buildVariant(fontFamilyDefault, fontWeightMedium, 14, 1.43, 0.4),
  caption: buildVariant(fontFamilyDefault, fontWeightRegular, 11, 1.66, 0.4),
  overline: buildVariant(
    fontFamilyDefault,
    fontWeightRegular,
    10,
    1.66,
    1,
    caseAllCaps
  ),
  monospace: buildVariant(fontFamilyMonospace, fontWeightRegular, 14, 1.4, 0),
};
