precision highp float;
uniform sampler2D tMap;
uniform vec2 uPlaneSizes;
uniform vec2 uImageSizes;

uniform float uAlpha;
uniform float uRotation;
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

    vec4 tex = texture2D(tMap, uv);
    tex.a *= uProgress * uAlpha;

    float grey = dot(tex.rgb, vec3(0.299, 0.587, 0.114));
    tex.rgb = mix(vec3(grey), tex.rgb, 1.0 - (uRotation * 2.0));

    gl_FragColor = tex;
}