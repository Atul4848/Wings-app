import React, { RefObject } from 'react';
import { IBaseEditorProps } from '../../Interfaces';
import { observable } from 'mobx';
import { DATE_FORMAT, Utilities, UnsubscribableComponent, IOptionValue } from '@wings-shared/core';
import moment from 'moment';

class AgGridBaseEditor<P extends Partial<IBaseEditorProps>> extends UnsubscribableComponent<P> {
  protected textFieldRef: RefObject<HTMLInputElement> = React.createRef();
  @observable protected showError: boolean = false;
  @observable public hasFocus: boolean = false;

  constructor(props: P) {
    super(props);
  }

  public afterGuiAttached(): void {
    if (this.props.cellStartedEdit) {
      this.focusIn();
    }
  }

  public focusIn(): void {
    const { current } = this.textFieldRef;
    if (!current) {
      return;
    }
    current.focus();
    this.props.value && current.select();
  }

  protected get isRequired(): boolean {
    const { isRequired, node } = this.props;
    const isCallable: boolean = isRequired instanceof Function;
    if (isCallable) {
      return isRequired(node);
    }
    return Boolean(isRequired);
  }

  protected get isEditable(): boolean {
    const { isEditable, node, getEditableState } = this.props;
    const isCallable: boolean = typeof getEditableState === 'function';
    return isCallable ? getEditableState(node) : isEditable;
  }

  protected get isDisable(): boolean {
    const { node, getDisableState } = this.props;
    const isCallable: boolean = typeof getDisableState === 'function';
    return isCallable ? getDisableState(node) : false;
  }

  protected get minDate(): string {
    const { node, minDate } = this.props;
    const isCallable: boolean = typeof minDate === 'function';
    return isCallable ? minDate(node) : null;
  }

  protected get maxDate(): string {
    const { node, maxDate } = this.props;
    const isCallable: boolean = typeof maxDate === 'function';
    return isCallable ? maxDate(node) : null;
  }

  protected get ignoreDate(): boolean {
    const { node, ignoreDate } = this.props;
    const isCallable: boolean = typeof ignoreDate === 'function';
    return isCallable ? ignoreDate(node) : false;
  }

  protected parentOnChange(value: IOptionValue): void {
    const { componentParent } = this.props.context;
    if (!componentParent.onInputChange) {
      return;
    }
    componentParent.onInputChange(this.props, value);
  }

  protected parentOnBlur(value: IOptionValue): void {
    const { componentParent } = this.props.context;
    if (typeof componentParent.onInputBlur !== 'function') {
      return;
    }
    componentParent.onInputBlur(this.props, value);
  }

  protected validDateTime(
    selectedDateTime: string,
    compareDateTime: string,
    isStart: boolean,
    pickerType: string,
    ignoreTime?: boolean,
    ignoreDate?: boolean
  ): string {
    if (!selectedDateTime || !compareDateTime) {
      return '';
    }

    if (moment(compareDateTime, DATE_FORMAT.API_FORMAT).isValid()) {
      const isValidDateTime: boolean = isStart
        ? Utilities.compareDateTime(selectedDateTime, compareDateTime, DATE_FORMAT.API_FORMAT, ignoreTime, ignoreDate)
        : Utilities.compareDateTime(compareDateTime, selectedDateTime, DATE_FORMAT.API_FORMAT, ignoreTime, ignoreDate);

      if (!isValidDateTime) {
        return isStart
          ? `Start ${pickerType} should be before end ${pickerType}`
          : `End ${pickerType} should be after start ${pickerType}`;
      }
    }
    return '';
  }

  // require for testing
  render() {
    return null;
  }
}
export default AgGridBaseEditor;
