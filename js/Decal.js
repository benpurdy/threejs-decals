THREE.DecalFactory = function( params )
{
	this._orthoMatrix = new THREE.Matrix4();
	this._rotateMatrix = new THREE.Matrix4();
	this._translateMatrix = new THREE.Matrix4();

	this.decalMaterial = params.material;

	this.maxDecals = params.maxDecals ? params.maxDecals : 25;

	this.decals = [];

	this.decalsExpire = false;
	this.decalLifeSpan = params.lifeSpan ? params.lifeSpan : 30;
	this.decalFade = true;


	this.update = function() {
		
		if(!this.decalsExpire){
			return;
		}

		var now = new Date().getTime();

		for(var i = 0; i < this.decals.length; i++) {

			if(this.decals[i].fading){
				var fadeAmount = 1 - ((now - this.decals[i].fadeStart) / 1000); 
				this.decals[i].obj.material.opacity = fadeAmount;

				if(fadeAmount <= 0){
					this.removeDecal(i);
				}
			}else if(now - this.decals[i].spawnTime > this.decalLifeSpan){

				if(this.decalFade){
					this.decals[i].fading = true;
					this.decals[i].fadeStart = now;
				} else {
					this.removeDecal(i);
				}
			}
		}
	};

	this.projectOnMesh = function(mesh, origin, direction, angle, size) {
		
		this._orthoMatrix.makeOrthographic(-size.x/2, size.x/2, -size.y/2, size.y/2, size.z/2, -size.z/2);

		this._rotateMatrix.lookAt( direction.clone(), new THREE.Vector3(), new THREE.Vector3(0,1,0) );
		this._orthoMatrix.multiply(this._rotateMatrix.getInverse(this._rotateMatrix));

		this._rotateMatrix.makeRotationAxis( direction, angle );
		this._orthoMatrix.multiply( this._rotateMatrix );

		this._translateMatrix.makeTranslation(-origin.x, -origin.y, -origin.z);
		this._orthoMatrix.multiply(this._translateMatrix);
		

		var geometry = this.createGeometry(this._orthoMatrix, mesh);

		var decal = new THREE.Mesh(geometry, this.decalMaterial.clone());
	  
		this.decals.push({
			obj: decal,
			fading: false,
			fadeStart: 0,
			spawnTime: new Date().getTime(),

		});
		this.checkDecalCount();

		mesh.add(decal);
	};

	this.checkDecalCount = function() {
		if(this.decals.length > this.maxDecals){
			this.removeDecal(0);
		}
	}

	this.removeDecal = function(index){
		if((index >= 0) && (index < this.decals.length)){
			this.decals[index].obj.parent.remove(this.decals[index].obj);
			this.decals.splice(index, 1);
		}
	}
	
	this.createGeometry = function(matrix, mesh) {

	  var geom = mesh.geometry;

	  var decalGeometry = new THREE.Geometry(); 

	  var projectorInverse = matrix.clone().getInverse(matrix);
	  var meshInverse = mesh.matrixWorld.clone().getInverse(mesh.matrixWorld);
	  var faces = [];

	  for(var i = 0; i < geom.faces.length; i++){

	    var verts = [geom.faces[i].a, geom.faces[i].b, geom.faces[i].c];

	    var pts = [];
	    var valid = false;

	    for(var v = 0; v < 3; v++) {
	      
	      var vec = geom.vertices[verts[v]].clone();
	      
	      vec.applyMatrix4(mesh.matrixWorld);
	      vec.applyMatrix4(matrix);
	            
	      if((vec.z > 1) || (vec.z < -1) || (vec.x > 1) || (vec.x < -1) || (vec.y > 1) || (vec.y < -1)) {
	      } else {
	        valid = true;
	      }

	      pts.push(vec);
	    }

	    if(valid) {

	      var uv = [];
	      for(var n = 0; n < 3; n++){
	        uv.push(new THREE.Vector2( (pts[n].x + 1) / 2, (pts[n].y + 1) / 2));
	        
	        pts[n].applyMatrix4(projectorInverse);
	        pts[n].applyMatrix4(meshInverse);

	        decalGeometry.vertices.push( pts[n] );
	      }

	      // update UV's
	      decalGeometry.faceVertexUvs[0].push(uv);
	      
	      var newFace = geom.faces[i].clone();

	      newFace.a = decalGeometry.vertices.length - 3;
	      newFace.b = decalGeometry.vertices.length - 2;
	      newFace.c = decalGeometry.vertices.length - 1;
	      
	      decalGeometry.faces.push(newFace);
	    }
	    
	  }

	  return decalGeometry;
	}
}