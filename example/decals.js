var renderer, camera;
var scene, element;
var ambient, point;
var aspectRatio, windowHalf;
var mouse, time;

var controls;
var clock;

var ground, groundGeometry, groundMaterial;
var sphere, torus;

var decalTexture;
var decalTargets = [];
var decalFactory;

function initScene() {
  clock = new THREE.Clock();
  mouse = new THREE.Vector2(0, 0);

  windowHalf = new THREE.Vector2(window.innerWidth / 2, window.innerHeight / 2);
  aspectRatio = window.innerWidth / window.innerHeight;

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(45, aspectRatio, 1, 10000);
  camera.position.z = 512;
  camera.position.y = 250;
  camera.up
  camera.lookAt(scene.position);

  // Initialize the renderer
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMapEnabled = true;
  renderer.shadowMapType = THREE.PCFShadowMap;

  element = document.getElementById('viewport');
  element.appendChild(renderer.domElement);

  controls = new THREE.OrbitControls(camera);

  decalTexture = THREE.ImageUtils.loadTexture("splat.png");

  decalFactory = new THREE.DecalFactory( {
    material: new THREE.MeshPhongMaterial({
      sides: THREE.DoubleSide,
      color: 0xffffff,
      map: decalTexture,
      polygonOffset: true,
      polygonOffsetFactor: -4,
      transparent: true,
      depthWrite: false,
      shininess: 150,
      specular: 0xffffff
    }),
    maxDecals:5 }
  );

  time = Date.now();
}


function initLights(){

  var hemiLight = new THREE.HemisphereLight( 0x4020ff, 0x802020, 0.05);
  scene.add(hemiLight);

  var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.85 );
  directionalLight.position.set( 0.7, 1, 0.4 );
  scene.add( directionalLight );

  ambient = new THREE.AmbientLight(0x001111);
  scene.add(ambient);

  point = new THREE.PointLight( 0xffffff, 1, 0, Math.PI, 1 );
  point.position.set( 150, 150, -28 );

  var point2 = new THREE.PointLight( 0x202080, 1, 0, Math.PI, 1 );
  point2.position.set( -252, 150, -128 );
  scene.add(point2);

}


function initGeometry(){
  groundMaterial = new THREE.MeshBasicMaterial({
    wireframe: true
  });

  torus = new THREE.Mesh(
    new THREE.TorusGeometry(10, 5, 25, 20, Math.PI * 2),
    new THREE.MeshLambertMaterial({
      sides: THREE.FrontSide,
      color: 0xffffff,
    })
  );

  torus.position.set(30, 15, 30);
  torus.name = "torus";
  scene.add(torus);


  sphere = new THREE.Mesh(
    new THREE.SphereGeometry(15, 25, 20),
    new THREE.MeshLambertMaterial({
      sides: THREE.FrontSide,
      color: 0xffffff
    })
  );

  sphere.position.set(-30, 40, -30);
  sphere.name = "sphere";
  scene.add(sphere);


  var ground = new THREE.Mesh(
    new THREE.PlaneGeometry(200, 200, 64, 64),
    new THREE.MeshLambertMaterial({
      map: THREE.ImageUtils.loadTexture("uv_test.jpg")
    })
  );

  ground.rotation.x = -Math.PI/2;
  scene.add(ground);


  decalTargets.push(ground);
  decalTargets.push(sphere);
  decalTargets.push(torus);
}


function init(){
  document.addEventListener('mousedown', onMouseDown, false);
  document.addEventListener('mousemove', onMouseMove, false);

  window.addEventListener('resize', onResize, false);

  initScene();
  initLights();
  initGeometry();
}


function onResize() {
  windowHalf = new THREE.Vector2(window.innerWidth / 2, window.innerHeight / 2);
  aspectRatio = window.innerWidth / window.innerHeight;
  camera.aspect = aspectRatio;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}


function onMouseMove(event) {
  mouse.set( (event.clientX / window.innerWidth - 0.5) * 2, (event.clientY / window.innerHeight - 0.5) * 2);
}


function onMouseDown(event) {

  var mouse = new THREE.Vector3(
      event.clientX / (window.innerWidth * 0.5) - 1.0,
      -1.0 * (event.clientY / (window.innerHeight * 0.5) - 1.0), 0.0);

  var proj = new THREE.Projector();
  var raycaster = proj.pickingRay(mouse, camera);

  var meshList = [];

  var intersects = raycaster.intersectObjects(decalTargets);

  if (intersects.length > 0) {
    var closest = 0;
    var closeDistance = 1000000000000000000;
    for(var i = 0; i < intersects.length; i++){
      if(intersects[i].distance < closeDistance){
        closest = i;
        closeDistance = intersects[i].distance;
      }
    }

    var size = Math.random() * 40 + 2;
    decalFactory.projectOnMesh( intersects[closest].object, intersects[closest].point, raycaster.ray.direction, Math.random() * Math.PI * 2, new THREE.Vector3(size, size, size+5) );
  } else {
    console.log("No intersections.");
  }
}


function animate() {
  requestAnimationFrame(animate);
  render();
}


function render() {
  var delta = clock.getDelta();
  time += delta;

  torus.rotation.y += 1 * delta;

  sphere.rotation.x += 1 * delta;
  sphere.position.y = Math.sin(time) * 8 + 18;

  controls.update();

  decalFactory.update();
  renderer.render(scene, camera);
}


window.onload = function() {
  init();
  animate();
}