import React, { FC, useMemo } from 'react';
import { FormLabel, withStyles } from '@material-ui/core';
import classNames from 'classnames';
import InputMaximizeLabel from '../InputMaximizeLabel/InputMaximizeLabel';
import { IViewInputControl } from '../../Interfaces';
import reactQuill, { Quill } from 'react-quill';
import { styles } from './RichTextEditor.style';
import { Colors } from './Colors';
import { Sources } from 'quill';

const toolbarOptions = {
  toolbar: {
    container: [
      [{ size: [] }],
      [{ header: [ 1, 2, 3, 4, 5, 6, false ] }], // text size
      [ 'bold', 'italic', 'underline' ], // toggled buttons
      [ 'link' ], // add links to url
      [{ list: 'ordered' }, { list: 'bullet' }], // ordering
      [{ indent: '-1' }, { indent: '+1' }], // outdent/indent
      [{ color: Colors }, { background: [] }], // dropdown with defaults from theme
      [ 'clean' ], // remove formatting button
    ],
  },
};

const icons = Quill.import('ui/icons');

const ReactQuill = reactQuill as any;

const RichTextEditor: FC<IViewInputControl> = ({
  onValueChange,
  onLabelClick,
  onFocus,
  label,
  field,
  isExpanded,
  isEditable,
  classes,
  showEditIcon = false,
  showExpandButton,
  onEditClick,
  tooltipText,
  customErrorMessage,
  showImageIcon,
  showVideoIcon,
  showCustomButton,
  customButtonLabel,
  onCustomButtonClick,
}: IViewInputControl) => {
  const { key, value, errorSync, hasError, disabled } = field;

  const editorClass = classNames({
    [classes.reactQuill]: true,
    [classes.expandedEditor]: isExpanded,
    [classes.hideToolbar]: !isEditable,
    [classes.error]: hasError || customErrorMessage,
  });
  return (
    <div id="richTextEditor" className={classes.container}>
      <InputMaximizeLabel
        hasError={Boolean(hasError || customErrorMessage)}
        label={field.label}
        onLabelClick={() => onLabelClick(label, key)}
        showEditIcon={showEditIcon}
        onEditClick={() => onEditClick(label, key)}
        showExpandButton={showExpandButton}
        tooltipText={tooltipText}
        isExpanded={isExpanded}
      />
      <ReactQuill
        {...field.bind()}
        className={editorClass}
        preserveWhitespace={true}
        readOnly={!isEditable || disabled}
        theme="snow"
        bounds={'#richTextEditor'}
        value={value}
        onChange={(content: string, _, source: Sources) => source !== 'api' && onValueChange(content, key)}
        modules={_getModules()}
        onFocus={() => onFocus(key)}
      />
      {(hasError || customErrorMessage) && (
        <FormLabel className={classes.errorLabel} error={true}>
          {errorSync || customErrorMessage}
        </FormLabel>
      )}
    </div>
  );

  function _getModules() {
    const _toolbar: any = Object.assign({}, toolbarOptions.toolbar);

    /* istanbul ignore next */
    if (showImageIcon) {
      _toolbar.container = _toolbar.container.concat([[ 'image' ]]);
    }

    /* istanbul ignore next */
    if (showVideoIcon) {
      _toolbar.container = _toolbar.container.concat([[ 'video' ]]);
    }

    /* istanbul ignore next */
    if (showCustomButton) {
      _toolbar.container = _toolbar.container.concat([[ 'customButton' ]]);
      icons['customButton'] = `${customButtonLabel}`;
      _toolbar.handlers = { customButton: onCustomButtonClick };
    }

    return {
      toolbar: useMemo(() => _toolbar, []),
      clipboard: { matchVisual: false },
    };
  }
};
export default withStyles(styles)(RichTextEditor as any);
