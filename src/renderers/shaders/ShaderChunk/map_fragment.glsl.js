export default /* glsl */`
#ifdef USE_MAP

#ifdef USE_MIPMAP_BIAS
    vec4 sampledDiffuseColor = texture2D( map, vMapUv, mipmapBias );
#else
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
#endif

	diffuseColor *= sampledDiffuseColor;

#endif
`;
