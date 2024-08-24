const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
const port = 3000;

// Conexión a MongoDB
mongoose.connect('mongodb://localhost:27017/facturacion', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Conectado a MongoDB'))
    .catch(err => console.error('Error al conectar a MongoDB:', err));

// Definir esquema de datos
const datoSchema = new mongoose.Schema({
    nombre: String,
    apellido: String,
    documento: String,
    telefono: String,
    direccion: String,
    correo: String
});

const Dato = mongoose.model('Dato', datoSchema);

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Rutas CRUD
app.post('/api/datos', async (req, res) => {
    try {
        const nuevoDato = new Dato(req.body);
        await nuevoDato.save();
        res.status(201).json(nuevoDato);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/api/datos', async (req, res) => {
    try {
        const datos = await Dato.find();
        res.json(datos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.delete('/api/datos/:id', async (req, res) => {
    try {
        const dato = await Dato.findByIdAndDelete(req.params.id);
        if (!dato) return res.status(404).json({ message: 'Dato no encontrado' });
        res.json({ message: 'Dato eliminado' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Ruta para enviar la factura por correo
app.post('/api/enviar-factura', async (req, res) => {
    const { correo, pdfData, nombre, apellido } = req.body;

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'felipereinaleso96@gmail.com', 
            pass: 'kksg cklh cwmq ayuz'
        }
    });

    const mailOptions = {
        from: 'felipereinaleso96@gmail.com',
        to: correo,
        subject: 'Tu Factura',
        text: `Hola ${nombre} ${apellido}, adjunto a este correo encontrarás tu factura.`,
        attachments: [
            {
                filename: 'factura.pdf',
                content: pdfData.split("base64,")[1], 
                encoding: 'base64'
            }
        ]
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Factura enviada correctamente' });
    } catch (error) {
        console.error('Error al enviar el correo:', error);
        res.status(500).json({ message: 'Error al enviar la factura', error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
