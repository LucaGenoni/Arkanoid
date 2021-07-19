var space = {
	_w: window.innerWidth,
	_h: window.innerHeight,
	_n: 1,
	_f: 79,

	_fovy: 27,
	_pos_cam:[0,-4,4],
	_elev: 44,
	_ang: 0,

	_type: "0",

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
		return utils.MakeParallel(this._w, this._w / this._h, this._n, this._f)
	},
	getPerspective() {
		return utils.MakePerspective(this._fovy, this._w / this._h, this._n, this._f)
	},
	getView() {
		return utils.MakeView(this._pos_cam[0], this._pos_cam[1], this._pos_cam[2], this._elev, this._ang)
	},
	getVP(){
		space._resizeCanvas(gl);
		twgl.resizeCanvasToDisplaySize(gl.canvas);
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
		switch (this._type) {
			case "Parallel":
				return utils.identityMatrix();
			default:
				return utils.multiplyMatrices(this.getPerspective(), this.getView());
		}
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
		}
	},
};