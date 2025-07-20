import React, { FC } from 'react';
import { Field } from 'mobx-react-form';
import { IOptionValue } from '@wings-shared/core';
import { EDITOR_TYPES, ViewInputControl, IGroupInputControls, IViewInputControl } from '@wings-shared/form-controls';

interface Props {
  isEditable?: boolean;
  getField: (fieldKey: string) => Field;
  onChange: (value: IOptionValue, fieldKey: string) => void;
  onLabelClick: (label: string, fieldKey: string) => void;
  onFocus?: (fieldKey) => void;
  showEditIcon?: boolean;
  onEditClick?: (label: string, fieldKey: string) => void;
}

const GeneralInfo: FC<Props> = ({
  isEditable,
  getField,
  onChange,
  onLabelClick,
  onFocus,
  showEditIcon,
  onEditClick,
}: Props) => {
  /* istanbul ignore next */
  const groupInputControls = (): IGroupInputControls => {
    return {
      title: '',
      inputControls: [
        {
          fieldKey: 'generalInformation.usCrewPaxInfo',
          type: EDITOR_TYPES.RICH_TEXT_EDITOR,
          label: 'US PAX Aircraft Notes',
          isInputCustomLabel: true,
        },
        {
          fieldKey: 'generalInformation.nonUSCrewPaxInfo',
          type: EDITOR_TYPES.RICH_TEXT_EDITOR,
          label: 'Non US PAX Aircraft Notes',
          isInputCustomLabel: true,
        },
        {
          fieldKey: 'generalInformation.generalInfo',
          type: EDITOR_TYPES.RICH_TEXT_EDITOR,
          label: 'Notes',
          isInputCustomLabel: true,
        },
      ],
    };
  };

  return (
    <>
      {groupInputControls().inputControls.map((inputControl: IViewInputControl, index: number) => (
        <ViewInputControl
          {...inputControl}
          key={index}
          isExists={inputControl.isExists}
          isEditable={isEditable}
          customErrorMessage={inputControl.customErrorMessage}
          field={getField(inputControl.fieldKey || '')}
          onValueChange={(option, fieldKey) => onChange(option, inputControl.fieldKey || '')}
          onLabelClick={(label, fieldKey) => onLabelClick(label, inputControl.fieldKey || '')}
          onFocus={fieldKey => onFocus && onFocus(inputControl.fieldKey)}
          showEditIcon={showEditIcon}
          onEditClick={(label, fieldKey) => onEditClick && onEditClick(label, inputControl.fieldKey || '')}
        />
      ))}
    </>
  );
};

export default GeneralInfo;
