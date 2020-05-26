document.addEventListener('DOMContentLoaded', function () {
    var $$page = new Easy('#app-page', {
        config: {
            useDOMLoadEvent: false,
            deepIgnore: true, 
        },
        data: {
            darkMode: false,
            themeIco: 'fa-moon-o'
        },
        components: {
            config: {
                // Disable it when using locally 
                // base: '/easy/'
            },
            elements: {
                top: "/components/top",
                editor: "/components/editor",
                main: {
                    url: "/components/main",
                    title: 'Easy',
                    route: '/',
                    isDefault: true
                },

                // Documentation compoments
                'introduction': '/components/doc-sections/en/introduction',
                'installation': '/components/doc-sections/en/installation',
                'instance': '/components/doc-sections/en/instance',
                'delimiters': '/components/doc-sections/en/delimiters',
                'bindings': '/components/doc-sections/en/bindings',
                'commands': '/components/doc-sections/en/commands',
                'events': '/components/doc-sections/en/events',
                'methods': '/components/doc-sections/en/methods',
                'components': '/components/doc-sections/en/components',
                'routing': '/components/doc-sections/en/routing',
                
                // Tutorial components
                'page': '/components/tutorial/en/structure/page',
                'tutorial-index': {
                    title: 'Tutorial',
                    url: "/components/tutorial/en/introduction",
                    route: '/tutorial'
                },
                'tutorial-instance': {
                    title: 'Instance',
                    url: '/components/tutorial/en/instance',
                    route: '/tutorial/instance'
                },
            }
        }
    });

    // Theme handler
    themeHandler.call();
    function themeHandler(isDark) {

        if ( isDark == null )
            // Checking if it has some theme defined
            isDark = localStorage._dark;
        
        // Not theme defined
        if ( isDark == null ) return;

        var light = 'light-theme', dark = 'dark-theme', 
            hlLight = 'atom-one-light.css',
            hlDark = 'atom-one-dark.css';
        var highlightElement = document.head.node('link[editor-hl]');
        if ( isDark === true || isDark === 'true' ) {
            // Setting dark mode
            highlightElement.href = highlightElement.href.replace(hlLight, hlDark); 
            document.documentElement.classList.replace(light, dark);
            $$page.data.themeIco = 'fa-sun-o';
        } else {
            // Setting light mode
            highlightElement.href = highlightElement.href.replace(hlDark, hlLight); 
            document.documentElement.classList.replace(dark, light);
            $$page.data.themeIco = 'fa-moon-o';
        }

        localStorage.setItem('_dark', isDark);
    }

    $$page.watch('darkMode', function (v) {
        themeHandler(v);
    });

    window.onhashchange = function () {
        if ($$page.data.hasOwnProperty('sMenuOpened'))
            $$page.data.sMenuOpened = false;
        
    }

    if ( location.pathname === '/docs.html' ) {
        $$page.on('incLoaded', function (el) {
            if ( el.inc === 'top' ) return;
            addAnchors(el.nodes('a[id]'));
        });
    }

}, false);