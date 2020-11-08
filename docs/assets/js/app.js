document.addEventListener('DOMContentLoaded', function () {
    var app = new Easy('#app-page', {
        config: {
            useDOMLoadEvent: false,
            deepIgnore: true,
        },
        data: {
            darkMode: false,
            themeIco: 'fa-moon-o',
            pageLoading: false,
            app: {
                name: 'Easy',
                version: 'v2.0.1',
                cdn: 'https://cdn.jsdelivr.net/gh/afonsomatelias/easy@2.0.1/easy.js',
                url: 'https://github.com/AfonsoMatElias/easy/releases/download/2.0.1/easy.js',
                connectors: {
                    ajax: 'https://github.com/AfonsoMatElias/easy/releases/download/2.0.1/easy.ajax.js',
                    ajaxCdn: 'https://cdn.jsdelivr.net/gh/afonsomatelias/easy@2.0.1/connectors/easy.ajax.js',
                    free: 'https://github.com/AfonsoMatElias/easy/releases/download/2.0.1/easy.free.js'
                }
            }
        },
        components: {
            config: {
                // Comment this when using locally 
                base: '/easy/'
            },
            elements: {
                'top': "/components/top",
                'editor': "/components/editor",
                'main': {
                    url: "/components/main",
                    title: 'Easy',
                    route: '/',
                    isDefault: true
                },
                'modal': "/components/modal/modal",

                // Documentation compoments
                'side-menu': "/components/doc-sections/en/side-menu",
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
                'extra': '/components/doc-sections/en/extra',
                'connectors': '/components/doc-sections/en/connectors',

                'download-connectors': '/components/doc-sections/en/download-connectors',

                // Tutorial components
                'page': '/components/tutorial/en/structure/page',
                'tutorial': {
                    title: 'Tutorial',
                    route: '/tutorial',
                    url: "/components/tutorial/en/introduction",
                    children: {
                        'tutorial-instance': {
                            title: 'Instance',
                            route: '/instance',
                            url: '/components/tutorial/en/instance',
                        },
                        'tutorial-delimiters': {
                            title: 'Delimiters',
                            route: '/delimiters',
                            url: '/components/tutorial/en/delimiters',
                        },
                        'tutorial-bindings': {
                            title: 'Bindings',
                            route: '/bindings',
                            url: '/components/tutorial/en/bindings',
                        },
                        'tutorial-commands': {
                            title: 'Commands',
                            route: '/commands',
                            url: '/components/tutorial/en/commands',
                        },
                        'tutorial-events': {
                            title: 'Events',
                            route: '/events',
                            url: '/components/tutorial/en/events',
                        },
                        'tutorial-methods': {
                            title: 'Methods',
                            route: '/methods',
                            url: '/components/tutorial/en/methods',
                        },
                        'tutorial-components': {
                            title: 'Components',
                            route: '/components',
                            url: '/components/tutorial/en/components',
                        },
                        'tutorial-routing': {
                            title: 'Routing',
                            route: '/routing',
                            url: '/components/tutorial/en/routing',
                        }
                    }
                },
            }
        },
        mounted: function () {
            // Is loading something
            var pagesLoading = 0;
            var $easy = this;

            function decreasePageLoaded() {
                pagesLoading--;
                if ($easy.data.pageLoading == true && pagesLoading === 0)
                    $easy.data.pageLoading = false;
            }
            this.on('incRequested', function () {
                pagesLoading++;
                if (this.data.pageLoading === false)
                    this.data.pageLoading = true;
            });

            // Everything loaded
            this.on('incLoaded', function () {
                decreasePageLoaded();
            });

            // If some page is blocked, then load the main page
            this.on('incBlocked', function () {
                decreasePageLoaded();
            });

            this.on('incFail', function () {
                decreasePageLoaded();

                // notify({
                //     message: 'Página ou ficheiro não encontrado!',
                //     type: 'error'
                // });
            });
        }
    });

    // Theme handler
    themeHandler.call();

    function themeHandler(isDark) {

        if (isDark == null)
            // Checking if it has some theme defined
            isDark = localStorage._dark;

        // Not theme defined
        if (isDark == null) return;

        var light = 'light-theme',
            dark = 'dark-theme',
            hlLight = 'atom-one-light.css',
            hlDark = 'atom-one-dark.css';
        var highlightElement = document.head.node('link[editor-hl]');
        if (isDark === true || isDark === 'true') {
            // Setting dark mode
            highlightElement.href = highlightElement.href.replace(hlLight, hlDark);
            document.documentElement.classList.replace(light, dark);
            app.data.themeIco = 'fa-sun-o';
        } else {
            // Setting light mode
            highlightElement.href = highlightElement.href.replace(hlDark, hlLight);
            document.documentElement.classList.replace(dark, light);
            app.data.themeIco = 'fa-moon-o';
        }

        localStorage.setItem('_dark', isDark);
    }

    app.watch('darkMode', function (v) {
        themeHandler(v);
    });

    window.onhashchange = function () {
        if (app.data.hasOwnProperty('sMenuOpened'))
            app.data.sMenuOpened = false;
    }

    if (location.pathname.match(/docs\.page\.\d{1}\.html/g) || location.pathname.match('/connectors.html')) {
        app.on('incLoaded', function (el) {
            if (el.inc === 'top') return;
            addAnchors(el.nodes('a[id]'));
        });
    }
}, false);