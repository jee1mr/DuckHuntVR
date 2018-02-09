var container, camera, scene, renderer, controls, crosshair, pointLight;
var birds = [];
var score = 0;
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
var mouseClick = false;
var canShoot = 0;
var clock;
var bullets = [];
var gameOver = false;

function init() {
	clock = new THREE.Clock();
	initScene();
	initBackground();
	initLight();
	initBirds();
	crosshair = addCrosshair();
	initRenderer();
	animate();
}

function initScene() {
	renderer = new THREE.WebGLRenderer();
	camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 1, 10000);
	deviceControls = new THREE.DeviceOrientationControls(camera);
	scene = new THREE.Scene();
}

function initBackground() {
	var geometry = new THREE.SphereBufferGeometry(500, 60, 40);
	geometry.scale(-1, 1, 1);
	var material = new THREE.MeshBasicMaterial({
		map: new THREE.TextureLoader().load(window.location.href + 'textures/city.jpg')
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
	window.addEventListener('mousedown', onMouseDown);
	window.addEventListener('mouseup', onMouseUp);
	window.addEventListener('touchstart', onMouseDown);
	window.addEventListener('touchend', onMouseUp);
}

function addCrosshair() {
	var material = new THREE.LineBasicMaterial({ color: 0xFF0000 });

	// crosshair size
	var x = 0.2, y = 0.2;

	var geometry = new THREE.Geometry();

	// crosshair
	geometry.vertices.push(new THREE.Vector3(0, y, 0));
	geometry.vertices.push(new THREE.Vector3(0, -y, 0));
	geometry.vertices.push(new THREE.Vector3(0, 0, 0));
	geometry.vertices.push(new THREE.Vector3(x, 0, 0));    
	geometry.vertices.push(new THREE.Vector3(-x, 0, 0));

	var crosshair = new THREE.Line( geometry, material );

	crosshair.position.set(0, 0, -1);
	camera.add( crosshair );
	scene.add( camera );
	return crosshair;
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
		score = 0;
		gameOver = true;
		window.alert("Congrats! Game over. Play again? ");
		location.reload();
	}
	bird.position.y = 0;
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}

function onMouseDown(event){
	mouseClick = true;
}

function onMouseUp(event){
	mouseClick = false;
}

function fire(event) {
	var bullet = new THREE.Mesh(
		new THREE.SphereGeometry(10,8,8),
		new THREE.MeshBasicMaterial({color:0xFFFFFF00})
	);	

	bullet.position.set(
		crosshair.position.x,
		crosshair.position.y - 0.7,
		crosshair.position.z
	);

	bullet.scale.set(0.1,0.1,0.1)
	
	bullet.velocity = new THREE.Vector3(
		0,
		0,
		-Math.cos(camera.rotation.x)
	);

	bullet.alive = true;
	setTimeout(function(){
		bullet.alive = false;
		camera.remove(bullet);
	}, 1000);
	
	bullets.push(bullet);
	camera.add(bullet);
	canShoot = 10;
}

function checkCollission() {
	mouse.x = 0;
	mouse.y = 0;
	raycaster.setFromCamera(mouse, camera);

	var intersects = raycaster.intersectObjects(birds);

	if (intersects.length > 0) {
		onBirdHit(intersects[0].object);
	}
}

function bulletsMove() {
	for(var index=0; index<bullets.length; index+=1){
		if( bullets[index] === undefined ) continue;
		if( bullets[index].alive == false ){
			bullets.splice(index,1);
			continue;
		}
		
		bullets[index].position.add(bullets[index].velocity);
		// console.log(bullets[index].position);
	}
}

function animate() {
	var time = Date.now() * 0.0005;
	var delta = clock.getDelta();

	window.requestAnimationFrame(animate);
	deviceControls.update();
	birdMove(birds);
	bulletsMove();

	if (mouseClick === true && canShoot <= 0 && !gameOver) {
		console.log("fire!");
		fire();
		checkCollission();
	}
	if(canShoot > 0) canShoot -= 1;

	renderer.render(scene, camera);
}

init();