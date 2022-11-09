# Changelog
All notable changes to this package will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [0.145.3] - 2022-11-09
- PMREM generator hack: don't re-use generator since it still caused issues with reflection probes

## [0.145.2] - 2022-10-28
- fix: allow passing GLTFLoader parameters into OculusHandModel/XRHandMeshModel

## [0.145.1] - 2022-10-26
- PMREM generator hack for reflection probe bug causing false textures being generated for certain skybox sizes (256)