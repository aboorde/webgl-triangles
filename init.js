var canvas, gl, program;
var vBuffer_Point, cBuffer_Point;
var vBuffer_Line, cBuffer_Line;
var vBuffer_Tri, cBuffer_Tri;
var vBuffer_Quad, cBuffer_Quad;
var Max_Primitives = 100;
var transl_mode = 0;

window.onload = function init() {
							// get canvas handle
    canvas = document.getElementById( "gl-canvas" );
    
							// get context
	var ctx = canvas.getContext("experimental-webgl", 
					{preserveDrawingBuffer: true});

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

						// variables through which shader receives vertex
						// and other attributes
   	vPosition = gl.getAttribLocation(program, "vPosition");
   	vColor = gl.getAttribLocation(program, "vColor");

    projection = ortho(-1, 1, -1, 1, -100, 100);

    init_buffers();
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
	document.getElementById("QuadButton").onclick = 
		function(){
			curr_draw_mode = draw_mode.DrawQuad;
		};	
	document.getElementById("TranslateButton").onclick = 
		function(){
			curr_draw_mode = draw_mode.TranslateObject;
			pick_mode = 0;
			transl_mode = 1;
			SetPickObjColor(0);
			curr_pick = null;
		};
    document.getElementById("ClearScreenButton").onclick = 
		function(){
			curr_draw_mode = draw_mode.ClearScreen;
								// clear the vertex and color arrays
			gl.clear(gl.point, 0, index = 0);
			t = 0;					
			while(line_verts.length > 0) 
				line_verts.pop();
			while(tri_verts.length > 0) 
				tri_verts.pop();
			while(quad_verts.length > 0)
				quad_verts.pop();

				
			gl.clear( gl.COLOR_BUFFER_BIT );
		};
								// event listener for mouse events
	canvas.addEventListener('mousedown', handleMouseDown, false);
	canvas.addEventListener('mouseup', handleMouseUp, false);
	canvas.addEventListener('mousemove', handleMouseMove, false);
								// set line width
	gl.lineWidth(3.);
	
    render();
};

function init_buffers() {
	
	//point buffers
	cBuffer_Point = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer_Point );
	gl.bufferData(gl.ARRAY_BUFFER, Max_Primitives*32, gl.DYNAMIC_DRAW);

	vBuffer_Point = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer_Point );
	gl.bufferData(gl.ARRAY_BUFFER, Max_Primitives*32, gl.DYNAMIC_DRAW);

						// buffer to hold vertices to be set as 
						// interactive input is received
    vBuffer_Line = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer_Line );
	gl.bufferData(gl.ARRAY_BUFFER, Max_Primitives*32, gl.DYNAMIC_DRAW);
						// buffer to hold vertices color to be set as 
						// interactive input is received
    cBuffer_Line = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer_Line );
	gl.bufferData(gl.ARRAY_BUFFER, Max_Primitives*32, gl.DYNAMIC_DRAW);
						// similarly for triangle buffers
	vBuffer_Tri = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer_Tri );
	gl.bufferData(gl.ARRAY_BUFFER, Max_Primitives*32, gl.DYNAMIC_DRAW);

	cBuffer_Tri = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer_Tri );
	gl.bufferData(gl.ARRAY_BUFFER, Max_Primitives*32, gl.DYNAMIC_DRAW);

	//quad buffers
	vBuffer_Quad = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer_Quad );
	gl.bufferData(gl.ARRAY_BUFFER, Max_Primitives*32, gl.DYNAMIC_DRAW);

	cBuffer_Quad = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer_Quad );
	gl.bufferData(gl.ARRAY_BUFFER, Max_Primitives*32, gl.DYNAMIC_DRAW);


}