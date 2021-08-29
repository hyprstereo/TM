(function () {

	class SceneEditor extends Scene {
		constructor() {
			super();
		}

		bind(scene)
	}

	let sceneEditor;
	function setup(scene, renderer) {
		sceneEditor = new SceneEditor();
		const orbiter = new OrbitControls(camera, renderer.domElement);
		orbiter.enableDampening = true;
		sceneEditor.controls = orbiter;
		const transformControls = new TransformControls(camera, renderer.domElement)
		scene.add(transformControls)
		transformControls.addEventListener('mouseDown', function () {
			orbitControls.enabled = false
		})
		transformControls.addEventListener('mouseUp', function () {
			orbitControls.enabled = true
		})

		window.addEventListener('keydown', function (event: KeyboardEvent) {
			switch (event.key) {
				case 'g':
					transformControls.setMode('translate')
					break
				case 'r':
					transformControls.setMode('rotate')
					break
				case 's':
					transformControls.setMode('scale')
					break
			}
		})
	}
})