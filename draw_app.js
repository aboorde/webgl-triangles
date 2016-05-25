//author: aboorde

var canvas;
var gl;

var program;

var vBuffer_Line, cBuffer_Line;
var vBuffer_Tri, cBuffer_Tri;

var line_verts = [], line_colors = [];
var tri_verts = [], tri_colors = [];

var draw_mode = {DrawLines:0, DrawTriangles:1, ClearScreen:2, None:3};
var curr_draw_mode = draw_mode.None;

var num_pts_line = 0;
var num_pts_tri = 0;
var pt = [];
var vColor, vPosition;

window.onload = function init() {
							// get canvas handle
    canvas = document.getElementById( "gl-canvas" );
    
							// get context
	var ctx = canvas.getContext("experimental-webgl", 
					{preserveDrawingBuffer: true});
//	if (ctx)
//		alert( "getContext returned " + ctx ); 
//	var gl = canvas.getContext("webgl", 
//					{preserveDrawingBuffer: true});
    
							// WebGL Initialization
    gl = WebGLUtils.setupWebGL(canvas, {preserveDrawingBuffer: true} );
    if ( !gl ) { 
		alert( "WebGL isn't available" ); 
	}
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.8, 0.8, 0.0, 1.0 );
	gl.clear( gl.COLOR_BUFFER_BIT );
						//  Load shaders and initialize attribute buffers
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
						// buffer to hold vertices to be set as 
						// interactive input is received
    vBuffer_Line = gl.createBuffer();
						// buffer to hold vertices color to be set as 
						// interactive input is received
    cBuffer_Line = gl.createBuffer();
	
						// similarly for triangle buffers
	vBuffer_Tri = gl.createBuffer();
	cBuffer_Tri = gl.createBuffer();
						// variables through which shader receives vertex
						// and other attributes
   	vPosition = gl.getAttribLocation(program, "vPosition");
   	vColor = gl.getAttribLocation(program, "vColor");

    projection = ortho(-1, 1, -1, 1, -100, 100);
						// callbacks to drawing function - set
						// drawing mode
    document.getElementById("LinesButton").onclick = 
		function() {
			curr_draw_mode = draw_mode.DrawLines;
		};
    document.getElementById("TrianglesButton").onclick = 
		function(){
			curr_draw_mode = draw_mode.DrawTriangles;
		};
    document.getElementById("ClearScreenButton").onclick = 
		function(){
			curr_draw_mode = draw_mode.ClearScreen;
								// clear the vertex and color arrays
			while(line_verts.length > 0) 
				line_verts.pop();
			while(tri_verts.length > 0) 
				tri_verts.pop();
				
			gl.clear( gl.COLOR_BUFFER_BIT );
		};
								// event listener for mouse events
	canvas.addEventListener('mousedown', handleMouseDown, false);
								// set line width
	gl.lineWidth(3.);
	
    render();
};
							// all drawing is performed here
function render(){
    if (line_verts.length) {	// draw lines
								// enable the line vertex and line color buffers
  		gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer_Line );
								// set vertex data into buffer (inefficient)
   		gl.bufferData( gl.ARRAY_BUFFER, flatten(line_verts), 
												gl.STATIC_DRAW );
								// share location with shader
   		gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
   		gl.enableVertexAttribArray(vPosition);

   		gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer_Line );
								// set color data into buffer (inefficient!)
   		gl.bufferData( gl.ARRAY_BUFFER, flatten(line_colors), gl.STATIC_DRAW );
								// share location with shader
   		gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
   		gl.enableVertexAttribArray(vColor);

								// draw the lines
		gl.drawArrays(gl.LINES, 0, line_verts.length/4);
	}

	if (tri_verts.length) {			// draw triangles
								// enable the tri vertex and color buffers
		gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer_Tri );
								// set vertex data into buffer (inefficient!)
    	gl.bufferData( gl.ARRAY_BUFFER, flatten(tri_verts), gl.STATIC_DRAW );
								// share location with shader
    	gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0);
    	gl.enableVertexAttribArray(vPosition);

		gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer_Tri );
								// set color data into buffer (inefficient!)
    	gl.bufferData( gl.ARRAY_BUFFER, flatten(tri_colors), gl.STATIC_DRAW );
								// share location with shader
   		gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    	gl.enableVertexAttribArray(vColor);
								// draw the triangles
		gl.drawArrays(gl.TRIANGLES, 0, tri_verts.length/4);
	}

	requestAnimFrame(render);
}
function handleMouseDown(evt) {
								// get mouse position
	var pos = getMousePos(canvas, evt);
	var message = 'Mouse position: ' + pos.x + ',' + pos.y + '\n'; 
	var ndcp;
			
	switch(curr_draw_mode) {
		case draw_mode.DrawLines:		
			if (num_pts_line == 0){			// get first point of line segment
				pt[0] = screen_to_ndc(pos.x, pos.y);
				ndcp = pt[0];
				num_pts_line++;
			}
			else {						// get second point and update vertex
										// and color arrays
				pt[1] = screen_to_ndc(pos.x, pos.y); 
				ndcp = pt[1];
								// update the primitive arrays
				line_verts.push(pt[0].x, pt[0].y, 0., 1.);
				line_verts.push(pt[1].x, pt[1].y, 0., 1.);
				
								// set colors				
				line_colors.push(1.0, 0.0, 0.0, 1.0);
				line_colors.push(0.0, 1.0, 0.0, 1.0);

				num_pts_line = 0;				
			}
			message += 'Normalized Device Coordinates: '+ndcp.x+',' +ndcp.y;
			
			break;
		case draw_mode.DrawTriangles:
			if (num_pts_tri < 2){
				pt[num_pts_tri] = screen_to_ndc(pos.x, pos.y); 
				ndcp = pt[num_pts_tri];
				num_pts_tri++;
			}
			else {
				pt[2] = screen_to_ndc(pos.x, pos.y);
				ndcp = pt[2];
				tri_verts.push(pt[0].x, pt[0].y, 0.0, 1.0);
				tri_verts.push(pt[1].x, pt[1].y, 0.0, 1.0);
				tri_verts.push(pt[2].x, pt[2].y, 0.0, 1.0);
				ndcp = pt[num_pts_tri];

				tri_colors.push(1.0, 0.0, 0.0, 1.0);
				tri_colors.push(0.0, 1.0, 0.0, 1.0);
				tri_colors.push(0.0, 0.0, 1.0, 1.0);

				num_pts_tri = 0;
				
			}
			message += 'Normalized Device Coordinates: '+ndcp.x+',' +ndcp.y;
			break;
	}
	document.getElementById('message').value = message;
}
function getMousePos(canvas, evt) {
	var rect = canvas.getBoundingClientRect();
	return {
          x: evt.clientX - rect.left,
          y: evt.clientY - rect.top
        };
}
function screen_to_ndc(sx, sy) {	
	return {
		x: 2.*sx/canvas.width - 1.,
		y: -2.*sy/canvas.height + 1.
		};
}
