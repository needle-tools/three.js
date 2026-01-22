import { WebGLCoordinateSystem } from '../constants.js';
import { Matrix4 } from '../math/Matrix4.js';
import { Object3D } from '../core/Object3D.js';
import { Vector3 } from '../math/Vector3.js';
import { Quaternion } from '../math/Quaternion.js';

const _position = /*@__PURE__*/ new Vector3();
const _quaternion = /*@__PURE__*/ new Quaternion();
const _scale = /*@__PURE__*/ new Vector3();

class Camera extends Object3D {

	constructor() {

		super();

		this.isCamera = true;

		this.type = 'Camera';

		this.matrixWorldInverse = new Matrix4();

		this.projectionMatrix = new Matrix4();
		this.projectionMatrixInverse = new Matrix4();

		this.coordinateSystem = WebGLCoordinateSystem;

	}

	copy( source, recursive ) {

		super.copy( source, recursive );

		this.matrixWorldInverse.copy( source.matrixWorldInverse );

		this.projectionMatrix.copy( source.projectionMatrix );
		this.projectionMatrixInverse.copy( source.projectionMatrixInverse );

		this.coordinateSystem = source.coordinateSystem;

		return this;

	}

	getWorldDirection( target ) {

		return super.getWorldDirection( target ).negate();

	}

	updateMatrixWorld( force ) {

		super.updateMatrixWorld( force );

		// exclude scale from view matrix to be glTF conform

		this.matrixWorld.decompose( _position, _quaternion, _scale );

		if ( _scale.x === 1 && _scale.y === 1 && _scale.z === 1 ) {

			this.matrixWorldInverse.copy( this.matrixWorld ).invert();

		} else {

			this.matrixWorldInverse.compose( _position, _quaternion, _scale.set( 1, 1, 1 ) ).invert();

		}

	}

	updateWorldMatrix( updateParents, updateChildren ) {

		super.updateWorldMatrix( updateParents, updateChildren );

		// exclude scale from view matrix to be glTF conform

		this.matrixWorld.decompose( _position, _quaternion, _scale );

		if ( _scale.x === 1 && _scale.y === 1 && _scale.z === 1 ) {

			this.matrixWorldInverse.copy( this.matrixWorld ).invert();

		} else {

			this.matrixWorldInverse.compose( _position, _quaternion, _scale.set( 1, 1, 1 ) ).invert();

		}

	}

	clone() {

		return new this.constructor().copy( this );

	}

}

export { Camera };
