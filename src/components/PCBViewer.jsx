import React, { useRef } from 'react';
import { usePCBEngine } from '../hooks/usePCBEngine';
import '../styles/PCBViewer.css';

const PCBViewer = ({ onEngineReady }) => {
    const canvasRef = useRef(null);
    const engine = usePCBEngine(canvasRef);

    React.useEffect(() => {
        if (engine && onEngineReady) {
            onEngineReady(engine);
        }
    }, [engine, onEngineReady]);

    return (
        <div className="pcb-viewer-container">
            <canvas ref={canvasRef} className="pcb-canvas" />
            {!engine && <div className="loading-overlay">Initializing 3D Engine...</div>}
        </div>
    );
};

export default PCBViewer;
