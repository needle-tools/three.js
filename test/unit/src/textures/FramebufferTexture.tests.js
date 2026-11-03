import { FramebufferTexture } from '../../../../src/textures/FramebufferTexture.js';

import { Texture } from '../../../../src/textures/Texture.js';

export default QUnit.module( 'Textures', () => {

	QUnit.module( 'FramebufferTexture', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new FramebufferTexture();
			assert.strictEqual(
				object instanceof Texture, true,
				'FramebufferTexture extends from Texture'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new FramebufferTexture();
			assert.ok( object, 'Can instantiate a FramebufferTexture.' );

		} );

		// PUBLIC
		QUnit.test( 'isFramebufferTexture', ( assert ) => {

			const object = new FramebufferTexture();
			assert.ok(
				object.isFramebufferTexture,
				'FramebufferTexture.isFramebufferTexture should be true'
			);

		} );

		QUnit.test( 'clone keeps framebuffer dimensions independent', ( assert ) => {

			const original = new FramebufferTexture( 1182, 1434 );
			original.generateMipmaps = true;
			const left = original.clone();
			const right = original.clone();

			left.image.width = 776;
			left.image.height = 1436;

			assert.deepEqual( original.image, { width: 1182, height: 1434 }, 'Resizing a clone leaves the original dimensions intact.' );
			assert.deepEqual( right.image, { width: 1182, height: 1434 }, 'Each preview keeps its own dimensions.' );
			assert.strictEqual( left.generateMipmaps, true, 'Texture sampling settings are retained.' );

		} );

		QUnit.test( 'copy keeps framebuffer dimensions independent', ( assert ) => {

			const original = new FramebufferTexture( 64, 32 );
			const texture = new FramebufferTexture( 16, 8 );

			assert.strictEqual( texture.copy( original ), texture, 'copy remains chainable.' );
			original.image.width = 128;
			original.image.height = 96;
			assert.deepEqual( texture.image, { width: 64, height: 32 }, 'Changing the original does not resize its copy.' );

			texture.copy( original );
			texture.image.width = 256;
			assert.deepEqual( original.image, { width: 128, height: 96 }, 'Copying again does not restore shared dimensions.' );

		} );

	} );

} );
