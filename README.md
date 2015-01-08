threejs-decals
==============

Dyncamic decals for THREE.js.

Based on the [technique described here](http://blog.wolfire.com/2009/06/how-to-project-decals/)

Note, This implementation doesn't clip the edges of the polygons.

Also, and more importantly, if a triangle in the target geometry is so large that none of the vertices fall within the projection volume, the triangle will not be included in the decal geometry.  For example, if you try to project a tiny decal onto a the side of a giant cube, nothing will happen.

See it in action:
[http://www.youtube.com/watch?v=ckLghsutfmA](http://www.youtube.com/watch?v=ckLghsutfmA)
