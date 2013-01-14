Gambini's Solitaire and real-time chat server
===

This is my first try at a web application. I had never used Javascript, nor developed in a web browser, nor developed on the server side, and I wrote this in 4 days. I'm not entirely sure of the best practices for any of the previous technologies are, so I hope that I've done them "correctly". It works, and that is all that I was really setting out to do.

It is split in to two main parts:

Solitaire Part
=
It is 3 card draw solitaire, done on an HTML5 canvas element on the top part of the page. Any of the well-documented scripts in the js/ folder are part of my solitaire implementation.

Chat Part
=
A poorly-implemented chat server on the bottom part of the page. You can change your name & color by clicking on it in the middle column at the bottom of the page, and pressing the enter key when you have the username text field focused. This will only work if you are connected to the server.

A (hopefully working) version is available at http://nathanstarkey.info/  


3rd Party Libraries
=
This project uses the following

Sylvester - http://sylvester.jcoglan.com/

ColorPicker - http://www.eyecon.ro/colorpicker/

socket.io-client - https://github.com/LearnBoost/socket.io-client

The following are not located in the repository, but still used

JQuery - http://jquery.com/

JQueryUI - http://jqueryui.com/

Node.js - http://nodejs.org/

socket.io - http://socket.io/

forever - https://github.com/nodejitsu/forever

YUIDoc - http://yui.github.com/yuidoc/
