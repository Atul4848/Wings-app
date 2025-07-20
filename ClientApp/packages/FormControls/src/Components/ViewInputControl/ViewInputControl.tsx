import React, { Component, ReactNode, MouseEvent as ReactMouseEvent, ChangeEvent } from 'react';
import moment from 'moment';
import { observer } from 'mobx-react';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import {
  TextField,
  withStyles,
  FormControlLabel,
  Typography,
  FormLabel,
  Checkbox,
  Chip,
  IconButton,
  Switch,
  Radio,
  RadioGroup,
  FormHelperText,
} from '@material-ui/core';
import { styles } from './ViewInputControl.styles';
import { IViewInputControl, IPagination } from '../../Interfaces';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { Utilities, DATE_FORMAT, ISelectOption, IOptionValue, SelectOption } from '@wings-shared/core';
import Tooltip from '@material-ui/core/Tooltip';
import InputAdornment from '@material-ui/core/InputAdornment';
import classNames from 'classnames';
import { AllOutOutlined } from '@material-ui/icons';
import { action, observable } from 'mobx';
import { EDITOR_TYPES } from '../../Enums';
import RichTextEditor from '../RichTextEditor/RichTextEditor';
import SimpleMarkdownEditor from '../SimpleMarkdownEditor/SimpleMarkdownEditor';
import InputMaximizeLabel from '../InputMaximizeLabel/InputMaximizeLabel';
import { InfoComponent } from '@wings-shared/layout';
import LatLongEditor from '../LatLongEditor/LatLongEditor';
import DateTimePicker from '../DateTimePicker/DateTimePicker';
import SelectControl from '../SelectControl/SelectControl';
import RadioButtonControl from '../RadioButtonControl/RadioButtonControl';
import { ThreatLevel } from '@wings-shared/threat-level';
import FreeSoloChipInputControl from '../FreeSoloChipInputControl/FreeSoloChipInputControl';
import AutoCompleteV2 from '../AutoCompleteV2/AutoCompleteV2';
import AutoCompleteV3 from '../AutoCompleteV3/AutoCompleteV3';
import FreeSoloChipInputControlV2 from '../FreeSoloChipInputControl/FreeSoloChipControlV2';
@observer
class ViewInputControl extends Component<IViewInputControl> {
  @observable showLatLongEditor: boolean = false;
  @observable private toggleElement: Element | null = null;

  /* istanbul ignore next */
  static defaultProps = {
    isExpanded: false,
    getOptionDisabled: (_option: ISelectOption, _selectedOption: ISelectOption | ISelectOption[]) => false,
    getChipDisabled: (_option: ISelectOption) => false,
    onSearch: (_searchValue: string) => '',
    onFocus: (_fieldKey: string) => null,
    onBlur: (_fieldKey: string, _value: IOptionValue) => null,
    getChipLabel: (option: ISelectOption) => option.label,
    getChipTooltip: (option: ISelectOption) => option.label,
    showImageIcon: false,
    showVideoIcon: false,
    showLabel: true,
    isLatLongEditor: false,
    subFields: [],
    isReadOnly: false,
    showCounter: false,
    useControlledValue: false,
  };

  private onValueChange(value: IOptionValue, fieldKey: string): void {
    this.props.field.$changed = 1;
    this.props.onValueChange(value, fieldKey);
  }

  // label with custom actions
  public get label(): string {
    const { field, customLabel } = this.props;
    const isCallable: boolean = typeof customLabel === 'function';
    return isCallable ? customLabel(field) : field?.label?.replace('*', '') || '';
  }

  private get fieldValue(): string | ReactNode {
    const { field, type, dateTimeFormat, classes, getOptionLabel, isAllOptionsSelected } = this.props;
    switch (type) {
      case EDITOR_TYPES.FREE_SOLO_CHIP_INPUT:
        return Array.isArray(field.value)
          ? field.value.map((chip, idx) => <Chip key={idx} classes={{ root: classes.chip }} label={chip} />)
          : '-';
      case EDITOR_TYPES.DROPDOWN:
        const isCallable: boolean = typeof getOptionLabel === 'function';
        if (isCallable) {
          return getOptionLabel(field.value);
        }

        // If user selected All as option
        if (isAllOptionsSelected) {
          return 'All';
        }

        return Array.isArray(field.value)
          ? field.value.length
            ? field.value.map((x, idx) => (
              <Tooltip
                key={idx}
                title={this.props.getChipTooltip(x) || ''}
                disableHoverListener={!this.props.showChipTooltip}
              >
                <Chip classes={{ root: classes.chip }} label={this.props.getChipLabel(x) || ''} />
              </Tooltip>
            ))
            : '-'
          : field.value?.label || '-';
      case EDITOR_TYPES.CHECKBOX:
      case EDITOR_TYPES.SELECT_CONTROL:
        return field.value === true ? 'Yes' : field.value === false ? 'No' : '-';
      case EDITOR_TYPES.TEXT_FIELD:
        return field.value?.toString() || '-';
      case EDITOR_TYPES.DATE_TIME:
      case EDITOR_TYPES.DATE:
        return field.value ? Utilities.getformattedDate(field.value, dateTimeFormat) : '-';
      case EDITOR_TYPES.TIME:
        return field.value ? Utilities.getformattedDate(field.value, DATE_FORMAT.API_TIME_FORMAT) : '-';
      case EDITOR_TYPES.RADIO:
        const radioOptions: SelectOption[] = this.props.selectControlOptions;
        return (
          <RadioGroup row value={field.value || ''}>
            {radioOptions.map((option, index) => {
              return (
                <FormControlLabel
                  disabled={true}
                  key={index}
                  value={option.value as any}
                  control={<Radio />}
                  label={option.name}
                />
              );
            })}
          </RadioGroup>
        );
      case EDITOR_TYPES.LINK:
        return field.value ? (
          <a href={field.value} target="_blank" rel="noreferrer">
            {field.value}
          </a>
        ) : (
          '-'
        );
      case EDITOR_TYPES.LABEL:
        return '';
      default:
        return '-';
    }
  }

  private get richTextEditor(): ReactNode {
    const {
      field,
      isExpanded,
      isDisabled,
      isEditable,
      showEditIcon,
      showExpandButton,
      classes,
      tooltipText,
      customErrorMessage,
      showImageIcon,
      showVideoIcon,
      showCustomButton,
      customButtonLabel,
      onCustomButtonClick,
    } = this.props;
    return (
      <RichTextEditor
        onValueChange={(value, fieldKey: string) => this.onValueChange(value, fieldKey)}
        onLabelClick={(label: string, fieldKey: string) => this.props.onLabelClick(label, fieldKey)}
        label={this.props.label}
        field={field}
        isExpanded={isExpanded}
        isDisabled={isDisabled}
        isEditable={isEditable}
        onFocus={fieldKey => this.props.onFocus(fieldKey)}
        showEditIcon={showEditIcon}
        showExpandButton={showExpandButton}
        onEditClick={(label: string, fieldKey: string) => this.props.onEditClick(label, fieldKey)}
        classes={{ expandedEditor: classes.expandEditor }}
        tooltipText={tooltipText}
        customErrorMessage={customErrorMessage}
        showImageIcon={showImageIcon}
        showVideoIcon={showVideoIcon}
        showCustomButton={showCustomButton}
        customButtonLabel={customButtonLabel}
        onCustomButtonClick={onCustomButtonClick}
      />
    );
  }

  private get editableContent(): ReactNode {
    const {
      classes,
      type,
      field,
      dateTimeFormat,
      isDisabled,
      isExists,
      customErrorMessage,
      showTooltip,
      isInputCustomLabel,
      endAdormentValue,
      allowKeyboardInput,
      tooltipText,
      showLabel,
      isReadOnly,
      defaultValue,
    } = this.props;
    const { hasError, touched, value, placeholder, error, key, label, errorSync } = field;
    const showError: boolean = Boolean((hasError && touched) || (field.blurred && error));

    switch (type) {
      case EDITOR_TYPES.FREE_SOLO_CHIP_INPUT:
        return (
          <FreeSoloChipInputControl
            field={field}
            customErrorMessage={customErrorMessage}
            placeHolder={placeholder}
            multiline={this.props.multiline}
            onChipAddOrRemove={value => this.onValueChange(value, field.key)}
          />
        );
      case EDITOR_TYPES.SWITCH:
      case EDITOR_TYPES.CHECKBOX:
        const formControl = Utilities.isEqual(type, EDITOR_TYPES.SWITCH) ? (
          <Switch
            checked={value || false}
            onChange={(_, isActive) => this.onValueChange(isActive, key)}
            color="primary"
            name="switch"
          />
        ) : (
          <Checkbox
            name={label}
            checked={value || false}
            onChange={(_e, checked: boolean) => this.onValueChange(checked, key)}
          />
        );
        return (
          <>
            <FormControlLabel
              {...field.bind({ value: value || false })}
              disabled={isDisabled}
              label={
                showLabel && (
                  <FormLabel className={classes.labelRoot} required={field.rules?.includes('required')}>
                    {field.label?.replace('*', '')}
                  </FormLabel>
                )
              }
              classes={{ root: classes.checkboxRoot, label: classes.labelRoot }}
              control={formControl}
            />
            {(showError || (hasError && Boolean(customErrorMessage))) && (
              <div>
                <FormLabel className={classes.errorLabel} error={true}>
                  {errorSync}
                </FormLabel>
              </div>
            )}
            {showTooltip && (
              <Tooltip
                title={tooltipText || ''}
                disableHoverListener={!showTooltip}
                disableFocusListener={true}
                disableTouchListener={true}
                arrow={true}
              >
                <InfoOutlinedIcon className={classes.icon} />
              </Tooltip>
            )}
          </>
        );
      case EDITOR_TYPES.DROPDOWN:
      case EDITOR_TYPES.AUTO_COMPLETE:
        return (
          <AutoCompleteV2
            {...this.props}
            placeHolder={`Search ${field.label}`}
            options={this.props.options}
            value={field.value}
            onDropDownChange={(option: ISelectOption | ISelectOption[]) => this.onValueChange(option, field.key)}
            onSearch={(searchValue: string, pagination: IPagination) =>
              this.props.onSearch(searchValue, field.key, pagination)
            }
            disabled={isDisabled}
            label={this.label}
            onFocus={(fieldKey: string) => this.props.onFocus(fieldKey)}
            onBlur={(fieldKey: string) => this.props.onBlur(fieldKey, field.value)}
          />
        );
      case EDITOR_TYPES.DATE_TIME:
      case EDITOR_TYPES.TIME:
      case EDITOR_TYPES.DATE:
        const errorMessage = field.errorSync && field.touched ? field.errorSync : '';
        return (
          <DateTimePicker
            {...field.bind()}
            field={this.props.field}
            showTooltip={showTooltip}
            pickerType={type as any}
            format={dateTimeFormat}
            value={field.value || ''}
            minDate={this.props.minDate || ''}
            maxDate={this.props.maxDate || ''}
            containerClass={classes.dateTimeRoot}
            disabled={isDisabled}
            dateInputMask={this.props.dateInputMask}
            datePickerViews={this.props.datePickerViews}
            is12HoursFormat={this.props.is12HoursFormat}
            allowKeyboardInput={allowKeyboardInput}
            errorMessage={field.error || errorMessage || customErrorMessage}
            onChange={(_value: string, date: moment.Moment) => {
              if (date && !date.isValid()) {
                field.invalidate(`Invalid date or time (${dateTimeFormat})`);
              }
              this.onValueChange(date ? date.set('seconds', 0).format(DATE_FORMAT.API_FORMAT) : '', field.key);
            }}
            onBlur={() => this.props.onBlur(field.key, field.value)}
            onFocus={() => {
              field.$touched = true;
              this.props.onFocus(field.key);
            }}
          />
        );
      case EDITOR_TYPES.RADIO:
        return (
          <RadioButtonControl
            field={field}
            classes={{
              root: classes.radioInputRoot,
              fieldsContainer: this.props.containerClass,
            }}
            onValueChange={(value, fieldKey) => this.onValueChange(value, fieldKey)}
            options={this.props.selectControlOptions}
            disabled={this.props.isDisabled}
            showLabel={showLabel}
            defaultValue={defaultValue}
          />
        );
      case EDITOR_TYPES.BUTTON:
        return (
          <PrimaryButton
            className={classes.button}
            variant="contained"
            disabled={isDisabled}
            onClick={() => this.onValueChange(null, field.key)}
          >
            {field.label}
          </PrimaryButton>
        );
      case EDITOR_TYPES.RICH_TEXT_EDITOR:
        return this.richTextEditor;
      case EDITOR_TYPES.SELECT_CONTROL:
        return (
          <SelectControl
            field={field}
            onValueChange={(value, fieldKey) => this.onValueChange(value, fieldKey)}
            options={this.props.selectControlOptions}
            isBoolean={this.props.isBoolean}
            excludeEmptyOption={this.props.excludeEmptyOption}
            disabled={this.props.isDisabled}
            showLabel={showLabel}
            classes={{ root: this.props.isFullFlex ? classes.selectContainer : '' }}
          />
        );
      case EDITOR_TYPES.MARKDOWN_EDITOR:
        return (
          <SimpleMarkdownEditor
            field={field}
            onValueChange={(value, fieldKey) => this.onValueChange(value, fieldKey)}
          />
        );
      case EDITOR_TYPES.LABEL:
        return (
          <Tooltip
            title={tooltipText || ''}
            disableHoverListener={!showTooltip}
            disableFocusListener={true}
            disableTouchListener={true}
            arrow={true}
          >
            <FormLabel className={classes.labelRoot} required={field?.rules?.includes('required')}>
              {this.label}
            </FormLabel>
          </Tooltip>
        );
      case EDITOR_TYPES.THREAT_LEVEL:
        return (
          <>
            <FormLabel className={classes.labelRoot}>{field.label.replace('*', '')}</FormLabel>
            <ThreatLevel levelValue={field.value} />
          </>
        );
      case EDITOR_TYPES.TEXT_FIELD:
      default:
        const { coordinate, isLatLongEditor, subFields, showCounter } = this.props;
        const textInputRoot = classNames({
          [classes.textInput]: true,
          [classes.textArea]: this.props.multiline,
        });
        return (
          <Tooltip
            title={value || ''}
            disableHoverListener={!showTooltip}
            disableFocusListener={true}
            disableTouchListener={true}
            arrow={true}
          >
            <>
              {isInputCustomLabel && !showTooltip && (
                <InputMaximizeLabel
                  label={field.label}
                  onLabelClick={() => this.props.onLabelClick(this.props.label, key)}
                  tooltipText={tooltipText}
                  showExpandButton={this.props.showExpandButton}
                />
              )}

              <div className={classes.optionContainer}>
                {showTooltip && <InfoComponent label={field.label} tooltipText={tooltipText} />}
                {isLatLongEditor && (
                  <IconButton
                    className={classes.allOutIcon}
                    onClick={(event: ReactMouseEvent<Element>) => this.onEndAdornmentClick(event)}
                  >
                    <AllOutOutlined />
                  </IconButton>
                )}
              </div>
              <TextField
                autoComplete="off"
                {...field.bind()}
                label={showLabel ? (isInputCustomLabel ? '' : this.label) : ''}
                onChange={({ target }: ChangeEvent<HTMLInputElement>) => {
                  this.onValueChange(target.value, key);
                  field.showErrors(true);
                }}
                type={field.type || 'text'}
                variant="outlined"
                value={value === undefined || value === null ? '' : value}
                placeholder={placeholder}
                error={isExists || showError || Boolean(customErrorMessage)}
                onBlur={() => {
                  field.showErrors(true);
                  this.props.onBlur(key, value);
                }}
                onFocus={() => {
                  field.$touched = true;
                  this.props.onFocus(key);
                }}
                helperText={
                  isExists ? `The ${label} is already exists.` : customErrorMessage || (showError && errorSync)
                }
                InputProps={{
                  endAdornment: <InputAdornment position="start">{endAdormentValue || ''}</InputAdornment>,
                  readOnly: isReadOnly,
                }}
                InputLabelProps={{
                  required: field.rules?.includes('required'),
                  classes: {
                    root: classes.labelRoot,
                  },
                }}
                FormHelperTextProps={{
                  classes: { root: classes.helperText },
                }}
                classes={{ root: textInputRoot }}
                disabled={isDisabled}
                multiline={this.props.multiline}
                minRows={this.props.rows}
                className="--large"
              />
              {showCounter && (
                <FormHelperText children={`Count : ${value?.trim()?.length || 0}`} className={classes.formHelperText} />
              )}
              {isLatLongEditor && (
                <LatLongEditor
                  coordinate={coordinate}
                  fields={subFields}
                  value={value}
                  toggleElement={this.toggleElement}
                  isOpen={this.showLatLongEditor}
                  onOkClick={value => this.onValueChange(value, key)}
                  close={() => (this.showLatLongEditor = false)}
                />
              )}
            </>
          </Tooltip>
        );
    }
  }

  @action
  private onEndAdornmentClick(event: ReactMouseEvent<Element>): void {
    this.toggleElement = event.currentTarget;
    this.showLatLongEditor = true;
  }

  private get readOnlyFieldValue(): ReactNode {
    const { type, field, classes } = this.props;
    if (type === EDITOR_TYPES.RICH_TEXT_EDITOR) {
      return <div className={classes.formValue} dangerouslySetInnerHTML={{ __html: field.value }}></div>;
    }
    if (type === EDITOR_TYPES.THREAT_LEVEL)
      return (
        <>
          <FormLabel className={classes.labelRoot}>{field.label.replace('*', '')}</FormLabel>
          <ThreatLevel levelValue={field.value} />
        </>
      );
    return (
      <>
        <Typography align="left" className={classes.formValue}>
          {this.fieldValue}
        </Typography>
      </>
    );
  }

  private get readOnlyContent(): ReactNode {
    const {
      classes,
      field,
      isInputCustomLabel,
      isExpanded,
      showEditIcon,
      showTooltip,
      tooltipText,
      showLabel,
    } = this.props;
    const editorClass = classNames({
      [classes.editorOuter]: true,
      [classes.expandedEditor]: isExpanded,
    });

    if (showTooltip && isInputCustomLabel) {
      return (
        <>
          <InfoComponent label={field.label} tooltipText={tooltipText} />
          {this.readOnlyFieldValue}
        </>
      );
    }

    if (isInputCustomLabel) {
      return (
        <>
          <InputMaximizeLabel
            label={field.label}
            showEditIcon={showEditIcon}
            onEditClick={() => this.props.onEditClick(field.label, field.key)}
            onLabelClick={() => this.props.onLabelClick(this.props.label, field.key)}
          />
          <div className={editorClass}>{this.readOnlyFieldValue}</div>
        </>
      );
    }
    return (
      <>
        {showLabel && (
          <Tooltip
            title={tooltipText || ''}
            disableHoverListener={!showTooltip}
            disableFocusListener={true}
            disableTouchListener={true}
            arrow={true}
          >
            <FormLabel className={classes.textRoot}>{this.label}</FormLabel>
          </Tooltip>
        )}
        {this.readOnlyFieldValue}
      </>
    );
  }

  render(): ReactNode {
    const { isEditable, classes } = this.props;
    const rootClass = classNames({
      [classes.flexRow]: true,
      [classes.fullFlex]: this.props.isFullFlex,
      [classes.halfFlex]: this.props.isHalfFlex,
      [classes.quarterFlex]: this.props.isQuarterFlex,
    });
    return <div className={rootClass}>{isEditable ? this.editableContent : this.readOnlyContent}</div>;
  }
}

export default withStyles(styles)(ViewInputControl as any);
