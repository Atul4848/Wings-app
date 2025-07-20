import { makeStyles, Theme } from "@material-ui/core";
import { flexColumn } from "@wings-shared/core";

export const useStyles = makeStyles((theme: Theme) => ({
  paperSize: {
    width: '750px',
  },
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: 300,
    width: '100%',
  },
  selectFileSection: {
    ...flexColumn(theme),
    height: '85%',
    justifyContent: 'center',
    border: `1px dashed ${theme.palette.text.primary}`,
    borderRadius: theme.spacing(2),
    marginBottom: theme.spacing(1),
    cursor: 'pointer',
    marginRight: '24px',
  },
  selectFile: {
    textAlign: 'center',
  },
}));
