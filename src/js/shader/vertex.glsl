precision mediump float;

varying vec2 vUv;
varying float vDelayPosZ;
uniform float uCameraZ;
uniform float uProgress;
uniform float uScrollProgress;
attribute float aDelayPosZ;

#pragma glslify: exponential = require(glsl-easings/exponential-out);

void main() {
  vUv = uv;
  vDelayPosZ = aDelayPosZ;

  vec3 pos = position;

  // uProgressが1になるまでに３個山ができる三角波
  float absProgress = abs(2. * fract(uScrollProgress * 3. - .5) - 1.) * 1.;

  // ｚポジションにばらつきを加える（delay具合をかける）
  pos.z += exponential(absProgress) * aDelayPosZ;

  // パーティクルが上下に広がるように
  vec2 xyDirection = (uv - 0.5) * 2.;
  pos.xy += xyDirection * 2000. * pos.z / uCameraZ;

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_PointSize = 2.8 * (uCameraZ / -mvPosition.z);
  gl_Position = projectionMatrix * mvPosition;
}