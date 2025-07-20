import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { of } from 'rxjs';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { FileMock } from '@wings/shared';
import ImportFAAFile from '../Components/ImportFAAFile/ImportFAAFileV2';
import { getFormValidation, SettingsTypeModel, UIStore } from '@wings-shared/core';
import MobxReactForm from 'mobx-react-form';
import { ImportDialog } from '@wings-shared/layout';

describe('Import FAA File', () => {
  let wrapper: ShallowWrapper;
  let form: MobxReactForm;
  const fileMock = new FileMock();
  const props = {
    onImportFileData: sinon.fake.returns(of([])),
    onImportDone: sinon.fake(),
    title: '',
    successMessage: '',
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
    const values = {
      fileType: [
        { id: 1, label: 'Test1' },
        { id: 2, label: 'Test2' },
      ],
    };
    form.init(values);
    wrapper = shallow(<ImportFAAFile {...props} />);
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
    expect(wrapper.find(ImportDialog)).to.have.length(1);
  });

  it('should call upload file method', () => {
    const files: File[] = [fileMock.testFile];
    wrapper.find(ImportDialog).simulate('uploadFile', files);
    expect(props.onImportFileData.calledWith(files)).to.be.true;
  });

  it('should show title of ImportDialog', () => {
    wrapper.setProps({ ...props, title: 'Test' });
    expect(wrapper.find(ImportDialog).prop('title')).to.eq('Test');
  });
});
