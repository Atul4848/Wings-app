import { makeStyles } from '@material-ui/core/styles';

export const styles = makeStyles(({ spacing, palette }) => ({
  root: {
    padding: spacing(2),
    paddingLeft: '0px',
    width: '50%',
    height: '80px',
  },
  sdtDstContainer: {
    display: 'flex',
  },
  sdtInformation: {
    paddingRight: spacing(2),
  },
  dstInformation: {
    paddingLeft: spacing(2),
    borderLeft: `1px solid ${palette.divider}`,
  },
}));

export const useStyles = makeStyles(({ spacing, palette }) => ({
  root: {
    width: '100%',
    height: '55px',
    display: 'flex',
    flexWrap: 'wrap',
    overflowX: 'auto',
    fontSize: '0.75rem',
  },
  sdtDstContainer: {
    display: 'flex',
  },
  sdtInformation: {
    paddingRight: spacing(2),
  },
  dstInformation: {
    paddingLeft: spacing(2),
    paddingRight: spacing(2),
    borderLeft: `1px solid ${palette.divider}`,
  },
  commonStyle: {
    paddingRight: spacing(2),
    paddingLeft: spacing(2),
    borderLeft: `1px solid ${palette.divider}`,
  },
}));
