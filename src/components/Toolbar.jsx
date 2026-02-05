import React from 'react';

const Toolbar = ({ pcbManager }) => {
    const handleExport = () => {
        const data = pcbManager.exportJSON();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'pcb_layout.json';
        a.click();
    };

    const handleImport = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const data = JSON.parse(event.target.result);
            pcbManager.loadData(data);
        };
        reader.readAsText(file);
    };

    const handleLoadSample = () => {
        const components = [];
        
        const cols = 10;
        const rows = 10;
        const spacing = 8;
        const startX = -((cols - 1) * spacing) / 2;
        const startZ = -((rows - 1) * spacing) / 2;

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                components.push({
                    id: `pad_c_${r}_${c}`,
                    type: 'smd_circle',
                    pos: [startX + c * spacing, 0, startZ + r * spacing],
                    size: [3.0, 3.0],
                    layer: 'top'
                });
            }
        }

        for (let i = 0; i < 8; i++) {
            const row1 = Math.floor(Math.random() * 10);
            const col1 = Math.floor(Math.random() * 10);
            const row2 = Math.min(row1 + 1, 9);
            const col2 = Math.min(col1 + 1, 9);

            if (row1 === row2 && col1 === col2) continue;

            const p1 = [startX + col1 * spacing, startZ + row1 * spacing];
            const p2 = [startX + col2 * spacing, startZ + row2 * spacing];

            components.push({
                id: `trace_${i}`,
                type: 'path',
                points: [p1, p2],
                width: 0.8,
                layer: 'top'
            });
        }

        const inset = 5;
        const corners = [
            [-50 + inset, 0, -40 + inset],
            [50 - inset, 0, -40 + inset],
            [50 - inset, 0, 40 - inset],
            [-50 + inset, 0, 40 - inset]
        ];

        corners.forEach((pos, i) => {
            components.push({
                id: `mounting_hole_${i}`,
                type: 'hole',
                pos: pos,
                diameter: 4.0
            });
        });

        const sample = {
            "board": { "width": 100, "height": 80, "thickness": 1.6 },
            "components": components
        };
        pcbManager.loadData(sample);
    };

    const handleAddTrace = (type) => {
        const id = `trace_${Math.random().toString(36).substr(2, 5)}`;
        const x = (Math.random() - 0.5) * 40;
        const z = (Math.random() - 0.5) * 40;
        
        let p2;
        if (type === 'diagonal') {
            p2 = [x + 10, z + 10];
        } else {
            p2 = [x + 10, z];
        }

        pcbManager.addTrace({
            id: id,
            type: 'path',
            points: [[x, z], p2],
            width: 0.8,
            layer: 'top'
        });
    };

    const handleAddPad = (type) => {
        const id = `pad_${Math.random().toString(36).substr(2, 5)}`;
        const x = (Math.random() - 0.5) * 40;
        const z = (Math.random() - 0.5) * 40;
        
        pcbManager.addPad({
            id: id,
            type: type,
            pos: [x, 0, z],
            size: type === 'smd_circle' ? [3, 3] : [2, 4],
            layer: 'top'
        });
    };

    const handleClear = () => {
        if (window.confirm('Are you sure you want to clear the entire board? This action cannot be undone.')) {
            pcbManager.clear();
        }
    };

    return (
        <div className="pcb-toolbar">
            <button className="load-sample-btn" onClick={handleLoadSample}>Load Sample</button>
            <button className="clear-board-btn" onClick={handleClear}>Clear Board</button>
            <button onClick={() => handleAddPad('smd_circle')}>Add Circle Pad</button>
            <button onClick={() => handleAddTrace('straight')}>Add Straight Trace</button>
            <button onClick={() => handleAddTrace('diagonal')}>Add Diagonal Trace</button>
            <button onClick={handleExport}>Export JSON</button>
            <div className="import-wrapper">
                <label htmlFor="import-json" className="button">Import JSON</label>
                <input 
                    id="import-json" 
                    type="file" 
                    accept=".json" 
                    onChange={handleImport} 
                    style={{ display: 'none' }}
                />
            </div>
        </div>
    );
};

export default Toolbar;
