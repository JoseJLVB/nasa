const express = require('express')
const { get_user, create_user} = require('./db.js')

const router = express.Router()

//rutas internas
function protected_routes(req, res, next){
  if(!req.session.user){
    req.flash('errors', 'Debe ngresar al sistema primero')
    return res.redirect('/login')
  }
  next()
}

router.get('/admin', protected_routes, (req, res) => {
  const user = req.session.user
  res.render('admin.html', { user })
});

router.get('/', protected_routes, (req, res) => {
  const user = req.session.user
  res.render('evidencias.html', { user } )
});

//rutas de auth (externas)

router.get('/login', (req, res) => {
  const errors = req.flash('errors ')
  res.render('login.html', { errors })
});

router.post('/login', async (req, res) => {
  // recuper valores del formulario
  const email = req.body.email
  const password = req.body.password

  //validar  si usuario existe
  const user = await get_user(email)
  if(!user) {
    req.flash('errors', 'Usuario no exite o contraseña incorrecta')
    return res.redirect('/login')
  }

  //validar que contraseña coincida con la de la base de datos
  if (user.password != password) {
    req.flash('errors', 'Usuario no exite o contraseña incorrecta')
    return res.redirect('/login')
  }

  //guardamos el usuario en sesion
  req.session.user = user
  res.redirect('/')
})
router.get('/register', (req, res) => {
  const errors = req.flash('errors')
  res.render('register.html', { errors })
});

router.post('/register', async (req, res) => {
  //recuperamos los valores del formulario
  const email = req.body.email
  const name = req.body.name
  const password = req.body.password
  const password_confirm = req.body.password_confirm

  //verificar que contraseñas coincidan
  if (password != password_confirm) {
    req.flash('errors', 'Las contraseñas no coinciden')
    return res.redirect('/register')
  }

  //validar que email no exista previamente
  const user = await get_user(email)
  if (user) {
    req.flash('errors', 'Usuario ya existe o contraseña incorrect')
    return res.redirect('/register')
  }

  await create_user(email, name, password)

  //guardar el nuevo usuario en sesion
  req.session.user = { name, email, password }
  res.redirect('/')
})

router.post('/upload', async (req, res) => {
  const img = req.files.foto;
  console.log(img);
  await img.mv(`imagenes/${req.body.foto}.jpg`)

  res.redirect('evidencias.html')
});


router.get('/logout', (req, res) => {
  // 1. Eliminamos al usuario de la sesión
  req.session.user = undefined
  // 2. Lo mandamos al formulario de login
  res.redirect('/login')
})


module.exports = router