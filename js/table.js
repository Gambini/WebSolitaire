/**
  @module Cards
*/

/**
  The playing field, or the table which you play on. However you want to word it.
  @class Table
  @constructor
*/
function Table() {

	/**
	  The list of card stacks on the table. Indexed by stack name
	  @property card_stacks
	  @type Object
	*/
	this.card_stacks = {}
	//this.currently_hovered = null;

	/**
	  Adds a named stack to the table
	  @method AddStack
	  @param {CardStack} stack The card stack to add
	  @param {String} name The name of the stack
	  @param {Number} x Where to move the stack
	  @param {Number} y Where to move the stack
	  @return {CardStack} The card stack passed in
	*/
	this.AddStack = function(stack,name,x,y) {
		stack.rect.MoveTo(x,y);
		this.card_stacks[name] = stack;
		stack.name = name;
		return stack;
	}

	/**
	  Removes the card stack from the table
	  @method RemoveStack
	  @param {String} name The name of the stack to remove
	 */
	this.RemoveStack = function(name) {
		if(this.card_stacks[name])
			delete this.card_stacks[name];
	}

	/*
	  draws all of the card stacks
	  @method Draw
	  @param {CanvasContext} surf The surface to draw to
	*/
	this.Draw = function(surf) {
		for(var s in this.card_stacks) {
			this.card_stacks[s].Draw(surf);
		}
	}


	/**
	  Gets the card containing the point in any stack.
	  @method GetCardContaining
	  @param {Number} x The x-coord in canvas space to check
	  @param {Number} y The y-coord in canvas space to check
	  @return {Card} The Card object which contains the point. If multiple cards
	  contain the point, then the top-most card of the cards containing this point
	  will be returned. Returns null if no cards contain the point.
	*/
	this.GetCardContaining = function(x,y) {
		for(var s in this.card_stacks)
		{
			var stack = this.card_stacks[s];
			if(stack.rect.IsPointWithin(x,y)) {
				var card = stack.GetCardContaining(x,y);
				if(card)
					return card;
			}
		}
		return null;
	}

	/**
	  Gets the stack containing the point in canvas space
	  @method GetStackContaining
	  @param {Number} x The x-coord in canvas space to check
	  @param {Number} y The y-coord in canvas space to check
	  @return {CardStack} The stack which contains the point. null
	  if no stacks contain the point.
	 */
	this.GetStackContaining = function(x,y) {
		for(var s in this.card_stacks)
		{
			var stack = this.card_stacks[s];
			if(stack.rect.IsPointWithin(x,y))
				return stack;
		}
		return null;
	}
}
