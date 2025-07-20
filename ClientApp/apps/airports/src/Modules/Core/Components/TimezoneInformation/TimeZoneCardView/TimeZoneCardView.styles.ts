import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles(({ spacing, palette }) => ({
  cardRoot: {
    minHeight: '120px',
    width: '225px',
  },
  cardTitle: {
    backgroundColor: palette.primary.main,
    color: palette.common.white,
    padding: '5px',
    fontSize: 18,
    fontWeight: 600,
  },
  cardContent: {
    padding: '10px',
  },
  sdtDstContainer: {
    display: 'flex',
  },
  sdtInformation: {
    paddingRight: spacing(2),
  },
}));
