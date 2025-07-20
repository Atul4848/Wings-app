import { TextField, withStyles } from '@material-ui/core';
import { getTextFieldStyles } from './AgGridTextField.styles';

const AgGridTextField = withStyles(getTextFieldStyles)(TextField);
export default AgGridTextField;
