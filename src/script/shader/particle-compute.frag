#define PI 3.14159265
#define V vec2(0.,1.)
#define saturate(i) clamp(i,0.,1.)

// ---

precision highp float;

uniform float time;
uniform float particleCountSqrt;
uniform bool frameZero;
uniform float deltaTime;

uniform sampler2D textureParticle;
uniform sampler2D textureRandom;

// ---

mat2 rotate2D( float _t ) {
  return mat2( cos( _t ), sin( _t ), -sin( _t ), cos( _t ) );
}

vec3 rotateEuler( vec3 _p, vec3 _r ) {
  vec3 p = _p;
  p.yz = rotate2D( _r.x ) * p.yz;
  p.zx = rotate2D( _r.y ) * p.zx;
  p.xy = rotate2D( _r.z ) * p.xy;
  return p;
}

// ---

float box( in vec3 _pos, in vec3 _size ) {
  vec3 d = abs( _pos ) - _size;
  return min( max( d.x, max( d.y, d.z ) ), 0.0 ) + length( max( d, 0.0 ) );
}

vec3 ifs( vec3 _p, vec3 _rot, vec3 _shift, int _iter ) {
  vec3 p = _p;

  for ( int i = 0; i < 20; i ++ ) {
    if ( _iter <= i ) { break; }

    float intensity = pow( 2.0, -float( i ) );

    p = rotateEuler( p, _rot );

    p = abs( p ) - _shift * intensity;

    if ( p.x < p.y ) { p.xy = p.yx; }
		if ( p.x < p.z ) { p.xz = p.zx; }
		if ( p.y < p.z ) { p.yz = p.zy; }
  }

  return p;
}

float distFunc( in vec3 _p ) {
  vec3 p = _p;
  float dist = 1E9;

  p = ifs(
    _p,
    vec3( 0.39, 0.31, 0.45 ),
    vec3( 0.38, 0.41, 0.5 ),
    3
  );
  float distSphere = box( p, vec3( 0.4, 0.1, 0.1 ) );
  if ( distSphere < dist ) {
    dist = distSphere;
  }

  return dist;
}

vec3 normalFunc( in vec3 _p, in float _d ) {
  vec2 d = V * _d;
  return normalize( vec3(
    distFunc( _p + d.yxx ) - distFunc( _p - d.yxx ),
    distFunc( _p + d.xyx ) - distFunc( _p - d.xyx ),
    distFunc( _p + d.xxy ) - distFunc( _p - d.xxy )
  ) );
}

// ---

void main() {
  vec2 reso = vec2( 4.0, 1.0 ) * particleCountSqrt;

  float type = mod( floor( gl_FragCoord.x ), 4.0 );

  vec3 pos = texture2D( textureParticle, ( gl_FragCoord.xy + vec2( 0.0 - type, 0.0 ) ) / reso ).xyz;
  vec3 vel = texture2D( textureParticle, ( gl_FragCoord.xy + vec2( 1.0 - type, 0.0 ) ) / reso ).xyz;
  vec3 col = texture2D( textureParticle, ( gl_FragCoord.xy + vec2( 2.0 - type, 0.0 ) ) / reso ).xyz;
  vec3 life = texture2D( textureParticle, ( gl_FragCoord.xy + vec2( 3.0 - type, 0.0 ) ) / reso ).xyz;

  vec3 posI = texture2D( textureRandom, ( gl_FragCoord.xy + vec2( 0.0 - type, 0.0 ) ) / reso ).xyz;
  vec3 velI = texture2D( textureRandom, ( gl_FragCoord.xy + vec2( 1.0 - type, 0.0 ) ) / reso ).xyz;
  vec3 colI = texture2D( textureRandom, ( gl_FragCoord.xy + vec2( 2.0 - type, 0.0 ) ) / reso ).xyz;
  vec3 lifeI = texture2D( textureRandom, ( gl_FragCoord.xy + vec2( 3.0 - type, 0.0 ) ) / reso ).xyz;

  vec3 colDef = vec3( 0.3, 0.6, 1.0 );

  if ( frameZero || 0.99 < life.x ) {
    pos = posI;
    pos.y = 2.3;
    pos.zx = ( pos.zx - 0.5 ) * 0.0;

    vel = ( velI - 0.5 ) * 1.0;

    col = saturate( ( colI - 0.5 ) * 1E9 );

    life = lifeI;
  }

  float dist = distFunc( pos );
  if ( dist < 0.0 ) {
    vec3 normal = normalFunc( pos, 1E-3 );
    pos += normal * ( -dist + 0.01 );
    vel = vel - 1.4 * dot( vel, normal ) * normal;
  }

  vel.y -= 9.0 * deltaTime;

  pos += vel * deltaTime;

  life.x = mod( lifeI.x - time * 1.0 + 1.0, 1.0 );

  vec3 ret;
  if ( type == 0.0 ) {
    ret = pos;
  } else if ( type == 1.0 ) {
    ret = vel;
  } else if ( type == 2.0 ) {
    ret = col;
  } else if ( type == 3.0 ) {
    ret = life;
  }

  gl_FragColor = vec4( ret, 1.0 );
}
