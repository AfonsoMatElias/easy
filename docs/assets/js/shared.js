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

function createNotCompilableElement(content) {
    var el = document.createElement('div');
    el.innerHTML = content;
    var $el = el.children[0];
    // Prevent the defalt compilation
    $el.$prevent = true;
    return $el;
}

function appExector(element, noApp) {
    new Promise(function (res) {
            res()
        })
        .then(function () {

            var codes = element.nodes('textarea[cm-lang]');
            for (let i = 0; i < codes.length; i++) {
                var code = codes[i];
                code.parentNode.editor = CodeMirror.fromTextArea(code, {
                    readOnly: true,
                    mode: code.valueIn('cm-lang'),
                    scrollbarStyle: 'simple'
                });
            }

            // Executing apps
            if (!noApp) {
                var $ad = 'config: { useDOMLoadEvent: false }, data:';
                var $codes = element.querySelectorAll('div[execute]');
                for (var i = 0; i < $codes.length; i++) {

                    // The Main HTML Element
                    var $html = $codes[i];

                    // The Script Element
                    var $script = $html.nextElementSibling;
                    
                    // The script content 
                    var $scriptContent = $script.editor.getValue();
                    
                    // The Display element
                    var $display = $script.nextElementSibling;

                    // Creating the element
                    var $resultExecutableElement = createNotCompilableElement($html.editor.getValue());

                    // Adding to the DOM
                    $display.appendChild($resultExecutableElement);

                    // Adding a peace of code that disable `DOMLoadEvent` usage
                    eval($scriptContent.replace('data:', $ad));

                    // Adding the easy app to the window object
                    window[$resultExecutableElement.id] = eval($resultExecutableElement.id);
                }
            }
        });
}

function getDateTime() {
    return new Date().toJSON().split('T').map(function (v, i) {
        if (i == 1) return v.substr(0, v.length - 1);
        return v;
    }).join(' ');
}

function scrollByAnchor(el) {
    if (location.hash !== '') {
        // Auto scroll if window has hash
        var anchor = el.node('a[id="' + location.hash.substr(1) + '"]');
        if (!anchor) return;
        var presentation = document.node('.doc-presentation');
        presentation.scrollTop = anchor.offsetTop + 15;
    }

    el.nodes('a').filter(function (anchor) {
        var href = anchor.attributes.href;
        if (!href || href.value[0] != '#') return;
        anchor.href = location.href + href.value;
    })
}

function addAnchors(anchors) {
    if (!anchors) return;
    if (!Array.isArray(anchors)) return;
    $anchors.push.apply($anchors, anchors);
}

function activeMenuOnScroll() {
    // Store all the menu anchros do be able to find it by key
    var menu = {},
        // Store the last passed anchor on scroll
        lastPassed,
        // Store the last active anchor in menu bar
        $lastActive,
        // Menu container
        $MenuContainer = document.node('.doc-menu .content'),
        // Getting all the anchors in the menu bar anchors
        $$anchors = $MenuContainer.nodes('.menu a[href]');

    // Mapping the anchors to the menu variable
    for (var i = 0; i < $$anchors.length; i++) {
        var $e = $$anchors[i];
        menu[$e.hash] = $e;
    }

    // Listening to the scroll event 
    var presentation = document.node('.doc-presentation');
    presentation.onscroll = function () {
        var current, $anchors = presentation.nodes('a[id]');
        // Looping all the subscribed anchors
        for (var i = 0; i < $anchors.length; i++) {
            var element = $anchors[i];

            // If has class attribute, means that is markable element
            if (element.attributes['class']) continue;

            // Getting the floor of the value
            var position = Math.floor(element.getBoundingClientRect().top);

            // Checking if it is in the range 
            // (Used this way because with only one value like 60, some of them will not this verification)
            if (position <= 70 && position >= 60) {
                current = element;
                break;
            }
        }

        if (current) {
            // Void if the current and the last are the same 
            if (lastPassed && (lastPassed.id === current.id)) return;

            // Getting the menu anchor that corresponds this id
            var $current = menu['#' + current.id];

            // Void if it wasn't found
            if (!$current) return;

            // Clearing the last acgive menu
            if ($lastActive) $lastActive.className = '';

            // Marking active to the current one
            $current.className = 'active-doc-menu';

            // Fixing the position of the menu scroll
            $MenuContainer.scrollTop = $current.offsetTop - 20;

            // Setting the last active one to be remembered
            $lastActive = $current;
            // Setting the last Passed one void if necessary
            lastPassed = current;
        }
    }
}

function showModal() {
    var el = document.createElement('div');
    el.innerHTML = '<inc src="modal" data="{ modalName: \'Downloads\' }">' +
        '<content>' +
        '<inc src="installation"></inc>' +
        '<inc src="download-connectors"></inc>' +
        '</content>' +
        '</inc>';
    this.el.appendChild(el.children[0]);
}

function loadFile(path, callback) {
    this.http(location.origin + this.options.components.config.base + path, {
        method: 'get',
        headers: {
            'Content-Type': 'text/html'
        }
    }).then(function (data) {
        if (data.ok) {
            callback(data.response);
        } else {
            throw ({
                message: 'Unable to load the file: ' + path + '\nDescription: ' + data.statusText
            });
        }
    }).catch(function (error) {
        Easy.log(error);
    });
}

function notify(obj) {
    if (!obj || !obj.message) return;

    var container = document.node('.popup-container');
    if (!container) return;
    var inc = document.createElement('inc');

    if (!obj.type) obj.type = 'info';

    // Preparing the inc
    inc.valueIn('src', 'popup');
    obj.message = escape(obj.message);
    if (obj.url) obj.url = escape(obj.url);
    else obj.url = null;

    inc.valueIn('data', JSON.stringify(obj));

    // Inserting the node
    container.insertBefore(inc, container.children[0]);
}