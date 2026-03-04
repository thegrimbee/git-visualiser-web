import {
  Database,
  Check,
  ChevronDown,
  Loader2
} from 'lucide-react'
import { ObjectDetail } from './ObjectDetail'
import { ObjectGraph } from './ObjectGraph'
import { useMemo, useState, useEffect, useCallback } from 'react'
import type { JSX } from 'react'
import { mockDataList } from './MockData'

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
  diff?: { status: string; path: string; hash: string }[]
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

interface RepositoryData {
  repositoryName: string
  repositoryPath?: string
  description?: string
  exportDate?: string
  totalObjects?: number
  objects: GitObject[]
  name?: string
}

function getRawGithubUrl(url: string): string {
  try {
    const parsedUrl = new URL(url)
    if (parsedUrl.hostname === 'github.com') {
      const pathParts = parsedUrl.pathname.split('/').filter(Boolean)
      // Remove blob/ or tree/ if present
      const filteredParts = pathParts.filter(part => part !== 'blob' && part !== 'tree')
      return `https://raw.githubusercontent.com/${filteredParts.join('/')}`
    }
    return url
  } catch (e) {
    console.error('Invalid URL provided:', url, e)
    return url
  }
}

export function ObjectDatabase(): JSX.Element {
  const [selectedObject, setSelectedObject] = useState<GitObject | null>(null)
  const [currentMockIndex, setCurrentMockIndex] = useState(0)

  // Calculate initial loading state based on URL presence
  const initialUrl = new URLSearchParams(window.location.search).get('url') || ''
  const [urlInput, setUrlInput] = useState(initialUrl)

  // State for handling external URL data
  const [customData, setCustomData] = useState<RepositoryData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Extract fetch logic to reusable function
  const loadFromUrl = useCallback(async (url: string) => {
    if (!url) return

    setIsLoading(true)
    setError(null)
    
    try {
      const rawUrl = getRawGithubUrl(url)
      const res = await fetch(rawUrl)
      if (!res.ok) throw new Error(`Failed to load: ${res.statusText}`)
      
      const data = await res.json()
      // Basic validation
      if (!data.objects || !Array.isArray(data.objects)) {
        throw new Error('Invalid JSON format: missing "objects" array')
      }
      
      setCustomData({
        ...data,
        name: data.repositoryName || 'External Repository'
      })
      // Automatically select the new custom dataset (last index after mocked data)
      setCurrentMockIndex(mockDataList.length)
    } catch (err: Error | unknown) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
      console.error('Error fetching git objects:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const url = params.get('url')
    if (url) {
      setUrlInput(url)
      loadFromUrl(url)
    }
  }, [loadFromUrl])

  const handleUrlSubmit = () => {
    if (!urlInput.trim()) return

    // Update URL without reloading
    const newUrl = new URL(window.location.href)
    newUrl.searchParams.set('url', urlInput)
    window.history.pushState({}, '', newUrl)

    loadFromUrl(urlInput)
  }

  // Combine mock data and custom data
  const availableDatasets = useMemo(() => {
    return customData ? [...mockDataList, customData] : mockDataList
  }, [customData])

    // Use availableDatasets instead of mockDataList directly
  const objects = useMemo(() => {
    // Safety check in case index is out of bounds
    const dataset = availableDatasets[currentMockIndex] || availableDatasets[0]
    return dataset.objects as GitObject[]
  }, [currentMockIndex, availableDatasets])

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

  const handleDatasetChange = (index: number) => {
    setCurrentMockIndex(index)
    setSelectedObject(null) // Reset selection when switching datasets
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
    return objects.filter((obj) => visibleTypes.includes(obj.type))
  }, [objects, visibleTypes])

  // Helper just for checking inclusion in local rendering
  const isTypeVisible = (type: string): boolean => visibleTypes.includes(type)

  // Handle loading and error states
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#1e1e1e] text-gray-400">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p>Loading repository data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex bg-[#1e1e1e] overflow-hidden h-full">
      <div className="flex-1 border-r border-gray-700 flex flex-col overflow-hidden relative">
        <div className="p-4 border-b border-gray-700 flex-shrink-0 max-h-[50vh] overflow-y-auto">
          
          <div className="mb-4">
            <div className="mb-4 space-y-3">
              <h3 className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-2">
                Load External JSON
              </h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://raw.githubusercontent.com/..."
                  className="flex-1 bg-[#252526] border border-gray-700 text-gray-300 text-xs rounded px-2 py-1.5 focus:outline-none focus:border-blue-500/50"
                  onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
                />
                <button
                  onClick={handleUrlSubmit}
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-1.5 rounded disabled:opacity-50"
                >
                  Load
                </button>
              </div>
              {error && (
                <div className="mt-2 text-xs text-red-400 bg-red-500/10 p-2 rounded border border-red-500/20">
                  <span className="font-semibold">Error:</span> {error}
                </div>
              )}
            </div>
            <h3 className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-2">
                  Select Repository
            </h3>
            <div className="relative">
              <select
                value={currentMockIndex}
                onChange={(e) => handleDatasetChange(Number(e.target.value))}
                className="w-full bg-[#252526] border border-gray-700 text-gray-300 text-xs rounded px-2 py-1.5 appearance-none focus:outline-none focus:border-blue-500/50 pr-8"
              >
                {availableDatasets.map((data, index) => (
                  <option key={index} value={index}>
                    {data.name || (data as RepositoryData).repositoryName}
                  </option>
                ))}
              </select>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                <ChevronDown className="w-3 h-3 text-gray-500" />
              </div>
            </div>
            {availableDatasets[currentMockIndex]?.description && (
              <p className="mt-1 text-[10px] text-gray-500 truncate">
                {availableDatasets[currentMockIndex].description}
              </p>
            )}
            {customData && currentMockIndex === availableDatasets.length - 1 && (
              <p className="mt-1 text-[10px] text-blue-400 truncate flex items-center gap-1">
                 Loaded from URL
              </p>
            )}
          </div>

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
                const obj = objects.find((o) => o.hash === hash)
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
