export * from './Three.Core.js';

export { WebGLRenderer } from './renderers/WebGLRenderer.js';
export { WebGLCubeRenderTarget } from './renderers/WebGLCubeRenderTarget.js';
export { ShaderLib } from './renderers/shaders/ShaderLib.js';
export { UniformsLib } from './renderers/shaders/UniformsLib.js';
export { UniformsUtils } from './renderers/shaders/UniformsUtils.js';
export { ShaderChunk } from './renderers/shaders/ShaderChunk.js';
export { PMREMGenerator } from './extras/PMREMGenerator.js';
export { WebGLUtils } from './renderers/webgl/WebGLUtils.js';
export * from './nodes/Nodes.js';
<<<<<<< HEAD
=======
export { createCanvasElement } from './utils.js';
export * from './constants.js';
export * from './Three.Legacy.js';
export * from './nodes/Nodes.js';

if ( typeof __THREE_DEVTOOLS__ !== 'undefined' ) {

	__THREE_DEVTOOLS__.dispatchEvent( new CustomEvent( 'register', { detail: {
		revision: REVISION,
	} } ) );

}

if ( typeof window !== 'undefined' ) {

	try {

		if ( import.meta ) {

			if ( ! window.__THREE__IMPORTS__) window.__THREE__IMPORTS__ = [];
			window.__THREE__IMPORTS__.push( { url: import.meta.url, revision: REVISION } );

		}

	} catch { }

	if ( window.__THREE__ ) {

		console.warn( 'WARNING: Multiple instances of Three.js being imported. Existing: ' + window.__THREE__ + ', new: ' + REVISION );
		console.warn( window.__THREE__IMPORTS__ );

	} else {

		window.__THREE__ = REVISION;

	}

}
>>>>>>> 877f111812 (clean up WebGLNodes and WebGLNodeBuilder, add Nodes to Three.js again)
