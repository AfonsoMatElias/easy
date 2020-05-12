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
                base: '/easy/'
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
                tutorial: {
                    url: "/components/tutorial",
                    title: 'Documentation',
                    route: '/tutorial'
                },

                // Documentation compoments
                'introduction': '/doc-sections/en/introduction',
                'installation': '/doc-sections/en/installation',
                'instance': '/doc-sections/en/instance',
                'delimiters': '/doc-sections/en/delimiters',
                'bindings': '/doc-sections/en/bindings',
                'commands': '/doc-sections/en/commands',
                'events': '/doc-sections/en/events',
                'methods': '/doc-sections/en/methods',
                'components': '/doc-sections/en/components',
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

}, false);