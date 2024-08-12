const express = require('express');
const expressLayouts = require('express-ejs-layouts');

const {body, validationResult, check, Result} = require('express-validator');
const methodOverride = require('method-override');

const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');

require('./utils/db'); // tidka perlu pakai const karna hanya menjalankan konsksi saja
const Contact = require ('./model/contact');


const app = express();
const port = 3000;

//setup method override
app.use(methodOverride('_method'));

//setup EJS (engine)
app.set('view engine', 'ejs'); //view engine menggunakan EJS
app.use(expressLayouts); //third-party middleware
app.use(express.static('public'))//build-in middleware
app.use(express.urlencoded({extended: true})); // built middleware menampilkan data body

//konfigurasi flash
app.use(cookieParser('secret'));
app.use(session({
  cookie: { maxAge: 6000},
  secret: 'secret',
  resave: true,
  saveUninitialized: true,
}));
app.use(flash());

//halaman home
app.get('/', (req, res,) => { 
    const karyawan  = [
      {
        nama: 'Dandi Damanik',
        email: 'dandi@gmail.com',
      },
      {
        nama: 'Tornando',
        email: 'tornando@gmail.com',
      },
      {
        nama: 'Frangko',
        email: 'franko@gmail.com',
      },
    ];
      res.render('index', {
        layout:'layouts/main-layout',
        nama: 'Dandi Damanik',
         title: 'Halaman Home',
        karyawan,
      });
    });

    
//ini halmaan about
app.get('/about', (req, res,) => {
  res.render('about', {
    layout: 'layouts/main-layout',
    title: 'Halaman About',
  });
  });

//ini halman Contact
app.get('/contact', async (req, res) => {
  
  // Contact.find().then((contact) => {
  //   res.send(contact);
  // }) //menjalankan tanpa async await
  

  const contacts = await Contact.find();

  res.render('contact', {
    layout: 'layouts/main-layout',
    title: 'Halaman Contact',
      contacts,
      msg: req.flash('msg'),
  });
  });

//halmaan form tambah data contact
app.get('/contact/add', (req, res) => {
  res.render('add-contact', {
    title: 'Form Tambah Data Contact',
    layout: 'layouts/main-layout',
  });
});
  
//proses tambah data contact
app.post('/contact',[
  body('nama').custom( async (value) =>{
    const duplikat = await Contact.findOne({ nama: value });
    if(duplikat) {
      throw new Error('Nama contact sudah digunakan!');
    }
    return true;
  }),
  check('email','Email tidak valid').isEmail(),
  check('nohp','No HP tidak valid').isMobilePhone('id-ID'),
 ],
  (req, res) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    res.render('add-contact',{
    title: 'Form Tambah Data Contact',
    layout: 'layouts/main-layout',
    errors: errors.array(),
    });
  } 
  else { 
    Contact.insertMany(req.body, (error, result) => {
      //kirimkan flash message
    req.flash('msg', 'Data contact berhasil ditambahkan!');
    res.redirect('/contact');
    });
  }
});



//proses delete contact
// app.get('/contact/delete/:nama', async (req, res) => {
//   const contact = await Contact.findOne({ nama:req.params.nama});
  
  //jika contact tidak ada
//   if(!contact) {
//     res.status(404);
//     res.end('<h1>404</h1>'); 
//   } else {
//     Contact.deleteOne({ _id: contact._id }).then((result) =>{ //jika ingin mnghapus berdasarkan id,(bisa berdasarkan nama juga dll)
//       req.flash('msg', 'Data contact berhasil dihapus!');
//       res.redirect('/contact');
//     }); 
//   }
// });
app.delete('/contact', (req, res) => {
      Contact.deleteOne({ nama : req.body.nama }).then((result) =>{ 
      req.flash('msg', 'Data contact berhasil dihapus!');
      res.redirect('/contact');
    });
});


// form ubah data contact
app.get('/contact/edit/:nama', async (req, res) => {
  const contact = await Contact.findOne({nama: req.params.nama});

  res.render('edit-contact', {
    title: 'Form Ubah Data Contact',
    layout: 'layouts/main-layout',
    contact,
  });
});



//route proses ubah data
app.put('/contact',
[
  body('nama').custom(async (value, {req}) =>{
    const duplikat = await Contact.findOne({ nama: value });
    if(value !== req.body.oldNama && duplikat) {
      throw new Error('Nama contact sudah digunakan!');
    }
    return true;
  }),
  check('email','Email tidak valid').isEmail(),
  check('nohp','No HP tidak valid').isMobilePhone('id-ID'),
 ],
  (req, res) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    res.render('edit-contact',{
    title: 'Form Ubah Data Contact',
    layout: 'layouts/main-layout',
    errors: errors.array(),
    contact: req.body,
    });
  } 
  else { 
    Contact.updateOne(
      { _id: req.body._id },
      {
        $set: {
          nama: req.body.nama,
          email: req.body.email,
          nohp: req.body.nohp,
        },
      }
     ).then((result) => {
      //kirimkan flash message
      req.flash('msg', 'Data contact berhasil diubah!');
      res.redirect('/contact');
     });    
  }
});




//route halaman detail memakai async await
app.get('/contact/:nama', async (req, res) => {
  const contact = await Contact.findOne({ nama: req.params.nama });

  res.render('detail', {
    layout: 'layouts/main-layout',
    title: 'Halaman Detail Contact',
      contact,
  });
  });

app.listen(port, () => {
    console.log(`MongoDB Contact App || listening at htpp://localhost:${port}`);
});