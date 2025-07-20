import { Chip, Paper, Popover } from '@material-ui/core';
import { InfoOutlined } from '@material-ui/icons';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { ISelectOption } from '@wings-shared/core';
import { AutoCompleteControl } from '@wings-shared/form-controls';
import { ICellRendererParams } from 'ag-grid-community';
import React, { useRef, useState, useImperativeHandle, forwardRef, useEffect } from 'react';
import { useStyles } from './PurposeOfFlightsEditor.styles';

interface Props extends ICellRendererParams {
  limitTags: number;
  isRowEditing: boolean; // is Editing or Rending
  getAutoCompleteOptions: () => ISelectOption[]; // Callback function to get data back from parent
  getIsRequired?: (node) => boolean;
}

const PurposeOfFlightsEditor = (props: Props, ref) => {
  const __ref = useRef();
  const classes = useStyles();
  const value = Array.isArray(props.value) ? props.value : [];

  const [ isRowEditing, setIsRowEditing ] = useState(props.isRowEditing);
  // Data coming from parent component
  const [ initialValue, setInitialValue ] = useState<ISelectOption[]>(value);
  // Selected values by dropdown
  const [ selectedValue, setSelectedValue ] = useState<ISelectOption[]>(value);
  // Show or Hide popup
  const [ isOpen, setIsOpen ] = useState(false);

  useEffect(() => {
    setIsRowEditing(props.isRowEditing);
  }, [ props.isRowEditing ]);

  // Send Data back to Parent Component
  useImperativeHandle(ref, () => ({ getValue: () => selectedValue }), [ selectedValue ]);

  const renderView = () => {
    if (!Array.isArray(selectedValue)) {
      return <>No Data</>;
    }
    const numTags = selectedValue.length;
    const limitTags = props.limitTags || 2;
    const chipsList = [ ...selectedValue ].slice(0, limitTags);
    const chipLabel = numTags > limitTags ? `+${numTags - limitTags} more` : '+ Add';
    return (
      <div className={classes.limitedTagsContainer}>
        {chipsList.map((item, idx) => (
          <Chip key={idx} size="small" label={item.label} />
        ))}
        {(isRowEditing || numTags > limitTags) && (
          <Chip
            size="small"
            label={chipLabel}
            deleteIcon={<InfoOutlined />}
            onDelete={() => setIsOpen(true)}
            onClick={() => setIsOpen(true)}
          />
        )}
      </div>
    );
  };

  /* istanbul ignore next */
  const allTags = () => {
    // When this component is in editing mode
    if (isRowEditing) {
      return (
        <AutoCompleteControl
          multiple={true}
          options={props.getAutoCompleteOptions()}
          onDropDownChange={option => setSelectedValue(option as ISelectOption[])}
          value={selectedValue as any}
        />
      );
    }

    if (!Array.isArray(selectedValue)) {
      return <div onClick={() => setIsOpen(false)}>Click here to select Items</div>;
    }

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
        open={isOpen}
        anchorEl={__ref.current}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        onClose={() => setIsOpen(false)}
      >
        <Paper
          className={classes.popoverRoot}
          style={{ width: `${props.column ? props.column['actualWidth'] : 250}px` }}
        >
          <div className={classes.popoverContent}>{allTags()}</div>
          <div className={classes.popoverActions}>
            {props.isRowEditing ? (
              <>
                <PrimaryButton
                  variant="contained"
                  size="small"
                  onClick={e => {
                    setSelectedValue(initialValue);
                    setIsOpen(false);
                  }}
                >
                  Cancel
                </PrimaryButton>
                <PrimaryButton
                  variant="contained"
                  size="small"
                  onClick={e => {
                    setInitialValue(selectedValue);
                    setIsOpen(false);
                    const { componentParent } = props.context;
                    if (componentParent && typeof componentParent.onDropDownChange === 'function') {
                      componentParent.onDropDownChange(props, selectedValue);
                    }
                  }}
                >
                  Save
                </PrimaryButton>
              </>
            ) : (
              <PrimaryButton variant="contained" size="small" onClick={e => setIsOpen(false)}>
                Ok
              </PrimaryButton>
            )}
          </div>
        </Paper>
      </Popover>
    </div>
  );
};

export default forwardRef(PurposeOfFlightsEditor);
