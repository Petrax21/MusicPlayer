const { ipcRenderer } = require('electron');

// DOM Elements
const minimizeBtn = document.getElementById('minimizeBtn');
const closeBtn = document.getElementById('closeBtn');
const menuToggleBtn = document.getElementById('menuToggleBtn');
const sidebar = document.getElementById('sidebar');
const sidebarCloseBtn = document.getElementById('sidebarCloseBtn');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const playBtn = document.getElementById('playBtn');
const playIcon = document.getElementById('playIcon');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const shuffleBtn = document.getElementById('shuffleBtn');
const repeatBtn = document.getElementById('repeatBtn');
const audioPlayer = document.getElementById('audioPlayer');
const progressBar = document.getElementById('progressBar');
const progressFill = document.getElementById('progressFill');
const currentTimeEl = document.getElementById('currentTime');
const totalTimeEl = document.getElementById('totalTime');
const volumeBar = document.getElementById('volumeBar');
const volumeFill = document.getElementById('volumeFill');
const songTitle = document.getElementById('songTitle');
const artistName = document.getElementById('artistName');
const albumArt = document.getElementById('albumArt');
const sidebarPlaylistContainer = document.getElementById('sidebarPlaylistContainer');
const addSongSidebarBtn = document.getElementById('addSongSidebarBtn');
const openMusicFolderBtn = document.getElementById('openMusicFolderBtn');
const fileInput = document.getElementById('fileInput');
const playOverlay = document.getElementById('playOverlay');

// Settings Elements
const themeSelect = document.getElementById('themeSelect');
const customThemeSection = document.getElementById('customThemeSection');
const customThemeSection2 = document.getElementById('customThemeSection2');
const primaryColor = document.getElementById('primaryColor');
const accentColor = document.getElementById('accentColor');

// Player State
let currentSongIndex = 0;
let playlist = [];
let isPlaying = false;
let isShuffled = false;
let repeatMode = 'none'; // none, one, all
let originalPlaylist = [];
let currentTheme = 'light';
let favoriteSongs = [];
let isSidebarOpen = false;

// Theme Management
function setCustomTheme() {
    const html = document.documentElement;
    const primary = primaryColor.value;
    const accent = accentColor.value;
    
    // Convert hex to RGB for secondary colors
    const primaryRgb = hexToRgb(primary);
    const accentRgb = hexToRgb(accent);
    
    // Set custom CSS variables
    html.style.setProperty('--custom-primary', primary);
    html.style.setProperty('--custom-secondary', adjustBrightness(primary, -20));
    html.style.setProperty('--custom-accent', accent);
    html.style.setProperty('--custom-accent-secondary', adjustBrightness(accent, -20));
    html.style.setProperty('--custom-accent-tertiary', adjustBrightness(accent, -40));
    html.style.setProperty('--custom-accent-hover', adjustBrightness(accent, -30));
    html.style.setProperty('--custom-accent-secondary-hover', adjustBrightness(accent, -50));
    
    currentTheme = 'custom';
    html.setAttribute('data-theme', 'custom');
    themeSelect.value = 'custom';
    
    localStorage.setItem('theme', 'custom');
    localStorage.setItem('customPrimaryColor', primary);
    localStorage.setItem('customAccentColor', accent);
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function adjustBrightness(hex, percent) {
    const rgb = hexToRgb(hex);
    if (!rgb) return hex;
    
    const factor = 1 + percent / 100;
    const r = Math.min(255, Math.max(0, Math.round(rgb.r * factor)));
    const g = Math.min(255, Math.max(0, Math.round(rgb.g * factor)));
    const b = Math.min(255, Math.max(0, Math.round(rgb.b * factor)));
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    currentTheme = savedTheme;
    document.documentElement.setAttribute('data-theme', currentTheme);
    
    themeSelect.value = currentTheme;
    
    // Load custom theme colors if applicable
    if (currentTheme === 'custom') {
        const savedPrimary = localStorage.getItem('customPrimaryColor') || '#667eea';
        const savedAccent = localStorage.getItem('customAccentColor') || '#ff6b6b';
        primaryColor.value = savedPrimary;
        accentColor.value = savedAccent;
        setCustomTheme();
    }
}

// Sidebar Management
function toggleSidebar() {
    isSidebarOpen = !isSidebarOpen;
    
    if (isSidebarOpen) {
        sidebar.classList.add('open');
        sidebarOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    } else {
        sidebar.classList.remove('open');
        sidebarOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function closeSidebar() {
    isSidebarOpen = false;
    sidebar.classList.remove('open');
    sidebarOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

// Playlist Persistence
function savePlaylist() {
    const playlistData = playlist.map(song => ({
        title: song.title,
        artist: song.artist,
        duration: song.duration,
        url: song.url,
        path: song.path,
        isFavorite: song.isFavorite || false
    }));
    localStorage.setItem('playlist', JSON.stringify(playlistData));
    localStorage.setItem('currentSongIndex', currentSongIndex.toString());
}

function loadPlaylist() {
    try {
        const savedPlaylist = localStorage.getItem('playlist');
        const savedIndex = localStorage.getItem('currentSongIndex');
        
        if (savedPlaylist) {
            playlist = JSON.parse(savedPlaylist);
            currentSongIndex = savedIndex ? parseInt(savedIndex) : 0;
            
            // Update playlist display
            updateSidebarPlaylist();
            
            // Load current song if exists
            if (playlist.length > 0) {
                loadAndPlaySong();
            }
            
            showNotification(`${playlist.length} şarkı yüklendi`, 'success');
        }
    } catch (error) {
        console.error('Playlist yükleme hatası:', error);
        showNotification('Playlist yüklenirken hata oluştu', 'error');
    }
}

function toggleFavorite(songIndex) {
    if (playlist[songIndex]) {
        playlist[songIndex].isFavorite = !playlist[songIndex].isFavorite;
        savePlaylist();
        updateSidebarPlaylist();
        
        const status = playlist[songIndex].isFavorite ? 'favorilere eklendi' : 'favorilerden çıkarıldı';
        showNotification(`${playlist[songIndex].title} ${status}`, 'success');
    }
}

function removeSong(songIndex) {
    if (playlist[songIndex]) {
        const songTitle = playlist[songIndex].title;
        
        // Remove from playlist
        playlist.splice(songIndex, 1);
        
        // Adjust current song index if necessary
        if (songIndex < currentSongIndex) {
            currentSongIndex--;
        } else if (songIndex === currentSongIndex) {
            // If we removed the current song, play the next one or stop
            if (playlist.length > 0) {
                currentSongIndex = Math.min(currentSongIndex, playlist.length - 1);
                loadAndPlaySong();
            } else {
                // No songs left
                currentSongIndex = 0;
                isPlaying = false;
                playIcon.className = 'fas fa-play';
                playOverlay.innerHTML = '<i class="fas fa-play"></i>';
                songTitle.textContent = 'Şarkı Adı';
                artistName.textContent = 'Sanatçı';
                audioPlayer.src = '';
            }
        }
        
        savePlaylist();
        updateSidebarPlaylist();
        
        showNotification(`${songTitle} çalma listesinden kaldırıldı`, 'success');
    }
}

// Window Controls
minimizeBtn.addEventListener('click', () => {
    ipcRenderer.send('minimize-window');
});

closeBtn.addEventListener('click', () => {
    ipcRenderer.send('close-window');
});

menuToggleBtn.addEventListener('click', toggleSidebar);
sidebarCloseBtn.addEventListener('click', closeSidebar);
sidebarOverlay.addEventListener('click', closeSidebar);

// Settings Event Listeners
themeSelect.addEventListener('change', (e) => {
    const selectedTheme = e.target.value;
    
    if (selectedTheme === 'custom') {
        customThemeSection.style.display = 'block';
        customThemeSection2.style.display = 'block';
        setCustomTheme();
    } else {
        customThemeSection.style.display = 'none';
        customThemeSection2.style.display = 'none';
        
        currentTheme = selectedTheme;
        document.documentElement.setAttribute('data-theme', selectedTheme);
        localStorage.setItem('theme', selectedTheme);
    }
});

primaryColor.addEventListener('change', setCustomTheme);
accentColor.addEventListener('change', setCustomTheme);

// Volume control from main interface
volumeBar.addEventListener('click', (e) => {
    const rect = volumeBar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audioPlayer.volume = percent;
    volumeFill.style.width = `${percent * 100}%`;
    localStorage.setItem('volume', (percent * 100).toString());
});

// Folder opening functionality
openMusicFolderBtn.addEventListener('click', async () => {
    try {
        const result = await ipcRenderer.invoke('open-music-folder');
        if (result.success) {
            showNotification('Müzik klasörü açıldı', 'success');
        } else {
            showNotification('Klasör açılırken hata oluştu', 'error');
        }
    } catch (error) {
        console.error('Error opening folder:', error);
        showNotification('Klasör açılırken hata oluştu', 'error');
    }
});

// Audio Player Event Listeners
audioPlayer.addEventListener('loadedmetadata', () => {
    if (audioPlayer.duration && !isNaN(audioPlayer.duration)) {
        totalTimeEl.textContent = formatTime(audioPlayer.duration);
    }
});

audioPlayer.addEventListener('timeupdate', () => {
    if (audioPlayer.duration && !isNaN(audioPlayer.duration)) {
        const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        progressFill.style.width = `${progress}%`;
        currentTimeEl.textContent = formatTime(audioPlayer.currentTime);
    }
});

audioPlayer.addEventListener('ended', () => {
    handleSongEnd();
});

audioPlayer.addEventListener('play', () => {
    isPlaying = true;
    playIcon.className = 'fas fa-pause';
    playOverlay.innerHTML = '<i class="fas fa-pause"></i>';
});

audioPlayer.addEventListener('pause', () => {
    isPlaying = false;
    playIcon.className = 'fas fa-play';
    playOverlay.innerHTML = '<i class="fas fa-play"></i>';
});

audioPlayer.addEventListener('error', (e) => {
    console.error('Audio error:', e);
    showNotification('Müzik dosyası yüklenirken hata oluştu. Dosya formatını kontrol edin.', 'error');
});

audioPlayer.addEventListener('loadstart', () => {
    showNotification('Müzik yükleniyor...', 'info');
});

audioPlayer.addEventListener('canplay', () => {
    hideNotification();
});

audioPlayer.addEventListener('canplaythrough', () => {
    hideNotification();
});

// Control Button Event Listeners
playBtn.addEventListener('click', togglePlay);
playOverlay.addEventListener('click', togglePlay);
prevBtn.addEventListener('click', playPrevious);
nextBtn.addEventListener('click', playNext);
shuffleBtn.addEventListener('click', toggleShuffle);
repeatBtn.addEventListener('click', toggleRepeat);
addSongSidebarBtn.addEventListener('click', async () => {
    try {
        const copiedFiles = await ipcRenderer.invoke('select-music-files');
        
        if (copiedFiles.length === 0) {
            showNotification('Müzik dosyası seçilmedi', 'warning');
            return;
        }
        
        let addedCount = 0;
        for (const file of copiedFiles) {
            // Check if song already exists in playlist
            const songExists = playlist.some(song => song.path === file.copiedPath);
            
            if (!songExists) {
                const song = {
                    title: file.fileName.replace(/\.[^/.]+$/, ""),
                    artist: 'Bilinmeyen Sanatçı',
                    duration: '0:00',
                    url: `file://${file.copiedPath}`,
                    path: file.copiedPath,
                    isFavorite: false
                };
                
                playlist.push(song);
                addedCount++;
            }
        }
        
        if (addedCount > 0) {
            // Only load and play if this is the first song added
            if (playlist.length === addedCount) {
                loadAndPlaySong();
            }
            
            updateSidebarPlaylist();
            savePlaylist();
            showNotification(`${addedCount} şarkı eklendi ve MusicList klasörüne kaydedildi`, 'success');
        } else {
            showNotification('Tüm şarkılar zaten çalma listesinde mevcut', 'info');
        }
        
    } catch (error) {
        console.error('Error adding songs from sidebar:', error);
        showNotification('Müzik eklenirken hata oluştu', 'error');
    }
});

// Progress Bar
progressBar.addEventListener('click', (e) => {
    if (audioPlayer.duration && !isNaN(audioPlayer.duration)) {
        const rect = progressBar.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        audioPlayer.currentTime = percent * audioPlayer.duration;
    }
});

// File Input
fileInput.addEventListener('change', async (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
        await addSongsToPlaylist(files);
    }
    // Clear the file input to allow selecting the same file again
    e.target.value = '';
});

// Functions
function togglePlay() {
    if (playlist.length === 0) {
        showNotification('Lütfen önce müzik dosyası ekleyin', 'warning');
        return;
    }
    
    if (isPlaying) {
        audioPlayer.pause();
    } else {
        const playPromise = audioPlayer.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.error('Play error:', error);
                showNotification('Müzik çalınırken hata oluştu. Dosya formatını kontrol edin.', 'error');
            });
        }
    }
}

function playPrevious() {
    if (playlist.length === 0) return;
    
    currentSongIndex = (currentSongIndex - 1 + playlist.length) % playlist.length;
    loadAndPlaySong();
}

function playNext() {
    if (playlist.length === 0) return;
    
    currentSongIndex = (currentSongIndex + 1) % playlist.length;
    loadAndPlaySong();
}

function toggleShuffle() {
    isShuffled = !isShuffled;
    shuffleBtn.style.background = isShuffled ? 'var(--play-gradient)' : 'var(--bg-secondary)';
    
    if (isShuffled) {
        originalPlaylist = [...playlist];
        shuffleArray(playlist);
        showNotification('Karıştırma açık', 'success');
    } else {
        playlist = [...originalPlaylist];
        currentSongIndex = originalPlaylist.findIndex(song => song === playlist[currentSongIndex]);
        showNotification('Karıştırma kapalı', 'info');
    }
    
    updateSidebarPlaylist();
}

function toggleRepeat() {
    switch (repeatMode) {
        case 'none':
            repeatMode = 'one';
            repeatBtn.style.background = 'var(--play-gradient)';
            showNotification('Tek şarkı tekrarı', 'success');
            break;
        case 'one':
            repeatMode = 'all';
            repeatBtn.style.background = 'var(--add-gradient)';
            showNotification('Tüm liste tekrarı', 'success');
            break;
        case 'all':
            repeatMode = 'none';
            repeatBtn.style.background = 'var(--bg-secondary)';
            showNotification('Tekrar kapalı', 'info');
            break;
    }
}

function handleSongEnd() {
    switch (repeatMode) {
        case 'one':
            audioPlayer.currentTime = 0;
            const playPromise = audioPlayer.play();
            if (playPromise !== undefined) {
                playPromise.catch(console.error);
            }
            break;
        case 'all':
            playNext();
            break;
        default:
            if (currentSongIndex < playlist.length - 1) {
                playNext();
            } else {
                isPlaying = false;
                playIcon.className = 'fas fa-play';
                playOverlay.innerHTML = '<i class="fas fa-play"></i>';
                showNotification('Playlist bitti', 'info');
            }
            break;
    }
}

function loadAndPlaySong() {
    if (playlist.length === 0) return;
    
    const song = playlist[currentSongIndex];
    
    try {
        // Update song info
        songTitle.textContent = truncateTitle(song.title);
        artistName.textContent = song.artist;
        
        // Load and play audio
        audioPlayer.src = song.url;
        audioPlayer.load();
        
        // Update album art with gradient based on song
        const hue = (currentSongIndex * 137.5) % 360;
        albumArt.style.background = `linear-gradient(45deg, hsl(${hue}, 70%, 60%), hsl(${hue + 60}, 70%, 50%))`;
        
        // Update sidebar playlist
        updateSidebarPlaylist();
        savePlaylist();
        
        if (isPlaying) {
            const playPromise = audioPlayer.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.error('Play error:', error);
                    showNotification('Müzik çalınırken hata oluştu. Dosya formatını kontrol edin.', 'error');
                });
            }
        }
    } catch (error) {
        console.error('Song loading error:', error);
        showNotification('Şarkı yüklenirken hata oluştu', 'error');
    }
}

// Update play button state
function updatePlayButton() {
    if (isPlaying) {
        playBtn.innerHTML = '<i class="fas fa-pause"></i>';
        playBtn.title = 'Duraklat';
    } else {
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
        playBtn.title = 'Oynat';
    }
}

// Update progress bar
function updateProgressBar() {
    if (audioPlayer.duration) {
        const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        progressFill.style.width = `${progress}%`;
        
        // Update time display
        currentTimeEl.textContent = formatTime(audioPlayer.currentTime);
        totalTimeEl.textContent = formatTime(audioPlayer.duration);
    }
}

async function addSongsToPlaylist(files) {
    try {
        // Use Electron's file dialog to copy files to MusicList folder
        const copiedFiles = await ipcRenderer.invoke('select-music-files');
        
        if (copiedFiles.length === 0) {
            showNotification('Müzik dosyası seçilmedi', 'warning');
            return;
        }
        
        let addedCount = 0;
        for (const file of copiedFiles) {
            // Check if song already exists in playlist
            const songExists = playlist.some(song => song.path === file.copiedPath);
            
            if (!songExists) {
                const song = {
                    title: file.fileName.replace(/\.[^/.]+$/, ""),
                    artist: 'Bilinmeyen Sanatçı',
                    duration: '0:00',
                    url: `file://${file.copiedPath}`,
                    path: file.copiedPath,
                    isFavorite: false
                };
                
                playlist.push(song);
                addedCount++;
            }
        }
        
        if (addedCount > 0) {
            // Only load and play if this is the first song added
            if (playlist.length === addedCount) {
                loadAndPlaySong();
            }
            
            updateSidebarPlaylist();
            savePlaylist();
            showNotification(`${addedCount} şarkı eklendi ve MusicList klasörüne kaydedildi`, 'success');
        } else {
            showNotification('Tüm şarkılar zaten çalma listesinde mevcut', 'info');
        }
        
    } catch (error) {
        console.error('Error adding songs:', error);
        showNotification('Müzik eklenirken hata oluştu', 'error');
    }
}

// Load existing songs from MusicList folder on app start
async function loadExistingSongs() {
    try {
        const musicFiles = await ipcRenderer.invoke('get-music-files');
        
        if (musicFiles.length > 0) {
            // Don't clear existing playlist, just add new songs
            let addedCount = 0;
            
            for (const file of musicFiles) {
                // Check if song already exists in playlist
                const songExists = playlist.some(song => song.path === file.path);
                
                if (!songExists) {
                    const song = {
                        title: file.fileName.replace(/\.[^/.]+$/, ""),
                        artist: 'Bilinmeyen Sanatçı',
                        duration: '0:00',
                        url: `file://${file.path}`,
                        path: file.path,
                        isFavorite: false
                    };
                    
                    playlist.push(song);
                    addedCount++;
                }
            }
            
            // Only load and play first song if playlist was empty before
            if (playlist.length === addedCount && playlist.length > 0) {
                currentSongIndex = 0;
                loadAndPlaySong();
            }
            
            updateSidebarPlaylist();
            savePlaylist();
            
            if (addedCount > 0) {
                showNotification(`${addedCount} yeni şarkı MusicList klasöründen yüklendi`, 'success');
            }
        }
    } catch (error) {
        console.error('Error loading existing songs:', error);
        showNotification('Mevcut şarkılar yüklenirken hata oluştu', 'error');
    }
}

// Truncate song title to 20 characters
function truncateTitle(title) {
    if (title.length <= 25) {
        return title;
    }
    return title.substring(0, 17) + '...';
}

// Update sidebar playlist display with truncated titles
function updateSidebarPlaylist() {
    const container = document.getElementById('sidebarPlaylistContainer');
    container.innerHTML = '';
    
    playlist.forEach((song, index) => {
        const songItem = document.createElement('div');
        songItem.className = 'sidebar-playlist-item';
        if (index === currentSongIndex) {
            songItem.classList.add('active');
        }
        
        songItem.innerHTML = `
            <div class="song-info">
                <div class="song-title">${truncateTitle(song.title)}</div>
                <div class="song-artist">${song.artist}</div>
            </div>
            <div class="song-controls">
                <button class="sidebar-favorite-btn ${song.isFavorite ? 'favorited' : ''}" 
                        onclick="toggleFavorite(${index})" title="${song.isFavorite ? 'Favorilerden çıkar' : 'Favorilere ekle'}">
                    <i class="fas fa-heart"></i>
                </button>
                <button class="sidebar-remove-btn" onclick="removeSong(${index})" title="Şarkıyı kaldır">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        songItem.addEventListener('click', () => {
            currentSongIndex = index;
            loadAndPlaySong();
            updateSidebarPlaylist();
        });
        
        container.appendChild(songItem);
    });
}

function formatTime(seconds) {
    if (isNaN(seconds) || seconds === Infinity || seconds === 0) return '0:00';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Notification System
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas ${getNotificationIcon(type)}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

function hideNotification() {
    const notification = document.querySelector('.notification');
    if (notification) {
        notification.remove();
    }
}

function getNotificationIcon(type) {
    switch (type) {
        case 'success': return 'fa-check-circle';
        case 'error': return 'fa-exclamation-circle';
        case 'warning': return 'fa-exclamation-triangle';
        default: return 'fa-info-circle';
    }
}

// Keyboard Shortcuts
document.addEventListener('keydown', (e) => {
    switch (e.code) {
        case 'Space':
            e.preventDefault();
            togglePlay();
            break;
        case 'ArrowLeft':
            e.preventDefault();
            playPrevious();
            break;
        case 'ArrowRight':
            e.preventDefault();
            playNext();
            break;
        case 'KeyS':
            if (e.ctrlKey) {
                e.preventDefault();
                toggleShuffle();
            }
            break;
        case 'KeyR':
            if (e.ctrlKey) {
                e.preventDefault();
                toggleRepeat();
            }
            break;
        case 'KeyM':
            if (e.ctrlKey) {
                e.preventDefault();
                toggleSidebar();
            }
            break;
    }
});

// Drag and Drop Support
document.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
});

document.addEventListener('drop', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
        file.type.startsWith('audio/') ||
        file.name.toLowerCase().endsWith('.mp3') ||
        file.name.toLowerCase().endsWith('.wav') ||
        file.name.toLowerCase().endsWith('.flac') ||
        file.name.toLowerCase().endsWith('.aac') ||
        file.name.toLowerCase().endsWith('.ogg') ||
        file.name.toLowerCase().endsWith('.m4a')
    );
    
    if (files.length > 0) {
        await addSongsToPlaylist(files);
    } else {
        showNotification('Lütfen geçerli müzik dosyaları sürükleyin (MP3, WAV, FLAC, AAC, OGG, M4A)', 'warning');
    }
});

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
    // Load theme
    loadTheme();
    
    // Load playlist from localStorage first
    loadPlaylist();
    
    // Then load existing songs from MusicList folder (will preserve existing songs)
    await loadExistingSongs();
    
    // Set initial volume
    const savedVolume = localStorage.getItem('volume') || '50';
    audioPlayer.volume = savedVolume / 100;
    volumeFill.style.width = savedVolume + '%';
    
    // Add notification styles
    const notificationStyles = document.createElement('style');
    notificationStyles.textContent = `
        .notification {
            position: fixed;
            top: 70px;
            right: 20px;
            background: var(--bg-tertiary);
            color: var(--text-primary);
            padding: 12px 20px;
            border-radius: 10px;
            backdrop-filter: blur(15px);
            box-shadow: 0 8px 32px var(--shadow-color);
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 1000;
            animation: slideInRight 0.3s ease;
            border: 1px solid var(--border-color);
        }
        
        .notification-success {
            border-left: 4px solid #4ecdc4;
        }
        
        .notification-error {
            border-left: 4px solid #ff6b6b;
        }
        
        .notification-warning {
            border-left: 4px solid #ffa726;
        }
        
        .notification-info {
            border-left: 4px solid #42a5f5;
        }
        
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        .notification i {
            font-size: 16px;
        }
    `;
    document.head.appendChild(notificationStyles);
    
    showNotification('Müzik çalar hazır! Menü butonuna tıklayarak ayarları açın', 'success');
});

// Visual Effects
function addVisualEffects() {
    // Add ripple effect to buttons
    document.querySelectorAll('.control-btn, .title-bar-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
}

// Add ripple effect CSS
const style = document.createElement('style');
style.textContent = `
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .control-btn, .title-bar-btn {
        position: relative;
        overflow: hidden;
    }
`;
document.head.appendChild(style);

// Initialize visual effects
addVisualEffects();
