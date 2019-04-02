// console.clear();

var madladArr = [];
var numCharacters = 17;

var stateArr = [{"name":"property_credible_on","track":4},{"name":"property_credible_off","track":4},{"name":"property_fact_on","track":2},{"name":"property_fact_off","track":2},{"name":"property_not_credible_on","track":1},{"name":"property_not_credible_off","track":1},{"name":"property_not_relevant_on","track":1},{"name":"property_not_relevant_off","track":1},{"name":"property_opinion_on","track":2},{"name":"property_opinion_off","track":2},{"name":"property_relevant_on","track":1},{"name":"property_relevant_off","track":1},
{"name":"anim_sml_to_super_on","track":5},
{"name":"anim_sml_to_super_off","track":5},
{"name":"property_color_change_on","track":6},
{"name":"property_color_change_off","track":6}];

var btnArr = [];

var menu_div = document.getElementById("menu");

function buildMenu(){
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
    
    for (var i=0; i< madladArr.length; i++) {
        var madlad = madladArr[i];
        madlad.state.setAnimation(track, name, false);
        madlad.state.data.defaultMix = 0;
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


function init () {
    for (var i=0; i < numCharacters; i++){
        var character = createCharacter(i);
    }
}



//createCharacter(0);
init();
buildMenu();