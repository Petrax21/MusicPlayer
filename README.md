# 🎵 Müzik Çalar - Modern Windows Müzik Uygulaması

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Platform: Windows](https://img.shields.io/badge/Platform-Windows-blue.svg)](https://www.microsoft.com/windows)
[![Electron](https://img.shields.io/badge/Electron-37.2.6-green.svg)](https://electronjs.org/)
[![Privacy: Local Only](https://img.shields.io/badge/Privacy-Local%20Only-brightgreen.svg)](https://github.com/yourusername/muzik-calar)

> **Mahremiyete önem veren, tamamen yerel çalışan, modern tasarımlı Windows müzik çalar uygulaması**

![Müzik Çalar Screenshot](https://via.placeholder.com/800x500/667eea/ffffff?text=Müzik+Çalar+Screenshot)

## 🌟 Özellikler

### 🎵 **Müzik Çalma**
- **Yerel dosya desteği**: MP3, M4A, WAV formatları
- **Akıllı playlist yönetimi**: Otomatik şarkı kategorilendirme
- **Gelişmiş kontroller**: Shuffle, repeat, volume kontrolü
- **Favori sistemi**: Sevdiğiniz şarkıları işaretleyin

### 🎨 **Modern Arayüz**
- **Spotify benzeri tasarım**: Kullanıcı dostu arayüz
- **Tema sistemi**: Açık, koyu ve özel tema seçenekleri
- **Animasyonlar**: Smooth geçişler ve görsel efektler
- **Responsive tasarım**: Kompakt masaüstü uygulaması

### 🔒 **Mahremiyet Odaklı**
- **%100 Yerel**: İnternet bağlantısı gerektirmez
- **Veri gizliliği**: Şarkılarınız sadece sizin bilgisayarınızda
- **Cloud yok**: Hiçbir veri buluta gönderilmez
- **Açık kaynak**: Kodunuzu inceleyebilirsiniz

### 💾 **Veri Yönetimi**
- **Otomatik kaydetme**: Şarkılar MusicList klasöründe saklanır
- **Kalıcı ayarlar**: Tema ve tercihleriniz korunur
- **Favori listesi**: Beğendiğiniz şarkılar kalıcı olarak saklanır
- **Playlist senkronizasyonu**: Uygulama yeniden başlatıldığında veriler korunur

## 🚀 Hızlı Başlangıç

### 📥 **İndirme**

#### **Release'den İndirme (Önerilen)**
1. [Releases](https://github.com/Petrax21/MusicPlayer/releases) sayfasına gidin
2. En son sürümü indirin: `Müzik Çalar-Portable.exe`
3. Dosyayı çalıştırın - kurulum gerektirmez!

#### **Manuel İndirme**
```bash
# Projeyi klonlayın
git clone https://github.com/Petrax21/MusicPlayer.git
cd muzik-calar

# Bağımlılıkları kurun
npm install

# Uygulamayı çalıştırın
npm start
```

### 🎯 **Kullanım**

1. **Uygulamayı açın** - `Müzik Çalar-Portable.exe`
2. **Müzik ekleyin** - "Müzik Ekle" butonuna tıklayın
3. **Şarkılarınızı seçin** - Otomatik olarak MusicList klasörüne kopyalanır
4. **Müziğinizi dinleyin** - Modern arayüzle keyfini çıkarın

## 🛠️ Geliştirme

### 📋 **Gereksinimler**
- [Node.js](https://nodejs.org/) (v16 veya üzeri)
- [npm](https://www.npmjs.com/) (Node.js ile birlikte gelir)
- Windows 10/11

### 🔧 **Kurulum**

```bash
# 1. Projeyi klonlayın
git clone https://github.com/Petrax21/MusicPlayer.git
cd muzik-calar

# 2. Bağımlılıkları kurun
npm install

# 3. Geliştirme modunda çalıştırın
npm start
```

### 🏗️ **Build İşlemi**

```bash
# Portable versiyon oluşturun
npm run build-clean

# Veya Windows installer
npm run build-win
```

Build sonrası `dist/` klasöründe şu dosyalar oluşur:
- `Müzik Çalar-Portable.exe` - Taşınabilir versiyon
- `win-unpacked/` - Geliştirici versiyonu

### 🎨 **Özelleştirme**

#### **Tema Değiştirme**
```css
/* styles.css dosyasında */
:root[data-theme="custom"] {
  --bg-primary: #your-color;
  --accent-primary: #your-accent;
}
```

#### **İkon Değiştirme**
1. `assets/icon.ico` dosyasını değiştirin (256x256 piksel)
2. `npm run build-clean` ile yeniden build yapın

## 📁 Proje Yapısı

```
muzik-calar/
├── assets/
│   └── icon.ico          # Uygulama ikonu
├── dist/                 # Build çıktıları
├── main.js              # Electron ana süreci
├── index.html           # Ana arayüz
├── styles.css           # Stil dosyası
├── renderer.js          # Arayüz mantığı
├── package.json         # Proje konfigürasyonu
└── README.md           # Bu dosya
```

## 🔒 Mahremiyet

### **Veri Gizliliği**
- ✅ **Yerel depolama**: Tüm veriler sadece sizin bilgisayarınızda
- ✅ **İnternet erişimi yok**: Hiçbir veri dışarı gönderilmez
- ✅ **Cloud entegrasyonu yok**: Üçüncü parti servisler kullanılmaz
- ✅ **Açık kaynak**: Kodunuzu inceleyebilir ve güvenliğini kontrol edebilirsiniz

### **Veri Konumları**
- **Şarkılar**: `Documents/MusicList/` klasörü
- **Ayarlar**: `localStorage` (tarayıcı veritabanı)
- **Favoriler**: Uygulama içinde saklanır

## 🤝 Katkıda Bulunma

### **Nasıl Katkıda Bulunabilirsiniz**

1. **Fork yapın** - Projeyi kendi hesabınıza kopyalayın
2. **Branch oluşturun** - Yeni özellik için branch açın
3. **Değişiklik yapın** - Kodunuzu yazın
4. **Test edin** - Çalıştığından emin olun
5. **Pull Request gönderin** - Değişikliklerinizi önerin

## 📱 Kısayol Tuşları

| Tuş | İşlev |
|-----|-------|
| `Space` | Oynat/Duraklat |
| `← →` | Önceki/Sonraki şarkı |
| `Ctrl + S` | Karıştırma aç/kapat |
| `Ctrl + R` | Tekrarlama modu değiştir |
| `Ctrl + T` | Tema değiştir |
| `Ctrl + P` | Çalma listesi aç/kapat |

## 🎯 Öneriler

1. **Müzik Dosyaları**: 
   - Yüksek kaliteli MP3 dosyaları kullanın (320kbps)
   - Dosya adlarında Türkçe karakter kullanmayın
   - Düzenli klasör yapısı oluşturun

2. **Performans**:
   - Çok fazla şarkı eklemeyin (100'den az)
   - Büyük dosyaları küçültün
   - Düzenli olarak favori olmayan şarkıları silin

3. **Yedekleme**:
   - Playlist'inizi düzenli olarak yedekleyin
   - Favori şarkılarınızı not edin
   - Önemli müzik dosyalarını güvenli yerde saklayın


### **Katkı Alanları**
- 🐛 **Hata düzeltmeleri**
- ✨ **Yeni özellikler**
- 📚 **Dokümantasyon**
- 🎨 **UI/UX iyileştirmeleri**
- 🔧 **Performans optimizasyonları**

## 📄 Lisans

Bu proje [MIT Lisansı](LICENSE) altında lisanslanmıştır.

```
MIT License

Copyright (c) 2024 Müzik Çalar

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 🙏 Teşekkürler

- [Electron](https://electronjs.org/) - Desktop uygulama framework'ü
- [Font Awesome](https://fontawesome.com/) - İkonlar
- [Spotify](https://spotify.com/) - Tasarım ilhamı

## 📞 İletişim

- **GitHub Issues**: [Hata bildirimi](https://github.com/yourusername/muzik-calar/issues)
- **GitHub Discussions**: [Sohbet](https://github.com/yourusername/muzik-calar/discussions)
- **Email**: your.email@example.com

## ⭐ Yıldız Verin

Bu projeyi beğendiyseniz, GitHub'da yıldız vermeyi unutmayın! ⭐

---

**🎵 Müziğinizi güvenle, güzellikle dinleyin!** 🎵
