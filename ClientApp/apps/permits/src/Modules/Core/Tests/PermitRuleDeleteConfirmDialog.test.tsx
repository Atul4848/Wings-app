import React from 'react';
import { mount } from 'enzyme';
import { expect } from 'chai';
import sinon from 'sinon';
import { PermitExceptionRuleModel } from '../../Shared';
import { useRouterContext } from '@wings/shared';
import { PermitRuleDeleteConfirmDialog } from '../Components';
import { Provider } from 'mobx-react';

describe('Permit Rule Delete Confirm Dialog Component V2', () => {
  let wrapper: any;

  const props = {
    exceptionRules: [
      new PermitExceptionRuleModel({ id: 5 }),
      new PermitExceptionRuleModel({ id: 10 }),
      new PermitExceptionRuleModel({ id: 15 }),
    ],
    classes: {},
    exceptionRuleTempId: 10,
    isDeleteButton: true,
    onUpdateExceptionRules: sinon.spy(),
  };

  const element = (
    <Provider {...props}>
        <PermitRuleDeleteConfirmDialog {...props} />
    </Provider>
  );
  beforeEach(() => {
    wrapper = mount(useRouterContext(element));
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });

});
