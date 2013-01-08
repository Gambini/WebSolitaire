/**
  @module Game
*/


/**
  A way to hook in to the game loop. For use with game.SetLogic
  @class GameLogic
  @constructor
  @param {function} updatefn The function to call during game.update
  @param {function} drawfn The function to call during game.draw
*/
function GameLogic(updatefn,drawfn) {
	/**
	  A function that is called when game.update is complete
	  @property update
	  @type function
	 */
	this.update = updatefn;
	/**
	  Should be a function that takes a canvas context as an
	  argument. Called when game.draw is complete
	  @property draw
	  @type function
	 */
	this.draw = drawfn;
}


/** 
	@class game 
	@static 
*/
var game = game || {}; //namespace

/**
  Sets the logic to use during the game loop. There can only be one logic
  active at a time.
  @method SetLogic
  @param {GameLogic} logic The logic to use
*/
game.SetLogic = function(logic) {
	game.logic = logic;
}

/**
  Gets the offset of the canvas relative to the screen. Useful for getting
  the canvas space. Sets game.canvasOffset
  @method GetCanvasOffset
*/
game.GetCanvasOffset = function() {
	var off = $("#maincanvas").offset();
	/**
	  An object with x and y attributes that represents the offset
	  of the canvas in relation to the screen
	  @property canvasOffset
	  @type Object
	 */
    game.canvasOffset = {x:off.left,y:off.top};
}

/**
  Converts the screen coordinates x,y to canvas x,y.
  For this to be correct, x and y must be inside the canvas in
  screen space.
  @method CanvasSpace
  @param {Number} x The x-coord in screen space
  @param {Number} y The y-coord in screen space
  @return {Array} [x,y] in canvas space
*/
game.CanvasSpace = function(x,y) {
	return [x - game.canvasOffset.x, y - game.canvasOffset.y];
}

/**
  Sets the canvas resolution to width x height.
  @method ResizeCanvas
  @param {Number} width The horizontal resolution to set the canvas
  @param {Number} height The vertical resolution to set the canvas
*/
game.ResizeCanvas = function(width,height) {
	/**
	   The width of the canvas. The same as canvasElement.width
	   @property width 
	   @type Number 
	   @default 400
	 */
	game.width = width;
	/**
	   The height of the canvas.The same as canvasElement.height
	   @property height 
	   @type Number 
	   @default 400
	 */
	game.height = height;

	game.canvasElement.width = width;
	game.canvasElement.height = height;
	game.GetCanvasOffset();
}

/**
  The update function. Called directly before draw every loop
  @method update
*/
game.update = function() {
	if(game.logic)
		game.logic.update();
}

/**
  The draw function. Called directly after update every loop
  @method draw
*/
game.draw = function() {
	game.canvas.clearRect(0,0,game.width,game.height);
	if(game.logic)
		game.logic.draw(game.canvas);
}

/**
  Should be called after document.ready. Gets the canvas element and context.
  @method start
*/
game.start = function() {
	/**
	  The canvas element in the DOM
	  @property canvasElement 
	  @type canvas
	*/
	game.canvasElement = document.getElementById('maincanvas');
	/**
	  The canvas element's 2d context. This is what you draw to.
	  @property canvas 
	  @type context
	 */
	game.canvas = game.canvasElement.getContext('2d');

	game.ResizeCanvas(400,400);

	var fps = 30;
	setInterval(function() {
		game.update();
		game.draw();
	}, 1000/fps);
}

$( document ).ready(function() {
	game.start();
});
