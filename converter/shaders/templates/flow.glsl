precision mediump float;

varying vec2 vTextureCoord;
uniform sampler2D uSampler;

uniform float u_time;
uniform vec2 u_direction;

void main() {
    vec2 coord = vTextureCoord;
    coord += u_direction * u_time;
    gl_FragColor = texture2D(uSampler, fract(coord));
}