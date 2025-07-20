import React, { PropsWithChildren, useEffect } from 'react';
import { observer } from 'mobx-react';
import Form, { Field } from 'mobx-react-form';

import MainSection from './MainSection';
import AssociationsSection from './AssociationsSection';
import ValidityPeriodSection from './ValidityPeriodSection';
import AccessTypeSection from './AccessTypeSection';
import { useRoleForm } from './useRoleForm.hook';

import { useRoleFormClasses } from './RoleForm.styles';

export declare type RoleFormProps = PropsWithChildren<{
  onSubmit?: (values: any) => void;
}>;

const RoleForm: React.FC<RoleFormProps> = ({ children, onSubmit }) => {
  const classes: Record<string,  string> = useRoleFormClasses();
  const form: Form = useRoleForm(onSubmit);

  useEffect(() => () => {
    form.reset();
    form.each((field: Field) => field.set('disabled', false));
  }, []);

  return (
    <form onSubmit={form.onSubmit} className={classes.root}>
      <MainSection />
      <AssociationsSection />
      <AccessTypeSection />
      <ValidityPeriodSection />
      <div className={classes.buttonWrapper}>
        {children}
      </div>
    </form>
  );
}

export default observer(RoleForm);
