import { Board } from './Board';
import { PadSystem } from './PadSystem';
import { TraceSystem } from './TraceSystem';
import { DrillSystem } from './DrillSystem';

export class PCBManager {
    constructor(sceneManager) {
        this.sceneManager = sceneManager;
        
        this.board = new Board(sceneManager);
        this.pads = new PadSystem(sceneManager);
        this.traces = new TraceSystem(sceneManager);
        this.drills = new DrillSystem(sceneManager);

        this.pads.init();
        this.drills.init();
    }

    loadData(data) {
        // Clear existing
        this.clear();

        // Collect holes first to perforate the board
        const holes = data.components?.filter(c => c.type === 'hole') || [];

        // Update Board
        if (data.board) {
            this.board.updateDimensions(data.board.width, data.board.height, data.board.thickness, holes);
        }

        // Add Components
        if (data.components) {
            data.components.forEach(comp => {
                if (comp.type === 'smd_rect' || comp.type === 'smd_circle') {
                    this.pads.addPad({
                        id: comp.id,
                        pos: comp.pos,
                        size: comp.size,
                        type: comp.type,
                        layer: comp.layer
                    });
                } else if (comp.type === 'path') {
                    this.traces.addTrace({
                        id: comp.id,
                        type: comp.type,
                        points: comp.points,
                        width: comp.width,
                        layer: comp.layer || 'top'
                    });
                } else if (comp.type === 'hole') {
                    this.drills.addHole({
                        pos: comp.pos,
                        diameter: comp.diameter
                    });
                }
            });
        }
    }

    addTrace(traceData) {
        this.traces.addTrace(traceData);
    }

    addPad(padData) {
        this.pads.addPad(padData);
    }

    deleteComponent(id) {
        // Try deleting from pads
        this.pads.deletePad(id);
        // Try deleting from traces
        this.traces.deleteTrace(id);
    }

    clear() {
        // Reset systems
        this.pads.pads = [];
        this.pads.updatePads();
        
        this.drills.holes = [];
        this.drills.updateHoles();
        
        this.traces.dispose();
        this.traces = new TraceSystem(this.sceneManager);
    }

    exportJSON() {
        return {
            board: {
                width: this.board.width,
                height: this.board.height,
                thickness: this.board.thickness
            },
            components: [
                ...this.pads.pads,
                ...this.drills.holes.map(h => ({ ...h, type: 'hole' })),
                ...this.traces.traces
            ]
        };
    }

    dispose() {
        this.board.dispose();
        this.pads.dispose();
        this.traces.dispose();
        this.drills.dispose();
    }
}
