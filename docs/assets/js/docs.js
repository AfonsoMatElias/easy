// Everything that needs to be executed when the documentation page runs 
document.addEventListener('DOMContentLoaded', function () {
    activeMenuOnScroll();
    var url = location.origin + location.pathname;

    // Setting the real path in the anchors
    var sections = document.node('.doc-page .doc-menu').nodes('[sec]');
    for (var i = 0; i < sections.length; i++) {
        var $li = sections[i];
        var v = $li.valueIn('sec');
        var anchors = $li.nodes('a');
        for (var k = 0; k < anchors.length; k++){
            var $a = anchors[k];
            var load = v ? ('?load=' + v) : '';
            $a.href = url + load + $a.attributes.href.value;
        }
    }
}, false);