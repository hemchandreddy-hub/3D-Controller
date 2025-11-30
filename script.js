let scene, camera, renderer, character, controls, mixer;
const speed = 0.1;
const clock = new THREE.Clock();

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x333344);

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 2, 5);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  document.getElementById("scene-container").appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, 0.8));

  const d = new THREE.DirectionalLight(0xffffff, 0.6);
  d.position.set(5, 10, 7);
  d.castShadow = true;
  scene.add(d);

  const g = new THREE.PlaneGeometry(30, 30);
  const m = new THREE.MeshPhongMaterial({ color: 0x2e8b57, side: THREE.DoubleSide });
  const ground = new THREE.Mesh(g, m);
  ground.rotation.x = Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  if (THREE.OrbitControls) {
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
  }

  loadCharacter();
}

function loadCharacter() {
  const loader = new THREE.GLTFLoader();
  loader.load(
    "https://threejs.org/examples/models/gltf/RobotExpressive/RobotExpressive.glb",
    (gltf) => {
      character = gltf.scene;
      character.scale.set(0.8, 0.8, 0.8);
      character.position.y = 0;

      character.traverse((obj) => {
        if (obj.isMesh) {
          obj.castShadow = true;
          obj.receiveShadow = true;
        }
      });

      scene.add(character);

      if (gltf.animations && gltf.animations.length > 0) {
        mixer = new THREE.AnimationMixer(character);
        const action = mixer.clipAction(gltf.animations[0]);
        action.play();
      }

      document.getElementById('lo').style.display = 'none';
      document.getElementById('c').style.display = 'flex';
    },
    undefined,
    () => {
      document.getElementById('lo').textContent = 'Error loading character!';
    }
  );
}

window.moveCharacter = function (dx, dy, dz) {
  if (!character) return;

  character.position.x += dx * speed;
  character.position.y += dy * speed;
  character.position.z += dz * speed;

  if (character.position.y < 0) character.position.y = 0;

  if (dx !== 0 || dz !== 0) {
    character.rotation.y = Math.atan2(dx, dz);
  }
};

function animate() {
  requestAnimationFrame(animate);

  const dt = clock.getDelta();
  if (mixer) mixer.update(dt);

  if (controls && character) {
    controls.target.copy(character.position);
    controls.update();
  }

  renderer.render(scene, camera);
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function start() {
  init();
  animate();
  window.addEventListener("resize", onResize);
}

window.onload = start;



