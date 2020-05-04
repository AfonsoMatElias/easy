<style>
    .justify {
        text-align: justify;
    }
    .center {
        width: 100%;
        text-align:center;
    }
</style>
<p class="center" style="height:120px">
    <img height="120px" src="assets/web/img/main_ico.png" />
<p>

<h2 class="center"> easy.js </h2>

<p class="justify">
    Easy js é uma biblioteca javascript que auxilia na criação de aplicações web💻 ou mobile📲 (usando phonegap, no caso), <b><i>Easy and Asynchronous Javascript</i></b> que em português podemos traduzí-lo como <b><i>Javascript fácil e assíncrono</i></b>. Ela possibilita e facilita na disposição das informações vindas de uma fonte de dados.
</p>

<p class="justify">
    <b>Porquê usar? 🤔</b><br/>
    Porque tal como o nome diz easy js, ela é mesmo muito fácil de usar, e permite separar o máximo possível o HTML do Javascript, com o ela tens a possibilidade de criar objectos estruturados para serem enviados ao servidor, permite efectuar <b>One Way Data Binding</b>, separação de contexto de dados a serem apresentado e muito mais... Com simples comandos (Propriedades HTML ou como denominamos, Easy Properties), você é capaz de listar dados, preencher campos, enviar dados a uma fonte de dados (que pode ser um Servidor), criar objectos temporários, reutilizar objectos definidos em um determinado script, etc. 
    Mas para poder usá-lo, só precisas conhecer HTML📃, Javascript📜, e/ou CSS🎫. 
</p>
<hr />

<h2>Vamos Começar</h2>

<p class="justify">
    Para que easy funcione deverá ser importado e instanciado referenciando a secção que ela terá controle.
</p>

```javascript
    // Padrão
    const app = new Easy('#app');
```

<p class="justify">
    Esta é a forma padrão de ser usada... Também tens possibilidade de quais são os dados que ele devem estar disponiveis logo que a aplicação executar.
</p>

```javascript
    // Padrão
    const app = new Easy('#app', {
        data: {
            name: 'Afonso Matumona',
            age: 14
        }
    });
```

<p style="text-align: justify">
    Todas objectos passado no data, serão escutados, isto significa que quando for alterado também vai alterar na página, a isto chamamos <b>One Way Data Binding</b>.
</p>

<p style="text-align: justify">
    Para poder mostrar esta informação na página, primeiramente deve se criar um <b>escopo</b> e depois pôr o <b>delimitador</b> no local onde desejas mostrar os dados. <br>
    Os escolos são definidos pelos atributos: <br>
    <b>data, e-tmp, e-fill</b>, etc. o escopo especifico para Data Bind é o <b>data</b>.
    Temos dois (2) tipo de delimitadores:
    <ol>
        <li>Easy: <b> -e- ... - </b></li>
        <li>Comum: <b> {{ ... }} </b></li>
    </ol>
    Os dois funcionam da mesma maneira, você escolhe qual queres usar com base as tuas preferências.
</p>

```HTML
    <body id="app">
        <div data>
            <p> -e-name- </p>
            <p> -e-age- </p>
        </div>
    </body>
```

<p style="text-align: justify">
    Cada valor que é mostrado na página vindo do objecto data definido na instância do easy, está automaticamente ligado com a sua propriedade, isto significa que se a variável sofrer alguma alteração o respectivo campo na UI ou pagina também é actualizado. 
</p>

<p style="text-align: justify">
    O primeiro passo é redefinir o <b><i>baseURL</i></b> no ficheiro, por padrão ele vem:
</p>

```javascript
    // Padrão
    easy.baseURL = 'https://jsonplaceholder.typicode.com/';
```

Exemplo 👇

```javascript
    // Exemplo
    // Lembre-se de usar sempre a última contra-barra
    easy.baseURL = 'http://127.0.0.1/api/';
```

<h4 style="text-align:center;"> Lidando com o HTML 📃</h4>

Alguns comandos predefinidos para poder controlar os elementos do HTML:

    e-tmp, e-id, e-filter, e-anm, -e-, e-fill, e-build, e-rvs, e-array.

Listando dados de uma fonte de dados que no caso é uma API:

Para este exemplo, vai se usar os comandos: **e-tmp, e-anm, e-rvs** 
```HTML
    <!-- e-tmp="Pessoa" -> Para listar todos os dados da rota api/Pessoa
         e-anm="up" -> Para animar a entrada dos dados
         e-rvs="true" -> Para reverter a inserção de dados 
         -e- -> Para determinar onde vai ser posto o valor de um campo-->
    <div id="container">
        <div e-tmp="Pessoa" e-anm="up" e-rvs="true">
            <label>
                -e-Nome-
            </label>
            <label>
                -e-Idade-
            </label>
        </div>
    </div>
```
    Gif Illustration
![Gif](assets/ico/easy_list.gif)

Geração de Objectos Javascript através de um elemento HTML, usando a função do easy **e_generateObj(object)**

```HTML
    <!-- Uma forma -->
    <form id="PessoaForm">
        <input name="Nome" />
        <div e-build="Endereco">
            <input name="Rua" />
        </div>
        <div e-build="Endereco.Geo">
            <input name="Lat" />
            <input name="Lng" />
        </div>
        <div e-build="Endereco.Geo.Continente">
            <input name="Nome" />
        </div>
    </form>
```
O objecto será construído com base o a hierarquia criada no Elemento HTML com as propriedades que o easy.js oferece.
```javascript
    let obj = easy.toJsObj('#PessoaForm');
    console.log(obj);
    
    // Or...

    let form = document.node('#PessoaForm'); // Easy query selector
    let obj = easy.toJsObj(form);
    console.log(obj);
```

    Image Illustration
![Png](assets/ico/easy_gen.png)

<h4 style="text-align:center;"> Principais funções </h4>

```javascript

    // CRUD - Create, Read, Update and Delete, Extra GetOne
    
    // ('caminho', 'objeto/selector', 'gerarId')
    easy.create(string, object/string, boolean);
    
    // ('caminho', 'funcao', 'filtro')
    easy.read(string, callback, string);

    // ('caminho', 'objeto/selector', 'id')
    easy.update(string, object/string, string);

    // ('caminho', 'id')
    easy.delete(string, string);

    // ('caminho', 'id', 'HTMLElement a ser preenchido')
    easy.getOne(string, string, string);

    // Create
    //#1 Exemplo
    easy.create('Pessoa', '#PessoaForm');
    
    //#2 Exemplo
    easy.create('Pessoa', { 
        Id:'P0001', 
        Nome:'Afonso Matumona', 
        Idade: 23 
    });
    
    
    // Read
    easy.read('Pessoa', function(data){
        console.log(data);
    });

    
    // Update
    //#1 Exemplo
    easy.update('Pessoa', '#PessoaForm', 'P0001');
    
    //#2 Exemplo
    easy.update('Pessoa', { 
        Nome:'Matumona Elias', 
        Idade: 16 
    }, 'P0001');


    // Delete
    easy.delete('Pessoa', 'P0001');

    
    // GetOne
    easy.getOne('Pessoa', 'P0001');

```

Para as listas javascript, o controle é tão simples quanto as APIs, a diferença é que deve ser especificado qual é a fonte de dados com a função **source(ds)**.

<p><b>Dada uma lista de musicas, que podemos efectuar as operações básicas do <i>easy</i> 😃...</b></p>

```javascript
    (async () =>{

        // Exemplo
        var playlist = [];
        
        // Create
        await easy.source(playlist).create({
            titulo:'Final Episode',
            artista:'Asking Alexandria',
            album:'Stand Up And Scream'
        });
        
        //Read
        let a = await easy.source(playlist).read();
        console.log(a);
        
        // Update
        await easy.source(playlist).update({
            titulo:'Asking Alexandria - Final Episode',
            artista:'Asking Alexandria',
            album:'Stand Up And Scream'
        }, 0);
        
        // Delete
        await easy.source(playlist).delete(0);
        
    })();
```
<p>Como listá-la de forma rápida no HTML? 🤔... Resposta, é do mesmo jeito que é feito no pequeno exemplo dado acima do <i>e-tmp</i>, a pequena diferença é que deve ser passado de quê lista vêem os dados dentro de parênteses retos, [Lista].</p>

```HTML
    <div id="container">
        <div e-tmp="[playlist]"
             title="-e-album-">
            <label>
                -e-titulo-
            </label>
            <label>
                -e-artista-
            </label>
        </div>
    </div>
```
Easy, oferece ainda varias funções auxiliares (extensões) para seu código, funções curtas, fáceis de lembrar e de muita utilidade, algumas dessas são:

```javascript
    // HTMLElement.node(...), possibilita executar a função querySelector sobre um elemento.
    const element = document.node('#item-id'); 
    
    // HTMLElement.nodes(...), possibilita executar a função querySelectorAll, e retorna um Array
    // de elementos encontrados.
    const element = document.nodes('.item'); 
    
    // HTMLElement.listen(...), permite executar a função addEventListener, mas isso
    // indepentende de é uma lista de elementos ou simplesmente um elemento
    // de elementos encontrados.

    document.node('#form-id').listen('submit', (e) => {
        // ...
    }); 
    
    document.nodes('div').listen('click', (e) => {
        // Se o elemento que vem no target (e.target) não é o elemento referenciado que
        // no caso é 'div', o mesmo pode ser pegue em e.base 
        // (retorna o elemento que na qual foi posto o evento).
        // ...
    }); 

    // HTMLElement.valueIn(...), permite retornar ou configurar (e retornar) valor de um
    // attributo do elemento. 
    let value = element.valueIn('id'); // Retorna o valor do atributo id
    value = element.valueIn('id', 'id-001'); // configura o atributo e retorna o valor.
    value = element.valueIn(); // Retorna o valor do content (o valor do contentor)

    // HTMLElement.aboveMe(...), permite recuperar o elemento que está acima do corrente 
    // elemento, um elemento acima
    let parent = element.aboveMe(); // Retorma o elemento acima
    parent = element.aboveMe('.myClass'); // Retorna o primeiro elemento acima com o valor passado como parametro.

    // Ainda temos: 
    // object.keys(...), 
    // NodeCollection.toArray(...), 
    // Array.remove(...) 
    // ..., detalhe de tudo pode ser encontrado na documentação.

```

<p align="center" style="text-align:center; font-size:11pt; margin:0;"> 
    Thanks a lot for visiting easy.js repo 🙂, I hope you enjoyed!! 👌<br/>
    <h4 align="center" style="text-align:center;" >Salute 😃</h4> 
</p>
<br/>

<p align="center" style="text-align:center; height:90px">
    <img height="90px" src="assets/ico/sec_ico_desc.png" />
</p>

<p align="center" style="text-align:center; font-size:11pt; margin:0;"> 
    © 2019, Afonso Matumona Elias 
</p>
