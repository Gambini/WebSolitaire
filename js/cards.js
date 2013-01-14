/* Copyright(C) 2013 Nathan Starkey MIT Licensed*/
/**
  @module Cards
*/

/**
  A kind of enum representing a card suit.
  @class SUIT
  @static
*/
var SUIT = {
	/**  
		 @property CLUB
		 @type Object 
	*/
	CLUB : {val: 0, name: "Clubs"},
	/** 
		@property SPADE
		@type Object
	*/
	SPADE: {val: 1, name: "Spades"},
	/**
	   @property HEART
	   @type Object
	*/
	HEART: {val: 2, name: "Hearts"},
	/** 
		@property DIAMOND
		@type Object
	*/
	DIAMOND: {val: 3, name: "Diamonds"}
};

var cardimgdim = {w:950,h:392};

var card_img = new Image();
card_img.src = "images/card_set.png";

var card_back = new Image();
card_back.src = "images/red_back.png";

/**
@class Card
@constructor
@param {int} suit from SUIT.?.val
@param {int} number range from 0-12 where 0 is ace and 12 is king
@param {int} tx texture coordinate left
@param {int} ty texture coordinate top
@param {int} tw single card texture width
@param {int} th single card texture height
*/
function Card(suit,number,tx,ty,tw,th) {
	var s;
	switch(suit)
	{
	case 0: s = SUIT.CLUB;break;
	case 1: s = SUIT.SPADE;break;
	case 2: s = SUIT.HEART;break;
	case 3: s = SUIT.DIAMOND;break;
	}
	/**
	  The suit for this card
	  @property suit
	  @type SUIT
	 */
	this.suit = s;
	/**
	  The number from 0-12 where 0 == ace and 12 == king
	  @property number
	  @type int
	 */
	this.number = number;
	/**
	  The texture coordinates. x=left,y=top,w=width,h=height
	  @property tex
	  @type Object
	 */
	this.tex = { x:tx,y:ty,w:tw,h:th };
	/**
	  The rectangle that contains this card
	  @property rect
	  @type Rectangle
	 */
	this.rect = new Rectangle((tw / 2),(th / 2),tw,th);	
	/**
	  The state of the card
	  @class state
	  @for Card
	 */
	this.state = {
		/**
		  If it is face_up == true then the side of the card that displays
		  the number will be drawn in the Card.Draw function
		  @property face_up
		  @type Boolean
		 */
		face_up: true,
		/**
		  If hovered, an outline will be drawn around the card.
		  @protected
		  @property hovered
		  @type Boolean
		 */
		hovered: false,
		/**
		  The stack that this card belongs to
		  @property stack
		  @type CardStack|null
		  @for Card
		 */
		stack: null //the card stack it is in
	}

	/**
	  Draws the card to the surf based on its state
	  @method Draw
	  @param {CanvasContext} surf The canvas context to draw to
	 */
	this.Draw = function (surf) {
		if (this.state.hovered) {
			var v = this.rect.GetTransformedVerts();
			surf.beginPath();
			surf.moveTo(v[0] - 1, v[1] - 1); //topleft
			surf.lineTo(v[2] + 1, v[1] - 1);//topright
			surf.lineTo(v[2] + 1, v[3] + 1);//botright
			surf.lineTo(v[0] - 1, v[3] + 1); //botleft
			surf.closePath();
			surf.stroke();
		}
		if (this.state.face_up) { //draw front
			var p = this.rect.GetTransformedVerts();
			surf.drawImage(card_img,
				this.tex.x, this.tex.y, this.tex.w, this.tex.h, 	//source
				p[0], p[1], this.tex.w, this.tex.h); //destination
		}
		else { //draw back
			var p = this.rect.GetTransformedVerts();
			surf.drawImage(card_back,
				p[0], p[1], this.tex.w, this.tex.h); //destination
		}
	}

	

	/**
	  Sets state.hovered. Will draw an outline around the card if true. Will
	  also trigger the cardhover event, sending this as an argument if is_hovered is true
	  @method Hover
	  @param {Boolean} is_hovered What to set state.hovered to
	 */
	this.Hover = function(is_hovered) {
		this.state.hovered = is_hovered;
		if (is_hovered)
			$("body").trigger("cardhover", this);
		else
			$("body").trigger("cardhover", null);
	}

	
	/**
	  Switches between face-up and face-down
	  @method Flip
	 */
	this.Flip = function() {
		this.state.face_up = !this.state.face_up;
	}

	/**
	   Returns wether the card is the top card in the stack.
	   @method IsTopCardInStack
	   @return {Boolean} true if it is the top card of this.state.stack
	 */
	this.IsTopCardInStack = function() {
		if(this.state.stack) {
			var ret = this.state.stack.cards[this.state.stack.cards.length - 1] == this;
			return ret;
		}
		return false;
	}

	/**
	   Returns a string representation of the card
	   @method toString
	   @return {String} "number of suit"
	 */
	this.toString = function() { 
		var ret = "";
		if (this.number == 0)
			ret = ret.concat("Ace");
		else if(this.number < 10) 
			ret = ret.concat((this.number + 1).toString());
		else if(this.number == 10)
			ret = ret.concat("Jack");
		else if(this.number == 11)
			ret = ret.concat("Queen");
		else if(this.number == 12)
			ret = ret.concat("King");
		ret = ret.concat(" of ").concat(this.suit.name);
		return ret;			
	}

	/**
		Different than toSring because it will return a JSON string
		@method stringify
		@return JSON.stringify on this object
	*/
	this.stringify = function () {
		var seen = [];
		return JSON.stringify(this, function (key, val) {
			if (typeof val == "object") {
				if (seen.indexOf(val) >= 0)
					return undefined;
				seen.push(val);
			}
			return val;
		});
	}


	/**
	  Compares this card with othercard by suit and number
	  @method eq
	  @param {Card} othercard The other card to be compared to
	  @return {Boolean} true if this and othercard have the same suit and number
	*/
	this.eq = function(othercard) {
		return this.number == othercard.number && this.suit.val == othercard.suit.val;
	}

	/*
	  Compares this card with othercard by suit and number
	  @method greater
	  @param {Card} othercard The other card to be compared to
	  @return {Boolean} true if this suit >= othercard suit and this number > other number
	   where suit order from lowest to highest is clubs,spades,hearts,diamonds
	 */
	this.greater = function(othercard) {
		return this.suit.val >= othercard.suit.val && this.number > othercard.number;
	}
	/**
	  Compares this card with othercard by suit and number
	  @method greater
	  @param {Card} othercard The other card to be compared to
	  @return {Boolean} true if this suit <= othercard suit and this number < other number
	   where suit order from lowest to highest is clubs,spades,hearts,diamonds
	 */
	this.less = function(othercard) { 
		return this.suit.val <= othercard.suit.val && this.number < othercard.number; 
	}
}


/**
  @class STACKSPREAD
  @static
*/
var STACKSPREAD = {
	/**
	  Stacked directly on top of each other (only one card is visible)
	  @property NONE
	  @type Object
	 */
	NONE: {val: 0, name: "none" },
	/**
	  Stacked horizontally with "amount" of pixels of offset
	  from the card below. Positive would go right, negative left.
	  @property HORIZONTAL
	  @type Object
	*/
	HORIZONTAL: {val: 1, name: "horizontal" },
	/**
	  Stacked vertically with the "amount" of pixels offset
	  from the card below. Positive would go up, negative down.
	  @property VERTICAL
	  @type Object
	*/
	VERTICAL: {val: 2, name: "vertical" },
	/**
	  In a semi-circle type of stack as if you are holding it in your hand.
	  Not sure how to do that yet.
	  @property FAN
	  @type Object
	 */
	FAN: {val: 3, name: "fan" }
};



/**
  @class CardStack
  @constructor
  @param {STACKSPREAD} stackspread The spread type for this stack
  @param {Number} spread_amount The amound of spread to use (only useful for certain spreads)
*/
function CardStack(stackspread,spread_amount)
{
	/**
	  The collection of cards in this stack. Will draw all of them in the Draw method
	  @property cards
	  @type Array
	 */
	this.cards = new Array();
	/**
	  The rectangle completely enclosing this stack of cards. Used mostly for collision.
	  @property rect
	  @type Rectangle
	 */
	this.rect = new Rectangle(0,0,CardMetrics.dim.w,CardMetrics.dim.h);
	/**
	  The spread type for this stack
	  @property spread
	  @type STACKSPREAD
	 */
	this.spread = stackspread;
	/**
	  The spread amount. Only useful for certain spread types
	  @property amount
	  @type Number
	  @default 1.0
	 */
	this.amount = spread_amount || 1.0;
	/**
	  The name of this stack. Stacks are stored by name in Table
	  @property name
	  @type String
	  @default "unknown"
	 */
	this.name = "unknown";
	/**
	  If only the top few cards should be shown in the stack, set this
	  to the number that should be shown. No option to only show the
	  bottom few at the moment.
	  @property max_visible
	  @type Number|null
	  @default null
	 */
	this.max_visible = null; //draws all by default
	/**
	  Optional hook for a mouse down event on this stack.
	  The user is expected to handle mouse events and decide when to
	  call this function.
	  @property mousedownfn
	  @type function(evt,stack)
	  @default empty function
	 */
	this.mousedownfn = function(evt,stack){};
	/**
	  Optional hook for a mouse up event on this stack.
	  The user is expected to handle mouse events and decide when to
	  call this function.
	  @property mousedownfn
	  @type function(evt,stack)
	  @default empty function
	 */
	this.mouseupfn = function(evt,stack){};

	/**
	  Draws all of the cards in the cards array to the surf
	  @method Draw
	  @param {CanvasContext} surf The context to draw to
	 */
	this.Draw = function (surf) {
		if (this.cards.length == 0) {
			surf.fillStyle = "black";
			surf.textAlign = "center";
			surf.fillText(this.name, this.rect.origin[0], this.rect.origin[1])
			var v = this.rect.GetTransformedVerts();
			surf.beginPath();
			surf.moveTo(v[0] - 1, v[1] - 1); //topleft
			surf.lineTo(v[2] + 1, v[1] - 1);//topright
			surf.lineTo(v[2] + 1, v[3] + 1);//botright
			surf.lineTo(v[0] - 1, v[3] + 1); //botleft
			surf.closePath();
			surf.stroke();
		}
		else {
			for (var i = 0; i < this.cards.length; ++i) {
				this.cards[i].Draw(surf);
			}
		}
	}


	/**
	  Checks if any card's rect encloses x,y (canvas space)
	  @method GetCardContaining
	  @param {Number} x Canvas-space x coordinate
	  @param {Number} y Canvas-space y coordinate
	 */
	this.GetCardContaining = function(x,y) {
		//go from the top-down
		for(var i = this.cards.length - 1; i >= 0; --i)
		{
			if(this.cards[i].rect.IsPointWithin(x,y)) {
				return this.cards[i];
			}
		}
		return null;
	}

	/**
	  Sets the max_visible property to mvis
	  @method SetMaxVisibleCards
	  @param {Number} mvis How many of the cards from the top to show
	 */
	this.SetMaxVisibleCards = function(mvis) {
		this.max_visible = mvis;
		this.SpreadAllCards();
	}

	/**
	  Removes the card at the index in this.cards array
	  @method RemoveCardAtIndex
	  @param {Number} index the index to remove
	  @return {Card} returns the card that was removed
	 */
	this.RemoveCardAtIndex = function(index) {
		//if we are removing the bottom card, then move the other cards down
		if(index == 0)
		{
			if(this.cards.length > 1) {
				this.cards[1].rect.transform = this.cards[0].rect.transform.dup();
			}
		}
		this.cards[index].state.stack = null;
		var ret = this.cards.splice(index,1);
		this.SpreadAllCards();
		this.CalculateBoundingRect();
		return ret[0];
	}


	/**
	  Removes the card from the cards array.
	  @method RemoveCard
	  @param {Card} card
	 */
	this.RemoveCard = function(card) {
		var i = this.cards.indexOf(card);
		if(i != -1)
			this.RemoveCardAtIndex(i);
		else
			console.log("Could not remove card");
	}


	/**
	  Adds the card to the top of the cards array and spreads the card
	  @method AddCardToTop
	  @param {Card} newcard The card to add
	 */
	this.AddCardToTop = function(newcard) {
		if(this.cards.length == 0) {
			this.AddCardToBottom(newcard);
			return;
		}
		var prev = this.cards[this.cards.length - 1];
		if(prev == newcard) {
			if(this.cards.length > 1) {
				prev = this.cards[this.cards.length - 2];
			}
			else {
				newcard.rect.MoveTo(this.rect.origin[0],this.rect.origin[1]);
				return;
			}
		}
		newcard.rect.transform = prev.rect.transform.dup();
		this.cards.push(newcard);
		if(newcard.state.stack) 	
			newcard.state.stack.RemoveCard(newcard);
		newcard.state.stack = this;
		if(this.max_visible)
			this.SpreadAllCards();//have to re-do them all
		else
			this.SpreadCard(newcard);
		this.CalculateBoundingRect();
	}


	/**
	  Adds the card to the cards array after (on top of) another card, then
	  spreads all of the cards.
	  @method AddCardAfter
	  @param {Card} newcard The card to be added
	  @param {Card} othercard The card that newcard will be placed on top of
	 */
	this.AddCardAfter = function(newcard,othercard) {
		var i = this.cards.indexOf(othercard);
		//if it found the top card or no card at all
		if(i == this.cards.length - 1 || i == -1) {
			this.AddCardToTop(newcard);
			return;
		}
		if(newcard.state.stack)
			newcard.state.stack.RemoveCard(newcard);
		this.cards.splice(i,0,newcard);
		this.SpreadAllCards();
		newcard.state.stack = this;
		this.CalculateBoundingRect();
	}


	/**
	  Adds the card to the bottom of the stack then spreads all of the cards.
	  @method AddCardToBottom
	  @param {Card} newcard The card to add to the bottom
	 */
	this.AddCardToBottom = function(newcard) {
		if(this.cards.length == 0) //if it is the first card in the stack
		{
			newcard.rect.Reset();
			newcard.rect.MoveTo(this.rect.origin[0],this.rect.origin[1]);
		}
		else
		{
			newcard.rect.transform = this.cards[0].rect.transform.dup();
		}
		if(newcard.state.stack)
			newcard.state.stack.RemoveCard(newcard);
		this.cards.splice(0,0,newcard);
		this.SpreadAllCards();
		newcard.state.stack = this;
		this.CalculateBoundingRect();
	}



	/**
	  Spreads a single card based on its current location.
	  Card should be on top of the previous card in the array
	  before being passed to this function.
	  @method SpreadCard
	  @param {Card} card The card to spread
	  @//return {Array} The new origin of the card
	*/
	this.SpreadCard = function (card) {
		switch(this.spread.val)
		{
		case 0: break;
		case 1: //horizontal
			card.rect.Translate(this.amount, 0);
			break;
		//return card.origin;
		case 2: //vertical
			card.rect.Translate(0, this.amount);
			break;
		//return card.origin;
		case 3: //fan
		//find out how far from the middle it is
		//middle = 0 rotation, outsides = calculate arc
		return card.origin;
		}
	}


	/**
	  Goes through every card in the array and spreads it.
	  This should be called when you have moved a card to a non-top position.
	  It requires this.cards[0] to be in the correct place.
	  @method SpreadAllCards
	*/
	this.SpreadAllCards = function() {
		//x is the index where it starts. Anything before x has the same transform.
		var x = this.max_visible ? this.cards.length - this.max_visible : 0;
		x = x < 0 ? 0 : x;
		var prev_card = this.cards[0];
		for(var i = 1; i < this.cards.length; ++i)
		{
			var c = this.cards[i];
			//move it to the position of the previous card
			c.rect.transform = prev_card.rect.transform.dup();
			if(i > x) {
				this.SpreadCard(c); //spread it from there
			}
			prev_card = c;
		}
	}



	/**
	  re-calculates this.rect
	  @method CalculateBoundingRect
	*/
	this.CalculateBoundingRect = function() {
		if(this.cards.length == 0) {
			this.rect.Reset();
			return;
		}
		if (this.spread.val == STACKSPREAD.NONE.val) { //it is the size of one card
			this.rect = new Rectangle(this.rect.origin[0], this.rect.origin[1],
				CardMetrics.dim.w, CardMetrics.dim.h);
			return;
		}
		var c = this.cards;
		var minx = Number.MAX_VALUE, maxx = Number.MIN_VALUE;
		var miny = Number.MAX_VALUE, maxy = Number.MIN_VALUE;
		var i = this.max_visible ? this.cards.length - 1 - this.max_visible : 0;
		i = i < 0 ? 0 : i;
		for(; i < c.length; ++i)
		{
			var v = c[i].rect.GetTransformedVerts();
			if(v[0] < minx) minx = v[0];
			if(v[2] > maxx) maxx = v[2];
			if(v[1] < miny) miny = v[1];
			if(v[3] > maxy) maxy = v[3];
		}
		var width = maxx - minx;
		var height = maxy - miny;
		this.rect = new Rectangle(minx + width / 2,miny + height / 2,width,height);
	}


	/**
		Shuffles the stack, and re-spreads
		@method Shuffle
		@param reps How many times to shuffle the deck
	*/
	this.Shuffle = function (reps) {
		var cards = this.cards;
		for (var i = 0; i < reps; ++i) {
			for (var x = 0; x < cards.length; ++x) {
				var rand = Math.floor(Math.random() * cards.length - 1);
				if (x == rand || rand < 0 || rand >= cards.length - 1)
					continue;
				var temp = cards[x];
				cards[x] = cards[rand];
				cards[rand] = temp;
			}
		}
		if (cards.length > 0) {
			cards[0].rect.Reset();
			cards[0].rect.MoveTo(this.rect.origin[0], this.rect.origin[1]);
			this.SpreadAllCards();
			this.CalculateBoundingRect();
		}
	}
	
}

/**
  Describes the general proportion of a single card. It should be
  shared by all cards, assuming all cards have the same width and height
  @class CardMetrics
  @static
*/
var CardMetrics = {
	/**
	  The middle of a card (w/2,h/2) 
	  @property middle
	  @type Array
	 */
	middle: [0,0],
	/**
	  The width and height of a card. Has w and h components
	  @property dim
	  @type Object
	 */
	dim: {w:0,h:0}
};

/**
  Not actually a class, but YUI does not really document non-class functions.
  It returns a two-dimensional array of all of the cards in a 52 card deck, where
  the first dimension is the suit number from SUIT.val and the second dimension is
  the number 0 - 12 where 0 is ace and 12 is king.
  @class GenCards
  @static
*/
function GenCards(){
	//the width and height of a single card,
	//or how much to advance during each loop
	var advx = cardimgdim.w / 13;
	var advy = cardimgdim.h / 4;
	CardMetrics.middle = [advx / 2, advy/ 2];
	CardMetrics.dim = {w:advx,h:advy};

	var suits = new Array();
	var offsety = 0;
	for (var s = 0; s < 4; s++) 
	{
		suits[s] = new Array()
		var offsetx = 0;
		for(var n = 0; n < 13; n++) 
		{ 
			suits[s][n] = new Card(s,n,offsetx,offsety,advx,advy)
			offsetx = offsetx + advx;
		}
		offsety = offsety + advy;
	}
	return suits;
}
