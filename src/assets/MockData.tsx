import type { GitObject, CommitObject, TreeObject, BlobObject, TagObject } from './ObjectDatabase'
import { defaultRepo } from './MockDatas/DefaultRepo'
import { deleteFileRepo } from './MockDatas/DeleteFileRepo'
import { editFileRepo } from './MockDatas/EditFileRepo'

export interface MockData {
  name: string
  description?: string
  objects: Array<CommitObject | TreeObject | BlobObject | GitObject | TagObject>
}

export const mockDataList: Array<MockData> = [
  defaultRepo,
  deleteFileRepo,
  editFileRepo
]
