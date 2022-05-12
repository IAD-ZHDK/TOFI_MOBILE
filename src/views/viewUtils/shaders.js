let pointCount = 3

export let vshader1 = `
attribute vec3 aPosition;
varying vec2 vPos;
void main() {
  vPos = vec2(aPosition.x,aPosition.y);
	gl_Position = vec4(aPosition,1.0);
}
`;

export let fshader1 = `
#ifdef GL_ES
precision lowp float;
#endif
uniform vec2 c;
uniform vec2 u_resolution;
uniform vec2 u_points[${pointCount}];
uniform lowp sampler2D u_tex0;
uniform highp float u_time;

void main()
{
  highp vec2 height;  
  highp vec2 tc = gl_FragCoord.xy/u_resolution.xy; // original frame coordinate
   for (int i = 0; i < ${pointCount}; i++) {
      highp float freq = 0.3;
      lowp vec2 centre = u_points[i].xy/u_resolution;
      highp vec2 p = 1.0 * (tc-centre); // difference between frame and target
      highp float distance = length(p);
      height = height+(p/distance) * freq * max(0.3, 2.-distance) * cos ( distance * 24.0 - u_time*4.0) *0.07;
  }
   highp vec2 uv = fract(tc + height);
   gl_FragColor = texture2D(u_tex0,uv);
}
`;
// inspiration from https://www.shadertoy.com/view/3t2SRV

export let vshader2 = `
attribute vec3 aPosition;
varying vec2 vPos;
void main() {
  vPos = vec2(aPosition.x,aPosition.y);
	gl_Position = vec4(aPosition,1.0);
}
`;

export let fshader2 = `#ifdef GL_ES
precision highp float;
#endif
uniform vec2 c;
uniform vec2 u_resolution;
const int u_pointCount = 5;
uniform vec3 u_points[u_pointCount];
uniform lowp sampler2D u_tex0;
uniform highp float u_time;

//Ripples variables
const float rFrequency = 80.0;
//const float rSpeed = .08;
// const float rThickness = 8.0;

//const float radiusStart = .08;
const float PI = 3.1415926535897932384626433832795;

float time = 0.0;
float rSpeed = .08;
float scaling = .1;
float radiusEnd = .45;
float radialNoise(vec2 uv){
    //Matches sampling to speed of ripples
    uv.y -= rSpeed*time;
    const int octaves = 2;
    //Increasing scale makes noise more fine-grained
    const float scale = .02;
    //Increasing power makes noise more 'solid' at outer ripple edge
        float power = 0.6;
     // float power = 0.3 * (scaling*1.1);
    float total = 0.0;
    for(int i = 0; i<octaves; i++){
        total += texture2D(u_tex0,uv*(power*scale)).r*(1.0/power);
        power *=2.0;
    }
    return total;
}

void main()
{
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = gl_FragCoord.xy/u_resolution.xy;
    uv.x *= u_resolution.x/u_resolution.y;
    float ripple;

    for (int i = 0; i < u_pointCount; i++) {
    // get parameters 
        scaling = 1.0-u_points[i].z;
        float rThickness = scaling*6.0;
        float radiusStart = scaling*.08;
        rSpeed = 0.2;
        radiusEnd = 1.3-scaling;
        time = u_time+(u_points[i].x+u_points[i].y*3.2);
   
        vec2 center = u_points[i].xy;
    
       
        center.x *= u_resolution.x/u_resolution.y;
        
        vec2 toCenter = uv-center;
        float dist = length(toCenter);
        //Ripples
        float distScalar = max(0.0, 1.0 - dist/radiusEnd);
        float innerripple = sin((dist-rSpeed*time)*rFrequency);
        innerripple = max(0.0, innerripple);
        innerripple = pow(innerripple, rThickness);
        innerripple = (dist>radiusStart) ? innerripple*distScalar : 0.0;
        ripple += innerripple;
    }
    //Add rough edges with noise sampled via polar coordinates
    //X: angle from UV to center
    //Y: dist from center
    vec2 toCenter = vec2(0.5,0.5);
    float dist = length(toCenter);
    float angle = atan(toCenter.x, toCenter.y);
    angle = (angle + PI) / (2.0 * PI);
    float noise = radialNoise(vec2(angle, dist));

    //Clamp to black and white
    float total = ripple;
    total -= noise;
    total = total < .01 ? 0.0 : 1.0;

    //Debug
    //Ripples (no rough edges), with start and end zones
    //fragColor = vec4(ripple+.5,dist>radiusEnd?1.0:0.0,dist<radiusStart?1.0:0.0,1.0);
    //Noise
    //fragColor = vec4(fragCoord.x/u_resolution.x>.5 ? total : smoothstep(.48,.52,noise));

    // Output to screen
    gl_FragColor = vec4(total);
}`;