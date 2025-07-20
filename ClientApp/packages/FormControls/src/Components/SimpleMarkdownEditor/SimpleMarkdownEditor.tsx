import React, { FC, useMemo } from 'react';
import { IViewInputControl } from '../../Interfaces';
import SimpleMdeReact from 'react-simplemde-editor';
import SimpleMDE from 'easymde';
import 'easymde/dist/easymde.min.css';
import { FormLabel, withStyles } from '@material-ui/core';
import { styles } from './SimpleMarkdownEditor.style';

const SimpleMarkdownEditor: FC<IViewInputControl> = ({
  onValueChange,
  field,
  minHeight = '300px',
  classes,
}: IViewInputControl) => {
  const { key, value, label } = field;

  const defaultOptions = useMemo(() => {
    return {
      autofocus: true,
      showIcons: ['code', 'quote', 'table', 'horizontal-rule'],
      placeholder: 'Type here...',
      hideIcons: ['guide'],
      initialValue: null,
      spellChecker: false,
      minHeight,
    } as SimpleMDE.Options;
  }, []);

  return (
    <>
      <FormLabel className={classes.labelRoot}>{label}</FormLabel>
      <SimpleMdeReact
        id={key}
        value={value}
        options={defaultOptions}
        onChange={value => onValueChange(value as string, key)}
      />
    </>
  );
};
export default withStyles(styles)(SimpleMarkdownEditor);
