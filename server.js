const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// ==========================================
// MONGODB ATLAS BAĞLANTISI
// ==========================================
// 1. ŞU AN AKTİF OLAN (Sizin sisteminiz):
const MONGO_URI = 'mongodb+srv://kerimcan:kerim.KE4@cluster0.bhwtbps.mongodb.net/emlakportali?retryWrites=true&w=majority';

/* 
   --------------------------------------------------------------------------
   MÜŞTERİ / BAŞKA BİR GELİŞTİRİCİ İÇİN BİLGİLENDİRME (YORUM SATIRI):
   --------------------------------------------------------------------------
   Eğer bu projeyi başka bir müşteriye verecekseniz, yukarıdaki satırı kapatıp 
   kendi MongoDB Atlas bağlantı adresinizi aşağıdaki formatta buraya yazmalısınız:
   
   const MONGO_URI = 'mongodb+srv://KULLANICI_ADINIZ:SIFRENIZ@cluster_adi.mongodb.net/veritabani_adi?retryWrites=true&w=majority';
*/

mongoose.connect(MONGO_URI)
    .then(() => console.log("MongoDB Atlas Emlak Veritabanı Bağlantısı Başarılı!"))
    .catch(err => console.error("Bağlantı hatası:", err));


// ==========================================
// 1. MODEL KATMANI (Mongoose Veri Şemaları)
// ==========================================
const ilanSchema = new mongoose.Schema({
    baslik: { type: String, required: true },
    fiyat: { type: Number, required: true },
    konum: { type: String, required: true },
    odaSayisi: { type: String, required: true },
    tip: { type: String, required: true }, // Satılık / Kiralık
    danisanAdi: { type: String, required: true },
    tarih: { type: Date, default: Date.now }
});
const IlanModel = mongoose.model('Ilan', ilanSchema);


// ==========================================
// 2. SERVICE & CONTROLLER KATMANI (OOP)
// ==========================================
class EmlakService {
    async ilanlariGetir() {
        return await IlanModel.find().sort({ tarih: -1 });
    }

    async ilanEkle(veri) {
        const yeniIlan = new IlanModel(veri);
        return await yeniIlan.save();
    }
}

const emlakService = new EmlakService();

class EmlakController {
    getIndex(req, res) {
        res.sendFile(path.join(__dirname, 'index.html'));
    }

    async getIlanlar(req, res) {
        try {
            const ilanlar = await emlakService.ilanlariGetir();
            res.json({ success: true, data: ilanlar });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    }

    async postIlan(req, res) {
        try {
            const sonuc = await emlakService.ilanEkle(req.body);
            res.json({ success: true, message: "İlan başarıyla veritabanına eklendi!", data: sonuc });
        } catch (err) {
            res.status(400).json({ success: false, error: err.message });
        }
    }
}

const emlakController = new EmlakController();


// ==========================================
// ROTALAR
// ==========================================
app.get('/', (req, res) => emlakController.getIndex(req, res));
app.get('/api/ilanlar', (req, res) => emlakController.getIlanlar(req, res));
app.post('/api/ilan-ekle', (req, res) => emlakController.postIlan(req, res));

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Emlak Web Sitesi Sunucusu ${PORT} portunda ayakta.`);
});
