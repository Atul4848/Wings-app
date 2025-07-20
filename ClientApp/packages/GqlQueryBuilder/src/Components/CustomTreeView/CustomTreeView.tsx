import { Button, Checkbox, FormControlLabel } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import TreeItem from '@material-ui/lab/TreeItem';
import TreeView from '@material-ui/lab/TreeView';
import React, { useState } from 'react';
import { Fields } from '@react-awesome-query-builder/material';

const useStyles = makeStyles(
  {
    root: {
      height: 216,
      flexGrow: 1,
      maxWidth: 400,
    },
  },
  { name: 'custom-tree-view' }
);

type Props = {
  fields: Fields;
  onChange: (updatedFields: Fields, isAllSelected?: Boolean) => void;
};

const mapFields = (fields, parentKey, onItemSelect) => {
  if (!fields) {
    return null;
  }

  return Object.keys(fields).map(itemKey => {
    const nodeId = [parentKey, itemKey].filter(Boolean).join('.');

    const field = fields[itemKey];

    return (
      <TreeItem
        nodeId={nodeId}
        label={
          <FormControlLabel
            labelPlacement="end"
            label={field.label}
            onClick={e => e.stopPropagation()}
            control={
              <Checkbox
                color="primary"
                id={nodeId}
                onChange={({ target }) => {
                  // restrict selection of primary key
                  if (field.isPrimaryKey && !Boolean(field.parentKey)) {
                    return;
                  }
                  field.selected = target.checked;
                  onItemSelect(field, itemKey);
                }}
                checked={field.selected}
                key={nodeId}
              />
            }
          />
        }
      >
        {mapFields(fields[itemKey].subfields, nodeId, onItemSelect)}
      </TreeItem>
    );
  });
};

const CustomTreeView = ({ fields, onChange }: Props) => {
  const classes = useStyles();
  const [isAllSelected, setSelectAll] = useState(false);

  // for Select All and Reset
  const onSelectUnselectAllButton = (fields, isAllSelected) => {
    Object.keys(fields).forEach(fieldKey => {
      const field = fields[fieldKey];
      // Prevent auto selecting primary key fields in nested objects
      const isSelected = field.isPrimaryKey && !Boolean(field.parentKey);
      field.selected = isAllSelected || isSelected;
      if (field.subfields) {
        onSelectUnselectAllButton(field.subfields, isAllSelected);
      }
    });
  };

  // Check if any child is selected
  const hasSelectField = subfields => {
    if (!subfields) {
      return false;
    }
    return Object.keys(subfields).some(key => {
      if (subfields[key].subfields) {
        return hasSelectField(subfields[key].subfields);
      }
      return subfields[key].selected;
    });
  };

  // unselect nested fields if parent node is unselected
  const unselectFields = subfields => {
    if (!subfields) {
      return;
    }
    Object.keys(subfields).forEach(key => {
      if (subfields[key].subfields) {
        unselectFields(subfields[key].subfields);
      }
      subfields[key].selected = false;
    });
  };

  // Auto Select Parent Node if any child node selected
  const selectParentNode = (nodeKeys, isSelected, fields) => {
    if (!nodeKeys.length) {
      return;
    }

    const fieldKey = nodeKeys[0];
    fields[fieldKey].selected = isSelected
      ? true
      : hasSelectField(fields[fieldKey].subfields);

    selectParentNode(nodeKeys.slice(1), isSelected, fields[fieldKey].subfields);
  };

  const onSelect = (field, key) => {
    const { parentKey } = field;

    // Enable nested fields selection on click
    if (field.subfields) {
      const firstFieldKey = Object.keys(field.subfields)[0];
      if (firstFieldKey) {
        if (!field.selected && field.subfields) {
          unselectFields(field.subfields);
        }
        field.subfields[firstFieldKey].selected = field.selected; // Auto select first child item
      }
    }
    // If Parent node available
    const newClonedFields = Object.assign({}, fields);
    if (parentKey) {
      selectParentNode(parentKey.split('.'), field.selected, newClonedFields);
    }
    onChange(newClonedFields);
  };

  const selectAll = isAllSelected => {
    setSelectAll(isAllSelected);
    const _fields = Object.assign({}, fields);
    onSelectUnselectAllButton(_fields, isAllSelected);
    onChange(_fields);
  };

  return (
    <div>
      <div style={{ margin: 6 }}>
        <FormControlLabel
          labelPlacement="end"
          label="Select All"
          control={
            <Checkbox
              color="primary"
              checked={isAllSelected}
              onChange={event => selectAll(event.target.checked)}
            />
          }
        />
        <Button color="primary" size="small" onClick={() => selectAll(false)}>
          Reset
        </Button>
      </div>

      <TreeView
        className={classes.root}
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
        multiSelect
      >
        {mapFields(fields, '', onSelect)}
      </TreeView>
    </div>
  );
};

export default CustomTreeView;
