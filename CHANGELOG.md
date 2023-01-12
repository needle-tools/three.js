# Changelog
All notable changes to this package will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

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