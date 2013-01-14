/* Copyright(C) 2013 Nathan Starkey MIT Licensed*/
var dbg = dbg || {};

dbg.cardstr = null;

dbg.CardHoverEventHandler = function (evt,card) {
    if (card) {
        $("div#cardinfo_left").html(formatstr(dbg.cardstr, "hovered", card.toString(),
            card.state.stack.name, card.rect.origin[0], card.rect.origin[1]));
    }
    else {
        $("div#cardinfo_left").html("");
    }
}

$(document).ready(function () {
    dbg.cardstr = $("span#debugcardstr").html();
    $("body").bind("cardhover", dbg.CardHoverEventHandler);
});
