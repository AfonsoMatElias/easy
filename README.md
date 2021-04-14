<p align="center"><a href="https://afonsomatelias.github.io/easy" target="_blank" rel="noopener noreferrer"><img height="120px" src="docs/assets/img/main_ico.png" /></a></p>

<p align="center">
    <a href="https://github.com/afonsomatelias/easy/blob/master/LICENSE">
        <img src="https://img.shields.io/badge/dynamic/json?color=orange&label=version&query=version&url=https%3A%2F%2Fraw.githubusercontent.com%2FAfonsoMatElias%2Feasy%2Fmaster%2Fpackage.json" alt="Verison">
    </a>
    <a href="https://github.com/afonsomatelias/easy">
        <img src="https://img.shields.io/badge/license-MIT-brightgreen" alt="License">
    </a>
</p>

<h2 align="center"> Easy </h2>

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

Visit our site to learn more about it, [Easy Site](https://afonsomatelias.github.io/easy).

## Prerequisites

To start using it, you need to know:

* HTML 📃
* Javascript 📑
* CSS (Optional) 📜

## How to add into my project?

To use into your project you may import via cdn 🌍:

``` HTML
<!-- Attention: this is an example -->
<script src="https://cdn.jsdelivr.net/gh/afonsomatelias/easy@2.2.0/easy.js"></script>
```

Or, you may download file to use locally 💻:

```HTML
<script src="js/easy.js"></script>
```
Enter the site to download it!

#### So far, you have it install in your project and you are ready to go!!! 😀

## Testing

Create a script tag below the importing or even a script file (you need to import it too, in this case) and instantiate Easy providing the root element to be controlled:

```HTML
<div id="app">
    <h3> Hello {{ message }}! </h3>
    <p> This is my first Easy app </p>
<div>

<script src="js/easy.js"></script>
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

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am "Add some feature"`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request

For major changes, please open an issue first to discuss what you would like to change.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Copyright (c) 2019-Present, Afonso Matumona.