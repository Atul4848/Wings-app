import React, { ChangeEvent, FC, ReactNode, useEffect, useState } from 'react';
import { inject, observer } from 'mobx-react';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { Dialog } from '@uvgo-shared/dialog';
import { CacheControlStore, CacheSettingOptionsModel, OPTION_FILTER, SettingsModel } from '../../../Shared';
import { EDITOR_TYPES, ViewInputControl } from '@wings-shared/form-controls';
import { styles } from './SettingOptionEditor.styles';
import { Button, Checkbox, Box } from '@material-ui/core';
import { IOptionValue, regex, Loader } from '@wings-shared/core';

interface Props {
  setting: SettingsModel;
  cacheControlStore?: CacheControlStore;
  onUpdate: (options: any[]) => void;
}

const SettingOptionEditor: FC<Props> = ({ ...props }: Props) => {
  const [ options, setOptions ]  = useState(props.setting.options);
  const [ loader, setLoader ] = useState<Loader>(new Loader());
  const [ hasError, setHasError ] = useState<boolean[]>(new Array<boolean>(options.length));
  const [ errors, setErrors ] = useState<string[]>(new Array<string>(options.length));
  const classes: Record<string, string> = styles();

  /* istanbul ignore next */
  const onChange = (value: string, index: number, type: OPTION_FILTER) => {
    const newOptions = [ ...options ];
    newOptions[index] = { ...newOptions[index], value };

    const newHasError = [ ...hasError ];
    const newErrors = [ ...errors ];

    switch (type) {
      case OPTION_FILTER.INT:
        newHasError[index] = !regex.numberOnly.test(value);
        newErrors[index] = `You can only enter number(s) for ${newOptions[index].key}`;
        if (value.length >= 10) {
          newErrors[index] = `${newOptions[index].key} can be maximum 9 digits long`;
          newHasError[index] = true;
        }
        break;
      case OPTION_FILTER.STRING:
        newHasError[index] = !Boolean(value?.length);
        newErrors[index] = `${newOptions[index].key} is required`;
        break;
      default:
        newHasError[index] = false;
        break;
    }

    setOptions(newOptions);
    setHasError(newHasError);
    setErrors(newErrors);
  }

  const dialogContent = (): ReactNode => {
    const renderOptions = options?.map((option, idx) => {
      const type: OPTION_FILTER = OPTION_FILTER[option.type];
      return (
        <div key={idx} className={classes.contentModal}>
          {type === OPTION_FILTER.BOOL &&
            <Checkbox
              color="primary"
              checked={Boolean(option?.value)}
              onChange={({ target }: ChangeEvent<HTMLInputElement>) => onChange(target.value, idx, type)}
            />
          }
          {type !== OPTION_FILTER.BOOL &&
            <ViewInputControl
              type={EDITOR_TYPES.TEXT_FIELD}
              isEditable={true}
              classes={{ textInput: classes.nameInput }}
              field={{ value: option?.value, label: 'Value', showErrors: () => null, bind: () => null }}
              onValueChange={(value: IOptionValue) => onChange(value as string, idx, type)}
              customErrorMessage={hasError[idx] ? errors[idx] : ''}
            />
          }
          <Box width="50%">
            <ViewInputControl
              type={EDITOR_TYPES.TEXT_FIELD}
              classes={{ textInput: classes.nameInput }}
              field={{ value: option?.displayName, label: 'Display Name' }}
              isEditable={false}
            />
          </Box>
        </div>
      );
    });

    return (
      <>
        {loader.spinner}
        {renderOptions}
        <div className={classes.btnSection}>
          <Button
            color="primary"
            variant="contained"
            size="small"
            className={classes.btnValue}
            onClick={() => props.onUpdate(options)}
            disabled={hasError.some(x => x)}
          >
            Update
          </Button>
        </div>
      </>
    );
  }

  return (
    <Dialog
      title={`Edit: ${props.setting?.name}`}
      open={true}
      classes={{
        dialogWrapper: classes.modalRoot,
        paperSize: classes.userMappedWidth,
        header: classes.headerWrapper,
        content: classes.content,
      }}
      onClose={() => ModalStore.close()}
      dialogContent={() => dialogContent()}
    />
  );
};

export default inject('cacheControlStore')(observer(SettingOptionEditor));

