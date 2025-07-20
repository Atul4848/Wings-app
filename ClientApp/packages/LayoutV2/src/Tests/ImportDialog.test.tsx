import React, { ReactNode } from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import * as sinon from 'sinon';
import { expect } from 'chai';
import { Dialog } from '@uvgo-shared/dialog';
import { Typography } from '@mui/material';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { FileMock } from '@wings/shared';
import MobxReactForm from 'mobx-react-form';
import { getFormValidation, SettingsTypeModel } from '@wings-shared/core';
import { ImportDialog } from '../Components';

describe('Import Dialog Module', function () {
  const onUploadFile = sinon.spy();
  let wrapper: ShallowWrapper;
  let instance: any;
  const fileMock = new FileMock();
  const files: FileList = fileMock.createMockFileList([{ body: 'test', mimeType: 'text/plain', name: 'test.xlsx' }]);
  const props = {
    classes: {},
    title: 'Import',
    onUploadFile,
    isLoading: () => false,
    gridOptions: {},
    exceptionData: [],
    form: MobxReactForm,
    fileTypeOptions: [ new SettingsTypeModel({ id: 1, name: 'Test1' }), new SettingsTypeModel({ id: 2, name: 'Test2' }) ],
  };
  const dialogActions = (): ReactNode => wrapper.find(Dialog).prop('dialogActions')();
  const dialogContent = (): ReactNode => wrapper.find(Dialog).prop('dialogContent')();

  const fields = {
    faaImportFileType: {
      label: 'File label',
      rules: 'required',
    },
  };

  beforeEach(function () {
    props.form = getFormValidation(fields);
    wrapper = shallow(<ImportDialog {...props} />).dive();
    instance = wrapper.instance();
  });

  afterEach(function () {
    wrapper.unmount();
    ModalStore.data = null;
  });

  it('should be rendered without errors', function () {
    expect(wrapper).to.have.length(1);
  });

  it('should render Dialog Actions', function () {
    const element: JSX.Element = <div>{dialogActions()}</div>;
    expect(shallow(element).find(PrimaryButton)).to.have.length(2);
  });

  it('should render Dialog Content', function () {
    const element: JSX.Element = <div>{dialogContent()}</div>;
    expect(shallow(element).find(Typography)).to.have.length(2);
  });

  // it('should render CustomAgGrid', function () {
  //   wrapper.setProps({ ...props, exceptionData: [{ id: 9 }] });
  //   const customAgGrid = shallow(<div>{dialogContent()}</div>).find(CustomAgGridReact);
  //   expect(customAgGrid).to.have.length(1);
  // });

  it('should set files properly with setFiles method', function () {
    // should return without set file
    instance.setFiles([]);
    expect(instance.files).to.have.length(0);
    expect(instance.fileName).to.eq('');

    // should set file
    instance.setFiles([ fileMock.testFile ]);
    expect(instance.files).to.have.length(1);
  });

  it('should set files properly on Input Change', function () {
    const fileInput = shallow(<div>{dialogContent()}</div>)
      .find('[type="file"]')
      .first();

    // should set file properly
    fileInput.simulate('change', fileMock.fakeChangeEventData(files));
    expect(instance.fileName).to.eq('test.xlsx');
    expect(instance.files).to.have.length(1);
  });

  it('should not set file if extension is not .xlsx', function () {
    const textFile: FileList = fileMock.createMockFileList([
      { body: 'test', mimeType: 'text/plain', name: 'test.text' },
    ]);
    shallow(<div>{dialogContent()}</div>)
      .find('[type="file"]')
      .first()
      .simulate('change', fileMock.fakeChangeEventData(textFile));
    expect(instance.files).to.have.length(0);
  });

  it('should return all success uploadData', function () {
    instance.files = [ fileMock.testFile ];
    shallow(<div>{dialogActions()}</div>)
      .find(PrimaryButton)
      .at(1)
      .simulate('click');
    expect(props.onUploadFile.callCount).to.eq(1);
  });

  it('should close modal on modal action cancel click', function () {
    const closeSpy = sinon.spy();
    ModalStore.close = closeSpy;
    shallow(<div>{dialogActions()}</div>)
      .find(PrimaryButton)
      .at(0)
      .simulate('click');
    expect(closeSpy.calledOnce).to.be.true;
  });

  it('should call close modal on dialog close', function () {
    const closeSpy = sinon.spy();
    ModalStore.close = closeSpy;
    wrapper.find(Dialog).simulate('close');
    expect(closeSpy.calledOnce).to.be.true;
  });
});
