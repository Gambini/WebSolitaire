/**
  @module Maths
*/

/**
  Holds transformation and bounding area for rectangular shapes
  @class Rectangle
  @constructor
  @param {Number} x_ The origin x
  @param {Number} y_ The origin y
  @param {Number} width_ The width of the rectangle
  @param {Number} height_ The height of the rectangle
*/
function Rectangle(x_,y_,width_,height_) {
	/**
	  The x,y coordinates of the middle of this rectangle
	  @property origin
	  @type Array
	 */
	this.origin = [x_,y_];
	/**
	  The vertexes that are not transformed in to model-space.
	  @property verts
	  @protected
	  @type Array
	*/
	this.verts = [-(width_/2),-(height_/2), (width_/2), (height_/2) ];
	/**
	  The transformation matrix (3x3) describing how vertexes should be moved
	  @property transform
	  @type Matrix
	  @default The identity matrix translated to this.origin
	*/
	this.transform = Matrix.create([[1,0,x_],[0,1,y_],[0,0,1]]);
	this._transformed = [0,0,0,0];
	this._dirty = true;

	/**
	  Sets everything back to default
	  @method Reset
	 */
	this.Reset = function() {
		this.transform = Matrix.create([[1,0,x_],[0,1,y_],[0,0,1]]);
		this._transformed = [0,0,0,0];
		this._dirty = true;
	}

	/**
	  Transforms this.verts by the transform matrix.
	  Do not worry about calling this too much, as the results are cached
	  @method GetTransformedVerts
	  @return a 4-item array consisting of the left,top,right,bottom
	*/
	this.GetTransformedVerts = function()  {
		if(this._dirty) {
			var tl = Vector.create([this.verts[0],this.verts[1],1.0]);
			var br = Vector.create([this.verts[2],this.verts[3],1.0]);
			tl = this.transform.multiply(tl);
			br = this.transform.multiply(br);
			this._transformed = [tl.e(1),tl.e(2),br.e(1),br.e(2)];
		}
		return this._transformed;
	}

	/*
	  Rotates the rectangle by amount in degrees
	  @method RotateDegrees
	  @param {Number} amount Degree amount to rotate counter-clockwise
	 */
	this.RotateDegrees = function(amount) {
		return this.Rotate(amount * (Math.PI / 180.0));		
	}

	/**
	  Rotates the rectangle by amount in radians
	  @method Rotate
	  @param {Number} rads The amount to rotate counter-clockwise
	 */
	this.Rotate = function(rads) {
		var rot = Matrix.Rotation(rads);
		//get the 2x2 rotation matrix from the transform
		var trans_rot = this.transform.minor(1,1,2,2);
		var res = trans_rot.multiply(rot);
		//increidbly complicated way to set only the upper-2x2
		this.transform.map(function(ele,i,j) {
			if(i < 3 && j <3){
				ele = res.e(i,j);
			}
		});
		this._dirty = true;
	}


	/**
	  Moves the rectangle from its current position by tx horizontally and ty vertically.
	  @method Translate
	  @param {Number} tx Amount to translate in x direction
	  @param {Number ty Amount to translate in y direction
	 */
	this.Translate = function(tx,ty) {
		var trans = Vector.create([tx,ty,0.0]);
		var transform_t = this.transform.col(3);
		var res = trans.add(transform_t);
		this.transform.elements[0][2] = res.e(1);
		this.transform.elements[1][2] = res.e(2);
		this.transform.elements[2][2] = res.e(3);
		this.origin = [res.e(1),res.e(2)];
		this._dirty = true;
	}

	/**
	  Sets the rectangle's origin to be at x,y
	  @method MoveTo
	  @param {Number} x x-coordinate to move to
	  @param {Number} y y-coordinate to move to
	 */
	this.MoveTo = function(x,y) {
		this.transform.elements[0][2] = x;
		this.transform.elements[1][2] = y;
		this.origin = [x,y];
		this._dirty = true;
	}

	/**
	  Tests if x,y is fully contained by this rectangle
	  @method IsPointWithin
	  @param {Number} x x-coord to test
	  @param {Number} y y-coord to test
	  @return {Boolean} true if the rectangle contains this point
	 */
	this.IsPointWithin = function(x,y) {
		var v = this.GetTransformedVerts();
		if(x >= v[0] && y >= v[1] && x <= v[2] && y <= v[3])
			return true;
		else
			return false;
	}

	/**
	  Tests if one of the sides of this rectangle is inside of another rectangle.
	  @method Intersects
	  @param {Rectangle} other the other rectangle to test against
	  @return {Boolean} true if one of the sides is within the other rectangle
	 */
	this.Intersects = function(other) {
		var v = this.GetTransformedVerts();
		var ov = other.GetTransformedVerts();
		if( v[0] > ov[0] && v[0] < ov[2]) //left side
			return true;
		if( v[1] > ov[1] && v[1] < ov[3]) //top
			return true;
		if( v[2] > ov[0] && v[2] < ov[2]) //right side
			return true;
		if( v[3] > ov[1] && v[3] < ov[3]) //bottom
			return true;
		return false;
	}
	
}
