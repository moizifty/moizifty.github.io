---
title: Renderer
order: 12
---

`src/renderer` is a thin, backend-selected renderer. Only a D3D11 backend exists so far (`renderer/d3d11`), picked at compile time:

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

`rendererInit` runs once against an `OSGfxState` from [`os/gfx`](/projects/base/os/). Each window then gets its own `RendererWindowState` via `rendererAttachToWindow`, its own swapchain and backbuffer, tracked through an opaque `RendererWindowStatePlatform`.

`rendererOutputFinalDebugReport` dumps the D3D11 debug layer's live-object report on shutdown, handy for catching leaked GPU resources. Right now this only gets exercised from my scratch test file in [`tests`](/projects/base/tests/), nothing else in the repo uses it yet.
