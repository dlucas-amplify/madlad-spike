const skeletonName = 'madlad';
const animName = 'idle';
var madLads = [];

class SpineCharacter {
    constructor() {

        this.canvas = document.createElement('canvas');
        this.canvas.width = 200;
        this.canvas.height = 200;
        this.context = this.canvas.getContext('2d');

        this.skeletonRenderer = new spine.canvas.SkeletonRenderer(this.context);
    
        this.assetManager = new spine.canvas.AssetManager();
    
        this.assetManager.loadText(`madlad/${skeletonName}.json`);
        this.assetManager.loadText(`madlad/${skeletonName}.atlas`);
        this.assetManager.loadTexture(`madlad/${skeletonName}.png`);

        this.lastFrameTime = Date.now() / 1000;
        this.load = this.load.bind(this);
        this.render = this.render.bind(this);
        this.load();
    }

    load() {
        if (this.assetManager.isLoadingComplete()) {
            var data = this.loadSkeleton(skeletonName, animName, 'default');
            this.skeleton = data.skeleton;
            this.state = data.state;
            this.bounds = data.bounds;
            requestAnimationFrame(this.render);
        } else {
            requestAnimationFrame(this.load);
        }
    }

    loadSkeleton(name, initialAnimation, skin) {
        const that = this;
        const atlas = new spine.TextureAtlas(this.assetManager.get(`madlad/${name}.atlas`), function(path) {
            return that.assetManager.get('madlad/' + path);
        });
    
        // Create a AtlasAttachmentLoader, which is specific to the WebGL backend.
        var atlasLoader = new spine.AtlasAttachmentLoader(atlas);
    
        // Create a SkeletonJson instance for parsing the .json file.
        var skeletonJson = new spine.SkeletonJson(atlasLoader);
    
        // Set the scale to apply during parsing, parse the file, and create a new skeleton.
        var skeletonData = skeletonJson.readSkeletonData(this.assetManager.get('madlad/' + name + '.json'));
        var skeleton = new spine.Skeleton(skeletonData);
        skeleton.scaleY = -1;
        var bounds = this.calculateBounds(skeleton);
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

    calculateBounds(skeleton) {
        var data = skeleton.data;
        skeleton.setToSetupPose();
        skeleton.updateWorldTransform();
        var offset = new spine.Vector2();
        var size = new spine.Vector2();
        skeleton.getBounds(offset, size, []);
        return { offset: offset, size: size };
    }

    render (timestamp) {
        var now = Date.now() / 1000;
        var delta = now - this.lastFrameTime;
        this.lastFrameTime = now;
        this.resize();
        this.context.save();
        this.context.setTransform(1, 0, 0, 1, 0, 0);
        this.context.fillStyle = "#cccccc";
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.restore();
        this.state.update(delta);
        this.state.apply(this.skeleton);
        this.skeleton.updateWorldTransform();
        this.skeletonRenderer.draw(this.skeleton);
    
        requestAnimationFrame(this.render);
    }
    
    resize () {
        var w = this.canvas.clientWidth;
        var h = this.canvas.clientHeight;
        if (this.canvas.width != w || this.canvas.height != h) {
            this.canvas.width = w;
            this.canvas.height = h;
        }
    
        // magic
        var centerX = this.bounds.offset.x + this.bounds.size.x / 2;
        var centerY = this.bounds.offset.y + this.bounds.size.y / 2;
        var scaleX = this.bounds.size.x / this.canvas.width;
        var scaleY = this.bounds.size.y / this.canvas.height;
        var scale = Math.max(scaleX, scaleY) * 1.2;
        if (scale < 1) scale = 1;
        var width = this.canvas.width * scale;
        var height = this.canvas.height * scale;
    
        this.context.setTransform(1, 0, 0, 1, 0, 0);
        this.context.scale(1 / scale, 1 / scale);
        this.context.translate(-centerX, -centerY);
        this.context.translate(width / 2, height / 2);
    }
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
    
    for (var i=0; i < madLads.length; i++) {
        var madlad = madLads[i];
        madlad.state.setAnimation(track, name, false);
        madlad.state.data.defaultMix = 0;

        madlad.context.beginPath();
        madlad.context.strokeStyle = "black";
        console.log(madlad);
        madlad.context.strokeRect(10, 10, 100, 100);
        madlad.context.stroke();
    }
}

function init() {
    const characterContainer = document.querySelector('.madlads');
    let character = null;
    for (var i = 0; i < 36; i++) {
        character = new SpineCharacter();
        characterContainer.append(character.canvas);
        madLads.push(character);
    }
    buildMenu();
}

(function() {
    init();
})();