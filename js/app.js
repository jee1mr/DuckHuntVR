var container, camera, scene, renderer, controls, crosshair, pointLight;
var birds = [];
var score = 0;
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();

function init() {
	initScene();
	initBackground();
	initLight();
	initBirds();
	initRenderer();
	animate();
}

function initScene() {
	renderer = new THREE.WebGLRenderer();
	camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 1, 10000);
	deviceControls = new THREE.DeviceOrientationControls(camera);
	orbitControls = new THREE.OrbitControls(camera);
	scene = new THREE.Scene();
}

function initBackground() {
	var geometry = new THREE.SphereBufferGeometry(500, 60, 40);
	geometry.scale(-1, 1, 1);
	var material = new THREE.MeshBasicMaterial({
		map: new THREE.TextureLoader().load('../textures/city.jpg')
	});
	var mesh = new THREE.Mesh(geometry, material);
	scene.add(mesh);
}

function initLight() {
	pointLight = new THREE.PointLight(0xFFFFFF, 1, 100000);
	pointLight.position.set(50, 50, 50);
	scene.add(pointLight);
}

function initBirds() {
	frontBird = addBird(100, -100, -300);
	backBird = addBird(100, -100, 300);
	rightBird = addBird(200, -100, 0);
	leftBird = addBird(-200, -100, 0);
	birds = [frontBird, backBird, leftBird, rightBird];
}

function initRenderer() {
	renderer = new THREE.WebGLRenderer({
		antialias: true
	});
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);

	container = document.getElementById('container');
	container.appendChild(renderer.domElement);

	window.addEventListener('resize', onWindowResize, false);
	window.addEventListener('mousedown', onMouseDown, false);
}

function addBird(x, y, z) {
	var sphereMaterial = new THREE.MeshLambertMaterial({
		color: 0xFFFFFF
	});
	var sphere = new THREE.Mesh(new THREE.SphereGeometry(30, 16, 16), sphereMaterial);
	sphere.position.set(x, y, z);
	scene.add(sphere);
	return sphere;
}

function birdMove(birds) {
	birds.forEach(function(bird) {
		if (bird.position.y >= 450) {
			bird.position.y = -100;
		}
		bird.position.y += 2;
	});
}

function onBirdHit(bird) {
	console.log("onBirdHit(): bird got hit");
	score++;
	console.log("onBirdHit(): score = ", score);
	document.getElementById("score").innerHTML = score;
	if (score >= 3) {
		window.alert("Congrats! Game over. Play again? ");
		score = 0;
	}
	bird.position.y = 0;
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}

function onMouseDown(event) {
	console.log("onMouseDown(): clicked");
	mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
	mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
	raycaster.setFromCamera(mouse, camera);
	var intersects = raycaster.intersectObjects(birds);

	if (intersects.length > 0) {
		onBirdHit(intersects[0].object);
	}
}

function animate() {
	window.requestAnimationFrame(animate);
	orbitControls.update();
	deviceControls.update();
	birdMove(birds);
	renderer.render(scene, camera);
}

init();