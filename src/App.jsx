import React, { useState, useEffect, useRef } from 'react';
import { Star, Film, Save, Award, Clapperboard, Search, Loader2, Globe, User, LogIn, LogOut, X, TrendingUp, Edit3, HelpCircle, Users, Info, Settings, Flame, Play, Crown, Ticket, Medal, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Lock, Rocket, Smile, Bookmark, BookmarkCheck, ListFilter, Plus, Share2, ListPlus, CheckCircle2, Quote, Sparkles, PieChart, Trophy, UserPlus, UserMinus, Link, Bell, Palette } from 'lucide-react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, sendEmailVerification } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, onSnapshot, runTransaction, query, orderBy, deleteDoc, limit } from 'firebase/firestore';

// --------------------------------------------------------
// 1. FIREBASE VE API AYARLARI
// --------------------------------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyCjASxcmWacdtLTlxvOkFwhD1u7qE85NKM",
  authDomain: "cinescore-d0f2c.firebaseapp.com",
  projectId: "cinescore-d0f2c",
  storageBucket: "cinescore-d0f2c.firebasestorage.app",
  messagingSenderId: "852438742744",
  appId: "1:852438742744:web:6bd8706a641023769e49ad"
};

let app;
try { app = getApp(); } catch (e) { app = initializeApp(firebaseConfig); }

const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();
const TMDB_API_KEY = 'c46f8dec150252c1e8339d0e8f59d8c9'; 

// --------------------------------------------------------
// 2. DİL DESTEĞİ
// --------------------------------------------------------
const LANGUAGES = [
  { code: 'tr', tmdbCode: 'tr-TR', flag: 'TR', label: 'Türkçe' },
  { code: 'en', tmdbCode: 'en-US', flag: 'EN', label: 'English' },
  { code: 'de', tmdbCode: 'de-DE', flag: 'DE', label: 'Deutsch' },
  { code: 'it', tmdbCode: 'it-IT', flag: 'IT', label: 'Italiano' },
  { code: 'fr', tmdbCode: 'fr-FR', flag: 'FR', label: 'Français' },
];

const TRANSLATIONS = {
  tr: {
    home: 'Ana Sayfa', ranking: 'Sıralama', community: 'Topluluk', login: 'Giriş Yap', logout: 'Çıkış Yap',
    trending: 'Şu An Popüler', topRated: 'Kült Başyapıtlar', featured: 'Haftanın Öne Çıkanları',
    searchPlaceholder: 'Film ara...', searchUsers: 'Sadece @kod ile arayın...', director: 'Yönetmen', cast: 'Oyuncular', summary: 'Özet', watchTrailer: 'Fragmanı İzle',
    saveRating: 'Puanı Kaydet', updateRating: 'Puanımı Güncelle', criteria: 'İnceleme Kriterleri', yourScore: 'Puanın', globalRanking: 'Dünya Geneli Sıralama', 
    noRating: 'Henüz film puanlanmadı.', ratedFilmsLabel: 'Oylanan Film', yourAvg: 'Ortalama', nextLevel: 'Sonraki Seviye',
    globalScoreLabel: 'Genel', yourScoreLabel: 'Senin Oyun', myRatings: 'Verdiğim Puanlar', editProfile: 'Profili Düzenle', rateNow: 'Puanla',
    voteCount: 'Oy', average: 'Ort.', badges: 'Kazanılan Rozetler', communityAvg: 'Topluluk Ortalaması',
    actionPacked: 'Aksiyon Dolu', emotionalDramas: 'Duygusal Dramalar', turkishCinema: 'Yerli Başyapıtlar', sciFi: 'Bilim Kurgu & Fantastik', comedy: 'Komedi',
    c1: 'Senaryo', c1Desc: 'Olay örgüsü, diyaloglar ve hikayenin özgünlüğü.', c2: 'Oyunculuk', c2Desc: 'Aktörlerin karakterleri inandırıcı oynaması.',
    c3: 'Sinematografi', c3Desc: 'Kamera açıları, ışık ve görsel kompozisyon.', c4: 'Ses & Müzik', c4Desc: 'Filmin atmosferini güçlendiren müzikler.',
    c5: 'Kurgu & Akış', c5Desc: 'Sahneler arası geçişler ve filmin temposu.',
    globalDesc: 'Tüm topluluğun kararlarıyla oluşan dev sinema arşivi.', registeredMovies: 'Oylanan Filmler',
    username: 'Kullanıcı Adı', selectAvatar: 'Avatar Seç', saveChanges: 'Kaydet', noBadges: 'Rozet kazanmak için film puanla!',
    b1Name: 'Mısır Yiyici', b1Desc: 'İlk filmini puanladın!', b2Name: 'Sinemasever', b2Desc: '10 Film barajını geçtin.', b3Name: 'Sinefil', b3Desc: '50 Film! Gerçek bir eleştirmen.', b4Name: 'Altın Bilet', b4Desc: '100 Film Kulübü üyesi.', b5Name: 'Usta Yönetmen', b5Desc: '250 Film. Sinema senin hayatın.', b6Name: 'Sinema Tanrısı', b6Desc: '500+ Film. Sen bir efsanesin!',
    loginOr: 'VEYA', registerBtn: 'Kayıt Ol', namePlaceholder: 'İsim', emailPlaceholder: 'E-posta', passPlaceholder: 'Şifre',
    navShowcase: 'VİTRİN', navList: 'LİSTE', navProfile: 'PROFİL', noData: 'Veri yok.',
    watchlist: 'İzleme Listem', addToWatchlist: 'Listeye Ekle', removeFromWatchlist: 'Listeden Çıkar', profileGeneral: 'Genel Bakış', 
    myRatedMovies: 'Oyladığım Filmler', sortBy: 'Sırala:', sortDate: 'En Yeni', sortMyScore: 'Puanım (Yüksek)', sortGlobalScore: 'Dünya Geneli Puan', emptyWatchlist: 'İzleme listesi henüz boş.',
    footerDesc: 'Dünya geneli sinema arşivi ve topluluk tabanlı derecelendirme platformu.', contactLabel: 'İletişim & Reklam İşbirlikleri:', rights: 'CineScore. Tüm hakları saklıdır.',
    cinematicDNA: 'Kritik Odak Analizi', dnaDesc: 'Puanlama anomalilerine göre sinemada asla affetmediğin ve en çok aradığın detaylar.',
    customLists: 'Özel Listeler', createNewList: 'Yeni Liste Oluştur', listNamePlaceholder: 'Örn: Başyapıtlarım...', add: 'Ekle', share: 'Paylaş', copied: 'Bağlantı Kopyalandı!', selectList: 'Listeye Ekle', addedToList: 'Listeye eklendi!',
    addCustomListHover: 'Özel Listeye Ekle', addWatchlistHover: 'İzleme Listesine Ekle', removeWatchlistHover: 'İzleme Listesinden Çıkar',
    autoRemoveSetting: 'Puanlananları Listeden Kaldır', autoRemoveDesc: 'Bir filme puan verdiğinde o film otomatik olarak İzleme Listesinden silinir.',
    listCreated: 'Liste başarıyla oluşturuldu!', errorOccurred: 'Bir hata oluştu!', 
    bioLabel: 'Sinema Mottosu (Bio)', bioPlaceholder: 'Örn: May the force be with you...', selectBanner: 'Profil Arka Planı (Banner)',
    cineZodiac: 'Sinema Burcu', cineZodiacDesc: 'Eleştirel yapıya göre profillendirme.', topGenres: 'Favori Türler', viewAll: 'Tümünü Gör',
    zodiacC1: 'Acımasız Hikaye Avcısı', zodiacC2: 'Karakter Analisti', zodiacC3: 'Görsel Estet', zodiacC4: 'Odyofil', zodiacC5: 'Ritim Ustası', zodiacDefault: 'Yeni Başlayan',
    zC1Desc: 'Senaryo açıklarına tahammülün yok. Hikaye zayıfsa, film biter.', zC2Desc: 'Oyunculuklardaki yapmacıklığı affetmiyorsun.', zC3Desc: 'Kötü çekilmiş, ışıksız bir filme katlanamazsın.', zC4Desc: 'Atmosferi ve müzikleri iliklerine kadar hissetmelisin.', zC5Desc: 'Sahneler arası geçişler ve kurgu hileleri senin için en kritik detay.',
    top3Title: 'Kutsal Üçlü', top3Desc: 'Hayatına dokunan ve başyapıt olarak görülen en iyi 3 film.', selectTop3Search: 'Vitrinin İçin Film Ara...',
    verifyEmailSent: 'Kayıt başarılı! Lütfen e-posta adresinize gönderilen doğrulama linkine tıklayın.', emailNotVerifiedError: 'E-posta adresiniz henüz doğrulanmamış. Lütfen gelen kutunuzu kontrol edin.',
    followers: 'Takipçi', following: 'Takip Edilen', follow: 'Takip Et', unfollow: 'Takipten Çık', shareProfile: 'Profili Paylaş', userCodeCopied: 'Kullanıcı kodu kopyalandı!',
    communityPrivacyTitle: 'Gizli Topluluk', communityPrivacyDesc: 'Gizlilik gereği kullanıcılar açıkça listelenmez. Arkadaşınızı bulmak için 6 haneli @kodunu tam olarak yazın.',
    mostVoted: 'En Çok Oylananlar', exactCodeRequired: 'Tam @kodunu yazarak arayın...', followingTab: 'Takip Ettiklerim', followersTab: 'Takipçilerim', theirScore: 'Onun Oyu', theirRatedMovies: 'Oyladığı Filmler',
    tasteMatch: 'Film Zevki Uyumu', matchCalculating: 'Hesaplanıyor...', dnaLockedTitle: 'DNA Analizi Kilitli', dnaLockedDesc: 'film daha oylaman gerekiyor. 20 filme ulaştığında zıt orantı analizin açılacak.', dnaLockedDescPublic: 'Bu kullanıcının analiz için yeterli oyu yok.',
    notifications: 'Bildirimler', noNotifications: 'Henüz bildirim yok.', startedFollowing: 'seni takip etmeye başladı.',
    auraColor: 'Aura Rengi (Tema)', friendsWatched: 'Arkadaşlarından İzleyenler'
  },
  en: {
    home: 'Home', ranking: 'Ranking', community: 'Community', login: 'Login', logout: 'Log Out',
    trending: 'Trending Now', topRated: 'Cult Classics', featured: 'Featured This Week',
    searchPlaceholder: 'Search movies...', searchUsers: 'Search only by @code...', director: 'Director', cast: 'Cast', summary: 'Plot', watchTrailer: 'Watch Trailer',
    saveRating: 'Save Rating', updateRating: 'Update Rating', criteria: 'Review Criteria', yourScore: 'Your Score', globalRanking: 'Global Ranking', 
    noRating: 'No movies rated yet.', ratedFilmsLabel: 'Rated Movies', yourAvg: 'Average', nextLevel: 'Next Level',
    globalScoreLabel: 'Global', yourScoreLabel: 'Your Score', myRatings: 'Ratings', editProfile: 'Edit Profile', rateNow: 'Rate',
    voteCount: 'Votes', average: 'Avg', badges: 'Earned Badges', communityAvg: 'Community Average',
    actionPacked: 'Action Packed', emotionalDramas: 'Emotional Dramas', turkishCinema: 'Turkish Masterpieces', sciFi: 'Sci-Fi & Fantasy', comedy: 'Comedy',
    c1: 'Screenplay', c1Desc: 'Plot, dialogue, and story originality.', c2: 'Acting', c2Desc: 'How believable and engaging the actors are.',
    c3: 'Cinematography', c3Desc: 'Camera angles, lighting, and visual composition.', c4: 'Sound & Music', c4Desc: 'Music and sound effects that enhance atmosphere.',
    c5: 'Editing & Pacing', c5Desc: 'Scene transitions and the tempo of the film.',
    globalDesc: 'The massive cinema archive built by community choices.', registeredMovies: 'Rated Movies',
    username: 'Username', selectAvatar: 'Select Avatar', saveChanges: 'Save', noBadges: 'Start rating movies to earn badges!',
    b1Name: 'Popcorn Eater', b1Desc: 'Rated your first movie!', b2Name: 'Moviegoer', b2Desc: 'Passed the 10 movie mark.', b3Name: 'Cinephile', b3Desc: '50 Movies! A true critic.', b4Name: 'Golden Ticket', b4Desc: 'Member of the 100 Movie Club.', b5Name: 'Master Director', b5Desc: '250 Movies.', b6Name: 'Cinema God', b6Desc: '500+ Movies!',
    loginOr: 'OR', registerBtn: 'Register', namePlaceholder: 'Name', emailPlaceholder: 'Email', passPlaceholder: 'Password',
    navShowcase: 'SHOWCASE', navList: 'LIST', navProfile: 'PROFILE', noData: 'No data.',
    watchlist: 'Watchlist', addToWatchlist: 'Add to Watchlist', removeFromWatchlist: 'Remove from Watchlist', profileGeneral: 'Overview', 
    sortBy: 'Sort By:', sortDate: 'Newest', sortMyScore: 'My Score', sortGlobalScore: 'Global Score', emptyWatchlist: 'Watchlist is empty.',
    cinematicDNA: 'Critical Focus Analysis', dnaDesc: 'The cinematic flaws never forgiven, based on rating anomalies.',
    customLists: 'Custom Lists', createNewList: 'Create New List', listNamePlaceholder: 'e.g., Masterpieces...', add: 'Add', share: 'Share', copied: 'Link Copied!', selectList: 'Add to List', addedToList: 'Added to list!',
    addCustomListHover: 'Add to Custom List', addWatchlistHover: 'Add to Watchlist', removeWatchlistHover: 'Remove from Watchlist',
    autoRemoveSetting: 'Auto-Remove from Watchlist', autoRemoveDesc: 'When you rate a movie, it will be automatically removed from your Watchlist.',
    listCreated: 'List successfully created!', errorOccurred: 'An error occurred!',
    bioLabel: 'Cinema Motto (Bio)', bioPlaceholder: 'e.g., May the force be with you...', selectBanner: 'Profile Banner',
    cineZodiac: 'Cine-Zodiac', cineZodiacDesc: 'Profile based on critical habits.', topGenres: 'Favorite Genres', viewAll: 'View All',
    zodiacC1: 'Ruthless Story Hunter', zodiacC2: 'Character Analyst', zodiacC3: 'Visual Aesthete', zodiacC4: 'Audiophile', zodiacC5: 'Rhythm Master', zodiacDefault: 'Beginner',
    zC1Desc: 'No tolerance for plot holes. If the story is weak, the movie is dead to you.',
    zC2Desc: 'You don\'t forgive fake acting. Genuine emotion is everything for you.',
    zC3Desc: 'Your eyes work like a cameraman. You can\'t stand poorly shot movies.',
    zC4Desc: 'You want to feel the atmosphere and the music in your bones.',
    zC5Desc: 'Pacing and editing tricks are the most critical details for you.',
    top3Title: 'Holy Trinity', top3Desc: 'The best 3 movies that touched your life.', selectTop3Search: 'Search movie for showcase...',
    verifyEmailSent: 'Registration successful! Please check your email to verify your account.', emailNotVerifiedError: 'Your email address is not verified yet. Please check your inbox.',
    followers: 'Followers', following: 'Following', follow: 'Follow', unfollow: 'Unfollow', shareProfile: 'Share Profile', userCodeCopied: 'User code copied!',
    communityPrivacyTitle: 'Private Community', communityPrivacyDesc: 'For privacy reasons, users are not listed publicly. Enter the exact 6-char @code to find your friend.',
    mostVoted: 'Most Voted', exactCodeRequired: 'Enter exact @code to search...', followingTab: 'Following', followersTab: 'Followers', theirScore: 'Their Score', theirRatedMovies: 'Rated Movies',
    tasteMatch: 'Taste Match', matchCalculating: 'Calculating...', dnaLockedTitle: 'DNA Analysis Locked', dnaLockedDesc: 'more movies needed. Rate 20 movies to unlock your critical DNA analysis.', dnaLockedDescPublic: 'Not enough data to analyze this user.',
    notifications: 'Notifications', noNotifications: 'No notifications.', startedFollowing: 'started following you.',
    auraColor: 'Aura Color (Theme)', friendsWatched: 'Friends Who Watched'
  },
  de: { 
    home: 'Startseite', ranking: 'Weltrangliste', community: 'Community', login: 'Anmelden', logout: 'Abmelden', trending: 'Aktuelle Trends', topRated: 'Kultklassiker', featured: 'Empfehlung', searchPlaceholder: 'Filme suchen...', searchUsers: 'Nur mit @Code suchen...', director: 'Regisseur', cast: 'Besetzung', summary: 'Handlung', watchTrailer: 'Trailer ansehen', saveRating: 'Speichern', updateRating: 'Aktualisieren', criteria: 'Kriterien', yourScore: 'Deine Punktzahl', globalRanking: 'Weltrangliste', noRating: 'Keine Filme bewertet.', ratedFilmsLabel: 'Bewertete Filme', yourAvg: 'Durchschnitt', nextLevel: 'Nächstes Level', globalScoreLabel: 'Global', yourScoreLabel: 'Deine Note', myRatings: 'Bewertungen', editProfile: 'Profil bearbeiten', rateNow: 'Bewerten', voteCount: 'Stimmen', average: 'Dursch.', badges: 'Abzeichen', communityAvg: 'Community-Durchschnitt', actionPacked: 'Actiongeladen', emotionalDramas: 'Emotionale Dramen', turkishCinema: 'Türkische Meisterwerke', sciFi: 'Science-Fiction', comedy: 'Komödie', c1: 'Drehbuch', c1Desc: 'Handlungsstrang und Originalität.', c2: 'Schauspiel', c2Desc: 'Wie glaubwürdig die Schauspieler sind.', c3: 'Kamera', c3Desc: 'Kamerawinkel und Beleuchtung.', c4: 'Ton & Musik', c4Desc: 'Soundeffekte und Atmosphäre.', c5: 'Schnitt', c5Desc: 'Szenenübergänge und Tempo.', globalDesc: 'Das riesige Kinoarchiv der Community.', registeredMovies: 'Bewertete Filme', username: 'Benutzername', selectAvatar: 'Avatar wählen', saveChanges: 'Speichern', noBadges: 'Bewerte Filme für Abzeichen!', b1Name: 'Popcorn-Esser', b1Desc: 'Ersten Film bewertet!', b2Name: 'Kino-Fan', b2Desc: '10 Filme erreicht.', b3Name: 'Cineast', b3Desc: '50 Filme!', b4Name: 'Goldenes Ticket', b4Desc: '100 Filme erreicht.', b5Name: 'Meister-Regisseur', b5Desc: '250 Filme.', b6Name: 'Kino-Gott', b6Desc: '500+ Filme!', loginOr: 'ODER', registerBtn: 'Registrieren', namePlaceholder: 'Name', emailPlaceholder: 'E-Mail', passPlaceholder: 'Passwort', navShowcase: 'START', navList: 'LISTE', navProfile: 'PROFIL', noData: 'Keine Daten.', watchlist: 'Merkliste', addToWatchlist: 'Zur Merkliste', removeFromWatchlist: 'Von Merkliste entfernen', profileGeneral: 'Übersicht', sortBy: 'Sortieren:', sortDate: 'Neueste', sortMyScore: 'Meine Note', sortGlobalScore: 'Globale Note', emptyWatchlist: 'Merkliste ist leer.', cinematicDNA: 'Kritische DNA-Analyse', dnaDesc: 'Deine Erwartungen basierend auf umgekehrten Bewertungen.', customLists: 'Meine Listen', createNewList: 'Neue Liste', listNamePlaceholder: 'z.B., Meisterwerke...', add: 'Hinzufügen', share: 'Teilen', copied: 'Link kopiert!', selectList: 'Zur Liste hinzufügen', addedToList: 'Zur Liste hinzugefügt!', addCustomListHover: 'Zur eigenen Liste', addWatchlistHover: 'Zur Merkliste', removeWatchlistHover: 'Aus Merkliste entfernen', autoRemoveSetting: 'Automatisch entfernen', autoRemoveDesc: 'Wenn du bewertest, wird der Film aus der Merkliste entfernt.', listCreated: 'Liste erstellt!', errorOccurred: 'Ein Fehler ist aufgetreten!', bioLabel: 'Kino Motto (Bio)', bioPlaceholder: 'z.B., May the force be with you...', selectBanner: 'Profilbanner', cineZodiac: 'Kino-Sternzeichen', cineZodiacDesc: 'Profil basierend auf deiner Kritik.', topGenres: 'Lieblingsgenres', viewAll: 'Alle ansehen', zodiacC1: 'Story-Jäger', zodiacC2: 'Charakter-Analyst', zodiacC3: 'Visueller Ästhet', zodiacC4: 'Audiophiler', zodiacC5: 'Rhythmus-Meister', zodiacDefault: 'Anfänger', zC1Desc: 'Schwache Geschichten haben keine Chance.', zC2Desc: 'Falsches Schauspiel erkennst du sofort.', zC3Desc: 'Deine Augen arbeiten wie eine Kamera.', zC4Desc: 'Atmosphäre und Musik sind alles.', zC5Desc: 'Schnitt und Tempo sind am wichtigsten.', top3Title: 'Heilige Dreifaltigkeit', top3Desc: 'Die besten 3 Filme deines Lebens.', selectTop3Search: 'Film suchen...', verifyEmailSent: 'Bitte bestätige deine E-Mail-Adresse!', emailNotVerifiedError: 'E-Mail nicht verifiziert.', followers: 'Follower', following: 'Folge ich', follow: 'Folgen', unfollow: 'Entfolgen', shareProfile: 'Profil teilen', userCodeCopied: 'Benutzercode kopiert!', communityPrivacyTitle: 'Private Community', communityPrivacyDesc: 'Aus Datenschutzgründen werden Benutzer nicht öffentlich aufgelistet. Geben Sie den genauen 6-stelligen @Code ein.', mostVoted: 'Meistbewertet', exactCodeRequired: 'Geben Sie den genauen @code ein...', followingTab: 'Folge ich', followersTab: 'Follower', theirScore: 'Seine Note', theirRatedMovies: 'Bewertete Filme', tasteMatch: 'Geschmacksübereinstimmung', matchCalculating: 'Berechnung...', dnaLockedTitle: 'DNA gesperrt', dnaLockedDesc: 'weitere Filme nötig. (20 Minimum)', dnaLockedDescPublic: 'Nicht genug Daten für eine Analyse.', notifications: 'Benachrichtigungen', noNotifications: 'Keine Benachrichtigungen.', startedFollowing: 'folgt dir jetzt.', auraColor: 'Aura Farbe (Thema)', friendsWatched: 'Freunde, die dies gesehen haben'
  },
  it: { 
    home: 'Home', ranking: 'Classifica Globale', community: 'Community', login: 'Accedi', logout: 'Esci', trending: 'In Tendenza', topRated: 'Classici Cult', featured: 'In Primo Piano', searchPlaceholder: 'Cerca film...', searchUsers: 'Cerca solo per @codice...', director: 'Regista', cast: 'Cast', summary: 'Trama', watchTrailer: 'Trailer', saveRating: 'Salva', updateRating: 'Aggiorna', criteria: 'Criteri di Recensione', yourScore: 'Tuo Punteggio', globalRanking: 'Classifica Globale', noRating: 'Nessun film valutato.', ratedFilmsLabel: 'Film Valutati', yourAvg: 'Tua Media', nextLevel: 'Prossimo Livello', globalScoreLabel: 'Globale', yourScoreLabel: 'Tuo Voto', myRatings: 'Valutazioni', editProfile: 'Modifica Profilo', rateNow: 'Valuta', voteCount: 'Voti', average: 'Media', badges: 'Distintivi', communityAvg: 'Media della Community', actionPacked: 'Azione', emotionalDramas: 'Drammi Emozionali', turkishCinema: 'Capolavori Turchi', sciFi: 'Fantascienza', comedy: 'Commedia', c1: 'Sceneggiatura', c1Desc: 'Trama e originalità.', c2: 'Recitazione', c2Desc: 'Credibilità degli attori.', c3: 'Fotografia', c3Desc: 'Inquadrature e luce.', c4: 'Suono', c4Desc: 'Musica e atmosfera.', c5: 'Montaggio', c5Desc: 'Ritmo del film.', globalDesc: 'L\'enorme archivio della community.', registeredMovies: 'Film Votati', username: 'Nome Utente', selectAvatar: 'Scegli Avatar', saveChanges: 'Salva', noBadges: 'Valuta per distintivi!', b1Name: 'Mangia Popcorn', b1Desc: 'Primo film!', b2Name: 'Cinefilo', b2Desc: 'Superati i 10 film.', b3Name: 'Critico', b3Desc: '50 Film!', b4Name: 'Biglietto D\'oro', b4Desc: 'Club dei 100 Film.', b5Name: 'Maestro', b5Desc: '250 Film.', b6Name: 'Dio del Cinema', b6Desc: '500+ Film!', loginOr: 'OPPURE', registerBtn: 'Registrati', namePlaceholder: 'Nome', emailPlaceholder: 'Email', passPlaceholder: 'Password', navShowcase: 'VETRINA', navList: 'LISTA', navProfile: 'PROFILO', noData: 'Nessun dato.', watchlist: 'La mia Lista', addToWatchlist: 'Aggiungi alla Lista', removeFromWatchlist: 'Rimuovi dalla Lista', profileGeneral: 'Panoramica', sortBy: 'Ordina per:', sortDate: 'Più Recenti', sortMyScore: 'Mio Voto', sortGlobalScore: 'Voto Globale', emptyWatchlist: 'La lista è vuota.', cinematicDNA: 'DNA Critico', dnaDesc: 'Le tue aspettative in base ai voti (proporzionalità inversa).', customLists: 'Le Mie Liste', createNewList: 'Crea Nuova Lista', listNamePlaceholder: 'Es. Capolavori...', add: 'Aggiungi', share: 'Condividi', copied: 'Link copiato!', selectList: 'Aggiungi alla lista', addedToList: 'Aggiunto!', addCustomListHover: 'Aggiungi a lista personalizzata', addWatchlistHover: 'Aggiungi alla lista', removeWatchlistHover: 'Rimuovi dalla lista', autoRemoveSetting: 'Rimuovi automaticamente', autoRemoveDesc: 'Rimuovi automaticamente dopo il voto.', listCreated: 'Lista creata!', errorOccurred: 'Si è verificato un errore!', bioLabel: 'Motto Cinematografico', bioPlaceholder: 'Es: May the force be with you...', selectBanner: 'Banner del profilo', cineZodiac: 'Zodiaco del Cinema', cineZodiacDesc: 'Il tuo profilo critico.', topGenres: 'Generi Preferiti', viewAll: 'Vedi Tutti', zodiacC1: 'Cacciatore di Storie', zodiacC2: 'Analista', zodiacC3: 'Esteta Visivo', zodiacC4: 'Audiofilo', zodiacC5: 'Maestro del Ritmo', zodiacDefault: 'Principiante', zC1Desc: 'Non perdoni i buchi di trama.', zC2Desc: 'Cerchi solo emozioni reali.', zC3Desc: 'I tuoi occhi sono come una cinepresa.', zC4Desc: 'Vivi per l\'atmosfera.', zC5Desc: 'Il ritmo è fondamentale.', top3Title: 'Sacra Trinità', top3Desc: 'I 3 migliori film della tua vita.', selectTop3Search: 'Cerca film...', verifyEmailSent: 'Verifica la tua email!', emailNotVerifiedError: 'Email non verificata.', followers: 'Follower', following: 'Seguiti', follow: 'Segui', unfollow: 'Smetti di seguire', shareProfile: 'Condividi Profilo', userCodeCopied: 'Codice utente copiato!', communityPrivacyTitle: 'Community Privata', communityPrivacyDesc: 'Per motivi di privacy, gli utenti non sono elencati pubblicamente. Inserisci il @codice esatto.', mostVoted: 'Più Votati', exactCodeRequired: 'Inserisci il @codice esatto...', followingTab: 'Seguiti', followersTab: 'Follower', theirScore: 'Suo Voto', theirRatedMovies: 'Film Valutati', tasteMatch: 'Affinità', matchCalculating: 'Calcolo...', dnaLockedTitle: 'DNA Bloccato', dnaLockedDesc: 'film necessari. (Minimo 20)', dnaLockedDescPublic: 'Non ci sono dati sufficienti per un\'analisi.', notifications: 'Notifiche', noNotifications: 'Nessuna notifica.', startedFollowing: 'ha iniziato a seguirti.', auraColor: 'Colore Aura (Tema)', friendsWatched: 'Amici che hanno guardato'
  },
  fr: { 
    home: 'Accueil', ranking: 'Classement Mondial', community: 'Communauté', login: 'Connexion', logout: 'Déconnexion', trending: 'Tendances', topRated: 'Classiques Cultes', featured: 'En Vedette', searchPlaceholder: 'Rechercher...', searchUsers: 'Rechercher par @code...', director: 'Réalisateur', cast: 'Casting', summary: 'Résumé', watchTrailer: 'Bande-annonce', saveRating: 'Enregistrer', updateRating: 'Mettre à jour', criteria: 'Critères', yourScore: 'Votre Note', globalRanking: 'Classement Mondial', noRating: 'Aucun film évalué.', ratedFilmsLabel: 'Films Évalués', yourAvg: 'Moyenne', nextLevel: 'Niveau Suivant', globalScoreLabel: 'Globale', yourScoreLabel: 'Votre Note', myRatings: 'Évaluations', editProfile: 'Modifier le Profil', rateNow: 'Évaluer', voteCount: 'Votes', average: 'Moyenne', badges: 'Badges', communityAvg: 'Moyenne de la Communauté', actionPacked: 'Action', emotionalDramas: 'Drames Émotionnels', turkishCinema: 'Chefs-d\'œuvre Turcs', sciFi: 'Science-Fiction', comedy: 'Comédie', c1: 'Scénario', c1Desc: 'Intrigue et originalité.', c2: 'Acteur', c2Desc: 'Crédibilité des acteurs.', c3: 'Cinématographie', c3Desc: 'Angles et éclairage.', c4: 'Son', c4Desc: 'Musique et ambiance.', c5: 'Montage', c5Desc: 'Rythme du film.', globalDesc: 'L\'archive cinématographique de la communauté.', registeredMovies: 'Films Notés', username: 'Nom d\'utilisateur', selectAvatar: 'Choisir un Avatar', saveChanges: 'Enregistrer', noBadges: 'Évaluez pour gagner des badges!', b1Name: 'Mangeur de Popcorn', b1Desc: 'Premier film!', b2Name: 'Cinéphile', b2Desc: '10 films.', b3Name: 'Critique', b3Desc: '50 Films!', b4Name: 'Billet d\'Or', b4Desc: 'Club des 100 films.', b5Name: 'Maître', b5Desc: '250 Films.', b6Name: 'Dieu du Cinéma', b6Desc: '500+ Films!', loginOr: 'OU', registerBtn: 'S\'inscrire', namePlaceholder: 'Nom', emailPlaceholder: 'Email', passPlaceholder: 'Mot de passe', navShowcase: 'ACCUEIL', navList: 'LISTE', navProfile: 'PROFIL', noData: 'Aucune donnée.', watchlist: 'Ma Liste', addToWatchlist: 'Ajouter à la Liste', removeFromWatchlist: 'Retirer de la Liste', profileGeneral: 'Aperçu', sortBy: 'Trier par:', sortDate: 'Plus Récent', sortMyScore: 'Ma Note', sortGlobalScore: 'Note Globale', emptyWatchlist: 'Votre liste est vide.', cinematicDNA: 'Analyse ADN Critique', dnaDesc: 'Vos attentes en fonction de vos notes (proportion inversée).', customLists: 'Mes Listes', createNewList: 'Créer une liste', listNamePlaceholder: 'Ex: Chefs-d\'œuvre...', add: 'Ajouter', share: 'Partager', copied: 'Lien copié!', selectList: 'Ajouter à la liste', addedToList: 'Ajouté à la liste!', addCustomListHover: 'Ajouter à une liste', addWatchlistHover: 'Ajouter à ma liste', removeWatchlistHover: 'Retirer de la liste', autoRemoveSetting: 'Retrait automatique', autoRemoveDesc: 'Automatiquement supprimé après évaluation.', listCreated: 'Liste créée!', errorOccurred: 'Une erreur s\'est produite!', bioLabel: 'Citation (Bio)', bioPlaceholder: 'Ex: May the force be with you...', selectBanner: 'Bannière de profil', cineZodiac: 'Zodiaque du Cinéma', cineZodiacDesc: 'Votre profil basé sur vos critiques.', topGenres: 'Genres Préférés', viewAll: 'Voir Tout', zodiacC1: 'Chasseur d\'histoires', zodiacC2: 'Analyste', zodiacC3: 'Esthète Visuel', zodiacC4: 'Audiophile', zodiacC5: 'Maître du Rythme', zodiacDefault: 'Débutant', zC1Desc: 'L\'histoire est tout pour vous.', zC2Desc: 'L\'émotion est essentielle.', zC3Desc: 'Vos yeux fonctionnent comme une caméra.', zC4Desc: 'La musique et l\'atmosphère priment.', zC5Desc: 'Le montage et le rythme sont critiques.', top3Title: 'Sainte Trinité', top3Desc: 'Les 3 meilleurs films de votre vie.', selectTop3Search: 'Rechercher...', verifyEmailSent: 'Veuillez vérifier votre e-mail !', emailNotVerifiedError: 'E-mail non vérifié.', followers: 'Abonnés', following: 'Abonnements', follow: 'Suivre', unfollow: 'Ne plus suivre', shareProfile: 'Partager le Profil', userCodeCopied: 'Code utilisateur copié!', communityPrivacyTitle: 'Communauté Privée', communityPrivacyDesc: 'Entrez le @code exact pour trouver votre ami.', mostVoted: 'Les Plus Votés', exactCodeRequired: 'Entrez le @code exact...', followingTab: 'Abonnements', followersTab: 'Abonnés', theirScore: 'Leur Note', theirRatedMovies: 'Films Évalués', tasteMatch: 'Affinité', matchCalculating: 'Calcul...', dnaLockedTitle: 'ADN Verrouillé', dnaLockedDesc: 'films nécessaires. (20 Minimum)', dnaLockedDescPublic: 'Pas assez de données pour l\'analyse.', notifications: 'Notifications', noNotifications: 'Aucune notification.', startedFollowing: 'a commencé à vous suivre.', auraColor: 'Couleur Aura (Thème)', friendsWatched: 'Amis qui ont regardé' }
};

const AURA_COLORS = ["#39ff14", "#0ea5e9", "#f43f5e", "#eab308", "#a855f7", "#ec4899", "#14b8a6", "#f97316"];

const AVATAR_PRESETS = [
  "https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Director&backgroundColor=0f172a", "https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Actor&backgroundColor=1e1b4b", "https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Writer&backgroundColor=451a03", "https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Camera&backgroundColor=064e3b", "https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Vader&backgroundColor=000000", "https://api.dicebear.com/7.x/personas/svg?seed=Morpheus&backgroundColor=020617", "https://api.dicebear.com/7.x/personas/svg?seed=Trinity&backgroundColor=172554", "https://api.dicebear.com/7.x/micah/svg?seed=Bond&backgroundColor=111827", "https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Ripley&backgroundColor=27272a", "https://api.dicebear.com/7.x/bottts/svg?seed=WallE&backgroundColor=065f46", "https://api.dicebear.com/7.x/avataaars/svg?seed=Joker&backgroundColor=4c1d95", "https://api.dicebear.com/7.x/fun-emoji/svg?seed=Oscar&backgroundColor=78350f", "https://api.dicebear.com/7.x/notionists/svg?seed=Spielberg&backgroundColor=171717", "https://api.dicebear.com/7.x/shapes/svg?seed=Matrix&backgroundColor=022c22", "https://api.dicebear.com/7.x/pixel-art/svg?seed=Tarantino&backgroundColor=7f1d1d"
];
const BANNER_PRESETS = [
  "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1585647347345-d8d609614fce?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1517604931442-7e0c8ed5ea88?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1604998103924-89e012e5265a?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?auto=format&fit=crop&w=1200&q=80"
];
const AVATAR_DEFAULT = AVATAR_PRESETS[0];

// --------------------------------------------------------
// 3. ANİMASYON & TEMA MOTORU
// --------------------------------------------------------
const CustomAnimations = () => (
  <style dangerouslySetInnerHTML={{__html: `
    .hide-scrollbar::-webkit-scrollbar { display: none; }
    .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    .smooth-scroll { scroll-behavior: smooth; }

    /* YENİ: AURA TEMA MOTORU */
    .text-theme { color: var(--theme-color); }
    .bg-theme { background-color: var(--theme-color); color: #04060C !important; }
    .border-theme { border-color: var(--theme-color); }
    .shadow-theme { box-shadow: 0 0 20px var(--theme-color-50); }
    .hover\\:bg-theme:hover { background-color: var(--theme-color) !important; color: #04060C !important; }
    .hover\\:text-theme:hover { color: var(--theme-color) !important; }
    .hover\\:border-theme:hover { border-color: var(--theme-color) !important; }
    .group:hover .group-hover\\:text-theme { color: var(--theme-color) !important; }
    .group:hover .group-hover\\:border-theme { border-color: var(--theme-color) !important; }

    .fly-wrapper { position: absolute; inset: -40px; pointer-events: none; z-index: 50; }
    .fly { position: absolute; font-size: 20px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.9)); }
    .fly-1 { animation: flight1 10s infinite ease-in-out; }
    .fly-2 { animation: flight2 12s infinite ease-in-out reverse; }
    .fly-3 { animation: flight1 15s infinite ease-in-out 2s; }
    .fly-4 { animation: flight2 11s infinite ease-in-out 4s; }
    .fly-5 { animation: flight1 14s infinite ease-in-out 1s reverse; }
    .fly-inner { animation: flap 0.02s infinite alternate; }

    @keyframes roam1 { 0% { transform: translate(0vw, 0vh) rotate(0deg); } 25% { transform: translate(60vw, 20vh) rotate(45deg); } 50% { transform: translate(30vw, 60vh) rotate(90deg); } 75% { transform: translate(10vw, 40vh) rotate(135deg); } 100% { transform: translate(0vw, 0vh) rotate(0deg); } }
    @keyframes roam2 { 0% { transform: translate(80vw, 80vh) rotate(0deg); } 33% { transform: translate(20vw, 10vh) rotate(-45deg); } 66% { transform: translate(70vw, 30vh) rotate(-90deg); } 100% { transform: translate(80vw, 80vh) rotate(0deg); } }
    @keyframes roam3 { 0% { transform: translate(40vw, 10vh) rotate(90deg); } 50% { transform: translate(10vw, 80vh) rotate(180deg); } 100% { transform: translate(40vw, 10vh) rotate(90deg); } }
    
    .page-fly-1 { animation: roam1 20s infinite linear; }
    .page-fly-2 { animation: roam2 25s infinite linear reverse; }
    .page-fly-3 { animation: roam3 15s infinite ease-in-out; }

    @keyframes flap { 0% { transform: rotate(-10deg) scaleY(1); } 100% { transform: rotate(10deg) scaleY(0.7); } }
    @keyframes flight1 {
      0%   { transform: translate(100px, 120px) rotate(45deg); }
      15%  { transform: translate(10px, 10px) rotate(-30deg); }
      25%  { transform: translate(65px, 55px) rotate(15deg); } 
      40%  { transform: translate(65px, 55px) rotate(45deg); } 
      45%  { transform: translate(65px, 55px) rotate(-15deg); } 
      55%  { transform: translate(-10px, 80px) rotate(-70deg); }
      80%  { transform: translate(120px, -20px) rotate(110deg); }
      100% { transform: translate(100px, 120px) rotate(45deg); }
    }
    @keyframes flight2 {
      0%   { transform: translate(0px, 0px) rotate(90deg); }
      20%  { transform: translate(90px, 80px) rotate(20deg); }
      35%  { transform: translate(45px, 45px) rotate(-45deg); } 
      50%  { transform: translate(45px, 45px) rotate(-10deg); }
      65%  { transform: translate(130px, 20px) rotate(135deg); }
      100% { transform: translate(0px, 0px) rotate(90deg); }
    }

    @keyframes hero-bar { 0% { width: 0%; } 100% { width: 100%; } }
    .animate-hero-bar { animation: hero-bar 6s linear forwards; }

    @keyframes morph-bg { 
      0% { background-position: 0% 50%; } 
      50% { background-position: 100% 50%; } 
      100% { background-position: 0% 50%; } 
    }
    .logo-morph-text {
      background: linear-gradient(270deg, #39ff14, #0ea5e9, #a855f7, #f43f5e, #39ff14);
      background-size: 400% 400%;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: morph-bg 30s ease infinite;
    }
    .logo-morph-bg {
      background: linear-gradient(270deg, #39ff14, #0ea5e9, #a855f7, #f43f5e, #39ff14);
      background-size: 400% 400%;
      animation: morph-bg 30s ease infinite;
      border-color: transparent !important;
    }
    .logo-morph-bg svg {
      color: #04060C;
    }
  `}}/>
);

const getScoreColorHex = (score) => {
  const s = Number(score) || 0;
  if (s >= 9.0) return '#39ff14'; 
  if (s >= 7.5) return '#22c55e'; 
  if (s >= 5.5) return '#facc15'; 
  if (s >= 3.5) return '#ef4444'; 
  if (s >= 2.0) return '#3b82f6'; 
  return '#a855f7'; 
};

const MegaScoreVFX = ({ score, themeColor }) => {
  const s = Number(score);
  if (isNaN(s)) return null;

  if (s >= 9.0) {
    return (
      <div className="absolute inset-0 pointer-events-none rounded-full z-0 flex items-center justify-center">
         <div className="absolute inset-[-15px] rounded-full border-[3px] border-t-transparent border-b-transparent animate-[spin_3s_linear_infinite]" style={{borderColor: themeColor, opacity: 0.8, boxShadow: `0 0 20px ${themeColor}80`}}></div>
         <div className="absolute inset-[-25px] rounded-full border-[2px] border-l-transparent border-r-transparent animate-[spin_6s_linear_infinite_reverse]" style={{borderColor: themeColor, opacity: 0.3, boxShadow: `0 0 10px ${themeColor}4d`}}></div>
      </div>
    );
  }
  
  if (s <= 2.5) {
    const numFlies = Math.min(5, Math.max(1, Math.floor((2.5 - s) / 0.5) + 1));
    return (
      <div className="absolute inset-0 pointer-events-none rounded-full z-20">
        <div className="absolute inset-[-15px] rounded-full bg-purple-700/20 blur-[25px] animate-[pulse_3s_infinite]"></div>
        <div className="fly-wrapper">
           {Array.from({length: numFlies}).map((_, i) => (
             <div key={i} className={`fly fly-${i+1}`}><div className="fly-inner">🪰</div></div>
           ))}
        </div>
      </div>
    );
  }
  return null;
};

const MiniVFX = ({ score, themeColor }) => {
  const s = Number(score);
  if (isNaN(s)) return null;
  if (s >= 9.0) return (
    <div className="absolute inset-0 pointer-events-none rounded-xl overflow-hidden mix-blend-screen z-0">
       <div className="absolute inset-0 rounded-xl animate-pulse" style={{boxShadow: `inset 0 0 15px ${themeColor}cc`}}></div>
    </div>
  );
  if (s <= 2.5) return (
    <div className="absolute inset-0 pointer-events-none rounded-xl z-20 overflow-visible">
       <div className="absolute inset-0 shadow-[inset_0_0_15px_rgba(168,85,247,0.8)] rounded-xl animate-[pulse_3s_infinite] opacity-60"></div>
       <div className="absolute -top-3 -right-2 text-[10px] animate-[bounce_1.5s_infinite] drop-shadow-[0_2px_2px_black]">🪰</div>
    </div>
  );
  return null;
};

const MovieRow = ({ title, movies, icon, t, selectMovieToRate, globalMoviesList, localizedData, themeColor }) => {
  const rowRef = useRef(null);
  
  const scroll = (direction) => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollAmount = clientWidth * 0.75; 
      const offset = direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount;
      rowRef.current.scrollTo({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <div className="mb-10 relative">
      <div className="flex items-center justify-between mb-5">
         <h3 className="text-2xl font-black text-white flex items-center gap-3 drop-shadow-md">{icon} {title}</h3>
         <div className="hidden sm:flex items-center gap-2">
            <button onClick={() => scroll('left')} className="p-2 bg-slate-900 border border-slate-800 rounded-full hover:bg-slate-800 transition-colors shadow-md z-20 relative"><ChevronLeft size={20}/></button>
            <button onClick={() => scroll('right')} className="p-2 bg-slate-900 border border-slate-800 rounded-full hover:bg-slate-800 transition-colors shadow-md z-20 relative"><ChevronRight size={20}/></button>
         </div>
      </div>
      <div ref={rowRef} className="flex overflow-x-auto gap-4 sm:gap-6 pb-6 pt-2 hide-scrollbar smooth-scroll relative z-10 pointer-events-auto">
        {movies.map((m) => {
          const globalData = globalMoviesList?.find(g => String(g.id) === String(m.tmdbId));
          const isNeon = globalData && globalData.avgScore >= 9.0;
          const displayTitle = localizedData?.[m.tmdbId]?.title || m.title;
          
          return (
          <div key={m.tmdbId} className="group cursor-pointer shrink-0 w-32 sm:w-44" onClick={() => selectMovieToRate(m.tmdbId, m.title)}>
            <div className="relative rounded-2xl overflow-hidden shadow-lg border border-slate-800 mb-3 aspect-[2/3] bg-slate-900 transition-all duration-300 group-hover:-translate-y-2 group-hover:border-theme shadow-theme">
              <img src={m.poster} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt=""/>
              <div className="absolute inset-0 bg-[#04060C]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                 <span className="bg-theme text-[#04060C] text-xs sm:text-sm font-black px-4 py-2 rounded-xl flex items-center gap-1 shadow-lg"><Star size={16} className="fill-current"/> {t.rateNow}</span>
              </div>
              {globalData && globalData.avgScore > 0 && (
                <div className={`absolute top-2 right-2 px-2.5 py-1 rounded-lg backdrop-blur shadow-xl z-10 pointer-events-none flex flex-col items-center ${isNeon ? 'bg-[#04060C] border animate-pulse' : 'bg-[#04060C]/90 border border-slate-700'}`} style={isNeon ? {borderColor: themeColor, boxShadow: `0 0 15px ${themeColor}80`} : {}}>
                  <span className="text-[8px] text-slate-400 font-black mb-0.5 uppercase tracking-widest leading-none">{t.globalScoreLabel}</span>
                  <span className="text-xs font-black leading-none" style={{color: isNeon ? themeColor : getScoreColorHex(globalData.avgScore), textShadow: isNeon ? `0 0 10px ${themeColor}` : 'none'}}>{Number(globalData.avgScore).toFixed(1)}</span>
                </div>
              )}
            </div>
            <h4 className="font-bold text-slate-300 text-xs sm:text-sm group-hover:text-theme truncate drop-shadow-md transition-colors">{displayTitle}</h4>
          </div>
        )})}
      </div>
    </div>
  );
};

const getAllBadges = (ratingCount, t) => {
  const c = Number(ratingCount) || 0;
  return [
    { id: 'b1', name: t.b1Name, icon: <Film size={24}/>, color: 'text-zinc-400 border-zinc-700 bg-zinc-800/50', desc: t.b1Desc, earned: c >= 1 },
    { id: 'b2', name: t.b2Name, icon: <Ticket size={24}/>, color: 'text-sky-400 border-sky-800/50 bg-sky-900/20', desc: t.b2Desc, earned: c >= 10 },
    { id: 'b3', name: t.b3Name, icon: <Award size={24}/>, color: 'text-fuchsia-400 border-fuchsia-800/50 bg-fuchsia-900/20 shadow-[0_0_15px_rgba(192,38,211,0.2)]', desc: t.b3Desc, earned: c >= 50 },
    { id: 'b4', name: t.b4Name, icon: <Medal size={24}/>, color: 'text-amber-400 border-amber-500/50 bg-amber-900/20 shadow-[0_0_20px_rgba(245,158,11,0.3)] animate-pulse', desc: t.b4Desc, earned: c >= 100 },
    { id: 'b5', name: t.b5Name, icon: <Clapperboard size={24}/>, color: 'text-rose-500 border-rose-500/50 bg-rose-900/20 shadow-[0_0_25px_rgba(225,29,72,0.4)]', desc: t.b5Desc, earned: c >= 250 },
    { id: 'b6', name: t.b6Name, icon: <Crown size={24}/>, color: 'text-emerald-400 border-emerald-400/80 bg-emerald-900/20 shadow-[0_0_30px_rgba(52,211,153,0.6)] animate-bounce', desc: t.b6Desc, earned: c >= 500 },
  ];
};

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError(error) { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center text-white text-center p-8 bg-[#04060C]">
          <div className="bg-red-900/20 border border-red-500/50 p-8 rounded-3xl max-w-lg shadow-2xl">
            <h1 className="text-3xl font-black text-red-500 mb-3 drop-shadow-md">Kalkan Devrede 🛡️</h1>
            <p className="mb-6 text-slate-300">Sistemde oluşan bir uyuşmazlık sessizce onarıldı.</p>
            <button onClick={() => window.location.reload()} className="px-8 py-3 bg-[#39ff14] hover:bg-green-400 text-[#04060C] rounded-xl font-black transition-colors">Yenile ve Devam Et</button>
          </div>
        </div>
      );
    }
    return this.props.children; 
  }
}

export default function App() { 
  return (
    <ErrorBoundary>
      <CustomAnimations />
      <CineScoreMain />
    </ErrorBoundary>
  ); 
}

function CineScoreMain() {
  const [lang, setLang] = useState('tr');
  const t = { ...TRANSLATIONS['en'], ...(TRANSLATIONS[lang] || {}) };
  const tmdbLang = LANGUAGES.find(l => l.code === lang)?.tmdbCode || 'tr-TR';

  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  
  const [activeTab, setActiveTab] = useState('home'); 
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotifMenuOpen, setIsNotifMenuOpen] = useState(false);
  
  const [authMode, setAuthMode] = useState('login');
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [dynamicBg, setDynamicBg] = useState(''); 
  
  const [globalMovies, setGlobalMovies] = useState([]);
  const [myRatings, setMyRatings] = useState([]);
  const [myWatchlist, setMyWatchlist] = useState([]);
  const [customLists, setCustomLists] = useState([]);
  const [activeCustomList, setActiveCustomList] = useState(null);
  const [showNewListModal, setShowNewListModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [showAddToListModal, setShowAddToListModal] = useState(false);
  
  const [showTop3Modal, setShowTop3Modal] = useState(false);
  const [top3SlotIndex, setTop3SlotIndex] = useState(0);
  const [top3SearchTerm, setTop3SearchTerm] = useState('');
  const [top3Results, setTop3Results] = useState([]);
  const [isTop3Searching, setIsTop3Searching] = useState(false);

  const [communitySearch, setCommunitySearch] = useState('');
  const [allUsersList, setAllUsersList] = useState([]);
  
  const [viewingUser, setViewingUser] = useState(null);
  const [viewingUserRatings, setViewingUserRatings] = useState([]);
  const [viewingUserWatchlist, setViewingUserWatchlist] = useState([]);
  const [viewingUserLists, setViewingUserLists] = useState([]);

  const [followingUsersList, setFollowingUsersList] = useState([]);
  const [followersUsersList, setFollowersUsersList] = useState([]);
  
  const [toast, setToast] = useState({ show: false, message: '' });
  const showToast = (msg) => {
    setToast({ show: true, message: msg });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  const [ratingSortType, setRatingSortType] = useState('date_desc');
  const [globalSortType, setGlobalSortType] = useState('vote_desc');
  
  const [trendingData, setTrendingData] = useState([]);
  const [cultClassics, setCultClassics] = useState([]);
  const [actionMovies, setActionMovies] = useState([]);
  const [dramaMovies, setDramaMovies] = useState([]);
  const [turkishMovies, setTurkishMovies] = useState([]);
  const [sciFiMovies, setSciFiMovies] = useState([]);
  const [comedyMovies, setComedyMovies] = useState([]);
  
  const [localizedData, setLocalizedData] = useState({});
  const [heroIndex, setHeroIndex] = useState(0);
  const [showCategoryAverages, setShowCategoryAverages] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [authError, setAuthError] = useState('');
  const [editName, setEditName] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [editAutoRemove, setEditAutoRemove] = useState(false);
  const [editBio, setEditBio] = useState('');
  const [editBanner, setEditBanner] = useState('');
  const [editAura, setEditAura] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isRatingMode, setIsRatingMode] = useState(false);
  const [similarMovies, setSimilarMovies] = useState([]);

  // YENİ: Arkadaşların oyları (Who watched this?)
  const [friendsRatings, setFriendsRatings] = useState([]);

  const searchDropdownRef = useRef(null);
  const langMenuRef = useRef(null);
  const profileMenuRef = useRef(null);
  const notifMenuRef = useRef(null);

  const getCriteriaData = () => [
    { id: 'c1', name: t.c1, weight: 30, desc: t.c1Desc },
    { id: 'c2', name: t.c2, weight: 25, desc: t.c2Desc },
    { id: 'c3', name: t.c3, weight: 20, desc: t.c3Desc },
    { id: 'c4', name: t.c4, weight: 15, desc: t.c4Desc },
    { id: 'c5', name: t.c5, weight: 10, desc: t.c5Desc },
  ];
  const criteriaData = getCriteriaData();
  const [scores, setScores] = useState(criteriaData.reduce((acc, c) => ({ ...acc, [c.id]: 5 }), {}));

  // GLOBAL AURA TEMA RENGİ HESAPLAMA
  const themeColor = (activeTab.startsWith('public_profile') && viewingUser) ? (viewingUser.auraColor || '#39ff14') : (userProfile?.auraColor || '#39ff14');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const targetUserId = params.get('user');
    if (targetUserId) {
      loadPublicProfile(targetUserId);
    }
  }, []);

  useEffect(() => {
    let ratingsUnsub = null;
    let watchlistUnsub = null;
    let customListsUnsub = null;

    const authUnsub = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser && (currentUser.emailVerified || currentUser.providerData.some(p => p.providerId === 'google.com'))) {
        setUser(currentUser);
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userRef);
          
          if (userDoc.exists()) {
            const data = userDoc.data();
            if (!data.userCode) {
               data.userCode = currentUser.uid.substring(0, 6).toUpperCase();
               await setDoc(userRef, { userCode: data.userCode }, { merge: true });
            }
            if (!data.auraColor) {
               data.auraColor = '#39ff14';
               await setDoc(userRef, { auraColor: '#39ff14' }, { merge: true });
            }
            setUserProfile(data);
          } else {
             const newProfile = {
               uid: currentUser.uid,
               userCode: currentUser.uid.substring(0, 6).toUpperCase(),
               displayName: currentUser.displayName || 'Sinefil',
               email: currentUser.email,
               avatar: currentUser.photoURL || AVATAR_DEFAULT,
               auraColor: '#39ff14',
               autoRemoveWatchlist: false,
               bio: '',
               banner: BANNER_PRESETS[0],
               top3: [null, null, null],
               followers: [],
               following: [],
               notifications: []
             };
             await setDoc(userRef, newProfile);
             setUserProfile(newProfile);
          }
          
          if (ratingsUnsub) ratingsUnsub();
          ratingsUnsub = onSnapshot(collection(db, 'users', currentUser.uid, 'ratings'), (snap) => {
            setMyRatings(snap.docs.map(d => ({ id: String(d.id), ...d.data() })));
          });

          if (watchlistUnsub) watchlistUnsub();
          watchlistUnsub = onSnapshot(collection(db, 'users', currentUser.uid, 'watchlist'), (snap) => {
            setMyWatchlist(snap.docs.map(d => ({ id: String(d.id), ...d.data() })));
          });

          if (customListsUnsub) customListsUnsub();
          customListsUnsub = onSnapshot(collection(db, 'users', currentUser.uid, 'customLists'), (snap) => {
            setCustomLists(snap.docs.map(d => ({ id: String(d.id), ...d.data() })));
          });

        } catch(e) {}
      } else {
        setUser(null);
        setUserProfile(null);
        setMyRatings([]);
        setMyWatchlist([]);
        setCustomLists([]);
        if (ratingsUnsub) { ratingsUnsub(); ratingsUnsub = null; }
        if (watchlistUnsub) { watchlistUnsub(); watchlistUnsub = null; }
        if (customListsUnsub) { customListsUnsub(); customListsUnsub = null; }
      }
    });

    const q = query(collection(db, 'movies'), orderBy('lastUpdated', 'desc'));
    const moviesUnsub = onSnapshot(q, (snapshot) => {
      setGlobalMovies(snapshot.docs.map(doc => ({ id: String(doc.id), ...doc.data() })));
    });

    return () => { authUnsub(); moviesUnsub(); if(ratingsUnsub) ratingsUnsub(); if(watchlistUnsub) watchlistUnsub(); if(customListsUnsub) customListsUnsub(); };
  }, []);

  // YENİ: Arkadaşlarından İzleyenler'i Getir
  useEffect(() => {
    if (activeTab === 'rate' && selectedMovie && userProfile?.following?.length > 0) {
      const fetchFriendsRatings = async () => {
        try {
           const results = [];
           for (const fUid of userProfile.following) {
              const rDoc = await getDoc(doc(db, 'users', fUid, 'ratings', selectedMovie.id));
              if (rDoc.exists()) {
                 const uDoc = await getDoc(doc(db, 'users', fUid));
                 if (uDoc.exists()) {
                    results.push({ uid: fUid, name: uDoc.data().displayName, avatar: uDoc.data().avatar, score: rDoc.data().finalScore });
                 }
              }
           }
           setFriendsRatings(results);
        } catch(e) {}
      };
      fetchFriendsRatings();
    } else {
      setFriendsRatings([]);
    }
  }, [selectedMovie, userProfile?.following, activeTab]);

  useEffect(() => {
    const fetchLocalizedTitles = async () => {
      let newLoc = { ...localizedData };
      let changed = false;
      
      const allMyRatingsIds = myRatings.map(m=>m.id);
      const allViewingRatingsIds = viewingUserRatings.map(m=>m.id);
      const idsToFetch = [...new Set([...globalMovies.slice(0,25).map(m=>m.id), ...allMyRatingsIds, ...allViewingRatingsIds])];
      
      await Promise.all(idsToFetch.map(async (id) => {
         if(!newLoc[id] || newLoc[id].lang !== tmdbLang) {
            try {
               const res = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_API_KEY}&language=${tmdbLang}`);
               const d = await res.json();
               if(d.title) {
                  newLoc[id] = { title: d.title, genre: d.genres?.map(g=>g.name).join(', '), lang: tmdbLang };
                  changed = true;
               }
            } catch(e) {}
         }
      }));
      if(changed) setLocalizedData(newLoc);
    };
    if(globalMovies.length > 0) fetchLocalizedTitles();
  }, [globalMovies, myRatings, viewingUserRatings, tmdbLang]);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const fetchTMDB = async (url) => {
          const res = await fetch(url);
          const data = await res.json();
          return data.results?.filter(m => m.poster_path).slice(0, 20).map(m => ({
            title: m.title,
            poster: `https://image.tmdb.org/t/p/w500${m.poster_path}`,
            backdrop: m.backdrop_path ? `https://image.tmdb.org/t/p/w1280${m.backdrop_path}` : '',
            year: m.release_date ? m.release_date.split('-')[0] : '',
            overview: m.overview,
            tmdbId: String(m.id)
          })) || [];
        };

        const [trendRes, cultRes, actionRes, dramaRes, trRes, sciFiRes, comedyRes] = await Promise.all([
          fetchTMDB(`https://api.themoviedb.org/3/trending/movie/week?api_key=${TMDB_API_KEY}&language=${tmdbLang}`),
          fetchTMDB(`https://api.themoviedb.org/3/movie/top_rated?api_key=${TMDB_API_KEY}&language=${tmdbLang}&page=1`),
          fetchTMDB(`https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&with_genres=28&language=${tmdbLang}&sort_by=popularity.desc`),
          fetchTMDB(`https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&with_genres=18&language=${tmdbLang}&sort_by=popularity.desc`),
          fetchTMDB(`https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&with_original_language=tr&sort_by=vote_average.desc&vote_count.gte=100&language=${tmdbLang}`),
          fetchTMDB(`https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&with_genres=878&language=${tmdbLang}&sort_by=popularity.desc`),
          fetchTMDB(`https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&with_genres=35&language=${tmdbLang}&sort_by=popularity.desc`)
        ]);

        for (let i = 0; i < Math.min(5, trendRes.length); i++) {
           const vRes = await fetch(`https://api.themoviedb.org/3/movie/${trendRes[i].tmdbId}/videos?api_key=${TMDB_API_KEY}&language=en-US`);
           const vData = await vRes.json();
           const trailer = vData.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube');
           if (trailer) trendRes[i].trailerKey = trailer.key;
        }

        setTrendingData(trendRes);
        setCultClassics(cultRes);
        setActionMovies(actionRes);
        setDramaMovies(dramaRes);
        setTurkishMovies(trRes);
        setSciFiMovies(sciFiRes);
        setComedyMovies(comedyRes);
      } catch(e) {}
    };
    fetchHomeData();
  }, [tmdbLang]);

  useEffect(() => {
    if (!trendingData || trendingData.length === 0 || activeTab !== 'home') return;
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % Math.min(5, trendingData.length));
    }, 6000);
    return () => clearInterval(timer);
  }, [trendingData, activeTab]);

  useEffect(() => {
    if (selectedMovie && selectedMovie.id) selectMovieToRate(selectedMovie.id, selectedMovie.title, false); 
  }, [tmdbLang]);

  useEffect(() => {
    if (searchTerm.length < 3) { setSearchResults([]); return; }
    const delayFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(searchTerm)}&language=${tmdbLang}`);
        const data = await res.json();
        const top5 = data.results?.slice(0, 5) || [];
        
        const detailedResults = await Promise.all(top5.map(async (m) => {
           try {
             const dRes = await fetch(`https://api.themoviedb.org/3/movie/${m.id}?api_key=${TMDB_API_KEY}&append_to_response=credits&language=${tmdbLang}`);
             const dData = await dRes.json();
             const director = dData.credits?.crew?.find(c => c.job === 'Director')?.name || '';
             return { ...m, director };
           } catch(e) { return m; }
        }));
        setSearchResults(detailedResults);
      } catch (e) {} finally { setIsSearching(false); }
    }, 500);
    return () => clearTimeout(delayFn);
  }, [searchTerm, tmdbLang]);

  useEffect(() => {
    if (top3SearchTerm.length < 3) { setTop3Results([]); return; }
    const delayFn = setTimeout(async () => {
      setIsTop3Searching(true);
      try {
        const res = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(top3SearchTerm)}&language=${tmdbLang}`);
        const data = await res.json();
        setTop3Results(data.results?.slice(0, 5) || []);
      } catch (e) {} finally { setIsTop3Searching(false); }
    }, 500);
    return () => clearTimeout(delayFn);
  }, [top3SearchTerm, tmdbLang]);

  useEffect(() => {
    const code = communitySearch.replace('@', '').toUpperCase();
    if (code.length === 6) {
       const fetchUsers = async () => {
          try {
            const snap = await getDocs(query(collection(db, 'users'), limit(500)));
            setAllUsersList(snap.docs.map(d => ({ uid: d.id, ...d.data() })).filter(u => {
                const userC = u.userCode || u.uid.substring(0, 6).toUpperCase();
                return userC === code;
            }));
          } catch(e) {}
       };
       fetchUsers();
    } else {
       setAllUsersList([]);
    }
  }, [communitySearch]);

  useEffect(() => {
    const handleClickOutside = (e) => { 
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(e.target)) setSearchResults([]); 
      if (langMenuRef.current && !langMenuRef.current.contains(e.target)) setIsLangMenuOpen(false); 
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) setIsProfileMenuOpen(false); 
      if (notifMenuRef.current && !notifMenuRef.current.contains(e.target)) setIsNotifMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const saveUserProfileData = async (userObj, options) => {
    const newProfile = { 
      uid: userObj.uid,
      userCode: userProfile?.userCode || userObj.uid.substring(0, 6).toUpperCase(),
      displayName: options.name || userProfile?.displayName || 'Sinefil', 
      email: userObj.email, 
      avatar: options.avatar || userProfile?.avatar || AVATAR_DEFAULT,
      auraColor: options.auraColor || userProfile?.auraColor || '#39ff14',
      autoRemoveWatchlist: options.autoRemove !== undefined ? options.autoRemove : (userProfile?.autoRemoveWatchlist || false),
      bio: options.bio !== undefined ? options.bio : (userProfile?.bio || ''),
      banner: options.banner || userProfile?.banner || BANNER_PRESETS[0],
      top3: userProfile?.top3 || [null, null, null],
      followers: userProfile?.followers || [],
      following: userProfile?.following || [],
      notifications: userProfile?.notifications || []
    };
    await setDoc(doc(db, 'users', userObj.uid), newProfile, { merge: true });
    setUserProfile(newProfile);
  };

  const saveTop3Movie = async (movieData) => {
    const newTop3 = [...(userProfile?.top3 || [null, null, null])];
    newTop3[top3SlotIndex] = { id: movieData.id, title: movieData.title, poster: `https://image.tmdb.org/t/p/w500${movieData.poster_path}` };
    try {
      await setDoc(doc(db, 'users', user.uid), { top3: newTop3 }, { merge: true });
      setUserProfile(prev => ({...prev, top3: newTop3}));
      setShowTop3Modal(false);
      showToast(t.saveChanges);
    } catch(e) { showToast(t.errorOccurred); }
  };

  const setCrown = async (index) => {
    if(index === 1 || !userProfile?.top3?.[index]) return; 
    const newTop3 = [...userProfile.top3];
    const temp = newTop3[1];
    newTop3[1] = newTop3[index];
    newTop3[index] = temp;
    try {
      await setDoc(doc(db, 'users', user.uid), { top3: newTop3 }, { merge: true });
      setUserProfile(prev => ({...prev, top3: newTop3}));
    } catch(e) { showToast(t.errorOccurred); }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError(''); setIsAuthLoading(true);
    try {
      if (authMode === 'register') {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCred.user, { displayName });
        await sendEmailVerification(userCred.user);
        await signOut(auth);
        setAuthError(t.verifyEmailSent);
      } else {
        const userCred = await signInWithEmailAndPassword(auth, email, password);
        if (!userCred.user.emailVerified) {
           await signOut(auth);
           setAuthError(t.emailNotVerifiedError);
        } else {
           setShowLoginModal(false);
        }
      }
    } catch (err) { setAuthError("İşlem başarısız. Lütfen bilgileri kontrol edin."); } 
    finally { setIsAuthLoading(false); }
  };

  const handleGoogleAuth = async () => {
    try {
      setAuthError('');
      await signInWithPopup(auth, googleProvider);
      setShowLoginModal(false);
    } catch (err) { setAuthError("Google ile giriş iptal edildi veya başarısız oldu."); }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if(!user) return;
    try {
      await saveUserProfileData(user, { name: editName, avatar: editAvatar, auraColor: editAura, autoRemove: editAutoRemove, bio: editBio, banner: editBanner });
      setShowProfileModal(false);
      showToast(t.saveChanges);
    } catch(e) { showToast(t.errorOccurred); }
  };

  const openProfileEdit = () => {
    setEditName(userProfile?.displayName || '');
    setEditAvatar(userProfile?.avatar || AVATAR_DEFAULT);
    setEditAura(userProfile?.auraColor || '#39ff14');
    setEditAutoRemove(userProfile?.autoRemoveWatchlist || false);
    setEditBio(userProfile?.bio || '');
    setEditBanner(userProfile?.banner || BANNER_PRESETS[0]);
    setShowProfileModal(true);
    setIsProfileMenuOpen(false); 
  };

  const handleLogout = () => { signOut(auth); setIsProfileMenuOpen(false); setIsNotifMenuOpen(false); setActiveTab('home'); };

  const toggleWatchlist = async () => {
    if (!user) { setShowLoginModal(true); return; }
    if (!selectedMovie) return;
    const docId = String(selectedMovie.id);
    const ref = doc(db, 'users', user.uid, 'watchlist', docId);
    const isListed = myWatchlist.find(w => w.id === docId);
    try {
      if (isListed) { await deleteDoc(ref); showToast(t.removeFromWatchlist); }
      else { await setDoc(ref, { id: docId, title: selectedMovie.title, poster: selectedMovie.poster, dateAdded: Date.now() }); showToast(t.addedToList); }
    } catch (e) { showToast(t.errorOccurred); }
  };

  const createCustomList = async (e) => {
    e.preventDefault();
    if (!user || !newListName.trim()) return;
    const listId = "list_" + Date.now();
    try {
      await setDoc(doc(db, 'users', user.uid, 'customLists', listId), { name: newListName, dateCreated: Date.now(), movies: [] });
      setNewListName('');
      setShowNewListModal(false);
      showToast(t.listCreated);
    } catch (e) { showToast(t.errorOccurred); }
  };

  const addMovieToCustomList = async (listId) => {
    if(!user || !selectedMovie) return;
    const listRef = doc(db, 'users', user.uid, 'customLists', listId);
    const listData = customLists.find(l => l.id === listId);
    if(listData) {
       const movies = listData.movies || [];
       if(!movies.find(m => m.id === selectedMovie.id)) {
          movies.push({ id: selectedMovie.id, title: selectedMovie.title, poster: selectedMovie.poster });
          await setDoc(listRef, { movies }, { merge: true });
          showToast(t.addedToList);
          setShowAddToListModal(false);
       }
    }
  };

  const handleOpenCommunity = () => {
     setCommunitySearch('');
     setAllUsersList([]);
     setActiveTab('community');
     setDynamicBg('');
     setSelectedMovie(null);
  };

  const loadPublicProfile = async (targetUid) => {
     try {
       const userDoc = await getDoc(doc(db, 'users', targetUid));
       if (userDoc.exists()) {
          setViewingUser({ uid: userDoc.id, ...userDoc.data() }); 
          const ratingSnap = await getDocs(collection(db, 'users', targetUid, 'ratings'));
          setViewingUserRatings(ratingSnap.docs.map(d => ({ id: String(d.id), ...d.data() })));
          const listSnap = await getDocs(collection(db, 'users', targetUid, 'customLists'));
          setViewingUserLists(listSnap.docs.map(d => ({ id: String(d.id), ...d.data() })));
          const watchSnap = await getDocs(collection(db, 'users', targetUid, 'watchlist'));
          setViewingUserWatchlist(watchSnap.docs.map(d => ({ id: String(d.id), ...d.data() })));
          setActiveTab('public_profile');
          setDynamicBg('');
          setSelectedMovie(null);
       }
     } catch(e) { showToast(t.errorOccurred); }
  };

  const handleFollowToggle = async () => {
     if(!user) return setShowLoginModal(true);
     if(!viewingUser || !viewingUser.uid || viewingUser.uid === user.uid) return;
     const targetUid = viewingUser.uid;
     const isFollowing = userProfile?.following?.includes(targetUid);
     
     const newMyFollowing = isFollowing ? (userProfile.following || []).filter(id => id !== targetUid) : [...(userProfile.following || []), targetUid];
     const newTargetFollowers = isFollowing ? (viewingUser.followers || []).filter(id => id !== user.uid) : [...(viewingUser.followers || []), user.uid];
     
     try {
       await setDoc(doc(db, 'users', user.uid), { following: newMyFollowing }, { merge: true });
       const targetUpdate = { followers: newTargetFollowers };
       
       if (!isFollowing) {
          const newNotif = {
             id: 'notif_' + Date.now(),
             type: 'follow',
             fromUid: user.uid,
             fromName: userProfile.displayName || 'Sinefil',
             fromAvatar: userProfile.avatar || AVATAR_DEFAULT,
             date: Date.now(),
             read: false
          };
          const targetDoc = await getDoc(doc(db, 'users', targetUid));
          const currentNotifs = targetDoc.data()?.notifications || [];
          targetUpdate.notifications = [newNotif, ...currentNotifs].slice(0, 20);
       }
       
       await setDoc(doc(db, 'users', targetUid), targetUpdate, { merge: true });
       setUserProfile(prev => ({...prev, following: newMyFollowing}));
       setViewingUser(prev => ({...prev, followers: newTargetFollowers}));
     } catch(e) { showToast(t.errorOccurred); }
  };

  const loadFollowingUsers = async () => {
     if (!userProfile?.following || userProfile.following.length === 0) {
         setFollowingUsersList([]); return;
     }
     try {
         const snaps = await Promise.all(userProfile.following.map(uid => getDoc(doc(db, 'users', uid))));
         setFollowingUsersList(snaps.filter(s => s.exists()).map(s => ({ uid: s.id, ...s.data() })));
     } catch(e) { }
  };

  const loadFollowersUsers = async () => {
     if (!userProfile?.followers || userProfile.followers.length === 0) {
         setFollowersUsersList([]); return;
     }
     try {
         const snaps = await Promise.all(userProfile.followers.map(uid => getDoc(doc(db, 'users', uid))));
         setFollowersUsersList(snaps.filter(s => s.exists()).map(s => ({ uid: s.id, ...s.data() })));
     } catch(e) { }
  };

  const markNotificationsAsRead = async () => {
     if (!userProfile || !userProfile.notifications) return;
     const hasUnread = userProfile.notifications.some(n => !n.read);
     if (hasUnread) {
         const updated = userProfile.notifications.map(n => ({...n, read: true}));
         await setDoc(doc(db, 'users', user.uid), { notifications: updated }, { merge: true });
         setUserProfile(prev => ({...prev, notifications: updated}));
     }
  };

  const handleNotifClick = (uid) => {
     setIsNotifMenuOpen(false);
     loadPublicProfile(uid);
  };

  const copyProfileLink = (uid) => {
    const url = `${window.location.origin}?user=${uid}`;
    navigator.clipboard.writeText(url).then(() => showToast(t.copied));
  };

  const handleShareList = (e, listId, uidOverride = null) => {
    e.stopPropagation();
    const targetUid = uidOverride || user.uid;
    const url = `${window.location.origin}?list=${targetUid}_${listId}`;
    navigator.clipboard.writeText(url).then(() => showToast(t.copied));
  };

  const selectMovieToRate = async (movieId, fallbackTitle = '', shouldResetScores = true) => {
    try {
      let tmdbID = String(movieId);
      if (tmdbID.startsWith('tt')) {
        const searchRes = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(fallbackTitle || tmdbID)}&language=${tmdbLang}`);
        const searchData = await searchRes.json();
        if (searchData.results && searchData.results.length > 0) tmdbID = String(searchData.results[0].id);
        else return;
      }

      const res = await fetch(`https://api.themoviedb.org/3/movie/${tmdbID}?api_key=${TMDB_API_KEY}&append_to_response=credits,videos,similar&language=${tmdbLang}`);
      const data = await res.json();
      
      if (data.id) {
        let relatedMovies = [];
        if (data.belongs_to_collection) {
           try {
             const colRes = await fetch(`https://api.themoviedb.org/3/collection/${data.belongs_to_collection.id}?api_key=${TMDB_API_KEY}&language=${tmdbLang}`);
             const colData = await colRes.json();
             relatedMovies = colData.parts?.filter(p => p.id !== data.id && p.poster_path) || [];
           } catch(e) {}
        }
        if (relatedMovies.length < 10 && data.similar?.results) {
           const sim = data.similar.results.filter(p => p.poster_path && !relatedMovies.find(r => r.id === p.id));
           relatedMovies = [...relatedMovies, ...sim].slice(0, 10);
        } else {
           relatedMovies = relatedMovies.slice(0, 10);
        }
        setSimilarMovies(relatedMovies.map(m => ({
           id: String(m.id),
           title: m.title,
           poster: `https://image.tmdb.org/t/p/w500${m.poster_path}`
        })));
        const poster = data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : 'https://via.placeholder.com/300x450?text=Poster';
        const backdrop = data.backdrop_path ? `https://image.tmdb.org/t/p/w1280${data.backdrop_path}` : '';
        const director = data.credits?.crew?.find(c => c.job === 'Director')?.name || 'Bilinmiyor';
        const cast = data.credits?.cast?.slice(0, 4).map(c => c.name).join(', ') || 'Bilinmiyor';
        
        let trailerKey = null;
        if (data.videos?.results) {
           const trailer = data.videos.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');
           if (trailer) trailerKey = trailer.key;
        }
        
        setSelectedMovie({ 
          id: data.id.toString(), title: data.title, poster, 
          year: data.release_date ? data.release_date.split('-')[0] : '', 
          genre: data.genres?.map(g=>g.name).join(', ') || '', director, cast,
          overview: data.overview || t.noData, trailerKey
        });
        
        setDynamicBg(backdrop); 
        setSearchTerm(''); setSearchResults([]);
        setShowCategoryAverages(false); 
        setIsRatingMode(false);
        setActiveTab('rate');
        
        if (shouldResetScores) {
          const safeMyRatings = Array.isArray(myRatings) ? myRatings : [];
          const existing = safeMyRatings.find(r => r && String(r.id) === String(data.id));
          if(existing && existing.scores) setScores(existing.scores);
          else setScores(criteriaData.reduce((acc, c) => ({ ...acc, [c.id]: 5 }), {}));
        }
      }
    } catch(e) {}
  };

  const calculateFinalScore = () => {
    let total = 0;
    try {
      criteriaData.forEach(c => {
        const val = scores[c.id] ?? 5; 
        total += val * c.weight;
      });
      return parseFloat((total / 100).toFixed(1));
    } catch(e) { return 0; }
  };

  const saveRating = async () => {
    if (!user) { setShowLoginModal(true); return; }
    if (!selectedMovie) return;
    setIsSaving(true);
    
    const newFinalScore = Number(calculateFinalScore());
    const docId = String(selectedMovie.id);

    try {
      const movieRef = doc(db, 'movies', docId);
      const userRatingRef = doc(db, 'users', user.uid, 'ratings', docId);

      await runTransaction(db, async (trans) => {
        const mDoc = await trans.get(movieRef);
        const uDoc = await trans.get(userRatingRef);
        
        const hasVotedBefore = uDoc.exists();
        const oldFinalScore = hasVotedBefore ? Number(uDoc.data()?.finalScore || 0) : 0;
        const oldScores = hasVotedBefore ? (uDoc.data()?.scores || {}) : {};

        if (!mDoc.exists()) {
          const newCatTotals = {};
          criteriaData.forEach(c => newCatTotals[c.id] = scores[c.id] || 0);
          
          trans.set(movieRef, { 
            title: selectedMovie.title, poster: selectedMovie.poster, year: selectedMovie.year, genre: selectedMovie.genre, 
            totalScore: newFinalScore, voteCount: 1, avgScore: newFinalScore, lastUpdated: Date.now(), lastVoteScore: newFinalScore,
            categoryTotals: newCatTotals
          });
        } else {
          const d = mDoc.data();
          let currentTotal = d.totalScore !== undefined ? Number(d.totalScore) : (Number(d.avgScore || 0) * Number(d.voteCount || 0));
          let currentCount = Number(d.voteCount || 0);
          const currentCatTotals = d.categoryTotals || { c1:0, c2:0, c3:0, c4:0, c5:0 };
          const newCatTotals = { ...currentCatTotals };

          if (hasVotedBefore) { 
            currentTotal = currentTotal - oldFinalScore + newFinalScore; 
            criteriaData.forEach(c => {
              newCatTotals[c.id] = Math.max(0, (Number(currentCatTotals[c.id]) || 0) - (oldScores[c.id] || 0) + (scores[c.id] || 0));
            });
          } else { 
            currentTotal = currentTotal + newFinalScore; 
            currentCount = currentCount + 1; 
            criteriaData.forEach(c => {
              newCatTotals[c.id] = (Number(currentCatTotals[c.id]) || 0) + (scores[c.id] || 0);
            });
          }

          const newAvg = currentCount > 0 ? (currentTotal / currentCount) : newFinalScore;
          
          trans.update(movieRef, { 
            totalScore: currentTotal, voteCount: currentCount, avgScore: parseFloat(newAvg.toFixed(1)), 
            lastUpdated: Date.now(), lastVoteScore: newFinalScore,
            categoryTotals: newCatTotals
          });
        }
        trans.set(userRatingRef, { id: docId, title: selectedMovie.title, poster: selectedMovie.poster, scores: scores, finalScore: newFinalScore, date: Date.now(), genre: selectedMovie.genre });
      });

      if (userProfile?.autoRemoveWatchlist) {
         const isListed = myWatchlist.find(w => w.id === docId);
         if (isListed) await deleteDoc(doc(db, 'users', user.uid, 'watchlist', docId));
      }

      showToast(t.saveRating);
      setIsRatingMode(false);
    } catch (e) { showToast(t.errorOccurred); } finally { setIsSaving(false); }
  };

  const handleCloseMovie = () => { setSelectedMovie(null); setDynamicBg(''); setActiveTab('home'); };

  const safeGlobalMovies = Array.isArray(globalMovies) ? globalMovies.filter(m => m && m.id) : [];
  
  const getSortedRatings = (ratingsList, sortType) => {
     return [...ratingsList].sort((a, b) => {
       if (sortType === 'date_desc') return (Number(b.date) || 0) - (Number(a.date) || 0);
       if (sortType === 'my_score_desc') return (Number(b.finalScore) || 0) - (Number(a.finalScore) || 0);
       if (sortType === 'global_score_desc') {
         const globalA = safeGlobalMovies.find(m => String(m.id) === String(a.id))?.avgScore || 0;
         const globalB = safeGlobalMovies.find(m => String(m.id) === String(b.id))?.avgScore || 0;
         return globalB - globalA;
       }
       return 0;
     });
  };

  const safeMyRatings = Array.isArray(myRatings) ? myRatings.filter(r => r && r.id) : [];
  const sortedMyRatings = getSortedRatings(safeMyRatings, ratingSortType);
  
  const safeViewingUserRatings = Array.isArray(viewingUserRatings) ? viewingUserRatings.filter(r => r && r.id) : [];
  const sortedViewingUserRatings = getSortedRatings(safeViewingUserRatings, ratingSortType);

  const sortedWatchlist = [...(Array.isArray(myWatchlist) ? myWatchlist : [])].sort((a,b) => (Number(b.dateAdded) || 0) - (Number(a.dateAdded) || 0));

  const calculateDNA = (ratingsList) => {
      const dna = { c1:0, c2:0, c3:0, c4:0, c5:0 };
      if(ratingsList.length > 0) {
         ratingsList.forEach(r => {
            const globalData = safeGlobalMovies.find(m => String(m.id) === String(r.id));
            const globalAvg = globalData ? Number(globalData.avgScore) : r.finalScore;
            const movieScore = r.finalScore;
            
            criteriaData.forEach(c => { 
               const catScore = r.scores?.[c.id] || 5;
               let weight = 0;
               if (movieScore >= 7 && catScore <= 5) weight += 30;
               else if (movieScore >= 7 && catScore < movieScore) weight += (movieScore - catScore) * 5;
               if (globalAvg >= 7.5 && catScore <= 5) weight += 25;
               if (movieScore <= 5 && catScore >= 7) weight += 20;
               weight += Math.abs(movieScore - catScore) * 3;
               dna[c.id] += weight;
            });
         });
         
         let maxVal = Math.max(...Object.values(dna));
         if (maxVal === 0) maxVal = 1;
         criteriaData.forEach(c => {
            let finalScore = ((dna[c.id] / maxVal) * 10);
            finalScore = Math.max(1.0, Math.min(10.0, finalScore));
            dna[c.id] = parseFloat(finalScore.toFixed(1));
         });
      }
      return dna;
  };

  const getZodiac = (dnaObj, ratingsLength) => {
      let title = t.zodiacDefault;
      let desc = '';
      if (ratingsLength > 0) {
         let maxKey = Object.keys(dnaObj).reduce((a, b) => dnaObj[a] > dnaObj[b] ? a : b);
         const zodiacMap = { c1: t.zodiacC1, c2: t.zodiacC2, c3: t.zodiacC3, c4: t.zodiacC4, c5: t.zodiacC5 };
         const zodiacDescMap = { c1: t.zC1Desc, c2: t.zC2Desc, c3: t.zC3Desc, c4: t.zC4Desc, c5: t.zC5Desc };
         title = zodiacMap[maxKey] || t.zodiacDefault;
         desc = zodiacDescMap[maxKey] || '';
      }
      return { title, desc };
  };

  const userDNA = calculateDNA(sortedMyRatings);
  const { title: zodiacTitle, desc: zodiacDesc } = getZodiac(userDNA, sortedMyRatings.length);

  const getTasteMatch = () => {
    if (!myRatings.length || !viewingUserRatings.length) return null;
    let commonCount = 0;
    let totalMatch = 0;
    myRatings.forEach(myR => {
       const theirR = viewingUserRatings.find(tr => tr.id === myR.id);
       if (theirR) {
          commonCount++;
          const diff = Math.abs((myR.finalScore || 0) - (theirR.finalScore || 0));
          const matchPercent = 100 - ((diff / 9) * 100);
          totalMatch += matchPercent;
        }
    });
    if (commonCount === 0) return null;
    return Math.round(totalMatch / commonCount);
  };
  const tasteMatchScore = viewingUser ? getTasteMatch() : null;

  const getTopGenres = (ratingsList) => {
      const counts = {};
      ratingsList.forEach(m => {
        if(m.genre) m.genre.split(', ').forEach(g => { counts[g] = (counts[g] || 0) + 1; });
      });
      return Object.entries(counts).sort((a,b) => b[1] - a[1]).slice(0, 3);
  };
  const topGenres = getTopGenres(sortedMyRatings);
  const topGenresViewing = getTopGenres(sortedViewingUserRatings);

  const featuredMovies = trendingData.slice(0, 5);
  const currentFeatured = featuredMovies[heroIndex] || null;

  const finalScoreVal = calculateFinalScore();
  const finalDynColor = getScoreColorHex(finalScoreVal);
  
  const dbSelectedMovieData = selectedMovie ? safeGlobalMovies.find(m => String(m.id) === String(selectedMovie.id)) : null;
  const isMovieInWatchlist = selectedMovie && myWatchlist.find(w => w.id === String(selectedMovie.id));

  const filteredCommunityUsers = allUsersList.filter(u => {
     const searchStr = communitySearch.toLowerCase().replace('@', '');
     return (u.userCode || (u.uid ? u.uid.substring(0, 6).toUpperCase() : '')).toLowerCase() === searchStr;
  });

  return (
    <div style={{ "--theme-color": themeColor, "--theme-color-50": themeColor+"80", "--theme-color-20": themeColor+"33" }} className="min-h-screen bg-[#04060C] text-slate-200 font-sans relative overflow-x-hidden selection:bg-theme selection:text-[#04060C]">
      
      <div className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900/40 via-[#04060C] to-[#04060C]">
        {dynamicBg && (
           <>
             <img src={dynamicBg} className="w-full h-full object-cover opacity-20 blur-3xl scale-110" alt="bg"/>
             <div className="absolute inset-0 bg-gradient-to-t from-[#04060C] via-[#04060C]/80 to-transparent"></div>
           </>
        )}
      </div>

      {toast.show && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[999] bg-[#04060C]/90 backdrop-blur-xl border border-theme shadow-theme text-white px-6 py-4 rounded-2xl flex items-center gap-3 font-black animate-in slide-in-from-top-5 fade-in duration-300">
           <CheckCircle2 size={24} className="text-theme"/> {toast.message}
        </div>
      )}

      {activeTab === 'rate' && dbSelectedMovieData && dbSelectedMovieData.voteCount > 0 && dbSelectedMovieData.avgScore <= 2.5 && (
        <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
          <div className="absolute page-fly-1" style={{top: '10%', left: '10%'}}><div className="fly-inner text-4xl">🪰</div></div>
          <div className="absolute page-fly-2" style={{top: '80%', left: '80%'}}><div className="fly-inner text-2xl">🪰</div></div>
          <div className="absolute page-fly-3" style={{top: '50%', left: '50%'}}><div className="fly-inner text-5xl">🪰</div></div>
        </div>
      )}

      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in overflow-y-auto pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-[2rem] p-8 relative shadow-2xl my-8">
            <button onClick={() => setShowProfileModal(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white"><X/></button>
            <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-3"><Settings className="text-theme"/> {t.editProfile}</h3>
            <form onSubmit={handleUpdateProfile} className="space-y-6">
               <div>
                  <label className="text-xs text-slate-400 font-black uppercase mb-2 block tracking-wider">{t.username}</label>
                  <input type="text" value={editName} onChange={e=>setEditName(e.target.value)} autoComplete="name" className="w-full bg-[#04060C] border border-slate-800 p-4 rounded-xl text-white outline-none focus:border-theme shadow-inner font-bold transition-colors"/>
               </div>
               <div>
                  <label className="text-xs text-slate-400 font-black uppercase mb-2 block tracking-wider">{t.bioLabel}</label>
                  <input type="text" value={editBio} onChange={e=>setEditBio(e.target.value)} placeholder={t.bioPlaceholder} maxLength={60} className="w-full bg-[#04060C] border border-slate-800 p-4 rounded-xl text-white outline-none focus:border-theme shadow-inner font-bold transition-colors italic"/>
               </div>
               <div>
                  <label className="text-xs text-slate-400 font-black uppercase mb-3 block tracking-wider">{t.auraColor}</label>
                  <div className="flex flex-wrap gap-3 mb-3">
                    {AURA_COLORS.map(color => (
                       <button type="button" key={color} onClick={() => setEditAura(color)} className={`w-10 h-10 rounded-full border-[3px] transition-transform ${editAura === color ? 'scale-110' : 'scale-90 border-transparent opacity-50'}`} style={{backgroundColor: color, borderColor: editAura === color ? 'white' : 'transparent'}}></button>
                    ))}
                  </div>
               </div>
               <div>
                  <label className="text-xs text-slate-400 font-black uppercase mb-3 block tracking-wider">{t.selectAvatar}</label>
                  <div className="grid grid-cols-5 gap-3 mb-3 max-h-32 overflow-y-auto hide-scrollbar p-1">
                    {AVATAR_PRESETS.map((url, i) => (
                      <img key={i} src={url} onClick={()=>setEditAvatar(url)} className={`w-full aspect-square rounded-xl cursor-pointer border-2 transition-all object-cover ${editAvatar===url ? 'border-theme scale-110 shadow-theme' : 'border-slate-800 hover:border-slate-500 opacity-60 hover:opacity-100'}`} alt="Avatar"/>
                    ))}
                  </div>
               </div>
               <div>
                  <label className="text-xs text-slate-400 font-black uppercase mb-3 block tracking-wider">{t.selectBanner}</label>
                  <div className="grid grid-cols-2 gap-3 mb-3 max-h-40 overflow-y-auto hide-scrollbar p-1">
                    {BANNER_PRESETS.map((url, i) => (
                      <img key={i} src={url} onClick={()=>setEditBanner(url)} className={`w-full h-16 rounded-xl cursor-pointer border-2 transition-all object-cover ${editBanner===url ? 'border-theme shadow-theme scale-105' : 'border-slate-800 opacity-50 hover:opacity-100'}`} alt="Banner"/>
                    ))}
                  </div>
               </div>
               <div className="flex items-center justify-between p-4 bg-[#04060C] border border-slate-800 rounded-xl">
                  <div>
                     <h4 className="text-sm font-black text-white">{t.autoRemoveSetting}</h4>
                     <p className="text-xs text-slate-500 font-bold mt-1 max-w-[250px]">{t.autoRemoveDesc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={editAutoRemove} onChange={() => setEditAutoRemove(!editAutoRemove)} className="sr-only peer"/>
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-theme"></div>
                  </label>
               </div>
               <button type="submit" className="w-full bg-theme hover:bg-theme text-slate-950 font-black p-4 rounded-xl transition-all shadow-theme hover:scale-[1.02] active:scale-[0.98]">{t.saveChanges}</button>
            </form>
          </div>
        </div>
      )}

      {showNewListModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-[2rem] p-8 relative shadow-2xl">
            <button onClick={() => setShowNewListModal(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white"><X/></button>
            <h3 className="text-xl font-black text-white mb-6">{t.createNewList}</h3>
            <form onSubmit={createCustomList} className="space-y-6">
               <input type="text" value={newListName} onChange={e=>setNewListName(e.target.value)} placeholder={t.listNamePlaceholder} className="w-full bg-[#04060C] border border-slate-800 p-4 rounded-xl text-white outline-none focus:border-theme shadow-inner font-bold transition-colors" required/>
               <button type="submit" className="w-full bg-theme hover:bg-theme text-slate-950 font-black p-4 rounded-xl transition-all shadow-lg">{t.add}</button>
            </form>
          </div>
        </div>
      )}

      {showAddToListModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-[2rem] p-6 relative shadow-2xl">
            <button onClick={() => setShowAddToListModal(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X/></button>
            <h3 className="text-lg font-black text-white mb-4">{t.selectList}</h3>
            <div className="space-y-3 mb-4 max-h-60 overflow-y-auto hide-scrollbar">
               {customLists.map(list => (
                 <button key={list.id} onClick={() => addMovieToCustomList(list.id)} className="w-full text-left p-4 bg-[#04060C] border border-slate-800 rounded-xl hover:border-theme transition-colors font-bold text-white flex items-center justify-between">
                   {list.name} <Plus size={16} className="text-theme"/>
                 </button>
               ))}
               {customLists.length === 0 && <p className="text-sm text-slate-500 text-center py-4">{t.emptyWatchlist}</p>}
            </div>
            <button onClick={() => {setShowAddToListModal(false); setShowNewListModal(true);}} className="w-full py-3 border border-slate-700 text-slate-300 hover:bg-slate-800 rounded-xl font-bold transition-colors text-sm">{t.createNewList}</button>
          </div>
        </div>
      )}
      
      {showTop3Modal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-[2rem] p-6 relative shadow-2xl">
            <button onClick={() => setShowTop3Modal(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white"><X/></button>
            <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2"><Trophy className="text-theme"/> {t.top3Title}</h3>
            
            <div className="relative flex items-center mb-4">
              <Search className="absolute left-4 text-slate-400" size={18}/>
              <input 
                type="text" value={top3SearchTerm} onChange={(e) => setTop3SearchTerm(e.target.value)} placeholder={t.selectTop3Search} 
                className="w-full bg-[#04060C] border border-slate-800 rounded-xl pl-12 pr-4 py-4 text-white outline-none focus:border-theme transition-colors shadow-inner font-bold"
              />
              {isTop3Searching && <Loader2 className="absolute right-4 animate-spin text-theme" size={18}/>}
            </div>

            <div className="max-h-64 overflow-y-auto hide-scrollbar space-y-2">
               {top3Results.map(res => (
                 <div key={res.id} onClick={() => saveTop3Movie(res)} className="flex items-center gap-4 p-3 bg-[#04060C] border border-slate-800 hover:border-theme rounded-xl cursor-pointer transition-colors group">
                   <img src={res.poster_path ? `https://image.tmdb.org/t/p/w200${res.poster_path}` : 'https://via.placeholder.com/40'} className="w-10 h-14 object-cover rounded-md shadow-md" alt=""/>
                   <div>
                     <h4 className="text-white font-bold text-sm group-hover:text-theme">{res.title}</h4>
                     <p className="text-slate-500 text-xs font-bold">{res.release_date?.split('-')[0]}</p>
                   </div>
                 </div>
               ))}
               {top3SearchTerm.length > 2 && top3Results.length === 0 && !isTop3Searching && (
                 <p className="text-center text-slate-500 font-bold py-4">{t.noData}</p>
               )}
            </div>
          </div>
        </div>
      )}

      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-[2rem] p-8 relative shadow-2xl">
            <button onClick={() => setShowLoginModal(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white"><X/></button>
            <div className="text-center mb-8 relative">
              <div className="absolute inset-0 bg-theme opacity-10 blur-[50px] rounded-full pointer-events-none"></div>
              <div className="w-20 h-20 rounded-[1.25rem] mx-auto flex items-center justify-center mb-4 border-[3px] border-transparent relative z-10 logo-morph-bg">
                 <Clapperboard size={40} />
              </div>
              <h2 className="text-4xl font-black tracking-tighter drop-shadow-md relative z-10" style={{fontFamily: "'Montserrat', sans-serif"}}>
                <span className="text-white">CINE</span><span className="logo-morph-text drop-shadow-none">SCORE</span>
              </h2>
            </div>
            
            <button onClick={handleGoogleAuth} className="w-full mb-6 py-4 bg-white hover:bg-slate-200 text-black rounded-xl font-black transition-all flex items-center justify-center gap-3 shadow-md hover:scale-[1.02] active:scale-[0.98]">
               <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
               Google {t.login}
            </button>
            <div className="flex items-center gap-4 mb-6"><div className="h-px bg-slate-800 flex-1"></div><span className="text-xs text-slate-500 font-black tracking-widest uppercase">{t.loginOr}</span><div className="h-px bg-slate-800 flex-1"></div></div>
            <div className="flex p-1.5 bg-[#04060C] rounded-xl mb-6 shadow-inner border border-slate-800">
              <button onClick={() => setAuthMode('login')} className={`flex-1 py-3 text-sm font-black rounded-lg transition-all ${authMode === 'login' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:text-white'}`}>{t.login}</button>
              <button onClick={() => setAuthMode('register')} className={`flex-1 py-3 text-sm font-black rounded-lg transition-all ${authMode === 'register' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:text-white'}`}>{t.registerBtn}</button>
            </div>
            <form onSubmit={handleAuth} className="space-y-4">
              {authMode === 'register' && <input type="text" onChange={e=>setDisplayName(e.target.value)} autoComplete="name" placeholder={t.namePlaceholder} required className="w-full p-4 bg-[#04060C] border border-slate-800 rounded-xl text-white shadow-inner outline-none focus:border-theme font-medium transition-colors"/>}
              <input type="email" onChange={e=>setEmail(e.target.value)} autoComplete="username" placeholder={t.emailPlaceholder} required className="w-full p-4 bg-[#04060C] border border-slate-800 rounded-xl text-white shadow-inner outline-none focus:border-theme font-medium transition-colors"/>
              <input type="password" onChange={e=>setPassword(e.target.value)} autoComplete={authMode === 'login' ? 'current-password' : 'new-password'} placeholder={t.passPlaceholder} required minLength={6} className="w-full p-4 bg-[#04060C] border border-slate-800 rounded-xl text-white shadow-inner outline-none focus:border-theme font-medium transition-colors"/>
              {authError && <p className={`text-xs text-center font-bold p-3 rounded-xl ${authError.includes('başarılı') || authError.includes('successful') ? 'text-green-400 bg-green-950/50' : 'text-red-400 bg-red-950/50'}`}>{authError}</p>}
              <button className="w-full p-4 bg-theme hover:bg-theme text-slate-950 font-black rounded-xl transition-all shadow-theme hover:scale-[1.02] active:scale-[0.98]">{isAuthLoading ? <Loader2 className="animate-spin mx-auto" /> : (authMode === 'login' ? t.login : t.registerBtn)}</button>
            </form>
          </div>
        </div>
      )}

      {/* --- PREMİUM HEADER --- */}
      <header className="relative z-40 bg-[#04060C]/80 backdrop-blur-2xl border-b border-slate-800/50 sticky top-0 shadow-sm pt-[env(safe-area-inset-top)]">
        <div className="max-w-[90rem] mx-auto px-4 h-20 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-2 sm:gap-3 cursor-pointer group shrink-0" onClick={handleCloseMovie}>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center border-[2px] border-transparent transition-transform duration-500 group-hover:scale-105 shadow-[0_0_15px_rgba(255,255,255,0.1)] logo-morph-bg">
              <Clapperboard size={24} />
            </div>
            <h1 className="text-xl sm:text-3xl font-black tracking-tighter flex items-center transition-transform duration-500 group-hover:scale-105" style={{fontFamily: "'Montserrat', sans-serif"}}>
               <span className="text-white">CINE</span><span className="logo-morph-text drop-shadow-md">SCORE</span>
            </h1>
          </div>

          <div className="flex-1 max-w-2xl relative hidden sm:block" ref={searchDropdownRef}>
            <div className="relative flex items-center">
              <Search className="absolute left-5 text-slate-400" size={18}/>
              <input 
                type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder={t.searchPlaceholder} 
                className="w-full bg-slate-900 border border-slate-800 hover:border-slate-600 rounded-full pl-12 pr-4 py-3 text-sm text-white outline-none focus:border-theme focus:ring-1 focus:ring-theme transition-all shadow-inner font-medium"
              />
              {isSearching && <Loader2 className="absolute right-5 animate-spin text-theme" size={16}/>}
            </div>
            
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 w-full mt-3 bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                {searchResults.map(result => (
                  <div key={result.id} onClick={() => selectMovieToRate(result.id, result.title)} className="flex items-center gap-4 p-3 hover:bg-slate-800 cursor-pointer border-b border-slate-800 last:border-0 transition-colors">
                    <img src={result.poster_path ? `https://image.tmdb.org/t/p/w200${result.poster_path}` : 'https://via.placeholder.com/40'} className="w-10 h-14 object-cover rounded-lg bg-[#04060C] shadow-md border border-slate-800" alt=""/>
                    <div>
                       <h4 className="text-white font-black text-sm line-clamp-1 drop-shadow-sm">{result.title}</h4>
                       <p className="text-slate-400 text-xs mt-0.5 font-medium">
                         {result.release_date?.split('-')[0] || ''} {result.director ? ` • ${result.director}` : ''}
                       </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 sm:gap-6 shrink-0">
            <div className="relative hidden sm:block" ref={langMenuRef}>
              <button onClick={() => setIsLangMenuOpen(!isLangMenuOpen)} className="flex items-center gap-2 bg-slate-900 border border-slate-800 hover:border-slate-600 px-4 py-2.5 rounded-full transition-colors shadow-sm">
                 <span className="font-black text-sm text-slate-300">{LANGUAGES.find(l => l.code === lang)?.flag}</span>
              </button>
              {isLangMenuOpen && (
                <div className="absolute top-full right-0 mt-3 w-40 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
                  {LANGUAGES.map(l => (
                    <button key={l.code} onClick={() => {setLang(l.code); setIsLangMenuOpen(false);}} className="w-full text-left px-5 py-3 hover:bg-slate-800 text-sm text-white flex items-center gap-3 first:rounded-t-2xl last:rounded-b-2xl border-b border-slate-800 last:border-0 transition-colors">
                      <span className="font-black text-theme">{l.flag}</span> <span className="font-bold">{l.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <nav className="hidden md:flex bg-slate-900/50 p-1.5 rounded-full border border-slate-800 shadow-inner gap-2">
               <button onClick={handleCloseMovie} className={`px-6 py-2.5 rounded-full text-sm font-black transition-all duration-300 hover:scale-105 active:scale-95 ${activeTab === 'home' ? 'bg-theme shadow-theme' : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white shadow-md'}`}>{t.home}</button>
               <button onClick={() => {setActiveTab('global'); setDynamicBg(''); setSelectedMovie(null);}} className={`px-6 py-2.5 rounded-full text-sm font-black transition-all duration-300 hover:scale-105 active:scale-95 ${activeTab === 'global' ? 'bg-theme shadow-theme' : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white shadow-md'}`}>{t.ranking}</button>
               <button onClick={handleOpenCommunity} className={`px-6 py-2.5 rounded-full text-sm font-black transition-all duration-300 hover:scale-105 active:scale-95 ${activeTab === 'community' ? 'bg-theme shadow-theme' : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white shadow-md'}`}>{t.community}</button>
            </nav>

            {userProfile ? (
              <div className="flex items-center gap-2">
                <div className="relative flex items-center justify-center mr-1 sm:mr-3" ref={notifMenuRef}>
                   <button onClick={() => { setIsNotifMenuOpen(!isNotifMenuOpen); markNotificationsAsRead(); }} className="relative p-2.5 bg-slate-900 border border-slate-800 rounded-full hover:border-theme transition-colors shadow-inner group">
                      <Bell size={18} className="text-slate-300 group-hover:text-theme transition-colors"/>
                      {userProfile?.notifications?.some(n => !n.read) && <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-[#04060C] rounded-full"></span>}
                   </button>
                   {isNotifMenuOpen && (
                     <div className="absolute top-full right-0 mt-3 w-72 bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                       <div className="p-4 border-b border-slate-800 bg-[#04060C]/50 font-black text-white">{t.notifications}</div>
                       <div className="max-h-64 overflow-y-auto hide-scrollbar">
                          {userProfile?.notifications?.length > 0 ? userProfile.notifications.map(n => (
                             <div key={n.id} onClick={() => handleNotifClick(n.fromUid)} className="p-4 border-b border-slate-800/50 hover:bg-slate-800 cursor-pointer transition-colors flex gap-3 items-center">
                                <img src={n.fromAvatar || AVATAR_DEFAULT} className="w-10 h-10 rounded-full border border-slate-700 object-cover shrink-0" alt=""/>
                                <div className="text-xs text-slate-300 leading-tight">
                                   <strong className="text-white block mb-0.5">{n.fromName}</strong>
                                   {n.type === 'follow' && t.startedFollowing}
                                </div>
                             </div>
                          )) : <div className="p-6 text-center text-slate-500 text-sm font-bold">{t.noNotifications}</div>}
                       </div>
                     </div>
                   )}
                </div>

                <div className="relative md:pl-4 md:border-l border-slate-800" ref={profileMenuRef}>
                  <div className="flex items-center gap-3 group cursor-pointer" onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}>
                    <div className="relative">
                      <img src={userProfile?.avatar || AVATAR_DEFAULT} className={`w-11 h-11 rounded-full border-[3px] transition-all duration-300 object-cover shadow-lg ${activeTab.startsWith('profile') ? 'border-theme shadow-theme' : 'border-slate-700 bg-slate-900 group-hover:border-theme'}`} alt="Avatar"/>
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 rounded-full border-2 border-[#04060C] flex items-center justify-center shadow-lg">
                         <span className="text-[10px] font-black text-white">{sortedMyRatings.length}</span>
                      </div>
                    </div>
                  </div>
                  
                  {isProfileMenuOpen && (
                    <div className="absolute top-full right-0 mt-3 w-56 bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                      <div className="p-4 border-b border-slate-800 bg-[#04060C]/50">
                         <p className="text-sm font-black text-white truncate">{userProfile?.displayName}</p>
                         <p className="text-xs font-bold text-slate-500 truncate">{userProfile?.email}</p>
                      </div>
                      <div className="py-2">
                        <button onClick={() => { setActiveTab('profile_general'); setDynamicBg(''); setSelectedMovie(null); setIsProfileMenuOpen(false); }} className={`w-full text-left px-5 py-3 text-sm font-bold flex items-center gap-3 transition-colors ${activeTab === 'profile_general' ? 'text-theme bg-slate-800' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}><User size={18}/> {t.profileGeneral}</button>
                        <button onClick={() => { loadFollowersUsers(); setActiveTab('profile_followers'); setDynamicBg(''); setSelectedMovie(null); setIsProfileMenuOpen(false); }} className={`w-full text-left px-5 py-3 text-sm font-bold flex items-center gap-3 transition-colors ${activeTab === 'profile_followers' ? 'text-theme bg-slate-800' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}><Users size={18}/> {t.followersTab}</button>
                        <button onClick={() => { loadFollowingUsers(); setActiveTab('profile_following'); setDynamicBg(''); setSelectedMovie(null); setIsProfileMenuOpen(false); }} className={`w-full text-left px-5 py-3 text-sm font-bold flex items-center gap-3 transition-colors ${activeTab === 'profile_following' ? 'text-theme bg-slate-800' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}><UserPlus size={18}/> {t.followingTab}</button>
                        <button onClick={() => { setActiveTab('profile_ratings'); setDynamicBg(''); setSelectedMovie(null); setIsProfileMenuOpen(false); }} className={`w-full text-left px-5 py-3 text-sm font-bold flex items-center gap-3 transition-colors ${activeTab === 'profile_ratings' ? 'text-theme bg-slate-800' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}><Film size={18}/> {t.myRatedMovies}</button>
                        <button onClick={() => { setActiveTab('profile_watchlist'); setDynamicBg(''); setSelectedMovie(null); setIsProfileMenuOpen(false); }} className={`w-full text-left px-5 py-3 text-sm font-bold flex items-center gap-3 transition-colors ${activeTab === 'profile_watchlist' ? 'text-theme bg-slate-800' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}><Bookmark size={18}/> {t.customLists}</button>
                      </div>
                      <div className="py-2 border-t border-slate-800">
                        <button onClick={handleLogout} className="w-full text-left px-5 py-3 text-sm font-black text-rose-500 hover:bg-rose-500/10 flex items-center gap-3 transition-colors"><LogOut size={18}/> {t.logout}</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <button onClick={() => setShowLoginModal(true)} className="flex items-center gap-2 px-6 py-3 bg-theme hover:bg-theme text-[#04060C] rounded-full transition-all text-sm font-black shadow-theme hover:scale-105 active:scale-95">
                <LogIn size={18} /> <span className="hidden sm:inline">{t.login}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-[90rem] mx-auto px-4 py-6 sm:py-10 pb-36 md:pb-16">
        
        {/* YENİ: TOPLULUK ARAMA EKRANI (GİZLİLİK ODAKLI) */}
        {activeTab === 'community' && (
          <div className="animate-in fade-in duration-500 space-y-8 max-w-5xl mx-auto">
             <div className="bg-slate-900/80 backdrop-blur-xl rounded-[2.5rem] p-8 sm:p-12 border border-slate-800 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 blur-[100px] rounded-full pointer-events-none" style={{backgroundColor: themeColor + '20'}}></div>
                <h2 className="text-3xl sm:text-4xl font-black text-white flex items-center gap-3 drop-shadow-md mb-6 relative z-10"><Users className="text-theme" size={36}/> {t.community}</h2>
                <div className="relative flex items-center z-10">
                  <Search className="absolute left-6 text-slate-400" size={20}/>
                  <input 
                    type="text" value={communitySearch} onChange={(e) => setCommunitySearch(e.target.value)} placeholder={t.searchUsers} maxLength={7}
                    className="w-full bg-[#04060C] border border-slate-800 rounded-2xl pl-14 pr-6 py-5 text-white outline-none focus:border-theme transition-colors shadow-inner font-bold text-lg uppercase"
                  />
                </div>
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {communitySearch.replace('@', '').length !== 6 ? (
                  <div className="col-span-full text-center py-20 text-slate-500 font-bold bg-slate-900/50 rounded-[2rem] border border-slate-800 border-dashed">
                     <Lock size={48} className="mx-auto mb-4 opacity-50 text-theme"/>
                     <p className="text-lg text-slate-300 mb-2">{t.communityPrivacyTitle}</p>
                     <p className="text-sm max-w-sm mx-auto">{t.exactCodeRequired}</p>
                  </div>
                ) : filteredCommunityUsers.length > 0 ? (
                  filteredCommunityUsers.map(u => (
                    <div key={u.uid} onClick={() => loadPublicProfile(u.uid)} className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-3xl p-6 shadow-xl flex items-center gap-4 cursor-pointer hover:border-theme hover:-translate-y-1 transition-all group">
                       <img src={u.avatar || AVATAR_DEFAULT} className="w-16 h-16 rounded-full border-2 border-[#04060C] group-hover:border-theme transition-colors object-cover" alt=""/>
                       <div>
                         <h4 className="text-lg font-black text-white group-hover:text-theme transition-colors line-clamp-1">{u.displayName} <span className="text-slate-500 text-sm font-bold ml-1">@{u.userCode || (u.uid ? u.uid.substring(0,6).toUpperCase() : '')}</span></h4>
                         <p className="text-xs font-bold text-slate-500 mt-1">{u.followers?.length || 0} {t.followers}</p>
                       </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-20 text-slate-500 font-bold bg-slate-900/50 rounded-[2rem] border border-slate-800 border-dashed">{t.noData}</div>
                )}
             </div>
          </div>
        )}

        {/* YENİ: TAKİP ETTİKLERİM EKRANI */}
        {activeTab === 'profile_following' && (
          <div className="animate-in fade-in duration-500 space-y-8 max-w-5xl mx-auto">
             <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-black text-white flex items-center gap-3 drop-shadow-md"><Users className="text-theme"/> {t.followingTab}</h2>
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {followingUsersList.length > 0 ? followingUsersList.map(u => (
                  <div key={u.uid} onClick={() => loadPublicProfile(u.uid)} className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-3xl p-6 shadow-xl flex items-center gap-4 cursor-pointer hover:border-theme hover:-translate-y-1 transition-all group">
                     <img src={u.avatar || AVATAR_DEFAULT} className="w-16 h-16 rounded-full border-2 border-[#04060C] group-hover:border-theme transition-colors object-cover" alt=""/>
                     <div>
                       <h4 className="text-lg font-black text-white group-hover:text-theme transition-colors line-clamp-1">{u.displayName}</h4>
                       <p className="text-xs font-bold text-slate-500 mt-1">@{u.userCode || (u.uid ? u.uid.substring(0,6).toUpperCase() : '')}</p>
                     </div>
                  </div>
                )) : (
                  <div className="col-span-full text-center py-20 text-slate-500 font-bold bg-slate-900/50 rounded-[2rem] border border-slate-800 border-dashed">{t.noData}</div>
                )}
             </div>
          </div>
        )}

        {/* YENİ: TAKİPÇİLERİM EKRANI */}
        {activeTab === 'profile_followers' && (
          <div className="animate-in fade-in duration-500 space-y-8 max-w-5xl mx-auto">
             <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-black text-white flex items-center gap-3 drop-shadow-md"><Users className="text-theme"/> {t.followersTab}</h2>
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {followersUsersList.length > 0 ? followersUsersList.map(u => (
                  <div key={u.uid} onClick={() => loadPublicProfile(u.uid)} className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-3xl p-6 shadow-xl flex items-center gap-4 cursor-pointer hover:border-theme hover:-translate-y-1 transition-all group">
                     <img src={u.avatar || AVATAR_DEFAULT} className="w-16 h-16 rounded-full border-2 border-[#04060C] group-hover:border-theme transition-colors object-cover" alt=""/>
                     <div>
                       <h4 className="text-lg font-black text-white group-hover:text-theme transition-colors line-clamp-1">{u.displayName}</h4>
                       <p className="text-xs font-bold text-slate-500 mt-1">@{u.userCode || (u.uid ? u.uid.substring(0,6).toUpperCase() : '')}</p>
                     </div>
                  </div>
                )) : (
                  <div className="col-span-full text-center py-20 text-slate-500 font-bold bg-slate-900/50 rounded-[2rem] border border-slate-800 border-dashed">{t.noData}</div>
                )}
             </div>
          </div>
        )}

        {/* YENİ: PUBLIC PROFILE EKRANI */}
        {activeTab === 'public_profile' && viewingUser && (
          <div className="animate-in slide-in-from-right-8 duration-500 max-w-5xl mx-auto space-y-8">
            <button onClick={() => {setActiveTab('community'); setViewingUser(null);}} className="px-5 py-3 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 text-white font-bold flex items-center gap-2 transition-colors">
               <ChevronLeft size={18}/> Geri
            </button>
            
            <div className="relative rounded-[2.5rem] overflow-hidden border border-slate-800 shadow-2xl group bg-slate-900/50">
              <div className="h-48 sm:h-64 w-full relative">
                 <img src={viewingUser.banner || BANNER_PRESETS[0]} className="w-full h-full object-cover opacity-80" alt="Banner" />
                 <div className="absolute inset-0 bg-gradient-to-t from-[#04060C] via-[#04060C]/60 to-transparent"></div>
                 
                 <div className="absolute top-6 right-6 flex gap-2 z-20">
                   <button onClick={() => copyProfileLink(viewingUser.uid)} className="px-4 py-2 bg-[#04060C]/50 text-slate-300 hover:text-white border border-slate-700 hover:border-white rounded-xl backdrop-blur font-bold flex items-center gap-2 transition-all shadow-lg">
                      <Link size={16}/> <span className="hidden sm:inline">{t.shareProfile}</span>
                   </button>
                   {user && user.uid !== viewingUser.uid && (
                     <button onClick={handleFollowToggle} className={`px-4 py-2 rounded-xl backdrop-blur font-bold flex items-center gap-2 transition-all shadow-lg border ${userProfile?.following?.includes(viewingUser.uid) ? 'bg-rose-500/20 text-rose-500 border-rose-500/50 hover:bg-rose-500 hover:text-white' : 'bg-theme-transparent hover:bg-theme'}`}>
                        {userProfile?.following?.includes(viewingUser.uid) ? <><UserMinus size={16}/> <span className="hidden sm:inline">{t.unfollow}</span></> : <><UserPlus size={16} className={userProfile?.following?.includes(viewingUser.uid) ? '' : 'text-theme'}/> <span className={`hidden sm:inline ${userProfile?.following?.includes(viewingUser.uid) ? '' : 'text-theme'}`}>{t.follow}</span></>}
                     </button>
                   )}
                 </div>
              </div>
              <div className="px-8 pb-8 sm:px-12 relative -mt-20 sm:-mt-24 flex flex-col sm:flex-row items-center sm:items-end gap-6 sm:gap-8">
                 <div className="relative">
                   <img src={viewingUser.avatar || AVATAR_DEFAULT} className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-[#04060C] bg-[#04060C] object-cover shadow-[0_0_30px_rgba(0,0,0,0.5)] z-10 relative" style={{boxShadow: `0 0 30px ${themeColor}4d`}} alt="Avatar"/>
                   <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-theme rounded-full border-[3px] border-[#04060C] flex items-center justify-center shadow-lg transform rotate-12 z-20">
                     <span className="text-xs font-black text-[#04060C]">{sortedViewingUserRatings.length}</span>
                   </div>
                 </div>
                 <div className="text-center sm:text-left flex-1 mb-2">
                    <div className="flex flex-col sm:flex-row sm:items-end gap-2 sm:gap-4 mb-1">
                      <h2 className="text-4xl sm:text-5xl font-black text-white drop-shadow-md tracking-tight">{viewingUser.displayName}</h2>
                      <span className="font-black text-lg px-3 py-1 rounded-xl border w-max mx-auto sm:mx-0" style={{color: themeColor, backgroundColor: themeColor+'1a', borderColor: themeColor+'4d'}}>@{viewingUser.userCode || (viewingUser.uid ? viewingUser.uid.substring(0,6).toUpperCase() : '')}</span>
                    </div>
                    <div className="flex items-center justify-center sm:justify-start gap-4 mb-3 mt-2">
                       <span className="text-slate-400 font-bold text-sm"><strong className="text-white">{viewingUser.followers?.length || 0}</strong> {t.followers}</span>
                       <span className="text-slate-400 font-bold text-sm"><strong className="text-white">{viewingUser.following?.length || 0}</strong> {t.following}</span>
                    </div>
                    {viewingUser.bio && (
                      <div className="flex items-start justify-center sm:justify-start gap-2 text-theme">
                        <Quote size={14} className="mt-1 opacity-50 shrink-0"/>
                        <p className="font-medium italic text-sm sm:text-base drop-shadow-sm max-w-lg">{viewingUser.bio}</p>
                      </div>
                    )}
                 </div>
              </div>
            </div>
            
            {/* ZEVK UYUMU KARTI */}
            {tasteMatchScore !== null && (
              <div className="flex justify-center -mt-4 mb-4">
                 <div className="flex items-center gap-3 bg-gradient-to-r from-orange-500/10 to-rose-500/10 border border-orange-500/30 px-6 py-3 rounded-2xl shadow-[0_0_20px_rgba(249,115,22,0.15)]">
                    <Flame size={24} className="text-orange-500 animate-pulse" />
                    <span className="text-sm font-bold text-slate-300">{t.tasteMatch}: <strong className="text-orange-400 text-lg ml-1">% {tasteMatchScore}</strong></span>
                 </div>
              </div>
            )}

            <div className="bg-gradient-to-br from-slate-800/40 via-slate-900/90 to-slate-800/20 backdrop-blur-xl rounded-[2.5rem] p-8 sm:p-12 border border-slate-700/30 shadow-[0_0_50px_rgba(0,0,0,0.3)] relative overflow-hidden" style={{boxShadow: `0 0 50px ${themeColor}1a`, borderColor: themeColor+'33'}}>
               <div className="absolute top-0 right-0 w-64 h-64 blur-[100px] rounded-full pointer-events-none" style={{backgroundColor: themeColor+'1a'}}></div>
               <div className="text-center mb-8 relative z-10">
                 <h3 className="text-3xl sm:text-4xl font-black text-white flex items-center justify-center gap-3 drop-shadow-md mb-2"><Trophy className="text-theme" size={36}/> {t.top3Title}</h3>
               </div>
               
               <div className="flex justify-center items-center gap-2 sm:gap-6 mt-10 relative z-10">
                  {[0, 1, 2].map(slot => {
                    const movie = viewingUser.top3?.[slot];
                    const isCenter = slot === 1;
                    return (
                      <div key={slot} className={`relative aspect-[2/3] rounded-2xl sm:rounded-[2rem] border-[3px] flex flex-col items-center justify-center transition-all duration-500 group overflow-hidden shadow-2xl ${isCenter ? 'w-40 sm:w-56 z-20 scale-110' : 'w-32 sm:w-44 border-slate-700 bg-[#04060C] z-10'}`} style={isCenter ? {borderColor: themeColor, boxShadow: `0 0 40px ${themeColor}66`} : {}}>
                        {movie ? (
                          <>
                            <img src={movie.poster} className="w-full h-full object-cover cursor-pointer" onClick={() => selectMovieToRate(movie.id, movie.title)} alt=""/>
                            {isCenter && (
                              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-10 h-10 flex items-center justify-center z-30 pointer-events-none" style={{filter: `drop-shadow(0 0 15px ${themeColor})`}}>
                                 <Crown size={28} className="animate-pulse" style={{color: themeColor, fill: themeColor}}/>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="w-full h-full bg-[#04060C] flex items-center justify-center">
                            <Film size={36} className="text-slate-800"/>
                          </div>
                        )}
                      </div>
                    )
                  })}
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               <div className="bg-slate-900/80 backdrop-blur-xl rounded-[2.5rem] p-8 border border-slate-800 shadow-xl flex flex-col group cursor-pointer" onClick={() => setActiveTab('public_profile_ratings')}>
                 <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-black text-white flex items-center gap-3 drop-shadow-md group-hover:text-theme transition-colors"><Film className="text-theme" size={24}/> {t.theirRatedMovies} ({sortedViewingUserRatings.length})</h3>
                    <button className="text-xs font-black text-theme group-hover:text-white transition-colors">{t.viewAll} &rarr;</button>
                 </div>
                 {sortedViewingUserRatings.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center"><p className="text-slate-500 text-sm font-bold text-center py-8">{t.noRating}</p></div>
                 ) : (
                    <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
                       {sortedViewingUserRatings.slice(0, 10).map(item => (
                         <div key={item.id} className="relative w-24 shrink-0 hover:-translate-y-1 transition-transform">
                           <img src={item.poster || 'https://via.placeholder.com/200x300?text=Poster'} className="w-full aspect-[2/3] object-cover rounded-xl border border-slate-700 shadow-md group-hover:border-theme transition-all" alt=""/>
                           <div className="absolute inset-0 bg-gradient-to-t from-[#04060C] via-transparent to-transparent rounded-xl opacity-90 flex flex-col justify-end p-2">
                              <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{t.theirScore}</span>
                              <span className="text-xl font-black text-white drop-shadow-md">{Number(item.finalScore).toFixed(1)}</span>
                           </div>
                         </div>
                       ))}
                    </div>
                 )}
               </div>

               <div className="bg-slate-900/80 backdrop-blur-xl rounded-[2.5rem] p-8 border border-slate-800 shadow-xl flex flex-col">
                 <h3 className="text-xl font-black text-white mb-6 flex items-center gap-3 drop-shadow-md"><PieChart className="text-theme" size={24}/> {t.topGenres}</h3>
                 {topGenresViewing.length === 0 ? (
                    <p className="text-slate-500 text-sm font-bold text-center py-8">{t.noRating}</p>
                 ) : (
                    <div className="space-y-4">
                      {topGenresViewing.map(([genre, count]) => {
                         const percentage = (count / sortedViewingUserRatings.length) * 100;
                         return (
                           <div key={genre}>
                             <div className="flex justify-between items-end mb-1">
                               <span className="font-bold text-slate-300 text-sm">{genre}</span>
                               <span className="font-black text-sm text-slate-500">{count} {t.voteCount}</span>
                             </div>
                             <div className="h-2 bg-[#04060C] rounded-full overflow-hidden border border-slate-800 shadow-inner">
                               <div className="h-full rounded-full transition-all duration-1000" style={{width: `${percentage}%`, backgroundColor: themeColor}}></div>
                             </div>
                           </div>
                         )
                      })}
                    </div>
                 )}
               </div>
            </div>

            {/* Ziyaret Edilen Kullanıcı DNA (20 Film Sınırı) */}
            <div className="bg-slate-900/80 backdrop-blur-xl rounded-[2.5rem] p-8 border border-slate-800 shadow-xl">
                <h3 className="text-2xl font-black text-white mb-2 flex items-center gap-3 drop-shadow-md"><Sparkles className="text-theme" size={28}/> {t.cinematicDNA}</h3>
                {sortedViewingUserRatings.length >= 20 ? (
                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6">
                       {criteriaData.map((c) => {
                          const dnaObj = calculateDNA(sortedViewingUserRatings);
                          const score = dnaObj[c.id];
                          const color = getScoreColorHex(score);
                          return (
                            <div key={c.id}>
                               <div className="flex justify-between items-end mb-2">
                                 <span className="font-bold text-slate-300 text-sm tracking-wide">{c.name}</span>
                                 <span className="font-black text-lg" style={{color: color, textShadow: `0 0 10px ${color}80`}}>{score}</span>
                               </div>
                               <div className="h-2 bg-[#04060C] rounded-full overflow-hidden border border-slate-800 shadow-inner">
                                 <div className="h-full rounded-full transition-all duration-1000 relative" style={{width: `${score * 10}%`, backgroundColor: color, boxShadow: `0 0 10px ${color}80`}}>
                                    <div className="absolute inset-0 bg-white/20 w-full h-full animate-[pulse_2s_infinite]"></div>
                                 </div>
                               </div>
                            </div>
                          )
                       })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                       <Lock size={48} className="text-slate-600 mb-4"/>
                       <h4 className="text-xl font-black text-white">{t.dnaLockedTitle}</h4>
                       <p className="text-sm text-slate-400 font-bold mt-2 max-w-sm">{t.dnaLockedDescPublic}</p>
                    </div>
                )}
            </div>
            
          </div>
        )}

        {/* YENİ: BAŞKASININ TÜM OYLADIĞI FİLMLER EKRANI */}
        {activeTab === 'public_profile_ratings' && viewingUser && (
          <div className="animate-in slide-in-from-right-8 duration-500 max-w-7xl mx-auto space-y-8">
            <button onClick={() => setActiveTab('public_profile')} className="px-5 py-3 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 text-white font-bold flex items-center gap-2 transition-colors w-max">
               <ChevronLeft size={18}/> Geri
            </button>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
              <h3 className="text-2xl font-black text-white flex items-center gap-3 drop-shadow-md"><Film className="text-theme" size={28}/> {viewingUser.displayName} - {t.theirRatedMovies}</h3>
              <div className="flex items-center gap-3 bg-[#04060C] p-2 rounded-2xl border border-slate-800 shadow-inner">
                 <ListFilter size={18} className="text-slate-400 ml-2" />
                 <select 
                   value={ratingSortType} 
                   onChange={(e) => setRatingSortType(e.target.value)}
                   className="bg-transparent text-sm font-bold text-white outline-none cursor-pointer pr-2"
                 >
                    <option value="date_desc" className="bg-slate-900">{t.sortDate}</option>
                    <option value="my_score_desc" className="bg-slate-900">{t.sortMyScore}</option>
                    <option value="global_score_desc" className="bg-slate-900">{t.sortGlobalScore}</option>
                 </select>
              </div>
            </div>

            {sortedViewingUserRatings.length === 0 ? (
               <div className="text-center py-20 bg-slate-900/50 rounded-3xl border border-slate-800 border-dashed">
                 <p className="text-slate-400 font-bold">{t.noRating}</p>
               </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                {sortedViewingUserRatings.map((rating, index) => {
                  const safeId = rating.id ? String(rating.id) : `temp-${index}`;
                  const displayTitle = localizedData?.[safeId]?.title || rating.title;
                  const safeScore = Number(rating.finalScore) || 0;
                  const safePoster = typeof rating.poster === 'string' && rating.poster.startsWith('http') ? rating.poster : 'https://via.placeholder.com/200x300?text=Poster';

                  const globalData = safeGlobalMovies.find(g => String(g.id) === safeId);
                  const globalScore = globalData ? Number(globalData.avgScore) : 0;
                  const isNeon = globalScore >= 9.0;

                  return (
                    <div key={safeId} className="relative group cursor-pointer" onClick={() => selectMovieToRate(safeId, rating.title)}>
                       <img src={safePoster} className="w-full aspect-[2/3] object-cover rounded-3xl bg-slate-900 border border-slate-800 group-hover:border-theme transition-colors shadow-2xl" alt=""/>
                       
                       {globalScore > 0 && (
                         <div className={`absolute top-2 right-2 px-2 py-1 rounded-lg backdrop-blur shadow-xl z-10 pointer-events-none flex flex-col items-center justify-center ${isNeon ? 'bg-[#04060C] border shadow-theme animate-pulse' : 'bg-[#04060C]/90 border border-slate-700'}`} style={isNeon ? {borderColor: themeColor} : {}}>
                           <span className="text-[8px] sm:text-[10px] text-slate-400 font-black mb-0.5 uppercase tracking-widest leading-none">{t.globalScoreLabel}</span>
                           <span className="text-sm font-black leading-none" style={{color: isNeon ? themeColor : getScoreColorHex(globalScore), textShadow: isNeon ? `0 0 10px ${themeColor}` : 'none'}}>{globalScore.toFixed(1)}</span>
                         </div>
                       )}

                       <div className="absolute inset-0 bg-gradient-to-t from-[#04060C] via-[#04060C]/40 to-transparent rounded-3xl opacity-90 group-hover:opacity-100 flex flex-col justify-end p-4 transition-opacity">
                          <div>
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest block mb-1 drop-shadow-md">{t.theirScore}</span>
                            <div className="relative w-max">
                              <MiniVFX score={safeScore} />
                              <div className="relative z-10 text-4xl font-black leading-none mb-1 drop-shadow-lg transition-colors" style={{color: getScoreColorHex(safeScore), textShadow: `0 0 10px ${getScoreColorHex(safeScore)}80`}}>{safeScore.toFixed(1)}</div>
                            </div>
                          </div>
                          <h4 className="font-bold text-white text-sm leading-tight line-clamp-2 drop-shadow-md mt-1">{displayTitle}</h4>
                       </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 1: ZENGİN ANA SAYFA */}
        {activeTab === 'home' && (
          <div className="animate-in fade-in duration-500 space-y-12 sm:space-y-16">
            
            {currentFeatured && (
              <div className="relative w-full h-[500px] sm:h-[700px] rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-800 group">
                <img src={currentFeatured.backdrop || currentFeatured.poster} className="absolute inset-0 w-full h-full object-cover transition-all duration-1000 group-hover:scale-105" alt=""/>
                <div className="absolute inset-0 bg-gradient-to-t from-[#04060C] via-[#04060C]/50 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-[#04060C] via-slate-950/40 to-transparent"></div>
                
                <button onClick={(e) => { e.stopPropagation(); setHeroIndex((prev) => (prev === 0 ? featuredMovies.length - 1 : prev - 1)); }} className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-[#04060C]/50 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-theme hover:text-black border border-slate-700 transition-colors z-20 hidden md:flex"><ChevronLeft size={28}/></button>
                <button onClick={(e) => { e.stopPropagation(); setHeroIndex((prev) => (prev + 1) % featuredMovies.length); }} className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-[#04060C]/50 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-theme hover:text-black border border-slate-700 transition-colors z-20 hidden md:flex"><ChevronRight size={28}/></button>

                <div className="absolute bottom-0 left-0 p-8 sm:p-16 w-full max-w-4xl z-10">
                  <div className="flex items-center gap-2 mb-4"><Award className="text-theme" size={24}/><span className="text-theme font-black tracking-widest text-sm uppercase drop-shadow">{t.featured}</span></div>
                  <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-4 leading-tight drop-shadow-2xl line-clamp-2">{currentFeatured.title}</h2>
                  <p className="text-slate-300 text-sm sm:text-base lg:text-lg line-clamp-2 sm:line-clamp-3 mb-8 drop-shadow-lg font-medium max-w-2xl">{currentFeatured.overview}</p>
                  
                  <div className="flex flex-wrap gap-3 sm:gap-4">
                    <button onClick={() => selectMovieToRate(currentFeatured.tmdbId, currentFeatured.title)} className="px-6 py-3 sm:px-8 sm:py-4 bg-theme text-[#04060C] hover:bg-theme rounded-full font-black transition-all flex items-center gap-2 sm:gap-3 shadow-theme text-lg sm:text-xl hover:scale-105 active:scale-95">
                      <Star size={20} className="fill-[#04060C] sm:w-6 sm:h-6"/> {t.rateNow}
                    </button>
                    {currentFeatured.trailerKey && (
                      <a href={`https://www.youtube.com/watch?v=${currentFeatured.trailerKey}`} target="_blank" rel="noreferrer" className="px-6 py-3 sm:px-8 sm:py-4 bg-slate-900/80 backdrop-blur text-white hover:bg-white hover:text-black border border-slate-700 hover:border-white rounded-full font-black transition-all flex items-center gap-2 sm:gap-3 shadow-xl text-lg sm:text-xl hover:scale-105 active:scale-95 group">
                        <Play size={20} className="fill-current text-white group-hover:text-red-600 sm:w-6 sm:h-6"/> {t.watchTrailer}
                      </a>
                    )}
                  </div>
                </div>

                <div className="absolute bottom-6 right-6 sm:bottom-10 sm:right-10 w-32 sm:w-48 h-1.5 bg-slate-800/50 rounded-full overflow-hidden z-20 backdrop-blur-md shadow-inner">
                   <div key={heroIndex} className="h-full bg-theme animate-hero-bar shadow-theme"></div>
                </div>
              </div>
            )}

            {trendingData.length > 0 && <MovieRow title={t.trending} movies={trendingData} icon={<TrendingUp className="text-amber-500" size={28}/>} t={t} selectMovieToRate={selectMovieToRate} globalMoviesList={safeGlobalMovies} localizedData={localizedData} themeColor={themeColor}/>}
            {turkishMovies.length > 0 && <MovieRow title={t.turkishCinema} movies={turkishMovies} icon={<Globe className="text-amber-500" size={28}/>} t={t} selectMovieToRate={selectMovieToRate} globalMoviesList={safeGlobalMovies} localizedData={localizedData} themeColor={themeColor}/>}
            {sciFiMovies.length > 0 && <MovieRow title={t.sciFi} movies={sciFiMovies} icon={<Rocket className="text-amber-500" size={28}/>} t={t} selectMovieToRate={selectMovieToRate} globalMoviesList={safeGlobalMovies} localizedData={localizedData} themeColor={themeColor}/>}
            {comedyMovies.length > 0 && <MovieRow title={t.comedy} movies={comedyMovies} icon={<Smile className="text-amber-500" size={28}/>} t={t} selectMovieToRate={selectMovieToRate} globalMoviesList={safeGlobalMovies} localizedData={localizedData} themeColor={themeColor}/>}
            {cultClassics.length > 0 && <MovieRow title={t.cultClassics} movies={cultClassics} icon={<Award className="text-amber-500" size={28}/>} t={t} selectMovieToRate={selectMovieToRate} globalMoviesList={safeGlobalMovies} localizedData={localizedData} themeColor={themeColor}/>}
            {actionMovies.length > 0 && <MovieRow title={t.actionPacked} movies={actionMovies} icon={<Flame className="text-amber-500" size={28}/>} t={t} selectMovieToRate={selectMovieToRate} globalMoviesList={safeGlobalMovies} localizedData={localizedData} themeColor={themeColor}/>}

          </div>
        )}

        {/* TAB 2: PUANLAMA EKRANI */}
        {activeTab === 'rate' && selectedMovie && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in zoom-in-95 duration-300 max-w-7xl mx-auto">
            
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-slate-900/80 backdrop-blur-xl rounded-[2.5rem] p-6 sm:p-8 border border-slate-800 shadow-2xl relative text-center">
                <button onClick={handleCloseMovie} className="absolute top-4 left-4 p-2 bg-[#04060C] rounded-xl text-slate-400 hover:text-white transition-colors z-10 shadow-md border border-slate-800 hover:scale-110"><X size={18}/></button>
                
                <div className="absolute top-4 right-4 flex gap-3 z-30">
                   <div className="relative group">
                     <button onClick={() => setShowAddToListModal(true)} className="p-3 sm:p-4 rounded-2xl transition-all shadow-xl border border-slate-700 hover:border-theme bg-[#04060C]/80 backdrop-blur text-slate-300 hover:text-theme hover:scale-110">
                       <ListPlus size={24}/>
                     </button>
                     <div className="absolute bottom-full right-0 mb-2 w-max bg-[#04060C] text-slate-200 text-xs font-bold py-2 px-3 rounded-xl border border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl">
                        {t.addCustomListHover}
                     </div>
                   </div>

                   <div className="relative group">
                     <button onClick={toggleWatchlist} className={`p-3 sm:p-4 rounded-2xl transition-all shadow-xl border hover:scale-110 flex items-center justify-center ${isMovieInWatchlist ? 'bg-theme-transparent border-theme hover:bg-theme' : 'bg-[#04060C]/80 backdrop-blur text-slate-300 border-slate-700 hover:text-white hover:border-slate-500'}`}>
                       {isMovieInWatchlist ? <BookmarkCheck size={24} className="fill-current"/> : <Bookmark size={24} />}
                     </button>
                     <div className="absolute bottom-full right-0 mb-2 w-max bg-[#04060C] text-slate-200 text-xs font-bold py-2 px-3 rounded-xl border border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl">
                        {isMovieInWatchlist ? t.removeWatchlistHover : t.addWatchlistHover}
                     </div>
                   </div>
                </div>

                <img src={selectedMovie?.poster} className="w-48 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.6)] mx-auto mb-6 border-2 border-slate-800 object-cover mt-8 sm:mt-12" alt="Poster"/>
                <h2 className="text-3xl font-black text-white leading-tight mb-3 drop-shadow-lg">{selectedMovie?.title}</h2>
                <div className="flex justify-center flex-wrap gap-2 mb-8">
                  <span className="px-3 py-1.5 bg-[#04060C] rounded-xl text-xs font-black text-slate-300 shadow-inner border border-slate-800">{selectedMovie?.year}</span>
                  <span className="px-3 py-1.5 bg-[#04060C] rounded-xl text-xs font-black text-slate-300 shadow-inner border border-slate-800">{selectedMovie?.genre}</span>
                </div>
                
                <div className="relative w-40 h-40 mx-auto rounded-full border-[6px] flex items-center justify-center bg-[#04060C] mb-8"
                     style={{ borderColor: finalDynColor, transition: 'border-color 0.5s ease-out, box-shadow 0.5s ease-out', boxShadow: `0 0 40px ${finalDynColor}80, inset 0 0 20px ${finalDynColor}50` }}>
                   <MegaScoreVFX score={finalScoreVal} themeColor={themeColor}/>
                   <div className="text-center relative z-10">
                     <span className="text-6xl font-black block text-white drop-shadow-xl transition-colors duration-500 ease-out" style={{color: finalDynColor, textShadow: `0 0 20px ${finalDynColor}90`}}>{finalScoreVal}</span>
                   </div>
                </div>

                <div className="bg-[#04060C] rounded-3xl p-6 text-left border border-slate-800 shadow-inner space-y-5">
                   <div><span className="text-xs text-amber-500 font-black uppercase flex items-center gap-1.5"><Clapperboard size={14}/> {t.director}</span><p className="text-sm text-slate-200 font-bold mt-1">{selectedMovie?.director}</p></div>
                   <div><span className="text-xs text-amber-500 font-black uppercase flex items-center gap-1.5"><Users size={14}/> {t.cast}</span><p className="text-sm text-slate-200 font-bold mt-1">{selectedMovie?.cast}</p></div>
                   <div><span className="text-xs text-amber-500 font-black uppercase flex items-center gap-1.5"><Info size={14}/> {t.summary}</span><p className="text-sm text-slate-400 line-clamp-6 leading-relaxed mt-1.5 font-medium">{selectedMovie?.overview}</p></div>
                   
                   {dbSelectedMovieData && dbSelectedMovieData.voteCount > 0 && (
                     <div className="mt-6 pt-6 border-t border-slate-800/50">
                        <div 
                          onClick={() => setShowCategoryAverages(!showCategoryAverages)}
                          className="flex items-center justify-between cursor-pointer group bg-slate-900/80 border border-slate-700 p-4 rounded-2xl shadow-inner hover:border-theme transition-colors"
                        >
                           <div>
                              <h4 className="text-[10px] sm:text-xs text-slate-500 group-hover:text-slate-400 font-black uppercase mb-1 tracking-widest flex items-center gap-2 transition-colors"><Globe className="text-amber-500" size={14}/> {t.communityAvg}</h4>
                              <div className="flex items-end gap-2">
                                 <span className="text-2xl sm:text-3xl font-black drop-shadow-md leading-none" style={{color: getScoreColorHex(dbSelectedMovieData.avgScore)}}>{Number(dbSelectedMovieData.avgScore).toFixed(1)}</span>
                                 <span className="text-xs font-bold text-slate-500 mb-1">/ 10</span>
                              </div>
                           </div>
                           <div className="w-10 h-10 rounded-full bg-[#04060C] flex items-center justify-center border border-slate-700 group-hover:border-theme transition-colors">
                              {showCategoryAverages ? <ChevronUp size={20} className="text-theme" /> : <ChevronDown size={20} className="text-slate-400 group-hover:text-theme" />}
                           </div>
                        </div>

                        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${showCategoryAverages ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                           {dbSelectedMovieData.categoryTotals && (
                             <div className="space-y-3 px-2 py-1">
                               {criteriaData.map(c => {
                                  const catAvg = (dbSelectedMovieData.categoryTotals[c.id] || 0) / dbSelectedMovieData.voteCount;
                                  const catColor = getScoreColorHex(catAvg);
                                  return (
                                    <div key={c.id} className="flex items-center gap-3">
                                       <span className="text-[10px] sm:text-xs font-bold text-slate-300 w-20 sm:w-28 truncate" title={c.name}>{c.name}</span>
                                       <div className="flex-1 h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                                         <div className="h-full rounded-full transition-all duration-1000 relative" style={{width: `${catAvg * 10}%`, backgroundColor: catColor, boxShadow: `0 0 10px ${catColor}80`}}>
                                            <div className="absolute inset-0 bg-white/20 w-full h-full animate-[pulse_2s_infinite]"></div>
                                         </div>
                                       </div>
                                       <span className="text-xs font-black w-8 text-right" style={{color: catColor}}>{catAvg.toFixed(1)}</span>
                                    </div>
                                  )
                               })}
                             </div>
                           )}
                        </div>
                     </div>
                   )}

                   {/* YENİ: ARKADAŞLARINDAN İZLEYENLER (Sosyal Bağ) */}
                   {friendsRatings.length > 0 && (
                     <div className="mt-6 pt-6 border-t border-slate-800/50">
                        <h4 className="text-[10px] sm:text-xs text-slate-500 font-black uppercase mb-3 tracking-widest flex items-center gap-2"><Users size={14}/> {t.friendsWatched}</h4>
                        <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
                           {friendsRatings.map(fr => (
                              <div key={fr.uid} onClick={() => loadPublicProfile(fr.uid)} className="flex items-center gap-3 bg-[#04060C] border border-slate-800 rounded-2xl p-2.5 cursor-pointer hover:border-theme transition-colors min-w-[140px] shadow-inner">
                                 <img src={fr.avatar || AVATAR_DEFAULT} className="w-10 h-10 rounded-full object-cover border border-slate-700" alt=""/>
                                 <div>
                                    <span className="text-xs font-bold text-slate-300 block line-clamp-1 mb-0.5">{fr.name}</span>
                                    <span className="text-sm font-black" style={{color: getScoreColorHex(fr.score)}}>{Number(fr.score).toFixed(1)}</span>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                   )}
                   
                   {selectedMovie?.trailerKey && (
                     <a href={`https://www.youtube.com/watch?v=${selectedMovie.trailerKey}`} target="_blank" rel="noreferrer" className="w-full mt-4 py-4 bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-500/20 rounded-2xl font-black flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]">
                       <Play size={20} className="fill-current"/> {t.watchTrailer}
                     </a>
                   )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-8 flex flex-col gap-8">
              {!isRatingMode ? (
                 <div className="flex-1 bg-slate-900/80 backdrop-blur-xl rounded-[2.5rem] p-12 border border-slate-800 shadow-2xl flex flex-col items-center justify-center text-center">
                    {user && sortedMyRatings.find(r=>r.id===selectedMovie?.id) ? (
                      <>
                         <h3 className="text-3xl font-black text-white mb-6 drop-shadow-md">{t.yourScore}</h3>
                         <div className="relative w-48 h-48 mx-auto rounded-full border-[8px] flex items-center justify-center bg-[#04060C] mb-8"
                              style={{ borderColor: getScoreColorHex(sortedMyRatings.find(r=>r.id===selectedMovie?.id).finalScore), boxShadow: `0 0 50px ${getScoreColorHex(sortedMyRatings.find(r=>r.id===selectedMovie?.id).finalScore)}80` }}>
                            <span className="text-7xl font-black text-white drop-shadow-2xl" style={{color: getScoreColorHex(sortedMyRatings.find(r=>r.id===selectedMovie?.id).finalScore)}}>{sortedMyRatings.find(r=>r.id===selectedMovie?.id).finalScore}</span>
                         </div>
                         <button onClick={() => setIsRatingMode(true)} className="px-10 py-5 rounded-full bg-slate-800 hover:bg-slate-700 text-white font-black text-xl transition-all shadow-xl flex items-center gap-3 hover:scale-105 active:scale-95 border border-slate-700">
                           <Edit3 size={24}/> {t.updateRating}
                         </button>
                      </>
                    ) : (
                      <>
                         <div className="w-32 h-32 rounded-full flex items-center justify-center mb-8 border-[4px] shadow-theme animate-pulse" style={{borderColor: themeColor, backgroundColor: themeColor + '20'}}>
                            <Star size={48} style={{color: themeColor}}/>
                         </div>
                         <h3 className="text-3xl font-black text-white mb-8 drop-shadow-md">{t.noRating}</h3>
                         <button onClick={() => setIsRatingMode(true)} className="px-10 py-5 rounded-full bg-theme hover:bg-theme text-[#04060C] font-black text-xl transition-all shadow-theme flex items-center gap-3 hover:scale-105 active:scale-95">
                           <Star size={24} className="fill-current"/> {t.rateNow}
                         </button>
                      </>
                    )}
                 </div>
              ) : (
                <div className="flex-1 bg-slate-900/80 backdrop-blur-xl rounded-[2.5rem] p-8 lg:p-12 border border-slate-800 shadow-2xl flex flex-col justify-between animate-in zoom-in-95 duration-300">
                  <div>
                     <h3 className="text-3xl font-black text-white mb-12 flex items-center gap-3 drop-shadow-md"><Award className="text-amber-500" size={32}/> {t.criteria}</h3>
                     <div className="space-y-12">
                       {criteriaData.map((c) => {
                     const currentValue = scores[c.id] ?? 5; 
                     const sliderColor = getScoreColorHex(currentValue);
                     return (
                     <div key={c.id}>
                       <div className="flex justify-between items-end mb-5">
                          <div className="flex items-center gap-3 relative group">
                             <span className="font-black text-white text-xl sm:text-2xl drop-shadow">{c.name}</span>
                             <HelpCircle size={20} className="text-slate-500 cursor-help hover:text-theme transition-colors" />
                             <div className="absolute bottom-full left-0 mb-4 w-72 bg-slate-800 text-slate-200 text-sm p-5 rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 font-bold border border-slate-700">
                               {c.desc}<div className="absolute top-full left-5 w-3 h-3 bg-slate-800 rotate-45 -mt-1.5 border-r border-b border-slate-700"></div>
                             </div>
                          </div>
                          <div className="text-6xl font-black w-24 text-right drop-shadow-md transition-colors duration-500 ease-out" style={{color: sliderColor, textShadow: `0 0 20px ${sliderColor}90`}}>
                            {currentValue}
                          </div>
                       </div>
                       
                       <div className="relative h-6 flex items-center rounded-full bg-[#04060C] border border-slate-800 shadow-inner">
                         <div className="absolute h-full rounded-full overflow-hidden transition-all duration-500 ease-out" style={{width: `${currentValue * 10}%`, backgroundColor: sliderColor, boxShadow: `0 0 15px ${sliderColor}80`}}></div>
                         <input type="range" min="0" max="10" step="0.5" value={currentValue} onChange={(e) => setScores({...scores, [c.id]: parseFloat(e.target.value)})} className="absolute w-full h-full opacity-0 cursor-pointer z-10"/>
                         <div className="absolute h-10 w-10 bg-[#04060C] rounded-full flex items-center justify-center pointer-events-none transition-all duration-500 ease-out" style={{left: `calc(${currentValue * 10}% - 20px)`, border: `5px solid ${sliderColor}`, boxShadow: `0 0 15px ${sliderColor}80`}}>
                            <div className="w-3 h-3 rounded-full transition-colors duration-500 ease-out" style={{backgroundColor: sliderColor}}></div>
                         </div>
                       </div>
                     </div>
                   )})}
                 </div>
              </div>
              
              <div className="mt-12 pt-8 border-t border-slate-800/50 flex gap-4">
                     <button onClick={() => setIsRatingMode(false)} className="px-6 py-5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-black text-xl transition-all border border-slate-700"><X size={24}/></button>
                     <button onClick={saveRating} disabled={isSaving} className="flex-1 py-5 rounded-2xl bg-theme hover:bg-theme text-[#04060C] font-black text-xl transition-all shadow-theme flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]">
                       {isSaving ? <Loader2 className="animate-spin text-black"/> : <Save size={24}/>} 
                       {user && sortedMyRatings.find(r=>r.id===selectedMovie?.id) ? t.updateRating : t.saveRating}
                     </button>
                  </div>
                </div>
              )}
              
              {/* YENİ: BENZER FİLMLER */}
              {similarMovies.length > 0 && (
                <div className="bg-slate-900/80 backdrop-blur-xl rounded-[2.5rem] p-8 border border-slate-800 shadow-2xl mt-4">
                  <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2"><Film className="text-theme"/> Benzer Filmler</h3>
                  <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4">
                    {similarMovies.map(sim => (
                       <div key={sim.id} onClick={() => selectMovieToRate(sim.id, sim.title)} className="w-28 sm:w-32 shrink-0 cursor-pointer group">
                          <img src={sim.poster} className="w-full aspect-[2/3] object-cover rounded-2xl border border-slate-700 group-hover:border-theme transition-colors shadow-lg" alt=""/>
                          <h4 className="text-xs font-bold text-slate-300 mt-2 line-clamp-2 group-hover:text-theme">{sim.title}</h4>
                       </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: DÜNYA GENELİ SIRALAMA */}
        {activeTab === 'global' && (
          <div className="animate-in fade-in duration-500 space-y-8 max-w-7xl mx-auto">
             <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-slate-900/80 backdrop-blur-md p-8 sm:p-10 rounded-[2.5rem] border border-slate-800 shadow-xl gap-4">
                <div>
                   <h2 className="text-4xl font-black text-white flex items-center gap-3 drop-shadow-md"><Globe className="text-theme" size={36}/> {t.globalRanking}</h2>
                   <p className="text-slate-400 mt-3 font-bold text-lg">{t.globalDesc}</p>
                </div>
                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4">
                   <div className="flex items-center gap-3 bg-[#04060C] p-2 rounded-2xl border border-slate-800 shadow-inner h-full">
                      <ListFilter size={18} className="text-slate-400 ml-2" />
                      <select 
                        value={globalSortType} 
                        onChange={(e) => setGlobalSortType(e.target.value)}
                        className="bg-transparent text-sm font-bold text-white outline-none cursor-pointer pr-2"
                      >
                         <option value="vote_desc" className="bg-slate-900">{t.mostVoted || (lang === 'tr' ? 'En Çok Oylananlar' : 'Most Voted')}</option>
                         <option value="score_desc" className="bg-slate-900">{t.sortGlobalScore || (lang === 'tr' ? 'Dünya Geneli Puan' : 'Global Score')}</option>
                      </select>
                   </div>
                   <div className="bg-[#04060C] border border-slate-800 px-8 py-5 rounded-3xl flex items-center gap-5 shadow-inner">
                      <span className="text-6xl font-black text-theme drop-shadow-md">{safeGlobalMovies.length}</span>
                      <span className="text-sm text-slate-500 uppercase font-black tracking-widest leading-tight">{t.registeredMovies}</span>
                   </div>
                </div>
             </div>
             
             {safeGlobalMovies.length === 0 ? (
               <div className="text-center py-20 text-slate-600"><Loader2 className="animate-spin w-10 h-10 mx-auto mb-4 text-theme"/></div>
             ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {[...safeGlobalMovies].sort((a,b) => {
                    if (globalSortType === 'score_desc') return (b.avgScore || 0) - (a.avgScore || 0);
                    return (b.voteCount || 0) - (a.voteCount || 0);
                 }).map((movie, idx) => {
                   const isNeon = movie.avgScore >= 9.0;
                   const displayTitle = localizedData?.[movie.id]?.title || movie.title;
                   return (
                   <div key={movie.id} onClick={() => selectMovieToRate(movie.id, movie.title)} className={`bg-slate-900/80 backdrop-blur rounded-3xl overflow-hidden border flex flex-row group cursor-pointer transition-all shadow-xl hover:-translate-y-1 ${isNeon ? 'border-theme shadow-theme' : 'border-slate-800 hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]'}`}>
                     <div className="w-28 sm:w-32 bg-black relative shrink-0">
                        <img src={movie.poster} alt="" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"/>
                        <div className="absolute inset-0 bg-gradient-to-t from-[#04060C] to-transparent opacity-80"></div>
                        <div className={`absolute top-3 left-3 w-8 h-8 rounded-xl text-[#04060C] text-sm font-black flex items-center justify-center shadow-lg ${isNeon ? 'bg-theme' : 'bg-amber-500'}`}>#{idx + 1}</div>
                     </div>
                     <div className="flex-1 p-5 flex flex-col justify-between">
                        <div>
                          <h3 className="text-lg font-black text-white line-clamp-2 transition-colors drop-shadow-sm leading-tight mb-1 group-hover:text-theme">{displayTitle}</h3>
                          <div className="text-xs text-slate-400 font-bold mb-4">{movie.year} • {movie.genre}</div>
                          
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-sm font-bold px-3 py-1.5 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-300 shadow-inner">{movie.voteCount} {t.voteCount}</span>
                            <div className="relative">
                              <MiniVFX score={movie.avgScore} themeColor={themeColor} />
                              <span className={`relative z-10 text-xs font-black px-3 py-1.5 rounded-xl bg-[#04060C] shadow-inner ${isNeon ? 'border shadow-theme animate-pulse' : 'border border-slate-800'}`} style={isNeon ? {borderColor: themeColor, color: themeColor, textShadow: `0 0 10px ${themeColor}`} : {color: getScoreColorHex(movie.avgScore), textShadow: `0 0 10px ${getScoreColorHex(movie.avgScore)}80`}}>{t.average}: {Number(movie.avgScore).toFixed(1)}</span>
                            </div>
                          </div>
                        </div>
                     </div>
                   </div>
                 )})}
               </div>
             )}
          </div>
        )}

        {/* TAB 4: PROFİL (Çok Sayfalı Yapı & Elite Tasarım) */}
        {activeTab.startsWith('profile') && !activeTab.startsWith('public') && (
          <div className="animate-in fade-in duration-500 max-w-5xl mx-auto space-y-8">
            
            <div className="relative rounded-[2.5rem] overflow-hidden border border-slate-800 shadow-2xl mb-8 group bg-slate-900/50">
              <div className="h-48 sm:h-64 w-full relative">
                 <img src={userProfile?.banner || BANNER_PRESETS[0]} className="w-full h-full object-cover opacity-80" alt="Banner" />
                 <div className="absolute inset-0 bg-gradient-to-t from-[#04060C] via-[#04060C]/60 to-transparent"></div>
                 <button onClick={openProfileEdit} className="absolute top-6 right-6 px-4 py-2 bg-[#04060C]/50 hover:bg-theme-transparent text-slate-300 hover:text-theme border border-slate-700 hover:border-theme rounded-xl backdrop-blur font-bold flex items-center gap-2 transition-all shadow-lg z-20">
                    <Edit3 size={16}/> <span className="hidden sm:inline">{t.editProfile}</span>
                 </button>
              </div>
              <div className="px-8 pb-8 sm:px-12 relative -mt-20 sm:-mt-24 flex flex-col sm:flex-row items-center sm:items-end gap-6 sm:gap-8">
                 <div className="relative">
                   <img src={userProfile?.avatar || AVATAR_DEFAULT} className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-[#04060C] bg-[#04060C] object-cover shadow-[0_0_30px_rgba(0,0,0,0.5)] z-10 relative" style={{boxShadow: `0 0 30px ${themeColor}4d`}} alt="Avatar"/>
                   <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-theme rounded-full border-[3px] border-[#04060C] flex items-center justify-center shadow-lg transform rotate-12 z-20">
                     <span className="text-xs font-black text-[#04060C]">{sortedMyRatings.length}</span>
                   </div>
                 </div>
                 <div className="text-center sm:text-left flex-1 mb-2">
                    <div className="flex flex-col sm:flex-row sm:items-end gap-2 sm:gap-4 mb-1">
                      <h2 className="text-4xl sm:text-5xl font-black text-white drop-shadow-md tracking-tight">{String(userProfile?.displayName || 'Sinefil')}</h2>
                      <span onClick={() => { navigator.clipboard.writeText(userProfile?.userCode || user?.uid?.substring(0,6).toUpperCase()); showToast(t.userCodeCopied); }} className="text-theme font-black text-lg bg-theme-transparent px-3 py-1 rounded-xl cursor-pointer hover:bg-theme transition-colors border w-max mx-auto sm:mx-0">@{userProfile?.userCode || user?.uid?.substring(0,6).toUpperCase()}</span>
                    </div>
                    <div className="flex items-center justify-center sm:justify-start gap-4 mb-3 mt-2">
                       <span onClick={() => { loadFollowersUsers(); setActiveTab('profile_followers'); }} className="text-slate-400 font-bold text-sm cursor-pointer hover:text-white transition-colors"><strong className="text-white">{userProfile?.followers?.length || 0}</strong> {t.followers}</span>
                       <span onClick={() => { loadFollowingUsers(); setActiveTab('profile_following'); }} className="text-slate-400 font-bold text-sm cursor-pointer hover:text-white transition-colors"><strong className="text-white">{userProfile?.following?.length || 0}</strong> {t.following}</span>
                    </div>
                    {userProfile?.bio && (
                      <div className="flex items-start justify-center sm:justify-start gap-2 text-theme">
                        <Quote size={14} className="mt-1 opacity-50 shrink-0"/>
                        <p className="font-medium italic text-sm sm:text-base drop-shadow-sm max-w-lg">{userProfile.bio}</p>
                      </div>
                    )}
                 </div>
              </div>
            </div>

            {/* ALT SEKMELER: GENEL BAKIŞ */}
            {activeTab === 'profile_general' && (
              <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-10">
                
                {/* KUTSAL ÜÇLÜ (TOP 3) VİTRİNİ */}
                <div className="bg-gradient-to-br from-slate-800/40 via-slate-900/90 to-slate-800/20 backdrop-blur-xl rounded-[2.5rem] p-8 sm:p-12 border border-slate-700/30 shadow-[0_0_50px_rgba(0,0,0,0.3)] relative overflow-hidden" style={{boxShadow: `0 0 50px ${themeColor}1a`, borderColor: themeColor+'33'}}>
                   <div className="absolute top-0 right-0 w-64 h-64 blur-[100px] rounded-full pointer-events-none" style={{backgroundColor: themeColor+'1a'}}></div>
                   
                   <div className="text-center mb-8 relative z-10">
                     <h3 className="text-3xl sm:text-4xl font-black text-white flex items-center justify-center gap-3 drop-shadow-md mb-2"><Trophy className="text-theme" size={36}/> {t.top3Title}</h3>
                     <p className="text-slate-400 font-bold">{t.top3Desc}</p>
                   </div>
                   
                   <div className="flex justify-center items-center gap-2 sm:gap-6 mt-10 relative z-10">
                      {[0, 1, 2].map(slot => {
                        const movie = userProfile?.top3?.[slot];
                        const isCenter = slot === 1;
                        return (
                          <div key={slot} 
                               className={`relative aspect-[2/3] rounded-2xl sm:rounded-[2rem] border-[3px] flex flex-col items-center justify-center transition-all duration-500 group overflow-hidden shadow-2xl ${isCenter ? 'w-40 sm:w-56 z-20 scale-110' : 'w-32 sm:w-44 border-slate-700 bg-[#04060C] hover:border-theme z-10'}`} style={isCenter ? {borderColor: themeColor, boxShadow: `0 0 40px ${themeColor}66`} : {}}>
                            {movie ? (
                              <>
                                <img src={movie.poster} className="w-full h-full object-cover cursor-pointer" onClick={() => selectMovieToRate(movie.id, movie.title)} alt=""/>
                                
                                {!isCenter && (
                                  <button onClick={(e) => { e.stopPropagation(); setCrown(slot); }} className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-black/60 backdrop-blur border border-slate-600 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:border-theme hover:bg-theme-transparent transition-all z-30">
                                     <Crown size={16} className="text-slate-400 hover:text-theme"/>
                                  </button>
                                )}
                                {isCenter && (
                                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-10 h-10 flex items-center justify-center z-30 pointer-events-none" style={{filter: `drop-shadow(0 0 15px ${themeColor})`}}>
                                     <Crown size={28} className="animate-pulse" style={{color: themeColor, fill: themeColor}}/>
                                  </div>
                                )}

                                <button onClick={(e) => { e.stopPropagation(); setTop3SlotIndex(slot); setShowTop3Modal(true); setTop3SearchTerm(''); setTop3Results([]); }} className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-black/60 backdrop-blur border border-slate-600 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:border-white hover:bg-white/20 transition-all z-30 shadow-md">
                                   <Edit3 size={14} className="text-white"/>
                                </button>
                              </>
                            ) : (
                              <div className="w-full h-full cursor-pointer flex items-center justify-center group-hover:bg-slate-800/50 transition-colors" onClick={() => { setTop3SlotIndex(slot); setShowTop3Modal(true); setTop3SearchTerm(''); setTop3Results([]); }}>
                                <Plus size={36} className="text-slate-600 group-hover:text-theme transition-colors"/>
                              </div>
                            )}
                          </div>
                        )
                      })}
                   </div>
                </div>

                {/* SİNEMATİK DNA VE BURÇ */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                   <div className="lg:col-span-2 bg-slate-900/80 backdrop-blur-xl rounded-[2.5rem] p-8 border border-slate-800 shadow-xl flex flex-col justify-center">
                      <h3 className="text-2xl font-black text-white mb-2 flex items-center gap-3 drop-shadow-md"><Sparkles className="text-theme" size={28}/> {t.cinematicDNA}</h3>
                      
                      {sortedMyRatings.length >= 20 ? (
                        <>
                          <p className="text-slate-400 font-bold mb-8 text-sm">{t.dnaDesc}</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6">
                             {criteriaData.map((c) => {
                                const score = userDNA[c.id];
                                const color = getScoreColorHex(score);
                                return (
                                  <div key={c.id}>
                                     <div className="flex justify-between items-end mb-2">
                                       <span className="font-bold text-slate-300 text-sm tracking-wide">{c.name}</span>
                                       <span className="font-black text-lg" style={{color: color, textShadow: `0 0 10px ${color}80`}}>{score}</span>
                                     </div>
                                     <div className="h-2 bg-[#04060C] rounded-full overflow-hidden border border-slate-800 shadow-inner">
                                       <div className="h-full rounded-full transition-all duration-1000 relative" style={{width: `${score * 10}%`, backgroundColor: color, boxShadow: `0 0 10px ${color}80`}}>
                                          <div className="absolute inset-0 bg-white/20 w-full h-full animate-[pulse_2s_infinite]"></div>
                                       </div>
                                     </div>
                                  </div>
                                )
                             })}
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-6 text-center">
                           <Lock size={36} className="text-slate-600 mb-3"/>
                           <h4 className="text-lg font-black text-white">{t.dnaLockedTitle}</h4>
                           <p className="text-sm text-slate-400 font-bold mt-1 max-w-sm"><strong className="text-theme">{20 - sortedMyRatings.length}</strong> {t.dnaLockedDesc}</p>
                        </div>
                      )}
                   </div>

                   <div className="bg-slate-900/80 backdrop-blur-xl rounded-[2.5rem] p-8 border border-slate-800 shadow-xl flex flex-col items-center justify-center text-center">
                      <div className="w-20 h-20 bg-[#04060C] rounded-full border border-slate-700 shadow-inner flex items-center justify-center mb-4">
                         <Smile className="text-fuchsia-500" size={36}/>
                      </div>
                      <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">{t.cineZodiac}</h4>
                      {sortedMyRatings.length >= 20 ? (
                        <>
                          <h2 className="text-2xl font-black text-white drop-shadow-md mb-2">{zodiacTitle}</h2>
                          <p className="text-xs font-bold text-slate-500">{zodiacDesc}</p>
                        </>
                      ) : (
                        <h2 className="text-xl font-black text-slate-500 drop-shadow-md mb-2">{t.zodiacDefault}</h2>
                      )}
                   </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                   <div className="bg-slate-900/80 backdrop-blur-xl rounded-[2.5rem] p-8 border border-slate-800 shadow-xl flex flex-col group cursor-pointer" onClick={() => setActiveTab('profile_ratings')}>
                     <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-black text-white flex items-center gap-3 drop-shadow-md group-hover:text-theme transition-colors"><PieChart className="text-theme" size={24}/> {t.topGenres}</h3>
                     </div>
                     {topGenres.length === 0 ? (
                        <p className="text-slate-500 text-sm font-bold text-center py-8">{t.noRating}</p>
                     ) : (
                        <div className="space-y-5">
                          {topGenres.map(([genre, count], idx) => {
                             const percentage = (count / sortedMyRatings.length) * 100;
                             return (
                               <div key={genre}>
                                 <div className="flex justify-between items-end mb-2">
                                   <span className="font-bold text-slate-300 text-sm">{genre}</span>
                                   <span className="font-black text-sm text-slate-500">{count} {t.voteCount}</span>
                                 </div>
                                 <div className="h-2 bg-[#04060C] rounded-full overflow-hidden border border-slate-800 shadow-inner">
                                   <div className="h-full rounded-full transition-all duration-1000" style={{width: `${percentage}%`, backgroundColor: themeColor}}></div>
                                 </div>
                               </div>
                             )
                          })}
                        </div>
                     )}
                   </div>

                   <div className="bg-slate-900/80 backdrop-blur-xl rounded-[2.5rem] p-8 border border-slate-800 shadow-xl flex flex-col group cursor-pointer" onClick={() => setActiveTab('profile_watchlist')}>
                     <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-black text-white flex items-center gap-3 drop-shadow-md group-hover:text-theme transition-colors"><Bookmark className="text-theme" size={24}/> {t.watchlist}</h3>
                        <button className="text-xs font-black text-theme group-hover:text-white transition-colors">{t.viewAll} &rarr;</button>
                     </div>
                     {sortedWatchlist.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center"><p className="text-slate-500 text-sm font-bold text-center py-8">{t.emptyWatchlist}</p></div>
                     ) : (
                        <div className="flex gap-3 overflow-x-hidden hide-scrollbar">
                           {sortedWatchlist.slice(0, 4).map(item => (
                             <img key={item.id} src={item.poster || 'https://via.placeholder.com/200x300?text=Poster'} className="w-20 sm:w-24 aspect-[2/3] object-cover rounded-xl border border-slate-700 shadow-md group-hover:border-theme transition-all" alt=""/>
                           ))}
                           {sortedWatchlist.length > 4 && (
                             <div className="w-20 sm:w-24 aspect-[2/3] rounded-xl bg-[#04060C] border border-slate-800 flex items-center justify-center group-hover:border-theme transition-colors">
                               <span className="font-black text-slate-500 group-hover:text-theme text-xl">+{sortedWatchlist.length - 4}</span>
                             </div>
                           )}
                        </div>
                     )}
                   </div>
                </div>

                <div>
                  <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-3 drop-shadow-md"><Medal className="text-blue-500" size={28}/> {t.badges}</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                     {getAllBadges(sortedMyRatings.length, t).map(badge => (
                       <div key={badge.id} className={`flex flex-col items-center justify-center p-5 rounded-3xl border-2 text-center transition-all group relative ${badge.earned ? `${badge.color} hover:scale-105 shadow-xl bg-slate-900/50 backdrop-blur` : 'border-slate-800 bg-[#04060C] text-slate-700 opacity-60 grayscale'}`}>
                         <div className={`mb-4 p-4 rounded-2xl shadow-inner ${badge.earned ? 'bg-[#04060C]/50' : 'bg-slate-900'}`}>{badge.icon}</div>
                         <h4 className="font-black text-sm mb-1">{badge.name}</h4>
                         {!badge.earned && <div className="absolute top-3 right-3 text-slate-600"><Lock size={14}/></div>}
                         <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-max max-w-[200px] bg-slate-800 text-white text-xs font-bold p-3 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl border border-slate-600">
                            {badge.desc}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-800 rotate-45 -mt-1.5 border-r border-b border-slate-600"></div>
                         </div>
                       </div>
                     ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'profile_ratings' && (
              <div className="animate-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                  <h3 className="text-2xl font-black text-white flex items-center gap-3 drop-shadow-md"><Film className="text-theme" size={28}/> {t.myRatedMovies}</h3>
                  <div className="flex items-center gap-3 bg-[#04060C] p-2 rounded-2xl border border-slate-800 shadow-inner">
                     <ListFilter size={18} className="text-slate-400 ml-2" />
                     <select 
                       value={ratingSortType} 
                       onChange={(e) => setRatingSortType(e.target.value)}
                       className="bg-transparent text-sm font-bold text-white outline-none cursor-pointer pr-2"
                     >
                        <option value="date_desc" className="bg-slate-900">{t.sortDate}</option>
                        <option value="my_score_desc" className="bg-slate-900">{t.sortMyScore}</option>
                        <option value="global_score_desc" className="bg-slate-900">{t.sortGlobalScore}</option>
                     </select>
                  </div>
                </div>

                {sortedMyRatings.length === 0 ? (
                   <div className="text-center py-20 bg-slate-900/50 rounded-3xl border border-slate-800 border-dashed">
                     <p className="text-slate-400 font-bold">{t.noRating}</p>
                   </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                    {sortedMyRatings.map((rating, index) => {
                      const safeId = rating.id ? String(rating.id) : `temp-${index}`;
                      const displayTitle = localizedData?.[safeId]?.title || rating.title;
                      const safeScore = Number(rating.finalScore) || 0;
                      const safePoster = typeof rating.poster === 'string' && rating.poster.startsWith('http') ? rating.poster : 'https://via.placeholder.com/200x300?text=Poster';

                      const globalData = safeGlobalMovies.find(g => String(g.id) === safeId);
                      const globalScore = globalData ? Number(globalData.avgScore) : 0;
                      const isNeon = globalScore >= 9.0;

                      return (
                        <div key={safeId} className="relative group cursor-pointer" onClick={() => selectMovieToRate(safeId, rating.title)}>
                           <img src={safePoster} className="w-full aspect-[2/3] object-cover rounded-3xl bg-slate-900 border border-slate-800 group-hover:border-theme transition-colors shadow-2xl" alt=""/>
                           
                           {globalScore > 0 && (
                             <div className={`absolute top-2 right-2 px-2 py-1 rounded-lg backdrop-blur shadow-xl z-10 pointer-events-none flex flex-col items-center justify-center ${isNeon ? 'bg-[#04060C] border shadow-theme animate-pulse' : 'bg-[#04060C]/90 border border-slate-700'}`} style={isNeon ? {borderColor: themeColor} : {}}>
                               <span className="text-[8px] sm:text-[10px] text-slate-400 font-black mb-0.5 uppercase tracking-widest leading-none">{t.globalScoreLabel}</span>
                               <span className="text-sm font-black leading-none" style={{color: isNeon ? themeColor : getScoreColorHex(globalScore), textShadow: isNeon ? `0 0 10px ${themeColor}` : 'none'}}>{globalScore.toFixed(1)}</span>
                             </div>
                           )}

                           <div className="absolute inset-0 bg-gradient-to-t from-[#04060C] via-[#04060C]/40 to-transparent rounded-3xl opacity-90 group-hover:opacity-100 flex flex-col justify-end p-4 transition-opacity">
                              <div>
                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest block mb-1 drop-shadow-md">{t.yourScoreLabel}</span>
                                <div className="relative w-max">
                                  <MiniVFX score={safeScore} />
                                  <div className="relative z-10 text-4xl font-black leading-none mb-1 drop-shadow-lg transition-colors" style={{color: getScoreColorHex(safeScore), textShadow: `0 0 10px ${getScoreColorHex(safeScore)}80`}}>{safeScore.toFixed(1)}</div>
                                </div>
                              </div>
                              <h4 className="font-bold text-white text-sm leading-tight line-clamp-2 drop-shadow-md mt-1">{displayTitle}</h4>
                           </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'profile_watchlist' && (
              <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-12">
                
                <div>
                   <div className="flex items-center justify-between mb-6">
                     <h3 className="text-2xl font-black text-white flex items-center gap-3 drop-shadow-md"><ListPlus className="text-fuchsia-500" size={28}/> {t.customLists}</h3>
                     <button onClick={() => setShowNewListModal(true)} className="px-4 py-2 bg-theme-transparent hover:bg-theme text-theme border border-theme rounded-xl font-bold flex items-center gap-2 transition-colors"><Plus size={18}/> <span className="hidden sm:inline">{t.createNewList}</span></button>
                   </div>
                   
                   {customLists.length === 0 ? (
                     <div className="text-center py-10 bg-slate-900/50 rounded-3xl border border-slate-800 border-dashed">
                       <p className="text-slate-400 font-bold mb-4">{t.emptyWatchlist}</p>
                       <button onClick={() => setShowNewListModal(true)} className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-colors">{t.createNewList}</button>
                     </div>
                   ) : (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {customLists.map(list => (
                          <div key={list.id} onClick={() => { setActiveCustomList(list); setActiveTab('profile_list_detail'); }} className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-3xl p-6 shadow-xl hover:border-theme cursor-pointer transition-colors group">
                             <div className="flex items-center justify-between mb-4">
                                <h4 className="text-xl font-black text-white group-hover:text-theme transition-colors">{list.name}</h4>
                                <button onClick={(e) => handleShareList(e, list.id)} className="p-2 bg-[#04060C] hover:bg-slate-800 rounded-xl border border-slate-700 text-slate-400 hover:text-theme transition-colors"><Share2 size={18}/></button>
                             </div>
                             
                             {list.movies && list.movies.length > 0 ? (
                               <div className="flex gap-3 overflow-x-hidden pb-2">
                                  {list.movies.slice(0, 5).map(m => (
                                    <img key={m.id} src={m.poster} className="w-16 h-24 rounded-lg object-cover shadow-md border border-slate-800" alt=""/>
                                  ))}
                                  {list.movies.length > 5 && (
                                    <div className="w-16 h-24 rounded-lg bg-[#04060C] border border-slate-800 flex items-center justify-center font-black text-slate-500 shadow-md">
                                      +{list.movies.length - 5}
                                    </div>
                                  )}
                               </div>
                             ) : (
                               <p className="text-xs text-slate-500 font-bold">{t.emptyWatchlist}</p>
                             )}
                          </div>
                        ))}
                     </div>
                   )}
                </div>

                <div className="pt-6 border-t border-slate-800/50">
                  <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-3 drop-shadow-md"><Bookmark className="text-theme" size={28}/> {t.watchlist}</h3>
                  {sortedWatchlist.length === 0 ? (
                     <div className="text-center py-20 bg-slate-900/50 rounded-3xl border border-slate-800 border-dashed">
                       <p className="text-slate-400 font-bold">{t.emptyWatchlist}</p>
                     </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                      {sortedWatchlist.map((item, index) => {
                        const safeId = item.id ? String(item.id) : `temp-${index}`;
                        const displayTitle = localizedData?.[safeId]?.title || item.title;
                        const safePoster = typeof item.poster === 'string' && item.poster.startsWith('http') ? item.poster : 'https://via.placeholder.com/200x300?text=Poster';
                        const globalData = safeGlobalMovies.find(g => String(g.id) === safeId);
                        const isNeon = globalData && globalData.avgScore >= 9.0;

                        return (
                          <div key={safeId} className="relative group cursor-pointer" onClick={() => selectMovieToRate(safeId, item.title)}>
                             <img src={safePoster} className="w-full aspect-[2/3] object-cover rounded-3xl bg-slate-900 border border-slate-800 group-hover:border-theme transition-colors shadow-2xl" alt=""/>
                             <div className="absolute top-2 right-2 w-8 h-8 rounded-xl bg-[#04060C]/80 backdrop-blur border-theme flex items-center justify-center shadow-lg border">
                                <BookmarkCheck size={16} className="text-theme"/>
                             </div>
                             <div className="absolute inset-0 bg-gradient-to-t from-[#04060C] via-[#04060C]/20 to-transparent rounded-3xl opacity-90 group-hover:opacity-100 flex flex-col justify-end p-4 transition-opacity">
                                {globalData && globalData.avgScore > 0 && (
                                  <div className="mb-1">
                                    <span className={`text-xs font-black px-2 py-1 rounded-lg ${isNeon ? 'bg-[#04060C] border shadow-theme' : 'bg-[#04060C]/80 border border-slate-700'}`} style={isNeon ? {borderColor: themeColor, color: themeColor} : {color: getScoreColorHex(globalData.avgScore)}}>{Number(globalData.avgScore).toFixed(1)}</span>
                                  </div>
                                )}
                                <h4 className="font-bold text-white text-sm leading-tight line-clamp-2 drop-shadow-md">{displayTitle}</h4>
                             </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

              </div>
            )}

            {activeTab === 'profile_following' && (
              <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-8">
                 <div className="flex items-center justify-between mb-6">
                    <h2 className="text-3xl font-black text-white flex items-center gap-3 drop-shadow-md"><Users className="text-theme"/> {t.followingTab}</h2>
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {followingUsersList.length > 0 ? followingUsersList.map(u => (
                      <div key={u.uid} onClick={() => loadPublicProfile(u.uid)} className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-3xl p-6 shadow-xl flex items-center gap-4 cursor-pointer hover:border-theme hover:-translate-y-1 transition-all group">
                         <img src={u.avatar || AVATAR_DEFAULT} className="w-16 h-16 rounded-full border-2 border-[#04060C] group-hover:border-theme transition-colors object-cover" alt=""/>
                         <div>
                           <h4 className="text-lg font-black text-white group-hover:text-theme transition-colors line-clamp-1">{u.displayName}</h4>
                           <p className="text-xs font-bold text-slate-500 mt-1">@{u.userCode || (u.uid ? u.uid.substring(0,6).toUpperCase() : '')}</p>
                         </div>
                      </div>
                    )) : (
                      <div className="col-span-full text-center py-20 text-slate-500 font-bold bg-slate-900/50 rounded-[2rem] border border-slate-800 border-dashed">{t.noData}</div>
                    )}
                 </div>
              </div>
            )}

            {activeTab === 'profile_followers' && (
              <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-8">
                 <div className="flex items-center justify-between mb-6">
                    <h2 className="text-3xl font-black text-white flex items-center gap-3 drop-shadow-md"><Users className="text-theme"/> {t.followersTab}</h2>
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {followersUsersList.length > 0 ? followersUsersList.map(u => (
                      <div key={u.uid} onClick={() => loadPublicProfile(u.uid)} className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-3xl p-6 shadow-xl flex items-center gap-4 cursor-pointer hover:border-theme hover:-translate-y-1 transition-all group">
                         <img src={u.avatar || AVATAR_DEFAULT} className="w-16 h-16 rounded-full border-2 border-[#04060C] group-hover:border-theme transition-colors object-cover" alt=""/>
                         <div>
                           <h4 className="text-lg font-black text-white group-hover:text-theme transition-colors line-clamp-1">{u.displayName}</h4>
                           <p className="text-xs font-bold text-slate-500 mt-1">@{u.userCode || (u.uid ? u.uid.substring(0,6).toUpperCase() : '')}</p>
                         </div>
                      </div>
                    )) : (
                      <div className="col-span-full text-center py-20 text-slate-500 font-bold bg-slate-900/50 rounded-[2rem] border border-slate-800 border-dashed">{t.noData}</div>
                    )}
                 </div>
              </div>
            )}

            {activeTab === 'profile_list_detail' && activeCustomList && (
              <div className="animate-in slide-in-from-right-8 duration-500">
                <button onClick={() => setActiveTab('profile_watchlist')} className="px-5 py-3 mb-6 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 text-white font-bold flex items-center gap-2 transition-colors">
                   <ChevronLeft size={18}/> Geri
                </button>
                
                <div className="flex items-center justify-between mb-8">
                   <h2 className="text-3xl sm:text-4xl font-black text-white drop-shadow-md flex items-center gap-3"><ListPlus className="text-theme"/> {activeCustomList.name}</h2>
                   <button onClick={(e) => handleShareList(e, activeCustomList.id)} className="px-4 py-2 bg-theme-transparent hover:bg-theme text-theme border border-theme rounded-xl font-bold flex items-center gap-2 transition-colors"><Share2 size={18}/> <span className="hidden sm:inline">{t.share}</span></button>
                </div>

                {!activeCustomList.movies || activeCustomList.movies.length === 0 ? (
                   <div className="text-center py-20 bg-slate-900/50 rounded-3xl border border-slate-800 border-dashed">
                     <p className="text-slate-400 font-bold">{t.emptyWatchlist}</p>
                   </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                    {activeCustomList.movies.map((item, index) => {
                      const safeId = item.id ? String(item.id) : `temp-${index}`;
                      const displayTitle = localizedData?.[safeId]?.title || item.title;
                      const safePoster = typeof item.poster === 'string' && item.poster.startsWith('http') ? item.poster : 'https://via.placeholder.com/200x300?text=Poster';
                      const globalData = safeGlobalMovies.find(g => String(g.id) === safeId);
                      const isNeon = globalData && globalData.avgScore >= 9.0;

                      return (
                        <div key={safeId} className="relative group cursor-pointer" onClick={() => selectMovieToRate(safeId, item.title)}>
                           <img src={safePoster} className="w-full aspect-[2/3] object-cover rounded-3xl bg-slate-900 border border-slate-800 group-hover:border-theme transition-colors shadow-2xl" alt=""/>
                           <div className="absolute inset-0 bg-gradient-to-t from-[#04060C] via-[#04060C]/20 to-transparent rounded-3xl opacity-90 group-hover:opacity-100 flex flex-col justify-end p-4 transition-opacity">
                              {globalData && globalData.avgScore > 0 && (
                                <div className="mb-1">
                                  <span className={`text-xs font-black px-2 py-1 rounded-lg ${isNeon ? 'bg-[#04060C] border shadow-theme' : 'bg-[#04060C]/80 border border-slate-700'}`} style={isNeon ? {borderColor: themeColor, color: themeColor} : {color: getScoreColorHex(globalData.avgScore)}}>{Number(globalData.avgScore).toFixed(1)}</span>
                                </div>
                              )}
                              <h4 className="font-bold text-white text-sm leading-tight line-clamp-2 drop-shadow-md">{displayTitle}</h4>
                           </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
            
          </div>
        )}
        
      </main>

      <div className="md:hidden fixed bottom-0 left-0 w-full bg-[#04060C]/95 backdrop-blur-2xl border-t border-slate-800 p-2 pb-[calc(8px+env(safe-area-inset-bottom))] flex justify-around items-center z-[100] shadow-[0_-10px_40px_rgba(0,0,0,0.9)]">
         <button onClick={() => {setActiveTab('home'); setDynamicBg(''); setSelectedMovie(null);}} className={`flex-1 py-3 rounded-2xl text-sm font-black flex flex-col items-center gap-1.5 transition-colors ${activeTab === 'home' ? 'bg-theme shadow-theme' : 'text-slate-500 hover:text-white'}`}><Clapperboard size={20}/> <span className="text-[10px] uppercase tracking-widest">{t.navShowcase}</span></button>
         <button onClick={() => {setActiveTab('global'); setDynamicBg(''); setSelectedMovie(null);}} className={`flex-1 py-3 rounded-2xl text-sm font-black flex flex-col items-center gap-1.5 transition-colors ${activeTab === 'global' ? 'bg-theme shadow-theme' : 'text-slate-500 hover:text-white'}`}><Globe size={20}/> <span className="text-[10px] uppercase tracking-widest">{t.navList}</span></button>
         <button onClick={handleOpenCommunity} className={`flex-1 py-3 rounded-2xl text-sm font-black flex flex-col items-center gap-1.5 transition-colors ${activeTab === 'community' ? 'bg-theme shadow-theme' : 'text-slate-500 hover:text-white'}`}><Users size={20}/> <span className="text-[10px] uppercase tracking-widest">{t.community}</span></button>
         <button onClick={() => { if(!user){setShowLoginModal(true); return;} setActiveTab('profile_general'); setDynamicBg(''); setSelectedMovie(null);}} className={`flex-1 py-3 rounded-2xl text-sm font-black flex flex-col items-center gap-1.5 transition-colors ${activeTab.startsWith('profile') ? 'bg-theme shadow-theme' : 'text-slate-500 hover:text-white'}`}><User size={20}/> <span className="text-[10px] uppercase tracking-widest">{t.navProfile}</span></button>
      </div>

      <footer className="relative z-10 border-t border-slate-800/80 bg-[#04060C] py-10 mt-8 text-center pb-28 md:pb-10">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-black mb-2 tracking-tighter" style={{fontFamily: "'Montserrat', sans-serif"}}>
             <span className="text-white">CINE</span><span className="logo-morph-text">SCORE</span>
          </h2>
          <p className="text-slate-400 text-sm font-bold mb-6">{t.footerDesc}</p>
          <a href="https://mail.google.com/mail/?view=cm&fs=1&to=m.enesinalcik@gmail.com" target="_blank" rel="noreferrer" className="inline-flex flex-col sm:flex-row items-center gap-4 px-8 py-5 bg-slate-900/50 border border-slate-800 hover:border-theme rounded-2xl shadow-inner transition-all group cursor-pointer">
             <span className="text-slate-500 group-hover:text-slate-300 text-xs font-black uppercase tracking-widest transition-colors">{t.contactLabel}</span>
             <span className="text-white group-hover:text-theme text-base font-black transition-colors flex items-center gap-2 drop-shadow-md">
               m.enesinalcik@gmail.com
             </span>
          </a>
          <p className="text-slate-600 text-xs mt-8 font-bold">© 2026 {t.rights}</p>
        </div>
      </footer>

    </div>
  );
}