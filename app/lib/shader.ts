export const vertexShader = `#version 300 es
in vec2 a_position;

void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

export const fragmentShader = `#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform float u_darkMode;
uniform float u_scroll;
uniform vec2 u_spotlight;

out vec4 outputColor;

vec2 mod289(vec2 value) {
  return value - floor(value * (1.0 / 289.0)) * 289.0;
}

vec3 mod289(vec3 value) {
  return value - floor(value * (1.0 / 289.0)) * 289.0;
}

vec3 permute(vec3 value) {
  return mod289(((value * 34.0) + 10.0) * value);
}

float simplexNoise(vec2 point) {
  const vec4 c = vec4(
    0.211324865405187,
    0.366025403784439,
    -0.577350269189626,
    0.024390243902439
  );

  vec2 lattice = floor(point + dot(point, c.yy));
  vec2 origin = point - lattice + dot(lattice, c.xx);
  vec2 corner = origin.x > origin.y ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 offsets = origin.xyxy + c.xxzz;
  offsets.xy -= corner;

  lattice = mod289(lattice);
  vec3 perm = permute(
    permute(lattice.y + vec3(0.0, corner.y, 1.0))
      + lattice.x
      + vec3(0.0, corner.x, 1.0)
  );

  vec3 weight = max(
    0.5 - vec3(
      dot(origin, origin),
      dot(offsets.xy, offsets.xy),
      dot(offsets.zw, offsets.zw)
    ),
    0.0
  );
  weight *= weight;
  weight *= weight;

  vec3 gx = 2.0 * fract(perm * c.www) - 1.0;
  vec3 gy = abs(gx) - 0.5;
  vec3 gz = floor(gx + 0.5);
  vec3 g = gx - gz;
  weight *= 1.79284291400159
    - 0.85373472095314 * (g * g + gy * gy);

  vec3 contrib;
  contrib.x = g.x * origin.x + gy.x * origin.y;
  contrib.yz = g.yz * offsets.xz + gy.yz * offsets.yw;
  return 130.0 * dot(weight, contrib);
}

float ditherFbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.52;
  mat2 rotation = mat2(0.80, -0.60, 0.60, 0.80);
  for (int i = 0; i < 5; i++) {
    value += amplitude * clamp(simplexNoise(p) * 0.5 + 0.5, 0.0, 1.0);
    p = rotation * p * 2.03 + 11.7;
    amplitude *= 0.48;
  }
  return value;
}

float bayer4(vec2 p) {
  int x = int(mod(p.x, 4.0));
  int y = int(mod(p.y, 4.0));
  int i = y * 4 + x;
  float values[16];
  values[0] = 0.0;  values[1] = 8.0;  values[2] = 2.0;  values[3] = 10.0;
  values[4] = 12.0; values[5] = 4.0;  values[6] = 14.0; values[7] = 6.0;
  values[8] = 3.0;  values[9] = 11.0; values[10] = 1.0; values[11] = 9.0;
  values[12] = 15.0; values[13] = 7.0; values[14] = 13.0; values[15] = 5.0;
  return values[i] / 16.0;
}

void main() {
  const float pixelSize = 2.0;
  vec2 ditherCoord = floor(gl_FragCoord.xy / pixelSize);
  vec2 pixelCoord = (ditherCoord + 0.5) * pixelSize;
  vec2 uv = pixelCoord / u_resolution;
  vec2 p = uv - 0.5;
  p.x *= u_resolution.x / max(u_resolution.y, 1.0);

  vec3 dark = vec3(0.0235, 0.0235, 0.0275);
  vec3 light = vec3(0.9686, 0.9686, 0.9725);
  vec3 background = mix(light, dark, u_darkMode);
  vec3 foreground = mix(dark, light, u_darkMode);

  // Cursor interaction
  vec2 cursor = u_mouse - 0.5;
  cursor.x *= u_resolution.x / max(u_resolution.y, 1.0);
  float cursorField = exp(-4.2 * length(p - cursor));

  // Spotlight interaction (from project card hover)
  vec2 spot = u_spotlight - 0.5;
  spot.x *= u_resolution.x / max(u_resolution.y, 1.0);
  float spotField = u_spotlight.x > -0.5 ? exp(-5.0 * length(p - spot)) : 0.0;

  // Noise field with scroll and time animation
  vec2 q = p * 1.22;
  float scrollOff = u_scroll * 0.3;
  float field = ditherFbm(q * 2.1 + vec2(u_time * 0.045 + scrollOff, -u_time * 0.025));
  field += 0.24 * sin((q.x - q.y) * 3.6 - u_time * 0.16);
  field += cursorField * 0.18;
  field += spotField * 0.14;

  // Bayer dithering
  float threshold = bayer4(ditherCoord);
  float dots = step(threshold, clamp(field * 0.9 - 0.12, 0.0, 1.0));

  // Mix foreground dots onto background
  float dotStrength = mix(0.22, 0.34, u_darkMode);
  vec3 color = mix(background, foreground, dots * dotStrength);

  // Accent tint near cursor and spotlight
  vec3 accent = vec3(0.388, 0.400, 0.945); // indigo
  float accentMix = (cursorField + spotField) * dots * 0.25;
  color = mix(color, accent, accentMix * u_darkMode);

  // Vignette
  float vignette = smoothstep(1.12, 0.30, length(p * vec2(0.70, 1.0)));
  color = mix(background, color, 0.74 + vignette * 0.26);

  outputColor = vec4(color, 1.0);
}
`;
