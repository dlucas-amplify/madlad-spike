// A couple of madlads
// globals
// var lastFrameTime = Date.now() / 1000;
var skeletonName = 'madlad';
var animName = 'idle';
var madladArr = [];

function createCanvasCharacter(canvasId) {
    let madlad = {};
    const canvas = document.getElementById(canvasId);
    canvas.width = 200;
    canvas.height = 200;
    const context = canvas.getContext('2d');

    const skeletonRenderer = new spine.canvas.SkeletonRenderer(context);
    skeletonRenderer.debugRendering = true;

    const assetManager = new spine.canvas.AssetManager();

    assetManager.loadText(`madlad/${skeletonName}.json`);
    assetManager.loadText(`madlad/${skeletonName}.atlas`);
    assetManager.loadTexture(`madlad/${skeletonName}.png`);
    
    madlad = {canvas, context, skeletonRenderer, assetManager};
    madlad.lastFrameTime = Date.now() / 1000;

    madladArr.push(madlad);

    requestAnimationFrame(function(timestamp) {
        load(madlad);
    });
}

function load(madlad) {
    if (madlad.assetManager.isLoadingComplete()) {
        var data = loadSkeleton(madlad.assetManager, skeletonName, animName, 'default');
        madlad.skeleton = data.skeleton;
        madlad.state = data.state;
        madlad.bounds = data.bounds;
        console.log(madlad);
        requestAnimationFrame(function(timestamp) {
            render(madlad);
        });
    } else {
        requestAnimationFrame(function(timestamp) {
            load(madlad);
        });
    }
}

function loadSkeleton(assetManager, skeletonName, initialAnimation, skin) {
    const atlas = new spine.TextureAtlas(assetManager.get(`madlad/${skeletonName}.atlas`), function(path) {
        return assetManager.get('madlad/' + path);
    });

    // Create a AtlasAttachmentLoader, which is specific to the WebGL backend.
    const atlasLoader = new spine.AtlasAttachmentLoader(atlas);

    // Create a SkeletonJson instance for parsing the .json file.
    const skeletonJson = new spine.SkeletonJson(atlasLoader);

    // Set the scale to apply during parsing, parse the file, and create a new skeleton.
    const skeletonData = skeletonJson.readSkeletonData(assetManager.get('madlad/' + skeletonName + '.json'));
    const skeleton = new spine.Skeleton(skeletonData);
    skeleton.scaleY = -1;
    const bounds = calculateBounds(skeleton);
    skeleton.setSkinByName(skin);

    // Create an AnimationState, and set the initial animation in looping mode.
    const animationState = new spine.AnimationState(new spine.AnimationStateData(skeleton.data));
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

function render (madlad) {
    var now = Date.now() / 1000;
    var delta = now - madlad.lastFrameTime;
    madlad.lastFrameTime = now;

    resize(madlad);

    madlad.context.save();
    madlad.context.setTransform(1, 0, 0, 1, 0, 0);
    madlad.context.fillStyle = "#cccccc";
    madlad.context.fillRect(0, 0, madlad.canvas.width, madlad.canvas.height);
    madlad.context.restore();

    madlad.state.update(delta);
    madlad.state.apply(madlad.skeleton);
    madlad.skeleton.updateWorldTransform();
    madlad.skeletonRenderer.draw(madlad.skeleton);

    requestAnimationFrame(function(timestamp) {
        render(madlad);
    });
}

function resize (madlad) {
    const canvas = madlad.canvas;
    const bounds = madlad.bounds;
    const context = madlad.context;

    var w = canvas.clientWidth;
    var h = canvas.clientHeight;
    if (canvas.width != w || canvas.height != h) {
        canvas.width = w;
        canvas.height = h;
    }

    // magic
    var centerX = bounds.offset.x + bounds.size.x / 2;
    var centerY = bounds.offset.y + bounds.size.y / 2;
    var scaleX = bounds.size.x / canvas.width;
    var scaleY = bounds.size.y / canvas.height;
    var scale = Math.max(scaleX, scaleY) * 1.2;
    if (scale < 1) scale = 1;
    var width = canvas.width * scale;
    var height = canvas.height * scale;

    context.setTransform(1, 0, 0, 1, 0, 0);
    context.scale(1 / scale, 1 / scale);
    context.translate(-centerX, -centerY);
    context.translate(width / 2, height / 2);
}

function init() {
    buildMenu();
    createCanvasCharacter('madlad1');
    createCanvasCharacter('madlad2');
}

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

function setAnimState(name, track){
    madladArr.forEach((madlad) => {
        madlad.state.setAnimation(track, name, false);
        madlad.state.data.defaultMix = 0;
    })
}

(function() {
    init();
})();