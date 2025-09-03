#include "common.h"
#include "common_blending.h"

// [COMBO] {"material":"ui_editor_properties_blend_mode","combo":"BLENDMODE","type":"imageblending","default":0}
// [COMBO] {"material":"Operator","combo":"TONEMAP","type":"options","default":0,"options":{"Linear":0,"Exponential":1,"Logarithmic":2,"Reinhard":3,"Luminance based Reinhard":4,"RomBinDaHouse":5,"Filmic":6,"Uncharted 2":7,"ACES":8}}
// [COMBO] {"material":"Adjust display gamma","combo":"GAMMA","type":"options","default":0}
// [COMBO] {"material":"Invert mask","combo":"INVERTMASK","type":"options","default":0}

uniform float a_alpha; // {"material":"Opacity","default":1,"range":[0, 1]}
uniform float a_displayInitGamma; // {"material":"Initial display gamma","default":2.2,"range":[0,16]}
uniform float a_displayGamma; // {"material":"Corrected display gamma","default":2.2,"range":[0,16]}

uniform float t_whiteAdjustment; // {"material":"White level adjustment","default":2,"range":[0,10]}
uniform float t_exposureAdjustment; // {"material":"Exposure adjustment","default":1,"range":[0,2]}
uniform float t_lumaSaturation; // {"material":"Luminance saturation","default":1,"range":[1,3]}
uniform float t_shoulderStrength; // {"material":"Shoulder strength","default":0.15,"range":[0,1]}
uniform float t_linearStrength; // {"material":"Linear strength","default":0.5,"range":[0,1]}
uniform float t_linearAngle; // {"material":"Linear angle","default":0.1,"range":[0,1]}
uniform float t_toeStrength; // {"material":"Toe strength","default":0.2,"range":[0,1]}
uniform float t_toeNumerator; // {"material":"Toe numerator","default":0.02,"range":[0,1]}
uniform float t_toeDenominator; // {"material":"Toe denominator","default":0.3,"range":[0,1]}

uniform sampler2D g_Texture0; // {"material":"framebuffer","label":"ui_editor_properties_framebuffer","hidden":true}
uniform sampler2D g_Texture1; // {"combo":"MASK","default":"util/white","label":"ui_editor_properties_opacity_mask","material":"mask","mode":"opacitymask","paintdefaultcolor":"0 0 0 1"}

#if GAMMA
#define startGamma a_displayInitGamma
#define endGamma a_displayGamma
#else
#define startGamma 2.2
#define endGamma 2.2
#endif

varying vec4 v_TexCoord;

const mat3 aces_input_matrix = mat3(
	0.613097, 0.339523, 0.047379,
	0.070194, 0.916354, 0.013452,
	0.020616, 0.109570, 0.869815
);

const mat3 aces_output_matrix = mat3(
	1.705052, -0.621792, -0.083258,
	-0.130257, 1.140805, -0.010547,
	-0.024004, -0.128969, 1.152972
);

vec3 linearMapping(vec3 color) {
	color *= t_exposureAdjustment;
	return color;
}

vec3 exponential(vec3 color) {
	color *= t_exposureAdjustment;
	float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));
	float toneMappedLuminance = 1.0 - exp(-luma / t_whiteAdjustment);
	color = toneMappedLuminance * pow(color / luma, t_lumaSaturation);
	return color;
}

vec3 logarithmic(vec3 color) {
	color *= t_exposureAdjustment;
	float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));
	float toneMappedLuminance = log10(1.0 + luma) / log10(1.0 + t_whiteAdjustment);
	color = toneMappedLuminance * pow(color / luma, t_lumaSaturation);
	return color;
}

vec3 reinhard(vec3 color) {
	color *= t_exposureAdjustment;
	vec3 whiteLevel = 1.0 + color / (t_whiteAdjustment * t_whiteAdjustment);
	color = color * whiteLevel / (1.0 + color);
	return color;
}

vec3 lumaBasedReinhard(vec3 color) {
	color *= t_exposureAdjustment;
	float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));
	float whiteLevel = 1.0 + luma / (t_whiteAdjustment * t_whiteAdjustment);
	float toneMappedLuma = luma * whiteLevel / (1.0 + luma);
	color *= toneMappedLuma / luma;
	return color;
}

vec3 RomBinDaHouse(vec3 color) {
	color *= t_exposureAdjustment;
	color = exp(-1.0 / (2.72 * color + 0.15));
	return color;
}

vec3 filmic(vec3 color) {
	color = max(0.0, color - 0.004) * t_exposureAdjustment;
	color = (color * (6.2 * color + 0.5)) / (t_whiteAdjustment * color * (6.2 * color + 1.7) + 0.06);
	return color;
}

vec3 Uncharted2(vec3 color) {
	color *= t_exposureAdjustment;
	float A = t_shoulderStrength;
	float B = t_linearStrength;
	float C = t_linearAngle;
	float D = t_toeStrength;
	float E = t_toeNumerator;
	float F = t_toeDenominator;
	float W = t_whiteAdjustment;
	color = ((color * (A * color + C * B) + D * E) / (color * (A * color + B) + D * F)) - E / F;
	float white = ((W * (A * W + C * B) + D * E) / (W * (A * W + B) + D * F)) - E / F;
	color /= white;
	return color;
}

vec3 ACES(vec3 color) {
	color = mul(aces_input_matrix, color);
	vec3 a = color * t_exposureAdjustment * (color + 0.0245786) - 0.000090537;
	vec3 b = color * t_whiteAdjustment * (0.983729 * color + 0.4329510) + 0.238081;
	color = mul(aces_output_matrix, a / b);
	return color;
}

void main() {
	vec4 albedo = texSample2D(g_Texture0, v_TexCoord.xy);
	vec4 baseAlbedo = albedo;

	albedo = pow(albedo, startGamma);

#if TONEMAP == 0
	albedo = vec4(linearMapping(albedo.rgb), albedo.a);
#endif
#if TONEMAP == 1
	albedo = vec4(exponential(albedo.rgb), albedo.a);
#endif
#if TONEMAP == 2
	albedo = vec4(logarithmic(albedo.rgb), albedo.a);
#endif
#if TONEMAP == 3
	albedo = vec4(reinhard(albedo.rgb), albedo.a);
#endif
#if TONEMAP == 4
	albedo = vec4(lumaBasedReinhard(albedo.rgb), albedo.a);
#endif
#if TONEMAP == 5
	albedo = vec4(RomBinDaHouse(albedo.rgb), albedo.a);
#endif
#if TONEMAP == 6
	albedo = vec4(filmic(albedo.rgb), albedo.a);
#endif
#if TONEMAP == 7
	albedo = vec4(Uncharted2(albedo.rgb), albedo.a);
#endif
#if TONEMAP == 8
	albedo = vec4(ACES(albedo.rgb), albedo.a);
#endif

#if TONEMAP != 6
	albedo = pow(albedo, 1.0 / startGamma);
#endif

	float mask = texSample2D(g_Texture1, v_TexCoord.xy).r;
#if INVERTMASK
	mask = 1.0 - mask;
#endif
	if (mask > 0.0) {
		albedo.rgb = ApplyBlending(BLENDMODE, baseAlbedo.rgb, albedo.rgb, mask * albedo.a * a_alpha);
		albedo = vec4(pow(albedo.rgb, 2.2 / endGamma), albedo.a);
		albedo = mix(baseAlbedo, albedo, mask * a_alpha);
	} else albedo = baseAlbedo;

	gl_FragColor = albedo;
}
