// A Single MadLad - on canvas

// globals
var lastFrameTime = Date.now() / 1000;
var canvas, context;
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

function createCharacter(index) {
    var div = document.createElement("div");
    div.className = "spine_widget";
    
    var id_str = "my-widget-" + index;
    div.id = id_str;
    document.getElementById("main").appendChild(div);
    
    var mad_lad = new spine.SpineWidget(id_str, {
        json: "https://s3-us-west-2.amazonaws.com/s.cdpn.io/435216/madlad.json",
        atlas: "https://s3-us-west-2.amazonaws.com/s.cdpn.io/435216/madlad_half.atlas",
        animation: "idle",
        backgroundColor: "#00000000",
        success: function(widget) {
            var animIndex = 0;
            // setTimeout(function() {
            //     createCharacter(widget);
            // }, 10);
            madlad = widget;
            // madlad.state.data.defaultMix = 0.25; //wondering if this is too general a way to do this
            //ie, should we just be setting the mix per setAnimation calls -cm
        }
    });

    var mad_lad = new spine.Spine
    
    madladArr.push(mad_lad);
    return mad_lad;
    
}

function createCanvasCharacter() {
    canvas = document.getElementById('madlad');
    // canvas.width = window.innerWidth;
    // canvas.height = window.innerHeight;
    canvas.width = 200;
    canvas.height = 200;
    context = canvas.getContext('2d');

    skeletonRenderer = new spine.canvas.SkeletonRenderer(context);

    assetManager = new spine.canvas.AssetManager();

    assetManager.loadText(`madlad/${skeletonName}.json`);
    assetManager.loadText(`madlad/${skeletonName}.atlas`);
    assetManager.loadTexture(`madlad/${skeletonName}.png`);

    requestAnimationFrame(load);
}

function load() {
    if (assetManager.isLoadingComplete()) {
        console.log('loading complete!');
        var data = loadSkeleton(skeletonName, animName, 'default');
        skeleton = data.skeleton;
        state = data.state;
        bounds = data.bounds;
        requestAnimationFrame(render);
    } else {
        requestAnimationFrame(load);
    }
}

function loadSkeleton(name, initialAnimation, skin) {
    atlas = new spine.TextureAtlas(assetManager.get(`madlad/${name}.atlas`), function(path) {
        return assetManager.get('madlad/' + path);
    });

    // Create a AtlasAttachmentLoader, which is specific to the WebGL backend.
    var atlasLoader = new spine.AtlasAttachmentLoader(atlas);

    // Create a SkeletonJson instance for parsing the .json file.
    var skeletonJson = new spine.SkeletonJson(atlasLoader);

    // Set the scale to apply during parsing, parse the file, and create a new skeleton.
    var skeletonData = skeletonJson.readSkeletonData(assetManager.get('madlad/' + name + '.json'));
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

function render () {
    var now = Date.now() / 1000;
    var delta = now - lastFrameTime;
    lastFrameTime = now;

    resize();

    context.save();
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.fillStyle = "#cccccc";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.restore();

    state.update(delta);
    state.apply(skeleton);
    skeleton.updateWorldTransform();
    skeletonRenderer.draw(skeleton);

    requestAnimationFrame(render);
}

function resize () {
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
    createCanvasCharacter();
}

(function() {
    init();
}());