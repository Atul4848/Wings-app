import { observer } from 'mobx-react';
import { Field } from 'mobx-react-form';
import React, { FC, ReactNode } from 'react';
import moment from 'moment';
import { DATE_FORMAT, DATE_TIME_PICKER_TYPE, ISelectOption } from '@wings-shared/core';
import { AutoCompleteControl, DateTimePicker, EDITOR_TYPES } from '@wings-shared/form-controls';
import { Checkbox, FormControlLabel, FormLabel, Typography, TextField } from '@material-ui/core';
import { ThreatLevel } from '@wings-shared/threat-level';
import classNames from 'classnames';
import { useStyles } from './CountryEditorSection.styles';

interface Props {
  field: Field;
  type?: EDITOR_TYPES;
  styleClasses?: string;
  isEditable?: boolean;
  isDisabled?: boolean;
  dropDownValue?: string;
  options?: ISelectOption[];
  minDate?: string;
  maxDate?: string;
  isExists?: boolean;
  onCheckboxChange?: (checked: boolean, fieldKey: string) => void;
  onDropdownChange?: (option: ISelectOption, fieldKey: string) => void;
  onFocus?: (fieldKey: string) => void;
  onSearch?: (searchValue: string) => void;
  debounceTime?: number;
}

const CountryEditorSection: FC<Props> = ({ ...props }: Props) => {
  const { styleClasses } = props as Required<Props>;
  const classes = useStyles();

  const fieldValue = (): string => {
    const { field, type, dropDownValue } = props;
    switch (type) {
      case EDITOR_TYPES.DROPDOWN:
        return dropDownValue || field.value?.label || '-';
      case EDITOR_TYPES.CHECKBOX:
        return field.value === true ? 'Yes' : 'No';
      case EDITOR_TYPES.TEXT_FIELD:
        return field.value || '-';
      case EDITOR_TYPES.DATE_TIME:
        return field.value ? moment(field.value, moment.defaultFormat).format(DATE_FORMAT.API_DATE_FORMAT) : '-';
      default:
        return '-';
    }
  };

  const editorContent = (): ReactNode => {
    const { field, type } = props as Required<Props>;
    return (
      <>
        <FormLabel className={classes.textRoot}>{field.label.replace('*', '')}</FormLabel>
        {type === EDITOR_TYPES.THREAT_LEVEL ? (
          <div className={classes.formValue}>
            <ThreatLevel levelValue={field.value} />
          </div>
        ) : (
          <Typography align="left" className={classes.formValue}>
            {fieldValue()}
          </Typography>
        )}
      </>
    );
  };

  const editor = (): ReactNode => {
    const {
      type,
      field,
      isDisabled,
      isExists,
      onFocus,
      options,
      onDropdownChange,
      onSearch,
      onCheckboxChange,
      debounceTime,
    } = props as Required<Props>;
    switch (type) {
      case EDITOR_TYPES.TEXT_FIELD: {
        const { hasError, touched, value, placeholder, blurred, errorSync, label } = props.field;
        const showError: boolean = (hasError && touched && !!value) || (blurred && hasError);
        return (
          <TextField
            autoComplete="new-password"
            {...field.bind()}
            type="text"
            variant="outlined"
            label={field.label?.replace('*', '')}
            value={value || ''}
            placeholder={placeholder}
            error={showError || isExists}
            helperText={(showError && errorSync) || (isExists && `The ${label} already exists.`)}
            InputLabelProps={{
              required: field.rules?.includes('required'),
              classes: {
                root: classes.labelRoot,
              },
            }}
            classes={{ root: classes.textInput }}
            disabled={isDisabled}
          />
        );
      }
      case EDITOR_TYPES.CHECKBOX: {
        return (
          <FormControlLabel
            {...field.bind()}
            disabled={isDisabled}
            label={
              <FormLabel className={classes.labelRoot} required={field.rules?.includes('required')}>
                {field.label?.replace('*', '')}
              </FormLabel>
            }
            classes={{ root: classes.checkboxRoot, label: classes.labelRoot }}
            control={
              <Checkbox
                name={field.label}
                checked={field.value || false}
                onChange={(_, checked: boolean) => onCheckboxChange(checked, field.key)}
              />
            }
          />
        );
      }
      case EDITOR_TYPES.DROPDOWN: {
        return (
          <AutoCompleteControl
            placeHolder={`Search ${field.label}`}
            options={options}
            value={field.value}
            onDropDownChange={(option: ISelectOption | ISelectOption[]) =>
              onDropdownChange(option as ISelectOption, field.key)
            }
            disabled={isDisabled}
            field={field}
            onFocus={() => onFocus && onFocus(field.key)}
            onSearch={searchValue => onSearch(searchValue)}
            debounceTime={debounceTime}
          />
        );
      }
      case EDITOR_TYPES.DATE_TIME: {
        return (
          <DateTimePicker
            field={field}
            allowKeyboardInput={false}
            pickerType={DATE_TIME_PICKER_TYPE.DATE}
            format={DATE_FORMAT.API_DATE_FORMAT}
            value={field.value || ''}
            minDate={props.minDate || ''}
            maxDate={props.maxDate || ''}
            containerClass={classes.dateTimeRoot}
            {...field.bind()}
          />
        );
      }
      case EDITOR_TYPES.THREAT_LEVEL:
        return <ThreatLevel levelValue={field.value} />;
      default: {
        return <></>;
      }
    }
  };

  const flexColumn = classNames(classes.flexColumn, styleClasses);

  return <div className={flexColumn}>{props.isEditable ? editor() : editorContent()}</div>;
};

export default observer(CountryEditorSection);
