uniform sampler2D g_Texture0; // {"material":"textureM","label":"base texture","hidden":true}
uniform sampler2D g_Texture1; // {"material":"texture_depthM","label":"texture_depthmap","hidden":false}
uniform vec2 g_PointerPosition;
uniform float u_userDistanceStrengthSlider; // {"material":"1. strength/ distance","default":0,"range":[0,1]}
uniform float u_userMidlevelSlider; // {"material":"2. midlevel","default":0.5,"range":[0,1]}
uniform float u_userNormalizeCenter; // {"material":"3. normalize to center", "int":true, "default":1,"range":[0,1]}
uniform float u_userInvertDepthMap; // {"material":"4. invert depth map", "int":true, "default":1,"range":[0,1]}



varying vec4 v_TexCoord;

void main() {	
	float depth = texSample2D(g_Texture1, v_TexCoord.zw).x;

	if(u_userInvertDepthMap){
		depth = 1.0 - depth;
	}

	//get distance to focal point
	vec2 imageCenter = vec2(0.5, 0.5);
	vec2 mousePosition = vec2(min(max(g_PointerPosition.x, 0.0), 1.0), min(max(g_PointerPosition.y, 0.0), 1.0));
	vec2 imageFocus = mousePosition;
	vec2 focusVector = vec2(v_TexCoord.x, v_TexCoord.y) - imageFocus;
	float distanceToFocus = sqrt(dot(focusVector,focusVector) + dot(imageCenter, imageCenter))*0.9;

	//add midlvel
	depth = (depth - u_userMidlevelSlider) * 2;
	//distance ratio to pixel conversion
	depth = depth * 0.05 * u_userDistanceStrengthSlider;

	vec2 parallax_shift;
	if(u_userNormalizeCenter){
		parallax_shift = vec2(v_TexCoord.xy) + depth/2 * (focusVector - (vec2(v_TexCoord.zw)-imageCenter));
	} else{
		parallax_shift = vec2(v_TexCoord.xy) + depth * focusVector;
	}

	vec4 albedo = texSample2D(g_Texture0, parallax_shift.xy);

	gl_FragColor = vec4(albedo);
}