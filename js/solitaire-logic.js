
var sol = sol || {};


sol.update = function() {

}

sol.draw = function(surf) { 
	sol.table.Draw(surf);
	if (sol.state.drag) {
	    var d = sol.state.drag;
	    for (var i = 0; i < d.length; ++i) {
	        d[i].Draw(surf);
	    }
	}
    //draw the mouse coordinates
	surf.fillStyle = "black";
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
			card.Flip();
		}
	}
	else {
		for(var i = 0; i < 3; i++) {
			if(deckc.length == 0) //break if there are no more cards to get out from the deck
			    break;
			var card = deckc[deckc.length - 1];
			card.Flip();
			card = sol.deck_stack.RemoveCardAtIndex(deckc.length - 1);
			sol.discard.AddCardToTop(card);
		}
	}
}



//mouse input handlers
sol.scratch_up = function (evt, stack) {
    if (sol.state.drag) { //attempt to drop on the scratch decks
        var d = sol.state.drag;
        var should_add = false;
        if (stack.cards.length == 0) { //empty stack
            if (d[0].number == 12) { //can only add king to empty stack
                should_add = true;
            }
        }
        else { //non-empty stack
            var s_top = stack.cards[stack.cards.length - 1];
            //make sure the stack's top card has alternating colors with the bottom dragged card
            if (s_top.suit.val <= SUIT.SPADE.val && d[0].suit.val >= SUIT.HEART.val
            || s_top.suit.val > SUIT.SPADE.val && d[0].suit.val < SUIT.HEART.val) {
                if (d[0].number == s_top.number - 1) { //make sure they are decending values
                    should_add = true;
                }
            }
        }
        if (should_add) {
            var is_scratch = d[0].state.stack.name.search("scratch");
            if (is_scratch != -1) {// if it is coming from a scratch stack, then flip the card under it
                var prev_stack = d[0].state.stack;
                if (prev_stack.cards.length > d.length) //make sure to not flip a non-card
                    prev_stack.cards[prev_stack.cards.length - d.length - 1].state.face_up = true;
            }
            for (var i = 0; i < d.length; ++i) {
                stack.AddCardToTop(d[i]);
            }
        }
        sol.StopDrag();
    }
}


sol.scratch_down = function (evt,stack) { //aslo used as score_downfn
    var coord = game.CanvasSpace(evt.pageX, evt.pageY);
    var card = stack.GetCardContaining(coord[0], coord[1]);
    if (card) {
        sol.state.drag = [];
        var index = stack.cards.indexOf(card);
        //if they didn't select the top card, then select all of the cards underneath as well
        for (; index < stack.cards.length; ++index) {
            if(stack.cards[index].state.face_up)
                sol.state.drag.push(stack.cards[index]);
        }
        if (sol.state.drag.length == 0)
            sol.state.drag = null;
    }
}


sol.discard_up = function (evt) {
    if (sol.state.drag) { //can't put anything back in the discard pile
        sol.StopDrag();
    }   
}


sol.discard_down = function(evt) {
	var coord = game.CanvasSpace(evt.pageX,evt.pageY); 
	var card = sol.discard.GetCardContaining(coord[0],coord[1]);
	//if they select the top card
	if (sol.discard.cards.indexOf(card) == sol.discard.cards.length - 1) {
	    sol.state.drag = [card];
	}
}


sol.deck_stack_up = function(evt) {
	sol.DrawThree();
}


sol.score_stack_up = function (evt, stack) {
    if (sol.state.drag) {
        if (sol.state.drag.length != 1) { //can't add more than one card at a time
            sol.StopDrag();
            return;
        }
        
        var should_add = sol.ShouldAddToScoreStack(stack,sol.state.drag[0]);
        if(should_add)
			sol.AddToScoreStack(stack,sol.state.drag[0]);
        sol.StopDrag();
    }
}

sol.AddToScoreStack = function(scorestack,card) {
    var is_scratch = card.state.stack.name.search("scratch");
    if (is_scratch != -1) {// if it is coming from a scratch stack, then flip the card under it
        var prev_stack = card.state.stack;
        if (prev_stack.cards.length > 1) //make sure to not flip a non-card
            prev_stack.cards[prev_stack.cards.length - 2].state.face_up = true;
    }
    scorestack.AddCardToTop(card);
}

sol.ShouldAddToScoreStack = function(scorestack,card) {
    var should_add = false;
	if (card.state.face_up && //it should be face up
		card.IsTopCardInStack() && //it should be the top card
		card.suit.name == scorestack.name) //and it should go to the same suit stack
	{	
		if (card.number == 0 && scorestack.cards.length == 0) //ace on empty
            should_add = true;
		else if (scorestack.cards.length > 0 &&
		card.number == scorestack.cards[scorestack.cards.length - 1].number + 1) //correct on non-empty
            should_add = true;
	}
	return should_add;
}


sol.start = function() {
	game.ResizeCanvas(800,600);
	
	sol.state = {};
	sol.deck = GenCards();
	sol.table = new Table(game.canvasElement);	
	sol.mousepos = [0,0];

	
	var cmid = CardMetrics.middle;
	var cdim = CardMetrics.dim;
    //lay out the stacks
	sol.deck_stack = new CardStack(STACKSPREAD.NONE,1.0);
	sol.table.AddStack(sol.deck_stack,"deck",cmid[0],cmid[1]);
	sol.deck_stack.mouseupfn = sol.deck_stack_up;

	//put everything in to the deck_stack
	for(var s = 0; s < sol.deck.length; ++s) {
		for(var n = 0; n < sol.deck[s].length; ++n) {
			sol.deck_stack.AddCardToTop(sol.deck[s][n]);
			sol.deck[s][n].state.face_up = false;
		}
	}
	

	sol.discard = new CardStack(STACKSPREAD.HORIZONTAL,12);
	var off = [cmid[0] + cdim.w * 2, cmid[1]];
	sol.table.AddStack(sol.discard,"discard",off[0],off[1]);
	sol.discard.SetMaxVisibleCards(3);
	sol.discard.mousedownfn = sol.discard_down;
	sol.discard.mouseupfn = sol.discard_up;

    //now the top 4 scoring stacks
	var stack_spacing = 20; //how far apart they should be in pixels
	sol.clubs = new CardStack(STACKSPREAD.NONE, 1);
    //align to the right side
	off = [game.width - cmid[0], cmid[1]];
	sol.table.AddStack(sol.clubs, SUIT.CLUB.name, off[0], off[1]);
	sol.clubs.mouseupfn = sol.score_stack_up;
	sol.clubs.mousedownfn = sol.scratch_down;
    
	sol.hearts = new CardStack(STACKSPREAD.NONE, 1);
	off[0] -= cdim.w + stack_spacing;
	sol.table.AddStack(sol.hearts, SUIT.HEART.name, off[0], off[1]);
	sol.hearts.mouseupfn = sol.score_stack_up;
	sol.hearts.mousedownfn = sol.scratch_down;

	sol.diamonds = new CardStack(STACKSPREAD.NONE, 1);
	off[0] -= cdim.w + stack_spacing;
	sol.table.AddStack(sol.diamonds, SUIT.DIAMOND.name, off[0], off[1]);
	sol.diamonds.mouseupfn = sol.score_stack_up;
	sol.diamonds.mousedownfn = sol.scratch_down;

	sol.spades = new CardStack(STACKSPREAD.NONE, 1);
	off[0] -= cdim.w + stack_spacing;
	sol.table.AddStack(sol.spades, SUIT.SPADE.name, off[0], off[1]);
	sol.spades.mouseupfn = sol.score_stack_up;
	sol.spades.mousedownfn = sol.scratch_down;


    //now the scratch areas
	off = [cmid[0], cdim.h + stack_spacing + cmid[1]];
	sol.scratch = new Array(7);
	for (var i = 0; i < 8; ++i) {
	    sol.scratch[i] = new CardStack(STACKSPREAD.VERTICAL, 20);
	    sol.table.AddStack(sol.scratch[i], "scratch" + i.toString(), off[0], off[1]);
	    sol.scratch[i].mouseupfn = sol.scratch_up;
	    sol.scratch[i].mousedownfn = sol.scratch_down;
	    off[0] += cdim.w + stack_spacing;
	}

    //deal out the cards
	sol.deck_stack.Shuffle(10);
	var deckcards = sol.deck_stack.cards;
	var scratch = sol.scratch;
	for (var i = 0; i < 8; ++i) {
	    for (var x = 0; x < i; ++x) {
	        var card = sol.deck_stack.RemoveCardAtIndex(deckcards.length - 1);
	        scratch[i].AddCardToTop(card);
	    }
	    var card = sol.deck_stack.RemoveCardAtIndex(deckcards.length - 1);
	    scratch[i].AddCardToTop(card);
	    card.Flip(); //flip the top card
	}

}


sol.StopDrag = function () {
    if (sol.state.drag) {
        var d = sol.state.drag;
        for (var i = 0; i < d.length; ++i){
			d[i].state.stack.AddCardToTop(d[i]);
		}
    }
    sol.state.drag = null;
}



$(document).ready( function() {
	sol.start();
	sol.logic = new GameLogic(sol.update,sol.draw);
	game.SetLogic(sol.logic);

//canvas element
$( "canvas" ).mousedown( function(evt) {
	var coord = game.CanvasSpace(evt.pageX,evt.pageY);
	var stack = sol.table.GetStackContaining(coord[0], coord[1]);
	if (sol.state.drag) //if the mouse lost input for some reason, reset the drag
	    sol.StopDrag();
	if(stack) {
		stack.mousedownfn(evt,stack);
	}
});


$( "canvas" ).mouseup( function(evt) {
	var coord = game.CanvasSpace(evt.pageX,evt.pageY);
	var stack = sol.table.GetStackContaining(coord[0],coord[1]);
	if (stack) {
		stack.rect.Reset();
		if(!sol.state.drag || (sol.state.drag && sol.state.drag[0].state.stack != stack)) {
			return stack.mouseupfn(evt, stack);
		}
	}
	if (sol.state.drag) {
		//special case of missing the bottom card in the stack
		if(sol.state.drag[0].state.stack.cards[0] == sol.state.drag[0]) {
			stack = sol.state.drag[0].state.stack;
			sol.state.drag[0].rect.MoveTo(stack.rect.origin[0],stack.rect.origin[1]);
			sol.state.drag[0].state.stack.SpreadAllCards();
			sol.state.drag = null;
			return;
		}
	    sol.StopDrag();
	}
});


$("canvas").dblclick(function(evt) {
	var coord = game.CanvasSpace(evt.pageX,evt.pageY);
	var card = sol.table.GetCardContaining(coord[0],coord[1]);
	if(card) {
		var sstack = sol.table.card_stacks[card.suit.name];
		if(sstack) {
			var should_add = sol.ShouldAddToScoreStack(sstack,card);
			if(should_add)
				sol.AddToScoreStack(sstack,card);
		}
		else { console.log("No score stack with name " + card.suit.name); }
	}
});


$( "canvas" ).mousemove( function(evt) {
	var coord = game.CanvasSpace(evt.pageX,evt.pageY);
	if(sol.state.drag) 
	{ //we have a card clicked
	    var carray = sol.state.drag;
	    var diff = [coord[0] - carray[0].rect.origin[0], coord[1] - carray[0].rect.origin[1]];
	    
	    for (var i = 0; i < carray.length; ++i) {
	        carray[i].rect.Translate(diff[0], diff[1]);
	    }		
	}
	else 
	{ //we don't have a card clicked, so check for hovering
		if(sol.state.hovering) {
			sol.state.hovering.Hover(false);
			sol.state.hovering = null;
		}
		var card = sol.table.GetCardContaining(coord[0], coord[1]);
		if (card) {
		    card.Hover(true);
		    sol.state.hovering = card;
		}
	}
	sol.mousepos = [coord[0], coord[1]];
});


$("canvas").mouseleave(function (evt) {
    if (sol.state.hovering) {
        sol.state.hovering.Hover(false);
        sol.state.hovering = null;
    }
});

});
