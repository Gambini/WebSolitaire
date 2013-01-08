
var sol = sol || {};


sol.update = function() {

}

sol.draw = function(surf) { 
	sol.table.Draw(surf);
	if(sol.mouse) 
		sol.mouse.card.Draw(surf);
	//draw the mouse coordinates
	surf.textAlign = "right";
	surf.textBaseline = "bottom";
	surf.fillText(sol.mousepos.toString(),game.width,game.height);
	if(sol.state.hovering) {
		surf.textAlign = "left";
		surf.fillText(sol.state.hovering.toString(),0,game.height);
	}
	
}


//not as in render 3, but as in remove 3 from the deck and put it
//in the discard stack
sol.DrawThree = function() {
	var deckc = sol.deck_stack.cards;
	var disc = sol.discard.cards;
	if(deckc.length == 0) { //put everything back in the deck stack
		while(disc.length != 0) {
			var card = sol.discard.RemoveCardAtIndex(disc.length-1);
			sol.deck_stack.AddCardToTop(card);
			//card.Flip();
		}
	}
	else {
		for(var i = 0; i < 3; i++) {
			if(deckc.length == 0) //break if there are no more cards to get out from the deck
				break;
			var card = sol.deck_stack.RemoveCardAtIndex(deckc.length-1);
			sol.discard.AddCardToTop(card);
			//card.Flip();
		}
	}
}

//mouse input handlers
sol.default_up = function(evt) {
}
sol.default_down = function(evt) {
}
sol.discard_up = function(evt) {
}
sol.discard_down = function(evt) {
	var coord = game.CanvasSpace(evt.pageX,evt.pageY); 
	var card = sol.discard.GetCardContaining(coord[0],coord[1]);
	//if they select the top card
	if(sol.discard.cards.indexOf(card) == sol.discard.cards.length - 1) {
	}
}
sol.deck_stack_up = function(evt) {
	sol.DrawThree();
}
//don't think I need this
sol.deck_stack_down = function(evt) {
}


sol.start = function() {
	game.ResizeCanvas(800,600);
	
	sol.state = {};
	sol.deck = GenCards();
	sol.table = new Table(game.canvasElement);	
	sol.mousepos = [0,0];

	//lay out the stacks
	var cmid = CardMetrics.middle;

	sol.deck_stack = new CardStack(STACKSPREAD.NONE,1.0);
	sol.table.AddStack(sol.deck_stack,"deck",cmid[0],cmid[1]);
	sol.deck_stack.mousedownfn = sol.deck_stack_down;
	sol.deck_stack.mouseupfn = sol.deck_stack_up;

	//put everything in to the deck_stack
	for(var s = 0; s < sol.deck.length; ++s) {
		for(var n = 0; n < sol.deck[s].length; ++n) {
			sol.deck_stack.AddCardToTop(sol.deck[s][n]);
			//sol.deck[s][n].state.face_up = false;
		}
	}

	sol.discard = new CardStack(STACKSPREAD.HORIZONTAL,12);
	var off = [cmid[0] + CardMetrics.dim.w * 2, cmid[1]];
	sol.table.AddStack(sol.discard,"discard",off[0],off[1]);
	sol.discard.SetMaxVisibleCards(3);
	sol.discard.mousedownfn = sol.discard_down;
	sol.discard.mouseupfn = sol.discard_up;
}

$(document).ready( function() {
	sol.start();
	sol.logic = new GameLogic(sol.update,sol.draw);
	game.SetLogic(sol.logic);

//canvas element
$( "canvas" ).mousedown( function(evt) {
	var coord = game.CanvasSpace(evt.pageX,evt.pageY);
	var stack = sol.table.GetStackContaining(coord[0],coord[1]);
	if(stack) {
		stack.mousedownfn(evt);
	}
});


$( "canvas" ).mouseup( function(evt) {
	var coord = game.CanvasSpace(evt.pageX,evt.pageY);
	var s = sol.table.GetStackContaining(coord[0],coord[1]);
	if(s) {
		s.mouseupfn(evt);
	}
});


$( "canvas" ).mousemove( function(evt) {
	var coord = game.CanvasSpace(evt.pageX,evt.pageY);
	sol.mousepos = [coord[0],coord[1]];
	if(sol.mouse) 
	{ //we have a card clicked
		var diff = [mouse.coords[0] - coord[0], mouse.coords[1] - coord[1]];
		sol.mouse.card.rect.Translate(diff[0],diff[1]);
	}
	else 
	{ //we don't have a card clicked, so check for hovering
		var card = sol.table.GetCardContaining(coord[0],coord[1]);
		if(card) 
		{
			card.Hover(true);
			sol.state.hovering = card;
		}
		else 
		{
			if(sol.state.hovering) {
				sol.state.hovering.Hover(false);
				sol.state.hovering = null;
			}
		}
	}
});

});
