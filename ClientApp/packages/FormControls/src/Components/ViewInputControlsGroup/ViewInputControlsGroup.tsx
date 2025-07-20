import React, { FC } from 'react';
import { withStyles } from '@material-ui/core';
import { Field } from 'mobx-react-form';
import { IGroupInputControls, IPagination, IViewInputControl } from '../../Interfaces';
import { styles } from './ViewInputControlsGroup.styles';
import PartialCollapsible from './PartialCollapsible/PartialCollapsible';
import { IClasses, IOptionValue, SEARCH_ENTITY_TYPE } from '@wings-shared/core';
import ViewInputControl from '../ViewInputControl/ViewInputControl';

// Note : Adding new prop add description
interface Props {
  classes?: IClasses;
  groupInputControls: IGroupInputControls[];
  // View is in edit mode or view
  isEditing: boolean;
  // Shared props for all view input controls
  field: (fieldKey: string) => Field;
  onValueChange: (option: IOptionValue, fieldKey: string) => void;
  onSearch?: (
    searchValue: string,
    fieldKey: string,
    searchEntityType?: SEARCH_ENTITY_TYPE,
    pagination?: IPagination
  ) => void;
  onFocus?: (fieldKey: string) => void;
  isExists?: (fieldKey: string) => boolean;
  // Get Input props for special cases
  inputControlProps?: (props: IViewInputControl) => IViewInputControl;
  // Get Input classes for special cases
  inputClasses?: (props: IViewInputControl) => string;
  isLoading?: boolean;
}

const ViewInputControlsGroup: FC<Props> = ({ classes, groupInputControls, isEditing, ...props }: Props) => {
  // render Input controls for group
  const renderViewControls = (inputControls: IViewInputControl[], inputControlClassName: string) => {
    if (!Array.isArray(inputControls)) {
      return null;
    }

    return (
      <>
        {inputControls
          .filter(x => !x.isHidden)
          .map((inputControl: IViewInputControl, index: number) => (
            <ViewInputControl
              {...inputControl}
              key={index}
              isEditable={isEditing}
              getOptionSelected={inputControl.getOptionSelected}
              onValueChange={value => props.onValueChange(value, inputControl.fieldKey)}
              onFocus={props.onFocus}
              isExists={inputControl.isExists || props.isExists(inputControl.fieldKey)}
              onSearch={(searchValue: string, fieldKey: string, pagination?: IPagination) =>
                props.onSearch(searchValue, fieldKey, inputControl.searchEntityType, pagination)
              }
              isLoading={inputControl.isLoading || props.isLoading}
              field={props.field(inputControl.fieldKey)}
              classes={{ flexRow: inputControlClassName }}
              {...props.inputClasses(inputControl)}
              {...props.inputControlProps(inputControl)}
            />
          ))}
      </>
    );
  };

  return (
    <div className={classes.root}>
      {groupInputControls.map((groupItem, index) => (
        <PartialCollapsible
          key={index}
          title={groupItem.title}
          isCollapsible={groupItem.isCollapsibleGroup}
          renderView={renderViewControls(groupItem.inputControls, groupItem.inputControlClassName)}
          renderCollapsibleView={renderViewControls(
            groupItem.collapsibleInputControls,
            groupItem.inputControlClassName
          )}
        />
      ))}
    </div>
  );
};
/* istanbul ignore next */
ViewInputControlsGroup.defaultProps = {
  onSearch: () => {},
  onValueChange: () => {},
  inputClasses: () => null,
  inputControlProps: () => null,
  isExists: (fieldKey: string) => null,
};
export default withStyles(styles)(ViewInputControlsGroup);
