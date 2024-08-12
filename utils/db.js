const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/iwp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
}); //konfigurasi koneksi ke mongo db




// menambah 1 data
// const contact1 = new Contact({
//     nama: 'Tornando',
//     nohp: '08120000243',
//     email: 'tornando@gmail.com',
// });


//simpan ke collection
// contact1.save().then((contact) => console.log(contact));


