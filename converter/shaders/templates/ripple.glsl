precision mediump float;

varying vec2 vTextureCoord;
uniform sampler2D uSampler;

uniform float u_time;
uniform float u_speed;
uniform float u_amplitude;

void main() {
    vec2 coord = vTextureCoord;
    coord.x += sin(coord.y * 10.0 + u_time * u_speed) * u_amplitude;
    coord.y += cos(coord.x * 10.0 + u_time * u_speed) * u_amplitude;
    gl_FragColor = texture2D(uSampler, coord);
}