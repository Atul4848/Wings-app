import React from 'react';
import { Tooltip, Chip, withStyles } from '@material-ui/core';
import AgGridBaseEditor from '../AgGridBaseEditor/AgGridBaseEditor';
import { IBaseEditorProps } from '../../Interfaces';
import { ICellRendererComp, ICellRendererParams } from 'ag-grid-community';
import { styles } from './AgGridChipView.styles';
import { IClasses, ISelectOption } from '@wings-shared/core';

interface Props extends Partial<IBaseEditorProps> {
  classes: IClasses;
  chipLabelField?: string;
  tooltipField?: string;
  isPlainText?: boolean;
}

class AgGridChipView extends AgGridBaseEditor<Props> implements ICellRendererComp {
  static defaultProps = {
    chipLabelField: 'label',
    tooltipField: 'label',
  };

  public refresh(params: ICellRendererParams): boolean {
    return true;
  }

  public getGui(): HTMLElement {
    return this.textFieldRef.current;
  }

  render() {
    const { value, chipLabelField, tooltipField, isPlainText } = this.props;
    if (!Array.isArray(value)) {
      return null;
    }
    return value.map((chipData: ISelectOption, index) => (
      <Tooltip key={index} title={chipData[tooltipField] || ''}>
        <Chip
          size="small"
          classes={this.props.classes}
          label={isPlainText ? chipData : chipData[chipLabelField]}
        />
      </Tooltip>
    ));
  }
}

export default withStyles(styles)(AgGridChipView);
