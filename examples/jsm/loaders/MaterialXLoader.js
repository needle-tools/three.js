import {
	FileLoader, Loader, ImageBitmapLoader, Texture, RepeatWrapping, MeshBasicNodeMaterial,
	MeshPhysicalNodeMaterial, DoubleSide, AttributeNode,
} from 'three/webgpu';

import {
	float, bool, int, vec2, vec3, vec4, color, texture, uniform,
	positionLocal, positionWorld, uv, vertexColor,
	normalLocal, normalWorld, tangentLocal, tangentWorld, bitangentLocal, bitangentWorld,
	mul, abs, sign, floor, ceil, round, sin, cos, tan,
	asin, acos, sqrt, exp, clamp, min, max, normalize, length, dot, cross, normalMap,
	remap, smoothstep, luminance, mx_rgbtohsv, mx_hsvtorgb,
	mix, saturation, transpose, determinant, inverse, log, reflect, refract, element,
	mx_ramplr, mx_ramptb, mx_splitlr, mx_splittb,
	mx_fractal_noise_float, mx_noise_float, mx_cell_noise_float, mx_worley_noise_float,
	mx_transform_uv,
	mx_safepower, mx_contrast,
	mx_srgb_texture_to_lin_rec709,
	mx_add, mx_atan2, mx_divide, mx_multiply, mx_power, mx_subtract,
	mx_timer, mx_frame, mat2, mat3, mat4, mx_ramp4, mx_modulo,
	mx_invert, distance,
	mx_separate, mx_place2d, mx_rotate2d, mx_rotate3d, mx_heighttonormal,
	mx_clamp, mx_smoothstep, mx_divide_by_zero, mx_checkerboard, mx_overlay, mx_hsvadjust,
	mx_transform_vector, mx_transform_point, mx_facingratio,
	mx_combine2, mx_combine3, mx_combine4,
	mx_ifgreater, mx_ifgreatereq, mx_ifequal, mx_ifequal_compare_inputs,
	mx_unifiednoise2d, mx_unifiednoise3d,
	mx_grid, mx_crosshatch, mx_tiledcircles, mx_randomfloat, mx_latlongimage,
	mx_gooch_shade,
	mx_tiledhexagons, mx_tiledcloverleafs, mx_screen, mx_plus, mx_range, mx_trianglewave,
	mx_randomcolor, mx_colorcorrect, mx_passthrough, mx_not, mx_minus, mx_unpremult,
	mx_xor, mx_blur, mx_ramp, mx_ramp_gradient, mx_g22_ap1_to_lin_rec709,
	mx_g22_rec709_to_lin_rec709, mx_rec709_display_to_lin_rec709, mx_UsdTransform2d,
	mx_fract, mx_dodge, mx_burn, mx_matte, mx_mask, mx_outside, mx_line,
	mx_difference, mx_inside, mx_in, mx_out, mx_cloverleaf,
	mx_disjointover, mx_circle, mx_hexagon, mx_g18_rec709_to_lin_rec709,
	mx_acescg_to_lin_rec709, mx_lin_displayp3_to_lin_rec709, mx_srgb_displayp3_to_lin_rec709,
	mx_lin_adobergb_to_lin_rec709, mx_adobergb_to_lin_rec709, mx_premult, mx_over, mx_open_pbr_anisotropy,
	mx_blackbody, cameraPosition
} from 'three/tsl';

import 'three/examples/jsm/renderers/webgl-legacy/nodes/WebGLNodes.js';

const colorSpaceLib = {
	mx_srgb_texture_to_lin_rec709,
	mx_acescg_to_lin_rec709,
	mx_lin_displayp3_to_lin_rec709,
	mx_srgb_displayp3_to_lin_rec709,
	mx_lin_adobergb_to_lin_rec709,
	mx_adobergb_to_lin_rec709,
	mx_rec709_display_to_lin_rec709,
	mx_g22_ap1_to_lin_rec709,
	mx_g18_rec709_to_lin_rec709,
	mx_g22_rec709_to_lin_rec709
};

class MXElement {

	constructor( name, nodeFunc, params = [] ) {

		this.name = name;
		this.nodeFunc = nodeFunc;
		this.params = params;

	}

}

class FallbackAttributeNode extends AttributeNode {

	constructor( attributeName, nodeType, fallbackNode ) {

		super( attributeName, nodeType );
		this.fallbackNode = fallbackNode;

	}

	generate( builder ) {

		if ( builder.hasGeometryAttribute( this.getAttributeName( builder ) ) ) {

			return super.generate( builder );

		}

		return this.fallbackNode.build( builder, this.getNodeType( builder ) );

	}

}

// Ref: https://github.com/mrdoob/three.js/issues/24674

// Enhanced separate node to support multi-output referencing (outx, outy, outz, outw)

// Type/arity-aware MaterialX node wrappers

const MXElements = [

	// << Math >>
	new MXElement( 'add', mx_add, [ 'in1', 'in2' ] ),
	new MXElement( 'subtract', mx_subtract, [ 'in1', 'in2' ] ),
	new MXElement( 'multiply', mx_multiply, [ 'in1', 'in2' ] ),
	new MXElement( 'divide', mx_divide, [ 'in1', 'in2' ] ),
	new MXElement( 'modulo', mx_modulo, [ 'in1', 'in2' ] ),
	new MXElement( 'absval', abs, [ 'in' ] ),
	new MXElement( 'dot', mx_passthrough, [ 'in' ] ),
	new MXElement( 'sign', sign, [ 'in' ] ),
	new MXElement( 'floor', floor, [ 'in1', 'in2' ] ),
	new MXElement( 'ceil', ceil, [ 'in1', 'in2' ] ),
	new MXElement( 'round', round, [ 'in' ] ),
	new MXElement( 'power', mx_power, [ 'in1', 'in2' ] ),
	new MXElement( 'sin', sin, [ 'in' ] ),
	new MXElement( 'cos', cos, [ 'in' ] ),
	new MXElement( 'tan', tan, [ 'in' ] ),
	new MXElement( 'asin', asin, [ 'in' ] ),
	new MXElement( 'acos', acos, [ 'in' ] ),
	new MXElement( 'atan2', mx_atan2, [ 'in1', 'in2' ] ),
	new MXElement( 'sqrt', sqrt, [ 'in' ] ),
	new MXElement( 'ln', log, [ 'in' ] ),
	new MXElement( 'exp', exp, [ 'in' ] ),
	new MXElement( 'clamp', clamp, [ 'in', 'low', 'high' ] ),
	new MXElement( 'min', min, [ 'in1', 'in2' ] ),
	new MXElement( 'max', max, [ 'in1', 'in2' ] ),
	new MXElement( 'fract', mx_fract, [ 'in' ] ),
	new MXElement( 'normalize', normalize, [ 'in' ] ),
	new MXElement( 'magnitude', length, [ 'in' ] ),
	new MXElement( 'dotproduct', dot, [ 'in1', 'in2' ] ),
	new MXElement( 'crossproduct', cross, [ 'in' ] ),
	new MXElement( 'distance', distance, [ 'in1', 'in2' ] ),
	new MXElement( 'invert', mx_invert, [ 'in', 'amount' ] ),
	//new MtlXElement( 'transformpoint', ... ),
	//new MtlXElement( 'transformvector', ... ),
	//new MtlXElement( 'transformnormal', ... ),
	new MXElement( 'normalmap', normalMap, [ 'in', 'scale' ] ),
	new MXElement( 'transpose', transpose, [ 'in' ] ),
	new MXElement( 'determinant', determinant, [ 'in' ] ),
	new MXElement( 'invertmatrix', inverse, [ 'in' ] ),
	new MXElement( 'creatematrix', mat3, [ 'in1', 'in2', 'in3' ] ),
	//new MtlXElement( 'rotate2d', rotateUV, [ 'in', radians( 'amount' )** ] ),
	//new MtlXElement( 'rotate3d', ... ),
	//new MtlXElement( 'arrayappend', ... ),
	//new MtlXElement( 'dot', ... ),

	new MXElement( 'length', length, [ 'in' ] ),
	new MXElement( 'crossproduct', cross, [ 'in1', 'in2' ] ),
	new MXElement( 'floor', floor, [ 'in' ] ),
	new MXElement( 'ceil', ceil, [ 'in' ] ),

	// << Adjustment >>
	new MXElement( 'remap', remap, [ 'in', 'inlow', 'inhigh', 'outlow', 'outhigh' ] ),
	new MXElement( 'smoothstep', smoothstep, [ 'in', 'low', 'high' ] ),
	//new MtlXElement( 'curveadjust', ... ),
	//new MtlXElement( 'curvelookup', ... ),
	new MXElement( 'luminance', luminance, [ 'in', 'lumacoeffs' ] ),
	new MXElement( 'rgbtohsv', mx_rgbtohsv, [ 'in' ] ),
	new MXElement( 'hsvtorgb', mx_hsvtorgb, [ 'in' ] ),

	// << Mix >>
	new MXElement( 'mix', mix, [ 'bg', 'fg', 'mix' ] ),

	// << Channel >>
	new MXElement( 'combine2', mx_combine2, [ 'in1', 'in2' ] ),
	new MXElement( 'combine3', mx_combine3, [ 'in1', 'in2', 'in3' ] ),
	new MXElement( 'combine4', mx_combine4, [ 'in1', 'in2', 'in3', 'in4' ] ),

	// << Procedural >>
	new MXElement( 'ramplr', mx_ramplr, [ 'valuel', 'valuer', 'texcoord' ] ),
	new MXElement( 'ramptb', mx_ramptb, [ 'valuet', 'valueb', 'texcoord' ] ),
	new MXElement( 'ramp4', mx_ramp4, [ 'valuetl', 'valuetr', 'valuebl', 'valuebr', 'texcoord' ] ),
	new MXElement( 'splitlr', mx_splitlr, [ 'valuel', 'valuer', 'center', 'texcoord' ] ),
	new MXElement( 'splittb', mx_splittb, [ 'valuet', 'valueb', 'center', 'texcoord' ] ),
	new MXElement( 'noise2d', mx_noise_float, [ 'texcoord', 'amplitude', 'pivot' ] ),
	new MXElement( 'noise3d', mx_noise_float, [ 'position', 'amplitude', 'pivot' ] ),
	new MXElement( 'fractal2d', mx_fractal_noise_float, [ 'texcoord', 'octaves', 'lacunarity', 'diminish', 'amplitude' ] ),
	new MXElement( 'fractal3d', mx_fractal_noise_float, [ 'position', 'octaves', 'lacunarity', 'diminish', 'amplitude' ] ),
	new MXElement( 'cellnoise2d', mx_cell_noise_float, [ 'texcoord' ] ),
	new MXElement( 'cellnoise3d', mx_cell_noise_float, [ 'position' ] ),
	new MXElement( 'worleynoise2d', mx_worley_noise_float, [ 'texcoord', 'jitter', 'style' ] ),
	new MXElement( 'worleynoise3d', mx_worley_noise_float, [ 'position', 'jitter', 'style' ] ),
	new MXElement( 'unifiednoise2d', mx_unifiednoise2d, [ 'type', 'texcoord', 'freq', 'offset', 'jitter', 'outmin', 'outmax', 'clampoutput', 'octaves', 'lacunarity', 'diminish' ] ),
	new MXElement( 'unifiednoise3d', mx_unifiednoise3d, [ 'type', 'position', 'freq', 'offset', 'jitter', 'outmin', 'outmax', 'clampoutput', 'octaves', 'lacunarity', 'diminish' ] ),
	new MXElement( 'grid', mx_grid, [ 'texcoord', 'uvtiling', 'thickness', 'staggered' ] ),
	new MXElement( 'crosshatch', mx_crosshatch, [ 'texcoord', 'uvtiling', 'thickness', 'staggered' ] ),
	new MXElement( 'tiledcircles', mx_tiledcircles, [ 'texcoord', 'uvtiling', 'uvoffset', 'size', 'staggered' ] ),
	new MXElement( 'tiledhexagons', mx_tiledhexagons, [ 'texcoord', 'uvtiling', 'uvoffset', 'size', 'staggered' ] ),
	new MXElement( 'tiledcloverleafs', mx_tiledcloverleafs, [ 'texcoord', 'uvtiling', 'uvoffset', 'size', 'staggered' ] ),
	new MXElement( 'randomfloat', mx_randomfloat, [ 'in', 'min', 'max', 'seed' ] ),
	new MXElement( 'randomcolor', mx_randomcolor, [ 'in', 'huelow', 'huehigh', 'saturationlow', 'saturationhigh', 'brightnesslow', 'brightnesshigh', 'seed' ] ),
	new MXElement( 'latlongimage', mx_latlongimage, [ 'default', 'viewdir', 'rotation' ] ),
	new MXElement( 'gooch_shade', mx_gooch_shade, [ 'warm_color', 'cool_color', 'specular_intensity', 'shininess', 'light_direction', 'normal', 'viewdirection' ] ),
	new MXElement( 'range', mx_range, [ 'in', 'inlow', 'inhigh', 'gamma', 'outlow', 'outhigh', 'doclamp' ] ),
	new MXElement( 'trianglewave', mx_trianglewave, [ 'in' ] ),
	new MXElement( 'colorcorrect', mx_colorcorrect, [ 'in', 'hue', 'saturation', 'gamma', 'lift', 'gain', 'contrast', 'contrastpivot', 'exposure' ] ),
	new MXElement( 'screen', mx_screen, [ 'bg', 'fg', 'mix' ] ),
	new MXElement( 'plus', mx_plus, [ 'bg', 'fg', 'mix' ] ),
	new MXElement( 'minus', mx_minus, [ 'bg', 'fg', 'mix' ] ),
	new MXElement( 'difference', mx_difference, [ 'bg', 'fg', 'mix' ] ),
	new MXElement( 'dodge', mx_dodge, [ 'bg', 'fg', 'mix' ] ),
	new MXElement( 'burn', mx_burn, [ 'bg', 'fg', 'mix' ] ),
	new MXElement( 'in', mx_in, [ 'bg', 'fg', 'mix' ] ),
	new MXElement( 'out', mx_out, [ 'bg', 'fg', 'mix' ] ),
	new MXElement( 'over', mx_over, [ 'bg', 'fg', 'mix' ] ),
	new MXElement( 'disjointover', mx_disjointover, [ 'bg', 'fg', 'mix' ] ),
	new MXElement( 'matte', mx_matte, [ 'bg', 'fg', 'mix' ] ),
	new MXElement( 'mask', mx_mask, [ 'bg', 'fg', 'mix' ] ),
	new MXElement( 'inside', mx_inside, [ 'in', 'mask' ] ),
	new MXElement( 'outside', mx_outside, [ 'in', 'mask' ] ),
	new MXElement( 'premult', mx_premult, [ 'in' ] ),
	new MXElement( 'unpremult', mx_unpremult, [ 'in' ] ),
	new MXElement( 'blur', mx_blur, [ 'in', 'size' ] ),
	new MXElement( 'srgb_texture_to_lin_rec709', mx_srgb_texture_to_lin_rec709, [ 'in' ] ),
	new MXElement( 'rec709_display_to_lin_rec709', mx_rec709_display_to_lin_rec709, [ 'in' ] ),
	new MXElement( 'acescg_to_lin_rec709', mx_acescg_to_lin_rec709, [ 'in' ] ),
	new MXElement( 'lin_displayp3_to_lin_rec709', mx_lin_displayp3_to_lin_rec709, [ 'in' ] ),
	new MXElement( 'srgb_displayp3_to_lin_rec709', mx_srgb_displayp3_to_lin_rec709, [ 'in' ] ),
	new MXElement( 'lin_adobergb_to_lin_rec709', mx_lin_adobergb_to_lin_rec709, [ 'in' ] ),
	new MXElement( 'adobergb_to_lin_rec709', mx_adobergb_to_lin_rec709, [ 'in' ] ),
	new MXElement( 'g22_ap1_to_lin_rec709', mx_g22_ap1_to_lin_rec709, [ 'in' ] ),
	new MXElement( 'g18_rec709_to_lin_rec709', mx_g18_rec709_to_lin_rec709, [ 'in' ] ),
	new MXElement( 'g22_rec709_to_lin_rec709', mx_g22_rec709_to_lin_rec709, [ 'in' ] ),
	// << Supplemental >>
	//new MtlXElement( 'tiledimage', ... ),
	//new MtlXElement( 'triplanarprojection', triplanarTextures, [ 'filex', 'filey', 'filez' ] ),
	//new MtlXElement( 'ramp4', ... ),
	new MXElement( 'place2d', mx_place2d, [ 'texcoord', 'pivot', 'scale', 'rotate', 'offset', 'operationorder' ] ),
	new MXElement( 'safepower', mx_safepower, [ 'in1', 'in2' ] ),
	new MXElement( 'contrast', mx_contrast, [ 'in', 'amount', 'pivot' ] ),
	//new MtlXElement( 'hsvadjust', ... ),
	new MXElement( 'saturate', saturation, [ 'in', 'amount' ] ),
	new MXElement( 'extract', element, [ 'in', 'index' ] ),
	new MXElement( 'separate2', mx_separate, [ 'in' ] ),
	new MXElement( 'separate3', mx_separate, [ 'in' ] ),
	new MXElement( 'separate4', mx_separate, [ 'in' ] ),
	new MXElement( 'reflect', reflect, [ 'in', 'normal' ] ),
	new MXElement( 'refract', refract, [ 'in', 'normal', 'ior' ] ),
	new MXElement( 'time', mx_timer ),
	new MXElement( 'frame', mx_frame ),
	new MXElement( 'ifgreater', mx_ifgreater, [ 'value1', 'value2', 'in1', 'in2' ] ),
	new MXElement( 'ifgreatereq', mx_ifgreatereq, [ 'value1', 'value2', 'in1', 'in2' ] ),
	new MXElement( 'ifequal', mx_ifequal, [ 'value1', 'value2', 'in1', 'in2' ] ),
	new MXElement( 'not', mx_not, [ 'in' ] ),
	new MXElement( 'xor', mx_xor, [ 'in1', 'in2' ] ),

	// Placeholder implementations for unsupported nodes
	new MXElement( 'rotate2d', mx_rotate2d, [ 'in', 'amount' ] ),
	new MXElement( 'rotate3d', mx_rotate3d, [ 'in', 'amount', 'axis' ] ),
	new MXElement( 'heighttonormal', mx_heighttonormal, [ 'in', 'scale', 'texcoord' ] ),
	new MXElement( 'bump', mx_heighttonormal, [ 'height', 'scale', 'texcoord' ] ),
	new MXElement( 'ramp_gradient', mx_ramp_gradient, [ 'x', 'interval1', 'interval2', 'color1', 'color2', 'interpolation', 'prev_color', 'interval_num', 'num_intervals' ] ),
	new MXElement( 'ramp', mx_ramp, [ 'texcoord', 'type', 'interpolation', 'num_intervals', 'interval1', 'color1', 'interval2', 'color2', 'interval3', 'color3', 'interval4', 'color4', 'interval5', 'color5', 'interval6', 'color6', 'interval7', 'color7', 'interval8', 'color8', 'interval9', 'color9', 'interval10', 'color10' ] ),
	new MXElement( 'circle', mx_circle, [ 'texcoord', 'center', 'radius' ] ),
	new MXElement( 'line', mx_line, [ 'texcoord', 'center', 'radius', 'point1', 'point2' ] ),
	new MXElement( 'cloverleaf', mx_cloverleaf, [ 'texcoord', 'center', 'radius' ] ),
	new MXElement( 'hexagon', mx_hexagon, [ 'texcoord', 'center', 'radius' ] ),
	new MXElement( 'open_pbr_anisotropy', mx_open_pbr_anisotropy, [ 'roughness', 'anisotropy' ] ),
	new MXElement( 'blackbody', mx_blackbody, [ 'temperature' ] ),
	new MXElement( 'UsdTransform2d', mx_UsdTransform2d, [ 'in', 'rotation', 'scale', 'translation' ] ),

];

const MtlXLibrary = {};
MXElements.forEach( element => MtlXLibrary[ element.name ] = element );

const closureDataTypes = new Set( [ 'BSDF', 'EDF', 'VDF', 'surfaceshader', 'volumeshader', 'lightshader' ] );

const closureElements = new Set( [
	'oren_nayar_diffuse_bsdf', 'burley_diffuse_bsdf', 'translucent_bsdf', 'dielectric_bsdf',
	'conductor_bsdf', 'generalized_schlick_bsdf', 'subsurface_bsdf', 'sheen_bsdf', 'chiang_hair_bsdf',
	'uniform_edf', 'conical_edf', 'measured_edf', 'generalized_schlick_edf',
	'absorption_vdf', 'anisotropic_vdf', 'disney_principled',
	'LamaDiffuse', 'LamaTranslucent', 'LamaSSS', 'LamaSheen', 'LamaConductor',
	'LamaDielectric', 'LamaGeneralizedSchlick', 'LamaIridescence', 'LamaEmission',
	'LamaAdd', 'LamaMix', 'LamaLayer', 'LamaSurface',
	'light', 'point_light', 'directional_light', 'spot_light'
] );

const getNodeSpace = ( node ) => {

	const spaceInput = node.getChildByName( 'space' );
	return node.getAttribute( 'space' ) || ( spaceInput ? spaceInput.value : null );

};

const getVectorTypeDefault = ( type ) => {

	if ( type === 'color3' ) return color( 0, 0, 0 );
	if ( type === 'color4' ) return vec4( 0, 0, 0, 0 );
	if ( type === 'vector2' ) return vec2( 0, 0 );
	if ( type === 'vector3' ) return vec3( 0, 0, 0 );
	if ( type === 'vector4' ) return vec4( 0, 0, 0, 0 );
	if ( type === 'integer' ) return int( 0 );
	if ( type === 'boolean' ) return bool( false );
	if ( type === 'matrix33' ) return mat3( 1, 0, 0, 0, 1, 0, 0, 0, 1 );
	if ( type === 'matrix44' ) return mat4( 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 );

	return float( 0 );

};

const getTextureColorSpaceNode = ( node ) => {

	const csSource = node.getAttribute( 'colorspace' );
	const csTarget = node.getRoot().getAttribute( 'colorspace' );

	return colorSpaceLib[ `mx_${ csSource }_to_${ csTarget }` ];

};

/**
 * A loader for the MaterialX format.
 *
 * The node materials loaded with this loader can only be used with {@link WebGPURenderer}.
 *
 * ```js
 * const loader = new MaterialXLoader().setPath( SAMPLE_PATH );
 * const materials = await loader.loadAsync( 'standard_surface_brass_tiled.mtlx' );
 * ```
 *
 * @augments Loader
 * @three_import import { MaterialXLoader } from 'three/addons/loaders/MaterialXLoader.js';
 */
class MaterialXLoader extends Loader {

	/**
	 * Constructs a new MaterialX loader.
	 *
	 * @param {LoadingManager} [manager] - The loading manager.
	 */
	constructor( manager ) {

		super( manager );
		this.textureFlipY = true;
		this.texCoordFlipY = false;

	}

	setTextureFlipY( flipY ) {

		this.textureFlipY = flipY;
		return this;

	}

	setTexCoordFlipY( flipY ) {

		this.texCoordFlipY = flipY;
		return this;

	}

	/**
	 * Starts loading from the given URL and passes the loaded MaterialX asset
	 * to the `onLoad()` callback.
	 *
	 * @param {string} url - The path/URL of the file to be loaded. This can also be a data URI.
	 * @param {function(Object<string,NodeMaterial>)} onLoad - Executed when the loading process has been finished.
	 * @param {onProgressCallback} onProgress - Executed while the loading is in progress.
	 * @param {onErrorCallback} onError - Executed when errors occur.
	 * @return {MaterialXLoader} A reference to this loader.
	 */
	load( url, onLoad, onProgress, onError ) {

		const _onError = function ( e ) {

			if ( onError ) {

				onError( e );

			} else {

				console.error( e );

			}

		};

		new FileLoader( this.manager )
			.setPath( this.path )
			.load( url, async ( text ) => {

				try {

					onLoad( this.parse( text ) );

				} catch ( e ) {

					_onError( e );

				}

			}, onProgress, _onError );

		return this;

	}

	/**
	 * Parses the given MaterialX data and returns the resulting materials.
	 *
	 * Supported standard_surface inputs:
	 * - base, base_color: Base color/albedo
	 * - opacity: Alpha/transparency
	 * - specular_roughness: Surface roughness
	 * - metalness: Metallic property
	 * - specular: Specular reflection intensity
	 * - specular_color: Specular reflection color
	 * - ior: Index of refraction
	 * - specular_anisotropy, specular_rotation: Anisotropic reflection
	 * - transmission, transmission_color: Transmission properties
	 * - thin_film_thickness, thin_film_ior: Thin film interference
	 * - sheen, sheen_color, sheen_roughness: Sheen properties
	 * - normal: Normal map
	 * - coat, coat_roughness, coat_color: Clearcoat properties
	 * - emission, emissionColor: Emission properties
	 *
	 * @param {string} text - The raw MaterialX data as a string.
	 * @return {Object<string,NodeMaterial>} A dictionary holding the parse node materials.
	 */
	parse( text ) {

		return new MaterialX( this.manager, this.path, this.textureFlipY, this.texCoordFlipY ).parse( text );

	}

}

class MaterialXNode {

	constructor( materialX, nodeXML, nodePath = '' ) {

		if ( ! materialX || typeof materialX !== 'object' ) {

			console.warn( 'MaterialXNode: materialX argument is not an object!', { materialX, nodeXML, nodePath } );

		}

		this.materialX = materialX;
		this.nodeXML = nodeXML;
		this.nodePath = nodePath ? nodePath + '/' + this.name : this.name;

		this.parent = null;

		this.node = null;
		this.nodeOutputs = new Map();

		this.children = [];

	}

	get element() {

		return this.nodeXML.nodeName;

	}

	get nodeGraph() {

		return this.getAttribute( 'nodegraph' );

	}

	get nodeName() {

		return this.getAttribute( 'nodename' );

	}

	get interfaceName() {

		return this.getAttribute( 'interfacename' );

	}

	get output() {

		return this.getAttribute( 'output' );

	}

	get name() {

		return this.getAttribute( 'name' );

	}

	get type() {

		return this.getAttribute( 'type' );

	}

	get value() {

		return this.getAttribute( 'value' );

	}

	get defaultValue() {

		return this.getAttribute( 'value' ) ?? this.getAttribute( 'default' );

	}

	get isUniform() {

		return this.getAttribute( 'uniform' ) === 'true' && this.type !== 'filename';

	}

	getNodeGraph() {

		let nodeX = this;

		while ( nodeX !== null ) {

			if ( nodeX.element === 'nodegraph' ) {

				break;

			}

			nodeX = nodeX.parent;

		}

		return nodeX;

	}

	getRoot() {

		let nodeX = this;

		while ( nodeX.parent !== null ) {

			nodeX = nodeX.parent;

		}

		return nodeX;

	}

	get referencePath() {

		let referencePath = null;

		if ( this.nodeGraph !== null && this.output !== null ) {

			referencePath = this.nodeGraph + '/' + this.output;

		} else if ( this.nodeName !== null || this.interfaceName !== null ) {

			const graph = this.getNodeGraph();
			const path = graph ? graph.nodePath + '/' : '';
			referencePath = path + ( this.nodeName || this.interfaceName );

		}

		return referencePath;

	}

	get hasReference() {

		return this.referencePath !== null;

	}

	get isConst() {

		return this.element === 'input' && ! this.hasReference && this.defaultValue !== null && this.type !== 'filename';

	}

	getColorSpaceNode() {

		const interfaceNode = this.getInterfaceNode();
		return getTextureColorSpaceNode( interfaceNode || this );

	}

	getTexture() {

		const filePrefix = this.getRecursiveAttribute( 'fileprefix' ) || '';
		const interfaceNode = this.getInterfaceNode();
		const value = interfaceNode ? interfaceNode.value : this.value;
		const uri = filePrefix + value;

		if ( this.materialX.textureCache.has( uri ) ) {

			return this.materialX.textureCache.get( uri );

		}

		let loader = this.materialX.textureLoader;

		if ( uri ) {

			const handler = this.materialX.manager.getHandler( uri );
			if ( handler !== null ) loader = handler;

		}

		const texture = new Texture();
		texture.wrapS = texture.wrapT = RepeatWrapping;
		texture.flipY = false;
		texture.name = uri;

		this.materialX.textureCache.set( uri, texture );

		loader.load( uri, function ( imageBitmap ) {

			texture.image = imageBitmap;
			texture.needsUpdate = true;

		} );

		return texture;

	}

	getClassFromType( type ) {

		let nodeClass = null;

		if ( type === 'integer' ) nodeClass = int;
		else if ( type === 'float' ) nodeClass = float;
		else if ( type === 'vector2' ) nodeClass = vec2;
		else if ( type === 'vector3' ) nodeClass = vec3;
		else if ( type === 'vector4' || type === 'color4' ) nodeClass = vec4;
		else if ( type === 'color3' ) nodeClass = color;
		else if ( type === 'boolean' ) nodeClass = bool;
		else if ( type === 'matrix22' ) nodeClass = mat2;
		else if ( type === 'matrix33' ) nodeClass = mat3;
		else if ( type === 'matrix44' ) nodeClass = mat4;

		return nodeClass;

	}

	getNode( out = null ) {

		const scopedCache = this.materialX.getScopedNodeCache( this );
		const nodeOutputs = scopedCache ? scopedCache.nodeOutputs : this.nodeOutputs;
		let node = scopedCache ? scopedCache.node : this.node;

		if ( out !== null && nodeOutputs.has( out ) ) {

			return nodeOutputs.get( out );

		}

		if ( node !== null && out === null ) {

			return node;

		}

		if ( this.interfaceName !== null ) {

			const interfaceNode = this.getInterfaceNode();
			if ( interfaceNode ) {

				node = interfaceNode.getNode( out || interfaceNode.output );

			}

		}

		// Handle <input name="texcoord" type="vector2" ... />
		if ( node === null &&
				(
					this.element === 'input' &&
				this.name === 'texcoord' &&
				( this.type === 'vector2' || this.type === 'vector3' || this.type === 'vector4' ) &&
				! this.hasReference
				)
		) {

			// Try to get index from defaultgeomprop (e.g., "UV0" => 0)
			let index = 0;
			const defaultGeomProp = this.getAttribute( 'defaultgeomprop' );
			if ( defaultGeomProp && /^UV(\d+)$/.test( defaultGeomProp ) ) {

				index = parseInt( defaultGeomProp.match( /^UV(\d+)$/ )[ 1 ], 10 );

			}

			node = this.getTexCoordNode( index );

		}

		// Multi-output support for separate/separate3
		if ( node === null &&
				(
					( this.element === 'separate3' || this.element === 'separate2' || this.element === 'separate4' ) &&
				out && typeof out === 'string' && out.startsWith( 'out' )
				)
		) {

			const inNode = this.getNodeByName( 'in' );
			return mx_separate( inNode, out );

		}

		//

		const type = this.type;

		if ( node !== null ) {

			// Interface nodes may have already resolved to another graph node.

		} else if ( this.isConst ) {

			const nodeClass = this.getClassFromType( type );
			const values = type === 'matrix22' || type === 'matrix33' || type === 'matrix44' ? this.getMatrix() : this.getVector();

			node = nodeClass( ...values );

			if ( this.isUniform ) {

				node = this.materialX.getUniformNode( this, node );

			}

		} else if ( this.hasReference ) {

			if ( this.output && out === null ) {

				out = this.output;

			}

			const referenceNode = this.materialX.getMaterialXNode( this.referencePath );

			if ( referenceNode === undefined ) {

				console.warn( `THREE.MaterialXLoader: Missing reference ${ this.referencePath }.` );
				node = getVectorTypeDefault( this.type );

			} else {

				node = referenceNode.getNode( referenceNode.element === 'output' ? null : out );

			}

		} else {

			const element = this.element;

			if ( element === 'convert' ) {

				const nodeClass = this.getClassFromType( type );

				node = nodeClass( this.getNodeByName( 'in' ) );

			} else if ( element === 'constant' ) {

				node = this.getNodeByName( 'value' );

			} else if ( element === 'divide' ) {

				node = this.getDivideNode();

			} else if ( element === 'ifequal' && this.getChildByName( 'in1' ) && this.getChildByName( 'in2' ) ) {

				node = mx_ifequal_compare_inputs( ...this.getNodesByNames( 'value1', 'value2', 'in1', 'in2' ) );

			} else if ( element === 'position' ) {

				const space = getNodeSpace( this );
				node = space === 'world' ? positionWorld : positionLocal;

			} else if ( element === 'normal' ) {

				const space = getNodeSpace( this );
				node = space === 'world' ? normalWorld : normalLocal;

			} else if ( element === 'tangent' ) {

				const space = getNodeSpace( this );
				node = space === 'world' ? tangentWorld : tangentLocal;

			} else if ( element === 'bitangent' ) {

				const space = getNodeSpace( this );
				node = space === 'world' ? bitangentWorld : bitangentLocal;

			} else if ( element === 'texcoord' ) {

				const indexNode = this.getChildByName( 'index' );
				const index = indexNode ? parseInt( indexNode.value ) : 0;

				node = this.getTexCoordNode( index );

			} else if ( element === 'geomcolor' ) {

				const indexNode = this.getChildByName( 'index' );
				const index = indexNode ? parseInt( indexNode.value ) : 0;

				node = vertexColor( index );

			} else if ( element === 'geompropvalue' ) {

				node = this.getGeomPropValueNode();

			} else if ( element === 'geompropvalueuniform' ) {

				node = this.getNodeByName( 'default' ) || getVectorTypeDefault( this.type );

			} else if ( element === 'UsdPrimvarReader' ) {

				node = this.getNodeByName( 'fallback' ) || getVectorTypeDefault( this.type );

			} else if ( element === 'viewdirection' ) {

				const space = getNodeSpace( this ) || 'world';
				const viewDirectionWorld = normalize( positionWorld.sub( cameraPosition ) );
				node = space === 'world' ? viewDirectionWorld : mx_transform_vector( viewDirectionWorld, 'world', space );

			} else if ( element === 'tiledimage' ) {

				const file = this.getChildByName( 'file' );
				const fileValue = file ? ( file.getInterfaceNode()?.value || file.value || '' ).trim() : '';

				if ( fileValue === '' ) {

					node = this.getNodeByName( 'default' ) || getVectorTypeDefault( this.type );

				} else {

					const textureFile = file.getTexture();
					const uvTiling = mx_transform_uv( ...this.getNodesByNames( 'uvtiling', 'uvoffset' ) );

					node = texture( textureFile, uvTiling );

					node = this.applyTextureColorSpace( node, file );

				}

			} else if ( element === 'triplanarprojection' ) {

				node = this.getTriplanarProjectionNode();

			} else if ( element === 'image' ) {

				const file = this.getChildByName( 'file' );
				const fileValue = file ? ( file.getInterfaceNode()?.value || file.value || '' ).trim() : '';

				if ( fileValue === '' ) {

					node = this.getNodeByName( 'default' ) || getVectorTypeDefault( this.type );

				} else {

					const uvNode = this.getNodeByName( 'texcoord' );
					const textureFile = file.getTexture();

					node = texture( textureFile, uvNode );

					node = this.applyTextureColorSpace( node, file );

				}

			} else if ( element === 'gltf_colorimage' || element === 'gltf_image' ) {

				node = this.getGltfImageNode( out );

			} else if ( element === 'gltf_normalmap' ) {

				node = normalMap( this.getGltfImageNode( out ), this.getNodeByName( 'scale' ) || float( 1 ) );

			} else if ( element === 'gltf_iridescence_thickness' ) {

				node = this.getGltfIridescenceThicknessNode();

			} else if ( element === 'gltf_anisotropy_image' ) {

				node = this.getGltfAnisotropyImageNode( out );

			} else if ( element === 'flake2d' || element === 'flake3d' ) {

				node = this.getFlakeNode( out );

			} else if ( element === 'hextiledimage' ) {

				node = this.getNodeByName( 'default' ) || getVectorTypeDefault( this.type );

			} else if ( element === 'hextilednormalmap' ) {

				node = this.getHextiledNormalMapNode();

			} else if ( element === 'UsdUVTexture' ) {

				node = this.getUsdUVTextureNode( out );

			} else if ( element === 'switch' ) {

				node = this.getSwitchNode();

			} else if ( element === 'smoothstep' ) {

				node = this.getSmoothstepNode();

			} else if ( element === 'clamp' ) {

				node = this.getClampNode();

			} else if ( element === 'remap' ) {

				node = this.getRemapNode();

			} else if ( element === 'atan2' ) {

				node = this.getAtan2Node();

			} else if ( element === 'checkerboard' ) {

				node = this.getCheckerboardNode();

			} else if ( element === 'facingratio' ) {

				node = this.getFacingRatioNode();

			} else if ( element === 'overlay' ) {

				node = this.getOverlayNode();

			} else if ( element === 'and' ) {

				node = ( this.getNodeByName( 'in1' ) || bool( false ) ).and( this.getNodeByName( 'in2' ) || bool( false ) );

			} else if ( element === 'or' ) {

				node = ( this.getNodeByName( 'in1' ) || bool( false ) ).or( this.getNodeByName( 'in2' ) || bool( false ) );

			} else if ( element === 'hsvadjust' ) {

				node = this.getHsvAdjustNode();

			} else if ( element === 'transformvector' ) {

				node = this.getTransformVectorNode();

			} else if ( element === 'transformnormal' ) {

				node = this.getTransformNormalNode();

			} else if ( element === 'transformpoint' ) {

				node = this.getTransformPointNode();

			} else if ( element === 'transformmatrix' ) {

				node = this.getTransformMatrixNode();

			} else if ( element === 'standard_surface_to_gltf_pbr' ) {

				node = this.getStandardSurfaceToGltfNode( out );

			} else if ( element === 'standard_surface_to_UsdPreviewSurface' ) {

				node = this.getStandardSurfaceToUsdPreviewNode( out );

			} else if ( element === 'open_pbr_surface_to_standard_surface' ) {

				node = this.getOpenPbrToStandardSurfaceNode( out );

			} else if ( element === 'standard_surface_to_open_pbr_surface' ) {

				node = this.getStandardSurfaceToOpenPbrNode( out );

			} else if ( element === 'roughness_anisotropy' || element === 'glossiness_anisotropy' || element === 'roughness_dual' ) {

				node = this.getRoughnessUtilityNode();

			} else if ( element === 'artistic_ior' ) {

				node = this.getArtisticIorNode( out );

			} else if ( element === 'deon_hair_absorption_from_melanin' ) {

				node = this.getDeonHairAbsorptionNode();

			} else if ( element === 'chiang_hair_absorption_from_color' ) {

				node = this.getChiangHairAbsorptionNode();

			} else if ( element === 'chiang_hair_roughness' ) {

				node = this.getChiangHairRoughnessNode( out );

			} else if ( element === 'mix' && closureDataTypes.has( this.type ) ) {

				node = this.getClosureMixNode();

			} else if ( element === 'add' && closureDataTypes.has( this.type ) ) {

				node = this.getClosureAddNode();

			} else if ( element === 'layer' && closureDataTypes.has( this.type ) ) {

				node = this.getClosureLayerNode();

			} else if ( element === 'multiply' && closureDataTypes.has( this.type ) ) {

				node = this.getClosureMultiplyNode();

			} else if ( closureElements.has( element ) ) {

				node = this.getClosureNode();

			} else if ( this.materialX.hasImplementationGraph( element, this ) ) {

				node = this.getImplementationGraphNode( out );

			} else if ( MtlXLibrary[ element ] !== undefined ) {

				const nodeElement = MtlXLibrary[ element ];

				if ( ! nodeElement ) {

					throw new Error( `THREE.MaterialXLoader: Unexpected node ${ new XMLSerializer().serializeToString( this.nodeXML ) }.` );

				}

				if ( ! nodeElement.nodeFunc ) {

					throw new Error( `THREE.MaterialXLoader: Unexpected node 2 ${ new XMLSerializer().serializeToString( this.nodeXML ) }.` );

				}

				if ( out !== null && this.type === 'multioutput' ) {

					node = nodeElement.nodeFunc( ...this.getNodesByNamesPreserveMissing( ...nodeElement.params ), out );

				} else {

					node = nodeElement.nodeFunc( ...this.getNodesByNamesPreserveMissing( ...nodeElement.params ) );

				}

			}

		}

		//

		if ( node === null ) {

			console.warn( `THREE.MaterialXLoader: Unexpected node ${ new XMLSerializer().serializeToString( this.nodeXML ) }.` );

			node = float( 0 );

		}

		//

		const nodeToTypeClass = this.getClassFromType( type );

		if ( nodeToTypeClass !== null ) {

			node = nodeToTypeClass( node );

		} else if ( type === 'multioutput' || closureDataTypes.has( type ) ) {

			// Multi-output nodes are typed by the selected output, not by the wrapper node.

		} else {

			console.warn( `THREE.MaterialXLoader: Unexpected node ${ new XMLSerializer().serializeToString( this.nodeXML ) }.` );
			node = float( 0 );

		}

		node.name = this.name;

		if ( out !== null ) {

			nodeOutputs.set( out, node );

		} else if ( scopedCache ) {

			scopedCache.node = node;

		} else {

			this.node = node;

		}

		return node;

	}

	getInterfaceNode( name = this.interfaceName ) {

		return name !== null ? this.materialX.getInterfaceNode( name ) : null;

	}

	getTexCoordNode( index ) {

		const uvNode = this.materialX.texCoordFlipY ? uv( index ).flipY() : uv( index );

		if ( this.type === 'vector3' ) return vec3( uvNode, 0 );
		if ( this.type === 'vector4' ) return vec4( uvNode, 0, 0 );

		return uvNode;

	}

	getGeomPropValueNode() {

		const geomProp = this.getStringInput( 'geomprop' );
		const defaultNode = this.getNodeByName( 'default' ) || getVectorTypeDefault( this.type );
		const normalized = geomProp.toLowerCase();
		let node = null;

		if ( normalized === 'uv0' || normalized === 'st' || normalized === 'texcoord' ) {

			node = this.getTexCoordNode( 0 );

		} else if ( normalized === 'uv1' ) {

			node = this.getTexCoordNode( 1 );

		} else if ( normalized === 'nworld' || normalized === 'normalworld' ) {

			node = normalWorld;

		} else if ( normalized === 'nobject' || normalized === 'normal' ) {

			node = normalLocal;

		} else if ( normalized === 'tworld' || normalized === 'tangentworld' ) {

			node = tangentWorld;

		} else if ( normalized === 'tobject' || normalized === 'tangent' ) {

			node = tangentLocal;

		} else if ( normalized === 'pworld' || normalized === 'positionworld' ) {

			node = positionWorld;

		} else if ( normalized === 'pobject' || normalized === 'position' ) {

			node = positionLocal;

		} else if ( normalized === 'color' || normalized === 'displaycolor' ) {

			node = vertexColor( 0 );

		} else if ( geomProp !== '' && /^[A-Za-z_][\w.-]*$/.test( geomProp ) ) {

			const typeMap = {
				float: 'float',
				integer: 'int',
				boolean: 'bool',
				color3: 'vec3',
				color4: 'vec4',
				vector2: 'vec2',
				vector3: 'vec3',
				vector4: 'vec4'
			};
			node = new FallbackAttributeNode( geomProp, typeMap[ this.type ] || null, defaultNode );

		}

		return node || defaultNode;

	}

	getImplementationGraphNode( out = null ) {

		return this.materialX.resolveImplementationGraph( this, out );

	}

	getOutputNode( out = null ) {

		let outputNode = null;

		for ( const child of this.children ) {

			if ( child.element !== 'output' ) continue;

			if ( out !== null ) {

				if ( child.name === out ) {

					outputNode = child;
					break;

				}

			} else if ( outputNode === null || child.name === 'out' ) {

				outputNode = child;
				if ( child.name === 'out' ) break;

			}

		}

		return outputNode;

	}

	getSwitchNode() {

		const whichNode = this.getNodeByName( 'which' ) || int( 0 );
		let node = getVectorTypeDefault( this.type );

		for ( let i = 10; i >= 1; i -- ) {

			const inputNode = this.getNodeByName( `in${ i }` );
			if ( inputNode ) {

				node = whichNode.lessThan( float( i ) ).select( inputNode, node );

			}

		}

		return node;

	}

	getRemapNode() {

		return remap(
			this.getNodeByName( 'in' ) || getVectorTypeDefault( this.type ),
			this.getNodeByName( 'inlow' ) || float( 0 ),
			this.getNodeByName( 'inhigh' ) || float( 1 ),
			this.getNodeByName( 'outlow' ) || float( 0 ),
			this.getNodeByName( 'outhigh' ) || float( 1 )
		);

	}

	getClampNode() {

		return mx_clamp(
			this.getNodeByName( 'in' ) || getVectorTypeDefault( this.type ),
			this.getNodeByName( 'low' ) || float( 0 ),
			this.getNodeByName( 'high' ) || float( 1 )
		);

	}

	getSmoothstepNode() {

		const lowNode = this.getChildByName( 'low' );
		const highNode = this.getChildByName( 'high' );
		const inputNode = this.getNodeByName( 'in' ) || getVectorTypeDefault( this.type );
		const edgeNode = this.getNodeByName( 'low' ) || float( 0 );
		const highValueNode = this.getNodeByName( 'high' ) || float( 1 );
		const edgesEqual = lowNode && highNode && lowNode.referencePath === highNode.referencePath && lowNode.value === highNode.value;

		return mx_smoothstep( inputNode, edgeNode, highValueNode, edgesEqual );

	}

	getDivideNode() {

		const numeratorNode = this.getNodeByName( 'in1' ) || float( 0 );
		const denominatorNode = this.getNodeByName( 'in2' ) || float( 1 );
		const denominatorInput = this.getChildByName( 'in2' );

		if ( denominatorInput && denominatorInput.isConst && denominatorInput.getVector().every( ( value ) => value === 0 ) ) {

			return mx_divide_by_zero( numeratorNode );

		}

		return mx_divide( numeratorNode, denominatorNode );

	}

	getAtan2Node() {

		return mx_atan2(
			this.getNodeByName( 'iny' ) || this.getNodeByName( 'in1' ) || float( 0 ),
			this.getNodeByName( 'inx' ) || this.getNodeByName( 'in2' ) || float( 1 )
		);

	}

	getCheckerboardNode() {

		const texcoordNode = this.getNodeByName( 'texcoord' ) || uv();
		const tilingNode = this.getNodeByName( 'uvtiling' ) || vec2( 1, 1 );
		const color1Node = this.getNodeByName( 'color1' ) || getVectorTypeDefault( this.type );
		const color2Node = this.getNodeByName( 'color2' ) || getVectorTypeDefault( this.type );
		return mx_checkerboard( texcoordNode, tilingNode, color1Node, color2Node );

	}

	getGltfImageNode( out = null ) {

		const file = this.getChildByName( 'file' );
		const fileValue = file ? ( file.getInterfaceNode()?.value || file.value || '' ).trim() : '';
		let textureNode = null;
		let node = null;

		if ( fileValue === '' ) {

			node = this.getNodeByName( 'default' ) || getVectorTypeDefault( this.type );

		} else {

			const uvNode = this.getNodeByName( 'texcoord' );
			const textureFile = file.getTexture();
			textureNode = texture( textureFile, uvNode );
			node = this.applyTextureColorSpace( textureNode, file );

		}

		if ( this.element === 'gltf_colorimage' ) {

			node = vec4( node ).mul( this.getNodeByName( 'color' ) || vec4( 1, 1, 1, 1 ) ).mul( this.getNodeByName( 'geomcolor' ) || vec4( 1, 1, 1, 1 ) );

			if ( out === 'outcolor' ) return node.rgb;
			if ( out === 'outa' ) return node.a;

			return node;

		}

		const factorNode = this.getNodeByName( 'factor' );
		if ( factorNode ) node = mul( factorNode, node );

		if ( out === 'outcolor' ) return node.rgb;
		if ( out === 'outa' ) return textureNode ? textureNode.a : vec4( node ).a;

		return node;

	}

	getGltfIridescenceThicknessNode() {

		const imageNode = vec3( this.getGltfImageNode() );
		return mix(
			this.getNodeByName( 'thicknessMax' ) || float( 400 ),
			this.getNodeByName( 'thicknessMin' ) || float( 100 ),
			imageNode.y
		);

	}

	getGltfAnisotropyImageNode( out = null ) {

		const imageNode = vec3( this.getGltfImageNode() );
		const directionX = imageNode.x.mul( 2 ).sub( 1 );
		const directionY = imageNode.y.mul( 2 ).sub( 1 );

		if ( out === 'anisotropy_rotation_out' ) {

			return ( this.getNodeByName( 'anisotropy_rotation' ) || float( 0 ) ).add( mx_atan2( directionY, directionX ) );

		}

		return ( this.getNodeByName( 'anisotropy_strength' ) || float( 1 ) ).mul( imageNode.z );

	}

	getFlakeNode( out = null ) {

		const space = this.element === 'flake3d' ? ( this.getNodeByName( 'position' ) || positionLocal ).xy : ( this.getNodeByName( 'texcoord' ) || uv() );
		const size = this.getNodeByName( 'size' ) || float( 0.01 );
		const coverage = this.getNodeByName( 'coverage' ) || float( 0.5 );
		const seed = this.getNodeByName( 'randomness' ) || float( 0.17 );
		const rand = mx_randomfloat( floor( vec2( space ).div( max( size, float( 0.0001 ) ) ) ).dot( vec2( 12.9898, 78.233 ) ), float( 0 ), float( 1 ), seed );
		const presence = rand.lessThan( coverage ).select( float( 1 ), float( 0 ) );

		if ( out === 'presence' ) return presence;
		if ( out === 'rand' ) return rand;
		if ( out === 'normal' ) return normalize( ( this.getNodeByName( 'normal' ) || normalWorld ).add( vec3( rand.sub( 0.5 ).mul( 0.2 ), presence.mul( 0.1 ), 0 ) ) );

		return presence;

	}

	getRoughnessUtilityNode() {

		if ( this.element === 'roughness_dual' ) return this.getNodeByName( 'roughness' ) || vec2( 0.5, 0.5 );

		const roughness = this.element === 'glossiness_anisotropy' ?
			float( 1 ).sub( this.getNodeByName( 'glossiness' ) || float( 0.5 ) ) :
			( this.getNodeByName( 'roughness' ) || float( 0.5 ) );
		const anisotropy = this.getNodeByName( 'anisotropy' ) || float( 0 );

		return mx_open_pbr_anisotropy( roughness, anisotropy );

	}

	getArtisticIorNode( out = null ) {

		const reflectivity = clamp( this.getNodeByName( 'reflectivity' ) || color( 0.5, 0.5, 0.5 ), color( 0 ), color( 0.99 ) );
		const edgeColor = clamp( this.getNodeByName( 'edge_color' ) || color( 1, 1, 1 ), color( 0 ), color( 1 ) );
		const sqrtReflectivity = vec3( reflectivity ).sqrt();
		const ior = vec3( 1 ).add( sqrtReflectivity ).div( vec3( 1 ).sub( sqrtReflectivity ) );
		const extinction = max( edgeColor.oneMinus().mul( ior.add( 1 ) ), color( 0 ) );

		if ( out === 'extinction' ) return extinction;
		return ior;

	}

	getDeonHairAbsorptionNode() {

		const melanin = this.getNodeByName( 'melanin_concentration' ) || float( 0.5 );
		const redness = this.getNodeByName( 'melanin_redness' ) || float( 0.5 );
		const eumelanin = this.getNodeByName( 'eumelanin_color' ) || color( 0.657704, 0.498077, 0.254107 );
		const pheomelanin = this.getNodeByName( 'pheomelanin_color' ) || color( 0.829444, 0.67032, 0.349938 );

		return mix( eumelanin, pheomelanin, redness ).mul( melanin );

	}

	getChiangHairAbsorptionNode() {

		const inputColor = max( this.getNodeByName( 'color' ) || color( 0.8, 0.5, 0.25 ), color( 0.001 ) );
		const roughness = this.getNodeByName( 'azimuthal_roughness' ) || float( 0.3 );

		return inputColor.log().negate().mul( roughness.add( 0.25 ) );

	}

	getChiangHairRoughnessNode( out = null ) {

		const longitudinal = this.getNodeByName( 'longitudinal' ) || float( 0.3 );
		const azimuthal = this.getNodeByName( 'azimuthal' ) || float( 0.3 );
		const roughnessR = vec2( longitudinal, azimuthal );
		const roughnessTT = roughnessR.mul( this.getNodeByName( 'scale_TT' ) || float( 1 ) );
		const roughnessTRT = roughnessR.mul( this.getNodeByName( 'scale_TRT' ) || float( 1 ) );

		if ( out === 'roughness_TT' ) return roughnessTT;
		if ( out === 'roughness_TRT' ) return roughnessTRT;
		return roughnessR;

	}

	getClosureMixNode() {

		const bg = this.getClosureInputColor( this.getChildByName( 'bg' )?.getReferencedNode(), color( 0, 0, 0 ) );
		const fg = this.getClosureInputColor( this.getChildByName( 'fg' )?.getReferencedNode(), color( 0, 0, 0 ) );
		return mix( bg, fg, this.getNodeByName( 'mix' ) || float( 0.5 ) );

	}

	getClosureAddNode() {

		return clamp(
			this.getClosureInputColor( this.getChildByName( 'in1' )?.getReferencedNode(), color( 0, 0, 0 ) )
				.add( this.getClosureInputColor( this.getChildByName( 'in2' )?.getReferencedNode(), color( 0, 0, 0 ) ) ),
			color( 0, 0, 0 ),
			color( 1, 1, 1 )
		);

	}

	getClosureLayerNode() {

		return mix(
			this.getClosureInputColor( this.getClosureReference( 'base', 'materialBase' ), color( 0, 0, 0 ) ),
			this.getClosureInputColor( this.getClosureReference( 'top', 'materialTop' ), color( 1, 1, 1 ) ),
			float( 0.5 )
		);

	}

	getClosureMultiplyNode() {

		const value = this.getClosureInputColor( this.getClosureReference( 'in1' ), color( 1, 1, 1 ) );
		return value.mul( this.getNodeByName( 'in2' ) || float( 1 ) );

	}

	getClosureNode() {

		return this.getClosureInputColor( this, color( 0.8, 0.8, 0.8 ) );

	}

	getHextiledNormalMapNode() {

		const file = this.getChildByName( 'file' );
		const fileValue = file ? ( file.getInterfaceNode()?.value || file.value || '' ).trim() : '';
		let normalTexel = this.getNodeByName( 'default' ) || vec3( 0.5, 0.5, 1 );

		if ( fileValue !== '' ) {

			const textureFile = file.getTexture();
			const texcoord = this.getNodeByName( 'texcoord' ) || uv();
			const tiling = this.getNodeByName( 'tiling' ) || vec2( 1, 1 );
			normalTexel = texture( textureFile, texcoord.mul( tiling ) ).rgb;
			normalTexel = this.applyTextureColorSpace( normalTexel, file );

		}

		const flipG = this.getNodeByName( 'flip_g' ) || bool( false );
		normalTexel = flipG.select( vec3( normalTexel.x, normalTexel.y.oneMinus(), normalTexel.z ), normalTexel );

		return normalMap( normalTexel, this.getNodeByName( 'strength' ) || float( 1 ) );

	}

	getUsdUVTextureNode( out = null ) {

		const file = this.getChildByName( 'file' );
		const fileValue = file ? ( file.getInterfaceNode()?.value || file.value || '' ).trim() : '';
		let image = this.getNodeByName( 'fallback' ) || vec4( 0, 0, 0, 1 );

		if ( fileValue !== '' ) {

			image = texture( file.getTexture(), this.getNodeByName( 'st' ) || uv() );
			image = this.applyTextureColorSpace( image, file );

		}

		const biased = vec4( image ).mul( this.getNodeByName( 'scale' ) || vec4( 1, 1, 1, 1 ) ).add( this.getNodeByName( 'bias' ) || vec4( 0, 0, 0, 0 ) );

		if ( out === 'r' ) return biased.r;
		if ( out === 'g' ) return biased.g;
		if ( out === 'b' ) return biased.b;
		if ( out === 'a' ) return biased.a;
		if ( out === 'rgb' ) return biased.rgb;

		return biased;

	}

	applyTextureColorSpace( node, file ) {

		const colorSpaceNode = file.getColorSpaceNode();

		if ( ! colorSpaceNode ) return node;

		const convertedNode = colorSpaceNode( node );

		if ( this.type === 'color4' || this.type === 'vector4' ) {

			return vec4( convertedNode, node.a );

		}

		return convertedNode;

	}

	getTriplanarProjectionNode() {

		const fileX = this.getChildByName( 'filex' );
		const fileY = this.getChildByName( 'filey' ) || fileX;
		const fileZ = this.getChildByName( 'filez' ) || fileX;
		const hasTexture = [ fileX, fileY, fileZ ].some( ( file ) => ( file?.getInterfaceNode()?.value || file?.value || '' ).trim() !== '' );

		if ( ! hasTexture ) {

			return this.getNodeByName( 'default' ) || getVectorTypeDefault( this.type );

		}

		const positionNode = vec3( this.getNodeByName( 'position' ) || positionWorld );
		const normalNode = normalize( vec3( this.getNodeByName( 'normal' ) || normalWorld ).abs() );
		const blendNode = max( this.getNodeByName( 'blend' ) || float( 1 ), float( 0.0001 ) );
		let weightsNode = mx_power( normalNode, blendNode );

		weightsNode = weightsNode.div( max( weightsNode.x.add( weightsNode.y ).add( weightsNode.z ), float( 0.0001 ) ) );

		const colorX = texture( fileX.getTexture(), positionNode.zy ).mul( weightsNode.x );
		const colorY = texture( fileY.getTexture(), positionNode.xz ).mul( weightsNode.y );
		const colorZ = texture( fileZ.getTexture(), positionNode.xy ).mul( weightsNode.z );
		let node = colorX.add( colorY ).add( colorZ );

		node = this.applyTextureColorSpace( node, fileX );

		return node;

	}

	getOverlayNode() {

		const bg = this.getNodeByName( 'bg' ) || getVectorTypeDefault( this.type );
		const fg = this.getNodeByName( 'fg' ) || getVectorTypeDefault( this.type );
		const mixNode = this.getNodeByName( 'mix' ) || float( 1 );
		return mx_overlay( bg, fg, mixNode );

	}

	getHsvAdjustNode() {

		const input = this.getNodeByName( 'in' ) || getVectorTypeDefault( this.type );
		const amount = this.getNodeByName( 'amount' ) || vec3( 0, 1, 1 );
		return mx_hsvadjust( input, amount );

	}

	getStringInput( name ) {

		const child = this.getChildByName( name );
		const interfaceNode = child?.getInterfaceNode();

		return interfaceNode?.value || child?.value || '';

	}

	getTransformVectorNode() {

		const input = vec3( this.getNodeByName( 'in' ) || vec3( 0, 0, 0 ) );
		const fromSpace = this.getStringInput( 'fromspace' );
		const toSpace = this.getStringInput( 'tospace' );

		return mx_transform_vector( input, fromSpace, toSpace );

	}

	getTransformNormalNode() {

		const input = vec3( this.getNodeByName( 'in' ) || normalWorld );
		const fromSpace = this.getStringInput( 'fromspace' );
		const toSpace = this.getStringInput( 'tospace' );

		return mx_transform_vector( input, fromSpace, toSpace ).normalize();

	}

	getTransformPointNode() {

		const input = vec3( this.getNodeByName( 'in' ) || vec3( 0, 0, 0 ) );
		const fromSpace = this.getStringInput( 'fromspace' );
		const toSpace = this.getStringInput( 'tospace' );

		return mx_transform_point( input, fromSpace, toSpace );

	}

	getTransformMatrixNode() {

		const input = this.getNodeByName( 'in' ) || getVectorTypeDefault( this.type );
		const matrix = this.getNodeByName( 'mat' );

		if ( this.type === 'vector2' ) return ( matrix || mat3( 1, 0, 0, 0, 1, 0, 0, 0, 1 ) ).mul( vec3( input, 1 ) ).xy;
		if ( this.type === 'vector3' && this.getChildByName( 'mat' )?.type === 'matrix44' ) return ( matrix || mat4( 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ) ).mul( vec4( input, 1 ) ).xyz;
		if ( this.type === 'vector3' ) return ( matrix || mat3( 1, 0, 0, 0, 1, 0, 0, 0, 1 ) ).mul( input );
		if ( this.type === 'vector4' ) return ( matrix || mat4( 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ) ).mul( input );

		return input;

	}

	getStandardSurfaceToGltfNode( out = null ) {

		const outputMap = {
			base_color_out: () => this.getNodeByName( 'base_color' ) || color( 0.8, 0.8, 0.8 ),
			metallic_out: () => this.getNodeByName( 'metalness' ) || float( 0 ),
			roughness_out: () => this.getNodeByName( 'specular_roughness' ) || float( 0.5 ),
			anisotropy_strength_out: () => this.getNodeByName( 'specular_anisotropy' ) || float( 0 ),
			anisotropy_rotation_out: () => this.getNodeByName( 'specular_rotation' ) || float( 0 ),
			iridescence_out: () => this.getNodeByName( 'thin_film_thickness' ) ? float( 1 ) : float( 0 ),
			iridescence_ior_out: () => this.getNodeByName( 'thin_film_IOR' ) || this.getNodeByName( 'thin_film_ior' ) || float( 1.3 ),
			iridescence_thickness_out: () => this.getNodeByName( 'thin_film_thickness' ) || float( 0 ),
			emissive_out: () => this.getNodeByName( 'emission_color' ) || color( 0, 0, 0 ),
			emissive_strength_out: () => this.getNodeByName( 'emission' ) || float( 0 ),
			normal_out: () => this.getNodeByName( 'normal' ) || normalLocal,
			alpha_out: () => this.getNodeByName( 'opacity' ) || float( 1 )
		};

		return ( outputMap[ out ] || outputMap.base_color_out )();

	}

	getStandardSurfaceToUsdPreviewNode( out = null ) {

		const constantOneThird = vec3( 1 / 3 );
		const metalness = this.getNodeByName( 'metalness' ) || float( 0 );
		const base = this.getNodeByName( 'base' ) || float( 1 );
		const baseColor = ( this.getNodeByName( 'base_color' ) || color( 0.8, 0.8, 0.8 ) ).mul( base );
		const subsurfaceColor = this.getNodeByName( 'subsurface_color' ) || color( 1, 1, 1 );
		const baseSubsurfaceColor = mix( baseColor, subsurfaceColor, this.getNodeByName( 'subsurface' ) || float( 0 ) );
		const coatAttenuation = mix( color( 1, 1, 1 ), this.getNodeByName( 'coat_color' ) || color( 1, 1, 1 ), this.getNodeByName( 'coat' ) || float( 0 ) );
		const scaledCoatColor = ( this.getNodeByName( 'coat_color' ) || color( 1, 1, 1 ) ).mul( this.getNodeByName( 'coat' ) || float( 0 ) );
		const opacity = vec3( this.getNodeByName( 'opacity' ) || color( 1, 1, 1 ) ).dot( constantOneThird );
		const normal = ( this.getNodeByName( 'normal' ) || vec3( 0.5, 0.5, 1 ) ).sub( 0.5 ).mul( 2 );
		const emission = ( this.getNodeByName( 'emission_color' ) || color( 1, 1, 1 ) ).mul( this.getNodeByName( 'emission' ) || float( 0 ) );

		const outputMap = {
			diffuseColor_out: () => baseSubsurfaceColor.mul( coatAttenuation ),
			emissiveColor_out: () => emission.mul( coatAttenuation ),
			metallic_out: () => metalness,
			roughness_out: () => this.getNodeByName( 'specular_roughness' ) || float( 0.2 ),
			clearcoat_out: () => vec3( scaledCoatColor ).dot( constantOneThird ),
			clearcoatRoughness_out: () => this.getNodeByName( 'coat_roughness' ) || float( 0.1 ),
			opacity_out: () => opacity,
			ior_out: () => this.getNodeByName( 'specular_IOR' ) || float( 1.5 ),
			normal_out: () => normal
		};

		return ( outputMap[ out ] || outputMap.diffuseColor_out )();

	}

	getOpenPbrToStandardSurfaceNode( out = null ) {

		const baseColorInput = this.getNodeByName( 'base_color' ) || color( 0.8, 0.8, 0.8 );
		const coatIor = this.getNodeByName( 'coat_ior' ) || float( 1.6 );
		const coatF0Sqrt = coatIor.sub( 1 ).div( coatIor.add( 1 ) );
		const coatF0 = coatF0Sqrt.mul( coatF0Sqrt );
		const kCoat = float( 1 ).sub( float( 1 ).sub( coatF0 ).div( coatIor.mul( coatIor ) ) );
		const eMetal = baseColorInput.mul( this.getNodeByName( 'specular_weight' ) || float( 1 ) );
		const eDielectric = mix( baseColorInput, this.getNodeByName( 'subsurface_color' ) || color( 0.8, 0.8, 0.8 ), this.getNodeByName( 'subsurface_weight' ) || float( 0 ) );
		const eBase = mix( eDielectric, eMetal, this.getNodeByName( 'base_metalness' ) || float( 0 ) );
		const baseDarkening = vec3( float( 1 ).sub( kCoat ) ).div( vec3( 1, 1, 1 ).sub( eBase.mul( kCoat ) ) );
		const modulatedBaseDarkening = mix( vec3( 1, 1, 1 ), baseDarkening, ( this.getNodeByName( 'coat_weight' ) || float( 0 ) ).mul( this.getNodeByName( 'coat_darkening' ) || float( 1 ) ) );
		const thinFilmWeight = this.getNodeByName( 'thin_film_weight' ) || float( 0 );
		const thinFilmThickness = thinFilmWeight.greaterThan( 0 ).select( ( this.getNodeByName( 'thin_film_thickness' ) || float( 0.5 ) ).mul( 1000 ), float( 0 ) );

		const outputMap = {
			base_out: () => this.getNodeByName( 'base_weight' ) || float( 1 ),
			base_color_out: () => baseColorInput.mul( modulatedBaseDarkening ),
			diffuse_roughness_out: () => this.getNodeByName( 'base_diffuse_roughness' ) || float( 0 ),
			metalness_out: () => this.getNodeByName( 'base_metalness' ) || float( 0 ),
			specular_out: () => this.getNodeByName( 'specular_weight' ) || float( 1 ),
			specular_color_out: () => this.getNodeByName( 'specular_color' ) || color( 1, 1, 1 ),
			specular_roughness_out: () => mix( this.getNodeByName( 'specular_roughness' ) || float( 0.3 ), this.getNodeByName( 'coat_roughness' ) || float( 0 ), this.getNodeByName( 'coat_weight' ) || float( 0 ) ),
			specular_IOR_out: () => this.getNodeByName( 'specular_ior' ) || float( 1.5 ),
			specular_anisotropy_out: () => this.getNodeByName( 'specular_roughness_anisotropy' ) || float( 0 ),
			transmission_out: () => this.getNodeByName( 'transmission_weight' ) || float( 0 ),
			transmission_color_out: () => this.getNodeByName( 'transmission_color' ) || color( 1, 1, 1 ),
			transmission_depth_out: () => this.getNodeByName( 'transmission_depth' ) || float( 0 ),
			transmission_scatter_out: () => this.getNodeByName( 'transmission_scatter' ) || color( 0, 0, 0 ),
			transmission_scatter_anisotropy_out: () => this.getNodeByName( 'transmission_scatter_anisotropy' ) || float( 0 ),
			transmission_dispersion_out: () => this.getNodeByName( 'transmission_dispersion_scale' ) || float( 0 ),
			subsurface_out: () => this.getNodeByName( 'subsurface_weight' ) || float( 0 ),
			subsurface_color_out: () => ( this.getNodeByName( 'subsurface_color' ) || color( 0.8, 0.8, 0.8 ) ).mul( modulatedBaseDarkening ),
			subsurface_radius_out: () => this.getNodeByName( 'subsurface_radius_scale' ) || color( 1, 0.5, 0.25 ),
			subsurface_scale_out: () => this.getNodeByName( 'subsurface_radius' ) || float( 1 ),
			subsurface_anisotropy_out: () => this.getNodeByName( 'subsurface_scatter_anisotropy' ) || float( 0 ),
			sheen_out: () => this.getNodeByName( 'fuzz_weight' ) || float( 0 ),
			sheen_color_out: () => this.getNodeByName( 'fuzz_color' ) || color( 1, 1, 1 ),
			sheen_roughness_out: () => ( this.getNodeByName( 'fuzz_roughness' ) || float( 0.5 ) ).pow( 2.5 ),
			coat_out: () => this.getNodeByName( 'coat_weight' ) || float( 0 ),
			coat_color_out: () => this.getNodeByName( 'coat_color' ) || color( 1, 1, 1 ),
			coat_roughness_out: () => this.getNodeByName( 'coat_roughness' ) || float( 0 ),
			coat_anisotropy_out: () => this.getNodeByName( 'coat_roughness_anisotropy' ) || float( 0 ),
			coat_IOR_out: () => coatIor,
			coat_affect_roughness_out: () => float( 1 ),
			thin_film_thickness_out: () => thinFilmThickness,
			thin_film_IOR_out: () => this.getNodeByName( 'thin_film_ior' ) || float( 1.4 ),
			emission_out: () => this.getNodeByName( 'emission_luminance' ) || float( 0 ),
			emission_color_out: () => this.getNodeByName( 'emission_color' ) || color( 1, 1, 1 ),
			opacity_out: () => vec3( this.getNodeByName( 'geometry_opacity' ) || float( 1 ) ),
			thin_walled_out: () => this.getNodeByName( 'geometry_thin_walled' ) || bool( false )
		};

		return ( outputMap[ out ] || outputMap.base_color_out )();

	}

	getStandardSurfaceToOpenPbrNode( out = null ) {

		const metalness = this.getNodeByName( 'metalness' ) || float( 0 );
		const coat = this.getNodeByName( 'coat' ) || float( 0 );
		const coatAttenuation = mix( color( 1, 1, 1 ), this.getNodeByName( 'coat_color' ) || color( 1, 1, 1 ), coat );
		const specularColor = this.getNodeByName( 'specular_color' ) || color( 1, 1, 1 );
		const specularColorSum = vec3( specularColor ).dot( vec3( 1, 1, 1 ) );
		const thinFilmThickness = ( this.getNodeByName( 'thin_film_thickness' ) || float( 0 ) ).mul( 0.001 );

		const outputMap = {
			base_weight_out: () => this.getNodeByName( 'base' ) || float( 0.8 ),
			base_color_out: () => ( this.getNodeByName( 'base_color' ) || color( 1, 1, 1 ) ).mul( coatAttenuation ),
			base_diffuse_roughness_out: () => this.getNodeByName( 'diffuse_roughness' ) || float( 0 ),
			base_metalness_out: () => metalness,
			specular_weight_out: () => metalness.greaterThan( 0 ).select( float( 1 ), this.getNodeByName( 'specular' ) || float( 1 ) ),
			specular_color_out: () => specularColorSum.equal( 0 ).select( color( 1, 1, 1 ), specularColor ),
			specular_roughness_out: () => this.getNodeByName( 'specular_roughness' ) || float( 0.2 ),
			specular_ior_out: () => this.getNodeByName( 'specular_IOR' ) || float( 1.5 ),
			specular_roughness_anisotropy_out: () => this.getNodeByName( 'specular_anisotropy' ) || float( 0 ),
			transmission_weight_out: () => this.getNodeByName( 'transmission' ) || float( 0 ),
			transmission_color_out: () => this.getNodeByName( 'transmission_color' ) || color( 1, 1, 1 ),
			transmission_depth_out: () => this.getNodeByName( 'transmission_depth' ) || float( 0 ),
			transmission_scatter_out: () => this.getNodeByName( 'transmission_scatter' ) || color( 0, 0, 0 ),
			transmission_scatter_anisotropy_out: () => this.getNodeByName( 'transmission_scatter_anisotropy' ) || float( 0 ),
			transmission_dispersion_scale_out: () => this.getNodeByName( 'transmission_dispersion' ) || float( 0 ),
			subsurface_weight_out: () => this.getNodeByName( 'subsurface' ) || float( 0 ),
			subsurface_color_out: () => this.getNodeByName( 'subsurface_color' ) || color( 1, 1, 1 ),
			subsurface_radius_out: () => this.getNodeByName( 'subsurface_scale' ) || float( 1 ),
			subsurface_radius_scale_out: () => this.getNodeByName( 'subsurface_radius' ) || color( 1, 1, 1 ),
			subsurface_scatter_anisotropy_out: () => this.getNodeByName( 'subsurface_anisotropy' ) || float( 0 ),
			fuzz_weight_out: () => this.getNodeByName( 'sheen' ) || float( 0 ),
			fuzz_color_out: () => this.getNodeByName( 'sheen_color' ) || color( 1, 1, 1 ),
			fuzz_roughness_out: () => ( this.getNodeByName( 'sheen_roughness' ) || float( 0.3 ) ).pow( 0.4 ),
			coat_weight_out: () => coat.mul( metalness ).greaterThan( 0 ).select( float( 0 ), coat ),
			coat_color_out: () => this.getNodeByName( 'coat_color' ) || color( 1, 1, 1 ),
			coat_roughness_out: () => this.getNodeByName( 'coat_roughness' ) || float( 0.1 ),
			coat_roughness_anisotropy_out: () => this.getNodeByName( 'coat_anisotropy' ) || float( 0 ),
			coat_ior_out: () => this.getNodeByName( 'coat_IOR' ) || float( 1.5 ),
			coat_darkening_out: () => this.getNodeByName( 'coat_affect_roughness' ) || float( 0 ),
			thin_film_weight_out: () => thinFilmThickness.greaterThan( 0 ).select( float( 1 ), float( 0 ) ),
			thin_film_thickness_out: () => thinFilmThickness,
			thin_film_ior_out: () => this.getNodeByName( 'thin_film_IOR' ) || float( 1.5 ),
			emission_luminance_out: () => this.getNodeByName( 'emission' ) || float( 0 ),
			emission_color_out: () => this.getNodeByName( 'emission_color' ) || color( 1, 1, 1 ),
			geometry_opacity_out: () => vec3( this.getNodeByName( 'opacity' ) || color( 1, 1, 1 ) ).x,
			geometry_thin_walled_out: () => this.getNodeByName( 'thin_walled' ) || bool( false )
		};

		return ( outputMap[ out ] || outputMap.base_color_out )();

	}

	getFacingRatioNode() {

		const viewDirectionNode = this.getNodeByName( 'viewdirection' );
		const normalNode = this.getNodeByName( 'normal' );
		const faceForwardNode = this.getNodeByName( 'faceforward' ) || bool( true );
		const invertNode = this.getNodeByName( 'invert' );

		return mx_facingratio( viewDirectionNode, normalNode, faceForwardNode, invertNode );

	}

	getChildByName( name ) {

		for ( const input of this.children ) {

			if ( input.name === name ) {

				return input;

			}

		}

	}

	getReferencedNode() {

		return this.hasReference ? this.materialX.getMaterialXNode( this.referencePath ) : null;

	}

	getNodes() {

		const nodes = {};

		for ( const input of this.children ) {

			const node = input.getNode();

			nodes[ node.name ] = node;

		}

		return nodes;

	}

	getNodeByName( name ) {

		const child = this.getChildByName( name );

		return child ? child.getNode( child.output ) : undefined;

	}

	getNodesByNames( ...names ) {

		const nodes = [];

		for ( const name of names ) {

			const node = this.getNodeByName( name );

			if ( node ) nodes.push( node );

		}

		return nodes;

	}

	getNodesByNamesPreserveMissing( ...names ) {

		const nodes = [];

		for ( const name of names ) {

			nodes.push( this.getNodeByName( name ) );

		}

		return nodes;

	}

	getValue() {

		return this.defaultValue.trim();

	}

	getVector() {

		const vector = [];

		for ( const val of this.getValue().split( /[,|\s]/ ) ) {

			if ( val !== '' ) {

				const value = val.trim();
				vector.push( this.type === 'boolean' ? value === 'true' || value === '1' : Number( value ) );

			}

		}

		return vector;

	}

	getMatrix() {

		const vector = this.getVector();
		const size = this.type === 'matrix44' ? 4 : this.type === 'matrix33' ? 3 : this.type === 'matrix22' ? 2 : 0;

		if ( size === 0 || vector.length !== size * size ) return vector;

		const matrix = [];

		for ( let column = 0; column < size; column ++ ) {

			for ( let row = 0; row < size; row ++ ) {

				matrix.push( vector[ row * size + column ] );

			}

		}

		return matrix;

	}

	getAttribute( name ) {

		return this.nodeXML.getAttribute( name );

	}

	getRecursiveAttribute( name ) {

		let attribute = this.nodeXML.getAttribute( name );

		if ( attribute === null && this.parent !== null ) {

			attribute = this.parent.getRecursiveAttribute( name );

		}

		return attribute;

	}

	setStandardSurfaceToGltfPBR( material ) {

		const inputs = this.getNodes();

		//

		let colorNode = null;

		if ( inputs.base && inputs.base_color ) colorNode = mul( inputs.base, inputs.base_color );
		else if ( inputs.base ) colorNode = inputs.base;
		else if ( inputs.base_color ) colorNode = inputs.base_color;

		//

		let opacityNode = null;

		if ( inputs.opacity ) opacityNode = inputs.opacity;

		//

		let roughnessNode = null;

		if ( inputs.specular_roughness ) roughnessNode = inputs.specular_roughness;

		//

		let metalnessNode = null;

		if ( inputs.metalness ) metalnessNode = inputs.metalness;

		//

		let specularIntensityNode = null;

		if ( inputs.specular ) specularIntensityNode = inputs.specular;

		//

		let specularColorNode = null;

		if ( inputs.specular_color ) specularColorNode = inputs.specular_color;

		//

		let iorNode = null;

		if ( inputs.ior ) iorNode = inputs.ior;

		//

		let anisotropyNode = null;
		let anisotropyRotationNode = null;

		if ( inputs.specular_anisotropy ) anisotropyNode = inputs.specular_anisotropy;
		if ( inputs.specular_rotation ) anisotropyRotationNode = inputs.specular_rotation;

		//

		let transmissionNode = null;
		let transmissionColorNode = null;

		if ( inputs.transmission ) transmissionNode = inputs.transmission;
		if ( inputs.transmission_color ) transmissionColorNode = inputs.transmission_color;

		//

		let thinFilmThicknessNode = null;
		let thinFilmIorNode = null;

		if ( inputs.thin_film_thickness ) thinFilmThicknessNode = inputs.thin_film_thickness;

		const thinFilmIorInput = inputs.thin_film_ior || inputs.thin_film_IOR;

		if ( thinFilmIorInput ) {

			// Clamp IOR to valid range for Three.js (1.0 to 2.333)
			thinFilmIorNode = clamp( thinFilmIorInput, float( 1.0 ), float( 2.333 ) );

		}

		//

		let sheenNode = null;
		let sheenColorNode = null;
		let sheenRoughnessNode = null;

		if ( inputs.sheen ) sheenNode = inputs.sheen;
		if ( inputs.sheen_color ) sheenColorNode = inputs.sheen_color;
		if ( inputs.sheen_roughness ) sheenRoughnessNode = inputs.sheen_roughness;

		//

		let clearcoatNode = null;
		let clearcoatRoughnessNode = null;

		if ( inputs.coat ) clearcoatNode = inputs.coat;
		if ( inputs.coat_roughness ) clearcoatRoughnessNode = inputs.coat_roughness;

		if ( inputs.coat_color ) {

			colorNode = colorNode ? mul( colorNode, inputs.coat_color ) : colorNode;

		}

		//

		let normalNode = null;

		if ( inputs.normal ) normalNode = inputs.normal;

		//

		let emissiveNode = null;

		if ( inputs.emission ) emissiveNode = inputs.emission;
		if ( inputs.emission_color ) {

			emissiveNode = emissiveNode ? mul( emissiveNode, inputs.emission_color ) : inputs.emission_color;

		}

		//

		material.colorNode = colorNode || color( 0.8, 0.8, 0.8 );
		material.opacityNode = opacityNode || float( 1.0 );
		material.roughnessNode = roughnessNode || float( 0.2 );
		material.metalnessNode = metalnessNode || float( 0 );
		material.specularIntensityNode = specularIntensityNode || float( 1 );
		material.specularColorNode = specularColorNode || color( 1.0, 1.0, 1.0 );
		material.iorNode = iorNode || float( 1.5 );

		if ( anisotropyNode !== null ) {

			const anisotropyRotation = ( anisotropyRotationNode || float( 0 ) ).mul( Math.PI * 2 );
			material.anisotropyNode = vec2( cos( anisotropyRotation ), sin( anisotropyRotation ) ).mul( anisotropyNode );

		}

		if ( transmissionNode !== null ) {

			material.transmissionNode = transmissionNode;
			material.transmissionColorNode = transmissionColorNode || color( 1.0, 1.0, 1.0 );

		}

		if ( thinFilmThicknessNode !== null ) {

			material.iridescenceNode = float( 1 );
			material.iridescenceThicknessNode = thinFilmThicknessNode;
			material.iridescenceIORNode = thinFilmIorNode || float( 1.5 );

		}

		if ( sheenNode !== null ) {

			material.sheenNode = ( sheenColorNode || color( 1.0, 1.0, 1.0 ) ).mul( sheenNode );
			material.sheenRoughnessNode = sheenRoughnessNode || float( 0.5 );

		}

		if ( clearcoatNode !== null ) {

			material.clearcoatNode = clearcoatNode;
			material.clearcoatRoughnessNode = clearcoatRoughnessNode || float( 0 );

		}

		if ( normalNode ) material.normalNode = normalNode;
		if ( emissiveNode ) material.emissiveNode = emissiveNode;

		if ( opacityNode !== null ) {

			material.transparent = true;
			material.depthWrite = false;

		}

		if ( transmissionNode !== null ) {

			material.side = DoubleSide;

		}

	}

	setGltfPBR( material ) {

		const inputs = this.getNodes();

		if ( inputs.base_color ) material.colorNode = inputs.base_color;
		if ( inputs.alpha ) material.opacityNode = inputs.alpha;
		if ( inputs.roughness ) material.roughnessNode = inputs.roughness;
		if ( inputs.metallic ) material.metalnessNode = inputs.metallic;
		if ( inputs.normal ) material.normalNode = inputs.normal;
		if ( inputs.occlusion ) material.aoNode = inputs.occlusion;

		if ( inputs.emissive ) {

			material.emissiveNode = inputs.emissive_strength ? mul( inputs.emissive, inputs.emissive_strength ) : inputs.emissive;

		}

		if ( inputs.transmission ) material.transmissionNode = inputs.transmission;
		if ( inputs.specular ) material.specularIntensityNode = inputs.specular;
		if ( inputs.specular_color ) material.specularColorNode = inputs.specular_color;
		if ( inputs.ior ) material.iorNode = inputs.ior;
		if ( inputs.iridescence ) material.iridescenceNode = inputs.iridescence;
		if ( inputs.iridescence_ior ) material.iridescenceIORNode = inputs.iridescence_ior;
		if ( inputs.iridescence_thickness ) material.iridescenceThicknessNode = inputs.iridescence_thickness;
		if ( inputs.sheen_color ) material.sheenNode = inputs.sheen_color;
		if ( inputs.sheen_roughness ) material.sheenRoughnessNode = inputs.sheen_roughness;
		if ( inputs.clearcoat ) material.clearcoatNode = inputs.clearcoat;
		if ( inputs.clearcoat_roughness ) material.clearcoatRoughnessNode = inputs.clearcoat_roughness;
		if ( inputs.clearcoat_normal ) material.clearcoatNormalNode = inputs.clearcoat_normal;
		if ( inputs.thickness ) material.thicknessNode = inputs.thickness;
		if ( inputs.attenuation_distance ) material.attenuationDistanceNode = inputs.attenuation_distance;
		if ( inputs.attenuation_color ) material.attenuationColorNode = inputs.attenuation_color;
		if ( inputs.dispersion ) material.dispersionNode = inputs.dispersion;

		if ( inputs.anisotropy_strength ) {

			const anisotropyRotation = ( inputs.anisotropy_rotation || float( 0 ) ).mul( Math.PI * 2 );
			material.anisotropyNode = vec2( cos( anisotropyRotation ), sin( anisotropyRotation ) ).mul( inputs.anisotropy_strength );

		}

		const alphaMode = Number( this.getChildByName( 'alpha_mode' )?.value ?? 0 );

		if ( alphaMode === 1 ) {

			material.alphaTest = Number( this.getChildByName( 'alpha_cutoff' )?.value ?? 0.5 );

		} else if ( alphaMode === 2 || inputs.alpha ) {

			material.transparent = true;
			material.depthWrite = false;

		}

		if ( inputs.transmission ) {

			material.side = DoubleSide;
			material.transparent = true;
			material.depthWrite = false;

		}

	}

	setUsdPreviewSurface( material ) {

		const inputs = this.getNodes();
		const useSpecularWorkflow = Number( this.getChildByName( 'useSpecularWorkflow' )?.value ?? 0 ) === 1;

		material.colorNode = inputs.diffuseColor || color( 0.18, 0.18, 0.18 );
		material.emissiveNode = inputs.emissiveColor || color( 0, 0, 0 );
		material.roughnessNode = inputs.roughness || float( 0.5 );
		material.metalnessNode = useSpecularWorkflow ? float( 0 ) : ( inputs.metallic || float( 0 ) );
		material.specularColorNode = useSpecularWorkflow ? ( inputs.specularColor || color( 0, 0, 0 ) ) : color( 1, 1, 1 );
		material.specularIntensityNode = useSpecularWorkflow ? float( 1 ) : float( 0.5 );
		material.iorNode = inputs.ior || float( 1.5 );
		material.clearcoatNode = inputs.clearcoat || float( 0 );
		material.clearcoatRoughnessNode = inputs.clearcoatRoughness || float( 0.01 );
		material.aoNode = inputs.occlusion || float( 1 );

		if ( inputs.normal ) material.normalNode = inputs.normal;
		if ( inputs.displacement ) material.positionNode = positionLocal.add( normalLocal.mul( inputs.displacement ) );

		if ( inputs.opacity ) {

			material.opacityNode = inputs.opacity;
			material.transparent = true;
			material.depthWrite = false;

			const opacityMode = Number( this.getChildByName( 'opacityMode' )?.value ?? 0 );
			if ( opacityMode === 1 ) material.alphaTest = Number( this.getChildByName( 'opacityThreshold' )?.value ?? 0 );

		}

	}

	setDisneyPrincipled( material ) {

		const inputs = this.getNodes();
		const baseColor = inputs.baseColor || color( 0.16, 0.16, 0.16 );
		const roughness = inputs.roughness || float( 0.5 );
		const specularTint = inputs.specularTint || float( 0 );
		const sheenTint = inputs.sheenTint || float( 0.5 );

		material.colorNode = baseColor;
		material.metalnessNode = inputs.metallic || float( 0 );
		material.roughnessNode = roughness;
		material.specularIntensityNode = inputs.specular || float( 0.5 );
		material.specularColorNode = mix( color( 1, 1, 1 ), baseColor, specularTint );
		material.iorNode = inputs.ior || float( 1.5 );
		material.clearcoatNode = inputs.clearcoat || float( 0 );
		material.clearcoatRoughnessNode = float( 1 ).sub( inputs.clearcoatGloss || float( 1 ) );
		material.sheenNode = mix( color( 1, 1, 1 ), baseColor, sheenTint ).mul( inputs.sheen || float( 0 ) );
		material.sheenRoughnessNode = roughness;

		if ( inputs.anisotropic ) material.anisotropyNode = vec2( inputs.anisotropic, float( 0 ) );

		if ( inputs.specTrans ) {

			material.transmissionNode = inputs.specTrans;
			material.transmissionColorNode = baseColor;
			material.thicknessNode = inputs.subsurface || float( 0 );
			material.attenuationColorNode = inputs.subsurfaceDistance || baseColor;
			material.side = DoubleSide;
			material.transparent = true;
			material.depthWrite = false;

		}

	}

	setOpenPbrSurface( material ) {

		const inputs = this.getNodes();
		const baseWeight = inputs.base_weight || float( 1 );

		material.colorNode = ( inputs.base_color || color( 0.8, 0.8, 0.8 ) ).mul( baseWeight );
		material.roughnessNode = inputs.specular_roughness || float( 0.3 );
		material.metalnessNode = inputs.base_metalness || float( 0 );
		material.specularIntensityNode = inputs.specular_weight || float( 1 );
		material.specularColorNode = inputs.specular_color || color( 1, 1, 1 );
		material.iorNode = inputs.specular_ior || float( 1.5 );
		material.clearcoatNode = inputs.coat_weight || float( 0 );
		material.clearcoatRoughnessNode = inputs.coat_roughness || float( 0 );
		material.sheenNode = ( inputs.fuzz_color || color( 1, 1, 1 ) ).mul( inputs.fuzz_weight || float( 0 ) );
		material.sheenRoughnessNode = inputs.fuzz_roughness || float( 0.5 );
		if ( inputs.thin_film_weight || inputs.thin_film_thickness ) {

			material.iridescenceNode = inputs.thin_film_weight || float( 0 );
			material.iridescenceThicknessNode = ( inputs.thin_film_thickness || float( 0.5 ) ).mul( 1000 );
			material.iridescenceIORNode = inputs.thin_film_ior || float( 1.4 );

		}

		if ( inputs.specular_roughness_anisotropy ) material.anisotropyNode = vec2( inputs.specular_roughness_anisotropy, float( 0 ) );
		if ( inputs.geometry_normal ) material.normalNode = inputs.geometry_normal;

		if ( inputs.transmission_weight ) {

			material.transmissionNode = inputs.transmission_weight;
			material.transmissionColorNode = inputs.transmission_color || color( 1, 1, 1 );
			material.thicknessNode = inputs.transmission_depth || float( 0 );
			material.attenuationColorNode = inputs.transmission_scatter || color( 1, 1, 1 );
			material.side = DoubleSide;
			material.transparent = true;
			material.depthWrite = false;

		}

		if ( inputs.emission_luminance ) material.emissiveNode = ( inputs.emission_color || color( 1, 1, 1 ) ).mul( inputs.emission_luminance );

		if ( inputs.geometry_opacity ) {

			material.opacityNode = inputs.geometry_opacity;
			material.transparent = true;
			material.depthWrite = false;

		}

		if ( this.getChildByName( 'geometry_thin_walled' )?.value === 'true' ) material.side = DoubleSide;

	}

	getReferencedShaderInput( name ) {

		const input = this.getChildByName( name );
		return input ? input.getReferencedNode() : null;

	}

	getClosureReference( ...names ) {

		for ( const name of names ) {

			const referenced = this.getChildByName( name )?.getReferencedNode();
			if ( referenced ) return referenced;

		}

		return null;

	}

	getClosureScale( name, fallback = float( 1 ) ) {

		return this.getNodeByName( name ) || fallback;

	}

	getClosureInputColor( closure, fallback = color( 0.8, 0.8, 0.8 ) ) {

		if ( ! closure ) return fallback;

		if ( closure.element === 'mix' ) {

			const bg = this.getClosureInputColor( closure.getChildByName( 'bg' )?.getReferencedNode(), fallback );
			const fg = this.getClosureInputColor( closure.getChildByName( 'fg' )?.getReferencedNode(), fallback );
			return mix( bg, fg, closure.getNodeByName( 'mix' ) || float( 0.5 ) );

		}

		if ( closure.element === 'add' ) {

			const in1 = this.getClosureInputColor( closure.getClosureReference( 'in1' ), color( 0, 0, 0 ) );
			const in2 = this.getClosureInputColor( closure.getClosureReference( 'in2' ), color( 0, 0, 0 ) );
			return clamp( in1.add( in2 ), color( 0, 0, 0 ), color( 1, 1, 1 ) );

		}

		if ( closure.element === 'layer' ) {

			const base = this.getClosureInputColor( closure.getClosureReference( 'base', 'materialBase' ), fallback );
			const top = this.getClosureInputColor( closure.getClosureReference( 'top', 'materialTop' ), fallback );
			return mix( base, top, float( 0.5 ) );

		}

		if ( closure.element === 'multiply' ) {

			return this.getClosureInputColor( closure.getClosureReference( 'in1' ), fallback ).mul( closure.getNodeByName( 'in2' ) || float( 1 ) );

		}

		if ( closure.element === 'LamaMix' ) {

			const material1 = this.getClosureInputColor( closure.getClosureReference( 'material1' ), fallback );
			const material2 = this.getClosureInputColor( closure.getClosureReference( 'material2' ), fallback );
			return mix( material1, material2, closure.getNodeByName( 'mix' ) || float( 0 ) );

		}

		if ( closure.element === 'LamaAdd' ) {

			const material1 = this.getClosureInputColor( closure.getClosureReference( 'material1' ), color( 0, 0, 0 ) ).mul( closure.getClosureScale( 'weight1' ) );
			const material2 = this.getClosureInputColor( closure.getClosureReference( 'material2' ), color( 0, 0, 0 ) ).mul( closure.getClosureScale( 'weight2', float( 0 ) ) );
			return clamp( material1.add( material2 ), color( 0, 0, 0 ), color( 1, 1, 1 ) );

		}

		if ( closure.element === 'LamaLayer' ) {

			const base = this.getClosureInputColor( closure.getClosureReference( 'materialBase' ), fallback );
			const top = this.getClosureInputColor( closure.getClosureReference( 'materialTop' ), fallback );
			return mix( base, top, closure.getNodeByName( 'topMix' ) || float( 1 ) );

		}

		if ( closure.element === 'LamaSurface' ) {

			return this.getClosureInputColor( closure.getClosureReference( 'materialFront', 'materialBack' ), fallback );

		}

		if ( closure.element === 'LamaConductor' ) {

			return ( closure.getNodeByName( 'tint' ) || color( 1, 1, 1 ) ).mul( closure.getNodeByName( 'reflectivity' ) || color( 0.945, 0.777, 0.374 ) );

		}

		if ( closure.element === 'LamaDielectric' ) {

			return mix( closure.getNodeByName( 'transmissionTint' ) || color( 1, 1, 1 ), closure.getNodeByName( 'reflectionTint' ) || color( 1, 1, 1 ), float( 0.5 ) );

		}

		if ( closure.element === 'LamaGeneralizedSchlick' ) {

			return mix( closure.getNodeByName( 'transmissionTint' ) || color( 1, 1, 1 ), closure.getNodeByName( 'reflectionTint' ) || color( 1, 1, 1 ), closure.getNodeByName( 'reflectivityProfile' ) || float( 0.2 ) );

		}

		if ( closure.element === 'LamaIridescence' ) {

			const film = ( closure.getNodeByName( 'relativeFilmThickness' ) || float( 0.5 ) ).mul( 6.28318530718 );
			return color( 0.55, 0.62, 1.0 ).add( vec3( sin( film ), sin( film.add( 2.09439510239 ) ), sin( film.add( 4.18879020479 ) ) ).mul( 0.22 ) );

		}

		if ( closure.element === 'generalized_schlick_bsdf' || closure.element === 'generalized_schlick_edf' ) {

			return mix( closure.getNodeByName( 'color0' ) || fallback, closure.getNodeByName( 'color90' ) || fallback, float( 0.35 ) );

		}

		if ( closure.element === 'chiang_hair_bsdf' ) {

			return mix( closure.getNodeByName( 'tint_TT' ) || fallback, closure.getNodeByName( 'tint_TRT' ) || fallback, float( 0.35 ) )
				.add( closure.getNodeByName( 'tint_R' ) || color( 0, 0, 0 ) )
				.mul( 0.5 );

		}

		if ( closure.element === 'absorption_vdf' ) {

			return vec3( closure.getNodeByName( 'absorption' ) || vec3( 0, 0, 0 ) ).oneMinus();

		}

		if ( closure.element === 'anisotropic_vdf' ) {

			const absorption = vec3( closure.getNodeByName( 'absorption' ) || vec3( 0, 0, 0 ) ).oneMinus();
			return mix( absorption, closure.getNodeByName( 'scattering' ) || color( 0, 0, 0 ), float( 0.5 ) );

		}

		return closure.getNodeByName( 'color' ) ||
			closure.getNodeByName( 'tint' ) ||
			closure.getNodeByName( 'reflectionTint' ) ||
			closure.getNodeByName( 'transmissionTint' ) ||
			closure.getNodeByName( 'base_color' ) ||
			closure.getNodeByName( 'sssRadius' ) ||
			closure.getNodeByName( 'reflectivity' ) ||
			closure.getNodeByName( 'edgeColor' ) ||
			closure.getNodeByName( 'ior' ) ||
			fallback;

	}

	getClosureRoughness( closure, fallback = float( 0.45 ) ) {

		if ( ! closure ) return fallback;

		if ( closure.element === 'mix' ) {

			const bg = this.getClosureRoughness( closure.getClosureReference( 'bg' ), fallback );
			const fg = this.getClosureRoughness( closure.getClosureReference( 'fg' ), fallback );
			return mix( bg, fg, closure.getNodeByName( 'mix' ) || float( 0.5 ) );

		}

		if ( closure.element === 'LamaMix' ) return mix(
			this.getClosureRoughness( closure.getClosureReference( 'material1' ), fallback ),
			this.getClosureRoughness( closure.getClosureReference( 'material2' ), fallback ),
			closure.getNodeByName( 'mix' ) || float( 0 )
		);
		if ( closure.element === 'LamaLayer' ) return this.getClosureRoughness( closure.getClosureReference( 'materialTop' ), fallback );
		if ( closure.element === 'LamaAdd' ) return this.getClosureRoughness( closure.getClosureReference( 'material1' ), fallback );
		if ( closure.element === 'LamaSurface' ) return this.getClosureRoughness( closure.getClosureReference( 'materialFront' ), fallback );
		if ( closure.element === 'layer' ) return this.getClosureRoughness( closure.getClosureReference( 'top' ), fallback );
		if ( closure.element === 'add' ) return this.getClosureRoughness( closure.getClosureReference( 'in1' ), fallback );
		if ( closure.element === 'multiply' ) return this.getClosureRoughness( closure.getClosureReference( 'in1' ), fallback );

		const roughness = closure.getNodeByName( 'roughness' );
		if ( roughness ) return vec2( roughness ).x;
		const lamaRoughness = closure.getNodeByName( 'roughness_R' );
		if ( lamaRoughness ) return vec2( lamaRoughness ).x;

		return fallback;

	}

	setSurface( material ) {

		const bsdf = this.getReferencedShaderInput( 'bsdf' );
		const edf = this.getReferencedShaderInput( 'edf' );
		const opacity = this.getNodeByName( 'opacity' ) || float( 1 );
		const occlusion = this.getNodeByName( 'occlusion' ) || float( 1 );

		material.colorNode = this.getClosureInputColor( bsdf ).mul( occlusion );
		material.roughnessNode = this.getClosureRoughness( bsdf );
		material.emissiveNode = this.getClosureInputColor( edf, color( 0, 0, 0 ) );
		material.opacityNode = opacity;
		material.aoNode = occlusion;

		if ( this.getChildByName( 'opacity' ) ) {

			material.transparent = true;
			material.depthWrite = false;

		}

		if ( this.getChildByName( 'thin_walled' )?.value === 'true' ) material.side = DoubleSide;

	}

	getVolumeColor( vdf ) {

		if ( ! vdf ) return color( 0.35, 0.65, 1.0 );

		if ( vdf.element === 'mix' ) {

			const bg = this.getVolumeColor( vdf.getChildByName( 'bg' )?.getReferencedNode() );
			const fg = this.getVolumeColor( vdf.getChildByName( 'fg' )?.getReferencedNode() );
			return mix( bg, fg, vdf.getNodeByName( 'mix' ) || float( 0.5 ) );

		}

		const scattering = vdf.getNodeByName( 'scattering' );
		if ( scattering ) return scattering;

		const absorption = vdf.getNodeByName( 'absorption' );
		if ( absorption ) return color( 1, 1, 1 ).sub( vec3( absorption ).mul( 0.5 ) ).clamp();

		return color( 0.35, 0.65, 1.0 );

	}

	setVolume( material ) {

		const vdf = this.getReferencedShaderInput( 'vdf' );
		const edf = this.getReferencedShaderInput( 'edf' );
		const volumeColor = this.getVolumeColor( vdf );
		const emissionColor = this.getClosureInputColor( edf, color( 0, 0, 0 ) );

		material.colorNode = volumeColor;
		material.emissiveNode = volumeColor.mul( emissionColor );
		material.side = DoubleSide;

	}

	setSurfaceUnlit( material ) {

		const inputs = this.getNodes();
		let colorNode = inputs.emission_color || color( 0, 0, 0 );

		if ( inputs.emission ) colorNode = mul( colorNode, inputs.emission );

		material.colorNode = colorNode;

		if ( inputs.opacity ) {

			material.opacityNode = inputs.opacity;
			material.transparent = true;
			material.depthWrite = false;

		}

	}

	setDisplacement( material ) {

		const displacementNode = this.getNodeByName( 'displacement' );

		if ( displacementNode ) {

			material.positionNode = positionLocal.add( vec3( displacementNode ) );

		}

	}

	setMaterial( material, out = null ) {

		const element = this.element;

		if ( element === 'gltf_pbr' ) {

			this.setGltfPBR( material );

		} else if ( element === 'standard_surface' ) {

			this.setStandardSurfaceToGltfPBR( material );

		} else if ( element === 'UsdPreviewSurface' ) {

			this.setUsdPreviewSurface( material );

		} else if ( element === 'disney_principled' ) {

			this.setDisneyPrincipled( material );

		} else if ( element === 'open_pbr_surface' ) {

			this.setOpenPbrSurface( material );

		} else if ( element === 'surface' ) {

			this.setSurface( material );

		} else if ( element === 'volume' ) {

			this.setVolume( material );

		} else if ( element === 'surface_unlit' ) {

			this.setSurfaceUnlit( material );

		} else if ( element === 'displacement' ) {

			this.setDisplacement( material );

		} else if ( this.materialX.hasImplementationGraph( element, this ) ) {

			this.materialX.setImplementationGraphMaterial( this, material, out );

		}

	}

	toBasicMaterial() {

		const material = new MeshBasicNodeMaterial();
		material.name = this.name;

		for ( const nodeX of this.children.toReversed() ) {

			if ( nodeX.name === 'out' ) {

				material.colorNode = nodeX.getNode();

				break;

			}

		}

		return material;

	}

	toPhysicalMaterial() {

		const material = this.isUnlitSurfaceMaterial() ? new MeshBasicNodeMaterial() : new MeshPhysicalNodeMaterial();
		material.name = this.name;

		for ( const nodeX of this.children ) {

			const shaderProperties = this.getMaterialInputShaderNode( nodeX );

			if ( shaderProperties ) {

				shaderProperties.setMaterial( material, nodeX.output );

			}

		}

		return material;

	}

	getMaterialInputShaderNode( inputNode ) {

		if ( inputNode.nodeName ) return this.materialX.getMaterialXNode( inputNode.nodeName );

		const referencedNode = inputNode.getReferencedNode();

		if ( referencedNode && referencedNode.element === 'output' ) {

			return referencedNode.getReferencedNode();

		}

		return referencedNode;

	}

	isUnlitSurfaceMaterial() {

		for ( const nodeX of this.children ) {

			const shaderProperties = this.getMaterialInputShaderNode( nodeX );
			if ( shaderProperties && shaderProperties.isSurfaceUnlit( nodeX.output ) ) return true;

		}

		return false;

	}

	isSurfaceUnlit( out = null ) {

		if ( this.element === 'surface_unlit' ) return true;

		if ( this.materialX.hasImplementationGraph( this.element, this ) ) {

			return this.materialX.withInterfaceNodes( this, () => {

				const graph = this.materialX.getImplementationGraph( this.element, this );
				const outputNode = graph ? graph.getOutputNode( out ) : null;
				const shaderNode = outputNode ? outputNode.getReferencedNode() : null;

				return shaderNode ? shaderNode.isSurfaceUnlit( outputNode.output ) : false;

			} );

		}

		return false;

	}

	toMaterials() {

		const materials = {};

		let isUnlit = true;

		for ( const nodeX of this.children ) {

			if ( nodeX.element === 'surfacematerial' || nodeX.element === 'volumematerial' ) {

				const material = nodeX.toPhysicalMaterial();
				this.materialX.applyUniforms( material );

				materials[ material.name ] = material;

				isUnlit = false;

			}

		}

		if ( isUnlit ) {

			for ( const nodeX of this.children ) {

				if ( nodeX.element === 'nodegraph' ) {

					const material = nodeX.toBasicMaterial();
					this.materialX.applyUniforms( material );

					materials[ material.name ] = material;

				}

			}

		}

		return materials;

	}

	add( materialXNode ) {

		materialXNode.parent = this;

		this.children.push( materialXNode );

	}

}

class MaterialX {

	constructor( manager, path, textureFlipY = true, texCoordFlipY = false ) {

		this.manager = manager;
		this.path = path;
		this.resourcePath = '';
		this.textureFlipY = textureFlipY;
		this.texCoordFlipY = texCoordFlipY;

		this.nodesXLib = new Map();
		this.nodeDefsByNode = new Map();
		this.implementationGraphsByNodeDef = new Map();
		this.interfaceNodeStack = [];
		this.nodeCacheStack = [];
		this.uniforms = new Map();
		//this.nodesXRefLib = new WeakMap();

		this.textureLoader = new ImageBitmapLoader( manager );
		this.textureLoader.setOptions( { imageOrientation: textureFlipY ? 'flipY' : 'none' } );

		this.textureCache = new Map();

	}

	addMaterialXNode( materialXNode ) {

		this.nodesXLib.set( materialXNode.nodePath, materialXNode );

		if ( materialXNode.element === 'nodedef' ) {

			const node = materialXNode.getAttribute( 'node' );
			if ( node ) {

				if ( ! this.nodeDefsByNode.has( node ) ) this.nodeDefsByNode.set( node, [] );
				this.nodeDefsByNode.get( node ).push( materialXNode );

			}

		} else if ( materialXNode.element === 'nodegraph' && materialXNode.getAttribute( 'nodedef' ) ) {

			this.implementationGraphsByNodeDef.set( materialXNode.getAttribute( 'nodedef' ), materialXNode );

		}

	}

	/*getMaterialXNodeFromXML( xmlNode ) {

        return this.nodesXRefLib.get( xmlNode );

    }*/

	getMaterialXNode( ...names ) {

		return this.nodesXLib.get( names.join( '/' ) );

	}

	getUniformNode( materialXNode, valueNode ) {

		const name = materialXNode.name;
		const type = materialXNode.type;
		const key = `${ name }:${ type }`;
		let uniformInfo = this.uniforms.get( key );

		if ( uniformInfo === undefined ) {

			const node = uniform( valueNode ).setName( name );
			uniformInfo = {
				name,
				type,
				label: materialXNode.getAttribute( 'uiname' ) || name,
				node
			};
			this.uniforms.set( key, uniformInfo );

		}

		return uniformInfo.node;

	}

	applyUniforms( material ) {

		if ( this.uniforms.size === 0 ) return;

		material.userData.materialXUniforms = [ ...this.uniforms.values() ];

	}

	getScopedNodeCache( materialXNode ) {

		const nodeCache = this.nodeCacheStack[ this.nodeCacheStack.length - 1 ];
		if ( nodeCache === undefined ) return null;

		let scopedCache = nodeCache.get( materialXNode );

		if ( scopedCache === undefined ) {

			scopedCache = { node: null, nodeOutputs: new Map() };
			nodeCache.set( materialXNode, scopedCache );

		}

		return scopedCache;

	}

	getNodeDef( nodeName, materialXNode = null ) {

		const nodeDefs = this.nodeDefsByNode.get( nodeName );
		if ( nodeDefs === undefined || nodeDefs.length === 0 ) return null;
		if ( materialXNode === null || nodeDefs.length === 1 ) return nodeDefs[ 0 ];

		let bestNodeDef = nodeDefs[ 0 ];
		let bestScore = - Infinity;

		for ( const nodeDef of nodeDefs ) {

			let score = 0;

			for ( const defChild of nodeDef.children ) {

				if ( defChild.element !== 'input' ) continue;

				const inputChild = materialXNode.getChildByName( defChild.name );
				if ( inputChild === null ) continue;

				if ( inputChild.type === defChild.type ) {

					score += 4;

				} else if ( this.areNodeTypesCompatible( inputChild.type, defChild.type ) ) {

					score += 1;

				} else {

					score -= 8;

				}

			}

			const outputChild = nodeDef.children.find( ( child ) => child.element === 'output' );
			if ( outputChild && outputChild.type === materialXNode.type ) score += 1;

			if ( score > bestScore ) {

				bestScore = score;
				bestNodeDef = nodeDef;

			}

		}

		return bestNodeDef;

	}

	areNodeTypesCompatible( sourceType, targetType ) {

		if ( sourceType === targetType ) return true;
		if ( sourceType === 'color3' && targetType === 'vector3' ) return true;
		if ( sourceType === 'vector3' && targetType === 'color3' ) return true;
		if ( sourceType === 'color4' && targetType === 'vector4' ) return true;
		if ( sourceType === 'vector4' && targetType === 'color4' ) return true;

		return false;

	}

	getImplementationGraph( nodeName, materialXNode = null ) {

		const nodeDef = this.getNodeDef( nodeName, materialXNode );
		return nodeDef ? this.implementationGraphsByNodeDef.get( nodeDef.name ) : null;

	}

	hasImplementationGraph( nodeName, materialXNode = null ) {

		return this.getImplementationGraph( nodeName, materialXNode ) !== null;

	}

	getInterfaceNode( name ) {

		for ( let i = this.interfaceNodeStack.length - 1; i >= 0; i -- ) {

			const interfaceNodes = this.interfaceNodeStack[ i ];
			if ( interfaceNodes.has( name ) ) return interfaceNodes.get( name );

		}

		return null;

	}

	getInterfaceNodes( materialXNode ) {

		const interfaceNodes = new Map();
		const nodeDef = this.getNodeDef( materialXNode.element, materialXNode );

		if ( nodeDef ) {

			for ( const child of nodeDef.children ) {

				if ( child.element === 'input' ) interfaceNodes.set( child.name, child );

			}

		}

		for ( const child of materialXNode.children ) {

			if ( child.element === 'input' ) interfaceNodes.set( child.name, child );

		}

		return interfaceNodes;

	}

	withInterfaceNodes( materialXNode, callback ) {

		this.interfaceNodeStack.push( this.getInterfaceNodes( materialXNode ) );
		this.nodeCacheStack.push( new WeakMap() );

		try {

			return callback();

		} finally {

			this.nodeCacheStack.pop();
			this.interfaceNodeStack.pop();

		}

	}

	resolveImplementationGraph( materialXNode, out = null ) {

		const graph = this.getImplementationGraph( materialXNode.element, materialXNode );

		if ( graph === null ) {

			console.warn( `THREE.MaterialXLoader: Missing implementation graph for ${ materialXNode.element }.` );
			return getVectorTypeDefault( materialXNode.type );

		}

		return this.withInterfaceNodes( materialXNode, () => {

			const outputNode = graph.getOutputNode( out );

			if ( outputNode === null ) {

				console.warn( `THREE.MaterialXLoader: Missing output ${ out || 'out' } for ${ materialXNode.element }.` );
				return getVectorTypeDefault( materialXNode.type );

			}

			return outputNode.getNode( outputNode.output );

		} );

	}

	setImplementationGraphMaterial( materialXNode, material, out = null ) {

		const graph = this.getImplementationGraph( materialXNode.element, materialXNode );

		if ( graph === null ) return;

		this.withInterfaceNodes( materialXNode, () => {

			const outputNode = graph.getOutputNode( out );
			const shaderNode = outputNode ? outputNode.getReferencedNode() : null;

			if ( shaderNode ) {

				shaderNode.setMaterial( material, outputNode.output );

			}

		} );

	}

	parseNode( nodeXML, nodePath = '' ) {

		const materialXNode = new MaterialXNode( this, nodeXML, nodePath );
		if ( materialXNode.nodePath ) this.addMaterialXNode( materialXNode );

		for ( const childNodeXML of nodeXML.children ) {

			const childMXNode = this.parseNode( childNodeXML, materialXNode.nodePath );
			materialXNode.add( childMXNode );

		}

		return materialXNode;

	}

	parse( text ) {

		const rootXML = new DOMParser().parseFromString( text, 'application/xml' ).documentElement;

		this.textureLoader.setPath( this.path );

		//

		const materials = this.parseNode( rootXML ).toMaterials();

		return { materials };

	}

}

export { MaterialXLoader };
