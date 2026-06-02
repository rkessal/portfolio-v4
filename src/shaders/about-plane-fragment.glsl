precision highp float;
uniform sampler2D tMap;
uniform vec2 uPlaneSizes;
uniform vec2 uImageSizes;

uniform float uRGBSplit;
uniform float uSaturation;
uniform float uAlpha;
uniform float uProgress;
varying vec2 vUv;

void main() {
    vec2 ratio = vec2(
        min((uPlaneSizes.x / uPlaneSizes.y) / (uImageSizes.x / uImageSizes.y), 1.0),
        min((uPlaneSizes.y / uPlaneSizes.x) / (uImageSizes.y / uImageSizes.x), 1.0)
    );

    vec2 uv = vec2(
        vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
        vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
    );

    float offset = uRGBSplit * 0.004;
    float r = texture2D(tMap, vec2(uv.x + offset, uv.y)).r;
    float g = texture2D(tMap, uv).g;
    float b = texture2D(tMap, vec2(uv.x - offset, uv.y)).b;
    float a = texture2D(tMap, uv).a;

    vec4 tex = vec4(r, g, b, a);
    tex.a *= uProgress * uAlpha;

    float grey = dot(tex.rgb, vec3(0.299, 0.587, 0.114));
    tex.rgb = mix(vec3(grey), tex.rgb, uSaturation);

    gl_FragColor = tex;
}