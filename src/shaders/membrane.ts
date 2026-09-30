/** Cubierta: polyester coating. Matriz: PVC. Soporte: woven polyester. */
export const membraneShader = /* wgsl */ `
struct Params {
  time: f32, aspect: f32, selectedLayer: f32, scan: f32,
  pointer: vec2f, reduced: f32, inspection: f32,
}
@group(0) @binding(0) var<uniform> params: Params;
const NX: u32 = 64u;
const NY: u32 = 32u;
const FACE: u32 = NX * NY * 6u;
struct Out {
  @builtin(position) position: vec4f,
  @location(0) uv: vec2f,
  @location(1) normal: vec3f,
  @location(2) world: vec3f,
  @location(3) @interpolate(flat) layer: u32,
  @location(4) @interpolate(flat) side: u32,
}
fn separation() -> f32 {
  // An assembled hold, slow separation, an exploded hold, and a soft return.
  let cycle = params.time % 12.0;
  let open = smoothstep(1.3, 4.1, cycle) * (1.0 - smoothstep(9.0, 11.7, cycle));
  return select(max(open, params.inspection), 1.0, params.reduced > 0.5);
}
fn height(uv: vec2f) -> f32 {
  let p = uv * 2.0 - 1.0;
  let motion = 1.0 - params.reduced;
  let curl = 0.20 * cos((p.x + 1.0) * 1.8) + 0.065 * p.y * p.y;
  let breathe = 0.024 * sin(p.x * 2.2 + params.time * 0.55) * motion;
  let bend = (params.pointer.x * p.x * p.y * 0.055 + params.pointer.y * p.x * p.x * 0.045) * motion;
  return curl + breathe + bend;
}
fn sheetNormal(uv: vec2f) -> vec3f {
  let epsilon = 0.002;
  let dx = (height(uv + vec2f(epsilon, 0)) - height(uv - vec2f(epsilon, 0))) / (epsilon * 4.0);
  let dy = (height(uv + vec2f(0, epsilon)) - height(uv - vec2f(0, epsilon))) / (epsilon * 2.4);
  return normalize(vec3f(-dx, -dy, 1.0));
}
@vertex fn vs_main(@builtin(vertex_index) vi: u32, @builtin(instance_index) layer: u32) -> Out {
  let corners = array<vec2f, 6>(vec2f(0,0), vec2f(1,0), vec2f(0,1), vec2f(0,1), vec2f(1,0), vec2f(1,1));
  var uv: vec2f;
  var underside = 0.0;
  var side = 0u;
  var n: vec3f;
  if (vi < FACE * 2u) {
    let local = vi % FACE;
    let cell = local / 6u;
    uv = (vec2f(f32(cell % NX), f32(cell / NX)) + corners[local % 6u]) / vec2f(f32(NX), f32(NY));
    underside = select(0.0, 1.0, vi >= FACE);
    n = sheetNormal(uv) * (1.0 - 2.0 * underside);
    side = select(0u, 1u, vi >= FACE);
  } else {
    let local = vi - FACE * 2u;
    let edge = local / 6u;
    let corner = corners[local % 6u];
    underside = corner.y;
    side = 1u;
    if (edge < NX) {
      uv = vec2f((f32(edge) + corner.x) / f32(NX), 0.0); n = vec3f(0,-1,0);
    } else if (edge < NX * 2u) {
      uv = vec2f((f32(edge - NX) + corner.x) / f32(NX), 1.0); n = vec3f(0,1,0);
    } else if (edge < NX * 2u + NY) {
      uv = vec2f(0.0, (f32(edge - NX * 2u) + corner.x) / f32(NY)); n = vec3f(-1,0,0);
    } else {
      uv = vec2f(1.0, (f32(edge - NX * 2u - NY) + corner.x) / f32(NY)); n = vec3f(1,0,0);
    }
  }
  let thickness = select(0.014, 0.009, layer == 1u);
  let elevation = (1.0 - f32(layer)) * (0.022 + separation() * 0.32);
  var world = vec3f((uv.x * 2.0 - 1.0), (uv.y * 2.0 - 1.0) * 0.60, height(uv) + elevation - underside * thickness);
  // Orthographic studio camera, with restrained cursor parallax.
  let cursor = params.pointer * (1.0 - params.reduced);
  let screen = vec2f(world.x * 0.82 + world.y * 0.56 + cursor.x * world.z * 0.06,
    -world.x * 0.23 + world.y * 0.52 + world.z * 0.94 + cursor.y * world.z * 0.05);
  let fit = min(0.83, params.aspect * 0.76);
  var out: Out;
  out.position = vec4f(screen.x * fit / params.aspect, (screen.y - 0.035) * fit, 0.5 - world.z * 0.22 - world.y * 0.11 + world.x * 0.015, 1.0);
  out.uv = uv; out.normal = n; out.world = world; out.layer = layer; out.side = side;
  return out;
}
fn hash(p: vec2f) -> f32 { return fract(sin(dot(p, vec2f(127.1,311.7))) * 43758.5453); }
@fragment fn fs_main(in: Out) -> @location(0) vec4f {
  let light = normalize(vec3f(-0.65 + params.pointer.x * 0.65, -0.55 + params.pointer.y * 0.55, 0.72));
  var n = normalize(in.normal);
  var base = vec3f(0.72, 0.735, 0.715);
  var roughness = 0.30;
  var microShadow = 1.0;
  let grid = in.uv * vec2f(112.0, 67.0);
  let footprint = max(fwidth(grid.x), fwidth(grid.y));
  if (in.layer == 1u) { base = vec3f(0.125,0.135,0.14); roughness = 0.43; }
  if (in.layer == 2u && in.side == 0u) {
    let phase = grid * 6.283185;
    let parity = cos(floor(grid.x) * 3.141593) * cos(floor(grid.y) * 3.141593);
    let warp = pow(0.5 + 0.5 * cos(phase.x), 3.0);
    let weft = pow(0.5 + 0.5 * cos(phase.y), 3.0);
    let detail = 1.0 - smoothstep(0.65, 1.7, footprint);
    let relief = mix(warp, weft, 0.5 + parity * 0.35);
    let slope = vec2f(sin(phase.x) * (0.5 + parity * 0.28), sin(phase.y) * (0.5 - parity * 0.28));
    n = normalize(n + vec3f(slope * 0.30 * detail, 0));
    microShadow = 1.0 - (1.0 - relief) * 0.25 * detail;
    base = mix(vec3f(0.49,0.485,0.44), vec3f(0.80,0.79,0.71), relief * detail + 0.42 * (1.0 - detail));
    // Fine fibre streaks within the larger over-and-under yarns.
    let fibres = sin(phase.x * 4.0) * sin(phase.y * 4.0);
    base += fibres * 0.018 * detail;
    roughness = 0.63;
  } else {
    let grain = hash(floor(in.uv * vec2f(1400.0,840.0))) - 0.5;
    base += grain * 0.024;
  }
  let diffuse = max(dot(n, light), 0.0);
  let eye = normalize(vec3f(0.15,-0.70,1.2));
  let halfway = normalize(light + eye);
  let shine = pow(max(dot(n, halfway), 0.0), mix(90.0,18.0,roughness));
  let fresnel = pow(1.0 - abs(dot(n,eye)), 3.0);
  var color = base * (0.52 + diffuse * 0.55) * microShadow + vec3f(0.22) * shine + vec3f(0.055) * fresnel;
  // Occlusion grows as the sheets settle back into the assembled laminate.
  let contact = (1.0 - separation()) * select(0.0, 0.15, in.layer > 0u);
  color *= 1.0 - contact;
  if (in.side == 1u) { color *= 0.64; }
  let selected = abs(params.selectedLayer - f32(in.layer)) < 0.25;
  if (selected) {
    let edgeDistance = min(min(in.uv.x,1.0-in.uv.x),min(in.uv.y,1.0-in.uv.y));
    let edge = 1.0 - smoothstep(0.002,0.009,edgeDistance);
    let scanPosition = params.scan * 1.4 - 0.2;
    let band = exp(-pow((in.uv.x + in.uv.y * 0.16 - scanPosition) / 0.06, 2.0));
    let moving = select(band, 0.0, params.reduced > 0.5 || params.scan <= 0.0 || params.scan >= 1.0);
    color = mix(color, vec3f(0.647,0.212,0.388), 0.08 + edge * 0.46 + moving * 0.65);
    color += moving * vec3f(0.09,0.025,0.04);
  }
  return vec4f(clamp(color,vec3f(0),vec3f(1)),1.0);
}
`;

export const membranePresentShader = /* wgsl */ `
@group(0) @binding(0) var scene: texture_2d<f32>;
@group(0) @binding(1) var sceneSampler: sampler;
@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let sheet = textureSampleLevel(scene, sceneSampler, uv, 0.0);
  let p = (uv - vec2f(0.51,0.73)) / vec2f(0.34,0.080);
  let shadow = exp(-dot(p,p) * 1.8) * 0.17;
  let stage = vec3f(0.910,0.914,0.902) - vec3f(shadow);
  return vec4f(sheet.rgb + stage * (1.0 - sheet.a),1.0);
}
`;
export const MEMBRANE_VERTEX_COUNT = 64 * 32 * 6 * 2 + (64 * 2 + 32 * 2) * 6;
