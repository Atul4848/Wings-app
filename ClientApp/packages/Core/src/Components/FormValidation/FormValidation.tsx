import dvr from 'mobx-react-form/lib/validators/DVR';
import vjf from 'mobx-react-form/lib/validators/VJF';
import validatorjs from 'validatorjs';
import MobxReactForm from 'mobx-react-form';
import { FormEvent } from 'react';
import { reaction } from 'mobx';
import validators from './customValidators';

/* istanbul ignore next */
function getFormValidation(
  fields,
  options?: { successHandler?: (form: FormEvent) => void; errorHandler?: () => void; isNested?: boolean }
) {
  const hooks: any = {};
  const updatedFields: any = options?.isNested ? fields : { fields };
  // register custom validators
  validators.oneDecimalPlace(validatorjs);
  validators.twoDecimalPlace(validatorjs);
  validators.onePlaceDecimalWithZero(validatorjs);
  validators.latitudeValidator(validatorjs);
  validators.longitudeValidator(validatorjs);
  validators.runwayIdValidator(validatorjs);
  validators.pcnValidator(validatorjs);
  validators.threeDigitsLimitValidator(validatorjs);

  const plugins: any = { dvr: dvr(validatorjs), vjf: vjf() };

  const formOptions: any = { validateOnChange: true };

  if (options?.successHandler) {
    hooks.onSuccess = options?.successHandler;
  }

  if (options?.errorHandler) {
    hooks.onError = options?.errorHandler;
  }

  hooks.onInit = (form: MobxReactForm) => {
    reaction(
      () => form.values(),
      () => form.validate()
    );
  };

  return new MobxReactForm(updatedFields, { plugins, hooks, formOptions });
}

export { getFormValidation };
