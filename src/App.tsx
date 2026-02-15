// src/App.tsx
import { useState } from 'react'
import { ObjectGraph } from './assets/ObjectGraph'
import { mockObjects } from './assets/MockData'

function App() {
  const [selectedHash, setSelectedHash] = useState<string | undefined>()

  return (
    <div className="w-screen h-screen bg-[#1e1e1e] flex flex-col">
      <div className="flex-1 overflow-hidden relative">
        <ObjectGraph 
          objects={mockObjects} 
          selectedHash={selectedHash}
          onSelectObject={(hash) => {
            console.log('Selected:', hash)
            setSelectedHash(hash)
          }}
        />
      </div>
    </div>
  )
}

export default App