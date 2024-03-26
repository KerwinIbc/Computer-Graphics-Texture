// lighting uniform variables -- these can be set once and left alone:
uniform float   uKa, uKd, uKs;	 // coefficients of each type of lighting -- make sum to 1.0
//uniform vec3    uColor;		 // object color
uniform vec3    uSpecularColor;	 // light color
uniform float   uShininess;	 // specular exponent
uniform float angx,angy;
uniform int sign;
//uniform float R,Sc,Tc;
// square-equation uniform variables -- these should be set every time Display( ) is called:

//uniform float   uS0, uT0, uD;
uniform sampler3D Noise3;
uniform int uUseXYZforNoise;
uniform float uNoiseFreq,uNoiseAmp;
uniform float uAd,uTol,uBd;
// in variables from the vertex shader and interpolated in the rasterizer:
const vec3 Cyan = vec3(0.,1.,1.);
const vec3 White = vec3(1.,1.,1.);
const vec3 Red = vec3(1.,0.,0.);

varying  vec3  vN;		   // normal vector
varying  vec3  vL;		   // vector from point to light
varying  vec3  vE;		   // vector from point to eye
varying  vec2  vST;		   // (s,t) texture coordinates
varying  vec3 vMCposition;
//varying  float vX,vY;
vec3
RotateNormal( float angx, float angy, vec3 n )
{
	float cx = cos( angx );
	float sx = sin( angx );
	float cy = cos( angy );
	float sy = sin( angy );

	// rotate about x:
	float yp =  n.y*cx - n.z*sx;    // y'
	n.z      =  n.y*sx + n.z*cx;    // z'
	n.y      =  yp;
	// n.x      =  n.x;

	// rotate about y:
	float xp =  n.x*cy + n.z*sy;    // x'
	n.z      = -n.x*sy + n.z*cy;    // z'
	n.x      =  xp;
	// n.y      =  n.y;

	return normalize( n );
}


void
main( )
{
	/*vec4 nv;
	float s = vST.s;
	float t = vST.t;
	float Ar = uAd/2.;
	float Br = uBd/2.;
	int numins = int(s/uAd);
	int numint = int(t/uBd);
	//float R = float(uD/2.);
	float sc = float(numins)*uAd + Ar;
	float tc = float(numint)*uBd + Br;
	if(uUseXYZforNoise == 1)
		nv = texture3D(Noise3,uNoiseFreq * vMCposition);
	else
		nv = texture3D(Noise3,uNoiseFreq * vec3(vST,0.));
	float n = nv.r + nv.g + nv.b + nv.a;
	n = n-2.;
	n *= uNoiseAmp;
	float ds = s - sc;
	float dt = t - tc;
	float oldDist = sqrt(ds*ds + dt*dt);
	float newDist = oldDist + n;
	float scale = newDist/oldDist;
	ds*=scale;
	ds/=Ar;
	dt*=scale;
	dt/=Br;
	float kk = ds*ds + dt*dt;



	// determine the color using the square-boundary equations:

	//float r = sqrt(vX*vX+vY*vY);
	//float rfact = fract(4.*r);
	//float tt = smoothstep(0.2,0.4,rfact)-smoothstep(0.6,1.,rfact);
	//float d = (s-sc)*(s-sc)/(Ar*Ar) + (t-tc)*(t-tc)/(Br*Br);
	float tt = smoothstep(1.-uTol,1.+uTol,kk);
	//float tt = smoothstep(0.5,1.9,d)-smoothstep(1.9,2.4,d);*/
	//vec3 myColor = mix(White,Cyan,tt);
	vec4 nvx = texture3D( Noise3, uNoiseFreq*vMCposition );
	float angx = nvx.r + nvx.g + nvx.b + nvx.a  -  2.;	// -1. to +1.
	angx *= uNoiseAmp;

	vec4 nvy = texture3D( Noise3,uNoiseFreq*vec3(vMCposition.xy,vMCposition.z+0.5) );
	float angy = nvy.r + nvy.g + nvy.b + nvy.a  -  2.;	// -1. to +1.
	angy *= uNoiseAmp;
	vec3 myColor = Cyan;
	// apply the per-fragmewnt lighting to myColor:

	vec3 Normal = normalize(vN);
	if(sign < 0)
	{
		Normal = RotateNormal(angx, angy, Normal);
	}
	Normal = normalize(gl_NormalMatrix*Normal);
	vec3 Light  = normalize(vL);
	vec3 Eye    = normalize(vE);

	vec3 ambient = uKa * myColor;

	float dd = max( dot(Normal,Light), 0. );       // only do diffuse if the light can see the point
	vec3 diffuse = uKd * dd * myColor;

	float ss = 0.;
	if( dot(Normal,Light) > 0. )	      // only do specular if the light can see the point
	{
		vec3 ref = normalize(  reflect( Light, Normal )  );
		ss = pow( max( dot(Eye,ref),0. ), uShininess );
	}
	vec3 specular = uKs * ss * uSpecularColor;
	gl_FragColor = vec4( ambient + diffuse + specular,  1. );
}


