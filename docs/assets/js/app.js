document.addEventListener('DOMContentLoaded', function () {
    var app = new Easy('#app-page', {
        config: {
            useDOMLoadEvent: false,
            deepIgnore: true,
        },
        data: {
            darkMode: localStorage._dark ? (localStorage._dark == 'true' ? true : false) : false,
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
        mounted: function () {
            var instance = this;
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

            // Theme handler
            themeHandler.call(instance);

            this.watch('darkMode', function (v) {
                themeHandler.call(instance, v);
            });
        },
        components: {
            config: {
                // '/docs/' -> Use this when local
                // '/easy/' -> Use to push on github
                base: '/docs/' 
            },
            elements: {
                'top': "/components/top",
                'editor': "/components/editor",
                'main': {
                    url: "/components/views/main",
                    title: 'Easy',
                    route: '/',
                    isDefault: true
                },
                '404': {
                    isNotFound: true,
                    route: '/404',
                    url: '/components/views/404',
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

                // Tutorial
                'tutorial': {
                    title: 'Tutorial',
                    route: '/tutorial/:topic',
                    url: "/components/views/tutorial"
                },
            }
        },
    });

    function themeHandler(isDark) {
        if (isDark == null)
            // Checking if it has some theme defined
            isDark = localStorage._dark;

        // Not theme defined
        if (isDark == null) return;

        var light = 'light-theme',
            dark = 'dark-theme';
        if (isDark === true || isDark === 'true') {
            // Setting dark mode
            document.documentElement.classList.replace(light, dark);
            this.data.themeIco = 'fa-sun-o';
        } else {
            // Setting light mode
            document.documentElement.classList.replace(dark, light);
            this.data.themeIco = 'fa-moon-o';
        }

        localStorage.setItem('_dark', isDark);
    }

    window.onhashchange = function () {
        if (app.data.hasOwnProperty('sMenuOpened'))
            if (app.data.sMenuOpened)
                app.data.sMenuOpened = false;
    }
}, false);