# Phosphor3D
Experimenting with writing 80's era 3D rendering code but in Javascript and with HTML5 Canvas acting as display buffer.

<p align="center">
<img width=800 src="https://github.com/EngineersNeedArt/Phosphor3D/blob/ad086708bc0d0eac654d26d8392c3311501a2609/images/screenshot.png" alt="Phosphor3D test screenshot.">
  <br>
You can try it out, such as it is, <a href="https://engineersneedart.com/Phosphor3DTest/" target="_blank">here</a>. The arrow keys let you "drive" it. It's janky, if you drive it. If you want to reset it's location just refresh the page.
</p>

### What

When I was younger I picked up Radtke & Lampton's "Build Your Own Flight Sim in C++" — a book that walks the reader through creating a flight simulator from scratch. There are nearly no libraries used in the book. As an example, they even present how to write an implementation of Bresenham's algorithm for rasterizing a line to a pixel buffer. I had a Mac and not a PC so I had to make adjustments. I also did not know C++ so had to refactor the code to straight C. It was a fun project. I took a Calculus III college course not long after and all the work I had done with matrices, cross and dot products for the flight simulator paid off in spades and helped me ace the class.

I wanted something fun again to work on so decided to make a kind of hybrid for the modern era. In this case write the code instead in Javascript and leverage the Canvas in HTML5 for my buffer.

In fact though I did not re-implement Bresenham's algorithm because I wanted the performance, clipping for free, etc. that I could get using Canvas's built in line drawing calls (but in fact you can get byte-level access to the Canvas buffer if you really want to write that error-accumulating code). All the matrix manipulation, backface culling and depth sorting are written in Javascript, I only skipped out on implementing the final rasterization in code.

To be sure I could have skipped this exercise entirely and used an existing 3D library like Three.js. I don't doubt it's more performant still. But besides robbing me of the (re)learning process of 3D transformations, projecting to 2D, etc., I really wanted the old-school look. (And maybe I could contort Three.js to deliver on that as well, but there's still the learning part.)

### Results

There's still something "not right" about the code. It turned out that the projection to 2D presented in Radtke & Lampton's book was pretty crude, causing significant distortion to any object not dead-center. Maybe a little too 80's for me. So with the help of our always-happy-to-please AI I was able to piece together projection code using a proper perspective matrix. But as I say, there are still issues I can't quite nail down.

There is still some distortion that looks unnatural. Maybe a wide-angle FOV kind of fish-eye distortion? I didn't think my FOV was too wide, but perhaps it is still.

There is no clipping when the camera enters an object (or indeed gets close at all). And objects behind the camera are rendered as well (upside down). So additional clipping, culling is still required.

Still some depth sorting issues. Some of the treads on the sandcrawler, as an example, do not display in the correct order. They may be correct with regard to the depth sorting algorithm, just not correct according to reality. Likely I have to adjust the model itself to resolve these — break the treads down into smaller polygons perhaps. Or maybe the depth of the faces is being calculated incorrectly.

For what it's worth though, I did add a fun feature when I ran into similar depth-sorting issue with the windows and rectangular hatch on the side of the sandcrawler. In order to fix some depth-sorting issues where sometimes the surface the windows or hatch were "on" would draw last, covering them up, I introduced the notion of "sub-faces". I declare the window polygons, hatch polygons as "sub faces" of the larger polygons they're a part of. The subfaces are not depth-sorted and instead drawn immediately after their "parent" faces are rendered. This guarantees they are always drawn last and on top of the larger surface.


### Future

I think this is a hilarious idea: "Crawlerzone", a reimplementation of "Battlezone" from 1980, but with sandcrawlers.
