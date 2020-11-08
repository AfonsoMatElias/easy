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
                base: '/docs/'
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
                '404': {
                    isNotFound: true,
                    route: '/404',
                    url: '/components/404',
                    title: '404'
                },

                // Modal
                'modal': "/components/modal/modal",
                // Modal Body
                'download-connectors': '/components/doc-sections/en/download-connectors',

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
                
                // Sections wrapper
                'section-1': '/components/doc-sections/section.1',
                'section-2': '/components/doc-sections/section.2',
                'section-3': '/components/doc-sections/section.3',
                'section-4': '/components/doc-sections/section.4',

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
            var availableSections = {
                'sctn1': 'section-1',
                'sctn2': 'section-2',
                'sctn3': 'section-3',
                'sctn4': 'section-4',
            };

            var presentation = document.node('.doc-presentation');
            if (presentation && !location.pathname.includes('docs.connectors.html')) {
                var section, 
                    // Getting the parameters of the url
                    /* UrlParams, it is a Easy Js built-in class for getting url query string values */
                    params = new UrlParams(); 

                // If there is not a valid value load the first section
                if (params.load == null){
                    section = availableSections['sctn1'];
                    history.replaceState(null, null, location.href + "?load=sctn1");
                }
                else // Otherwise load the asked section
                    section = availableSections[params.load];

                // If the section is valid, then load it
                if (section)
                    presentation.innerHTML = '<inc src="'+ section +'"></inc>';
                else // Otherwise load the 404 component
                    presentation.innerHTML = '<inc src="404"></inc>';
            }

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
}, false);