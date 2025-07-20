import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { of } from 'rxjs';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { FileMock } from '@wings/shared';
import { ImportDialog } from '@wings-shared/layout';
import { ImportFileData } from '../Components';

describe('Import File Data', () => {
  let wrapper: ShallowWrapper;
  let instance: any;
  const fileMock = new FileMock();
  const props = {
    onImportFileData: sinon.fake.returns(of([])),
    onImportDone: sinon.fake(),
    title: '',
    successMessage: '',
    classes: {},
  };

  beforeEach(() => {
    wrapper = shallow(<ImportFileData {...props} />);
    instance = wrapper.instance();
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.be.ok;
  });

  it('should call upload file method', () => {
    const uploadFileData = sinon.spy(instance, 'uploadFileData');
    const files: File[] = [fileMock.testFile];
    wrapper.find(ImportDialog).simulate('uploadFile', files);
    expect(uploadFileData.calledWith(files)).to.be.true;
  });
});
