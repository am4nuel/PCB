import React, { useState, useEffect } from 'react'
import PCBViewer from './components/PCBViewer'
import Sidebar from './components/Sidebar'
import Toolbar from './components/Toolbar'
import './App.css'

function App() {
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [engine, setEngine] = useState(null);

  const handleEngineReady = (pcbEngine) => {
    setEngine(pcbEngine);
    
    // Listen for selection changes
    pcbEngine.interactionManager.onSelectionChange = (data) => {
        setSelectedComponent(data);
    };
  };

  const handleDelete = () => {
    if (engine) {
      engine.interactionManager.deleteSelected();
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>High-Performance 3D PCB Editor</h1>
        {engine && <Toolbar pcbManager={engine.pcbManager} />}
      </header>
      <main className="viewer-main">
        <PCBViewer onEngineReady={handleEngineReady} />
      </main>
      <Sidebar selectedComponent={selectedComponent} onDelete={handleDelete} />
    </div>
  )
}

export default App
