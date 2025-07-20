import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { of } from 'rxjs';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { FileMock } from '@wings/shared';
import ImportFAAFile from '../Components/ImportFAAFile/ImportFAAFile';
import { getFormValidation, SettingsTypeModel } from '@wings-shared/core';
import MobxReactForm from 'mobx-react-form';
import { ImportDialog } from '@wings-shared/layout';

describe('Import FAA File', () => {
  let wrapper: ShallowWrapper;
  let instance: any;
  let form: MobxReactForm;
  const fileMock = new FileMock();
  const props = {
    onImportFileData: sinon.fake.returns(of([])),
    onImportDone: sinon.fake(),
    title: '',
    successMessage: '',
    classes: {},
    form: MobxReactForm,
    fileTypeOptions: [new SettingsTypeModel({ id: 1, name: 'Test1' }), new SettingsTypeModel({ id: 2, name: 'Test2' })],
  };

  const fields = {
    importFileType: {
      label: 'File label',
      rules: 'required',
    },
  };

  beforeEach(() => {
    form = getFormValidation(fields);
    const values = { fileType: [{ id: 1, label: 'Test1' }, { id: 2, label: 'Test2' }] };
    form.init(values);
    wrapper = shallow(<ImportFAAFile {...props} />);
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
