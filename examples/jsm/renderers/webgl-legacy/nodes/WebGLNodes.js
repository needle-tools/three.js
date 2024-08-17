import { WebGLNodeBuilder } from './WebGLNodeBuilder.js';
// import { NodeFrame } from '../../../nodes/Nodes.js';
import NodeFrame from '../../../nodes/core/NodeFrame.js';

import { Material } from 'three';

const builders = new WeakMap();
export const nodeFrame = new NodeFrame();

Material.prototype.onBuild = function ( object, parameters, renderer ) {

	const material = this;

	if ( material.isNodeMaterial === true ) {

		let newBuilder;
		try {

			newBuilder = new WebGLNodeBuilder( object, renderer, parameters, material ).build();
			builders.set( material, newBuilder );

		} catch ( e ) {

			console.error( 'Material.prototype.onBuild: ', e );

		}

		// console.log( 'Material.prototype.onBuild: new builder', this, newBuilder );

	}

};

Material.prototype.onBeforeRender = function ( renderer, scene, camera, geometry, object ) {

	const nodeBuilder = builders.get( this );

	// if ( this.isNodeMaterial )
	//	console.log( 'Material.prototype.onBeforeRender', this, nodeBuilder );

	if ( nodeBuilder !== undefined ) {

		nodeFrame.material = this;
		nodeFrame.camera = camera;
		nodeFrame.object = object;
		nodeFrame.renderer = renderer;
		nodeFrame.scene = scene;
		nodeFrame.geometry = geometry;

		const updateNodes = nodeBuilder.updateNodes;

		if ( updateNodes.length > 0 ) {

			// force refresh material uniforms
			renderer.state.useProgram( null );

			//this.uniformsNeedUpdate = true;

			for ( const node of updateNodes ) {

				nodeFrame.updateNode( node );

			}

		}

	}

};
