export default /* glsl */`
#ifdef USE_OCCLUSION
    if (gl_FragColor.a > 0.0) {
        int arrayIndex = 0;
        vec2 depthUv;
        if (gl_FragCoord.x>=depthWidth) {
            arrayIndex = 1;
            depthUv = vec2((gl_FragCoord.x-depthWidth)/depthWidth, gl_FragCoord.y/depthHeight);
        } else {
            depthUv = vec2(gl_FragCoord.x/depthWidth, gl_FragCoord.y/depthHeight);
        }
        float assetDepthM = gl_FragCoord.z;
        
        //float occlusion = Depth_GetOcclusion(depthColor, depthUv, assetDepthM, arrayIndex);
        float occlusion = Depth_GetBlurredOcclusionAroundUV(depthColor, depthUv, assetDepthM, arrayIndex);

        // distance
        float depthMm = Depth_GetCameraDepthInMeters(depthColor, depthUv, arrayIndex);
        
        float noise = snoise(gl_FragCoord.xy * 0.005);
        
        depthMm += noise * 0.002;
        float absDistance = abs(assetDepthM - depthMm);
        float v = 0.0025;
        absDistance = saturate(v - absDistance) / v;

        // perturb absDistance by 3D noise
        // absDistance += noise * 0.1;

        gl_FragColor.rgb += vec3(absDistance * 2.0, absDistance * 2.0, absDistance * 12.0);
        gl_FragColor = mix(gl_FragColor, vec4(0.0, 0.0, 0.0, 0.0), occlusion * 0.7);
    }
#endif
`;
