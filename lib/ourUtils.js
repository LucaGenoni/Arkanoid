function buildGeometry(slices,quotes) {	
	var dataSphere = sphere(slices,quotes,"quotato")
	var color5 = [1.0, 0.0, 0.0];
    var vert = []
    var normals = []
    var index = dataSphere[1]
    for(i=0;i<dataSphere[0].length;i++){
        vert.push(dataSphere[0][i][0],dataSphere[0][i][1],dataSphere[0][i][2])
        normals.push(dataSphere[0][i][3],dataSphere[0][i][4],dataSphere[0][i][5])
    }
	// addMesh(dataSphere[0], dataSphere[1], color5);
    return {
        position:vert,
        normal: normals,
        indices: index,
    };
}


function sphere(slices,quotes,key){
	var quota = quotes;
	var anglequota = (Math.PI) /quota;
	var angleslice = (2*Math.PI) /slices;
	// Creates vertices
	var k = 0;
	var vert = [];
	for(j = 1; j < quota; j++) {
		for(i = 0; i < slices; i++) {
			x = Math.sin(i*angleslice) * Math.sin(j*anglequota);
			y = Math.cos(j*anglequota);
			z = Math.cos(i*angleslice) * Math.sin(j*anglequota);
			vert[k++] = [x, y, z];
		}
	}
	var top = k;	vert[k++] = [0, 1, 0];
	var bottom = k;	vert[k++] = [0, -1, 0];

	// Creates indices
	var ind = [];
	k = 0;
	for(i = 0; i < slices; i++) {
		// upper	
		ind[k++] = top;	
		ind[k++] = i ;
		ind[k++] = (i + 1) % slices ;
		for(j = 0; j < quota-2; j++) {
			
			ind[k++] = (i + 1) % slices + (j) * slices;
			ind[k++] = i + (j) * slices ;
			ind[k++] = i + (j + 1) * slices ;
			
			ind[k++] = (i + 1) % slices + (j + 1)* slices ;
			ind[k++] = (i + 1) % slices + (j) * slices ;
			ind[k++] = i + (j + 1) * slices ;
		}
		//close bottom		
		ind[k++] = i + (j) * slices ;
		ind[k++] = bottom;
		ind[k++] = (i + 1) % slices + (j) * slices;
	}
	
	return normalMode(vert,ind,key);
}
function cube() {
	return {
		position: [1,1,-1,1,1,1,1,-1,1,1,-1,-1,-1,1,1,-1,1,-1,-1,-1,-1,-1,-1,1,-1,1,1,1,1,1,1,1,-1,-1,1,-1,-1,-1,-1,1,-1,-1,1,-1,1,-1,-1,1,1,1,1,-1,1,1,-1,-1,1,1,-1,1,-1,1,-1,1,1,-1,1,-1,-1,-1,-1,-1],
		normal: [1,0,0,1,0,0,1,0,0,1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,0,1,0,0,1,0,0,1,0,0,1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,0,1,0,0,1,0,0,1,0,0,1,0,0,-1,0,0,-1,0,0,-1,0,0,-1],
		texcoord: [1,0,0,0,0,1,1,1,1,0,0,0,0,1,1,1,1,0,0,0,0,1,1,1,1,0,0,0,0,1,1,1,1,0,0,0,0,1,1,1,1,0,0,0,0,1,1,1],
		indices: [0,1,2,0,2,3,4,5,6,4,6,7,8,9,10,8,10,11,12,13,14,12,14,15,16,17,18,16,18,19,20,21,22,20,22,23],
	};
}

{

	function normalMode(vert,ind,key) {		
		switch (key) {
			case "derivate":
				return [blend(vert,normalArrayDerivate(vert)), ind];	
			case "quotato":
				// Here the vertex normal is formed by adding to a vertex
				// all the weighted normal of the triangles connected to the vertex.
				// the weighting is done using the angle of the triangle of the of the vertex
				return [blend(vert,normalArrayQuotato(vert,ind)), ind];	
			default:
				// Here the vertex normal is formed by adding to a vertex
				// all the normal of the triangles connected to the vertex.
				return [blend(vert,normalArray(vert,ind)), ind];
		}
	}

	function blend(verts_A,verts_B) {
		var i,j,out;
		var lv=verts_A[0].length,ln=verts_B[0].length;		
		out = [];
		for (i = 0; i<verts_A.length;i++){
			out[i] = [];
			for (j = 0; j<lv;j++) out[i].push(verts_A[i][j]);
			for (j = 0; j<ln;j++) out[i].push(verts_B[i][j]);
		}
		return out;
	}

	function normalArray(vertices, indices){
		var normArray = new Array(vertices.length);
		// the normal vector need to keep count of all the normal applied to a vector
		for(var i=0;i<indices.length;i=i+3){
			var norm = normalVector3Points(vertices[indices[i]],vertices[indices[i+1]],vertices[indices[i+2]]);
			for(var k=0;k<3;k++) {
				if (normArray[indices[i+k]]=== undefined) normArray[indices[i+k]] = norm;
				else normArray[indices[i+k]] = addVectors(normArray[indices[i+k]] ,norm);
			}
		}
		for(var i=0;i<normArray.length;i++) normArray[i] = normalizeVector(normArray[i]);
		return normArray;
	}
	
	function normalArrayQuotato(vertices, indices) {
		var normArray = new Array(vertices.length);		
		for(var i=0;i<indices.length;i=i+3){
			// this function require a specific order of the verteces of a triangle
			// b<-a	   c
			// | /	  /|
			// |/	 / |
			// c	a->b
			var norm = normalVector3Points(vertices[indices[i]],vertices[indices[i+1]],vertices[indices[i+2]]);
			var AB = [subVector(vertices[indices[i+1]],vertices[indices[i]]),];		
			AB.push(Math.sqrt(dotProductVector(AB[0],AB[0])));
			var AC = [subVector(vertices[indices[i+2]],vertices[indices[i]]),];
			AC.push(Math.sqrt(dotProductVector(AC[0],AC[0])));
			var BC = [subVector(vertices[indices[i+2]],vertices[indices[i+1]]),];
			BC.push(Math.sqrt(dotProductVector(BC[0],BC[0])));
			var quote = [];
			quote.push(dotProductVector(AB[0],AC[0])/(AB[1]*AC[1]));
			quote.push(dotProductVector(AB[0],BC[0])/(AB[1]*BC[1]));
			quote.push(dotProductVector(BC[0],AC[0])/(BC[1]*AC[1]));
			for(var k=0;k<3;k++) {
				quote[k] = Math.acos(quote[k])
				var normalModified = scalarVector(quote[k],normalizeVector(norm));
				if (normArray[indices[i+k]]=== undefined) normArray[indices[i+k]] = normalModified;
				else normArray[indices[i+k]] = addVectors(normArray[indices[i+k]] ,normalModified);
			}
		}		
		for(var i=0;i<normArray.length;i++) normArray[i] = normalizeVector(normArray[i]);
		return normArray;
	}

	function normalArrayDerivate(vert) {
		var normArray = new Array(vert.length);		
		for(var i=0;i<vert.length;i++){
			normArray[i] = [
				-Math.cos(vert[i][0])*Math.cos(vert[i][2]),
				1,
				Math.sin(vert[i][0])*Math.sin(vert[i][2])
			]
		}
		for(var i=0;i<normArray.length;i++) normArray[i] = normalizeVector(normArray[i]);
		return normArray
	}

	function normalVector3Points(a, b, c){
		//to obtain the normal vector of a plane generated by 3 point:	n = (B-A)×(C-A) 
		return crossProductVector(subVector(b,a),subVector(c,a));
	}

	function crossProductVector(vect_A, vect_B){
		return [
			vect_A[1] * vect_B[2] - vect_A[2] * vect_B[1],
			vect_A[2] * vect_B[0] - vect_A[0] * vect_B[2],
			vect_A[0] * vect_B[1] - vect_A[1] * vect_B[0]
		];
	}
	
	function dotProductVector(vect_A, vect_B){
		return vect_A[0] * vect_B[0]+vect_A[1] * vect_B[1]+vect_A[2] * vect_B[2];
	}
	
	function addVectors(vect_A,vect_B){	
		return [vect_A[0]+vect_B[0], vect_A[1]+vect_B[1], vect_A[2]+vect_B[2]];
	}
	
	function subVector(vect_A,vect_B){	
		return [vect_A[0]-vect_B[0], vect_A[1]-vect_B[1], vect_A[2]-vect_B[2]];
	}
	
	function normalizeVector(vector){
		return scalarVector(1/Math.sqrt(dotProductVector(vector,vector)), vector);
	}
	
	function scalarVector(scalar, vector){
		return [scalar*vector[0],scalar*vector[1],scalar*vector[2]];
	}
}