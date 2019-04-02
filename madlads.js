// A Single MadLad - on canvas

// globals
var canvases = [];
var lastFrameTime = Date.now() / 1000;
var canvas;
var skeletonRenderer;
var assetManager;
var skeletonName = 'madlad';
var animName = 'idle';
var skeleton, state, bounds, atlas;

function buildMenu(){
    var stateArr = [
        {"name":"property_credible_on","track":4},
        {"name":"property_credible_off","track":4},
        {"name":"property_fact_on","track":2},
        {"name":"property_fact_off","track":2},
        {"name":"property_not_credible_on","track":1},
        {"name":"property_not_credible_off","track":1},
        {"name":"property_not_relevant_on","track":1},
        {"name":"property_not_relevant_off","track":1},
        {"name":"property_opinion_on","track":2},
        {"name":"property_opinion_off","track":2},
        {"name":"property_relevant_on","track":1},
        {"name":"property_relevant_off","track":1},
        {"name":"anim_sml_to_super_on","track":5},
        {"name":"anim_sml_to_super_off","track":5},
        {"name":"property_color_change_on","track":6},
        {"name":"property_color_change_off","track":6}
    ];
    var menu_div = document.getElementById("menu");
    var btnStates = ["on", "off"];

    for (var i = 0; i < stateArr.length; i++){
        var t = i % 2;
        var item = stateArr[i];
        var button = document.createElement("button");
        button.className = "btn_" + t;
        button.track = item.track;
        button.innerHTML = item.name;
        menu_div.appendChild(button);
        button.addEventListener("click", function() {
            setAnimState(this.innerHTML , this.track);
        });
    }
}

function createCanvasCharacter() {
    canvases.forEach((canvasObj) => {
        canvasObj.context = canvasObj.canvas.getContext('2d');

        canvasObj.skeletonRenderer = new spine.canvas.SkeletonRenderer(canvasObj.context);
    
        canvasObj.assetManager = new spine.canvas.AssetManager();
    
        canvasObj.assetManager.loadText(`madlad/${skeletonName}.json`);
        canvasObj.assetManager.loadText(`madlad/${skeletonName}.atlas`);
        canvasObj.assetManager.loadTexture(`madlad/${skeletonName}.png`);
        console.log(canvasObj.assetManager.isLoadingComplete);
        requestAnimationFrame(load.bind(canvasObj));
        // load.bind(canvasObj);
    });

}

function load(co) {
    if (co.assetManager.isLoadingComplete()) {
        console.log('loading complete!');
        var data = loadSkeleton(co, skeletonName, animName, 'default');
        co.skeleton = data.skeleton;
        co.state = data.state;
        co.bounds = data.bounds;
        requestAnimationFrame(render);
    } else {
        requestAnimationFrame(load.bind(co));
    }
}

function loadSkeleton(co, name, initialAnimation, skin) {
    const atlas = new spine.TextureAtlas(co.assetManager.get(`madlad/${name}.atlas`), function(path) {
        return co.assetManager.get('madlad/' + path);
    });

    // Create a AtlasAttachmentLoader, which is specific to the WebGL backend.
    var atlasLoader = new spine.AtlasAttachmentLoader(atlas);

    // Create a SkeletonJson instance for parsing the .json file.
    var skeletonJson = new spine.SkeletonJson(atlasLoader);

    // Set the scale to apply during parsing, parse the file, and create a new skeleton.
    var skeletonData = skeletonJson.readSkeletonData(co.assetManager.get('madlad/' + name + '.json'));
    var skeleton = new spine.Skeleton(skeletonData);
    skeleton.scaleY = -1;
    var bounds = calculateBounds(skeleton);
    skeleton.setSkinByName(skin);

    // Create an AnimationState, and set the initial animation in looping mode.
    var animationState = new spine.AnimationState(new spine.AnimationStateData(skeleton.data));
    animationState.setAnimation(0, initialAnimation, true);
    animationState.addListener({
        event: function(trackIndex, event) {
            // console.log("Event on track " + trackIndex + ": " + JSON.stringify(event));
        },
        complete: function(trackIndex, loopCount) {
            // console.log("Animation on track " + trackIndex + " completed, loop count: " + loopCount);
        },
        start: function(trackIndex) {
            // console.log("Animation on track " + trackIndex + " started");
        },
        end: function(trackIndex) {
            // console.log("Animation on track " + trackIndex + " ended");
        }
    })

    // Pack everything up and return to caller.
    return { skeleton: skeleton, state: animationState, bounds: bounds };
}

function calculateBounds(skeleton) {
    var data = skeleton.data;
    skeleton.setToSetupPose();
    skeleton.updateWorldTransform();
    var offset = new spine.Vector2();
    var size = new spine.Vector2();
    skeleton.getBounds(offset, size, []);
    return { offset: offset, size: size };
}

function render (co) {
    var now = Date.now() / 1000;
    var delta = now - lastFrameTime;
    lastFrameTime = now;

    resize(co);

    co.context.save();
    co.context.setTransform(1, 0, 0, 1, 0, 0);
    co.context.fillStyle = "#cccccc";
    co.context.fillRect(0, 0, co.canvas.width, co.canvas.height);
    co.context.restore();

    co.state.update(delta);
    co.state.apply(skeleton);
    co.skeleton.updateWorldTransform();
    co.skeletonRenderer.draw(skeleton);

    requestAnimationFrame(render);
}

function resize () {
    var w = co.canvas.clientWidth;
    var h = co.canvas.clientHeight;
    if (co.canvas.width != w || co.canvas.height != h) {
        co.canvas.width = w;
        co.canvas.height = h;
    }

    // magic
    var centerX = co.bounds.offset.x + co.bounds.size.x / 2;
    var centerY = co.bounds.offset.y + co.bounds.size.y / 2;
    var scaleX = co.bounds.size.x / co.canvas.width;
    var scaleY = co.bounds.size.y / co.canvas.height;
    var scale = Math.max(scaleX, scaleY) * 1.2;
    if (scale < 1) scale = 1;
    var width = co.canvas.width * scale;
    var height = co.canvas.height * scale;

    co.context.setTransform(1, 0, 0, 1, 0, 0);
    co.context.scale(1 / scale, 1 / scale);
    co.context.translate(-centerX, -centerY);
    co.context.translate(width / 2, height / 2);
}

function generateCharacters(numChars) {
    for (var i = 0; i < numChars; i++) {
        const canvas = document.createElement('canvas');
        const charContainer = document.querySelector('.madlads');
        canvas.width = 200;
        canvas.height = 200;
        canvases.push({canvas});
        charContainer.append(canvas);
        createCanvasCharacter();
    }
}

function init() {
    buildMenu();
    // createCanvasCharacter();
    generateCharacters(16);
}

(function() {
    init();
}());