#define PI 3.1415926535897932384626433832795
attribute vec3 position;
attribute vec2 uv;

uniform float uProgress;
uniform float uStrength;
uniform vec2 uViewportSizes;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

varying vec2 vUv;

void main() {
    vUv = uv;

    vec4 newPosition = modelViewMatrix * vec4(position, 1.0);

    newPosition.y -= (1.0 - uProgress) * 2.0;
    newPosition.z += sin(newPosition.y / uViewportSizes.y * PI + PI / 2.0) * -abs(uStrength) * 30.0;
    newPosition.x += sin(newPosition.y / uViewportSizes.y * PI) * uStrength * 5.0 ;


    gl_Position = projectionMatrix * newPosition;
}