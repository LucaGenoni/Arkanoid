vs = `#version 300 es

in vec4 a_position;

uniform mat4 u_matrix;

void main() {
  // Multiply the position by the matrix M_{WVP}.
  gl_Position = u_matrix * a_position;
}
`
fs = `#version 300 es
precision highp float;

uniform vec4 u_color;

out vec4 outColor;

void main() {
   outColor = u_color;
}
`;
vsBLOCK = `#version 300 es

in vec4 a_position;
in vec2 a_texcoord;

uniform mat4 u_matrix;

out vec2 v_texcoord;

void main() {
  // Multiply the position by the matrix M_{WVP}.
  v_texcoord = a_texcoord;
  gl_Position = u_matrix * a_position;
}
`
fsBLOCK = `#version 300 es
precision highp float;

in vec2 v_texcoord;
uniform sampler2D u_colorTex;

out vec4 outColor;

void main() {
   	outColor = texture(u_colorTex, v_texcoord);
}
`;
vsLight = `#version 300 es

in vec4 a_position;
in vec4 a_normal;

uniform mat4 u_matrix;

out vec3 fs_pos;
out vec3 fs_norm;

void main() {
  // Multiply the position by the matrix M_{WVP}.
  gl_Position = u_matrix * a_position;
  fs_pos = gl_Position.xyz;
  fs_norm = a_normal.xyz;
}
`
fsLight = `#version 300 es
precision highp float;

in vec3 fs_pos;
in vec3 fs_norm;

uniform vec4 u_color;

uniform vec3 l_type;
// essentials for directional lights
uniform vec4 l_color;
uniform vec3 l_dir;

// essentials for point lights
uniform vec3 l_pos;
uniform float l_target;
uniform float l_decay;

// essentials for spot lights
uniform float l_coneOut;
uniform float l_coneIn;

out vec4 outColor;

vec3 compLightDir() {
    // -> Direct
	vec3 directLightDir = l_dir;
    // -> Point,Spot
	vec3 pointLightDir = normalize(l_pos - fs_pos);
    
    // ----> Select final component
	return directLightDir * l_type.x + pointLightDir * l_type.y + pointLightDir * l_type.z ;
}

vec4 compLightColor(vec3 spotLightDir) {
    // -> Direct
    vec4 directLightCol = l_color;
    // -> Point
    vec4 pointLightCol = l_color * pow(l_target / length(l_pos - fs_pos), l_decay);
    // -> Spot
    float LCosOut = cos(radians(l_coneOut / 2.0));
    float LCosIn = cos(radians(l_coneOut * l_coneIn / 2.0));
    float CosAngle = dot(spotLightDir, l_dir);
    vec4 spotLightCol = pointLightCol * clamp((CosAngle - LCosOut) / (LCosIn - LCosOut), 0.0, 1.0);
    
    // ----> Select final component
    return  directLightCol * l_type.x + pointLightCol * l_type.y + spotLightCol * l_type.z;
}

void main() {

	vec3 lightDir = compLightDir();
    vec4 OlightColor = compLightColor(lightDir);

    outColor = u_color * OlightColor;
}
`;

vsLightTexture = `#version 300 es

in vec4 a_position;
in vec4 a_normal;
in vec2 a_texcoord;

uniform mat4 u_matrix;
uniform mat4 n_matrix;

out vec3 fs_pos;
out vec3 fs_norm;
out vec2 fs_uv;

void main() {
  // Multiply the position by the matrix M_{WVP}.
  gl_Position = u_matrix * a_position;
  fs_pos = gl_Position.xyz;
  fs_norm = (n_matrix * a_normal).xyz;
  fs_uv = a_texcoord;
}
`
fsLightTexture = `#version 300 es
precision highp float;

in vec3 fs_pos;
in vec3 fs_norm;
in vec2 fs_uv;

uniform vec4 u_color;
uniform sampler2D u_diffuseTexture;

uniform vec3 l_type;
uniform vec4 l_ambient;

// essentials for directional lights
uniform vec4 l_color;
uniform vec3 l_dir;

// essentials for point lights
uniform vec3 l_pos;
uniform float l_target;
uniform float l_decay;

// essentials for spot lights
uniform float l_coneOut;
uniform float l_coneIn;

out vec4 out_color;

vec3 compLightDir(vec3 l_type, vec3 l_pos, vec3 l_dir) {
    // -> Direct
	vec3 directLightDir = l_dir;
    // -> Point,Spot
	vec3 pointLightDir = normalize(l_pos - fs_pos);
    
    // ----> Select final component
	return directLightDir * l_type.x + pointLightDir * l_type.y + pointLightDir * l_type.z ;
}

vec4 compLightColor(vec3 l_type, vec3 l_pos, vec3 l_dir, vec3 spotLightDir,vec4 l_color, float l_target, float l_decay, float l_coneOut,float l_coneIn ) {
    // -> Direct
    vec4 directLightCol = l_color;
    // -> Point
    vec4 pointLightCol = l_color * pow(l_target / length(l_pos - fs_pos), l_decay);
    // -> Spot
    float LCosOut = cos(radians(l_coneOut / 2.0));
    float LCosIn = cos(radians(l_coneOut * l_coneIn / 2.0));
    float CosAngle = dot(spotLightDir, l_dir);
    vec4 spotLightCol = pointLightCol * clamp((CosAngle - LCosOut) / (LCosIn - LCosOut), 0.0, 1.0);
    
    // ----> Select final component
    return  directLightCol * l_type.x + pointLightCol * l_type.y + spotLightCol * l_type.z;
}

void main() {

	vec3 lightDir = compLightDir(l_type, l_pos, l_dir);
    vec4 OlightColor = compLightColor(l_type, l_pos, l_dir, lightDir, l_color, l_target, l_decay, l_coneOut, l_coneIn );
    vec4 diffuse = texture(u_diffuseTexture, fs_uv) * u_color ;

    out_color = diffuse * OlightColor;
}
`;

vsLightTextureNormal = `#version 300 es

in vec4 a_position;
in vec4 a_normal;
in vec2 a_texcoord;

uniform mat4 u_matrix;
uniform mat4 n_matrix;
uniform mat4 u_world;

out vec3 fs_pos;
out vec3 fs_norm;
out vec2 fs_uv;

void main() {
  // Multiply the position by the matrix M_{WVP}.
  fs_pos = (u_world * a_position).xyz;
  fs_norm = (n_matrix * a_normal).xyz;
  fs_uv = a_texcoord;
  gl_Position = u_matrix * a_position;
}
`
fsLightTextureNormal = `#version 300 es
precision highp float;

in vec3 fs_pos;
in vec3 fs_norm;
in vec2 fs_uv;

uniform vec4 u_color;
uniform sampler2D u_diffuseTexture;
uniform sampler2D u_normalTexture;

// camera
uniform vec3 c_eyePos;

uniform vec3 l_type;
uniform vec4 l_ambient;

// essentials for directional lights
uniform vec4 l_color;
uniform vec3 l_dir;

// essentials for point lights
uniform vec3 l_pos;
uniform float l_target;
uniform float l_decay;

// essentials for spot lights
uniform float l_coneOut;
uniform float l_coneIn;

out vec4 out_color;

vec3 compLightDir(vec3 l_type, vec3 l_pos, vec3 l_dir) {
    // -> Direct
	vec3 directLightDir = l_dir;
    // -> Point,Spot
	vec3 pointLightDir = normalize(l_pos - fs_pos);
    
    // ----> Select final component
	return directLightDir * l_type.x + pointLightDir * l_type.y + pointLightDir * l_type.z ;
}

float spotIntensity(vec3 l_dir, vec3 spotLightDir, float l_coneOut,float l_coneIn ){
    float LCosOut = cos(radians(l_coneOut / 2.0));
    float LCosIn = cos(radians(l_coneOut * l_coneIn / 2.0));
    float CosAngle = dot(spotLightDir, l_dir);
    return clamp((CosAngle - LCosOut) / (LCosIn - LCosOut), 0.0, 1.0);
}

vec4 compLightColor(vec3 l_type, vec3 l_pos, vec4 l_color, float l_target, float l_decay) {
    // -> Direct
    vec4 directLightCol = l_color;
    // -> Point
    vec4 pointLightCol = l_color * pow(l_target / length(l_pos - fs_pos), l_decay);
    
    // ----> Select final component
    return  directLightCol * l_type.x + pointLightCol * l_type.y + pointLightCol * l_type.z;
}

vec4 compLightLambertPhong(vec3 l_type, vec3 l_pos, vec3 l_dir, vec4 l_color, float l_target, float l_decay,float l_coneOut, float l_coneIn, vec3 fs_norm, vec3 norm,vec3 c_dir){
    float SpecShine = 1.0;
    vec3 dir_pos_l_fs = compLightDir(l_type, l_pos, l_dir);
    vec4 ol_color = compLightColor(l_type, l_pos, l_color, l_target, l_decay);

    // if light can reach ol_color will not be black
    ol_color *= max(dot(dir_pos_l_fs, fs_norm),0.0)==0.0 ? 0.0:1.0;
    if(l_type.z == 1.0) ol_color *= spotIntensity(dir_pos_l_fs,l_dir, l_coneOut,l_coneIn);

    float Reflection_l1 = clamp(dot(dir_pos_l_fs, norm),0.0,1.0);
    vec4 Lambert_l1 = ol_color * Reflection_l1;
	vec4 Phong_l1 = pow(clamp(dot(c_dir, -reflect(dir_pos_l_fs,norm)),0.0,1.0), SpecShine) * ol_color * (Reflection_l1==0.0 ? 0.0:1.0);
    return Lambert_l1 + Phong_l1;
}

mat3 compTBN(vec3 fs_pos, vec3 fs_norm, vec2 fs_uv){
	vec3 n_norm = normalize(fs_norm);
	//// online computation of tangent and bitangent

	// compute derivations of the world position
	vec3 p_dx = dFdx(fs_pos);
	vec3 p_dy = dFdy(fs_pos);
	// compute derivations of the texture coordinate
	vec2 tc_dx = dFdx(fs_uv);
	vec2 tc_dy = dFdy(fs_uv);
	// compute initial tangent and bi-tangent
	vec3 t = (tc_dy.y * p_dx - tc_dx.y * p_dy) / (tc_dx.x*tc_dy.y - tc_dy.x*tc_dx.y);
	t = normalize(t - n_norm * dot(n_norm, t));
	vec3 b = normalize(cross(n_norm,t));
	
	return mat3(t, b, n_norm);
}

void main() {
    vec3 normalVec = normalize(fs_norm);
    mat3 tbn = compTBN(fs_pos,normalVec,fs_uv);
	vec4 nMap = texture(u_normalTexture, fs_uv);
	vec3 norm = normalize(tbn * (nMap.xyz * 2.0 - 1.0));
	vec3 c_dir = normalize(c_eyePos - fs_pos);

    vec4 albedo = texture(u_diffuseTexture, fs_uv) * u_color ;
    // vec4 albedo = u_color ;


    // ambient light
    out_color = albedo * l_ambient;

    // compute lights with lambert phong
	out_color += albedo * compLightLambertPhong(l_type, l_pos, -l_dir, l_color, l_target, l_decay, l_coneOut, l_coneIn, normalVec, norm,c_dir);

}
`;
setup = {
    init: function () {
        if (!gl) {
            console.log("webGL not supported");
            alert("webGL not supported")
        }
        //set some state of gl
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        //remove faces that can't be seen
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.BACK);
        
        this._loadGeometries();
        this._loadTextures();
        this._setshaders();
        this.colors = [[1, 0.250980392, 0, 1], [1, 0.501960784, 0, 1], [1, 0.749019608, 0, 1], [1, 1, 0, 1], [0.749019608, 1, 0, 1], [0.501960784, 1, 0, 1], [0.250980392, 1, 0, 1], [0, 1, 0, 1], [0, 1, 0.250980392, 1], [0, 1, 0.501960784, 1], [0, 1, 0.749019608, 1], [0, 1, 1, 1], [0, 0.749019608, 1, 1], [0, 0.501960784, 1, 1], [0, 0.250980392, 1, 1], [0, 0, 1, 1], [0.250980392, 0, 1, 1], [0.501960784, 0, 1, 1], [0.749019608, 0, 1, 1], [1, 0, 1, 1], [1, 0, 0.749019608, 1], [1, 0, 0.501960784, 1], [1, 0, 0.250980392, 1], [1, 0, 0, 1],];
        this.globalsLight = {
            l_ambient: [1,1,1,1],

            l_type:[1,0,0],
            l_color: [1,1,1,1],
            l_dir: [0,1.5,-1],

            l_pos: [0,5,5],
            l_target:1,
            l_decay:1,

            l_coneOut:70,
            l_coneIn:0.1,
        }
        this.angleLight = 0
    },

    _loadGeometries: function () {
        this.geometries = {
            cube: cube(),
            sphere: buildGeometry(20, 20),
            barrier: barrier(),
            bar: bar(),
        }
    },

    _loadTextures: function () {

        this.textures = twgl.createTextures(gl, {
            // a non-power of 2 image
            bar_and_blocks: { crossOrigin: 'anonymous', src: "textures/breakout_pieces.png" },
            blocks: { crossOrigin: 'anonymous', src: "textures/prova2.png" },
            diffuseBlocks: { crossOrigin: 'anonymous', src: "textures/border.png" },
            normalBlocks: { crossOrigin: 'anonymous', src: "textures/border_normal.png" },
            block_neon_norm: { crossOrigin: 'anonymous', src: "textures/neon_norm.png" },
            
            diffuseBar: { crossOrigin: 'anonymous', src: "textures/bar/diffuse2.png" },
            normalBar: { crossOrigin: 'anonymous', src: "textures/bar/normal2.png" },
            sponde: { crossOrigin: 'anonymous', src: "textures/scifi.jpg" },
            sponde_norm : { crossOrigin: 'anonymous', src: "textures/sponde_norm.png" },
            enlarge: { crossOrigin: 'anonymous', src: "textures/power_up/enlarge.png" },
            restrict: { crossOrigin: 'anonymous', src: "textures/power_up/restrict.png" },
            slow: { crossOrigin: 'anonymous', src: "textures/power_up/slow.png" },
            fast: { crossOrigin: 'anonymous', src: "textures/power_up/fast.png" },
        });
        

        this.samplers = twgl.createSamplers(gl, {
            nearest: {
                minMag: gl.NEAREST,
                maxMag: gl.NEAREST,
            },
        });
    },

    _setshaders: function () {
        this.shaders = {
            justColor: twgl.createProgramInfo(gl, [vs, fs]),
            justTexture: twgl.createProgramInfo(gl, [vsBLOCK, fsBLOCK]),
            justTexture2: twgl.createProgramInfo(gl, [vsBLOCK, fsBLOCK]),
            testLight: twgl.createProgramInfo(gl, [vsLight, fsLight]),
            lightTexture: twgl.createProgramInfo(gl, [vsLightTexture, fsLightTexture]),
            lightTextureNormal: twgl.createProgramInfo(gl, [vsLightTextureNormal, fsLightTextureNormal]),
        }
        twgl.setAttributePrefix("a_");
    },

    /**
     * 
     * @param {*} uniforms compatible with the program (shaders)
     * @param {*} program or the shaders to draw this object
     * @param {*} geometry the object containing position, normal, indeces, uv coordinate
     * @returns JSON object to draw as TWGL require
     */
    newObject(name,center,dimensions,uniforms, program, geometry) {
        return {
            name : name,
            center : center,
            dimensions : dimensions,
            uniforms: uniforms,
            programInfo: program,
            bufferInfo: twgl.createBufferInfoFromArrays(gl, geometry),
            updateLocal() {},
        }
    },
    lightsKeyDown(e){
		switch (e.code) {
			case "KeyU":
				this.globalsLight.l_pos[0] += e.key == e.key.toLowerCase() ? 1 : -1;
                console.log(this.globalsLight.l_pos);
				break;
			case "KeyI":
				this.globalsLight.l_pos[1] += e.key == e.key.toLowerCase() ? 1 : -1;
                console.log(this.globalsLight.l_pos);
				break;
			case "KeyO":
				this.globalsLight.l_pos[2] += e.key == e.key.toLowerCase() ? 1 : -1;
                console.log(this.globalsLight.l_pos);
				break;
			// rotations
			case "KeyJ":
				this.globalsLight.l_dir[0] += e.key == e.key.toLowerCase() ? 1 : -1;
                normalizeVector(this.globalsLight.l_dir);
                console.log(this.globalsLight.l_dir);
				break;
			case "KeyK":
				this.globalsLight.l_dir[1] += e.key == e.key.toLowerCase() ? 1 : -1;
                normalizeVector(this.globalsLight.l_dir);
                console.log(this.globalsLight.l_dir);
				break;
			case "KeyL":
				this.globalsLight.l_dir[2] += e.key == e.key.toLowerCase() ? 1 : -1;
                normalizeVector(this.globalsLight.l_dir);
                console.log(this.globalsLight.l_dir);
				break;
		}

    }
}