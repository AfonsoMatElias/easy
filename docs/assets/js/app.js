if (!localStorage._lang) localStorage._lang = 'en'; 
document.addEventListener('DOMContentLoaded', function () {
    var lang = localStorage._lang;
    var content = {
        en: {
            cards: {
                component: {
                    header: 'Write in HTML file',
                    text: 'Create your component with the styles (scoped or not) and scripts, embedded in a single pure HTML file.'
                },
                dom: {
                    header: 'No Virtual DOM',
                    text: 'Easy listens to each property (made available by the instance) in the application, when the property changes, it updates the element.'
                },
                reuse: {
                    header: 'Reuse elements',
                    text: 'Easy gives you the opportunity to reuse elements already defined in the application, as if it were a copy and paste.'
                }
            },
            main: "What's <span class=\"note\">Easy.js</span>? Is a javascript library for building user interfaces, and"
                +"helps in the web applications development, providing a synchronous interaction between user interfaces" 
                +"and Javascript data. In some ways and commands, it is very similar to"
                +"<span class=\"note\">Vue.js</span> and <span class=\"note\">Angular.js</span>, but it handles things"
                +"differently!",
            examples: {
                hello: {
                    header: 'Hello World Example',
                    text: 'To begin showing some data in the UI is simple as you can see now... Some directives can be similar to Vue but, belive us, there are diferentes by the inside.'
                },
                sum: {
                    header: 'Simple Sum Example',
                    text: "Let's Two Way Data Bind now... <br>"
                    +"We are using dynamic data property definition <i class=\"mark-el\">e-def</i>."
                    +"In this type of binding when some value changes, it updates"
                    +"the specific field in the element, it means that"
                    +"your element will be always the same."
                },
                todo: {
                    header: 'Todo List Example',
                    text: "Let's make a TODO List App <br> You can manage your list as you expect."
                },
            },
            learn: 'Want to Learn more?'
        }
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
            translations: [
                {
                    id: 'en',
                    name: 'English'
                },
                {
                    id: 'pt',
                    name: 'Português'
                }
            ],

            mainPage: content[lang],

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
            });
        },
        components: {
            config: {
                // '/docs/' -> Use this when local
                // '/easy/' -> Use to push on github
                base: '/easy/' 
            },
            elements: {
                'top': "/components/top",
                'editor': "/components/editor",
                'main': {
                    url: '/components/views/'+ lang +'/main',
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
                'download-connectors': '/components/doc-sections/'+ lang +'/download-connectors',

                // Documentation compoments
                'side-menu': '/components/doc-sections/'+ lang +'/side-menu',
                'introduction': '/components/doc-sections/'+ lang +'/introduction',
                'installation': '/components/doc-sections/'+ lang +'/installation',
                'instance': '/components/doc-sections/'+ lang +'/instance',
                'delimiters': '/components/doc-sections/'+ lang +'/delimiters',
                'bindings': '/components/doc-sections/'+ lang +'/bindings',
                'commands': '/components/doc-sections/'+ lang +'/commands',
                'events': '/components/doc-sections/'+ lang +'/events',
                'methods': '/components/doc-sections/'+ lang +'/methods',
                'components': '/components/doc-sections/'+ lang +'/components',
                'routing': '/components/doc-sections/'+ lang +'/routing',
                'extra': '/components/doc-sections/'+ lang +'/extra',
                'connectors': '/components/doc-sections/'+ lang +'/connectors',
                
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