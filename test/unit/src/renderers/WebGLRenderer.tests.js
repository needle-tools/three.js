import { BoxGeometry, Mesh, MeshBasicMaterial, PerspectiveCamera, Scene, WebGLRenderer } from '../../../../src/Three.js';

QUnit.module( 'WebGLRenderer', () => {

	QUnit.test( 'compiles and renders materials with or without the legacy build hook', ( assert ) => {

		const renderer = new WebGLRenderer();
		const scene = new Scene();
		const camera = new PerspectiveCamera();
		const geometry = new BoxGeometry();
		const material = new MeshBasicMaterial();
		const hooked = new MeshBasicMaterial();
		let compiled = 0;
		let built = 0;

		// Upstream Three.js materials do not provide the legacy hook.
		material.onBuild = undefined;
		material.onBeforeCompile = () => compiled ++;
		hooked.onBuild = () => built ++;
		camera.position.z = 3;
		scene.add( new Mesh( geometry, material ), new Mesh( geometry, hooked ) );
		renderer.setSize( 8, 8, false );

		try {

			renderer.render( scene, camera );
			assert.strictEqual( compiled, 1, 'The material without onBuild uses the normal shader compilation hook.' );
			assert.strictEqual( built, 1, 'Materials with onBuild still receive the hook.' );
			assert.strictEqual( renderer.info.render.calls, 2, 'Both meshes render.' );

		} finally {

			material.dispose();
			hooked.dispose();
			geometry.dispose();
			renderer.dispose();

		}

	} );

} );
