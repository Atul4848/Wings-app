import { CONDITION_EDITOR } from '../../../../../../../Shared';
import { EDITOR_TYPES } from '@wings-shared/form-controls';

export const fields = {
  conditionType: {
    label: 'Condition Type',
    rules: 'required',
    placeHolder: 'Condition Type',
  },
  conditionalOperator: {
    label: 'Conditional Operator',
    rules: 'required',
  },
  conditionValues: {
    label: 'Condition Value',
    rules: 'required',
  },
};

export const getEditorType = conditionType => {
  switch (conditionType) {
    case CONDITION_EDITOR.ARRIVAL:
    case CONDITION_EDITOR.DEPARTURE:
    case CONDITION_EDITOR.USE_AS_ALTERNATE:
    case CONDITION_EDITOR.EVENT:
      return EDITOR_TYPES.SELECT_CONTROL;
    case CONDITION_EDITOR.AIRCRAFT_TYPE:
    case CONDITION_EDITOR.FLIGHT_TYPES:
    case CONDITION_EDITOR.TRAFFIC:
    case CONDITION_EDITOR.TRAFFIC_ARRIVAL_ONLY:
    case CONDITION_EDITOR.TRAFFIC_DEPARTURE_ONLY:
    case CONDITION_EDITOR.NOISE_CHAPTER_ARRIVAL:
    case CONDITION_EDITOR.NOISE_CHAPTER:
    case CONDITION_EDITOR.NOISE_CHAPTER_DEPARTURE:
    case CONDITION_EDITOR.OVERTIME:
    case CONDITION_EDITOR.EPN_DB:
      return EDITOR_TYPES.DROPDOWN;
    default:
      return EDITOR_TYPES.TEXT_FIELD;
  }
};

export const getConditionValue = (editorType, value, isMultiSelect) => {
  switch (editorType) {
    case EDITOR_TYPES.SELECT_CONTROL:
      return value ? value[0]?.entityValue : false;
    case EDITOR_TYPES.AUTO_COMPLETE:
    case EDITOR_TYPES.DROPDOWN:
      const autoCompleteValue = isMultiSelect ? value || [] : value ? value[0] : null;
      return autoCompleteValue;
    default:
      return value ? value[0]?.entityValue || '' : '';
  }
};
