# PCB Viewer Project

Hey! This is a 3D PCB viewer built with React and Three.js. I've been working on making it look smooth and handle complex boards without lagging. Here’s the lowdown on how I handled the tricky bits.

## 🚀 Speeding things up: How I handle thousands of Pads

Initially, if you just throw 1,000 separate circular meshes into a scene, the browser starts crying. Every single one is a "draw call" that the CPU has to send to the GPU, and it adds up fast.

To fix this, I used **GPU Instancing** (specifically `InstancedMesh`).
Instead of saying "Draw this circle 1000 times," I say "Here is one circle geometry and a giant list of 1000 positions/scales. Go nuts."
The GPU handles the duplication in a single pass.

I even moved the hover and selection highlights into "Instance Attributes." This means I don't need a unique material for every pad—they all share one "Copper Shader" but know individually if they should be glowing or orange based on a tiny flag I pass to the GPU.

## 🎨 Dealing with the "Flickering" (Z-Fighting)

When you have two flat things (like a copper trace and the green board) at the exact same height, the GPU gets confused about which one is on top. You get this ugly flickering mess called Z-fighting.

Here's my "multi-layer" approach to stop that:

1.  **Physical Offsets**: Traces are actually moved up by about `0.05` units and pads by `0.05`. It's tiny, but it's enough to tell the GPU "this is definitely in front."
2.  **Polygon Offsets**: In the materials, I use `polygonOffset`. This is a GPU trick that says "even if these are at the same depth, nudge this one a bit closer to the screen."
3.  **Board Recess**: I physically lowered the board substrate to `-0.05` so the top surface of the board and the bottom of the pads have a clear "air gap."
4.  **Shader Magic**: The custom shader handles the outlines and "brushed" effect locally, so we don't need extra geometry just for the edges, which further reduces overlapping surfaces.

## 🛠 Features

- **Real Through-Holes**: These aren't just black circles; I'm actually cutting the board geometry using `ExtrudeGeometry` with shapes, so you can see right through the board.
- **Copper Shader**: Procedural brushed metal effect + high-contrast outlines for a professional look.
- **Interactive**: Hover to highlight, click to select/move, and delete components directly.
- **Export/Import**: Everything saves to a standard JSON format.

Enjoy poking around the board!
