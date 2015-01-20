FrozenWar
=========

A turn based strategy game based on Equestria's founding story.

It's still in prototyping stage.
It's made with node.js currently, but it'll be ported to C++ or Java eventually.

How to run
----------

The server is made with node.js, so you'll need node.js to run the server.
For the client, I recommend Chrome though but Firefox does work. I didn't test
the game from IE.

To run the server, you need to install dependency packages first.
```
$ npm install
```
will do that.
After that, you can simply type
```
$ node index.js
```
to start the server. 
If you need to set the port, edit index.js yourself currently. (Default 8000).

To connect to the server, simply type server's URL on supported web browser.

Replay
------

Both server and client can save the replay file.
You can download replay file by clicking 'Save replay file' in the right bottom
of context menu, or it'll automatically generate replay file when game session
ends.
Server will automatically save replay file into logs/ directory.

To watch the replay file, You need to go to /replay.html of the server.
Select replay file, then it'll start playing replay file.
