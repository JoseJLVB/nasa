// 1. Importa las librerías que vamos a utilizar
const express = require('express')
const fileupload = require('express-fileupload')
const session = require('express-session')
const nunjucks = require('nunjucks')
const flash = require('connect-flash')

const app = express()

// 2. Configura dichas librerías
app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.use(flash())

app.use(express.static('imagenes'));

nunjucks.configure('templates',{
  express:app,
  autoscape:true,
  noCache:false,
  watch:true
});

app.use(session({
  secret: "mi-clave",
  saveUninitialized:true,
  cookie: { maxAge: 60*60*1000*24 }, // 1 día
  resave: false
}));

app.use(fileupload({
  limits: { fileSize: 5242880 },
  abortOnLimit: true,
  responseOnLimit: 'El peso del archivo supera el máximo (5Mb)'
}))

// 3. Importa las rutas
app.use(require('./routes.js'))

// 4. Inicia el Servidor
const PORT = 3000
app.listen(PORT, () => console.log(`Servidor en el puerto ${PORT}`));
