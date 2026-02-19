import {
  Database,
  Check
} from 'lucide-react'
import { ObjectDetail } from './ObjectDetail'
import { ObjectGraph } from './ObjectGraph'
import { useMemo, useState } from 'react'
import type { JSX } from 'react'
import { mockObjects } from './MockData'

export interface GitObject {
  hash: string
  type: 'commit' | 'tree' | 'blob' | 'tag'
  size: number
  content?: string
  references?: string[]
  referencedBy?: string[]
}

export interface CommitObject extends GitObject {
  type: 'commit'
  tree: string
  parent?: string[]
  author: string
  message: string
  timestamp: string
}

export interface TreeObject extends GitObject {
  type: 'tree'
  names: string[]
  entries: Array<{
    mode: string
    type: 'blob' | 'tree'
    hash: string
    name: string
  }>
}

export interface BlobObject extends GitObject {
  type: 'blob'
  names: string[]
  content: string
}

export interface TagObject extends GitObject {
  type: 'tag'
  objectHash: string
}


export function ObjectDatabase(): JSX.Element {
  const [selectedObject, setSelectedObject] = useState<GitObject | null>(null)
  const objects = mockObjects
  const [visibleTypes, setVisibleTypes] = useState(['commit', 'tree', 'blob', 'tag'])

  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'commit':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
      case 'tree':
        return 'bg-green-500/20 text-green-300 border-green-500/30'
      case 'blob':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
      case 'tag':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30'
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
    }
  }

  const objectCounts = objects.reduce(
    (acc, obj) => {
      acc[obj.type] = (acc[obj.type] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )
    // derived filtered list
  const filteredObjects = useMemo(() => {
    return mockObjects.filter((obj) => visibleTypes.includes(obj.type))
  }, [mockObjects, visibleTypes])

  // Helper just for checking inclusion in local rendering
  const isTypeVisible = (type: string): boolean => visibleTypes.includes(type)

  return (
    <div className="flex-1 flex bg-[#1e1e1e] overflow-hidden h-full">
      <div className="flex-1 border-r border-gray-700 flex flex-col overflow-hidden relative">
        <div className="p-4 border-b border-gray-700 flex-shrink-0 max-h-[50vh] overflow-y-auto">
          <div className="mb-2">
            <h3 className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-2">
              Filter Objects
            </h3>
            <div className="flex flex-wrap gap-2">
              {['commit', 'tree', 'blob', 'tag'].map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setVisibleTypes(prev => 
                      prev.includes(type) 
                        ? prev.filter(t => t !== type) 
                        : [...prev, type]
                    )
                  }}
                  className={`flex items-center gap-1.5 px-2 py-1 text-xs rounded border transition-all ${
                    isTypeVisible(type)
                      ? getTypeColor(type)
                      : 'bg-[#252526] border-gray-700 text-gray-500 hover:border-gray-600 opacity-60'
                  }`}
                >
                  {isTypeVisible(type) ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <div className="w-3 h-3" />
                  )}
                  <span className="capitalize">{type}s</span>
                  <span className="opacity-50 ml-1 text-[10px] bg-black/20 px-1 rounded-full">
                    {objectCounts[type] || 0}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 relative">
          <div
            className={`absolute inset-0 overflow-hidden p-0`}
          >
            <ObjectGraph 
              objects={filteredObjects} 
              selectedHash={selectedObject?.hash}
              onSelectObject={(hash) => {
                const obj = mockObjects.find((o) => o.hash === hash)
                if (obj) setSelectedObject(obj)
              }}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 border-l border-gray-700 bg-[#1e1e1e] relative">
        <div className="absolute inset-0 overflow-auto">
          {selectedObject ? (
            <ObjectDetail
              object={selectedObject}
              allObjects={objects}
              onSelectObject={(hash) => {
                const obj = objects.find((o) => o.hash === hash)
                if (obj) setSelectedObject(obj)
              }}
            />
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <Database className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-sm text-gray-400">Select an object to view details</p>
                <p className="text-xs text-gray-500 mt-1">
                  Click on any object in the list to explore
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
