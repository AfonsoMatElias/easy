document.addEventListener('DOMContentLoaded', function () {

    var $$page = new Easy('#app-page', {
        config: {
            useDOMLoadEvent: false
        },
        data: {
            darkMode: false,
            themeIco: 'fa-moon-o'
        },
        components: {
            config:{
                base: '/assets/web/'
            },
            elements: {
                top: "/assets/web/components/top",
                editor: "/assets/web/components/editor",
                main: {
                    url: "/assets/web/components/main",
                    title: 'Easy',
                    route: '/',
                    isDefault: true
                },
                tutorial: {
                    url: "/assets/web/components/tutorial",
                    title: 'Documentation',
                    route: '/tutorial'
                }
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

}, false);