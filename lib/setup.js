setup = {
    // geometries = {cube,sphere}
    // testures = {blocks,enlarge,restrict}
    // samplers = {nearest}
    // colors = []
    // shaders = {justColor, justTexture}
    init: function () {
        this._loadGeometries();
        this._loadTextures();
        this._setshaders();
        this.colors = [[1, 0.250980392, 0, 1], [1, 0.501960784, 0, 1], [1, 0.749019608, 0, 1], [1, 1, 0, 1], [0.749019608, 1, 0, 1], [0.501960784, 1, 0, 1], [0.250980392, 1, 0, 1], [0, 1, 0, 1], [0, 1, 0.250980392, 1], [0, 1, 0.501960784, 1], [0, 1, 0.749019608, 1], [0, 1, 1, 1], [0, 0.749019608, 1, 1], [0, 0.501960784, 1, 1], [0, 0.250980392, 1, 1], [0, 0, 1, 1], [0.250980392, 0, 1, 1], [0.501960784, 0, 1, 1], [0.749019608, 0, 1, 1], [1, 0, 1, 1], [1, 0, 0.749019608, 1], [1, 0, 0.501960784, 1], [1, 0, 0.250980392, 1], [1, 0, 0, 1],];
    },

    _loadGeometries: function () {
        this.geometries = {
            cube: cube(),
            sphere: buildGeometry(20, 20),
        }
    },

    _loadTextures: function () {

        this.textures = twgl.createTextures(gl, {
            // a non-power of 2 image
            blocks: { crossOrigin: 'anonymous', src: "textures/prova.png" },
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
    }
}