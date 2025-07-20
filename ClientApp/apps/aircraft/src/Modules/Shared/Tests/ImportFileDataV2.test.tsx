import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { of } from 'rxjs';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { FileMock } from '@wings/shared';
import { ImportDialog } from '@wings-shared/layout';
import { ImportFileDataV2 } from '../Components';

describe('Import File Data', () => {
  let wrapper: ShallowWrapper;
  const fileMock = new FileMock();
  const props = {
    onImportFileData: sinon.fake.returns(of([])),
    onImportDone: sinon.fake(),
    title: '',
    successMessage: '',
  };

  beforeEach(() => {
    wrapper = shallow(<ImportFileDataV2 {...props} />);
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.be.ok;
  });

  it('should call upload file method', () => {
    const files: File[] = [fileMock.testFile];
    wrapper.find(ImportDialog).simulate('uploadFile', files);
    expect(props.onImportFileData.calledWith(files)).to.be.true;
  });
});
