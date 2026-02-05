# Changelog
All notable changes to this package will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [0.169.16] – 2026-02-05
- fix: Camera scale affecting lighting 

## [0.169.11] – 2025-08-28
- add: GLTFLoaderAnimationPointer back in for Needle Engine backwards compatibility ([forum](https://forum.needle.tools/t/latest-release-breaks-later-versions/2697))

## [0.169.10] – 2025-08-27
- remove: GLTFLoaderAnimationPointer, the code has been moved to `@needle-tools/three-animation-pointer`

## [0.169.9] – 2025-08-20
- update KTX2Loader for .ktx2 PMREM loading
- update KTX2Exporter

## [0.169.7] – 2025-08-04
- fix: handling of endMovement event in OrbitControls when damping is disabled
- fix: GLTFExporter was not handling color morpth targets

## [0.169.6] – 2025-08-04
- fix: some checks inside OrbitControls were using direct floating point comparisons, now using `EPSILON` for checks
- add: add `endDamping` event to OrbitControls
- add: warning for edge topology in FBXLoader

## [0.169.5] – 2025-02-21
- fix: FBXLoader didn't handle invalid material indices so far
- add: FBXLoader now exposes `getFbxTree()` for debugging and validation
- add: GLTFLoader now exposes `json` and `jsonErrorData` for debugging and validation

## [0.169.4] – 2025-01-22
- fix: backport WebXRManager layers support check

## [0.169.3] – 2025-01-10
- feat: OrbitControls smooth zoom to cursor

## [0.169.1] – 2024-10-17
- update to 169

## [0.166.1] – 2024-07-01
- update to 166
- feat: log which three.js versions collide on the window object when multiple versions are imported
- feat: ability to retarget animations loaded with GLTFLoader (search by original object name as well in PropertyBinding)

## [0.162.3] - 2024-05-06
- feat: GLTFExporter: add OffscreenCanvas to list of supported image types

## [0.162.12] - 2024-12-20
- fix: OBJLoader `blob:` URL fix

## [0.162.11] - 2024-12-20
- feat: OBJLoader `load` function now automatically loads mtl files

## [0.162.2] - 2024-04-02
- add: BatchedMesh addUpdateRanges (#27981)
- fix: BatchedMesh error caused by InterleavedBuffers, don't keep srcAttribute type and directly create BufferAttribute, omit usage (#27978)

## [0.162.1] - 2024-03-05
- fix: restore pointer capture on OrbitControls
- fix: audio.pause causing exceptions when internal buffer has been released elsewhere
- feat: better log for multiple three.js revisions being imported at the same time

## [0.160.3] - 2024-02-06
- fix: OrbitControls `pointerup` event not received in some cases

## [0.154.3] - 2023-08-03
- add: KHR_animation_pointer support to resolve morphTargets on Group (multi-material skinned mesh with blendshapes)

## [0.154.2] - 2023-07-29
- fix GLTFLoader loadAnimation refactor (#26477)
- fix KHR_animation_pointer not working with SkinnedMesh

## [0.154.0] - 2023-07-10
- update to 154

## [0.153.0] - 2023-06-22
- update to 153

## [0.146.10] - 2023-06-06
- fix OrbitControls: turn off mouse wheel damping when enableDamping is off 

## [0.146.9] - 2023-05-29
- fix GLTFLoader: memory leak caused by KHR_animation_pointer extension

## [0.146.8] - 2023-04-28
- fix USDZExporter: fix export where object names are only a number

## [0.146.7] - 2023-04-06
- fix USDZExporter: wrong variable name in warning log

## [0.146.6] - 2023-03-24
- change USDZExporter: pass writer into onAfterHierarchy callback, move onAfterHierarchy callback after scene hierarchy write
- fix USDZExporter: fix exception when trying to process render targets
- fix WebXRManager: Correctly update the user camera when it has a parent with a non-identity transform.

## [0.146.5] - 2023-01-20
- feat: add mipmap bias
- change: default mipmap bias set to -0.5

## [0.146.4] - 2023-01-18
- fix: property binding should not fall back to root node on incorrect path names
- change: OrbitControls disabling pointerCapture, causing mouse events to be captured

## [0.146.3] - 2023-01-12
- change: define loadAnimation loop variables outside of if statement to avoid react-scripts bundling error

## [0.146.2] - 2022-12-08
- change: USDZExporter ensure names dont contain umlaute
- change: USDZExporter dont print complete log when not in debug mode

## [0.145.4] - 2022-11-09
- feat: USDZExporter add uv2 support, make sure TextureTransform is only written when needed, use uv2 for occlusion
- fix: USDZExporter don't export opacity if model is opaque, leads to incorrect rendering effects
- change: USDZExporter simplify st / st2 access
- change: PMREM generator hack, don't re-use generator since it still caused issues with reflection probes

## [0.145.2] - 2022-10-28
- fix: allow passing GLTFLoader parameters into OculusHandModel/XRHandMeshModel

## [0.145.1] - 2022-10-26
- PMREM generator hack for reflection probe bug causing false textures being generated for certain skybox sizes (256)