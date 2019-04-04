// create a single canvas, and draw madlads to it
const canvas = document.getElementById('madlad-canvas');
const context = canvas.getContext('2d');
const skeletonName = 'madlad';
const animName = 'idle';
const madLads = [];
const numChars = 1;
const numClones = 36;

class SpineCharacter {
    constructor() {

        this.canvas = document.createElement('canvas');
        this.canvas.width = 100;
        this.canvas.height = 100;
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
            const data = this.loadSkeleton(skeletonName, animName, 'default');
            this.skeleton = data.skeleton;
            this.state = data.state;
            this.bounds = data.bounds;
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
        const atlasLoader = new spine.AtlasAttachmentLoader(atlas);
    
        // Create a SkeletonJson instance for parsing the .json file.
        const skeletonJson = new spine.SkeletonJson(atlasLoader);
    
        // Set the scale to apply during parsing, parse the file, and create a new skeleton.
        const skeletonData = skeletonJson.readSkeletonData(this.assetManager.get('madlad/' + name + '.json'));
        const skeleton = new spine.Skeleton(skeletonData);
        skeleton.scaleY = -1;
        const bounds = this.calculateBounds(skeleton);
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

    calculateBounds(skeleton) {
        skeleton.setToSetupPose();
        skeleton.updateWorldTransform();
        const offset = new spine.Vector2();
        console.log
        const size = new spine.Vector2();
        skeleton.getBounds(offset, size, []);
        return { offset: offset, size: size };
    }

    render (timestamp) {
        const now = Date.now() / 1000;
        const delta = now - this.lastFrameTime;
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
        this.skeletonRenderer.draw(this.skeleton, this.canvasOffset);
    }
    
    resize () {
        const w = 100
        const h = 100;
        if (this.canvas.width != w || this.canvas.height != h) {
            this.canvas.width = w;
            this.canvas.height = h;
        }
    
        // magic
        const centerX = this.bounds.offset.x + this.bounds.size.x / 2;
        const centerY = this.bounds.offset.y + this.bounds.size.y / 2;
        const scaleX = this.bounds.size.x / this.canvas.width;
        const scaleY = this.bounds.size.y / this.canvas.height;
        let scale = Math.max(scaleX, scaleY) * 1.2;
        if (scale < 1) scale = 1;
        const width = this.canvas.width * scale;
        const height = this.canvas.height * scale;
    
        this.context.setTransform(1, 0, 0, 1, 0, 0);
        this.context.scale(1 / scale, 1 / scale);
        this.context.translate(-centerX, -centerY);
        this.context.translate(width / 2, height / 2);
    }
}

function buildMenu(){
    const stateArr = [
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
    const menu_div = document.getElementById("menu");
    const btnStates = ["on", "off"];

    for (let i = 0; i < stateArr.length; i++){
        const t = i % 2;
        const item = stateArr[i];
        const button = document.createElement("button");
        button.className = "btn_" + t;
        button.track = item.track;
        button.innerHTML = item.name;
        menu_div.appendChild(button);
        button.addEventListener("click", function() {
            setAnimState(this.innerHTML , this.track);
        });
    }
}

function setAnimState(name, track) {
    
    for (let i=0; i < madLads.length; i++) {
        const madlad = madLads[i];
        madlad.state.setAnimation(track, name, false);
        madlad.state.data.defaultMix = 0;

        madlad.context.beginPath();
        madlad.context.strokeStyle = "black";
        madlad.context.strokeRect(10, 10, 100, 100);
        madlad.context.stroke();
    }
}

// loop through every madlad and place it's canvas on the the main canvas
function renderCanvas() {
    const madLadsNotLoaded = madLads.filter((madlad) => {
        return !madlad.assetManager.isLoadingComplete() ;
    });
    // context.fillStyle = "#cccccc";
    // context.fillRect(0, 0, canvas.width, canvas.height);
    if (madLadsNotLoaded.length === 0) {
        let madY = 0;
        let madX = 0;
        // madLads.forEach((madlad, mIndex) => {
        //     if (mIndex % 12 === 0 && mIndex > 0) {
        //         madY += 100;
        //     }
        //     madX = mIndex % 12;
        //     madlad.render();
        //     context.drawImage(madlad.context.canvas, madX * 100, madY);
        // });
        madLads[0].render();
        for (let i = 0; i < numClones; i++) {
            if (i % 12 === 0 && i > 0) {
                madY += 100;
            }
            madX = i % 12;
            context.drawImage(madLads[0].context.canvas, madX * 100, madY)
        }
    }
    requestAnimationFrame(renderCanvas);
}

function init() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let character = null;
    for (let i = 0; i < numChars; i++) {
        character = new SpineCharacter(canvas);
        // characterContainer.append(character.canvas);
        madLads.push(character);
    }
    buildMenu();
    requestAnimationFrame(renderCanvas);
}

(function() {
    init();
})();
