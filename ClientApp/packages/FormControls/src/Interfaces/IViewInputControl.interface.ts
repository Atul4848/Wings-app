import { Field } from 'mobx-react-form';
import { EDITOR_TYPES } from '../Enums';
import { ReactNode } from 'react';
import { AutocompleteGetTagProps } from '@material-ui/lab/Autocomplete';
import { SelectOption } from '../Models';
import { IClasses, IOptionValue, ISelectOption, SEARCH_ENTITY_TYPE } from '@wings-shared/core';
import { FilterOptionsState } from '@material-ui/lab';
import { PopperPlacementType } from '@material-ui/core';
import { IPagination } from './IPagination.interface';

export interface IViewInputControl {
  field?: Field;
  fieldKey?: string; // map values using this key
  classes?: IClasses;
  multiline?: boolean;
  reactNode?: ReactNode;
  rows?: number;
  type?: EDITOR_TYPES;
  isEditable?: boolean;
  isDisabled?: boolean;
  dropDownValue?: string;
  options?: ISelectOption[];
  minDate?: string;
  maxDate?: string;
  dateTimeFormat?: string;
  datePickerViews?: Array<'year' | 'date' | 'month'>;
  dateInputMask?: (string | RegExp)[];
  isHidden?: boolean;
  autoSelect?: boolean;
  isExists?: boolean;
  customErrorMessage?: string;
  onValueChange?: (value: IOptionValue, fieldKey: string) => void;
  onSearch?: (option: string, fieldKey: string, pagination?: IPagination) => void;
  showTooltip?: boolean;
  showChipTooltip?: boolean;
  is12HoursFormat?: boolean;
  isFullFlex?: boolean;
  isHalfFlex?: boolean;
  isQuarterFlex?: boolean;
  isLoading?: boolean;
  multiple?: boolean;
  renderTags?: (value: ISelectOption[], getTagProps: AutocompleteGetTagProps) => React.ReactNode;
  getChipLabel?: (field: ISelectOption) => string; // get chip label for specific case
  getChipTooltip?: (field: ISelectOption) => string; // get chip tooltip for specific case
  getOptionLabel?: (field: ISelectOption) => string; // get option label
  customLabel?: (field: Field) => ReactNode; // get custom label
  isAllOptionsSelected?: boolean; // display just 'ALL' instead of n number of chips in dropdown
  disableCloseOnSelect?: boolean;
  getChipDisabled?: (option: ISelectOption) => boolean;
  getOptionDisabled?: (option: ISelectOption, selectedOption: ISelectOption | ISelectOption[]) => boolean;
  getOptionSelected?: (option: ISelectOption, selectedOption: ISelectOption | ISelectOption[]) => boolean;
  filterOption?: (option: ISelectOption[], state: FilterOptionsState<ISelectOption>) => ISelectOption[];
  label?: string;
  onLabelClick?: (label: string, fieldKey: string) => void;
  limit?: number;
  isExpanded?: boolean;
  isInputCustomLabel?: boolean;
  onFocus?: (fieldKey: string) => void;
  showEditIcon?: boolean;
  showExpandButton?: boolean;
  onEditClick?: (label: string, fieldKey: string) => void;
  endAdormentValue?: string | ReactNode;
  startAdornment?: string | ReactNode;
  onBlur?: (fieldKey: string, value: IOptionValue) => void;
  isIndent?: boolean;
  selectControlOptions?: SelectOption[];
  isBoolean?: boolean;
  freeSolo?: boolean;
  allowKeyboardInput?: boolean;
  tooltipText?: string;
  containerClass?: string;
  isNumber?: boolean;
  searchEntityType?: SEARCH_ENTITY_TYPE;
  minHeight?: string;
  showImageIcon?: boolean;
  showVideoIcon?: boolean;
  showCustomButton?: true;
  customButtonLabel?: string;
  onCustomButtonClick?: () => void;
  showLabel?: boolean;
  isLatLongEditor?: boolean;
  coordinate?: string;
  subFields?: IViewInputControl[];
  excludeEmptyOption?: boolean;
  isReadOnly?: boolean;
  getOptionTooltip?: (field: ISelectOption) => string; // to show tooltip for option in dropdown;
  defaultValue?: string;
  showCounter?: boolean;
  // Auto Complete
  useControlledValue?: boolean;
  isServerSideSearch?: boolean;
  useFitToContentWidth?: boolean;
  popperPlacement?: PopperPlacementType;
  pagination?: IPagination;
}
