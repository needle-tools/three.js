export default /* glsl */`
#ifdef USE_OCCLUSION
    uniform sampler2DArray depthColor;
    uniform float depthWidth;
    uniform float depthHeight;

    float Depth_GetCameraDepthInMeters(const sampler2DArray depthTexture,
        const vec2 depthUv, int arrayIndex) {
        return texture(depthColor, vec3(depthUv.x, depthUv.y, arrayIndex)).r;
      }

    float Depth_GetOcclusion(const sampler2DArray depthTexture, const vec2 depthUv, float assetDepthM, int arrayIndex) {
        float depthMm = Depth_GetCameraDepthInMeters(depthTexture, depthUv, arrayIndex);

        // Instead of a hard z-buffer test, allow the asset to fade into the
        // background along a 2 * kDepthTolerancePerM * assetDepthM
        // range centered on the background depth.
        const float kDepthTolerancePerM = 0.001;
        return clamp(1.0 -
            0.5 * (depthMm - assetDepthM) /
                (kDepthTolerancePerM * assetDepthM) +
            0.5, 0.0, 1.0);
    }

    float Depth_GetBlurredOcclusionAroundUV(const sampler2DArray depthTexture, const vec2 uv, float assetDepthM, int arrayIndex) {
    // Kernel used:
    // 0   4   7   4   0
    // 4   16  26  16  4
    // 7   26  41  26  7
    // 4   16  26  16  4
    // 0   4   7   4   0
    const float kKernelTotalWeights = 269.0;
    float sum = 0.0;

    const float kOcclusionBlurAmount = 0.0005;
    vec2 blurriness =
    vec2(kOcclusionBlurAmount, kOcclusionBlurAmount /** u_DepthAspectRatio*/);

    float current = 0.0;

    current += Depth_GetOcclusion(
    depthTexture, uv + vec2(-1.0, -2.0) * blurriness, assetDepthM, arrayIndex);
    current += Depth_GetOcclusion(
    depthTexture, uv + vec2(+1.0, -2.0) * blurriness, assetDepthM, arrayIndex);
    current += Depth_GetOcclusion(
    depthTexture, uv + vec2(-1.0, +2.0) * blurriness, assetDepthM, arrayIndex);
    current += Depth_GetOcclusion(
    depthTexture, uv + vec2(+1.0, +2.0) * blurriness, assetDepthM, arrayIndex);
    current += Depth_GetOcclusion(
    depthTexture, uv + vec2(-2.0, +1.0) * blurriness, assetDepthM, arrayIndex);
    current += Depth_GetOcclusion(
    depthTexture, uv + vec2(+2.0, +1.0) * blurriness, assetDepthM, arrayIndex);
    current += Depth_GetOcclusion(
    depthTexture, uv + vec2(-2.0, -1.0) * blurriness, assetDepthM, arrayIndex);
    current += Depth_GetOcclusion(
    depthTexture, uv + vec2(+2.0, -1.0) * blurriness, assetDepthM, arrayIndex);
    sum += current * 4.0;

    current = 0.0;
    current += Depth_GetOcclusion(
    depthTexture, uv + vec2(-2.0, -0.0) * blurriness, assetDepthM, arrayIndex);
    current += Depth_GetOcclusion(
    depthTexture, uv + vec2(+2.0, +0.0) * blurriness, assetDepthM, arrayIndex);
    current += Depth_GetOcclusion(
    depthTexture, uv + vec2(+0.0, +2.0) * blurriness, assetDepthM, arrayIndex);
    current += Depth_GetOcclusion(
    depthTexture, uv + vec2(-0.0, -2.0) * blurriness, assetDepthM, arrayIndex);
    sum += current * 7.0;

    current = 0.0;
    current += Depth_GetOcclusion(
    depthTexture, uv + vec2(-1.0, -1.0) * blurriness, assetDepthM, arrayIndex);
    current += Depth_GetOcclusion(
    depthTexture, uv + vec2(+1.0, -1.0) * blurriness, assetDepthM, arrayIndex);
    current += Depth_GetOcclusion(
    depthTexture, uv + vec2(-1.0, +1.0) * blurriness, assetDepthM, arrayIndex);
    current += Depth_GetOcclusion(
    depthTexture, uv + vec2(+1.0, +1.0) * blurriness, assetDepthM, arrayIndex);
    sum += current * 16.0;

    current = 0.0;
    current += Depth_GetOcclusion(
    depthTexture, uv + vec2(+0.0, +1.0) * blurriness, assetDepthM, arrayIndex);
    current += Depth_GetOcclusion(
    depthTexture, uv + vec2(-0.0, -1.0) * blurriness, assetDepthM, arrayIndex);
    current += Depth_GetOcclusion(
    depthTexture, uv + vec2(-1.0, -0.0) * blurriness, assetDepthM, arrayIndex);
    current += Depth_GetOcclusion(
    depthTexture, uv + vec2(+1.0, +0.0) * blurriness, assetDepthM, arrayIndex);
    sum += current * 26.0;

    sum += Depth_GetOcclusion(depthTexture, uv, assetDepthM, arrayIndex) * 41.0;

    return sum / kKernelTotalWeights;
    }


    vec3 mod289(vec3 x) {
        return x - floor(x * (1.0 / 289.0)) * 289.0;
      }
      
      vec2 mod289(vec2 x) {
        return x - floor(x * (1.0 / 289.0)) * 289.0;
      }
      
      vec3 permute(vec3 x) {
        return mod289(((x*34.0)+10.0)*x);
      }
      
      float snoise(vec2 v)
        {
        const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                            0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                           -0.577350269189626,  // -1.0 + 2.0 * C.x
                            0.024390243902439); // 1.0 / 41.0
      // First corner
        vec2 i  = floor(v + dot(v, C.yy) );
        vec2 x0 = v -   i + dot(i, C.xx);
      
      // Other corners
        vec2 i1;
        //i1.x = step( x0.y, x0.x ); // x0.x > x0.y ? 1.0 : 0.0
        //i1.y = 1.0 - i1.x;
        i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        // x0 = x0 - 0.0 + 0.0 * C.xx ;
        // x1 = x0 - i1 + 1.0 * C.xx ;
        // x2 = x0 - 1.0 + 2.0 * C.xx ;
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
      
      // Permutations
        i = mod289(i); // Avoid truncation effects in permutation
        vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
              + i.x + vec3(0.0, i1.x, 1.0 ));
      
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m*m ;
        m = m*m ;
      
      // Gradients: 41 points uniformly over a line, mapped onto a diamond.
      // The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287)
      
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
      
      // Normalise gradients implicitly by scaling m
      // Approximation of: m *= inversesqrt( a0*a0 + h*h );
        m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
      
      // Compute final noise value at P
        vec3 g;
        g.x  = a0.x  * x0.x  + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }



#endif
`;
