import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import React from 'react';
import { Dialog } from '@uvgo-shared/dialog';
import { UserSettings } from '../Components';
import { Checkbox, FormControlLabel, TextField } from '@material-ui/core';
import { ModeStore, MODE_TYPES } from '@wings-shared/mode-store';
import { AuthStore, USER_GROUP, UserMock, UserModel } from '@wings-shared/security';

// describe('User Settings Component', () => {
//   let wrapper: ShallowWrapper;
//   let dialogContent: ShallowWrapper;

//   beforeEach(() => {
//     AuthStore.onUserUnloaded();
//     wrapper = shallow(<UserSettings />).dive();
//     dialogContent = wrapper.find(Dialog).dive().dive();
//   });

//   afterEach(() => wrapper.unmount())

//   it('should render without errors', () => {
//     expect(wrapper).to.have.length(1);
//   });

//   it('should render Dialog', () => {
//     expect(wrapper.find(Dialog)).to.have.length(1);
//   });

//   it('Admin Can see modes', () => {
//     const user: UserModel = new UserMock([ USER_GROUP.ADMIN ]).userModel;
//     AuthStore.onUserLoaded(user, user.accessToken);
//     expect(dialogContent.find(FormControlLabel)).to.have.length(1);
//   });

//   it('Should render 3 fields', () => {
//     const user: UserModel = new UserMock([ USER_GROUP.ADMIN ]).userModel;
//     AuthStore.onUserLoaded(user, user.accessToken);
//     expect(dialogContent.find(TextField)).to.have.length(3);
//   });

//   it('General users can NOT see modes', () => {
//     const user: UserModel = new UserMock([ USER_GROUP.GENERAL ]).userModel;
//     AuthStore.onUserLoaded(user, user.accessToken);
//     expect(dialogContent.find(FormControlLabel)).to.have.length(0);
//   });

//   it('toggle Mode calls ModeStore', () => {
//     const user: UserModel = new UserMock([ USER_GROUP.ADMIN ]).userModel;
//     AuthStore.onUserLoaded(user, user.accessToken);
//     const checkbox = dialogContent.find(FormControlLabel).at(0).dive().dive().find(Checkbox);
//     checkbox.at(0).simulate('change');
//     expect(ModeStore.isModeEnabled(MODE_TYPES.DEV)).to.be.true;
//   });
// });
