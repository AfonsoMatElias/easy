document.addEventListener('DOMContentLoaded', function () {
    // The language that needs to loaded
    var lang,
        // Website available languages
        languages = [
            {
                id: 'en',
                name: 'English'
            },
            {
                id: 'pt',
                name: 'Português'
            }
        ];

    // If some language isn't selected
    if (!localStorage._lang) {
        // Get the navigator language
        var id = ((window.navigator || {}).language || 'en').split('-')[0];

        // Loop and check if it's in available languages
        for (let i = 0; i < languages.length; i++)
            if (languages[i].id == id) lang = id;

        // If it was found set it
        lang = localStorage._lang = lang || 'en';
    } else {
        // Otherwise get the defined language
        lang = localStorage._lang;
    }

    var app = new Easy('#app-page', {
        config: {
            useDOMLoadEvent: false,
            deepIgnore: true,
        },
        data: {
            darkMode: localStorage._dark ? (localStorage._dark == 'true' ? true : false) : false,
            themeIco: 'fa-moon-o',
            pageLoading: false,
            showLanguageDropDown: false,
            selectedLang: lang,
            translations: languages,
            app: {
                name: 'Easy',
                version: 'v2.3.2',
                
                cdn: 'https://cdn.jsdelivr.net/gh/afonsomatelias/easy@2.3.1/easy.js',
                url: 'https://github.com/AfonsoMatElias/easy/releases/download/v2.3.1/easy.js',

                cdnMin: 'https://cdn.jsdelivr.net/gh/afonsomatelias/easy@2.3.1/easy.min.js',
                urlMin: 'https://github.com/AfonsoMatElias/easy/releases/download/v2.3.1/easy.min.js',
                
                connectors: {
                    ajax: 'https://github.com/AfonsoMatElias/easy/releases/download/v2.3.1/easy.ajax.js',
                    ajaxCdn: 'https://cdn.jsdelivr.net/gh/afonsomatelias/easy@2.3.1/connectors/easy.ajax.js',
                    free: 'https://github.com/AfonsoMatElias/easy/releases/download/v2.3.1/easy.free.js'
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
                if (params.load == null) {
                    section = availableSections['sctn1'];
                    history.replaceState(null, null, location.href + "?load=sctn1");
                } else // Otherwise load the asked section
                    section = availableSections[params.load];

                // If the section is valid, then load it
                if (section)
                    presentation.innerHTML = '<inc src="' + section + '"></inc>';
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
            });

            // Theme handler
            themeHandler.call(instance);

            this.watch('darkMode', function (v) {
                themeHandler.call(instance, v);
            });

            this.watch('selectedLang', function (v) {
                if (localStorage._lang == v) return;

                localStorage._lang = v;
                location.reload();

                var _lang = {
                    en: "Please, reload the page if the language did not change!",
                    pt: "Por favor, recarregue a página caso a linguagem não foi modificada!",
                }

                setTimeout(function () {
                    notify({
                        message: _lang[v]
                    });
                }, 6000);
            });
        },
        components: {
            config: {
                // preload: true
            },
            elements: {
                'top': "/components/top",
                'editor': "/components/editor",
                'main': {
                    url: '/components/views/' + lang + '/main',
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

                // Popup
                'popup': "/components/shared/popup",

                // Modal
                'modal': "/components/modal/modal",
                // Modal Body
                'download-connectors': '/components/doc-sections/' + lang + '/download-connectors',

                // Documentation components
                'introduction': '/components/doc-sections/' + lang + '/introduction',
                'installation': '/components/doc-sections/' + lang + '/installation',
                'instance': '/components/doc-sections/' + lang + '/instance',
                'delimiters': '/components/doc-sections/' + lang + '/delimiters',
                'bindings': '/components/doc-sections/' + lang + '/bindings',
                'commands': '/components/doc-sections/' + lang + '/commands',
                'events': '/components/doc-sections/' + lang + '/events',
                'methods': '/components/doc-sections/' + lang + '/methods',
                'components': '/components/doc-sections/' + lang + '/components',
                'routing': '/components/doc-sections/' + lang + '/routing',
                'extra': '/components/doc-sections/' + lang + '/extra',
                'connectors': '/components/doc-sections/' + lang + '/connectors',
                'goodbye': '/components/doc-sections/' + lang + '/goodbye',

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