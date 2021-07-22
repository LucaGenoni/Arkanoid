class Arkanoid {
	constructor(mapBlocks,velocityBall,velocityBar) {
		console.log("Preparing the game...");
		this.velocityBall = velocityBall ? velocityBall:0.025;
		this.velocityBar = velocityBar ? velocityBar:0.05;
		this.previousState = "Pause";
		this.state = "Starting";
		this.ballAngle = 90;

		this.totalBlocks = 0;
		this.score = 0;
		this.lives = 3;
		this.pity = 0;
		this.collisionsCounter = 0;
		this.gameStart = Date.now() / 1000;
		this.gameEnd = 0;

		this.powerUpVelocity = 0.005;

	
		// CREATE SHADERS
		
		// this.programInfo = twgl.createProgramInfo(gl, [vs, fs]);
		// this.programInfoBLOCK = twgl.createProgramInfo(gl, [vsBLOCK, fsBLOCK]);
		// twgl.setAttributePrefix("a_");
		// var colors = [[1, 0.250980392, 0, 1], [1, 0.501960784, 0, 1], [1, 0.749019608, 0, 1], [1, 1, 0, 1], [0.749019608, 1, 0, 1], [0.501960784, 1, 0, 1], [0.250980392, 1, 0, 1], [0, 1, 0, 1], [0, 1, 0.250980392, 1], [0, 1, 0.501960784, 1], [0, 1, 0.749019608, 1], [0, 1, 1, 1], [0, 0.749019608, 1, 1], [0, 0.501960784, 1, 1], [0, 0.250980392, 1, 1], [0, 0, 1, 1], [0.250980392, 0, 1, 1], [0.501960784, 0, 1, 1], [0.749019608, 0, 1, 1], [1, 0, 1, 1], [1, 0, 0.749019608, 1], [1, 0, 0.501960784, 1], [1, 0, 0.250980392, 1], [1, 0, 0, 1],];

		var dimensions, coordinate, uniform, newObj, name, uv, geometry;

		// CREATE BAR
		dimensions = [0.2, 0.07, 0.05];
		coordinate = [0, -1, 0];
		uniform = {
			u_color: [185 / 255, 122 / 255, 87 / 255, 1],
			u_world: [],
			u_diffuseTexture: {
				texture: setup.textures.diffuseBar,
				sampler: setup.samplers.nearest,
			},
			u_normalTexture: {
				texture: setup.textures.normalBar,
				sampler: setup.samplers.nearest,
			}
		};
		newObj = setup.newObject("Bar",coordinate,dimensions,uniform, setup.shaders.lightTextureNormal, setup.geometries.cube);
		newObj.move = 0;
		newObj.letGo = true;
		newObj.updateLocal = function () {
			this.uniforms.u_world = utils.multiplyMatrices(
				utils.MakeTranslateMatrix(this.center[0], this.center[1], 0),
				utils.MakeScaleNuMatrix(this.dimensions[0], this.dimensions[1], this.dimensions[2])
			)
		};
		this.bar = newObj;
		


		// CREATE EDGES
		this.sponde = [];
		for (x = 0; x < 3; x++) {
			geometry = setup.geometries.barrier;
			switch (x) {
				case 0:
					name = "LEFT Barrier";
					coordinate = [-1, 0, -.1];
					dimensions = [1, 0.01, 0.5];

					//uniforms for LEFT Barrier
					uniform = {
						u_color: [1,1,1,1],
						u_world: utils.multiplyMatrices(
							utils.MakeTranslateMatrix(coordinate[0], coordinate[1], coordinate[2]),
							utils.multiplyMatrices(utils.MakeRotateZMatrix(90),
								utils.MakeScaleNuMatrix(dimensions[0], dimensions[1], dimensions[2]))
						),
						u_diffuseTexture: {
							texture: setup.textures.sponde,
							sampler: setup.samplers.nearest,
						},
						u_normalTexture: {
							texture: setup.textures.sponde_norm,
							sampler: setup.samplers.nearest,
						}
					};
					// create barriers
					dimensions = [dimensions[1], dimensions[0], dimensions[2]]; //updated dimensions after the transformations
					newObj = setup.newObject(name,coordinate,dimensions,uniform, setup.shaders.lightTextureNormal, geometry );
					break;
				case 1:
					name = "TOP Barrier";
					coordinate = [0, 1, -.1];
					dimensions = [1, 0.01, 0.5];
					
					//uniforms for TOP Barrier 
					uniform = {
						u_color: [1,1,1,1],
						u_world: utils.multiplyMatrices(
							utils.MakeTranslateMatrix(coordinate[0], coordinate[1], coordinate[2]),
							utils.MakeScaleNuMatrix(dimensions[0], dimensions[1], dimensions[2])
						),
						u_diffuseTexture: {
							texture: setup.textures.sponde,
							sampler: setup.samplers.nearest,
						},
						u_normalTexture: {
							texture: setup.textures.sponde_norm,
							sampler: setup.samplers.nearest,
						}
					};
					// create barriers
					newObj = setup.newObject(name,coordinate,dimensions,uniform, setup.shaders.lightTextureNormal, geometry );
					break;
				case 2:
					name = "RIGHT Barrier";
					coordinate = [1, 0, -.1];
					dimensions = [1, 0.01, 0.5];
					
					//uniforms for RIGHT Barrier
					uniform = {
						u_color: [1,1,1,1],
						u_world: utils.multiplyMatrices(
							utils.MakeTranslateMatrix(coordinate[0], coordinate[1], coordinate[2]),
							utils.multiplyMatrices(utils.MakeRotateZMatrix(-90),
								utils.MakeScaleNuMatrix(dimensions[0], dimensions[1], dimensions[2]))
						),
						u_diffuseTexture: {
							texture: setup.textures.sponde,
							sampler: setup.samplers.nearest,
						},
						u_normalTexture: {
							texture: setup.textures.sponde_norm,
							sampler: setup.samplers.nearest,
						}
					};
					// create barriers
					dimensions = [dimensions[1], dimensions[0], dimensions[2]]; //updated dimensions after the transformations
					newObj = setup.newObject(name,coordinate,dimensions,uniform, setup.shaders.lightTextureNormal, geometry );
					break;
				default:
					break;
			}
			this.sponde.push(newObj);
		}

		// CREATE BALL
		dimensions = 0.025;
		coordinate = [0.0, this.bar.center[1] + dimensions + this.bar.dimensions[1]];
		uniform = {
			u_color: [1, 1, 1, 1],
			u_world: [],
		};
		newObj = setup.newObject("Ball",coordinate,dimensions,uniform, setup.shaders.justColor, setup.geometries.sphere );
		newObj.radius = dimensions;
		newObj.direction = [Math.cos(utils.degToRad(this.ballAngle)), Math.sin(utils.degToRad(this.ballAngle)), 0];
		newObj.updateLocal = function() {
			this.uniforms.u_world = utils.multiplyMatrices(
				utils.MakeTranslateMatrix(this.center[0], this.center[1], 0),
				utils.MakeScaleMatrix(this.radius)
			)
		};
		this.ball = newObj;


		// CREATE ARROW
		coordinate = this.ball.center;
		dimensions = [0.2,0.01,0.01];
		uniform = {
			u_color: [124/255,252/255,0,0],
			u_world: utils.multiplyMatrices(utils.multiplyMatrices(utils.multiplyMatrices(
				utils.MakeTranslateMatrix(this.ball.center[0], this.ball.center[1], 0),
				utils.MakeRotateZMatrix(this.ballAngle)),
				utils.MakeTranslateMatrix(dimensions[0], 0, 0)),
				utils.MakeScaleNuMatrix(dimensions[0], dimensions[1], dimensions[2])
			),
		};
		newObj = setup.newObject("Arrow",function () { return game.ball.center;},dimensions,uniform, setup.shaders.justColor, setup.geometries.sphere );
		newObj.updateLocal = function () {
			this.uniforms.u_world = utils.multiplyMatrices(utils.multiplyMatrices(utils.multiplyMatrices(
				utils.MakeTranslateMatrix(game.ball.center[0], game.ball.center[1], 0),
				utils.MakeRotateZMatrix(game.ballAngle)),
				utils.MakeTranslateMatrix(this.dimensions[0], 0, 0)),
				utils.MakeScaleNuMatrix(this.dimensions[0], this.dimensions[1], this.dimensions[2])
			)
		};
		this.arrow = newObj;

		// CREATE BLOCKS (AND INITIALIZE POWERUPS LIST)

		this.block = [];
		this.powerup = [];
		var power;
		var powerUpsCount = 0;
		for (var x = 0; x < mapBlocks.length; x++) {
			color = setup.colors[Math.floor(Math.random() * setup.colors.length)];
			for (var y = 0; y < mapBlocks[x].length; y++) {
				var typeBlock = mapBlocks[x][y];
				if (typeBlock !== 0) { //to add different typeblock make more cases with 1,2,3 block
					var color;
					switch (typeBlock) {
						case 2:
							color = RgbTo01([176, 176, 176, 255]);
							break;
						case 3:
							color = RgbTo01([229, 232, 37, 255]);
							break;
						case 4:
							color = RgbTo01([240, 19, 19, 255]);
							break;
						default:
							break;
					}
					coordinate = [(2 * x - mapBlocks.length + 1) / mapBlocks.length, (2 * y - mapBlocks[x].length + 1) / mapBlocks[x].length, 0];
					dimensions = [1 / mapBlocks.length, 1 / mapBlocks[x].length, 0.1];
					power = false;
					if (this.willHavePowerUp()) {
						power = true;
						powerUpsCount += 1;
					}
					// create block
					uniform = {
						u_color: color,
						u_world: utils.multiplyMatrices(
							utils.MakeTranslateMatrix(coordinate[0], coordinate[1], 0),
							utils.MakeScaleNuMatrix( dimensions[0], dimensions[1], dimensions[2]),
						),
						u_diffuseTexture: {
							texture: setup.textures.diffuseBlocks,
							sampler: setup.samplers.nearest,
						},
						u_normalTexture: {
							texture: setup.textures.block_neon_norm,
							sampler: setup.samplers.nearest,
						}
						
					};
					newObj = setup.newObject("Block " + this.block.length, coordinate, dimensions, uniform, setup.shaders.lightTextureNormal, setup.geometries.cube );
					newObj.hasPowerUp = power;
					newObj.powerUpType = Math.floor(4* Math.random()) + 1; //identifies the upgrade (possible values: 1, 2, 3, 4),
					this.block.push(newObj);
				}
			}
		}
		this.totalBlocks = this.block.length;
		// create attributes for collision detection
		this.updateSpigoliObject(this.bar);
		for (x = 0; x < this.block.length; x++) this.updateSpigoliObject(this.block[x]);
		for (x = 0; x < this.sponde.length; x++) this.updateSpigoliObject(this.sponde[x]);
	}

	
	 keyDown(e) {
		switch (e.code) {
			// starting position bar to right
			case "Escape":
				game.changeState("Pause");
				break;
			// position bar 
			case "ArrowLeft":
			case "KeyA":
				game.bar.move = -1;
				break;
			case "KeyD":
			case "ArrowRight":
				game.bar.move = +1;
				break;
			// starting direction ball + counter-clockwise, - clockwise
			case "ArrowUp":
			case "KeyW":
				game.arrow.move = +1;
				break;
			case "KeyS":
			case "ArrowDown":
				game.arrow.move = -1;
				break;
			// start game
			case "Space":
				if (game.state === "Starting") game.changeState("Playing")
				break;
        }
	}
    keyUp(e) {
		switch (e.code) {
			// position bar 
			case "ArrowLeft":
			case "KeyA":
			case "KeyD":
			case "ArrowRight":
				this.bar.move = 0;
				break;
			case "ArrowUp":
            case "KeyW":
            case "KeyS":
            case "ArrowDown":
                this.arrow.move = 0;
			default:
				break;
        }
    }

	changeState(newState) {
		if (newState === "Pause" && this.state === "Pause") return;
		this.previousState = this.state;
		this.state = newState;
	}
	
	pause(){
		this.changeState("Pause");
	}

	resume() {
		this.changeState(this.previousState);
		requestAnimationFrame(this.play);
	}

	play(time) {
		//this function must work with globals   
		switch (game.state) {
			case "Starting":
				// update position of the bar
				if (game.bar.move !== 0 && !game.bar.checkMultipleCollisions){
					var tempChange = game.bar.center[0] + game.bar.move * game.velocityBar;
					if (tempChange <= -1 + game.bar.dimensions[0]) tempChange = -1 + game.bar.dimensions[0];
					if (tempChange >= 1 - game.bar.dimensions[0]) tempChange = 1 - game.bar.dimensions[0];
					game.bar.center[0] = tempChange;
					game.updateSpigoliObject(game.bar);
					game.ball.center[0] = game.bar.center[0];
					game.arrow.updateLocal();
				}
				if (game.arrow.move !== 0){
					var tempChange = game.ballAngle + game.arrow.move;
					if (20 < tempChange && tempChange < 160) game.ballAngle = tempChange;
					game.arrow.updateLocal();
					game.ball.direction = normalizeVector([Math.cos(utils.degToRad(game.ballAngle)), Math.sin(utils.degToRad(game.ballAngle)), 0]);
				}
				var VP = space.getVP();
				game.drawSingleObject(VP,game.arrow);
				game.drawGame(VP);
				break;
			case "Playing":
				// update position of the bar
				if (game.bar.move !== 0){
					var previous = game.bar.center[0]
					var tempChange = game.bar.center[0] + game.bar.move * game.velocityBar;
					if (tempChange <= -1 + game.bar.dimensions[0]) tempChange = -1 + game.bar.dimensions[0];
					if (tempChange >= 1 - game.bar.dimensions[0]) tempChange = 1 - game.bar.dimensions[0];
					game.bar.center[0] = tempChange;
					game.updateSpigoliObject(game.bar);
					if(game.collision(ball0,ball1,game.bar)){
						game.bar.center[0] = previous;
						game.updateSpigoliObject(game.bar);
					}
				}

				if(game.collisionsCounter > 1){
					var angle = Math.acos(game.ball.direction[0]);
					var correction = 0.04;
					if (Math.abs(angle - Math.PI/2) < correction || angle<correction || angle>Math.PI-correction) {
						console.log("correction",angle);
						game.ballAngle = angle + correction - (Math.random() > 0.5 ? correction*2 : 0);
						game.ball.direction = normalizeVector([Math.cos(game.ballAngle), Math.sin(game.ballAngle), 0]);
						game.collisionsCounter=0
					}
				} 

				// update position of the ball
				var ball0 = game.ball.center[0] + game.ball.direction[0] * game.velocityBall;
				var ball1 = game.ball.center[1] + game.ball.direction[1] * game.velocityBall;
				
				//update position of each rendered power-up and check collisions
				for (let i = 0; i < game.powerup.length; i++){
					game.powerup[i].center[1] = game.powerup[i].center[1] - game.powerUpVelocity;
					if (game.powerUpCollision(game.powerup[i]) > 0) game.powerup.splice(i, 1);
					else if (game.powerup[i].center[1] < -1 - game.powerup[i].dimensions[1]) game.powerup.splice(i, 1);
				}

				// check lost condition
				if (ball1 < -1 - game.ball.radius*3 || Math.abs(ball0)>1) {
					game.handleLifeLoss();
					return;
				}
				// collisions with objects
				if (game.collision(ball0,ball1,game.bar) > 0) {
					
					var center_dist = Math.abs(ball0 - game.bar.center[0]);
					//if the ball hits the right side of the bar, it will always bounce right
					if (ball0 >= game.bar.center[0] ) game.ball.direction[0] = Math.abs(game.ball.direction[0]) + 1.1 * center_dist;
					//instead if the ball hits the left side of the bar, it will always bounce left
					else game.ball.direction[0] = -Math.abs(game.ball.direction[0]) - 1.1 * center_dist;
					game.collisionsCounter += 1;
					if (game.checkMultipleCollisions) {
						console.log("multiple collsion with bar detected");
						game.bar.letGo = false;
						game.collisionsCounter -= 1;
						if(game.ball.center[0] < game.bar.center[0]) game.ball.center[0] = game.bar.center[0] - game.bar.dimensions[0] - game.ball.radius
						else game.ball.center[0] = game.bar.center[0] + game.bar.dimensions[0] + game.ball.radius
						// if (game.ball.direction[1]<0) game.ball.direction[1] = -game.ball.direction[1];
						while(game.collision(ball0,ball1,game.bar)){
							var increment = scalarVector(game.velocityBall,game.ball.direction);
							game.ball.center[0] = game.ball.center[0] + increment[0] ;
							game.ball.center[1] = game.ball.center[1] + increment[1] ;
							ball0 = game.ball.center[0] + game.ball.direction[0] * game.velocityBall;
							ball1 = game.ball.center[1] + game.ball.direction[1] * game.velocityBall;
							// game.changeState("Pause");
						}
					}
					game.checkMultipleCollisions = true;
				} 
				else {
					game.bar.letGo = true;
					game.checkMultipleCollisions = false;
					for (let i = 0; i < game.sponde.length; i++) game.collisionsCounter += game.collision(ball0,ball1,game.sponde[i]);
					for (let i = 0; i < game.block.length; i++) {
						if (game.collision(ball0,ball1,game.block[i]) > 0) {
							game.collisionsCounter = 0;
							if (game.block[i].hasPowerUp){
								game.preparePowerUp(game.block[i].powerUpType, game.block[i].center, game.block[i].dimensions);
							}
							game.block.splice(i, 1);
							game.updateScore();
							break;
						}
					}
				}
				var increment = scalarVector(game.velocityBall,game.ball.direction);
				
				game.ball.center[0] = game.ball.center[0] + increment[0] ;
				game.ball.center[1] = game.ball.center[1] + increment[1] ;
				var VP = space.getVP();
				game.drawGame(VP);
				break;
			default:
				console.log("Block refresh");
				break;
		}
	}


	updateSpigoliObject(obj) {
		if (obj) {// check why i need to place it to avoid a BIG FUCKING CRASH!!!!!!!!!!!!!!ASJKFGHASKLGHASIGHAFGB 
			obj.min = [obj.center[0] - obj.dimensions[0], obj.center[1] - obj.dimensions[1], 0];
			obj.max = [obj.center[0] + obj.dimensions[0], obj.center[1] + obj.dimensions[1], 0]
		}
	}
	
	collision(ball0,ball1,obj) {
		var xaxis = Math.abs(ball0 - obj.center[0]) - obj.dimensions[0];
		var yaxis = Math.abs(ball1 - obj.center[1]) - obj.dimensions[1];

		if (xaxis <= game.ball.radius && yaxis <= game.ball.radius) {
			if(obj.name.indexOf("Barrier")>0){
				if(obj.name==="RIGHT Barrier") game.ball.direction[0] = -Math.abs(game.ball.direction[0]);
				else if(obj.name==="LEFT Barrier") game.ball.direction[0] = Math.abs(game.ball.direction[0]);
				else if(obj.name ==="TOP Barrier") game.ball.direction[1] = -Math.abs(game.ball.direction[1]);
				return 1;
			}
			// collision detected
			var x = Math.max(obj.min[0], Math.min(ball0, obj.max[0]));
			var y = Math.max(obj.min[1], Math.min(ball1, obj.max[1]));
			// var z = Math.max(box.minZ, Math.min(sphere.z, box.maxZ));
			// distance between the closes point to the center of the sphere
			// var distance = Math.sqrt((x - sphere.x) **2 + (y - sphere.y) **2 + (z - sphere.z) **2);
			var distance = Math.sqrt((x - ball0) ** 2 + (y - ball1) ** 2);
			
			if (distance < game.ball.radius) {
				console.log(obj.name);
				var bounce;
				if (distance === 0) bounce = [game.ball.center[0] - ball0, game.ball.center[1] - ball1, 0];
				else bounce = [x - ball0, y - ball1, 0];
				bounce = normalizeVector(bounce);
				//applying small randomization to the bounce components to avoid loops between ball and barriers, plus
				// if/else needed to avoid any change of sign (for small values of any direction) due to the randomization 
				if (bounce[0] >= 0){
					bounce[0] = bounce[0] + (Math.random() * 0.03);
				}
				else {
					bounce[0] = bounce[0] - (Math.random() * 0.03);
				}
				if (bounce[1] >= 0){
					bounce[1] = bounce[1] + (Math.random() * 0.03);
				}
				else {
					bounce[1] = bounce[1] - (Math.random() * 0.03);
				}
				bounce = normalizeVector(bounce);
				console.log("Ball entry direction: " + game.ball.direction,"Distance",distance-game.ball.radius, "Bounce: " + bounce);
				game.ball.direction = normalizeVector(
					subVector(game.ball.direction,
					scalarVector(2 * dotProductVector(bounce, game.ball.direction) / dotProductVector(bounce, bounce), bounce)));
				//if the Ball collides with the Bar, special treatment is needed
				console.log("Ball exit direction: " + game.ball.direction);
				return 1;
			}
		}
		return 0;
	}
	
	powerUpCollision(powerUp){
		var xDistance = Math.abs(powerUp.center[0] - game.bar.center[0]) - powerUp.dimensions[0];
		var yDistance = Math.abs(powerUp.center[1] - game.bar.center[1]) - powerUp.dimensions[1];
		
		if (yDistance <= game.bar.dimensions[1]){
			// it may be a collision
			if(xDistance <= game.bar.dimensions[0]){
				game.POWERUPS[powerUp.powerUpType].apply();
				console.log("You grabbed an upgrade " + powerUp.powerUpType);
				return true;
			}
		}
		return false;
	}
	
	//function to add a power-up to the list of power-up to be renderized
	preparePowerUp(powerUpType, blockCenter, dimensions){
		const shrk = 0.4; //shrinking factor to be applied to the scaling factors of the block
		// in order to represent the powerup as a shrunken block
		dimensions = scalarVector(shrk,dimensions);
		var uniform = {
			u_color: this.POWERUPS[powerUpType].color,
			u_matrix: utils.transposeMatrix(utils.multiplyMatrices(
				utils.MakeTranslateMatrix(blockCenter[0], blockCenter[1], 0),
				utils.MakeScaleNuMatrix(dimensions[0], dimensions[1], dimensions[2])
			)),
			u_diffuseTexture: game.POWERUPS[powerUpType].texture,
			u_normalTexture: game.POWERUPS[powerUpType].normaltexture,
		};
		var newObj = setup.newObject("PowerUP " +powerUpType, blockCenter, dimensions, uniform, setup.shaders.lightTextureNormal, setup.geometries.cube );
		newObj.powerUpType = powerUpType;  
		this.powerup.push(newObj);
	}
	
	drawGame(VP) {
        setup.angleLight += .3;
		if(setup.angleLight>360) setup.angleLight -= 360;
		x = Math.sin(utils.degToRad(setup.angleLight));
		z = Math.cos(utils.degToRad(setup.angleLight));
		if(x>0) setup.angleLight+=1;
		setup.globalsLight.l_dir = normalizeVector([z, 0, x]);

		game.block.forEach(e => {
			e.uniforms.u_matrix = utils.transposeMatrix(utils.multiplyMatrices(VP, e.uniforms.u_world));
			e.uniforms.n_matrix = utils.invertMatrix(utils.transposeMatrix(e.uniforms.u_world));
			e.uniforms.c_eyePos = space._pos_cam;
			e.uniforms = {...e.uniforms,...setup.globalsLight};
		});
		
		game.powerup.forEach(p => {
			p.uniforms.c_eyePos = space._pos_cam;
			p.uniforms.u_matrix = utils.transposeMatrix(utils.multiplyMatrices(
				VP, utils.multiplyMatrices(
					utils.MakeTranslateMatrix(p.center[0], p.center[1], 0),
					utils.MakeScaleNuMatrix(p.dimensions[0],  p.dimensions[1], p.dimensions[2])
			)))
		});
		
		game.sponde.forEach(e => {
			e.uniforms.c_eyePos = space._pos_cam;
			e.uniforms.n_matrix = utils.invertMatrix(utils.transposeMatrix(e.uniforms.u_world));
			e.uniforms.u_matrix = utils.transposeMatrix(utils.multiplyMatrices(VP, e.uniforms.u_world))
		});
		
		game.drawSingleObject(VP,game.bar);
		game.drawSingleObject(VP,game.ball);
		twgl.drawObjectList(gl, game.sponde);
		twgl.drawObjectList(gl, game.block);
		twgl.drawObjectList(gl, game.powerup);
		requestAnimationFrame(game.play);
	}

	drawSingleObject(VP,item) {
		item.updateLocal();
		item.uniforms.u_matrix = utils.transposeMatrix(utils.multiplyMatrices( VP, item.uniforms.u_world));
		item.uniforms.n_matrix = utils.invertMatrix(utils.transposeMatrix( item.uniforms.u_world));
		item.uniforms.c_eyePos = space._pos_cam;
		item.uniforms = {...item.uniforms,...setup.globalsLight};
		gl.useProgram(item.programInfo.program);
		twgl.setBuffersAndAttributes(gl, item.programInfo, item.bufferInfo);
		twgl.setUniforms(item.programInfo, item.uniforms);
		twgl.drawBufferInfo(gl, item.bufferInfo);
	}

	willHavePowerUp() {
		// randomically decides to add a powerup or not to the block: subsequent negative cases result in an increase 
		// of the pity, which increases the probability that the next block will have a powerup
		if (Math.random() + this.pity > 0.9) {
			this.pity = 0;
			return true;
		}

		else {
			this.pity += 0.1;
			return false;
		}
	}

	/* <----------------- Power-Up List -----------------> */
	
	POWERUPS = {
		"1": {
			"color": [1, 0.749019608, 0, 1],
			"effect":"Bigger bar",
			apply: function(){
				var newDimension = 0.4;
				if (!(game.bar.center[0] > -1 + newDimension)) game.bar.center[0] = -1 + newDimension;
				game.bar.dimensions[0] = 0.4;
				game.updateSpigoliObject(game.bar);
			},
			texture: {
				texture:setup.textures.enlarge,
				sampler:setup.samplers.nearest,
			},
			normaltexture:{
				texture:setup.textures.normalenlarge,
				sampler:setup.samplers.nearest,
			}
		},
		"2": {
			"color": [0.501960784, 0, 1, 1],
			"effect":"Short bar",
			apply: function(){
				game.bar.dimensions[0] = 0.15;
			},
			texture: {
				texture:setup.textures.restrict,
				sampler:setup.samplers.nearest,
			},
			normaltexture:{
				texture:setup.textures.normalrestrict,
				sampler:setup.samplers.nearest,
			}
		},
		"3": {
			"color": [1, 0, 0.501960784, 1],
			"effect":"Speed up",
			apply: function(){
				game.velocityBall = 0.03;
			},
			texture: {
				texture: setup.textures.fast,
				sampler: setup.samplers.nearest,
			},
			normaltexture:{
				texture:setup.textures.normalfast,
				sampler:setup.samplers.nearest,
			}
		},
		"4": {
			"color": [0, 1, 0.749019608, 1],
			"effect":"slow down",
			apply: function(){
				game.velocityBall = 0.02;
			},
			texture: {
				texture: setup.textures.slow,
				sampler: setup.samplers.nearest,
			},
			normaltexture:{
				texture:setup.textures.normalslow,
				sampler:setup.samplers.nearest,
			}
		}
	};
	/* <----------------- Functions for UI -----------------> */

	updateScore() {
		this.score += 10;
		$(".ui-score").text("Score: " + this.score);

		//check win condition
		if (this.block.length === 0) {
			this.gameEnd = Date.now() / 1000;
			var gameDuration = this.gameEnd - this.gameStart;
			var finalScore = this.score + Math.round(250 * this.totalBlocks / gameDuration);
			game.changeState("Won");
			$("#victory-score").text("Your score: " + finalScore);
			document.getElementById('victory-screen').style.display = "block";
		}
	}

	handleLifeLoss() {
		console.log("lost a life or the game");
		game.changeState("Pause");
		game.powerup = []; //delete every rendered upgrade if the player loses a life
		this.lives -= 1;

		//handling cases where player still has 1-2 lives left
		if (this.lives + 1 === 3 || this.lives + 1 === 2) {
			const lifeId = this.lives + 1;
			document.getElementById('life-' + lifeId).style.display = "none";
			this.ballAngle = 90;
			this.bar.center = [0, -1];
			this.ball.center = [0.0, this.bar.center[1] + this.ball.radius + this.bar.dimensions[1]];
			this.arrow.updateLocal();
			console.log(this.ball.center,this.arrow.center);
			this.changeState("Starting");
			this.play();
		}

		//handling case where the player has no lives left: LOSS
		else if (this.lives + 1 === 1) {
			document.getElementById('life-1').style.display = "none";
			document.getElementById('lost-screen').style.display = "block";
		}
	}
}