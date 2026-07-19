---
title: Renderer
order: 11
---

`src/renderer` is a thin, backend-selected renderer. Only a D3D11 backend
exists today (`renderer/d3d11`), picked at compile time:

```c
#if RENDERER_BACKEND == RENDERER_D3D11
#include "d3d11\rendererD3D11.h"
#else
#error Platform not defined
#endif
```

## Lifecycle

```c
RendererState *rs = rendererInit(arena, gfxState);
RendererWindowState *wnd = rendererAttachToWindow(rs, arena, windowHandle);

// per frame:
rendererWindowBegin(rs, wnd, resolution);
// ... draw ...
rendererWindowEnd(rs, wnd);

// on resize:
rendererWindowResizeBuffers(rs, wnd, newResolution);
```

`rendererInit` runs once against an `OSGfxState` from
[`os/gfx`](/projects/base/os/). Each window gets its own
`RendererWindowState` via `rendererAttachToWindow` — its own swapchain and
backbuffer, tracked through an opaque `RendererWindowStatePlatform`.

`rendererOutputFinalDebugReport` dumps the D3D11 debug layer's live-object
report on shutdown — useful for catching leaked GPU resources.
