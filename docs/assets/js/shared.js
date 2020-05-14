function $tabs(n) {
    var tab = '\u00a0\u00a0',
        str = tab;
    for (let i = 1; i <= n || 0; i++)
        str += tab;
    return str;
}

function codeToStr(c) {
    var t = (c + '');
    t = t.substr('function(){'.length);
    return t.substr(0, t.length - 1);
}

function createEl(appNode) {
    var el = document.createElement('div');
    el.innerHTML = appNode.innerText;
    var $el = el.children[0];
    $el.$prevent = true;
    return $el;
}

function appExector(element, noApp) {
    // Executing apps
    if (!noApp) {
        var $ad = 'config: { useDOMLoadEvent: false }, data:';
        var $codes = element.querySelectorAll('.example');
        for (var i = 0; i < $codes.length; i++) {
            var $html = $codes[i].parentNode;
            var $script = $html.nextElementSibling;
            var $result = $script.nextElementSibling;
            var $resultEl = createEl($html);
            $result.appendChild($resultEl);
    
            // Highlighting the block
            hljs.highlightBlock($script);
    
            eval($script.innerText.replace('data:', $ad));
    
            // Adding the app to the window object
            window[$resultEl.id] = eval($resultEl.id); 
        }
    }
    
    var codes = element.querySelectorAll('code');
    for (var i = 0; i < codes.length; i++)
        hljs.highlightBlock(codes[i]);
}

function getDateTime() {
    return new Date().toJSON().split('T').map(function (v, i) {
        if (i == 1)
            return v.substr(0, v.length - 1);
        return v;
    }).join(' ');
}

function scrollByAnchor(el) {
    if (location.hash !== '') {
        // Auto scroll if window has hash
        var anchor = el.node('a[id="'+location.hash+'"]');
        if (!anchor) return;
        var presentation = document.node('.doc-presentation');
        presentation.scrollTop = anchor.offsetTop - 10;
    }
}