
VRDoodler = function() {

	 constructor = ( function() {
	 var camera, scene, renderer,orbitcamera,light;
     var geometry, material, mesh;
     var controls;
 	 context = null;
	 currentPlane = 0;
	 drawnline = [];
	 var container, canvas;

	 var manager;


	 MAX_POINTS = 800;
	 countVertices = 0;
	 var sketchContainer,objContainer ;
	 CURRENTspline = -1; //incremented at initNewLine
	 var raycaster, parentTransform, planeLockInd, lineLockInd, planeLockOutline, grid ;
	 mouse = new THREE.Vector2();
	 var currentIntersected, currentIntersectedPoint, lastIntersected, lastIntersectedPoint;
	 var currentMouseRay;
	
	 bIsDrawing = false;
	 bShowInfo = true;
	
	 ORBITMODE = 0;  //when not drawing
	 FREEHANDMODE = 1;  //when drawing
	 SNAPMODE = 0;		//snap to pre-existing line/objects	
	 DRAWMODE = ORBITMODE;
	 CURRENTLINEWIDTH = 2;
	 PLANEROTATELOCK = 0;
	 CAMERAPLANELOCK = 0;
	
		 SNAPPINGTOGRID = 0;
	
	 cameraAngle = 0;
	 orbitRange = 5;
	 orbitSpeed = 2 * Math.PI/4;
	 desiredAngle = 90 * Math.PI/180;
	 var plane, planegeo, planemat,planeBoundsMat, planeBounds;
	 PLANEROTATE = 0;
	 COLOR = 0;
	 linematerial = null;
	 start = Date.now();
		 clock = new THREE.Clock();
	 var edges, cameraHelp;

	var saveFileLocally = (function () {
		var a = document.createElement("a");
		document.body.appendChild(a);
		a.style = "display: none";
		return function (data, fileName) {
			var json = JSON.stringify(data),
				blob = new Blob([json], {type: "octet/stream"}),
				url = window.URL.createObjectURL(blob);
			a.href = url;
			a.download = fileName;
			a.click();
			window.URL.revokeObjectURL(url);
		};
	}());

	//tracks loading progress
	var onProgress = function ( xhr ) {
					if ( xhr.lengthComputable ) {
						var percentComplete = xhr.loaded / xhr.total * 100;
						console.log( Math.round(percentComplete, 2) + '% downloaded' );
					}
				};
				
	var onError = function ( xhr ) {
	};
	}());

	 this.init=function(){	
		container = document.createElement( 'div' );
		container.style.position = 'absolute';
		container.style.top = '30px';
		container.style.width = '100%';
		container.style.textAlign = 'center';
		container.style.color = '#fff';
		container.style.fontWeight = 'bold';
		container.style.backgroundColor = 'transparent';
		container.style.zIndex = '1';
		container.style.fontFamily = 'Monospace';
		container.innerHTML = "draw1";
		document.body.appendChild( container );

		//create a basic scene
		scene = new THREE.Scene();

		//add a visualization for the axes
    	scene.add( new THREE.AxisHelper(500) );  
    	
    	//create and add a light source
    	light = new THREE.DirectionalLight( 0xffffff );
				scene.add( light );

		//set the renderer to WebGL, size of our window
    	renderer = new THREE.WebGLRenderer( { antialias: false } );		
		renderer.setSize( window.innerWidth, window.innerHeight );
		
		container.appendChild( renderer.domElement );
		
		//create and add a perspective camera
		camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 10000 );
		camera.position.set(2, 0, 1);
		camera.name="orig";


		

//TODO: what are these? what do they do?			   		   
		sketchContainer = new THREE.Object3D();  //helpers etc that aren't included in raycasting
		objContainer = new THREE.Object3D();
		objContainer.name = "objContainer";
		objContainer.geometry = null;

		//how we move the camera around
  		scene.add(objContainer);
  		scene.add(sketchContainer);
		controls = new THREE.OrbitControls( camera, renderer.domElement );
		
	
//Why this choice for linePrecision? Does changing this affect the actual effect of the
// raycasting?  		
  		raycaster = new THREE.Raycaster();
		raycaster.linePrecision = .05;
		
		//initializing some assets we'll need later

		var geometry = new THREE.SphereGeometry( .05 );
		var material = new THREE.MeshBasicMaterial( { color: 0xee0055 } );
		lineLockInd = new THREE.Mesh( geometry, material );
		lineLockInd.visible = false;
		scene.add( lineLockInd );
		
		geometry = new THREE.SphereGeometry( .1 );
		material = new THREE.MeshBasicMaterial( { color: 0x003333 } );
		planeLockInd = new THREE.Mesh( geometry, material );
		planeLockInd.visible = false;
		//scene.add( planeLockInd );
		

		//what are these ones for?
		planegeo = new THREE.PlaneGeometry(.5,.5);
		planemat = new THREE.MeshBasicMaterial( {color: 0xddcccc, side: THREE.DoubleSide, transparent:true, opacity:.4} );
		planeBoundsMat = new THREE.MeshBasicMaterial( {color: 0x0000ff, side: THREE.DoubleSide, transparent:true, opacity:.4} );
		planeBoundsMat2 = new THREE.MeshBasicMaterial( {color: 0x00ff00, side: THREE.DoubleSide, transparent:true, opacity:.4} );

//TODO: this seems important, what is this?
		lastIntersectedPoint = new THREE.Vector3(0,0,0);		

	
		/*document.getElementById('show').onclick = printVerts;

		
		document.getElementById('trace').onclick = trace;

		document.getElementById('colorToggle').onclick = colorToggle;*/
		
		//add a light to the scene
        var light = new THREE.DirectionalLight( 0xcccccc, 1 );
				light.position.set( 1, 1, 1 ).normalize();
				scene.add( light );
			

		manager = new THREE.LoadingManager();
				manager.onProgress = function ( item, loaded, total ) {
				console.log( item, loaded, total );

		};
	

	//just shows some overlays??
		$('#infoPanelTag').click(function() {
		  $("#infoPanel").toggle( "slow" );		  
		});
		
		$('input').click(function() {
		 $("#infoPanel").text("Draw Mode is " + DRAWMODE + " Line Width is " + CURRENTLINEWIDTH + " Snap Mode is " + (SNAPMODE) );

 
	  });
	  
	  
	   //scene.add(camera);
 
	//loadAnObject();
	}

	

	this.exportToObj =function()
			{	
				var exporter = new THREE.OBJExporter();
				var result = exporter.parse(scene);  /*not exporting right?? only exports as mesh and buffer geometry*/
				
				saveFileLocally(result, "myDrawing.obj");
				
				var xmlhttp = new XMLHttpRequest();
				xmlhttp.open("POST", "http://localhost:8080/writeObj", true);
				xmlhttp.onreadystatechange = function () {
				  if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
					//Handle response
				  }
				};
				 xmlhttp.send(result);
				
	}

	 this.importScene = function(){
			/* something like this */
			var loader = new THREE.OBJLoader( manager );
				loader.load( '../test.obj', function ( object ) {

					object.traverse( function ( child ) {
						
						if ( child.children instanceof Array ) { //THREE.Line
						
							child.children.every( function ( gchild ){
								if ( gchild instanceof THREE.Mesh ) { //THREE.Line
									initNewLine(null, null, gchild.geometry, gchild.geometry.attributes.position);
								}
							});

						}

					 });

					object.position.y = - 80;//?
					scene.add( object );

				}, onProgress, onError );
			
	}

	

	 this.rotateX=function(){
 		//planeBounds.rotation.y = 0;
 		//planeBounds.rotation.z = 0;
 		//controls.target = lastIntersectedPoint;
		camera.lookAt(lastIntersectedPoint);
 		camera.rotation.x += 90 * Math.PI / 180;
 		
		
	}
	 this.rotateY=function(){
 		planeBounds.rotation.x = 0;
 		planeBounds.rotation.z = 0;
 		planeBounds.rotation.y += 90 * Math.PI / 180;
 		
		
	}
	 this.rotateZ=function(){
 		planeBounds.rotation.y = 0;
 		planeBounds.rotation.x = 0;
 		planeBounds.rotation.z += 90 * Math.PI / 180
 		
		
	}
	
	 this.checkRotation=function(){

		var x = camera.position.x,
			y = camera.position.y,
			z = camera.position.z;
			
		var orbitRadius =  5;
		cameraAngle+=90 * Math.PI/180;
		
		
		//camera.position.x = currentIntersectedPoint.x + radius * Math.cos(90);         
		//camera.position.z = currentIntersectedPoint.z + radius * Math.sin( 90 );
		 //camera.position.x = x * Math.cos(rotSpeed) + z * Math.sin(rotSpeed);
        //camera.position.z = z * Math.cos(rotSpeed) - x * Math.sin(rotSpeed);
       // camera.position.x = camera.position.x + radius * Math.cos( angle );  
		//camera.position.z = camera.position.y + radius * Math.sin( angle );
		
  		camera.position.x = Math.cos(cameraAngle) * orbitRadius;
  		camera.position.z = Math.sin(cameraAngle) * orbitRadius;
  		
		camera.target = currentIntersectedPoint;
		camera.lookAt(currentIntersectedPoint);
		if (cameraAngle >360) cameraAngle = 0;
    
} 
	
	
	 this.rotateAroundWorldAxis=function( object, axis, radians ) {

		var rotationMatrix = new THREE.Matrix4();
	
		rotationMatrix.makeRotationAxis( axis.normalize(), radians );
		rotationMatrix.multiply( object.matrix );                       // pre-multiply
		object.matrix = rotationMatrix;
		object.setRotationFromMatrix( object.matrix );
	}
	

	 this.togglePlaneRotateLock=function(){
		PLANEROTATELOCK =PLANEROTATELOCK?0:1;	
		 return PLANEROTATELOCK;
	}
	
	 this.toggleCameraPlaneLock=function(e){
	
	/* basically square the camera to be level to one axis or another 
	and is parallel and/or perpendicular to x,y axes
	....  directly in front, or directly on top of POI */
	
		var value = e.currentTarget.value;
		CAMERAPLANELOCK =CAMERAPLANELOCK?0:1;	
		
		var snapToThis = currentIntersectedPoint;
		if (!currentIntersectedPoint)  //if drawing along selected plane...
			snapToThis = lastIntersectedPoint;
				
		scene.remove(planeBounds);
		var euler;
		var pos;
		if (value == 1){
		

			CAMERAPLANELOCK = 1;
			planeBounds = makeDirectionalPlane(planeBoundsMat, snapToThis, "bounds", planeBounds);
			rotateX();
			}
		else if(value ==2){
	

			CAMERAPLANELOCK = 2;
			planeBounds = makeDirectionalPlane(planeBoundsMat2, snapToThis, "bounds", planeBounds);
			rotateY();
			}
		else if (value == 3){

			CAMERAPLANELOCK = 3;
			planeBounds = makeDirectionalPlane(planeBoundsMat2, snapToThis, "bounds", planeBounds);
			rotateZ();
			}
			
		
		//camera.setRotationFromEuler(euler);
		//camera.position.copy(pos);
		//camera.lookAt(currentIntersectedPoint);
		//controls.object = camera;
		return CAMERAPLANELOCK;
	
	}
	
	

     var getCurrentLineWidth=function(){
		return CURRENTLINEWIDTH;
	}
	
	
	/*will eventually offer black on white or white on black (default) */
	 this.colorToggle=function(){
		//TODO need to change background color in tandem...
		COLOR = COLOR?0:1;
		return COLOR;
	}
	
	/* not yet implemented */
	 this.toggleInfoPanel=function(){
		//controls.stop();
		bShowInfo = bShowInfo?0:1;
		return bShowInfo;
	}
	
	 this.toggleGrid=function(){
	
		if (grid){
			grid.visible = grid.visible?false:true;
		}else{
			grid = new THREE.GridHelper( 20, .5 );
			grid.name="grid";
			grid.setColors( 0x0000ff, 0x808080 );
			grid.position.y = 0;
			objContainer.add( grid );
		}
			$("#grid").prop("checked",grid.visible);
	}


	 this.setCurrentLineWidth=function(){

	//controls.stop();
		CURRENTLINEWIDTH = document.getElementById("width").value;
			
			
		return CURRENTLINEWIDTH;
	}
	
	//maybe plus/minus 2?
	 this.toggleCurrentLineWidth=function(){
		//controls.stop();
		CURRENTLINEWIDTH = CURRENTLINEWIDTH--;
			
			
		return CURRENTLINEWIDTH;
	}
	
	  var changeControls=function(){
	 	var prevCamera = camera;

		camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 10000 );
				camera.name="new";
		
		camera.position.copy( prevCamera.position );
		camera.rotation.copy( prevCamera.rotation );
		camera.up = new THREE.Vector3(0,1,0);

		if (!DRAWMODE && SNAPMODE){
			controls.enabled = true;
			controls.object = camera;
			
			
		}else if (!DRAWMODE ){ 
			controls.enabled = true;
			controls.object = camera;
			//controls = new THREE.OrbitControls(camera);
			
		}else{ //if EXTRUDEMODE  //acutally suggesting a flow draw...
			controls.object = camera;
			controls.enabled = false;
		}
		controls.target = lastIntersectedPoint;
		camera.lookAt(lastIntersectedPoint);
		camera.updateProjectionMatrix();

	}
	
	 this.snapTo=function(){
	
	if (SNAPMODE){
		scene.remove(plane);
		scene.remove(planeLockOutline);
		$("#freehand").prop("checked",true);
		lineLockInd.visible = false;
		}
	else{
		
        	$('html,body').css('cursor','crosshair');
	}
 		SNAPMODE = SNAPMODE?0:1;
 		this.changeControls();
 		//if (SNAPMODE) plane.visible = true; else plane.visible = false;
 		$("#snapTo").prop("checked",SNAPMODE);
 		$("#infoPanel").text("Draw Mode is " + DRAWMODE + " Line Width is " + CURRENTLINEWIDTH + " Snap Mode is " + (SNAPMODE));

	}
	
	
	 this.snapPlanesToLocal=function(){
	
		var cameraclone = camera.clone();
		cameraclone.position.y = 0;
		//plane.lookAt(cameraclone.position);
		plane.rotation.x= 0;
		plane.rotation.z= 0;
		planeLockOutline.rotation.x = 0;
		planeLockOutline.rotation.z = 0;
		
		if (planeBounds){
			planeBounds.rotation.z = 0;
			planeBounds.rotation.x = 0;
		}
		
		//planeLockOutline.rotation.z = 0;
	}
	
/* if draw, mouse draws (snapping or not). if false, mouse moves camera */
	  this.toggleDrawMode=(function(mode){
       
		DRAWMODE = DRAWMODE?0:1;
		 if (DRAWMODE)
        	$('html,body').css('cursor','pointer');
        else 
        	$('html,body').css('cursor','move');
        
		changeControls();
		$("#draw").prop("checked",DRAWMODE);
		console.log("draw mode is " + DRAWMODE);
		$("#infoPanel").text("Draw Mode is " + DRAWMODE + " Line Width is " + CURRENTLINEWIDTH + " Snap Mode is " + (SNAPMODE));

    	return DRAWMODE;
	})();
	
	
	

	 this.onWindowResize= function() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
	}
	
	
	 this.loadAnObject=function(){
		var loader = new THREE.JSONLoader( manager );
		var path = "assets/chairVert.json"; //callback needs real var I guess
		var pos = new THREE.Vector3(0,0,10);
		loader.load(path , function ( geo ) {

		var material = new THREE.MeshLambertMaterial({
			//map: THREE.ImageUtils.loadTexture(path+ currentConfig.objTex),  // specify and load the texture
			color:0xff00ff,
			side:THREE.DoubleSide
		  });
			
		var object = new THREE.Mesh(geo, material);
		object.position.x = pos.x;
		object.position.y = pos.y;
		object.position.z = pos.z;
		//object.scale.set(5,5,5);
		
		object.userData.name = "chair";

		
		objContainer.add( object );
		});
	
	}




	  this.onDocumentMouseMove = function( evt ) {

		evt.preventDefault();
		var mouseQuotient = evt.clientX / window.innerWidth;  //.0 to .9
		mouse.x = ( evt.clientX / window.innerWidth ) * 2 - 1;
		mouse.y = - ( (evt.clientY- container.offsetTop)/ window.innerHeight ) * 2 + 1;
		
		//console.log("mouse.x " + mouse.x + " and y " + mouse.y + " ");
		if (PLANEROTATE){
			var whichz = currentIntersectedPoint? currentIntersectedPoint.z: lastIntersectedPoint.z;
			var degToRotate = Math.round((mouseQuotient * 10)%90);
			console.log( "degToRotate " + degToRotate);
			//plane.rotateY((degToRotate * 90)* Math.PI/180);  //(Math.cos(mouse.x) * 100)/90;
			plane.lookAt(camera.position);
			
		}
		
	}
	
	// Called whenever we see a keypress in our canvas. Cases are switched depending on the
	// actual key pressed
	 this.onVRDoodlerKeyDown=function(evt) {

                switch (evt.keyCode) {

                   case 68: //d draw mode
                   		toggleDrawMode();
                   		
		 					  	
                   break;
                    case 65: // a for axis
                    
                        PLANEROTATE = PLANEROTATE?0:1;
                        edges.update();
                  
                        break;
                    case 71: // g for grid
                    
                       toggleGrid();
                  
                        break;
                     case 82: //rotate panel 90
						checkRotation();
							
						break;
                    case 83: //snap to s	
						snapTo();
						break;
					/* case 80: //p audio
                    	if (CURRENTCOLLISION){
                    		if(CURRENTCOLLISION.userData.audio)
                    			loadProximalSound(CURRENTCOLLISION.userData.configOrder);
                    	
                    	}
                     */ 
                    case 88: //shift x
                     if (evt.shiftKey){
                   		//make plane 'snapped' to grid, so to speak
  
                   			SNAPPINGTOGRID = 3;
                   		
                   			$("#infoPanel").text("SNAPPINGTOGRID ON:" + SNAPPINGTOGRID);
                   			snapPlanesToLocal();   
                   		}
                    
                    break;
                    case 16: //shift to erase last
                   	  if (evt.shiftKey && evt.ctrlKey){
                   		//make plane 'snapped' to grid, so to speak
  
                   			SNAPPINGTOGRID = 3;
                   		
                   			$("#infoPanel").text("SNAPPINGTOGRID ON:" + SNAPPINGTOGRID);
                   			snapPlanesToLocal();   
                   		}else if (evt.shiftKey){
                   			SNAPPINGTOGRID = 1;
                   		
                   			$("#infoPanel").text("SNAPPINGTOGRID ON:" + SNAPPINGTOGRID);
                   			snapPlanesToLocal(); 
                   		}
                   	break; 
                     
                   case 90: //control-z to erase last
                   	if (evt.ctrlKey)
                   		if (currentDrawnLine()){
                   			
                   			currentDrawnLine().geometry.attributes.position.array = [];
                   			drawnline.pop(CURRENTspline);
                   			--CURRENTspline;
                   		}
                   	break;
               
                }
            }
     this.onVRDoodlerKeyUp=function(evt) {
      		switch (evt.keyCode) {
      			case 16: //shift to erase last
                   	
                   		//make plane 'snapped' to grid, so to speak
                   		SNAPPINGTOGRID = false;
                   	     $("#infoPanel").text("SNAPPINGTOGRID OFF");	
                   	break;
            }
     }
     /* with camera position and the object with which we want to align our next line, transform
     where the projection thinks the mouse is to where we want it to be */
     
	this.transformMouseToDesiredPlaneOfInterest=function(mv, desiredPOI){
			var whichCamera;
	
			/* this locks the drawing to a particular camera.position in order to pinpoint drawing more accurately
				use this to lock the plane perpendicularly or parallel world axes.
			*/
	
			var cameraclone = camera.clone();
			/*if (SNAPPINGTOGRID){
				cameraclone.rotation.x = 0;
				cameraclone.rotation.z = 0;
				cameraclone.rotation.y = 0;
				cameraclone.position.y = 0;
			}*/
			var unprojectedMouse = mv.clone().unproject( cameraclone );
			var destpos= cameraclone.position.clone(); 
			var camPos = cameraclone.position.clone(); 
			
			var planeclone = plane.clone();
			var camPlaneDiff = desiredPOI.clone().sub(camPos).normalize();  //if raycasting at plane, this should get correct distance
			
			var dir = unprojectedMouse.sub( camPos ).normalize();
			
			//if (SNAPPINGTOGRID)
				destpos.add(camPlaneDiff.multiplyScalar(desiredPOI.distanceTo(camPos)));
			//else
			//	destpos.add(dir.multiplyScalar(desiredPOI.distanceTo(camPos)));
			
			return destpos;
			
				
						
			/* fyi
			this Stack Overflow answer  did not work for me re: z differences.  the distanceTo made it work	
			var dir = unprojectedMouse.sub( camera.position ).normalize();
			var distance = (-currentIntersectedPoint.z- camera.position.z) / dir.z;
			var pos = unprojectedMouse.clone().add( dir.multiplyScalar( distance ) );*/
	
	
	}
			

/* if draw mode, add new vertex to line as mouse moves */
     var onSketchMouseMove=function(evt) {
    
    	//var whatZ = .5;
        if(renderer) {
          
           	mouse.x = ( evt.clientX / window.innerWidth ) * 2 - 1;
  			mouse.y =  - ( (evt.clientY- container.offsetTop) / window.innerHeight ) * 2 + 1;
                
            var vNow = new THREE.Vector3();
            vNow.set(
					mouse.x,
					mouse.y,
					0.5 );
            
            if(DRAWMODE){
            	if (SNAPMODE){  /*TODO add ability to draw between two planes...*/
            	
            		if (plane.position !== undefined ){
            		
            			
            		
            		
            			var snapToThis = currentIntersectedPoint;
						if (!currentIntersectedPoint)  //if drawing along selected plane...
							snapToThis = lastIntersectedPoint;
						var projectedMouse = new THREE.Vector3();
						projectedMouse.set(vNow.x, vNow.y, 0.5 );				
											
						
						unprojectedAndTransformedMouse = transformMouseToDesiredPlaneOfInterest(projectedMouse, snapToThis);
						
						if (SNAPPINGTOGRID ==1){
						
            				//unprojectedAndTransformedMouse.x = plane.position.x;
            			}else if (SNAPPINGTOGRID == 3){
            				unprojectedAndTransformedMouse.x = snapToThis.x;
            				unprojectedAndTransformedMouse.z = snapToThis.z;
            				//essentially, i want the ability to draw a straight line.  lock x, but y and z can move
            				//unprojectedAndTransformedMouse.y = snapToThis.y;
            				}
            			/*}else if (CAMERAPLANELOCK ==3){
            				unprojectedAndTransformedMouse.x = snapToThis.x;
            				unprojectedAndTransformedMouse.y = snapToThis.y;
            			}*/
						updateLineBuffer(unprojectedAndTransformedMouse);
						//currentLine().push(unprojectedAndTransformedMouse); 
						
						
					}else { 
						console.log("hmm plane not defined");
					}
            	}else { //freehand

            		vNow.unproject(camera);
            		console.log("drawing at plane vNow " +  vNow.x+ " " +vNow.y);
            		
            		updateLineBuffer(vNow); 
           		}
				 //vNow.z = 0;
        		
        		//push subsequent vertices into master line array
        	
            }          
        }
        else{
        console.log("renderer null");}
    }
    
    
	 var currentDrawnLine=function(){
		return drawnline[CURRENTspline];
	}


	 var initDrawnLine=function(geometry, positions,mv){
		

		if (!geometry){  //freehand or snap, doesn't matter, init the line
			geometry = new THREE.BufferGeometry();
			positions = new Float32Array( MAX_POINTS * 3 ); // 3 vertices per point
			countVertices = 0;
			if (mv){
				positions[0] = mv.x;
				positions[1] = mv.y;
				positions[2] = mv.z;
				countVertices = 1;
			}
			geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
	
			geometry.setDrawRange( 0, 0 );	
			

		
		}else{ //loaded from OBJ file
			
			geometry.addAttribute( 'position', positions )
			geometry.setDrawRange( 0, geometry.attributes.position.length-1 );
		}
	
		// material
		linematerial = new THREE.LineBasicMaterial( { color: COLOR?0x000000:0xffffff, linewidth: getCurrentLineWidth(),smoothing:1 } );
	    //linematerial = new THREE.ShaderMaterial(THREE.LineDisplacementShader); 
	    linematerial.linewidth = CURRENTLINEWIDTH;
		// line
		drawnline[CURRENTspline] = new THREE.Line( geometry,  linematerial ); //to store line	
		currentDrawnLine().geometry.attributes.position.needsUpdate = true; 
	
	}
	
   var updateLineBuffer=function(newvec) {
		if (currentDrawnLine()){
		
			//get array and update it with the new line vertices
			var positions = currentDrawnLine().geometry.attributes.position.array; //has one vertex to begin with
			
			var index = countVertices *3 ;
			
			if (newvec){
				positions[index ++] = newvec.x;
				positions[index ++] =newvec.y;
				positions[index ++] =newvec.z;
			}
			//what is better, to initialize float32array with a set of vertices (which I don't know yet), or to add to it like this?
			currentDrawnLine().geometry.attributes.position.needsUpdate = true; // required after the first render
			
			countVertices++;
		}
	}
	
	//called from mouseDown
	  var initNewLine=function(mouseVec, bUnproject, geo,positions){
	
		CURRENTspline++;
		
		if (!geo){
			 var vNow = new THREE.Vector3(mouseVec.x, mouseVec.y, mouseVec.z);
			 if (bUnproject)
				vNow.unproject(camera);
		
			initDrawnLine(null, null, vNow);

		}else
		 	initDrawnLine(geo, positions);
		
		objContainer.add( currentDrawnLine() );  
	
	}
	    
    
    /* after initing new line
    */
     var onSketchMouseUp=function(evt) {
    	document.removeEventListener("mousemove",onSketchMouseMove,false);
  	
    	if (DRAWMODE){// && evt.target.nodeName == 'CANVAS'){
			bIsDrawing=false;
			//now that we are done drawing, trim drawn array to number of master line's vertices 
    		var positions = currentDrawnLine().geometry.attributes.position.array;
    		currentDrawnLine().geometry.attributes.position.array = positions.slice(0, (countVertices-1) *3);
    		
		
    		
    		currentIntersected = undefined;
			currentIntersectedPoint = undefined;
			
    	
    		console.log("current is " + CURRENTspline);
    		}        
    }
   
	
    
      this.onSketchMouseDown=function(evt) {
     
   		if(evt.which == 3) return;      	
    	if (evt.target.nodeName == 'CANVAS'){
          	
          	mouse.x = ( evt.clientX / window.innerWidth ) * 2 - 1;
  			mouse.y =  - ( (evt.clientY- container.offsetTop)/ window.innerHeight ) * 2 + 1;
       		var mouseVec = new THREE.Vector3(mouse.x, mouse.y, 0.5);
			if (DRAWMODE > ORBITMODE){
				bIsDrawing=true;
				
				if (SNAPMODE){ /*originate line according to interesected object. 	*/
				
					if ( currentIntersectedPoint !== undefined ) {
						initNewLine(currentIntersectedPoint , false);
						console.log("drawing at intersection " + currentIntersectedPoint.x + " " + currentIntersectedPoint.y + " " + currentIntersectedPoint.z );

					}else{ 
					
					    
						var adjustedMouse = transformMouseToDesiredPlaneOfInterest(mouseVec, lastIntersectedPoint);
						initNewLine(adjustedMouse, false);
						console.log("drawing at lastIntersectedPoint " + lastIntersectedPoint.x + " " + lastIntersectedPoint.y + " " + lastIntersectedPoint.z );

					}
				}else { 

						//mouseVec.applyMatrix4(plane.matrixWorld);
						initNewLine(mouseVec, true);
						//console.log("drawing at .5");
					
				} 
			
				//set up for drawing line
				document.addEventListener("mousemove",onSketchMouseMove,false);
				document.addEventListener("mouseup",onSketchMouseUp,false);
				
				
			}
        }
    }
    
    
// animate
	 this.printVerts=function(){		
		
	}
	
	 this.getInverseViewMatrix=function()
{
	var testMat = plane.matrix.clone();
    var inverseCamToSrc = new THREE.Matrix4().getInverse(camera.matrixWorld);
    inverseCamToSrc.multiply(testMat);
  	return inverseCamToSrc;
  
}
	
	
/* the little plane indicates location and direction
   the outline plane is the canvas/plane on which to draw... I guess it could be a vertical grid
*/
	 this.makeDirectionalPlane=function(material, vecPlane, name, planeObj){

		 planeObj = new THREE.Mesh( planegeo, material );
		 planeObj.position.set( 0, 0, 0 );
		 planeObj.name = name;
		 planeObj.position.copy(vecPlane);

		 scene.add( planeObj );
		 planeObj.lookAt(camera.position);
		 if (name != "bounds"){ //cheap, fix
		 
		 //the greater the zoom out, the bigger this plane should be..
			var outlineMaterial2 = new THREE.MeshBasicMaterial( { color: 0x00eeee, transparent:true, opacity:.1,side: THREE.FrontSide } );

			planeLockOutline = new THREE.Mesh( planegeo, outlineMaterial2 );
			planeLockOutline.scale.multiplyScalar(4.05); //figure something out here
			planeLockOutline.position.copy(planeObj.position);
			var dir = planeObj.position.clone().sub( camera.position ).normalize();
			planeLockOutline.position.add(dir.multiplyScalar(.005));
					
			
			planeLockOutline.lookAt(camera.position);
			planeLockOutline.visible = true;
			planeLockOutline.name = name;
			
			 scene.add(planeLockOutline);
		}
		
		
		 if (SNAPPINGTOGRID)
		 	snapPlanesToLocal();
	
		 	
	 
		 

		lineLockInd.position.copy(planeObj.position);
	
		
		//edges = new THREE.FaceNormalsHelper( plane, 1, 0x00ff00, 1 );
		//scene.add(edges);
		
		return planeObj;
			}
			
	 this.makeCube = function( w,h,d){
		var mesh;
		var planeGeo = new THREE.BoxGeometry(w,h,d);				
		mesh = new THREE.Mesh(planeGeo, new THREE.MeshBasicMaterial({color:0x000fff, side:THREE.DoubleSide}));
		mesh.position.x = 5;
		mesh.position.y = 1;
		mesh.position.z = 3;
		sketchContainer.add(mesh);
			
					
				
					
			}



	/* highlight selected line, add plane to indicate direction of new to-be-attached line */
	//shader code currently commented out...
	//maybe be able to select line and make thicker or thinner (nice to have...)

	 this.handleRayIntersections=function(intersects,drawingAtPlane){
	console.log("mouse x and y seeking intersection " + mouse.x + " " + mouse.y);
		if ( intersects.length > 0 ) {
		
				if ( currentIntersected !== undefined ) {
					//currentIntersected.material.linewidth = CURRENTLINEWIDTH;
					//currentIntersected.material.color.setRGB(200,200,200);
				}
				
				
				currentIntersected = intersects[ 0 ].object;
				
				if (currentIntersected.name == 'grid')
					lineLockInd.material.color.set(0xffffcc);
				else
					lineLockInd.material.color.set(0xff0000);
					
				//currentIntersected.material.linewidth = 5;
				//currentIntersected.material.color.setRGB(200,200,200);
				//currentIntersected.material.uniforms.color.value = 1.0;

				currentIntersectedPoint= intersects[ 0 ].point;  //sorted in desc. order and not really accurate for mouse hover 
				
				lastIntersected = currentIntersected;
				lastIntersectedPoint = currentIntersectedPoint;
				
				if (!drawingAtPlane){
					scene.remove(plane); 
					scene.remove(planeLockOutline);
					plane = makeDirectionalPlane(planemat, currentIntersectedPoint,"guide", plane);
					lineLockInd.visible = true;
				}
				
				for( var i = 0; i < intersects.length; i++ ) {
					var intersection = intersects[ i ],
					obj = intersection.object;

					//obj.material.color.setRGB( 100,10,10);//1.0 - i / intersects.length, 0, 0 );
					//obj.material.uniforms.color.value = 1.0;
				}
				
		
		} else {
				//reset
				if ( currentIntersected !== undefined ) {
					//currentIntersected.material.linewidth = CURRENTLINEWIDTH;
					//currentIntersected.material.color.setRGB(250,250,250);
					//currentIntersected.material.uniforms.color.value = 1.0;
				}
				
				currentIntersected = undefined;
				currentIntersectedPoint = undefined;
				lineLockInd.visible = false;
				
		}
	
	}

	 this.animate=function(){
		if (currentDrawnLine()) {//make sure initialized
			currentDrawnLine().geometry.setDrawRange( 0, countVertices-1 );				
		}
		camera.updateMatrixWorld();
		camera.updateProjectionMatrix();

			
		raycaster.setFromCamera( mouse, camera );//setFromCamera unprojects mouse vector  ////LOOK HERE  //negate and see what happens  //check orbit
		var intersects = raycaster.intersectObjects( objContainer.children, true);

	
		if (DRAWMODE  && SNAPMODE && !bIsDrawing){
			handleRayIntersections(intersects);
		}else if (DRAWMODE  && SNAPMODE && bIsDrawing){
			//we want to raycast the plane-of-interest and draw along itfa
			var intersects = raycaster.intersectObjects([planeLockOutline], true);
			handleRayIntersections(intersects,true);
			
		}else{
			//TBD if PLAYBACK mode...
			//restore linesegments one vertex at a time
			//handlePlayback(intersects);
		}
		//if (linematerial) linematerial.uniforms[ 'time' ].value = .000025 * ( Date.now() - start );
		render();	 
		  
		if (!DRAWMODE){
			controls.update(clock.getDelta());
		}

	   };

	 var render=function() {
  			renderer.render( scene, camera );
		}
}