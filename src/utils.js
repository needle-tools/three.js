import { resolveObjectURL } from 'node:buffer';

function arrayMin( array ) {

	if ( array.length === 0 ) return Infinity;

	let min = array[ 0 ];

	for ( let i = 1, l = array.length; i < l; ++ i ) {

		if ( array[ i ] < min ) min = array[ i ];

	}

	return min;

}

function arrayMax( array ) {

	if ( array.length === 0 ) return - Infinity;

	let max = array[ 0 ];

	for ( let i = 1, l = array.length; i < l; ++ i ) {

		if ( array[ i ] > max ) max = array[ i ];

	}

	return max;

}

function arrayNeedsUint32( array ) {

	// assumes larger values usually on last

	for ( let i = array.length - 1; i >= 0; -- i ) {

		if ( array[ i ] >= 65535 ) return true; // account for PRIMITIVE_RESTART_FIXED_INDEX, #24565

	}

	return false;

}

const TYPED_ARRAYS = {
	Int8Array: Int8Array,
	Uint8Array: Uint8Array,
	Uint8ClampedArray: Uint8ClampedArray,
	Int16Array: Int16Array,
	Uint16Array: Uint16Array,
	Int32Array: Int32Array,
	Uint32Array: Uint32Array,
	Float32Array: Float32Array,
	Float64Array: Float64Array
};

function getTypedArray( type, buffer ) {

	return new TYPED_ARRAYS[ type ]( buffer );

}

// HACK Mock data structure to hold image bytes to pass through to exporters
class MockImage extends EventTarget {

	constructor( name ) {

		super();
		this.name = name;
		this.hasArrayBuffer = true;
	}

	// setter for src url
	set src( url ) {
		this.url = url;
		this.blob = resolveObjectURL(url);
		this.dispatchEvent( new Event("load") );

	}

	async getArrayBuffer() {
		// console.log(this.url, this.blob);
		const arrayBuffer = await this.blob.arrayBuffer();
		return arrayBuffer;
	}

}

function createElementNS( name ) {

	if (typeof document === 'undefined') {
		return new MockImage( name );
	}
	return document.createElementNS( 'http://www.w3.org/1999/xhtml', name );

}

const _cache = {};

function warnOnce( message ) {

	if ( message in _cache ) return;

	_cache[ message ] = true;

	console.warn( message );

}

export { arrayMin, arrayMax, arrayNeedsUint32, getTypedArray, createElementNS, warnOnce };
