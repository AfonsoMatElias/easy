<p style="width: 100%; text-align:center;">
    <img height="120px" src="/docs/assets/img/main_ico.png" />
<p>

<h2 style="width: 100%; text-align:center;">  Easy </h2>

## Introduction

Easy.js, short for <span style="color:#F0DB4F">Easy</span> 
and <span style="color:#494a47" >Asyncronous Javascript</span>, 
is a javascript library for building user interfaces and that helps in the 
development of web applications, providing a synchronous interaction 
between user interfaces and Javascript data.

### So, Why Easy.js?
As the name says, it is a javascript library really easy to use that provides to you a simple way to interact 
with your HTML by using Reactive Properties, Scoping data in the HTML, reusable components written in pure HTML, 
api calls using only attributes, and so on... It's very good and simple to build Single Page Application.
**No Virtual DOM is used**, it uses the **Real DOM** to handle all the data changes.

### Browsers Compatibility
It was tested in almost every popular browsers and IE 11, below that is not suported.

### Scale of Projects
A web application fully developed with easy.js was tested only with small projects, larger projects was not tested yet.

Learn more about at [Easy Guide Page](https://afonsomatelias.github.com/easy).

## Prerequisites

To start using it, you need to know:

* HTML 📃
* Javascript 📑
* CSS (Optional) 📜

## How to add into my project?

To use into your project you may import via cdn 🌍:

``` HTML
<script src="https://cdn.jsdelivr.net/gh/afonsomatelias/easy@2.0.0/easy.js"></script>
```

Or, you may download file to use locally 💻:

```HTML
<script src="/project/js/easy.js"></script>
```
[Download it now](https://cdn.jsdelivr.net/gh/afonsomatelias/easy@2.0.0/easy.js)

#### Until now, you have it install in your project and you are ready to go!!! 😀

## Testing

Create a script tag below the importing or even a script file (you need to import it too, in this case) and instantiate Easy providing the root element to be controlled:

```HTML
<div id="app">
    <h3> Hello {{ message }}! </h3>
    <p> This is my first Easy app </p>
<div>

<script src="/project/js/easy.js"></script>
<script>
    new Easy('#app', {
        data: {
            message: 'World!'
        }
    });
</script>
```

Check the browser console, if no error or warning message is there, congratulations, you have your first Easy application running healthly!

## Check the documentation

[Click Me](https://afonsomatelias.github.io/easy/docs.html) to see the documentation and some live examples!


## Contributing

Please read [CONTRIBUTING.md](https://gist.github.com/PurpleBooth/b24679402957c63ec426) for details on our code of conduct, and the process for submitting pull requests to us.

## Authors

* **Afonso Matumona** - *Initial work* - [PurpleBooth](https://github.com/PurpleBooth)

See also the list of [contributors](https://github.com/your/project/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

Copyright (c) 2019-Present, Afonso Matumona.