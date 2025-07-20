import { ChangeEvent } from 'react';
import { IMockFile } from '../Interfaces';

export class FileMock {
  public testFile: File;
  constructor() {
    this.testFile = this.createMockFile({ body: 'test', mimeType: 'text/plain', name: 'test.xlsx' });
  }

  public createMockFile(file: IMockFile): File {
    const blob = new Blob([ file.body ], { type: file.mimeType }) as any;
    blob['lastModifiedDate'] = new Date();
    blob['name'] = file.name;
    return blob as File;
  }

  public createMockFileList(files: IMockFile[]): FileList {
    const fileList: FileList = {
      length: files.length,
      item(index: number): File {
        return fileList[index];
      },
    } as FileList;
    files.forEach((file, index) => (fileList[index] = this.createMockFile(file)));
    return fileList;
  }

  // create fake data for change event
  public fakeChangeEventData = (files: FileList): ChangeEvent<HTMLInputElement> => {
    return { currentTarget: { files } } as ChangeEvent<HTMLInputElement>;
  };
}
