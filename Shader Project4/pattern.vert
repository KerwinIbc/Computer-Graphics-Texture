// out variables to be interpolated in the rasterizer and sent to each fragment shader:
uniform float uA,uB,uC,uD;
const float pi = 3.1415926;
varying  vec3  vN;	  // normal vector
varying  vec3  vL;	  // vector from point to light
varying  vec3  vE;	  // vector from point to eye
varying  vec2  vST;	  // (s,t) texture coordinates
varying  vec3 vMCposition;
varying  float vX,vY;
// where the light is:

const vec3 LightPosition = vec3(  0., 5., 5. );

void
main( )
{



	vST = gl_MultiTexCoord0.st;
	vMCposition = gl_Vertex.xyz;
	vec4 ECposition = gl_ModelViewMatrix * gl_Vertex;

	vL = LightPosition - ECposition.xyz;	    // vector from the point
							// to the light position
	vE = vec3( 0., 0., 0. ) - ECposition.xyz;       // vector from the point
							// to the eye position
	vec3 vert = vMCposition.xyz;

	float r = sqrt(vert.x*vert.x+vert.y*vert.y);
	float dzdr = uA *( -sin(2.*pi*uB*r+uC) * 2.*pi*uB * exp(-uD*r) + cos(2.*pi*uB*r+uC) * (-uD) * exp(-uD*r));
	float drdx = vert.x/r;
	float drdy = vert.y/r;
	float dzdx = dzdr*drdx;
	float dzdy = dzdr*drdy;
	vec3 Tx = vec3(1.,0.,dzdx);
	vec3 Ty = vec3(0.,1.,dzdy);
	vec3 normal = normalize(cross(Tx,Ty));
	vert.z = uA*cos(2.*pi*uB*r)*exp(-uD*r);
	//vN = normalize( gl_NormalMatrix * gl_Normal );  // normal vector
	vN = normal;
	gl_Position = gl_ModelViewProjectionMatrix * vec4(vert,1);
}
