import { makeStyles, Theme } from '@material-ui/core';

export const useHourConditionEditorStyles = makeStyles(({ spacing }: Theme) => ({
  containerClass: {
    paddingTop: spacing(2.5),
  },
  typeField: {
    flexBasis: '40%',
  },
  operatorField: {
    flexBasis: '26%',
  },
  deleteButtonWrapper: {
    marginTop: '25px',
    marginRight: '25px',
  },
  deleteButtonRoot: {
    minWidth: 'auto',
    maxWidth: 40,
    maxHeight: 40,
  },
}));
