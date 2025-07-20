import { createStyles, Theme ,makeStyles} from '@material-ui/core/styles';
import { textFieldStyles, textFieldContainerStyles } from '../../Styles';

export const styles = (theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
    },
    flex: { display: 'flex' },
    formControlLabel: { width: 120 },
    textFieldContainer: { ...textFieldContainerStyles(theme) },
    textField: { ...textFieldStyles(theme) },
  });

export const useStyles = makeStyles((theme: Theme) => ({
  root: {
    width: '100%',
  },
  flex: { display: 'flex' },
  formControlLabel: { width: 120 },
  textFieldContainer: { ...textFieldContainerStyles(theme) },
  textField: { ...textFieldStyles(theme) },
}));
