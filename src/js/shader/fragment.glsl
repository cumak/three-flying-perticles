precision mediump float;

varying vec2 vUv;
varying float vDelayPosZ;
uniform sampler2D uTex;
uniform sampler2D uTex2;
uniform sampler2D uTex3;
uniform sampler2D uTex4;
uniform float uProgress;
uniform float uScrollProgress;
uniform float uCameraZ;

#pragma glslify: blendOverlay = require(glsl-blend/overlay)
#pragma glslify: blendHardMix = require(glsl-blend/hard-mix)
#pragma glslify: hsl2rgb = require(glsl-hsl2rgb);

void main() {
  if(distance(gl_PointCoord, vec2(0.5, 0.5)) > 0.5) {
    discard;
  }

  float hlsColor;
  // 左上に向かってレインボー。それをz軸の位置によっても色かえ
  hlsColor = vUv.x * vUv.y * (uCameraZ / vDelayPosZ);
  // hlsColor = vUv.x * vUv.y;

  // hlsをrgbに変換
  vec3 rgb = hsl2rgb(hlsColor , 0.8 , 0.5);

  vec4 tex = texture(uTex, vUv);
  vec4 tex2 = texture(uTex2, vUv);
  vec4 tex3 = texture(uTex3, vUv);
  vec4 tex4 = texture(uTex4, vUv);

  float onePageSawyer = fract(uScrollProgress * 3.);
  
  // uScrollProgressにより画像変換
  vec4 texColor;
  if(uScrollProgress < 1. / 3. * 1.){
    texColor = mix(tex, tex2, onePageSawyer);
  }else if(uScrollProgress < 1. / 3. * 2.){
    texColor = mix(tex2, tex3, onePageSawyer);
  }else if(uScrollProgress < 1. / 3. * 3.){
    texColor = mix(tex3, tex4, onePageSawyer);
  }else if(uScrollProgress >= 1. ){
    texColor = tex4;
  }
  
  // レインボーと画像の大理石をblendする
  vec3 texRgb = blendOverlay(texColor.rgb, rgb);

  gl_FragColor = vec4(texRgb, texColor.a);
}