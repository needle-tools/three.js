export default /* glsl */`
#ifdef USE_MAP

	uniform sampler2D map;
        
#ifdef USE_MIPMAP_BIAS
    uniform float mipmapBias;
#endif

#endif
`;
