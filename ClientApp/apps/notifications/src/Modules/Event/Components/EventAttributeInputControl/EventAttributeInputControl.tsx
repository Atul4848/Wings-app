import { ViewInputControl, IGroupInputControls, IViewInputControl } from '@wings-shared/form-controls';
import { FormLabel, withStyles } from '@material-ui/core';
import { styles } from './EventAttributeInputControl.style';
import React, { ReactNode } from 'react';
import { FieldDefinitionModel } from '../../..';
import { observer } from 'mobx-react';
import { IClasses, IOptionValue, Utilities, UnsubscribableComponent } from '@wings-shared/core';

interface Props {
  classes?: IClasses;
  attributes: FieldDefinitionModel[];
  onValueUpdate: (value: IOptionValue, fieldKey: string) => void;
  groupInputControls: IGroupInputControls;
  focusOutFields: string[];
  onFocus: (fieldKey: string) => void;
}

@observer
class EventAttributeInputControl extends UnsubscribableComponent<Props> {
  private getValue(fieldKey: string): string | boolean {
    const attributes = this.props.attributes;
    return attributes?.find(x => x.variableName === fieldKey)?.value || '';
  }

  private customErrorMessage(fieldKey: string): string {
    const { attributes, focusOutFields } = this.props;
    return focusOutFields?.some(x => Utilities.isEqual(x, fieldKey))
      ? attributes?.find(x => Utilities.isEqual(x.variableName, fieldKey))?.errorMessage || ''
      : '';
  }

  public render(): ReactNode {
    const classes = this.props.classes as IClasses;
    return (
      <div className={classes.flexRow}>
        <div className={classes.flexWrap}>
          {this.props.groupInputControls.inputControls?.map((inputControl: IViewInputControl, index: number) => (
            <div key={index} className={classes.inputControl}>
              <FormLabel className={classes.textRoot}>{inputControl.label}</FormLabel>
              <ViewInputControl
                {...inputControl}
                key={index}
                fieldKey={inputControl.fieldKey}
                type={inputControl.type}
                isEditable={true}
                customErrorMessage={this.customErrorMessage(inputControl.fieldKey || '')}
                field={{
                  label: '',
                  bind: () => null,
                  value: this.getValue(inputControl.fieldKey || ''),
                  key: inputControl.fieldKey,
                  showErrors: () => null,
                }}
                onValueChange={(value: IOptionValue, _: string) =>
                  this.props.onValueUpdate(value, inputControl.fieldKey || '')
                }
                onFocus={(fieldKey: string) => this.props.onFocus(fieldKey)}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(EventAttributeInputControl);
export { EventAttributeInputControl as PureEventAttributeInputControl };
