import React, { useState, useCallback, ChangeEvent, KeyboardEvent } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import { Chip, FormLabel, TextField, Box, ThemeProvider, createTheme, ThemeOptions } from '@mui/material';
import { Field } from 'mobx-react-form';
import { toJS } from 'mobx';
import { observer } from 'mobx-react';
import { Utilities, THEMES } from '@wings-shared/core';
import { DarkTheme, LightTheme, ThemeStore } from '@wings-shared/layoutv2';

type Props = {
  field?: Field;
  placeHolder?: string;
  customErrorMessage?: string;
  isNumber?: boolean;
  isLeftIndent?: boolean;
  onChipAddOrRemove: (value: string[]) => void;
  multiline?: boolean;
  limitTags?: number;
  sx?: object;
};

export const themes = {
  [THEMES.LIGHT]: LightTheme.LightThemeOptions,
  [THEMES.DARK]: DarkTheme.DarkThemeOptions,
};

const FreeSoloChipInputControlV2 = observer((props: Props) => {
  const {
    field,
    placeHolder,
    customErrorMessage,
    isNumber,
    isLeftIndent,
    onChipAddOrRemove,
    multiline,
    limitTags = 3,
    sx = {},
  } = props;

  const [ textInputValue, setTextInputValue ] = useState('');

  const onInputChange = useCallback((value: string) => {
    setTextInputValue(value.trim());
  }, []);

  const updateValue = useCallback(() => {
    const { value } = field;
    if (!textInputValue.length || !Array.isArray(value)) return;

    const chipValue = (isNumber && Utilities.getNumberOrNullValue(textInputValue)) || textInputValue;

    const isDuplicate = value.some((val: string) => Utilities.isEqual(val, chipValue));
    if (isDuplicate) {
      setTextInputValue('');
      return;
    }

    value.push(chipValue.toString());
    onChipAddOrRemove(value);
    setTextInputValue('');
  }, [ textInputValue, field, isNumber, onChipAddOrRemove ]);

  const handleChange = useCallback(
    (chipValue: string[]) => {
      const { value } = field;
      if (chipValue.length < value.length) {
        onChipAddOrRemove(chipValue);
      }
    },
    [ field, onChipAddOrRemove ]
  );

  const handleKeyUp = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (Utilities.isEqual(event.key, 'Enter')) {
        updateValue();
      }
    },
    [ updateValue ]
  );

  const showError = Boolean(field?.hasError && field?.touched);
  const errorMessage = showError ? customErrorMessage || 'The Format is invalid' : '';
  const _theme = createTheme(themes[ThemeStore.currentTheme] as ThemeOptions);

  return (
    <ThemeProvider theme={_theme}>
      <Box
        sx={{
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          ...(isLeftIndent && { pl: 2 }),
          ...sx,
        }}
      >
        <FormLabel
          required={field?.rules?.includes('required')}
          sx={{
            textAlign: 'left',
            marginBottom: '4px',
            fontSize: '12px',
            fontWeight: 600,
            lineHeight: 1.78,
            '& [class*="MuiFormLabel-asterisk"]': {
              color: 'red',
              fontWeight: 600,
            },
          }}
        >
          {field?.label?.replace('*', '')}
        </FormLabel>

        <Autocomplete
          freeSolo
          multiple
          options={[]}
          limitTags={limitTags}
          value={toJS(field?.value)}
          onChange={(_, value) => handleChange(value)}
          sx={{
            '& .MuiAutocomplete-inputRoot': {
              ...(multiline && { alignItems: 'baseline', minHeight: 100 }),
            },
          }}
          renderTags={(value: string[], getTagProps) =>
            value.map((chip: string, index: number) => (
              <Chip
                key={index}
                label={chip}
                sx={{
                  maxWidth: 200,
                  minWidth: 40,
                  maxHeight: 30,
                  mr: '8px',
                }}
                {...getTagProps({ index })}
                onDelete={() => onChipAddOrRemove(value.filter(_chip => _chip !== chip))}
              />
            ))
          }
          renderInput={params => (
            <TextField
              {...params}
              value={textInputValue}
              placeholder={placeHolder}
              variant="outlined"
              error={showError}
              helperText={errorMessage}
              onChange={({ target }: ChangeEvent<HTMLInputElement>) => onInputChange(target.value)}
              onKeyUp={handleKeyUp}
              onBlur={() => {
                field.showErrors(true);
                updateValue();
              }}
              onFocus={() => {
                field.$touched = true;
                field.onFocus();
              }}
              multiline={multiline}
              fullWidth
            />
          )}
        />
      </Box>
    </ThemeProvider>
  );
});

export default FreeSoloChipInputControlV2;
