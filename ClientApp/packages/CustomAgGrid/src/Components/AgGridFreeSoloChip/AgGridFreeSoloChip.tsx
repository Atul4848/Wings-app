import React, { useRef, useState, useImperativeHandle, forwardRef, ReactNode, useMemo } from 'react';
import { Chip, Paper, Popover, TextField } from '@material-ui/core';
import { Autocomplete, AutocompleteGetTagProps } from '@material-ui/lab';
import { InfoOutlined } from '@material-ui/icons';
import { useStyles } from './AgGridFreeSoloChip.styles';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { toJS } from 'mobx';
import { ISelectOption, Utilities, regex } from '@wings-shared/core';
import { IBaseEditorProps } from '../../Interfaces';

interface Props extends Partial<IBaseEditorProps> {
  rules?: RegExp;
  placeHolder?: string;
  customErrorMessage?: string; // show custom error message  when has error true
  limitTags: () => number;
  getAutoCompleteOptions: () => ISelectOption[];
  renderTags: (values: ISelectOption[], getTagProps: AutocompleteGetTagProps) => React.ReactNode;
}

const AgGridFreeSoloChip = (props: Props, ref) => {
  const __ref = useRef();
  const classes = useStyles();
  const [ showError, setShowError ] = useState(false);

  // Selected values by dropdown
  const value = Array.isArray(props.value) ? props.value : [];
  const [ selectedValue, setSelectedValue ] = useState<ISelectOption[]>(value);
  // Hold values for tem until user click on save button
  const [ selectedValueTemp, setSelectedValueTemp ] = useState<ISelectOption[]>(value);
  const [ enteredText, setEnteredText ] = useState('');
  // Show or Hide popup
  const [ isPopoverVisible, showPopover ] = useState(false);

  // Send Data back to Parent Component
  /* istanbul ignore next */
  useImperativeHandle(
    ref,
    () => {
      return { getValue: () => selectedValue, hasError };
    },
    [ selectedValue ]
  );

  const hasError = useMemo(() => {
    if (typeof props.isRequired === 'function') {
      props.isRequired(props.node) ? !selectedValue.length : false;
    }
    return false;
  }, [ selectedValue, props ]);

  const hasInputError = useMemo(() => {
    const ruleRegex = props.rules || regex.all;
    return !ruleRegex.test(enteredText);
  }, [ enteredText ]);

  const renderView = () => {
    const numTags = selectedValue.length;
    const limitTags = 4;
    const chipsList = [ ...selectedValue ].slice(0, limitTags);
    const chipLabel = numTags > limitTags ? `+${numTags - limitTags} more` : '+ Add';
    return (
      <div className={classes.limitedTagsContainer}>
        {chipsList.map((item, idx) => (
          <Chip key={idx} size="small" className={classes.chip} label={item.label} />
        ))}
        {(props.isRowEditing || numTags > limitTags) && (
          <Chip
            size="small"
            className={classes.chip}
            label={chipLabel}
            deleteIcon={<InfoOutlined />}
            onDelete={() => showPopover(true)}
            onClick={() => showPopover(true)}
          />
        )}
      </div>
    );
  };

  // //When user press enter key then save values
  /* istanbul ignore next */
  const onKeyPressedEvent = (event: React.KeyboardEvent<HTMLInputElement>): void => {
    if (Utilities.isEqual(event.key, 'Enter')) {
      event.preventDefault();
      const ruleRegex = props.rules || regex.all;
      const isValidInput = ruleRegex.test(enteredText);
      if (!isValidInput) {
        setEnteredText('');
        return;
      }
      if (enteredText==='') return
      const isDuplicate = selectedValueTemp.some(item => item.label.toLowerCase() === enteredText.toLowerCase());
      if (!isDuplicate) {
        setSelectedValueTemp([ ...selectedValueTemp, { label: enteredText, value: enteredText }]);
        setEnteredText('');
      }
    }
  };

  const getAutoCompleteOptions = (): ISelectOption[] => {
    return props.getAutoCompleteOptions() || [];
  };

  const saveChanges = () => {
    const { componentParent } = props.context;
    if (componentParent && typeof componentParent.onDropDownChange === 'function') {
      setSelectedValue([ ...selectedValueTemp ]);
      componentParent.onDropDownChange(props, selectedValueTemp);
    }
    showPopover(false);
  };

  const allTags = () => {
    if (props.isRowEditing) {
      const errorMessage = hasInputError
        ? props.customErrorMessage || 'Invalid Format'
        : !selectedValueTemp.length && showError
          ? `${props.colDef.headerName} is Required`
          : '';

      const _value = Array.isArray(selectedValueTemp) ? toJS(selectedValueTemp) : [];

      /* istanbul ignore next */
      const onChange = (value: ISelectOption | ISelectOption[]): void => {
        const filteredValues = Array.isArray(value)
          ? value.filter((item) => typeof item === 'object' && 'label' in item && 'value' in item)
          : [];

        setSelectedValueTemp(filteredValues)
      };

      return (
        <Autocomplete
          freeSolo={true}
          multiple={true}
          options={getAutoCompleteOptions()}
          value={_value}
          onChange={(_, value: (string | ISelectOption)[]) =>
            onChange(value as ISelectOption[])
          }
          classes={{ root: classes.root, inputRoot: classes.inputRoot }}
          renderTags={(values: ISelectOption[], getTagProps: AutocompleteGetTagProps) =>
            values.map((option, index) => (
              <Chip {...getTagProps({ index })} size="small" label={option.label} />
            ))
          }
          renderInput={params => (
            <TextField
              {...params}
              inputProps={{ ...params.inputProps, autoComplete: 'new-password' }}
              error={hasInputError || (showError && !selectedValueTemp.length)  }
              helperText={errorMessage}
              placeholder={props.placeHolder || 'Search'}
              onChange={event => setEnteredText(event.target.value)}
              onKeyUp={onKeyPressedEvent}
              onFocus={() => setShowError(true)}
              onBlur={() => setShowError(false)}
            />
          )}
        />
      );
    }

    // Read Only View
    return (
      <div className={classes.allTagsContainer}>
        {selectedValue.map((item, idx) => (
          <Chip key={idx} size="small" label={item.label} />
        ))}
      </div>
    );
  };

  return (
    <div ref={__ref as any} className={classes.root}>
      {renderView()}
      <Popover
        open={isPopoverVisible}
        anchorEl={__ref.current}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <Paper
          className={classes.popoverRoot}
          style={{ width: `${props.column ? props.column['actualWidth'] : 250}px` }}
        >
          <div className={classes.popoverContent}>{allTags()}</div>
          <div className={classes.popoverActions}>
            {props.isRowEditing ? (
              <>
                <PrimaryButton variant="contained" size="small" onClick={() => {
                  setSelectedValueTemp(selectedValue)
                  showPopover(false)}}>
                  Cancel
                </PrimaryButton>
                <PrimaryButton
                  variant="contained"
                  size="small"
                  disabled={hasInputError || !selectedValueTemp.length}
                  onClick={saveChanges}
                >
                  Save
                </PrimaryButton>
              </>
            ) : (
              <PrimaryButton variant="contained" size="small" onClick={() => showPopover(false)}>
                Ok
              </PrimaryButton>
            )}
          </div>
        </Paper>
      </Popover>
    </div>
  );
};

export default forwardRef(AgGridFreeSoloChip);
