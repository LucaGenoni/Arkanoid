var space = {
	_w: window.innerWidth,
	_h: window.innerHeight,
	_a: window.innerWidth/window.innerHeight < 1.2 ? 1.2 : window.innerWidth/window.innerHeight,
	_n: 0.5,
	_f: 4,

	_fovy: 98,
	_pos_cam: [0, -1, .9],
	_elev: 36,
	_ang: 0,

	_type: "Perspective 2",
	_init:true,
	keyDown(e) {
		console.log(this);
		switch (e.code) {
			// camera
			case "KeyR":
				this._pos_cam[0] += e.key === e.key.toLowerCase() ? 1 : -1;
				break;
			case "KeyT":
				this._pos_cam[1] += e.key === e.key.toLowerCase() ? 1 : -1;
				break;
			case "KeyY":
				this._pos_cam[2] += e.key === e.key.toLowerCase() ? 1 : -1;
				break;
			// fov, elevation, angle
			case "KeyF":
				this._fovy += e.key === e.key.toLowerCase() ? 1 : -1;
				break;
			case "KeyG":
				this._elev += e.key === e.key.toLowerCase() ? 1 : -1;
				break;
			case "KeyH":
				this._ang += e.key === e.key.toLowerCase() ? 1 : -1;
				break;
			// target
			case "KeyU":
				this._tx += e.key === e.key.toLowerCase() ? 1 : -1;
				break;
			case "KeyI":
				this._ty += e.key === e.key.toLowerCase() ? 1 : -1;
				break;
			case "KeyO":
				this._tz += e.key === e.key.toLowerCase() ? 1 : -1;
				break;
			// rotations
			case "KeyJ":
				this._rx += e.key === e.key.toLowerCase() ? 1 : -1;
				break;
			case "KeyK":
				this._ry += e.key === e.key.toLowerCase() ? 1 : -1;
				break;
			case "KeyL":
				this._rz += e.key === e.key.toLowerCase() ? 1 : -1;
				break;
			// w,h,n,f
			case "KeyV":
				this._w += e.key === e.key.toLowerCase() ? 1 : -1;
				break;
			case "KeyB":
				this._h += e.key === e.key.toLowerCase() ? 1 : -1;
				break;
			case "KeyN":
				this._n += e.key === e.key.toLowerCase() ? 1 : -1;
				break;
			case "KeyM":
				this._f += e.key === e.key.toLowerCase() ? 1 : -1;
				break;
		}
	},
	getParallel() {
		return utils.MakeParallel(this._w, this._a, this._n, this._f)
	},
	getPerspective() {
		return utils.MakePerspective(this._fovy, this._a, this._n, this._f)
	},
	getView() {
		return utils.MakeView(this._pos_cam[0], this._pos_cam[1], this._pos_cam[2], this._elev, this._ang)
	},
	getVP(){
		space._resizeCanvas(gl);
		twgl.resizeCanvasToDisplaySize(gl.canvas);
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
		$("#w-value").html(gl.canvas.width);
		$("#h-value").html(gl.canvas.height);
		switch (this._type) {
			case "Parallel":
				return utils.identityMatrix();
			case "Perspective 1":
				if(this._init) {
					this.setParams(0.4,4,98,[0, -1, .9],36,0);
					this._init = false;
				}
				return utils.multiplyMatrices(this.getPerspective(), this.getView());
			case "Perspective 2":
				if(this._init) {
					this.setParams(1,79,27,[0, -3, 3],44,0);
					this._init = false;
				}
				return utils.multiplyMatrices(this.getPerspective(), this.getView());
			default:
				return utils.identityMatrix();
		}
	}, 
	setParams(n,f,fovy,cam_pos,elev,ang){
		this._n = n;
		this._f = f;
		this._fovy = fovy;
		this._pos_cam = cam_pos;
		this._elev = elev;
		this._ang = ang;
	},
	_resizeCanvas: function(gl){
		var width, height;
		//retrieve size of canvas      
		width  = window.innerWidth;
		height = window.innerHeight;
		//check if it is changed if so return true else false
		if (this._w  !== width || this._h !== height) {
			gl.canvas.width = width;
			gl.canvas.height = height;
			this._w = width;
			this._h = height;
			this._a = width/height;
			if(this._a<1.2) this._a=1.2;
			console.log(this._a);
		}
	},
};