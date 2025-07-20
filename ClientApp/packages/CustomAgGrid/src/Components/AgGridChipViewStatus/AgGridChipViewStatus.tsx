import React from 'react';
import { Chip, Tooltip, withStyles } from '@material-ui/core';
import AgGridBaseEditor from '../AgGridBaseEditor/AgGridBaseEditor';
import { IBaseEditorProps } from '../../Interfaces';
import { ICellRendererComp, ICellRendererParams } from 'ag-grid-community';
import { styles } from './AgGridChipViewStatus.styles';
import { IClasses, ISelectOption } from '@wings-shared/core';
import classNames from 'classnames';
import { StatusBadge } from '@uvgo-shared/status-badges';
import { STATUS_BADGE_TYPE } from '../../Enums';

interface Props extends Partial<IBaseEditorProps> {
  classes: IClasses;
  chipLabelField?: string;
  tooltipField?: string;
  isPlainText?: boolean;
  isString?: boolean;
  isServicesStatus?: boolean;
  isCustomerNumber?: boolean;
  valueFormatted?: string;
}

class AgGridChipViewStatus extends AgGridBaseEditor<Props> implements ICellRendererComp {
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
    const {
      value,
      chipLabelField,
      tooltipField,
      isPlainText,
      isString = false,
      isServicesStatus: isServicesStatus = false,
      isCustomerNumber: isCustomerNumber = false,
    } = this.props;
    if (isString) {
      const badgeType = (): STATUS_BADGE_TYPE => {
        switch (value) {
          case 'DEPROVISIONED':
          case 'INACTIVE':
            return STATUS_BADGE_TYPE.INITIAL;
          case 'PROVISIONED':
          case 'RECOVERY':
          case 'STAGED':
          case 'SUSPENDED':
          case 'PENDING_IMPORT':
            return STATUS_BADGE_TYPE.PROGRESS;
          case 'ACTIVE':
            return STATUS_BADGE_TYPE.ACCEPTED;
          case 'DELETED':
          case 'LOCKED_OUT':
          case 'PASSWORD_EXPIRED':
            return STATUS_BADGE_TYPE.REJECTED;
          default:
            return STATUS_BADGE_TYPE.INITIAL;
        }
      };
      return <StatusBadge type={badgeType()} label={value} />;
    }
    if (isServicesStatus) {
      if (value) {
        return <StatusBadge type="accepted" label="Enabled" />;
      }
      return <StatusBadge type="initial" label="Disabled" />;
    }
    if (isCustomerNumber) {
      if (value) {
        return <Chip size="small" classes={this.props.classes} label={value} />;
      }
      return '';
    }
    if (!Array.isArray(value)) {
      return null;
    }
    return value.map((chipData: ISelectOption, index) => (
      <Tooltip key={index} title={chipData[tooltipField] || ''}>
        <Chip size="small" classes={this.props.classes} label={isPlainText ? chipData : chipData[chipLabelField]} />
      </Tooltip>
    ));
  }
}

export default withStyles(styles)(AgGridChipViewStatus);
