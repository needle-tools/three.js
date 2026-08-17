# Rhino MaterialX

`Rhino-MaterialX.glb` is the default asset for the MaterialX drop-loader
example. It contains an embedded `NEEDLE_materials_mtlx` document and its
textures.

The example asset was reduced from the Needle Engine Rhino MaterialX test
fixture with glTF-Transform 4.0.8. Its geometry was simplified and Draco
compressed, and its textures were resized to 1024px and converted to WebP. The
custom MaterialX extension was preserved after optimization because it is not a
registered glTF-Transform extension.
