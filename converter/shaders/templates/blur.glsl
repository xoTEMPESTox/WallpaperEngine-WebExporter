precision mediump float;

varying vec2 vTextureCoord;
uniform sampler2D uSampler;

uniform float u_strength;

void main() {
    vec4 sum = vec4(0.0);
    vec2 texcoord = vTextureCoord;
    float radius = u_strength;

    sum += texture2D(uSampler, vec2(texcoord.x - 4.0 * radius, texcoord.y)) * 0.05;
    sum += texture2D(uSampler, vec2(texcoord.x - 3.0 * radius, texcoord.y)) * 0.09;
    sum += texture2D(uSampler, vec2(texcoord.x - 2.0 * radius, texcoord.y)) * 0.12;
    sum += texture2D(uSampler, vec2(texcoord.x - 1.0 * radius, texcoord.y)) * 0.15;
    sum += texture2D(uSampler, vec2(texcoord.x, texcoord.y)) * 0.16;
    sum += texture2D(uSampler, vec2(texcoord.x + 1.0 * radius, texcoord.y)) * 0.15;
    sum += texture2D(uSampler, vec2(texcoord.x + 2.0 * radius, texcoord.y)) * 0.12;
    sum += texture2D(uSampler, vec2(texcoord.x + 3.0 * radius, texcoord.y)) * 0.09;
    sum += texture2D(uSampler, vec2(texcoord.x + 4.0 * radius, texcoord.y)) * 0.05;

    gl_FragColor = sum;
}