precision mediump float;

uniform float u_time;
uniform vec2 u_resolution;
uniform vec3 u_color;

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    vec3 color = 0.5 + 0.5 * cos(u_time + uv.xyx + vec3(0, 2, 4));
    gl_FragColor = vec4(color, 1.0);
}