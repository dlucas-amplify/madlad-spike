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
    state.setAnimation(track, name, false);
    state.data.defaultMix = 0;
}

(function() {
    buildMenu();
})();