var space = {
	_w : 256,
	_h : 282,
	_n : 2,
	_f : 11,

	_fovy : 27,

	_cx : 0,
	_cy : -5,
	_cz : 5,
	_elev : 51,
	_ang : 0,

	_tx : 0,
	_ty : 0,
	_tz : 0,
	_rx : 0,
	_ry : 0,
	_rz : 0,
	_s : 0,

	_type : "Parallel",
	_changed : true,
	
	
	keyDown(e){
		console.log(this);
		switch (e.code) {
			// camera
			case "KeyR":
				this._cx += e.key==e.key.toLowerCase()?1:-1;
				this._changed = true;
				break;
			case "KeyT":
				this._cy += e.key==e.key.toLowerCase()?1:-1;
				this._changed = true;
				break;
			case "KeyY":
				this._cz += e.key==e.key.toLowerCase()?1:-1;
				this._changed = true;
				break;
			// fov, elevation, angle
			case "KeyF":
				this._fovy += e.key==e.key.toLowerCase()?1:-1;
				this._changed = true;
				break;
			case "KeyG":
				this._elev += e.key==e.key.toLowerCase()?1:-1;
				this._changed = true;
				break;
			case "KeyH":
				this._ang += e.key==e.key.toLowerCase()?1:-1;
				this._changed = true;
				break;
			// target
			case "KeyU":
				this._tx += e.key==e.key.toLowerCase()?1:-1;
				this._changed = true;
				break;
			case "KeyI":
				this._ty += e.key==e.key.toLowerCase()?1:-1;
				this._changed = true;
				break;
			case "KeyO":
				this._tz += e.key==e.key.toLowerCase()?1:-1;
				this._changed = true;
				break;
			// rotations
			case "KeyJ":
				this._rx += e.key==e.key.toLowerCase()?1:-1;
				this._changed = true;
				break;
			case "KeyK":
				this._ry += e.key==e.key.toLowerCase()?1:-1;
				this._changed = true;
				break;
			case "KeyL":
				this._rz += e.key==e.key.toLowerCase()?1:-1;
				this._changed = true;
				break;
			// w,h,n,f
			case "KeyV":
				this._w += e.key==e.key.toLowerCase()?1:-1;
				this._changed = true;
				break;
			case "KeyB":
				this._h += e.key==e.key.toLowerCase()?1:-1;
				this._changed = true;
				break;
			case "KeyN":
				this._n += e.key==e.key.toLowerCase()?1:-1;
				this._changed = true;
				break;
			case "KeyM":
				this._f += e.key==e.key.toLowerCase()?1:-1;
				this._changed = true;
				break;
		}
	},
	getParallel(){
		return utils.MakeParallel(this._w, this._w/this._h, this._n, this._f)
	},
	getPerspective(){
		return utils.MakePerspective(this._fovy, this._w/this._h, this._n, this._f)
	},
	getView(){
		return utils.MakeView(this._cx, this._cy, this._cz, this._elev, this._ang)
	},
	getWorld(){
		return utils.MakeWorld(this._tx, this._ty, this._tz, this._rx, this._ry, this._rz, this._s)
	},
}