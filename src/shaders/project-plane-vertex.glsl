#define PI 3.1415926535897932384626433832795
attribute vec3 position;
attribute vec2 uv;

uniform float uRotation;
uniform float uProgress;
uniform float uStrength;
uniform vec2 uViewportSizes;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

varying vec2 vUv;

void main() {
    vUv = uv;

    vec4 newPosition = modelViewMatrix * vec4(position, 1.0);

    float angle = uRotation * 0.08;
    float s = sin(angle);
    float c = cos(angle);
    newPosition.xy = mat2(c, -s, s, c) * newPosition.xy;

    newPosition.x += sin(newPosition.y / uViewportSizes.y * PI + PI / 2.0) * uStrength * 7.0;
    newPosition.z += sin(newPosition.y / uViewportSizes.y * PI) * uStrength * 5.0 ;

    gl_Position = projectionMatrix * newPosition;
}