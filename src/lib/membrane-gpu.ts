import { draw, effect, frame, init, sampler, surface, target } from "vgpu";
import {
  MEMBRANE_VERTEX_COUNT,
  membranePresentShader,
  membraneShader,
} from "@/shaders/membrane";

export interface MembraneRenderState {
  time: number;
  pointer: [number, number];
  activeLayer: number;
  scan: number;
  reducedMotion: boolean;
  /** Temporary separation envelope while inspecting an internal layer. */
  inspection?: number;
}

/** One independent device/canvas lifetime. Animation and spring state belong to the caller. */
export async function createMembraneRenderer(
  canvas: HTMLCanvasElement,
  options: { onDeviceLost?: () => void } = {},
) {
  const gpu = await init({ powerPreference: "low-power" });
  let disposed = false;
  let failed = false;
  const removeError = gpu.onError((error) => {
    console.error("Membrane WebGPU render failed", error);
    if (!failed && !disposed) {
      failed = true;
      options.onDeviceLost?.();
    }
  });
  void gpu.gpu.lost.then(() => {
    if (!disposed) {
      failed = true;
      options.onDeviceLost?.();
    }
  });
  try {
    const output = surface(gpu, canvas, {
      dpr: [1, 1.5],
      alphaMode: "opaque",
      label: "Membrane studio",
    });
    const scene = target(gpu, {
      size: output.size,
      depth: true,
      msaa: 4,
      label: "Flexible laminate",
    });
    const sheets = draw(gpu, {
      shader: membraneShader,
      vertices: MEMBRANE_VERTEX_COUNT,
      instances: 3,
      cull: "none",
      depth: { write: true, compare: "less" },
      set: {
        params: {
          time: 5,
          aspect: output.size[0] / output.size[1],
          selectedLayer: -1,
          scan: 0,
          pointer: [0, 0],
          reduced: 0,
          inspection: 0,
        },
      },
    });
    const present = effect(gpu, membranePresentShader, {
      set: {
        scene,
        sceneSampler: sampler(gpu, {
          minFilter: "linear",
          magFilter: "linear",
        }),
      },
    });
    const removeResize = output.onResize(({ width, height }) => {
      scene.resize([width, height]);
      // Target resizing changes its texture identity. Rebind before the next pass.
      present.set({ scene });
    });
    // A surface swapchain texture exists only while encoding a frame.
    // Prewarm presentation against its format without acquiring that texture.
    await Promise.all([
      sheets.compile(scene),
      present.compile({ colors: [output.format], sampleCount: 1 }),
    ]);
    await gpu.settled();
    if (failed) throw new Error("Membrane shader validation failed");
    return {
      render(state: MembraneRenderState) {
        if (disposed || failed) return;
        frame(gpu, (current) => {
          sheets.set({
            params: {
              time: state.time,
              aspect: output.size[0] / output.size[1],
              selectedLayer: state.activeLayer,
              scan: state.scan,
              pointer: state.pointer,
              reduced: Number(state.reducedMotion),
              inspection: state.inspection ?? 0,
            },
          });
          current.pass(
            { target: scene, clear: [0, 0, 0, 0], clearDepth: 1 },
            (pass) => pass.draw(sheets),
          );
          current.pass(output, present);
        });
      },
      resize() {
        if (disposed || failed) return;
        const dpr = Math.min(1.5, Math.max(1, window.devicePixelRatio || 1));
        output.resize([
          Math.max(1, Math.round(canvas.clientWidth * dpr)),
          Math.max(1, Math.round(canvas.clientHeight * dpr)),
        ]);
      },
      dispose() {
        if (disposed) return;
        disposed = true;
        removeResize();
        removeError();
        output.dispose();
        gpu.dispose();
      },
    };
  } catch (error) {
    disposed = true;
    removeError();
    gpu.dispose();
    throw error;
  }
}
