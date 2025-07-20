import React, { useEffect, useMemo, useState } from 'react';
import MobxReactForm, { Field } from 'mobx-react-form';
import { takeUntil, finalize } from 'rxjs/operators';
import { VIEW_MODE } from '../../Enums';
import {
  Utilities,
  Loader,
  IAPISearchFiltersDictionary,
  getFormValidation,
  IOptionValue,
  SEARCH_ENTITY_TYPE,
  IAPISearchFilter,
  IAPIGridRequest,
  UIStore,
} from '@wings-shared/core';
import { ALERT_TYPES, AlertStore } from '@uvgo-shared/alert';
import { EDITOR_TYPES, IViewInputControl } from '@wings-shared/form-controls';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { PROGRESS_TYPES } from '@uvgo-shared/progress';
import { useUnsubscribe } from '@wings-shared/hooks';
import { Observable } from 'rxjs';
import { auditFields } from './auditFields';
 
export interface IUseUpsert {
  isLoading: boolean;
  form: MobxReactForm;
  setFormFields: React.Dispatch<any>;
  getField: (fieldKey: string) => Field;
  onValueChange: (value: IOptionValue, fieldKey: string) => Field;
  setFormRules: (fieldKey: string | string[], required: boolean, label?: string) => void;
  clearFormFields: (fieldKey: string | string[]) => void;
  isEditable: boolean;
  observeSearch: Function;
  setFormValues: (TModel) => void;
  getSearchRequest: (
    searchValue: string,
    entityType: SEARCH_ENTITY_TYPE,
    filterCollection?: IAPISearchFilter[]
  ) => IAPIGridRequest;
  isDetailView: boolean;
  isEditView: boolean;
  isAddNew: boolean;
  auditFields: IViewInputControl[];
  getCustomValidationError: (key: string) => string;
}
 
interface BaseProps {
  viewMode?: VIEW_MODE;
}
 
export function useBaseUpsertComponent<TModel>(props: BaseProps, fields: Field, filters?: IAPISearchFiltersDictionary) {
  // State
  const [ loader, setLoader ] = useState(new Loader(false, { type: PROGRESS_TYPES.CIRCLE }));
  const [ viewMode, setViewMode ] = useState(props.viewMode);
  const [ isLoading, setIsLoading ] = useState(false);
  const [ activeStep, setActiveStep ] = useState(0);
  const [ activeTab, setActiveTab ] = useState('');
  const [ expandMode, setExpandMode ] = useState(false);
  const [ expandModeField, setExpandModeField ] = useState({});
  const [ isRichEditorFocused, setRichEditorFocused ] = useState(false);
  const [ isAlreadyExistMap, setIsAlreadyExistMap ] = useState(new Map<string, boolean>());
  const [ searchFilters, setSearchFilters ] = useState(filters);
  const [ formFields, setFormFields ] = useState(fields);
  const [ initialValues, setInitialValues ] = useState<any>(null);
  const [ isFormChanged, setIsFormChanged ] = useState(false);
 
  const form: MobxReactForm = useMemo(() => getFormValidation(formFields), [ formFields ]);
  const unsubscribe = useUnsubscribe();
 
  useEffect(() => {
    /**
     * The initial value can be null. But if the user makes changes to the field and then deletes it,
     * the resulting value will be an empty string. Such a change should not be taken into account,
     * so when checking, null and an empty string are considered equal.
     */
    const formValues = form.values();
    let isChanged: boolean = false;
    const isNullOrEmpty = value => value === null || value === '';
 
    if (!initialValues) {
      setIsFormChanged(false);
      return;
    }
 
    for(const key in formValues) {
      let initialVal = initialValues[key];
      let newVal = formValues[key];
 
      if (initialVal === newVal) {
        continue;
      }
 
      if (typeof initialVal === 'string') {
        initialVal = initialVal.trim();
      }
 
      if (typeof newVal === 'string') {
        newVal = newVal.trim();
      }
 
      if (formValues.hasOwnProperty(key)) {
        const bothNullOrEmpty = isNullOrEmpty(initialVal) && isNullOrEmpty(newVal);
 
        if (!bothNullOrEmpty && initialVal !== newVal) {
          isChanged = true;
          break;
        }
      }
    }
 
    setIsFormChanged(isChanged);
  }, [ form.values() ]);
 
  // Check if any field had duplicate and it's not allowed
  const hasDuplicateValue = useMemo(
    () => [ ...isAlreadyExistMap.keys() ].some(key => Boolean(isAlreadyExistMap.get(key))),
    [ isAlreadyExistMap ]
  );
 
  // Computed properties
  const isEditable = useMemo(
    () => Utilities.isEqual(viewMode, VIEW_MODE.EDIT) || Utilities.isEqual(viewMode, VIEW_MODE.NEW),
    [ viewMode ]
  );
 
  const isActionDisabled = useMemo(() => form.hasError || UIStore.pageLoading || !form.changed, [
    form.hasError,
    UIStore.pageLoading,
    form.changed,
  ]);
 
  const isDetailView = Utilities.isEqual(viewMode, VIEW_MODE.DETAILS);
 
  const isEditView = Utilities.isEqual(viewMode, VIEW_MODE.EDIT);
 
  const isAddNew = useMemo(() => Utilities.isEqual(viewMode, VIEW_MODE.NEW), [ viewMode ]);
 
  // Get custom validation error i.e any custom rules applied using validation function
  const getCustomValidationError = (key: string) => {
    const field = getField(key);
    return field.hasError ? field.validationErrorStack[0] : '';
  };
 
  // Mobx action functions
  const setFormValues = (model: TModel): void => {
    form.set(model);
    setInitialValues(form.values());
  };
 
  const getField = (key: string): Field => {
    return form.$(key);
  };
 
  const getFieldLabel = (key: string): string => {
    return getField(key).label?.replace('*', '');
  };
 
  const resetFormValidations = (model: TModel, callback?: () => void): void => {
    form.reset();
    form.set(model);
    const timer = setTimeout(() => {
      callback();
      clearTimeout(timer);
    }, 100);
  };
 
  const clearFormFields = (fieldKey: string | string[]): void => {
    const _keys = Array.isArray(fieldKey) ? fieldKey : [ fieldKey ];
    _keys.forEach(_key => getField(_key).clear());
  };
 
  const setFormRules = (fieldKey: string | string[], required: boolean, label?: string): void => {
    const _keys = Array.isArray(fieldKey) ? fieldKey : [ fieldKey ];
 
    _keys.forEach(_key => {
      const field = getField(_key);
      const rules = field.rules?.split('|').filter(rule => rule) || [];
      const fieldLabel = label || getFieldLabel(_key);
      let newRules = [];
      if (required) {
        newRules = rules.includes('required') ? rules : [ 'required', ...rules ];
      } else {
        newRules = rules.filter(rule => rule !== 'required');
      }
 
      field.set('rules', newRules.join('|'));
      field.set('label', `${fieldLabel}${required ? '*' : ''}`);
    });
  };
 
  const resetExpandedMode = (): void => setExpandMode(false);
 
  const setExpandedMode = (label: string, fieldKey: string, type: EDITOR_TYPES): void => {
    setExpandMode(!expandMode);
    setExpandModeField({
      fieldKey: fieldKey,
      type: type,
      multiline: true,
      rows: 40,
      label: label,
      isExpanded: true,
      isInputCustomLabel: true,
    });
  };
 
  const showAlert = (message: string, id: string): void => {
    const alert = {
      id,
      message,
      type: ALERT_TYPES.IMPORTANT,
      hideAfter: 5000,
    };
    AlertStore.removeAlert(id);
    AlertStore.showAlert(alert);
  };
 
  // See demo in UpsertSchedule Restrictions component
  const getSearchRequest = (
    searchValue: string,
    entityType: SEARCH_ENTITY_TYPE,
    filterCollection?: IAPISearchFilter[]
  ): IAPIGridRequest => {
    if (!searchFilters) {
      return { pageSize: 50 };
    }
 
    const searchCollection = searchFilters[entityType]?.searchFilters.map(filter => {
      return {
        ...filter,
        propertyValue: searchValue,
      };
    });
    return {
      specifiedFields: searchFilters[entityType]?.specifiedFields,
      searchCollection: JSON.stringify(searchCollection),
      filterCollection: JSON.stringify(filterCollection || []),
      pageSize: 50,
    };
  };
 
  // Get filters with specific fields
  const getFilterRequest = (entityType: SEARCH_ENTITY_TYPE, filterCollection?: IAPISearchFilter[]): IAPIGridRequest => {
    if (!searchFilters) {
      return { pageSize: 50 };
    }
    return {
      specifiedFields: searchFilters[entityType]?.specifiedFields,
      filterCollection: JSON.stringify(filterCollection || []),
      pageSize: 0,
    };
  };
 
  /**
   * @param searchObservable // Search Observable of Type T
   */
  function observeSearch<T>(searchObservable: Observable<T>, next?: (value: T) => void) {
    loader.setLoadingState(true);
    searchObservable
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => loader.setLoadingState(false))
      )
      .subscribe(next);
  }
 
  return {
    viewMode,
    form,
    loader,
    isLoading,
    activeStep,
    activeTab,
    expandMode,
    expandModeField,
    isRichEditorFocused,
    searchFilters,
    noBlocker: { state: { noBlocker: !form.changed } },
    isEditable,
    isDetailView,
    isEditView,
    isAddNew,
    hasDuplicateValue,
    auditFields,
    isActionDisabled,
    isAlreadyExistMap,
    setIsAlreadyExistMap,
    resetFormValidations,
    clearFormFields,
    onValueChange: (value: IOptionValue, fieldKey: string) => {
      getField(fieldKey).set(value);
    },
    onCancel: (model: TModel) => {
      if (viewMode === VIEW_MODE.NEW || props.viewMode === VIEW_MODE.EDIT) {
        ModalStore.close();
        return;
      }
      setViewMode(VIEW_MODE.DETAILS);
      setFormValues(model);
    },
 
    setIsLoading,
    setViewMode,
    setRichEditorFocused,
    setFormValues,
    getField,
    getFieldLabel,
    getCustomValidationError,
    setActiveTab,
    setFormRules,
    resetExpandedMode,
    setExpandMode,
    setExpandedMode,
    showAlert,
    getSearchRequest,
    getFilterRequest,
    observeSearch,
    setFormFields,
  };
}