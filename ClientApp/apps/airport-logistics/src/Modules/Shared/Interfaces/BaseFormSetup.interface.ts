import { FormEvent } from 'react';

export interface IBaseFormSetup {
  form: {
    fields: string[];
    placeholders?: { [key: string]: string };
    rules?: { [key: string]: string | string[] };
    labels?: { [key: string]: string };
    options?: { [key: string]: any[] }
  },
  formOptions?: {
    successHandler?: (form: FormEvent) => void;
    errorHandler?: () => void;
    isNested?: boolean
  }
}
