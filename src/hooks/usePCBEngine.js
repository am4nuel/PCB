import { useEffect, useRef, useState } from 'react';
import { SceneManager } from '../engine/core/SceneManager';
import { RenderLoop } from '../engine/core/RenderLoop';
import { PCBManager } from '../engine/systems/PCBManager';
import { InteractionManager } from '../engine/interaction/InteractionManager';

export const usePCBEngine = (canvasRef) => {
    const [engine, setEngine] = useState(null);
    const engineRef = useRef(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        // Initialize engine
        const sceneManager = new SceneManager(canvasRef.current);
        const pcbManager = new PCBManager(sceneManager);
        const interactionManager = new InteractionManager(sceneManager, pcbManager);
        const renderLoop = new RenderLoop(sceneManager);

        engineRef.current = {
            sceneManager,
            pcbManager,
            interactionManager,
            renderLoop,
        };

        setEngine(engineRef.current);
        
        // Add uTime update to render loop
        renderLoop.addCallback(() => {
            const time = performance.now() / 1000;
            sceneManager.scene.traverse(child => {
                if (child.material && child.material.uniforms && child.material.uniforms.uTime) {
                    child.material.uniforms.uTime.value = time;
                }
            });
        });

        renderLoop.start();

        // Cleanup routine
        return () => {
            renderLoop.stop();
            interactionManager.dispose();
            pcbManager.dispose();
            sceneManager.dispose();
            engineRef.current = null;
        };
    }, [canvasRef]);

    return engine;
};
