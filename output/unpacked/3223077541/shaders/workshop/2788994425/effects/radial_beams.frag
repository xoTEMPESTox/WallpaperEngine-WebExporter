

uniform sampler2D g_Texture0; // {"material":"framebuffer","label":"ui_editor_properties_framebuffer","hidden":true}
uniform float g_Time;
uniform vec4 g_Texture0Resolution;
uniform float u_speed; // {"material":"Speed","default":0,"range":[-0.5,0.5]}
uniform vec3 u_col1; // {"default":"1 1 1","material":"Colour Inner","type":"color"}
uniform vec3 u_col2; // {"default":"1 1 1","material":"Colour Outer","type":"color"}
uniform float u_rays; // {"material":"Beams","int":true,"default":16,"range":[0,100]}
uniform float u_blur; // {"material":"Smoothness","default":1,"range":[0,10]}
uniform float u_inner; // {"material":"Center Size","default":1,"range":[0.1,5]}
uniform float u_thickness; // {"material":"Thickness","default":0.5,"range":[-1,1]}
uniform float u_xoff; // {"material":"X Offset","default":0,"range":[-2,2]}
uniform float u_yoff; // {"material":"Y Offset","default":0,"range":[-2,2]}
uniform sampler2D g_Texture1; // { "material": "texturekey", "label": "Opacity Mask", "mode": "opacitymask", "combo": "OPACITYMASK", "paintdefaultcolor": "0 0 0 1" }
uniform float u_opacity; // {"material":"Opacity","default":1,"range":[0,1]}

varying vec2 v_TexCoord;
float beams(vec2 uv, float speed, float rays, float blur, float inner, float thickness) {
	float f = atan2(uv.y, uv.x) + (g_Time * speed);
	float fs = sin(f * float(rays))+thickness;
	float circ = length(uv);
	circ = smoothstep(0.0,inner,circ);
	fs *= circ * blur;
	return fs;
}
vec3 my_gradient(vec2 uv, vec3 col1, vec3 col2){
	vec2 puv = vec2(atan2(uv.x,uv.y),length(uv));
	return mix(col1,col2,puv.y);
}
void main() {
	vec4 mask = texSample2D(g_Texture1, v_TexCoord.xy);
	vec2 uv = ((v_TexCoord.xy-0.5)*g_Texture0Resolution.xy)/g_Texture0Resolution.y;
	uv.x += u_xoff;
	uv.y += u_yoff;
	vec4 col = CAST4(0.0);
	vec3 gcol = my_gradient(uv,u_col1,u_col2);
	float radials = 0.0;
	radials += beams(uv,-u_speed, float(u_rays), u_blur, u_inner, u_thickness);
	col += radials;
	col.rgb *= gcol;
	#if OPACITYMASK
	col.a*=mask.r;
	#endif
	gl_FragColor = vec4(col.rgb,col.a*u_opacity);
}