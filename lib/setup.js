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

out vec3 fs_pos;
out vec3 fs_norm;
out vec2 fs_uv;

void main() {
  // Multiply the position by the matrix M_{WVP}.
  gl_Position = u_matrix * a_position;
  fs_pos = gl_Position.xyz;
  fs_norm = a_normal.xyz;
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
    vec4 diffuse = texture(u_diffuseTexture, fs_uv) * u_color ;

    outColor = diffuse * OlightColor;
}
`;

setup = {
    // geometries = {cube,sphere,barrier}
    // testures = {blocks,enlarge,restrict}
    // samplers = {nearest}
    // colors = []
    // shaders = {justColor, justTexture}
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
            l_type:[0,1,0],

            l_color: [1,1,1,0],
            l_dir: [0,-1,0.51],

            l_pos: [1,1,1],
            l_target:1,
            l_decay:1,

            l_coneOut:1,
            l_coneIn:1,

        }
    },

    _loadGeometries: function () {
        this.geometries = {
            cube: cube(),
            sphere: buildGeometry(20, 20),
            barrier: barrier(),
        }
    },

    _loadTextures: function () {

        this.textures = twgl.createTextures(gl, {
            // a non-power of 2 image
            blocks: { crossOrigin: 'anonymous', src: "textures/prova.png" },
            diffuseBlocks: { crossOrigin: 'anonymous', src: "textures/border.png" },
            sponde: { crossOrigin: 'anonymous', src: "textures/scifi.jpg" },
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
        // to apply them
        // u_colorText:{
        //     texture: textures.blocks,
        //     sampler: sampler.nearest,
        // },
    },

    _setshaders: function () {
        this.shaders = {
            justColor: twgl.createProgramInfo(gl, [vs, fs]),
            justTexture: twgl.createProgramInfo(gl, [vsBLOCK, fsBLOCK]),
            justTexture2: twgl.createProgramInfo(gl, [vsBLOCK, fsBLOCK]),
            testLight: twgl.createProgramInfo(gl, [vsLight, fsLight]),
            lightTexture: twgl.createProgramInfo(gl, [vsLightTexture, fsLightTexture]),
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
            bufferInfo: twgl.createBufferInfoFromArrays(gl, geometry)
        }
    },
    lightsKeyDown(e){
        console.log(this.globalsLight.l_pos);
		switch (e.code) {
			// camera
			// case "KeyR":
			// 	this._cx += e.key == e.key.toLowerCase() ? 1 : -1;
			// 	this._changed = true;
			// 	break;
			// case "KeyT":
			// 	this._cy += e.key == e.key.toLowerCase() ? 1 : -1;
			// 	this._changed = true;
			// 	break;
			// case "KeyY":
			// 	this._cz += e.key == e.key.toLowerCase() ? 1 : -1;
			// 	this._changed = true;
			// 	break;
			// fov, elevation, angle
			// case "KeyF":
			// 	this._fovy += e.key == e.key.toLowerCase() ? 1 : -1;
			// 	this._changed = true;
			// 	break;
			// case "KeyG":
			// 	this._elev += e.key == e.key.toLowerCase() ? 1 : -1;
			// 	this._changed = true;
			// 	break;
			// case "KeyH":
			// 	this._ang += e.key == e.key.toLowerCase() ? 1 : -1;
			// 	this._changed = true;
			// 	break;
			// coordinates
			case "KeyU":
				this.globalsLight.l_pos[0] += e.key == e.key.toLowerCase() ? .1 : -.1;
				break;
			case "KeyI":
				this.globalsLight.l_pos[1] += e.key == e.key.toLowerCase() ? .1 : -.1;
				break;
			case "KeyO":
				this.globalsLight.l_pos[2] += e.key == e.key.toLowerCase() ? .1 : -.1;
				break;
			// rotations
			case "KeyJ":
				this.globalsLight.l_dir[0] += e.key == e.key.toLowerCase() ? .1 : -.1;
                normalizeVector(this.globalsLight.l_dir)
				break;
			case "KeyK":
				this.globalsLight.l_dir[1] += e.key == e.key.toLowerCase() ? .1 : -.1;
                normalizeVector(this.globalsLight.l_dir)
				break;
			case "KeyL":
				this.globalsLight.l_dir[2] += e.key == e.key.toLowerCase() ? .1 : -.1;
                normalizeVector(this.globalsLight.l_dir)
				break;
			// w,h,n,f
			// case "KeyV":
			// 	this.globalsLight.l_dir[0] += e.key == e.key.toLowerCase() ? .1 : -.1;
			// 	this._changed = true;
			// 	break;
			// case "KeyB":
			// 	this._h += e.key == e.key.toLowerCase() ? 1 : -1;
			// 	this._changed = true;
			// 	break;
			// case "KeyN":
			// 	this._n += e.key == e.key.toLowerCase() ? 1 : -1;
			// 	this._changed = true;
			// 	break;
			// case "KeyM":
			// 	this._f += e.key == e.key.toLowerCase() ? 1 : -1;
			// 	this._changed = true;
			// 	break;
		}

    }
}