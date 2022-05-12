attribute vec3 aPosition;
varying vec2 vPos;
void main() {
    vPos = vec2(aPosition.x,aPosition.y);
    gl_Position = vec4(aPosition,1.0);
}