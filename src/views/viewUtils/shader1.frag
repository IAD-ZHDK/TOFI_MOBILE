#ifdef GL_ES
precision lowp float;
#endif
uniform vec2 c;
uniform vec2 u_resolution;
const int u_pointCount = 5;
uniform vec3 u_points[u_pointCount];
uniform lowp sampler2D u_tex0;
uniform highp float u_time;

//Ripples variables
const float rFrequency = 80.0;
const float rSpeed = .08;
// const float rThickness = 8.0;
const float radiusEnd = .45;
const float radiusStart = .08;
const float PI = 3.1415926535897932384626433832795;



float radialNoise(vec2 uv){
    //Matches sampling to speed of ripples
    uv.y -= rSpeed*u_time;
    const int octaves = 2;
    //Increasing scale makes noise more fine-grained
    const float scale = .042;
    //Increasing power makes noise more 'solid' at outer ripple edge
    float power = 1.9;
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
        vec2 center = u_points[i].xy;
        float rThickness = u_points[i].z;
        center.x *= u_resolution.x/u_resolution.y;
        vec2 toCenter = uv-center;
        float dist = length(toCenter);
        //Ripples
        float distScalar = max(0.0, 1.0 - dist/radiusEnd);
        float innerripple = sin((dist-rSpeed*u_time)*rFrequency);
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
}