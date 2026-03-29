# WebGLNodeBuilder Commit Group

These commits re-add WebGLNodeBuilder support to three.js r183 (which removed it upstream).
They can be removed as a group if WebGLNodeBuilder is no longer needed.

If removed, also update needle-engine:
- `engine_context.ts:14` - `import { nodeFrame } from "three/examples/jsm/renderers/webgl-legacy/nodes/WebGLNodeBuilder.js"`
- `engine_context.ts:641-645` - `renderer.nodes = { library, modelViewMatrix, modelNormalViewMatrix }`

## Commits (in chronological order on needle/r183)

| Hash | Description |
|------|-------------|
| `3749b00c13` | Revert "Material: Remove obsolete callbacks. (#28702)" - re-adds onBuild callback |
| `542a878c7a` | Partially revert "NodeMaterial: Remove WebGLNodeBuilder (#28167)" - re-adds WebGLNodeBuilder files |
| `3787b6025e` | fix WebGLNodeBuilder and WebGLNodes data |
| `02f201e517` | clean up WebGLNodes and WebGLNodeBuilder, add Nodes to Three.js again |
| `6ba26ac625` | fix WebGLRenderer NodeMaterial regressions (MaterialXLoader import + NodeMaterial getMRT guard) |
| `d24a89e2d8` | fix: only use one nodeFrame instance |
| `395632fac0` | fix: rename reserved keyword "in" to "inValue" in node uniforms |
| `4e1fc6f763` | MaterialX: fix reference path for nodes outside nodegraph |
| `57db85bf72` | WebGLNodeBuilder MathNode.ATAN2 fix (Node exports intentionally skipped) |
| `b105ec8da7` | rename modelViewMatrix node var name to avoid collision with WebGL uniforms |
| `d19c7184e5` | set MaterialXLoader texture name |
| `ca7a96aa04` | comments for WebGLNodeBuilder and Renderer related to Node handling |

## Related commits (touch both WebGLNodeBuilder and other areas)

| Hash | Description | Note |
|------|-------------|------|
| `d58fdd23f5` | linting | Also touches WebXRManager - review before removing |
