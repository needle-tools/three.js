export default /* glsl */`
#ifdef USE_MAP

#ifdef USE_MIPMAP_BIAS
        vec4 sampledDiffuseColor = texture2D( map, vMapUv, mipmapBias );
#else
		vec4 sampledDiffuseColor = texture2D( map, vMapUv, -0.5 );
#endif

	#ifdef DECODE_VIDEO_TEXTURE

		// inline sRGB decode (TODO: Remove this code when https://crbug.com/1256340 is solved)

		sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );

	#endif

	diffuseColor *= sampledDiffuseColor;

#endif
`;
