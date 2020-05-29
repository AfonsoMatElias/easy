document.addEventListener('DOMContentLoaded', function () {
    document.nodes('code').listen('click', function (e) {
        // Pseudo 52 x 25
        // Calculating the position of the curson
        if ((e.layerX >= e.base.clientWidth - 52) && (e.layerY > 0 && 25 >= e.layerY)) {
            // TODO: text copy here
        }
    });
}, false);

hljs.initHighlightingOnLoad();