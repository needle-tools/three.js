import { Mesh, SphereGeometry, Vector3, ShaderMaterial, CubeUVReflectionMapping } from 'three';

/**
 * A ground-projected skybox. The height is how far the camera that took the photo was above the ground -
 * a larger value will magnify the downward part of the image. By default the object is centered at the camera,
 * so it is often helpful to set skybox.position.y = height to put the ground at the origin. Set the radius
 * large enough to ensure your user's camera stays inside.
 */

class GroundedSkybox extends Mesh {

	constructor( map, height, radius, resolution = 128 ) {

		if ( height <= 0 || radius <= 0 || resolution <= 0 ) {

			throw new Error( 'GroundedSkybox height, radius, and resolution must be positive.' );

		}

		const geometry = new SphereGeometry( radius, 2 * resolution, resolution );
		geometry.scale( 1, 1, - 1 );

		const pos = geometry.getAttribute( 'position' );
		const tmp = new Vector3();

		for ( let i = 0; i < pos.count; ++ i ) {

			tmp.fromBufferAttribute( pos, i );
			if ( tmp.y < 0 ) {

				// Smooth out the transition from flat floor to sphere:
				const y1 = - height * 3 / 2;
				const f =
						tmp.y < y1 ? - height / tmp.y : ( 1 - tmp.y * tmp.y / ( 3 * y1 * y1 ) );
				tmp.multiplyScalar( f );
				tmp.toArray( pos.array, 3 * i );

			}

		}

		pos.needsUpdate = true;


		// Build a minimal shader that samples `map`.
		// If the texture uses the PMREM CubeUV layout, enable the CubeUV sampling path.
		const isCubeUV = map && map.mapping === CubeUVReflectionMapping;
		const defines = {};
		if ( isCubeUV ) {

			// Derive CubeUV constants from the packed texture size (same as WebGLProgram.generateCubeUVSize).
			const image = map.image;
			const imageWidth = image && image.width ? image.width : 0;
			const imageHeight = image && image.height ? image.height : 0;

			if ( imageWidth > 0 && imageHeight > 0 ) {

				defines.USE_CUBEUV = 1;
				defines.CUBEUV_TEXEL_WIDTH = ( 1 / imageWidth );
				defines.CUBEUV_TEXEL_HEIGHT = ( 1 / imageHeight );
				defines.CUBEUV_MAX_MIP = ( Math.log2( imageHeight ) - 2 ) + '.';

			}

		}

		const material = new ShaderMaterial( {
			name: 'GroundedSkyboxMaterial',
			uniforms: {
				map: { value: map },
				backgroundBlurriness: { value: 0.0 },
				backgroundIntensity: { value: 1.0 },
				radius: { value: radius },
			},
			defines: defines,
			vertexShader: /* glsl */`
				varying vec2 vUv;
				varying vec4 vDir;
				uniform float radius;
				void main() {
					vUv = uv;
					vec3 worldPos = ( modelMatrix * vec4( position, 1.0 ) ).xyz;
					float offset = radius * 0.1;
					// Use a cubic smoothstep for a smoother transition than linear
					float t = clamp( ( length( position ) - offset ) / ( radius - offset ), 0.0, 1.0 );
					float factor = t * t * ( 3.0 - 2.0 * t );
					vDir = vec4( position.xyz, factor );
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}
			`,
			fragmentShader: /* glsl */`
				precision mediump float;
				precision mediump int;
				uniform sampler2D map;
				uniform float backgroundBlurriness;
				uniform float backgroundIntensity;
				varying vec2 vUv;
				varying vec4 vDir;

				#ifdef USE_CUBEUV
				#define ENVMAP_TYPE_CUBE_UV
				#include <cube_uv_reflection_fragment>
				#endif
				#include <common>

				void main() {
					vec4 col;
					#ifdef USE_CUBEUV
						// Sample the CubeUV-packed PMREM texture with zero roughness (sharpest level).
						vec3 dir = normalize( vDir.xyz );
						col = textureCubeUV( map, dir, backgroundBlurriness * vDir.w );
						col *= mix( 1.0, 0.0, (1.0 - backgroundIntensity) * vDir.w );
					#else
						// Fallback: regular 2D texture sampling using mesh UVs.
						col = texture2D( map, vUv );
					#endif
					gl_FragColor = col;
					#include <colorspace_fragment>
				}
			`,
			depthWrite: false
		} );

		super( geometry, material );

	}

	set map( value ) {

		this.material.uniforms.map.value = value;

	}

	set backgroundBlurriness( value ) {

		this.material.uniforms.backgroundBlurriness.value = value;

	}

	set backgroundIntensity( value ) {

		this.material.uniforms.backgroundIntensity.value = value;

	}

}

export { GroundedSkybox };
