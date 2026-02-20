import type { GitObject, CommitObject, TreeObject, BlobObject, TagObject } from './ObjectDatabase'
import { defaultRepo } from './Mock Datas/DefaultRepo'
import { deleteFileRepo } from './Mock Datas/DeleteFileRepo'
import { editFileRepo } from './Mock Datas/EditFileRepo'

export interface MockData {
  name: string
  description: string
  objects: Array<CommitObject | TreeObject | BlobObject | GitObject | TagObject>
}

export const mockDataList: Array<MockData> = [
  defaultRepo,
  deleteFileRepo,
  editFileRepo
];