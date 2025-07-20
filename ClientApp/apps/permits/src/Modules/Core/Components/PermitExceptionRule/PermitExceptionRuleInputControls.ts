import { EDITOR_TYPES, IViewInputControl } from '@wings-shared/form-controls';

export const inputControls: IViewInputControl[] = [
  {
    fieldKey: 'ruleLogicalOperator',
    label: 'Logical Operator*',
    isEditable: false,
    isDisabled: true,
    type: EDITOR_TYPES.DROPDOWN,
    options: [],
  },
  {
    fieldKey: 'ruleEntityType',
    label: 'Entity Type*',
    isEditable: true,
    type: EDITOR_TYPES.DROPDOWN,
    options: [],
  },
  {
    fieldKey: 'ruleField',
    label: 'Field*',
    isEditable: true,
    type: EDITOR_TYPES.DROPDOWN,
    options: [],
  },
  {
    fieldKey: 'ruleConditionalOperator',
    label: 'Conditional Operator*',
    isEditable: true,
    type: EDITOR_TYPES.DROPDOWN,
    options: [],
  },
  {
    fieldKey: 'ruleValues',
    label: 'Value*',
    isEditable: true,
    type: EDITOR_TYPES.TEXT_FIELD,
    disableCloseOnSelect: true,
    options: [],
  },
  {
    fieldKey: 'delete',
    label: 'Delete',
    isEditable: true,
    type: EDITOR_TYPES.BUTTON,
  },
];

export const exceptionInputControls: IViewInputControl[] = [
  {
    fieldKey: 'name',
    label: 'Rule Name*',
    isEditable: true,
    type: EDITOR_TYPES.TEXT_FIELD,
    isHalfFlex: true,
  },
  {
    fieldKey: 'permitRequirementType',
    label: 'Requirement Type*',
    isEditable: true,
    type: EDITOR_TYPES.DROPDOWN,
    options: [],
  },
];