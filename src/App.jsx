import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Star, Film, Save, Award, Clapperboard, Search, Loader2, Globe, User, LogIn, LogOut, X, TrendingUp, Edit3, HelpCircle, Users, Info, Settings, Flame, Play, Crown, Ticket, Medal, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Lock, Rocket, Smile, Bookmark, BookmarkCheck, ListFilter, Plus, Share2, ListPlus, CheckCircle2, Quote, Sparkles, PieChart, Trophy, UserPlus, UserMinus, Link, Bell, Palette, Volume2, VolumeX } from 'lucide-react';
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
  { code: 'tr', tmdbCode: 'tr-TR', flag: 'https://flagcdn.com/w40/tr.png', label: 'Türkçe' },
  { code: 'en', tmdbCode: 'en-US', flag: 'https://flagcdn.com/w40/gb.png', label: 'English' },
  { code: 'de', tmdbCode: 'de-DE', flag: 'https://flagcdn.com/w40/de.png', label: 'Deutsch' },
  { code: 'it', tmdbCode: 'it-IT', flag: 'https://flagcdn.com/w40/it.png', label: 'Italiano' },
  { code: 'fr', tmdbCode: 'fr-FR', flag: 'https://flagcdn.com/w40/fr.png', label: 'Français' },
];

const TRANSLATIONS = {
  tr: {
    home: 'Ana Sayfa', ranking: 'Sıralama', community: 'Topluluk', login: 'Giriş Yap', logout: 'Çıkış Yap',
    trending: 'Şu An Popüler', topRated: 'Kült Başyapıtlar', featured: 'Haftanın Öne Çıkanları',
    searchPlaceholder: 'Film ara...', searchUsers: 'Sadece @kod ile arayın...', director: 'Yönetmen', cast: 'Oyuncular', summary: 'Özet', watchTrailer: 'Fragmanı İzle',
    saveRating: 'Puanı Kaydet', updateRating: 'Puanımı Güncelle', criteria: 'İnceleme Kriterleri', yourScore: 'Verdiğiniz Puan:', globalRanking: 'Dünya Geneli Sıralama', 
    noRating: 'Henüz film puanlanmadı.', ratedFilmsLabel: 'Oylanan Film', yourAvg: 'Ortalama', nextLevel: 'Sonraki Seviye',
    globalScoreLabel: 'Genel Puan', yourScoreLabel: 'Senin Oyun', myRatings: 'Verdiğim Puanlar', editProfile: 'Profili Düzenle', rateNow: 'Puanla',
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
    auraColor: 'Aura Rengi (Tema)', friendsWatched: 'Arkadaşlarından İzleyenler',
    deleteRatingTitle: 'Oyu Sil', deleteRatingDesc: 'Bu filme verdiğiniz puanı silmek istediğinize emin misiniz? (Dünya genel ortalamasından da anında düşülecektir.)', cancel: 'İptal', delete: 'Evet, Sil', ratingDeleted: 'Puanınız başarıyla silindi!',
    b7Name: 'Çöp Avcısı', b7Desc: 'Gizli Başarım: 3.0 puanın altında 3 berbat filme katlandın!',
    b8Name: 'Zaman Yolcusu', b8Desc: 'Gizli Başarım: 4 farklı on yıldan (Örn: 80\'ler, 90\'lar...) film oyladın!',
    b9Name: 'Gece Kuşu', b9Desc: 'Gizli Başarım: Gece 01:00 - 05:00 arasında 3 film puanladın!',
    b10Name: 'Acımasız', b10Desc: 'Gizli Başarım: Bir filme 2.0 veya altı puan vererek acımadın!',
    vsTitle: 'Kafa Kafaya (VS) Analizi', vsDisagree: 'En Çok Ayrıştıklarınız', vsAgree: 'Tamamen Aynı Düşündükleriniz', vsDiff: 'Fark',
    secretLockedDesc: '🔒 Gizli Başarım: Şartı gizlidir. Keşfederek kilidini aç!',
    newBadgeUnlocked: 'Yeni Rozet Kazandın:',
    careerCard: 'Kariyer Karnesi', cineScoreCareerAvg: 'CineScore Kariyer Ort.', yourCareerAvg: 'Senin Ortalaman', knownFor: 'Bilinen Filmleri',
    rouletteBtn: 'Sinema Ruleti', rouletteTitle: 'Bu Gece Ne İzlesem?', spinAgain: 'Tekrar Çevir', goToMovie: 'Filme Git', rouletteSpinning: 'Kaderin Seçiliyor...',
    createStory: 'Hikaye (Story) Kartı', downloadStory: 'Kartı İndir (PNG)', storyGenerating: 'Kart Hazırlanıyor...',
    storyTooltip: 'Instagram, TikTok ve WhatsApp hikayelerinde paylaşabileceğin 9:16 dikey, özel tasarım puan kartı oluşturur.',
    storyStyle1: 'Neon Aura', storyStyle2: 'Sinematik', storyStyle3: 'Klasik Bilet', storyStyle4: 'Dergi Kapağı', storyStyle5: 'Prizma Radar',
    criticLabel: 'Eleştirmen', ticketHeader: '★ RESMİ ELEŞTİRMEN ARŞİV BİLETİ ★', magazineHeader: 'ÖZEL ELEŞTİRİ SAYISI', radarHeader: 'KRİTİK RADAR ANALİZİ',
    rouletteDesc: 'İzleme listendeki tüm filmler seçtiğin animasyon modunda karıştırılır ve bu gece izleyeceğin film kaderine göre belirlenir.',
    spinMode1: '3D Karusel', spinMode2: 'Dikey Slot', spinMode3: 'Prizma Flip', roulettePicked: 'Kaderin Seçimi!',
    deleteListTitle: 'Listeyi Sil', deleteListDesc: 'Bu özel listeyi kalıcı olarak silmek istediğinize emin misiniz?', listDeleted: 'Liste silindi!',
    downloadListPoster: 'Görsel İndir', listPosterTitle: 'Liste Paylaşım Kartı',
    miniGameNav: 'Mini Oyun: SineBağ', gameTitle: 'SİNEBAĞ: FİLMLER ARASI KÖPRÜ',
    gameSubtitle: 'Ortak oyuncular üzerinden filmografiden filmografiye atlayarak iki filmi birbirine bağla.',
    showGuideBtn: 'Nasıl Oynanır?', hideGuideBtn: 'Rehberi Gizle', stepLabel: 'ADIM',
    howStep1Title: 'İki Film Seç', howStep1Desc: 'Başlangıç filmini ve ulaşmak istediğin hedef filmi belirle.',
    howStep2Title: 'Oyuncu Seç', howStep2Desc: 'Başlangıç filminin kadrosundan bir oyuncuya tıkla.',
    howStep3Title: 'Filmine Atla', howStep3Desc: 'O oyuncunun oynadığı başka bir filme geçiş yap.',
    howStep4Title: 'Hedefe Bağla', howStep4Desc: 'Hedef filmin kadrosundaki bir oyuncuya ulaşıp hedef filmi seç!',
    exampleShortestLabel: 'Örnek En Kısa Köprü:', exampleM1: 'Zindan Adası', exampleM2: 'Gilbert\'ın Hayalleri', exampleM3: 'Karayip Korsanları',
    startMovieLabel: '1. Başlangıç Filmi', targetMovieLabel: '2. Hedef Film',
    startPointBadge: 'BAŞLANGIÇ NOKTASI', targetPointBadge: 'ULAŞILACAK HEDEF',
    searchMovieGame: 'Film adı yazarak ara...', startGameBtn: 'Köprüyü Başlat', randomPairBtn: 'Rastgele 2 Film Seç',
    classicPairBtn: 'Örnek Rota: Zindan Adası ➔ Karayip Korsanları',
    bridgeChecking: 'Filmler arası bağlantı uygunluğu taranıyor...',
    bridgeImpossibleTitle: '⛔ Bu İki Film Arasında Bağ Kurulması İmkansız!',
    bridgeImpossibleNoCast: 'Seçilen filmlerden birinin veritabanında kayıtlı oyuncu kadrosu bulunmuyor. Lütfen farklı bir film seçin.',
    bridgeImpossibleIsolated: 'filmindeki oyuncuların başka hiçbir film kaydı yok (izole kadro). Bu filmden köprü kurulamaz!',
    bridgeDirectPossible: '⚡ Bilgi: Bu iki film arasında doğrudan ortak oyuncu bulunuyor (1 adımda çözülebilir).',
    bridgeNormalPossible: '✅ Bağlantı Kurulabilir: Her iki filmin kadrosu da sinema ağına bağlı.',
    chainMapTitle: 'KURULAN BAĞ ZİNCİRİ', chainStartBadge: 'BAŞLANGIÇ', chainTargetGhost: 'ULAŞILACAK HEDEF',
    nodeMovieLabel: 'FİLM', nodeActorLabel: 'OYUNCU',
    nextMoveActorBadge: 'SIRADAKİ ADIM: OYUNCU SEÇİMİ', nextMoveMovieBadge: 'SIRADAKİ ADIM: FİLM SEÇİMİ',
    stepPickActor: 'filminden köprü kuracak bir oyuncu seçin:', stepPickMovie: 'oyuncusunun oynadığı bir film seçin:',
    filterActors: 'Kadroda oyuncu ara...', filterMovies: 'Filmografide film ara...',
    undoStep: 'Geri Al', resetGame: 'Yeni Oyun',
    targetCastHint: 'Hedef Kadro İpucu',
    targetCastExplainTitle: 'Neden Hedef Filmin Kadrosuna Bakmalısın?',
    targetCastExplainDesc: 'Aşağıdaki isimler ulaşmaya çalıştığın HEDEF FİLMDE oynayan oyunculardır. Zincir kurarken bu oyunculardan herhangi birine ulaştığın an, bir sonraki adımda doğrudan Hedef Filmi seçip oyunu kazanabilirsin!',
    linksCount: 'Bağlantı', gameWonTitle: 'KÖPRÜ TAMAMLANDI!', gameWonSubtitle: 'İki filmi sinema bilginle birbirine bağladın!',
    winRank1: 'KUSURSUZ SİNEFİL ZEKASI', winRank2: 'USTA KÖPRÜ MİMARI', winRank3: 'SİNEMA GEZGİNİ',
    playAgainBtn: 'Yeni Filmlerle Oyna', retrySameBtn: 'Daha Kısa Yol Dene', changeMovie: 'Değiştir',
    targetHereBadge: '🎯 HEDEF FİLM!', targetActorHereBadge: '⚡ HEDEF FİLM OYUNCUSU!',
    spinWheelBtn: 'Çarkı Çevir', rouletteReadyText: 'Makara hazır! Filmini seçmek için çarkı çevir.',
    popularGamesTitle: '🔥 En Popüler Oyunlar (Tek Tıkla Seç)',
    popGame1: 'Zindan Adası ➔ Karayip Korsanları',
    popGame2: 'Başlangıç ➔ Yüzüklerin Efendisi',
    popGame3: 'Ucuz Roman ➔ Kara Şövalye',
    b11Name: 'Köprü Mimarı', b11Desc: 'SineBağ mini oyununda ilk film köprünü başarıyla tamamladın!',
    b12Name: 'Kestirme Dehası', b12Desc: 'Gizli Başarım: SineBağ oyununda iki filmi 2 veya daha az bağlantıda birleştirdin!',
    b13Name: 'SineBağ Ustası', b13Desc: 'SineBağ mini oyununda 5 farklı film köprüsü tamamladın!',
    dnaLockedDesc: 'film daha puanlamalısın! (En az 10 film)',
    dnaDesc: 'Seçicilik (varyans), kişisel eşik sertliği ve genel puana karar etkisi üzerinden hesaplanan 3 boyutlu kritik odak analizi.',
    rankByCriteriaLabel: 'Kriter Liderliğine Göre Sırala:', allCriteriaRank: 'Genel Sıralama',
    topFocusMyTitle: 'En Çok Dikkat Ettiğin Kriter', topFocusUserTitle: 'En Çok Dikkat Ettiği Kriter',
    topFocusSubtitle: '3 Boyutlu DNA Algoritması (Seçicilik + Sertlik + Karar Etkisi) Sonucu',
    focusPowerLabel: 'Kritik Odak Gücü', selectivityLabel: 'Seçicilik', strictnessLabel: 'Sertlik', impactLabel: 'Karar Etkisi',
    secondFocusLabel: 'İkincil Odak Noktası:', dnaCalibrationLabel: 'DNA Kalibrasyon İlerlemesi',
    focusAnalysisExplain: 'Bu kriterde otomatik pilota bağlamıyorsun; iyi ile kötüyü en keskin ayırdığın, kusurları affetmediğin ve filme vereceğin nihai puanı belirleyen ana odak noktan burası.',
    dailyBridgeTitle: 'GÜNÜN KÖPRÜSÜ', dailyBridgeDesc: 'Her gece 00:00\'da yenilenir. Bugün tüm oyuncular aynı iki filmi en az adımda bağlamaya çalışıyor!',
    playDailyBtn: 'Günün Köprüsünü Oyna', dailyCompletedBadge: 'Bugünün Köprüsü Tamamlandı', nextDailyIn: 'Yeni Köprüye:',
    communityRecordLabel: 'Bu Etabın Rekoru:', noRecordYet: 'Henüz rekor yok — İlk rekoru sen kır!',
    newRecordBanner: '🔥 YENİ TOPLULUK REKORU KIRDIN!', recordTiedBanner: '⚡ TOPLULUK REKORUNU EGALE ETTİN!',
    hardModesTitle: 'Zorlu Modlar (İsteğe Bağlı)',
    blitzModeTitle: '⚡ Blitz Modu (15sn / Hamle)', blitzModeDesc: 'Her seçim için 15 saniyen var. Süre biterse köprü çöker!',
    bannedModeTitle: '🚫 Yasaklı Başrol Modu', bannedModeDesc: 'Başlangıç filminin 1 numaralı yıldızı yasaklanır, yan rollerden gitmelisin!',
    bannedActorBadge: '🚫 YASAKLI OYUNCU', blitzTimeOutTitle: 'SÜRE DOLDU! KÖPRÜ ÇÖKTÜ',
    blitzTimeOutDesc: '15 saniye içinde hamle yapamadığın için bağlantı koptu.', tryAgainBtn: 'Hemen Tekrar Dene',
    createWinCardBtn: 'Spoiler\'sız Zafer Kartı (PNG)', copyChallengeBtn: 'Meydan Okuma Linkini Kopyala',
    challengeCopiedToast: '🔗 Meydan okuma linki kopyalandı! Arkadaşına gönder.',
    winCardModalTitle: 'SineBağ Zafer Kartı (Spoiler\'sız)', winCardChallengeText: 'SEN DAHA KISA YOLDAN BAĞLAYABİLİR MİSİN?',
    hiddenStepLabel: 'GİZLİ ADIM', recordBrokenNotif: 'SineBağ rekorunu daha kısa bir yolla kırdı:',
    stopwatchLabel: 'Süre', secShort: 'sn', yourBestLabel: 'Senin Skorun:',
    fasterRecordBanner: '⚡ DAHA HIZLI SÜRE REKORU KIRDIN!', popularRoutesHeading: 'Popüler Eşleşmeler',
    dnaMovieMatchTitle: 'Senin Zevk DNA\'na %{pct} Uyuyor',
    dnaMovieFocusStrong: 'Odak kriterin olan {crit} bu filmde çok güçlü',
    dnaMovieFocusMedium: 'Odak kriterin olan {crit} bu filmde dengeli seviyede',
    dnaMovieFocusWeak: 'Odak kriterin olan {crit} bu filmde zayıf kalmış',
    dnaMovieBadge: '3B DNA EŞLEŞME ALGORİTMASI',
    soundOn: 'Ses Efektleri Açık', soundOff: 'Ses Efektleri Kapalı',
    top3Desc: '',
    favDirectorTitle: 'En Çok İzlediğin Yönetmen', favDirectorPublicTitle: 'En Çok İzlediği Yönetmen',
    favDirectorFilmsRated: 'İzlenen Filmi', favDirectorAvgGiven: 'Verdiğin Ort. Puan',
    openCareerCardBtn: 'Tüm Filmlerini Gör',
    criteriaFocusMainTitle: 'Bir Filmde En Çok Önem Verdiğin Kriterler',
    criteriaFocusPublicTitle: 'Bir Filmde En Çok Önem Verdiği Kriterler',
    criteriaFocusMainDesc: 'Puanladığın filmlere göre seni en çok etkileyen, kusurlarını en zor affettiğin ve son puanını belirleyen kriterlerin dağılımı.',
    bubbleSelectivityTitle: '🎯 Seçicilik Nedir?',
    bubbleSelectivityDesc: 'Bu kriterde her filme benzer puanlar vermiyorsun; iyi ile kötüyü en keskin şekilde ayırdığın alan.',
    bubbleStrictnessTitle: '⚖️ Sertlik Nedir?',
    bubbleStrictnessDesc: 'Filmin diğer yönlerini beğensen bile bu kriter zayıfsa puanını en çok kırdığın, en zor beğendiğin alan.',
    bubbleImpactTitle: '⚡ Karar Etkisi Nedir?',
    bubbleImpactDesc: 'Bu kritere verdiğin puan, filme verdiğin genel puanı doğrudan yukarı veya aşağı çekiyor.',
    primaryFocusBadge: '1. ÖNCELİKLİ KRİTERİN',
    uploadFromDevice: 'Cihazdan Yükle (Maks 2MB)',
    fileSizeLimitError: 'Dosya boyutu çok büyük! Lütfen maksimum 2 MB boyutunda bir görsel seçin.',
    imageUploadSuccess: 'Görsel başarıyla yüklendi!',
    horrorProfile: 'KORKU PROFİLİ',
    scaryLabel: 'Korkunçluk', scaryDesc: 'Filmin atmosferi, psikolojik gerilimi ve rahatsız edicilik dozu ne kadardı?',
    jumpscareLabel: 'Jumpscare Oranı', jumpscareDesc: 'Aniden bağırarak korkutma (ucuz numara) oranı. 5\'ten sonra mor renge dönerek ucuzlaşır.',
    goreLabel: 'Vahşet & Kan', goreDesc: 'Görsel şiddet ve kan. Puan arttıkça damarlar belirginleşir.',
    horrorEmpty: 'Henüz oylanmış bir korku filmi bulunmuyor.'
  },
  en: {
    home: 'Home', ranking: 'Global Ranking', community: 'Community', login: 'Sign In', logout: 'Log Out', trending: 'Trending Now', topRated: 'Cult Classics', featured: 'Editor\'s Pick', searchPlaceholder: 'Search movies to rate...', searchUsers: 'Search only by @code...', director: 'Director', cast: 'Cast', summary: 'Plot Summary', watchTrailer: 'Watch Trailer', saveRating: 'Save Rating', updateRating: 'Update Rating', criteria: 'Review Criteria', yourScore: 'Your Score', globalRanking: 'Global Ranking', noRating: 'Haven\'t rated any movies yet.', ratedFilmsLabel: 'Rated Movies', yourAvg: 'Your Average', nextLevel: 'Next Badge', globalScoreLabel: 'Global', yourScoreLabel: 'Your Score', myRatings: 'My Ratings', editProfile: 'Edit Profile', rateNow: 'Rate Movie', voteCount: 'Votes', average: 'Avg', badges: 'Achievement Badges', communityAvg: 'Community Average', actionPacked: 'Action Packed', emotionalDramas: 'Emotional Dramas', turkishCinema: 'Turkish Masterpieces', sciFi: 'Sci-Fi Worlds', comedy: 'Guaranteed Laughs', c1: 'Screenplay & Depth', c1Desc: 'Plot flow, logic, character development, and originality.', c2: 'Acting Performance', c2Desc: 'Cast harmony, emotional delivery, and believability.', c3: 'Cinematography & Visuals', c3Desc: 'Camera angles, lighting, color palette, and visual atmosphere.', c4: 'Sound, Score & Design', c4Desc: 'Soundtrack, sound effects, and contribution to atmosphere.', c5: 'Editing, Pacing & Directing', c5Desc: 'Scene transitions, tempo, and keeping the audience engaged.', globalDesc: 'The massive cinema archive shaped by the community\'s toughest critics.', registeredMovies: 'Rated Movies', username: 'Username', selectAvatar: 'Choose Avatar', saveChanges: 'Save Changes', noBadges: 'Rate movies to earn badges!', b1Name: 'Popcorn Eater', b1Desc: 'Rated your first movie!', b2Name: 'Movie Buff', b2Desc: 'Passed the 10-movie mark.', b3Name: 'Festival Critic', b3Desc: '50 Movies! Getting serious.', b4Name: 'Golden Ticket', b4Desc: '100 Movies Club member.', b5Name: 'Master Director', b5Desc: '250 Movies! A living archive.', b6Name: 'God of Cinema', b6Desc: '500+ Movies! You wrote the book.', loginOr: 'OR', registerBtn: 'Create Account', namePlaceholder: 'Your Name', emailPlaceholder: 'Email Address', passPlaceholder: 'Password', navShowcase: 'HOME', navList: 'RANKING', navProfile: 'PROFILE', noData: 'No data.', watchlist: 'My Watchlist', addToWatchlist: 'Add to Watchlist', removeFromWatchlist: 'In Watchlist (Remove)', profileGeneral: 'Overview & Stats', sortBy: 'Sort by:', sortDate: 'Date Added', sortMyScore: 'My Score', sortGlobalScore: 'Global Score', emptyWatchlist: 'Your watchlist is empty.', cinematicDNA: 'Critical Focus Analysis (DNA)', dnaDesc: 'Shows which criteria you have the highest expectations for based on your ratings (Inverse proportion: Lower average means tougher standards).', customLists: 'My Custom Lists', createNewList: 'Create New List', listNamePlaceholder: 'E.g., Mind-Bending Movies...', add: 'Create', share: 'Share', copied: 'Link Copied!', selectList: 'Add to Custom List', addedToList: 'Added to list!', addCustomListHover: 'Add to Custom List', addWatchlistHover: 'Add to Watchlist', removeWatchlistHover: 'Remove from Watchlist', autoRemoveSetting: 'Auto-remove rated movies from Watchlist', autoRemoveDesc: 'When enabled, movies you rate are automatically removed from your Watchlist.', listCreated: 'List created!', errorOccurred: 'An error occurred!', bioLabel: 'Cinema Motto (Bio)', bioPlaceholder: 'Write a quote or your cinema view...', selectBanner: 'Select Profile Banner', cineZodiac: 'Cinema Zodiac', cineZodiacDesc: 'Your critic persona based on your toughest criterion.', topGenres: 'Favorite Genres', viewAll: 'View All', zodiacC1: 'Plot Hunter', zodiacC2: 'Emotion Analyst', zodiacC3: 'Visual Esthete', zodiacC4: 'Audiophile Critic', zodiacC5: 'Pacing Master', zodiacDefault: 'Novice Viewer', zC1Desc: 'You never forgive plot holes. A weak story stands no chance.', zC2Desc: 'Fake acting ruins the movie for you. You seek raw emotion.', zC3Desc: 'Your eyes work like a camera lens. Lighting and framing are everything.', zC4Desc: 'You close your eyes and listen. Weak music means a weak movie.', zC5Desc: 'You hate boring moments. Editing and rhythm are your top priorities.', top3Title: 'Holy Trinity (Top 3)', top3Desc: 'The 3 greatest movies of your life.', selectTop3Search: 'Search a movie for this slot...', verifyEmailSent: 'Verification link sent! Please check your email inbox (and Spam folder).', emailNotVerifiedError: 'Your email is not verified yet! Please click the link sent to your email.', followers: 'Followers', following: 'Following', follow: 'Follow', unfollow: 'Following', shareProfile: 'Share Profile', userCodeCopied: 'User code copied!', communityPrivacyTitle: 'Private Code Community', communityPrivacyDesc: 'For privacy reasons, users are not listed publicly. Enter your friend\'s exact 6-digit @code to find them.', mostVoted: 'Most Voted', exactCodeRequired: 'Type exact @code to search...', followingTab: 'Following', followersTab: 'Followers', theirScore: 'Their Score', theirRatedMovies: 'Rated Movies', tasteMatch: 'Taste Match', matchCalculating: 'Calculating...', dnaLockedTitle: 'DNA Analysis Locked', dnaLockedDesc: 'more movies needed to unlock your critical DNA! (20 Minimum)', dnaLockedDescPublic: 'This user hasn\'t rated enough movies to generate a DNA profile.', notifications: 'Notifications', noNotifications: 'No notifications yet.', startedFollowing: 'started following you.', auraColor: 'Profile Aura (Theme Color)', friendsWatched: 'Friends Who Watched This',
    deleteRatingTitle: 'Delete Rating', deleteRatingDesc: 'Are you sure you want to delete your rating for this movie? (It will be removed from the global average.)', cancel: 'Cancel', delete: 'Yes, Delete', ratingDeleted: 'Rating successfully deleted!',
    b7Name: 'Trash Hunter', b7Desc: 'Secret: Rated 3 terrible movies under 3.0 score!',
    b8Name: 'Time Traveler', b8Desc: 'Secret: Rated movies from 4 different decades!',
    b9Name: 'Night Owl', b9Desc: 'Secret: Rated 3 movies between 01:00 AM and 05:00 AM!',
    b10Name: 'Ruthless', b10Desc: 'Secret: Gave 2.0 or lower to a movie!',
    vsTitle: 'Head to Head (VS)', vsDisagree: 'Biggest Disagreements', vsAgree: 'Exact Same Taste', vsDiff: 'Diff',
    secretLockedDesc: '🔒 Secret Achievement: Keep rating to discover and unlock!',
    newBadgeUnlocked: 'New Badge Unlocked:',
    careerCard: 'Career Report Card', cineScoreCareerAvg: 'CineScore Avg', yourCareerAvg: 'Your Average', knownFor: 'Known For',
    rouletteBtn: 'Cinema Roulette', rouletteTitle: 'What to Watch Tonight?', spinAgain: 'Spin Again', goToMovie: 'Go to Movie', rouletteSpinning: 'Picking Your Fate...',
    createStory: 'Create Story Card', downloadStory: 'Download Card (PNG)', storyGenerating: 'Generating Card...',
    storyTooltip: 'Generates a custom 9:16 vertical rating card to share on Instagram, TikTok, or WhatsApp stories.',
    storyStyle1: 'Neon Aura', storyStyle2: 'Cinematic', storyStyle3: 'Retro Ticket', storyStyle4: 'Magazine', storyStyle5: 'Prism Radar',
    criticLabel: 'Critic', ticketHeader: '★ OFFICIAL CRITIC ARCHIVE TICKET ★', magazineHeader: 'SPECIAL CRITIC ISSUE', radarHeader: 'CRITICAL RADAR ANALYSIS',
    rouletteDesc: 'All movies in your watchlist are shuffled on a 35mm reel to pick your movie for tonight.',
    roulettePicked: 'Fate Decided!',
    deleteListTitle: 'Delete List', deleteListDesc: 'Are you sure you want to permanently delete this custom list?', listDeleted: 'List deleted!',
    downloadListPoster: 'Download Image', listPosterTitle: 'List Share Card',
    miniGameNav: 'Mini Game: CineLink', gameTitle: 'CINELINK: SIX DEGREES OF CINEMA',
    gameSubtitle: 'Jump from filmography to filmography through shared actors to connect two movies.',
    showGuideBtn: 'How to Play?', hideGuideBtn: 'Hide Guide', stepLabel: 'STEP',
    howStep1Title: 'Pick Two Movies', howStep1Desc: 'Choose a starting movie and a target movie you want to reach.',
    howStep2Title: 'Pick an Actor', howStep2Desc: 'Click an actor from the starting movie\'s cast.',
    howStep3Title: 'Jump to a Movie', howStep3Desc: 'Select another movie that actor starred in.',
    howStep4Title: 'Connect to Target', howStep4Desc: 'Reach any actor from the target movie\'s cast and select the target movie!',
    exampleShortestLabel: 'Shortest Bridge Example:', exampleM1: 'Shutter Island', exampleM2: 'What\'s Eating Gilbert Grape', exampleM3: 'Pirates of the Caribbean',
    startMovieLabel: '1. Start Movie', targetMovieLabel: '2. Target Movie',
    startPointBadge: 'STARTING POINT', targetPointBadge: 'TARGET DESTINATION',
    searchMovieGame: 'Type a movie title...', startGameBtn: 'Start Bridge', randomPairBtn: 'Pick 2 Random Movies',
    classicPairBtn: 'Classic Route: Shutter Island ➔ Pirates of the Caribbean',
    bridgeChecking: 'Analyzing bridge feasibility between movies...',
    bridgeImpossibleTitle: '⛔ Connection Impossible Between These Movies!',
    bridgeImpossibleNoCast: 'One of the selected movies has no cast records in the database. Please choose another movie.',
    bridgeImpossibleIsolated: 'has an isolated cast with no other movie credits. A bridge cannot be formed!',
    bridgeDirectPossible: '⚡ Info: These two movies share a direct cast member (can be solved in 1 link).',
    bridgeNormalPossible: '✅ Bridge Possible: Both movies have well-connected casts.',
    chainMapTitle: 'ACTIVE CONNECTION CHAIN', chainStartBadge: 'START', chainTargetGhost: 'TARGET DESTINATION',
    nodeMovieLabel: 'MOVIE', nodeActorLabel: 'ACTOR',
    nextMoveActorBadge: 'NEXT STEP: SELECT AN ACTOR', nextMoveMovieBadge: 'NEXT STEP: SELECT A MOVIE',
    stepPickActor: '— pick an actor from this movie to build the bridge:', stepPickMovie: '— pick a movie featuring this actor:',
    filterActors: 'Search actor in cast...', filterMovies: 'Search movie in filmography...',
    undoStep: 'Undo', resetGame: 'New Game',
    targetCastHint: 'Target Cast Hint',
    targetCastExplainTitle: 'Why Check the Target Movie Cast?',
    targetCastExplainDesc: 'The actors listed below star in your TARGET MOVIE. As soon as you reach any of these actors in your chain, you can immediately select the Target Movie on your next step and win!',
    linksCount: 'Links', gameWonTitle: 'BRIDGE COMPLETED!', gameWonSubtitle: 'You connected both movies with your cinema knowledge!',
    winRank1: 'FLAWLESS CINEPHILE GENIUS', winRank2: 'MASTER BRIDGE ARCHITECT', winRank3: 'CINEMA EXPLORER',
    playAgainBtn: 'Play With New Movies', retrySameBtn: 'Try Shorter Path', changeMovie: 'Change',
    targetHereBadge: '🎯 TARGET MOVIE!', targetActorHereBadge: '⚡ IN TARGET CAST!',
    spinWheelBtn: 'Spin the Reel', rouletteReadyText: 'Reel is ready! Click below to spin for tonight\'s movie.',
    popularGamesTitle: '🔥 Most Popular Games (Quick Pick)',
    popGame1: 'Shutter Island ➔ Pirates of the Caribbean',
    popGame2: 'Inception ➔ Lord of the Rings',
    popGame3: 'Pulp Fiction ➔ The Dark Knight',
    b11Name: 'Bridge Architect', b11Desc: 'Completed your first movie bridge in the CineLink mini-game!',
    b12Name: 'Shortcut Genius', b12Desc: 'Secret: Connected two movies in 2 or fewer links in CineLink!',
    b13Name: 'CineLink Master', b13Desc: 'Completed 5 movie bridges in the CineLink mini-game!',
    dnaLockedDesc: 'more movies needed to unlock your critical DNA! (10 Minimum)',
    dnaDesc: '3D critical focus analysis calculated via Selectivity (variance), Relative Strictness, and Decisive Impact on final scores.',
    rankByCriteriaLabel: 'Rank by Criterion Leadership:', allCriteriaRank: 'Overall Ranking',
    topFocusMyTitle: 'Your Most Scrutinized Criterion', topFocusUserTitle: 'Most Scrutinized Criterion',
    topFocusSubtitle: '3D DNA Algorithm (Selectivity + Strictness + Decisive Impact)',
    focusPowerLabel: 'Critical Focus Power', selectivityLabel: 'Selectivity', strictnessLabel: 'Strictness', impactLabel: 'Impact',
    secondFocusLabel: 'Secondary Focus:', dnaCalibrationLabel: 'DNA Calibration Progress',
    focusAnalysisExplain: 'You never go on autopilot here; this is where you separate masterpieces from failures most sharply and what drives your final verdict.',
    dailyBridgeTitle: 'BRIDGE OF THE DAY', dailyBridgeDesc: 'Resets daily at 00:00. Everyone tries to connect the exact same pair in the fewest links!',
    playDailyBtn: 'Play Daily Bridge', dailyCompletedBadge: 'Daily Bridge Completed', nextDailyIn: 'Next in:',
    communityRecordLabel: 'Stage Record:', noRecordYet: 'No record yet — Be the first to set it!',
    newRecordBanner: '🔥 NEW COMMUNITY RECORD SET!', recordTiedBanner: '⚡ COMMUNITY RECORD TIED!',
    hardModesTitle: 'Challenge Modes (Optional)',
    blitzModeTitle: '⚡ Blitz Mode (15s / Move)', blitzModeDesc: '15 seconds per move. If time runs out, the bridge collapses!',
    bannedModeTitle: '🚫 Banned Lead Mode', bannedModeDesc: 'The #1 lead star of the start movie is banned!',
    bannedActorBadge: '🚫 BANNED ACTOR', blitzTimeOutTitle: 'TIME UP! BRIDGE COLLAPSED',
    blitzTimeOutDesc: 'You ran out of the 15-second move timer.', tryAgainBtn: 'Try Again Now',
    createWinCardBtn: 'Spoiler-Free Victory Card (PNG)', copyChallengeBtn: 'Copy Challenge Link',
    challengeCopiedToast: '🔗 Challenge link copied! Send it to a friend.',
    winCardModalTitle: 'CineLink Victory Card (Spoiler-Free)', winCardChallengeText: 'CAN YOU CONNECT THEM IN FEWER LINKS?',
    hiddenStepLabel: 'HIDDEN STEP', recordBrokenNotif: 'broke your CineLink record with a shorter path:',
    stopwatchLabel: 'Time', secShort: 's', yourBestLabel: 'Your Best:',
    fasterRecordBanner: '⚡ NEW FASTEST TIME RECORD!', popularRoutesHeading: 'Popular Matchups',
    dnaMovieMatchTitle: 'Matches Your Taste DNA by {pct}%',
    dnaMovieFocusStrong: 'Your focus criterion ({crit}) is very strong in this movie',
    dnaMovieFocusMedium: 'Your focus criterion ({crit}) is solid in this movie',
    dnaMovieFocusWeak: 'Your focus criterion ({crit}) falls weak in this movie',
    dnaMovieBadge: '3D DNA MATCH ALGORITHM',
    soundOn: 'Sound Effects On', soundOff: 'Sound Effects Off',
    top3Desc: '',
    favDirectorTitle: 'Most Watched Director', favDirectorPublicTitle: 'Most Watched Director',
    favDirectorFilmsRated: 'Watched Movies', favDirectorAvgGiven: 'Avg Score Given',
    openCareerCardBtn: 'View All Movies',
    criteriaFocusMainTitle: 'Criteria You Care About Most in a Movie',
    criteriaFocusPublicTitle: 'Criteria They Care About Most in a Movie',
    criteriaFocusMainDesc: 'Based on your ratings, here is how much each criterion influences your final score and where your standards are toughest.',
    bubbleSelectivityTitle: '🎯 What is Selectivity?',
    bubbleSelectivityDesc: 'You don\'t give every movie the same score here; this is where you separate good from bad most sharply.',
    bubbleStrictnessTitle: '⚖️ What is Strictness?',
    bubbleStrictnessDesc: 'Even if you like other aspects of a movie, if this criterion is weak, you penalize it the most.',
    bubbleImpactTitle: '⚡ What is Impact?',
    bubbleImpactDesc: 'Your score on this criterion directly pulls your overall movie rating up or down.',
    primaryFocusBadge: '#1 TOP PRIORITY',
    uploadFromDevice: 'Upload Image (Max 2MB)',
    fileSizeLimitError: 'File is too large! Please select an image under 2 MB.',
    imageUploadSuccess: 'Image uploaded successfully!',
    horrorProfile: 'HORROR PROFILE',
    scaryLabel: 'Scary / Creepy', scaryDesc: 'Atmosphere and psychological tension.',
    jumpscareLabel: 'Jumpscare', jumpscareDesc: 'Intensity of cheap jump scares. Purples means annoying.',
    goreLabel: 'Gore & Blood', goreDesc: 'Level of visual violence and blood.',
    horrorEmpty: 'No horror movies rated yet.'
  },
  de: { 
    home: 'Startseite', ranking: 'Weltrangliste', community: 'Community', login: 'Anmelden', logout: 'Abmelden', trending: 'Aktuelle Trends', topRated: 'Kultklassiker', featured: 'Empfehlung', searchPlaceholder: 'Filme suchen...', searchUsers: 'Nur mit @Code suchen...', director: 'Regisseur', cast: 'Besetzung', summary: 'Handlung', watchTrailer: 'Trailer ansehen', saveRating: 'Speichern', updateRating: 'Aktualisieren', criteria: 'Kriterien', yourScore: 'Deine Punktzahl', globalRanking: 'Weltrangliste', noRating: 'Keine Filme bewertet.', ratedFilmsLabel: 'Bewertete Filme', yourAvg: 'Durchschnitt', nextLevel: 'Nächstes Level', globalScoreLabel: 'Global', yourScoreLabel: 'Deine Note', myRatings: 'Bewertungen', editProfile: 'Profil bearbeiten', rateNow: 'Bewerten', voteCount: 'Stimmen', average: 'Dursch.', badges: 'Abzeichen', communityAvg: 'Community-Durchschnitt', actionPacked: 'Actiongeladen', emotionalDramas: 'Emotionale Dramen', turkishCinema: 'Türkische Meisterwerke', sciFi: 'Science-Fiction', comedy: 'Komödie', c1: 'Drehbuch', c1Desc: 'Handlungsstrang und Originalität.', c2: 'Schauspiel', c2Desc: 'Wie glaubwürdig die Schauspieler sind.', c3: 'Kamera', c3Desc: 'Kamerawinkel und Beleuchtung.', c4: 'Ton & Musik', c4Desc: 'Soundeffekte und Atmosphäre.', c5: 'Schnitt', c5Desc: 'Szenenübergänge und Tempo.', globalDesc: 'Das riesige Kinoarchiv der Community.', registeredMovies: 'Bewertete Filme', username: 'Benutzername', selectAvatar: 'Avatar wählen', saveChanges: 'Speichern', noBadges: 'Bewerte Filme für Abzeichen!', b1Name: 'Popcorn-Esser', b1Desc: 'Ersten Film bewertet!', b2Name: 'Kino-Fan', b2Desc: '10 Filme erreicht.', b3Name: 'Cineast', b3Desc: '50 Filme!', b4Name: 'Goldenes Ticket', b4Desc: '100 Filme erreicht.', b5Name: 'Meister-Regisseur', b5Desc: '250 Filme.', b6Name: 'Kino-Gott', b6Desc: '500+ Filme!', loginOr: 'ODER', registerBtn: 'Registrieren', namePlaceholder: 'Name', emailPlaceholder: 'E-Mail', passPlaceholder: 'Passwort', navShowcase: 'START', navList: 'LISTE', navProfile: 'PROFIL', noData: 'Keine Daten.', watchlist: 'Merkliste', addToWatchlist: 'Zur Merkliste', removeFromWatchlist: 'Von Merkliste entfernen', profileGeneral: 'Übersicht', sortBy: 'Sortieren:', sortDate: 'Neueste', sortMyScore: 'Meine Note', sortGlobalScore: 'Globale Note', emptyWatchlist: 'Merkliste ist leer.', cinematicDNA: 'Kritische DNA-Analyse', dnaDesc: 'Deine Erwartungen basierend auf umgekehrten Bewertungen.', customLists: 'Meine Listen', createNewList: 'Neue Liste', listNamePlaceholder: 'z.B., Meisterwerke...', add: 'Hinzufügen', share: 'Teilen', copied: 'Link kopiert!', selectList: 'Zur Liste hinzufügen', addedToList: 'Zur Liste hinzugefügt!', addCustomListHover: 'Zur eigenen Liste', addWatchlistHover: 'Zur Merkliste', removeWatchlistHover: 'Aus Merkliste entfernen', autoRemoveSetting: 'Automatisch entfernen', autoRemoveDesc: 'Wenn du bewertest, wird der Film aus der Merkliste entfernt.', listCreated: 'Liste erstellt!', errorOccurred: 'Ein Fehler ist aufgetreten!', bioLabel: 'Kino Motto (Bio)', bioPlaceholder: 'z.B., May the force be with you...', selectBanner: 'Profilbanner', cineZodiac: 'Kino-Sternzeichen', cineZodiacDesc: 'Profil basierend auf deiner Kritik.', topGenres: 'Lieblingsgenres', viewAll: 'Alle ansehen', zodiacC1: 'Story-Jäger', zodiacC2: 'Charakter-Analyst', zodiacC3: 'Visueller Ästhet', zodiacC4: 'Audiophiler', zodiacC5: 'Rhythmus-Meister', zodiacDefault: 'Anfänger', zC1Desc: 'Schwache Geschichten haben keine Chance.', zC2Desc: 'Falsches Schauspiel erkennst du sofort.', zC3Desc: 'Deine Augen arbeiten wie eine Kamera.', zC4Desc: 'Atmosphäre und Musik sind alles.', zC5Desc: 'Schnitt und Tempo sind am wichtigsten.', top3Title: 'Heilige Dreifaltigkeit', top3Desc: 'Die besten 3 Filme deines Lebens.', selectTop3Search: 'Film suchen...', verifyEmailSent: 'Bitte bestätige deine E-Mail-Adresse!', emailNotVerifiedError: 'E-Mail nicht verifiziert.', followers: 'Follower', following: 'Folge ich', follow: 'Folgen', unfollow: 'Entfolgen', shareProfile: 'Profil teilen', userCodeCopied: 'Benutzercode kopiert!', communityPrivacyTitle: 'Private Community', communityPrivacyDesc: 'Geben Sie den genauen 6-stelligen @Code ein.', mostVoted: 'Meistbewertet', exactCodeRequired: 'Geben Sie den genauen @code ein...', followingTab: 'Folge ich', followersTab: 'Follower', theirScore: 'Seine Note', theirRatedMovies: 'Bewertete Filme', tasteMatch: 'Geschmacksübereinstimmung', matchCalculating: 'Berechnung...', dnaLockedTitle: 'DNA gesperrt', dnaLockedDesc: 'weitere Filme nötig. (20 Minimum)', dnaLockedDescPublic: 'Nicht genug Daten für eine Analyse.', notifications: 'Benachrichtigungen', noNotifications: 'Keine Benachrichtigungen.', startedFollowing: 'folgt dir jetzt.', auraColor: 'Aura Farbe (Thema)', friendsWatched: 'Freunde, die dies gesehen haben',
    criticLabel: 'Kritiker', ticketHeader: '★ OFFIZIELLES KRITIKER-ARCHIVTICKET ★', magazineHeader: 'KRITIKER-SONDERAUSGABE', radarHeader: 'RADAR-ANALYSE',
    storyStyle1: 'Neon Aura', storyStyle2: 'Kinoposter', storyStyle3: 'Retro-Ticket', storyStyle4: 'Magazin', storyStyle5: 'Prisma-Radar',
    rouletteBtn: 'Kino-Roulette', rouletteTitle: 'Was schauen wir heute?', rouletteDesc: 'Alle Filme deiner Merkliste werden gemischt, um deinen Film für heute Abend auszuwählen.', roulettePicked: 'Ausgewählt!', spinAgain: 'Nochmal drehen', goToMovie: 'Zum Film', createStory: 'Story-Karte', downloadStory: 'Karte herunterladen (PNG)',
    miniGameNav: 'Mini-Spiel: CineLink', gameTitle: 'CINELINK: VERBINDE DIE FILME',
    gameSubtitle: 'Springe über gemeinsame Schauspieler von Filmografie zu Filmografie, um zwei Filme zu verbinden.',
    showGuideBtn: 'Spielanleitung', hideGuideBtn: 'Anleitung ausblenden', stepLabel: 'SCHRITT',
    howStep1Title: 'Zwei Filme wählen', howStep1Desc: 'Wähle einen Startfilm und den Zielfilm, den du erreichen möchtest.',
    howStep2Title: 'Schauspieler wählen', howStep2Desc: 'Klicke auf einen Schauspieler aus der Besetzung des Startfilms.',
    howStep3Title: 'Zum Film springen', howStep3Desc: 'Wähle einen anderen Film, in dem dieser Schauspieler mitgespielt hat.',
    howStep4Title: 'Ziel verbinden', howStep4Desc: 'Erreiche einen Schauspieler des Zielfilms und wähle den Zielfilm!',
    exampleShortestLabel: 'Kürzeste Brücke (Beispiel):', exampleM1: 'Shutter Island', exampleM2: 'Gilbert Grape', exampleM3: 'Fluch der Karibik',
    startMovieLabel: '1. Startfilm', targetMovieLabel: '2. Zielfilm',
    startPointBadge: 'STARTPUNKT', targetPointBadge: 'ZIELPUNKT',
    searchMovieGame: 'Filmtitel eingeben...', startGameBtn: 'Brücke starten', randomPairBtn: '2 Zufallsfilme wählen',
    classicPairBtn: 'Klassiker: Shutter Island ➔ Fluch der Karibik',
    bridgeChecking: 'Verbindung wird geprüft...',
    bridgeImpossibleTitle: '⛔ Keine Verbindung zwischen diesen Filmen möglich!',
    bridgeImpossibleNoCast: 'Für einen der Filme sind keine Schauspieler hinterlegt. Bitte wähle einen anderen Film.',
    bridgeImpossibleIsolated: 'hat eine isolierte Besetzung ohne weitere Filme. Keine Brücke möglich!',
    bridgeDirectPossible: '⚡ Info: Diese beiden Filme teilen sich direkt einen Schauspieler (in 1 Schritt lösbar).',
    bridgeNormalPossible: '✅ Verbindung möglich: Beide Besetzungen sind gut vernetzt.',
    chainMapTitle: 'AKTIVE VERBINDUNGSKETTE', chainStartBadge: 'START', chainTargetGhost: 'ZIELFILM',
    nodeMovieLabel: 'FILM', nodeActorLabel: 'SCHAUSPIELER',
    nextMoveActorBadge: 'NÄCHSTER SCHRITT: SCHAUSPIELER WÄHLEN', nextMoveMovieBadge: 'NÄCHSTER SCHRITT: FILM WÄHLEN',
    stepPickActor: '— wähle einen Schauspieler aus diesem Film:', stepPickMovie: '— wähle einen Film mit diesem Schauspieler:',
    filterActors: 'Schauspieler suchen...', filterMovies: 'Filmografie durchsuchen...',
    undoStep: 'Zurück', resetGame: 'Neues Spiel',
    targetCastHint: 'Ziel-Besetzung (Tipp)',
    targetCastExplainTitle: 'Warum hilft die Besetzung des Zielfilms?',
    targetCastExplainDesc: 'Die unten aufgeführten Schauspieler spielen im ZIELFILM mit. Sobald du einen dieser Namen in deiner Kette erreichst, kannst du im nächsten Schritt direkt den Zielfilm auswählen und gewinnen!',
    linksCount: 'Schritte', gameWonTitle: 'BRÜCKE VOLLENDET!', gameWonSubtitle: 'Du hast beide Filme mit deinem Kinowissen verbunden!',
    winRank1: 'PERFEKTES CINEASTEN-GENIE', winRank2: 'MEISTER-ARCHITEKT', winRank3: 'KINO-ENTDECKER',
    playAgainBtn: 'Mit neuen Filmen spielen', retrySameBtn: 'Kürzeren Weg versuchen', changeMovie: 'Ändern',
    targetHereBadge: '🎯 ZIELFILM!', targetActorHereBadge: '⚡ IM ZIELFILM!',
    spinWheelBtn: 'Rad drehen', rouletteReadyText: 'Filmrolle bereit! Klicke zum Drehen.',
    popularGamesTitle: '🔥 Beliebteste Spiele (Schnellwahl)',
    popGame1: 'Shutter Island ➔ Fluch der Karibik', popGame2: 'Inception ➔ Herr der Ringe', popGame3: 'Pulp Fiction ➔ The Dark Knight',
    b11Name: 'Brückenbauer', b11Desc: 'Erste Filmbrücke in CineLink gebaut!',
    b12Name: 'Abkürzungs-Genie', b12Desc: 'Geheim: Zwei Filme in maximal 2 Schritten verbunden!',
    b13Name: 'CineLink-Meister', b13Desc: '5 Filmbrücken in CineLink vollendet!',
    dnaLockedDesc: 'weitere Filme nötig. (10 Minimum)',
    rankByCriteriaLabel: 'Nach Kriterium sortieren:', allCriteriaRank: 'Gesamtrangliste',
    topFocusMyTitle: 'Dein Hauptkriterium', topFocusUserTitle: 'Hauptkriterium',
    topFocusSubtitle: '3D-DNA-Analyse (Selektivität + Strenge + Einfluss)',
    focusPowerLabel: 'Fokus-Stärke', selectivityLabel: 'Selektivität', strictnessLabel: 'Strenge', impactLabel: 'Einfluss',
    secondFocusLabel: 'Sekundärer Fokus:', dnaCalibrationLabel: 'DNA-Kalibrierung',
    focusAnalysisExplain: 'Hier achtest du am genauesten auf Qualität, verzeihst keine Fehler und lässt dieses Kriterium dein Gesamturteil bestimmen.',
    dailyBridgeTitle: 'BRÜCKE DES TAGES', dailyBridgeDesc: 'Jeden Tag um 00:00 Uhr neu. Verbinde das Tagespaar mit so wenigen Schritten wie möglich!',
    playDailyBtn: 'Tagesbrücke spielen', dailyCompletedBadge: 'Tagesbrücke geschafft', nextDailyIn: 'Nächste in:',
    communityRecordLabel: 'Streckenrekord:', noRecordYet: 'Noch kein Rekord — Stell ihn auf!',
    newRecordBanner: '🔥 NEUER COMMUNITY-REKORD!', recordTiedBanner: '⚡ REKORD EINGESTELLT!',
    hardModesTitle: 'Herausforderungsmodi',
    blitzModeTitle: '⚡ Blitz-Modus (15s / Zug)', blitzModeDesc: '15 Sekunden pro Zug!',
    bannedModeTitle: '🚫 Gesperrter Hauptdarsteller', bannedModeDesc: 'Der Hauptstar des Startfilms ist gesperrt!',
    bannedActorBadge: '🚫 GESPERRT', blitzTimeOutTitle: 'ZEIT ABGELAUFEN!',
    blitzTimeOutDesc: 'Die 15 Sekunden sind abgelaufen.', tryAgainBtn: 'Nochmal versuchen',
    createWinCardBtn: 'Spoilerfreie Siegkarte (PNG)', copyChallengeBtn: 'Challenge-Link kopieren',
    challengeCopiedToast: '🔗 Challenge-Link kopiert!',
    winCardModalTitle: 'CineLink Siegkarte', winCardChallengeText: 'SCHAFFST DU ES KÜRZER?',
    hiddenStepLabel: 'VERBORGEN', recordBrokenNotif: 'hat deinen CineLink-Rekord gebrochen:'
    , stopwatchLabel: 'Zeit', secShort: 's', yourBestLabel: 'Dein Score:', fasterRecordBanner: '⚡ NEUER ZEITREKORD!', popularRoutesHeading: 'Beliebte Duelle',
    dnaMovieMatchTitle: 'Passt zu {pct}% zu deiner Geschmacks-DNA',
    dnaMovieFocusStrong: 'Dein Fokus-Kriterium ({crit}) ist in diesem Film sehr stark',
    dnaMovieFocusMedium: 'Dein Fokus-Kriterium ({crit}) ist in diesem Film solide',
    dnaMovieFocusWeak: 'Dein Fokus-Kriterium ({crit}) ist in diesem Film eher schwach',
    dnaMovieBadge: '3D-DNA-MATCH-ALGORITHMUS',
    soundOn: 'Soundeffekte An', soundOff: 'Soundeffekte Aus',
    top3Desc: '',
    favDirectorTitle: 'Meistgesehener Regisseur', favDirectorPublicTitle: 'Meistgesehener Regisseur',
    favDirectorFilmsRated: 'Gesehene Filme', favDirectorAvgGiven: 'Vergebene Ø-Note',
    openCareerCardBtn: 'Alle Filme ansehen',
    criteriaFocusMainTitle: 'Kriterien, die dir bei Filmen am wichtigsten sind',
    criteriaFocusPublicTitle: 'Wichtigste Filmkriterien',
    criteriaFocusMainDesc: 'Basierend auf deinen Bewertungen zeigt diese Grafik, worauf du bei einem Film am meisten achtest.',
    bubbleSelectivityTitle: '🎯 Was ist Selektivität?',
    bubbleSelectivityDesc: 'Hier trennst du gute und schlechte Filme am schärfsten voneinander.',
    bubbleStrictnessTitle: '⚖️ Was ist Strenge?',
    bubbleStrictnessDesc: 'Wenn dieses Kriterium schwach ist, ziehst du am meisten Punkte ab.',
    bubbleImpactTitle: '⚡ Was ist Einfluss?',
    bubbleImpactDesc: 'Deine Note hier bestimmt maßgeblich deine Gesamtbewertung für den Film.',
    primaryFocusBadge: '#1 HAUPTFOKUS',
    uploadFromDevice: 'Hochladen (Max 2MB)',
    fileSizeLimitError: 'Datei zu groß! Bitte maximal 2 MB auswählen.',
    imageUploadSuccess: 'Bild erfolgreich hochgeladen!',
    horrorProfile: 'HORROR-PROFIL',
    scaryLabel: 'Gruselfaktor', scaryDesc: 'Atmosphäre und psychologische Spannung.',
    jumpscareLabel: 'Jumpscare-Rate', jumpscareDesc: 'Übermäßig viele billige Schockmomente?',
    goreLabel: 'Blut & Gewalt', goreDesc: 'Visuelle Gewalt und Zerstückelung.',
    horrorEmpty: 'Keine Horrorfilme bewertet.'
  },
  it: { 
    home: 'Home', ranking: 'Classifica Globale', community: 'Community', login: 'Accedi', logout: 'Esci', trending: 'In Tendenza', topRated: 'Classici Cult', featured: 'In Primo Piano', searchPlaceholder: 'Cerca film...', searchUsers: 'Cerca solo per @codice...', director: 'Regista', cast: 'Cast', summary: 'Trama', watchTrailer: 'Trailer', saveRating: 'Salva', updateRating: 'Aggiorna', criteria: 'Criteri di Recensione', yourScore: 'Tuo Punteggio', globalRanking: 'Classifica Globale', noRating: 'Nessun film valutato.', ratedFilmsLabel: 'Film Valutati', yourAvg: 'Tua Media', nextLevel: 'Prossimo Livello', globalScoreLabel: 'Globale', yourScoreLabel: 'Tuo Voto', myRatings: 'Valutazioni', editProfile: 'Modifica Profilo', rateNow: 'Valuta', voteCount: 'Voti', average: 'Media', badges: 'Distintivi', communityAvg: 'Media della Community', actionPacked: 'Azione', emotionalDramas: 'Drammi Emozionali', turkishCinema: 'Capolavori Turchi', sciFi: 'Fantascienza', comedy: 'Commedia', c1: 'Sceneggiatura', c1Desc: 'Trama e originalità.', c2: 'Recitazione', c2Desc: 'Credibilità degli attori.', c3: 'Fotografia', c3Desc: 'Inquadrature e luce.', c4: 'Suono', c4Desc: 'Musica e atmosfera.', c5: 'Montaggio', c5Desc: 'Ritmo del film.', globalDesc: 'L\'enorme archivio della community.', registeredMovies: 'Film Votati', username: 'Nome Utente', selectAvatar: 'Scegli Avatar', saveChanges: 'Salva', noBadges: 'Valuta per distintivi!', b1Name: 'Mangia Popcorn', b1Desc: 'Primo film!', b2Name: 'Cinefilo', b2Desc: 'Superati i 10 film.', b3Name: 'Critico', b3Desc: '50 Film!', b4Name: 'Biglietto D\'oro', b4Desc: 'Club dei 100 Film.', b5Name: 'Maestro', b5Desc: '250 Film.', b6Name: 'Dio del Cinema', b6Desc: '500+ Film!', loginOr: 'OPPURE', registerBtn: 'Registrati', namePlaceholder: 'Nome', emailPlaceholder: 'Email', passPlaceholder: 'Password', navShowcase: 'VETRINA', navList: 'LISTE', navProfile: 'PROFILO', noData: 'Nessun dato.', watchlist: 'La mia Lista', addToWatchlist: 'Aggiungi alla Lista', removeFromWatchlist: 'Rimuovi dalla Lista', profileGeneral: 'Panoramica', sortBy: 'Ordina per:', sortDate: 'Più Recenti', sortMyScore: 'Mio Voto', sortGlobalScore: 'Voto Globale', emptyWatchlist: 'La lista è vuota.', cinematicDNA: 'DNA Critico', dnaDesc: 'Le tue aspettative in base ai voti.', customLists: 'Le Mie Liste', createNewList: 'Crea Nuova Lista', listNamePlaceholder: 'Es. Capolavori...', add: 'Aggiungi', share: 'Condividi', copied: 'Link copiato!', selectList: 'Aggiungi alla lista', addedToList: 'Aggiunto!', addCustomListHover: 'Aggiungi a lista personalizzata', addWatchlistHover: 'Aggiungi alla lista', removeWatchlistHover: 'Rimuovi dalla lista', autoRemoveSetting: 'Rimuovi automaticamente', autoRemoveDesc: 'Rimuovi automaticamente dopo il voto.', listCreated: 'Lista creata!', errorOccurred: 'Si è verificato un errore!', bioLabel: 'Motto Cinematografico', bioPlaceholder: 'Es: May the force be with you...', selectBanner: 'Banner del profilo', cineZodiac: 'Zodiaco del Cinema', cineZodiacDesc: 'Il tuo profilo critico.', topGenres: 'Generi Preferiti', viewAll: 'Vedi Tutti', zodiacC1: 'Cacciatore di Storie', zodiacC2: 'Analista', zodiacC3: 'Esteta Visivo', zodiacC4: 'Audiofilo', zodiacC5: 'Maestro del Ritmo', zodiacDefault: 'Principiante', zC1Desc: 'Non perdoni i buchi di trama.', zC2Desc: 'Cerchi solo emozioni reali.', zC3Desc: 'I tuoi occhi sono come una cinepresa.', zC4Desc: 'Vivi per l\'atmosfera.', zC5Desc: 'Il ritmo è fondamentale.', top3Title: 'Sacra Trinità', top3Desc: 'I 3 migliori film della tua vita.', selectTop3Search: 'Cerca film...', verifyEmailSent: 'Verifica la tua email!', emailNotVerifiedError: 'Email non verificata.', followers: 'Follower', following: 'Seguiti', follow: 'Segui', unfollow: 'Smetti di seguire', shareProfile: 'Condividi Profilo', userCodeCopied: 'Codice utente copiato!', communityPrivacyTitle: 'Community Privata', communityPrivacyDesc: 'Inserisci il @codice esatto.', mostVoted: 'Più Votati', exactCodeRequired: 'Inserisci il @codice esatto...', followingTab: 'Seguiti', followersTab: 'Follower', theirScore: 'Suo Voto', theirRatedMovies: 'Film Valutati', tasteMatch: 'Affinità', matchCalculating: 'Calcolo...', dnaLockedTitle: 'DNA Bloccato', dnaLockedDesc: 'film necessari. (Minimo 20)', dnaLockedDescPublic: 'Non ci sono dati sufficienti.', notifications: 'Notifiche', noNotifications: 'Nessuna notifica.', startedFollowing: 'ha iniziato a seguirti.', auraColor: 'Colore Aura (Tema)', friendsWatched: 'Amici che hanno guardato',
    criticLabel: 'Critico', ticketHeader: '★ BIGLIETTO D\'ARCHIVIO CRITICO ★', magazineHeader: 'EDIZIONE SPECIALE CRITICA', radarHeader: 'ANALISI RADAR CRITICA',
    storyStyle1: 'Neon Aura', storyStyle2: 'Poster Cinema', storyStyle3: 'Biglietto Retro', storyStyle4: 'Rivista', storyStyle5: 'Prisma Radar',
    rouletteBtn: 'Roulette Cinema', rouletteTitle: 'Cosa guardare stasera?', rouletteDesc: 'Tutti i film nella tua lista vengono mescolati per scegliere il film di stasera.', roulettePicked: 'Scelto dal Destino!', spinAgain: 'Gira Ancora', goToMovie: 'Vai al Film', createStory: 'Crea Story Card', downloadStory: 'Scarica Card (PNG)',
    miniGameNav: 'Mini Gioco: CineLink', gameTitle: 'CINELINK: COLLEGA I FILM',
    gameSubtitle: 'Salta da una filmografia all\'altra attraverso gli attori in comune per collegare due film.',
    showGuideBtn: 'Come si gioca?', hideGuideBtn: 'Nascondi guida', stepLabel: 'PASSO',
    howStep1Title: 'Scegli Due Film', howStep1Desc: 'Scegli un film di partenza e il film obiettivo da raggiungere.',
    howStep2Title: 'Scegli un Attore', howStep2Desc: 'Clicca su un attore del cast del film di partenza.',
    howStep3Title: 'Salta a un Film', howStep3Desc: 'Seleziona un altro film in cui ha recitato quell\'attore.',
    howStep4Title: 'Relier la Cible', howStep4Desc: 'Raggiungi un attore del film obiettivo e seleziona il film final !',
    exampleShortestLabel: 'Esempio Ponte Breve:', exampleM1: 'Shutter Island', exampleM2: 'Buon compleanno Mr. Grape', exampleM3: 'Pirati dei Caraibi',
    startMovieLabel: '1. Film di Partenza', targetMovieLabel: '2. Film Obiettivo',
    startPointBadge: 'PUNTO DI PARTENZA', targetPointBadge: 'OBIETTIVO FINALE',
    searchMovieGame: 'Cerca il titolo di un film...', startGameBtn: 'Inizia il Ponte', randomPairBtn: 'Scegli 2 Film Casuali',
    classicPairBtn: 'Percorso Classico: Shutter Island ➔ Pirati dei Caraibi',
    bridgeChecking: 'Analisi fattibilità del ponte in corso...',
    bridgeImpossibleTitle: '⛔ Collegamento Impossibile Tra Questi Film!',
    bridgeImpossibleNoCast: 'Uno dei film selezionati non ha attori registrati. Scegli un altro film.',
    bridgeImpossibleIsolated: 'ha un cast isolato senza altri film registrati. Impossibile creare un ponte!',
    bridgeDirectPossible: '⚡ Info: Questi due film condividono direttamente un attore (risolvibile in 1 passo).',
    bridgeNormalPossible: '✅ Ponte Possibile: Entrambi i cast sono ben collegati.',
    chainMapTitle: 'CATENA DI COLLEGAMENTO', chainStartBadge: 'INIZIO', chainTargetGhost: 'OBIETTIVO FINALE',
    nodeMovieLabel: 'FILM', nodeActorLabel: 'ATTORE',
    nextMoveActorBadge: 'PROSSIMO PASSO: SCEGLI ATTORE', nextMoveMovieBadge: 'PROSSIMO PASSO: SCEGLI FILM',
    stepPickActor: '— scegli un attore da questo film:', stepPickMovie: '— scegli un film con questo attore:',
    filterActors: 'Cerca attore nel cast...', filterMovies: 'Cerca film nella filmografia...',
    undoStep: 'Indietro', resetGame: 'Nuova Partita',
    targetCastHint: 'Cast Obiettivo (Indizio)',
    targetCastExplainTitle: 'Perché guardare il Cast del Film Obiettivo?',
    targetCastExplainDesc: 'Gli attori elencati qui sotto recitano nel tuo FILM OBIETTIVO. Non appena raggiungi uno qualsiasi di questi attori nella tua catena, potrai selezionare direttamente il Film Obiettivo al passo successivo e vincere!',
    linksCount: 'Passi', gameWonTitle: 'PONTE COMPLETATO!', gameWonSubtitle: 'Hai collegato entrambi i film con la tua cultura cinematografica!',
    winRank1: 'GENIO CINEFILO PERFETTO', winRank2: 'MAESTRO ARCHITETTO', winRank3: 'ESPLORATORE DEL CINEMA',
    playAgainBtn: 'Gioca con Nuovi Film', retrySameBtn: 'Prova Percorso Più Breve', changeMovie: 'Cambia',
    targetHereBadge: '🎯 FILM OBIETTIVO!', targetActorHereBadge: '⚡ NEL CAST OBIETTIVO!',
    spinWheelBtn: 'Gira la Ruota', rouletteReadyText: 'Bobina pronta! Premi per girare.',
    popularGamesTitle: '🔥 Giochi Più Popolari (Scelta Rapida)',
    popGame1: 'Shutter Island ➔ Pirati dei Caraibi', popGame2: 'Inception ➔ Il Signore degli Anelli', popGame3: 'Pulp Fiction ➔ Il Cavaliere Oscuro',
    b11Name: 'Architetto di Ponti', b11Desc: 'Primo ponte completato in CineLink!',
    b12Name: 'Genio della Scorciatoia', b12Desc: 'Segreto: Due film collegati in 2 o meno passi!',
    b13Name: 'Maestro CineLink', b13Desc: '5 ponti completati in CineLink!',
    dnaLockedDesc: 'film necessari. (Minimo 10)',
    rankByCriteriaLabel: 'Ordina per Criterio:', allCriteriaRank: 'Classifica Generale',
    topFocusMyTitle: 'Il Tuo Criterio Principale', topFocusUserTitle: 'Criterio Principale',
    topFocusSubtitle: 'Algoritmo DNA 3D (Selettività + Severità + Impatto)',
    focusPowerLabel: 'Forza di Focus', selectivityLabel: 'Selettività', strictnessLabel: 'Severità', impactLabel: 'Impatto',
    secondFocusLabel: 'Focus Secondario:', dnaCalibrationLabel: 'Calibrazione DNA',
    focusAnalysisExplain: 'Questo è il criterio che analizzi con più attenzione, dove separi nettamente i capolavori dai film mediocri.',
    dailyBridgeTitle: 'PONTE DEL GIORNO', dailyBridgeDesc: 'Si rinnova ogni giorno a mezzanotte. Collega i due film del giorno con il minor numero di passi!',
    playDailyBtn: 'Gioca il Ponte del Giorno', dailyCompletedBadge: 'Ponte del Giorno Completato', nextDailyIn: 'Prossimo tra:',
    communityRecordLabel: 'Record Tratta:', noRecordYet: 'Nessun record — Stabiliscilo tu!',
    newRecordBanner: '🔥 NUOVO RECORD DELLA COMMUNITY!', recordTiedBanner: '⚡ RECORD PAREGGIATO!',
    hardModesTitle: 'Modalità Difficili',
    blitzModeTitle: '⚡ Modalità Blitz (15s / Mossa)', blitzModeDesc: '15 secondi per mossa!',
    bannedModeTitle: '🚫 Protagonista Vietato', bannedModeDesc: 'La star principale del film di partenza è bloccata!',
    bannedActorBadge: '🚫 VIETATO', blitzTimeOutTitle: 'TEMPO SCADUTO!',
    blitzTimeOutDesc: 'Non hai effettuato la mossa entro 15 secondi.', tryAgainBtn: 'Riprova Ora',
    createWinCardBtn: 'Card Vittoria Senza Spoiler (PNG)', copyChallengeBtn: 'Copia Link Sfida',
    challengeCopiedToast: '🔗 Link di sfida copiato!',
    winCardModalTitle: 'Card Vittoria CineLink', winCardChallengeText: 'RIESCI A FARLO IN MENO PASSI?',
    hiddenStepLabel: 'NASCOSTO', recordBrokenNotif: 'ha battuto il tuo record CineLink:',
    stopwatchLabel: 'Tempo', secShort: 's', yourBestLabel: 'Tuo Score:', fasterRecordBanner: '⚡ NUOVO RECORD DI TEMPO!', popularRoutesHeading: 'Sfide Popolari',
    dnaMovieMatchTitle: 'Compatibile al {pct}% con il tuo DNA',
    dnaMovieFocusStrong: 'Il tuo criterio chiave ({crit}) è molto forte in questo film',
    dnaMovieFocusMedium: 'Il tuo criterio chiave ({crit}) è equilibrato in questo film',
    dnaMovieFocusWeak: 'Il tuo criterio chiave ({crit}) è debole in questo film',
    dnaMovieBadge: 'ALGORITMO MATCH DNA 3D',
    soundOn: 'Effetti Sonori Attivi', soundOff: 'Effetti Sonori Disattivati',
    top3Desc: '',
    favDirectorTitle: 'Regista Più Seguito', favDirectorPublicTitle: 'Regista Più Seguito',
    favDirectorFilmsRated: 'Film Visti', favDirectorAvgGiven: 'Media Voti Data',
    openCareerCardBtn: 'Vedi Tutti i Film',
    criteriaFocusMainTitle: 'I Criteri a Cui Dai Più Importanza in un Film',
    criteriaFocusPublicTitle: 'I Criteri a Cui Dà Più Importanza',
    criteriaFocusMainDesc: 'In base ai tuoi voti, ecco gli aspetti che contano di più per te e che decidono il tuo giudizio finale.',
    bubbleSelectivityTitle: '🎯 Cos\'è la Selettività?',
    bubbleSelectivityDesc: 'In questo criterio separi in modo netto i film belli da quelli brutti.',
    bubbleStrictnessTitle: '⚖️ Cos\'è la Severità?',
    bubbleStrictnessDesc: 'Anche se il resto del film funziona, se questo aspetto è debole abbassi subito il voto.',
    bubbleImpactTitle: '⚡ Cos\'è l\'Impatto?',
    bubbleImpactDesc: 'Il voto che dai qui trascina direttamente in alto o in basso il voto finale del film.',
    primaryFocusBadge: '#1 PRIORITÀ ASSOLUTA',
    uploadFromDevice: 'Carica Foto (Max 2MB)',
    fileSizeLimitError: 'File troppo grande! Massimo 2 MB.',
    imageUploadSuccess: 'Immagine caricata con successo!',
    horrorProfile: 'PROFILO HORROR',
    scaryLabel: 'Spaventoso', scaryDesc: 'Tensione psicologica e atmosfera.',
    jumpscareLabel: 'Jumpscare', jumpscareDesc: 'Quanti spaventi improvvisi?',
    goreLabel: 'Sangue e Violenza', goreDesc: 'Livello di violenza visiva.',
    horrorEmpty: 'Nessun film horror valutato.'
  },
  fr: { 
    home: 'Accueil', ranking: 'Classement Mondial', community: 'Communauté', login: 'Connexion', logout: 'Déconnexion', trending: 'Tendances', topRated: 'Classiques Cultes', featured: 'En Vedette', searchPlaceholder: 'Rechercher...', searchUsers: 'Rechercher par @code...', director: 'Réalisateur', cast: 'Casting', summary: 'Résumé', watchTrailer: 'Bande-annonce', saveRating: 'Enregistrer', updateRating: 'Mettre à jour', criteria: 'Critères', yourScore: 'Votre Note', globalRanking: 'Classement Mondial', noRating: 'Aucun film évalué.', ratedFilmsLabel: 'Films Évalués', yourAvg: 'Moyenne', nextLevel: 'Niveau Suivant', globalScoreLabel: 'Globale', yourScoreLabel: 'Votre Note', myRatings: 'Évaluations', editProfile: 'Modifier le Profil', rateNow: 'Évaluer', voteCount: 'Votes', average: 'Moyenne', badges: 'Badges', communityAvg: 'Moyenne de la Communauté', actionPacked: 'Action', emotionalDramas: 'Drames Émotionnels', turkishCinema: 'Chefs-d\'œuvre Turcs', sciFi: 'Science-Fiction', comedy: 'Comédie', c1: 'Scénario', c1Desc: 'Intrigue et originalité.', c2: 'Acteur', c2Desc: 'Crédibilité des acteurs.', c3: 'Cinématographie', c3Desc: 'Angles et éclairage.', c4: 'Son', c4Desc: 'Musique et ambiance.', c5: 'Montage', c5Desc: 'Rythme du film.', globalDesc: 'L\'archive cinématographique de la communauté.', registeredMovies: 'Films Notés', username: 'Nom d\'utilisateur', selectAvatar: 'Choisir un Avatar', saveChanges: 'Enregistrer', noBadges: 'Évaluez pour gagner des badges!', b1Name: 'Mangeur de Popcorn', b1Desc: 'Premier film!', b2Name: 'Cinéphile', b2Desc: '10 films.', b3Name: 'Critique', b3Desc: '50 Films!', b4Name: 'Billet d\'Or', b4Desc: 'Club des 100 films.', b5Name: 'Maître', b5Desc: '250 Films.', b6Name: 'Dieu du Cinéma', b6Desc: '500+ Films!', loginOr: 'OU', registerBtn: 'S\'inscrire', namePlaceholder: 'Nom', emailPlaceholder: 'Email', passPlaceholder: 'Mot de passe', navShowcase: 'ACCUEIL', navList: 'LISTE', navProfile: 'PROFIL', noData: 'Aucune donnée.', watchlist: 'Ma Liste', addToWatchlist: 'Ajouter à la Liste', removeFromWatchlist: 'Retirer de la Liste', profileGeneral: 'Aperçu', sortBy: 'Trier par:', sortDate: 'Plus Récent', sortMyScore: 'Ma Note', sortGlobalScore: 'Note Globale', emptyWatchlist: 'Votre liste est vide.', cinematicDNA: 'Analyse ADN Critique', dnaDesc: 'Vos attentes en fonction de vos notes.', customLists: 'Mes Listes', createNewList: 'Créer une liste', listNamePlaceholder: 'Ex: Chefs-d\'œuvre...', add: 'Ajouter', share: 'Partager', copied: 'Lien copié!', selectList: 'Ajouter à la liste', addedToList: 'Ajouté à la liste!', addCustomListHover: 'Ajouter à une liste', addWatchlistHover: 'Ajouter à ma liste', removeWatchlistHover: 'Retirer de la liste', autoRemoveSetting: 'Retrait automatique', autoRemoveDesc: 'Automatiquement supprimé après évaluation.', listCreated: 'Liste créée!', errorOccurred: 'Une erreur s\'est produite!', bioLabel: 'Citation (Bio)', bioPlaceholder: 'Ex: May the force be with you...', selectBanner: 'Bannière de profil', cineZodiac: 'Zodiaco del Cinema', cineZodiacDesc: 'Votre profil basé sur vos critiques.', topGenres: 'Genres Préférés', viewAll: 'Voir Tout', zodiacC1: 'Chasseur d\'histoires', zodiacC2: 'Analyste', zodiacC3: 'Esthète Visuel', zodiacC4: 'Audiophile', zodiacC5: 'Maître du Rythme', zodiacDefault: 'Débutant', zC1Desc: 'L\'histoire est tout pour vous.', zC2Desc: 'L\'émotion est essentielle.', zC3Desc: 'Vos yeux fonctionnent comme une caméra.', zC4Desc: 'La musique et l\'atmosphère priment.', zC5Desc: 'Le montage et le rythme sont critiques.', top3Title: 'Sainte Trinité', top3Desc: 'Les 3 meilleurs films de votre vie.', selectTop3Search: 'Rechercher...', verifyEmailSent: 'Veuillez vérifier votre e-mail !', emailNotVerifiedError: 'E-mail non vérifié.', followers: 'Abonnés', following: 'Abonnements', follow: 'Suivre', unfollow: 'Ne plus suivre', shareProfile: 'Partager le Profil', userCodeCopied: 'Code utilisateur copié!', communityPrivacyTitle: 'Communauté Privée', communityPrivacyDesc: 'Entrez le @code exact pour trouver votre ami.', mostVoted: 'Les Plus Votés', exactCodeRequired: 'Entrez le @code exact...', followingTab: 'Abonnements', followersTab: 'Abonnés', theirScore: 'Leur Note', theirRatedMovies: 'Films Évalués', tasteMatch: 'Affinité', matchCalculating: 'Calcul...', dnaLockedTitle: 'ADN Verrouillé', dnaLockedDesc: 'films nécessaires. (20 Minimum)', dnaLockedDescPublic: 'Pas assez de données.', notifications: 'Notifications', noNotifications: 'Aucune notification.', startedFollowing: 'a commencé à vous suivre.', auraColor: 'Couleur Aura (Thème)', friendsWatched: 'Amis qui ont regardé',
    criticLabel: 'Critique', ticketHeader: '★ BILLET D\'ARCHIVE CRITIQUE OFFICIEL ★', magazineHeader: 'ÉDITION SPÉCIALE CRITIQUE', radarHeader: 'ANALYSE RADAR CRITIQUE',
    storyStyle1: 'Neon Aura', storyStyle2: 'Affiche Cinéma', storyStyle3: 'Billet Rétro', storyStyle4: 'Magazine', storyStyle5: 'Prisme Radar',
    rouletteBtn: 'Roulette Cinéma', rouletteTitle: 'Que regarder ce soir ?', rouletteDesc: 'Tous les films de votre liste sont mélangés pour choisir votre film de ce soir.', roulettePicked: 'Choisi par le Destin !', spinAgain: 'Relancer', goToMovie: 'Voir le Film', createStory: 'Créer Carte Story', downloadStory: 'Télécharger (PNG)',
    miniGameNav: 'Mini-Jeu: CineLink', gameTitle: 'CINELINK: RELIEZ LES FILMS',
    gameSubtitle: 'Sautez de filmographie en filmographie via des acteurs communs pour relier deux films.',
    showGuideBtn: 'Comment jouer ?', hideGuideBtn: 'Masquer le guide', stepLabel: 'ÉTAPE',
    howStep1Title: 'Choisir Deux Films', howStep1Desc: 'Choisissez un film de départ et le film cible à atteindre.',
    howStep2Title: 'Choisir un Acteur', howStep2Desc: 'Cliquez sur un acteur du casting du film de départ.',
    howStep3Title: 'Sauter vers un Film', howStep3Desc: 'Sélectionnez un autre film dans lequel cet acteur a joué.',
    howStep4Title: 'Relier la Cible', howStep4Desc: 'Atteignez un acteur du film cible et sélectionnez le film final !',
    exampleShortestLabel: 'Exemple de Pont Court :', exampleM1: 'Shutter Island', exampleM2: 'Gilbert Grape', exampleM3: 'Pirates des Caraïbes',
    startMovieLabel: '1. Film de Départ', targetMovieLabel: '2. Film Cible',
    startPointBadge: 'POINT DE DÉPART', targetPointBadge: 'DESTINATION CIBLE',
    searchMovieGame: 'Tapez le titre d\'un film...', startGameBtn: 'Lancer le Pont', randomPairBtn: 'Choisir 2 Films au Hasard',
    classicPairBtn: 'Route Classique : Shutter Island ➔ Pirates des Caraïbes',
    bridgeChecking: 'Analyse de la connexion entre les films...',
    bridgeImpossibleTitle: '⛔ Connexion Impossible Entre Ces Films !',
    bridgeImpossibleNoCast: 'L\'un des films sélectionnés n\'a aucun acteur enregistré. Veuillez choisir un autre film.',
    bridgeImpossibleIsolated: 'a un casting isolé sans aucun autre film. Impossible de créer un pont !',
    bridgeDirectPossible: '⚡ Info : Ces deux films partagent directement un acteur (résoluble en 1 étape).',
    bridgeNormalPossible: '✅ Pont Possible : Les deux castings sont bien reliés.',
    chainMapTitle: 'CHAÎNE DE CONNEXION', chainStartBadge: 'DÉPART', chainTargetGhost: 'DESTINATION CIBLE',
    nodeMovieLabel: 'FILM', nodeActorLabel: 'ACTEUR',
    nextMoveActorBadge: 'PROCHAINE ÉTAPE : CHOISIR UN ACTEUR', nextMoveMovieBadge: 'PROCHAINE ÉTAPE : CHOISIR UN FILM',
    stepPickActor: '— choisissez un acteur de ce film :', stepPickMovie: '— choisissez un film avec cet acteur :',
    filterActors: 'Chercher un acteur...', filterMovies: 'Chercher dans la filmographie...',
    undoStep: 'Annuler', resetGame: 'Nouvelle Partie',
    targetCastHint: 'Casting Cible (Indice)',
    targetCastExplainTitle: 'Pourquoi consulter le Casting du Film Cible ?',
    targetCastExplainDesc: 'Les acteurs listés ci-dessous jouent dans votre FILM CIBLE. Dès que vous atteignez l\'un de ces acteurs dans votre chaîne, vous pouvez immédiatement sélectionner le Film Cible à l\'étape suivante et gagner !',
    linksCount: 'Liens', gameWonTitle: 'PONT TERMINÉ !', gameWonSubtitle: 'Vous avez relié les deux films grâce à votre culture cinéma !',
    winRank1: 'GÉNIE CINÉPHILE PARFAIT', winRank2: 'MAÎTRE ARCHITECTE', winRank3: 'EXPLORATEUR DU CINÉMA',
    playAgainBtn: 'Jouer avec de Nouveaux Films', retrySameBtn: 'Essayer un Chemin Plus Court', changeMovie: 'Changer',
    targetHereBadge: '🎯 FILM CIBLE !', targetActorHereBadge: '⚡ DANS LE CASTING CIBLE !',
    spinWheelBtn: 'Tourner la Roue', rouletteReadyText: 'Bobine prête ! Cliquez pour lancer.',
    popularGamesTitle: '🔥 Jeux les Plus Populaires (Choix Rapide)',
    popGame1: 'Shutter Island ➔ Pirates des Caraïbes', popGame2: 'Inception ➔ Le Seigneur des Anneaux', popGame3: 'Pulp Fiction ➔ The Dark Knight',
    b11Name: 'Architecte de Ponts', b11Desc: 'Premier pont complété dans CineLink !',
    b12Name: 'Génie du Raccourci', b12Desc: 'Segreto: Due film collegati in 2 o meno passi!',
    b13Name: 'Maestro CineLink', b13Desc: '5 ponts complétés dans CineLink !',
    dnaLockedDesc: 'films nécessaires. (10 Minimum)',
    rankByCriteriaLabel: 'Trier par Critère :', allCriteriaRank: 'Classement Général',
    topFocusMyTitle: 'Votre Critère Principal', topFocusUserTitle: 'Critère Principal',
    topFocusSubtitle: 'Algorithme ADN 3D (Sélectivité + Rigueur + Impact)',
    focusPowerLabel: 'Puissance de Focus', selectivityLabel: 'Sélectivité', strictnessLabel: 'Rigueur', impactLabel: 'Impact',
    secondFocusLabel: 'Focus Secondaire :', dnaCalibrationLabel: 'Calibrage ADN',
    focusAnalysisExplain: 'C\'est le critère auquel vous prêtez le plus d\'attention et qui détermine directement votre note finale.',
    dailyBridgeTitle: 'PONT DU JOUR', dailyBridgeDesc: 'Nouveau défi chaque jour à minuit. Reliez les deux films du jour en un minimum d\'étapes !',
    playDailyBtn: 'Jouer le Pont du Jour', dailyCompletedBadge: 'Pont du Jour Terminé', nextDailyIn: 'Prochain dans :',
    communityRecordLabel: 'Record du Parcours :', noRecordYet: 'Aucun record — Soyez le premier !',
    newRecordBanner: '🔥 NOUVEAU RECORD DE LA COMMUNAUTÉ !', recordTiedBanner: '⚡ RECORD ÉGALÉ !',
    hardModesTitle: 'Modes Difficiles',
    blitzModeTitle: '⚡ Mode Blitz (15s / Coup)', blitzModeDesc: '15 secondes par coup !',
    bannedModeTitle: '🚫 Acteur Principal Interdit', bannedModeDesc: 'La star n°1 du film de départ est interdite !',
    bannedActorBadge: '🚫 INTERDIT', blitzTimeOutTitle: 'TEMPS ÉCOULÉ !',
    blitzTimeOutDesc: 'Vous avez dépassé la limite de 15 secondes.', tryAgainBtn: 'Réessayer',
    createWinCardBtn: 'Carte Victoire Sans Spoiler (PNG)', copyChallengeBtn: 'Copier le Lien de Défi',
    challengeCopiedToast: '🔗 Lien de défi copié !',
    winCardModalTitle: 'Carte Victoire CineLink', winCardChallengeText: 'POUVEZ-VOUS FAIRE PLUS COURT ?',
    hiddenStepLabel: 'CACHÉ', recordBrokenNotif: 'a battu votre record CineLink :',
    stopwatchLabel: 'Temps', secShort: 's', yourBestLabel: 'Votre Score :', fasterRecordBanner: '⚡ NOUVEAU RECORD DE TEMPS !', popularRoutesHeading: 'Duels Populaires',
    dnaMovieMatchTitle: 'Compatible à {pct}% avec votre ADN',
    dnaMovieFocusStrong: 'Votre critère clé ({crit}) est très fort dans ce film',
    dnaMovieFocusMedium: 'Votre critère clé ({crit}) est équilibré dans ce film',
    dnaMovieFocusWeak: 'Votre critère clé ({crit}) reste faible dans ce film',
    dnaMovieBadge: 'ALGORITHME MATCH ADN 3D',
    soundOn: 'Effets Sonores Activés', soundOff: 'Effets Sonores Désactivés',
    top3Desc: '',
    favDirectorTitle: 'Réalisateur le Plus Vu', favDirectorPublicTitle: 'Réalisateur le Plus Vu',
    favDirectorFilmsRated: 'Films Vus', favDirectorAvgGiven: 'Note Moy. Donnée',
    openCareerCardBtn: 'Voir Tous les Films',
    criteriaFocusMainTitle: 'Les Critères Qui Comptent le Plus Pour Vous',
    criteriaFocusPublicTitle: 'Les Critères Qui Comptent le Plus Pour Lui/Elle',
    criteriaFocusMainDesc: 'Selon vos notes, voici les critères auxquels vous accordez le plus d\'importance lors d\'un film.',
    bubbleSelectivityTitle: '🎯 Qu\'est-ce que la Sélectivité ?',
    bubbleSelectivityDesc: 'C\'est ici que vous distinguez le plus nettement les chefs-d\'œuvre des mauvais films.',
    bubbleStrictnessTitle: '⚖️ Qu\'est-ce que la Rigueur ?',
    bubbleStrictnessDesc: 'Même si le reste du film est bon, vous ne pardonnez aucune faiblesse sur ce critère.',
    bubbleImpactTitle: '⚡ Qu\'est-ce que l\'Impact ?',
    bubbleImpactDesc: 'Votre note sur ce critère détermine directement votre note globale du film.',
    primaryFocusBadge: '#1 PRIORITÉ N°1',
    uploadFromDevice: 'Importer (Max 2Mo)',
    fileSizeLimitError: 'Fichier trop volumineux ! Maximum 2 Mo.',
    imageUploadSuccess: 'Image importée avec succès !',
    horrorProfile: 'PROFIL HORREUR',
    scaryLabel: 'Effrayant', scaryDesc: 'Tension psychologique et atmosphère.',
    jumpscareLabel: 'Jumpscare', jumpscareDesc: 'Combien de sursauts bon marché ?',
    goreLabel: 'Gore et Sang', goreDesc: 'Niveau de violence visuelle et de sang.',
    horrorEmpty: 'Aucun film d\'horreur n\'a encore été évalué.'
  }
};

const AURA_COLORS = ["#39ff14", "#0ea5e9", "#f43f5e", "#eab308", "#a855f7", "#ec4899", "#14b8a6", "#f97316"];

// YENİ: KORKU RENK GEÇİŞ FONKSİYONLARI (Optimize Edilmiş Gelişmiş Matematik)
const getScaryColor = (v) => {
  let c = Math.max(15, 255 - (v * 32)); // 7 civarı beyazlık yok olur (kapkara)
  return `rgb(${c},${c},${c})`;
};
const getJumpscareColor = (v) => {
  if (v <= 5) return 'rgb(220, 38, 38)'; // 5'e kadar saf kan kırmızı
  const ratio = (v - 5) / 5; // 5 sonrası hızla mora çalar
  const r = Math.round(220 - (73 * ratio));  
  const g = Math.round(38 + (13 * ratio));   
  const b = Math.round(38 + (196 * ratio));  
  return `rgb(${r},${g},${b})`;
};
const getGoreColor = (v) => {
  let r = 255, g = 255, b = 255;
  if (v <= 7) {
    const ratio = v / 7;
    g = Math.round(255 - (235 * ratio)); // 7'de beyazlık sıfıra yaklaşır
    b = Math.round(255 - (235 * ratio));
  } else {
    const ratio = (v - 7) / 3;
    r = Math.round(255 - (155 * ratio)); // 10'da kopkoyu kan pıhtısı rengi
    g = 20 - Math.round(20 * ratio);
    b = 20 - Math.round(20 * ratio);
  }
  return `rgb(${r},${g},${b})`; 
};

// KASMA (LAG) SORUNUNU KÖKTEN ÇÖZEN AKICI (SMOOTH) VE YÜKSEK İSABETLİ (HITBOX) SLIDER BİLEŞENLERİ
const SmoothStandardSlider = ({ c, value, onChange }) => {
  const [localVal, setLocalVal] = useState(value || 5);
  useEffect(() => { setLocalVal(value || 5); }, [value]);
  
  const sliderColor = getScoreColorHex(localVal);
  const commitChange = () => onChange(localVal);
  
  return (
    <div className="relative">
      <div className="flex justify-between items-end mb-3">
        <div className="flex items-center gap-2 relative group">
          <span className="font-black text-white text-sm sm:text-lg drop-shadow-[1px_1px_0px_rgba(0,0,0,1)]">{c.name}</span>
          <HelpCircle size={16} className="text-slate-500 cursor-help hover:text-theme transition-colors" />
          <div className="absolute bottom-full left-0 mb-2 w-64 bg-[#03050A] text-slate-200 text-[10px] sm:text-xs p-3 rounded-sm shadow-[4px_4px_0px_rgba(0,0,0,1)] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 font-bold border-2 border-slate-700">
            {c.desc}<div className="absolute top-full left-5 w-3 h-3 bg-[#03050A] rotate-45 -mt-1.5 border-r-2 border-b-2 border-slate-700"></div>
          </div>
        </div>
        <div className="text-3xl sm:text-4xl font-black w-20 text-right drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-colors duration-75" style={{color: sliderColor}}>
          {localVal.toFixed(1)}
        </div>
      </div>
      <div className="relative h-8 sm:h-10 flex items-center rounded-sm bg-[#03050A] border-2 border-slate-800 shadow-[inset_4px_4px_0px_rgba(0,0,0,0.8)] group/slider cursor-pointer">
        <div className="absolute h-full pointer-events-none rounded-l-sm transition-colors duration-75" style={{width: `${localVal * 10}%`, backgroundColor: sliderColor}}></div>
        
        {/* slider-hitbox SINIFI EKLENDİ - ALTTAN VE ÜSTTEN TIKLAMAYA KESİN TEPKİ VERİR */}
        <input type="range" min="0" max="10" step="0.1" value={localVal} 
          onChange={(e) => setLocalVal(parseFloat(e.target.value))} 
          onMouseUp={commitChange} onTouchEnd={commitChange} onKeyUp={commitChange}
          className="slider-hitbox"
        />
        
        <div className="absolute h-12 w-6 sm:h-14 sm:w-8 bg-white border-2 border-black rounded-sm shadow-[3px_3px_0px_rgba(0,0,0,1)] pointer-events-none z-10 flex items-center justify-center group-active/slider:scale-110 transition-transform" style={{left: `calc(${localVal * 10}% - 12px)`}}>
          <div className="w-1.5 h-4 sm:h-5 rounded-sm transition-colors duration-75" style={{backgroundColor: sliderColor}}></div>
        </div>
      </div>
    </div>
  );
};

const SmoothHorrorSlider = ({ type, label, desc, value, onChange }) => {
  const [localVal, setLocalVal] = useState(value || 0);
  useEffect(() => { setLocalVal(value || 0); }, [value]);
  const commitChange = () => onChange(localVal);
  
  let trackColor, textColor, thumbBorderColor, trackClasses = '', thumbClasses = '', icon = '';
  let containerClasses = 'relative h-8 sm:h-10 flex items-center rounded-sm bg-[#03050A] border-2 shadow-[inset_4px_4px_0px_rgba(0,0,0,0.8)] group/slider cursor-pointer overflow-visible transition-all duration-200';
  let trackStyles = {};
  let hasVeins = false;
  let isGlitching = false;
  
  if (type === 'scary') {
    trackColor = getScaryColor(localVal);
    textColor = localVal >= 6 ? '#ffffff' : trackColor; 
    thumbBorderColor = localVal >= 7 ? '#64748b' : trackColor; 
    
    if (localVal >= 8) { 
       thumbClasses = 'scary-shake-hard'; 
       containerClasses += ' border-slate-500 shadow-[0_0_15px_rgba(255,255,255,0.2)]'; 
       trackStyles = { backgroundColor: trackColor, borderRight: '2px solid #ffffff' };
    }
    else if (localVal >= 6) { 
       thumbClasses = 'scary-shake-mild'; 
       containerClasses += ' border-slate-600';
       trackStyles = { backgroundColor: trackColor, borderRight: '2px solid #94a3b8' };
    } else {
       containerClasses += ' border-slate-800';
       trackStyles = { backgroundColor: trackColor, borderRight: '2px solid #000' };
    }
    icon = '💀';
  } else if (type === 'jumpscare') {
    trackColor = getJumpscareColor(localVal);
    textColor = trackColor;
    thumbBorderColor = trackColor;
    trackStyles = { backgroundColor: trackColor, borderRight: '2px solid #000' };
    containerClasses += ' border-slate-800';
    if (localVal >= 6) { 
      isGlitching = true; // Sadece barın içini glitch yapacağız
    }
    icon = '👻';
  } else if (type === 'gore') {
    trackColor = getGoreColor(localVal);
    textColor = trackColor;
    thumbBorderColor = trackColor;
    trackStyles = { backgroundColor: trackColor, borderRight: '2px solid #000' };
    containerClasses += ' border-slate-800';
    if (localVal >= 4) {
      trackClasses = 'gore-base';
      hasVeins = true; 
    }
    icon = '🩸';
  }

  return (
    <div className="relative mb-8">
      <div className="flex justify-between items-end mb-3">
        <div className="flex items-center gap-2 relative group">
          <span className="font-black text-sm sm:text-lg drop-shadow-[1px_1px_0px_rgba(0,0,0,1)] uppercase tracking-wider transition-colors duration-200" style={{color: textColor}}>{label}</span>
          <HelpCircle size={16} className="opacity-60 cursor-help hover:opacity-100 transition-opacity" style={{color: textColor}} />
          <div className="absolute bottom-full left-0 mb-2 w-64 bg-[#03050A] text-slate-200 text-[10px] sm:text-xs p-3 rounded-sm shadow-[4px_4px_0px_rgba(0,0,0,1)] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 font-bold border-2" style={{borderColor: textColor}}>
            {desc}
            <div className="absolute top-full left-5 w-3 h-3 bg-[#03050A] rotate-45 -mt-1.5 border-r-2 border-b-2" style={{borderColor: textColor}}></div>
          </div>
        </div>
        <div className={`text-3xl sm:text-4xl font-black w-20 text-right drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-colors duration-200 ${thumbClasses}`} style={{color: textColor}}>
          {localVal.toFixed(1)}
        </div>
      </div>
      
      <div className={containerClasses}>
        
        {/* Renkli dolgu barı (Gore, Veins ve Glitch burada uygulanır) */}
        <div className={`absolute h-full pointer-events-none rounded-l-sm transition-colors duration-200 ${trackClasses}`} style={{width: `${localVal * 10}%`, ...trackStyles}}>
           {hasVeins && <div className="gore-veins" style={{ opacity: localVal / 10 }}></div>}
           {isGlitching && (
             <>
               <div className="glitch-layer glitch-layer-1" style={{ backgroundColor: trackColor }}></div>
               <div className="glitch-layer glitch-layer-2" style={{ backgroundColor: trackColor }}></div>
             </>
           )}
        </div>
        
        {/* SENİN ÇALIŞAN HITBOX'IN (HİÇ DOKUNULMADI) */}
        <input type="range" min="0" max="10" step="0.1" value={localVal} 
          onChange={(e) => setLocalVal(parseFloat(e.target.value))} 
          onMouseUp={commitChange} onTouchEnd={commitChange} onKeyUp={commitChange}
          className="slider-hitbox"
        />
        
        <div className={`absolute h-12 w-8 sm:h-14 sm:w-10 bg-[#03050A] border-2 rounded-sm shadow-[3px_3px_0px_rgba(0,0,0,1)] pointer-events-none z-10 flex items-center justify-center transition-all duration-200 group-active/slider:scale-110 ${thumbClasses}`} style={{left: `calc(${localVal * 10}% - 16px)`, borderColor: thumbBorderColor}}>
          <span className="text-lg sm:text-2xl drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">{icon}</span>
        </div>
      </div>
    </div>
  );
};

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

    /* YENİ: AURA TEMA MOTORU & OLED SİYAH ZEMİN */
    body { background-color: #03050A !important; }
    .text-theme { color: var(--theme-color); }
    .bg-theme { background-color: var(--theme-color); color: #03050A !important; }
    .border-theme { border-color: var(--theme-color); }
    .shadow-theme { box-shadow: 4px 4px 0px var(--theme-color-50) !important; }
    .hover\\:bg-theme:hover { background-color: var(--theme-color) !important; color: #03050A !important; }
    .hover\\:text-theme:hover { color: var(--theme-color) !important; }
    .hover\\:border-theme:hover { border-color: var(--theme-color) !important; }
    .group:hover .group-hover\\:text-theme { color: var(--theme-color) !important; }
    .group:hover .group-hover\\:border-theme { border-color: var(--theme-color) !important; }

    /* YENİ: NEO-BRUTALISM & FROSTED GLASS (Buzlu Cam) TEMEL SINIFLARI */
    .cine-glass {
      background: rgba(255, 255, 255, 0.03);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: 6px 6px 0px rgba(0,0,0,1);
      border-radius: 8px; /* Çok hafif yuvarlak, keskin hatlı */
      transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }
    .cine-glass:hover {
      border-color: rgba(255, 255, 255, 0.2);
      box-shadow: 6px 6px 0px rgba(0,0,0,1), inset 0 0 15px rgba(255, 255, 255, 0.02);
      transform: translate(-2px, -2px);
    }
    .cine-glass-active {
      border-color: var(--theme-color);
      box-shadow: 6px 6px 0px var(--theme-color-50), inset 0 0 20px var(--theme-color-20);
    }
    
    /* Eski Tasarımdaki Çok Yuvarlak ve Yumuşak Kutuları Keskin Buzlu Cama Zorlama */
    .bg-slate-900\\/80, .bg-slate-900\\/90, .bg-slate-900\\/85 {
      background: rgba(255, 255, 255, 0.03) !important;
      backdrop-filter: blur(24px) !important;
      border: 1px solid rgba(255, 255, 255, 0.08) !important;
      box-shadow: 6px 6px 0px rgba(0,0,0,1) !important;
      border-radius: 8px !important;
    }
    .rounded-\\[2\\.5rem\\], .rounded-[2rem], .rounded-3xl {
      border-radius: 8px !important;
    }

    .magnetic-btn { transition: transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.2s ease; border-radius: 4px !important; }
    .magnetic-btn:hover { transform: translate(-2px, -2px); box-shadow: 4px 4px 0px var(--theme-color-50) !important; border-color: var(--theme-color); }
    .magnetic-btn:active { transform: translate(0, 0); box-shadow: 0px 0px 0px transparent !important; }

    /* Animasyonlar (Eskiler korundu) */
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
    .logo-morph-bg svg { color: #03050A; }

    /* UI/UX Efektleri (Bulanık Ortam Işığı Güncellendi) */
    .ambient-glow { filter: blur(60px); opacity: 0.25; transform: scale(1.1) translateZ(0); z-index: -1; pointer-events: none; mix-blend-mode: screen; will-change: filter, transform; }
    
    .holo-badge { position: relative; overflow: hidden; transition: transform 0.3s ease, box-shadow 0.3s ease; }
    .holo-badge::before { 
       content: ''; position: absolute; top: 0; left: -100%; width: 50%; height: 100%; 
       background: linear-gradient(to right, transparent, rgba(255,255,255,0.4), transparent); 
       transform: skewX(-20deg); transition: left 0.6s ease; z-index: 10;
    }
    .group:hover .holo-badge::before { left: 150%; }

    .tilt-card { transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.4s ease; transform-style: preserve-3d; border-radius: 8px !important; }
    .tilt-card:hover { transform: perspective(1000px) rotateX(4deg) rotateY(-4deg) translate(-4px, -4px); box-shadow: 12px 12px 0px rgba(0,0,0,1); }
    .tilt-card:active { transform: perspective(1000px) rotateX(1deg) rotateY(-1deg) translate(0px, 0px); box-shadow: 2px 2px 0px rgba(0,0,0,1); }

    @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
    .skeleton-shimmer {
      background: linear-gradient(90deg, rgba(255,255,255,0.02) 25%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.02) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.6s infinite linear;
      border-radius: 8px !important;
    }

    .fixed.inset-0.z-0.pointer-events-none { transform: translateZ(0); backface-visibility: hidden; contain: strict; }
    .backdrop-blur-xl, .backdrop-blur-2xl, .backdrop-blur-md { transform: translateZ(0); backface-visibility: hidden; }

    /* YENİ: İnce Çizgili Koyu Cyber Zemin (Çok Zayıf Opaklıkta) */
    .cyber-grid-bg {
      background-image: 
        linear-gradient(to right, rgba(255,255,255,0.015) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255,255,255,0.015) 1px, transparent 1px);
      background-size: 32px 32px;
    }

    /* 35MM ESKİ FİLM MAKARASI VE PROJEKSİYON PERDESİ EFEKTLERİ */
    .film-sprockets { background-image: repeating-linear-gradient(to right, transparent 0px, transparent 10px, #03050B 10px, #03050B 24px); }
    @keyframes projectorFlicker { 0%, 100% { opacity: 0.35; } 50% { opacity: 0.65; } }
    .projector-beam-active { animation: projectorFlicker 2s infinite ease-in-out; }

    /* CANLI KART PARILTISI VE ÖNE ÇIKAN FRAGMAN BUTONU (Neo-Brutalist yapıldı) */
    @keyframes trailerPulse {
      0%, 100% { box-shadow: 4px 4px 0px rgba(225, 29, 72, 1); }
      50% { box-shadow: 6px 6px 0px rgba(225, 29, 72, 0.8); transform: translate(-2px, -2px); }
    }
    .trailer-hero-btn {
      background: rgba(255,255,255,0.03);
      backdrop-filter: blur(10px);
      border: 1px solid #e11d48;
      border-radius: 4px !important;
      animation: trailerPulse 2.8s infinite ease-in-out;
    }
    .trailer-hero-btn:hover {
      background: rgba(225, 29, 72, 0.1);
      transform: translateY(-2px) scale(1.02);
    }
    header { border-radius: 0 !important; border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important; }

    /* 7 SANİYELİK SİNEMA RULETİ */
    @keyframes reelSpin7s {
      0% { transform: translate3d(-56px, -50%, 0); }
      57.14% { transform: translate3d(-5720px, -50%, 0); }
      68% { transform: translate3d(-6310px, -50%, 0); }
      78% { transform: translate3d(-6640px, -50%, 0); }
      87% { transform: translate3d(-6835px, -50%, 0); }
      94% { transform: translate3d(-6932px, -50%, 0); }
      98% { transform: translate3d(-6962px, -50%, 0); }
      100% { transform: translate3d(-6968px, -50%, 0); }
    }
    .run-reel-7s { animation: reelSpin7s 7s linear forwards; will-change: transform; backface-visibility: hidden; }
    @keyframes spoolSpin7s {
      0% { transform: rotate(0deg); }
      57.14% { transform: rotate(3240deg); }
      72% { transform: rotate(3720deg); }
      85% { transform: rotate(3960deg); }
      94% { transform: rotate(4070deg); }
      100% { transform: rotate(4100deg); }
    }
    .run-spool-7s { animation: spoolSpin7s 7s linear forwards; }
    @keyframes badgeFloat { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-4px); } }
    .badge-emblem-float { animation: badgeFloat 3.2s ease-in-out infinite; }

    /* KUTSAL ÜÇLÜ - CAM VE ALTIN VARAK ANİMASYONLARI (Neo-Brutalist Güncellemesi) */
    main[data-active-tab="profile_general"] > :not(.cinescore-modern-view),
    main[data-active-tab="community"] > :not(.cinescore-modern-view) { display: none !important; }
    
    @keyframes royalCenterFloat {
      0%, 100% { transform: perspective(1200px) rotateY(0deg) rotateX(0deg) translate(0px, 0px) scale(1.08); box-shadow: 10px 10px 0px rgba(0,0,0,1); }
      50% { transform: perspective(1200px) rotateY(0deg) rotateX(0deg) translate(-4px, -4px) scale(1.08); box-shadow: 14px 14px 0px rgba(245,158,11,0.5); }
    }
    @keyframes royalLeftFloat {
      0%, 100% { transform: perspective(1200px) rotateY(18deg) rotateX(4deg) rotateZ(-2deg) translate(0px, 0px) scale(0.95); box-shadow: -8px 8px 0px rgba(0,0,0,1); }
      50% { transform: perspective(1200px) rotateY(14deg) rotateX(2deg) rotateZ(-1deg) translate(4px, -4px) scale(0.95); box-shadow: -12px 12px 0px rgba(245,158,11,0.3); }
    }
    @keyframes royalRightFloat {
      0%, 100% { transform: perspective(1200px) rotateY(-18deg) rotateX(4deg) rotateZ(2deg) translate(0px, 0px) scale(0.95); box-shadow: 8px 8px 0px rgba(0,0,0,1); }
      50% { transform: perspective(1200px) rotateY(-14deg) rotateX(2deg) rotateZ(1deg) translate(-4px, -4px) scale(0.95); box-shadow: 12px 12px 0px rgba(245,158,11,0.3); }
    }

    .royal-poster-center { animation: royalCenterFloat 6s ease-in-out infinite; will-change: transform, box-shadow; transform-style: preserve-3d; }
    .royal-poster-left { animation: royalLeftFloat 6.5s ease-in-out infinite -2.5s; will-change: transform, box-shadow; transform-style: preserve-3d; }
    .royal-poster-right { animation: royalRightFloat 6.5s ease-in-out infinite -5s; will-change: transform, box-shadow; transform-style: preserve-3d; }
    
    .royal-poster-center:hover, .royal-poster-left:hover, .royal-poster-right:hover {
      animation-play-state: paused;
      transform: perspective(1200px) rotateY(0deg) rotateX(0deg) rotateZ(0deg) translate(-6px, -6px) scale(1.15) !important;
      z-index: 40 !important;
      box-shadow: 15px 15px 0px rgba(245,158,11,0.8) !important;
      border-radius: 4px !important;
    }

    .gold-foil-sheen::after {
      content: ''; position: absolute; inset: -20%; width: 140%; height: 140%;
      background: linear-gradient(135deg, transparent 0%, rgba(255, 255, 255, 0.1) 40%, rgba(253, 224, 71, 0.3) 50%, rgba(255, 255, 255, 0.05) 60%, transparent 100%);
      animation: goldFoilSweep 6s ease-in-out infinite; pointer-events: none; z-index: 20; mix-blend-mode: overlay;
    }
    @keyframes goldFoilSweep { 0% { transform: translateX(-150%) skewX(-30deg); opacity: 0; } 20% { opacity: 1; } 80% { transform: translateX(250%) skewX(-30deg); opacity: 0; } 100% { transform: translateX(250%) skewX(-30deg); opacity: 0; } }
    
    @keyframes royalCrownHover {
      0%, 100% { transform: translate(-50%, 0px) rotate(-2deg) scale(1); filter: drop-shadow(4px 4px 0px rgba(0,0,0,1)); }
      50% { transform: translate(-50%, -4px) rotate(2deg) scale(1.1); filter: drop-shadow(6px 6px 0px rgba(251,191,36,0.6)); }
    }
    .royal-crown-anim { animation: royalCrownHover 4s ease-in-out infinite; }
    
    .royal-gold-text {
      background: linear-gradient(180deg, #FFFFFF 0%, #FDE047 30%, #D97706 75%, #78350F 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    }
    .royal-gold-border {
      border-color: #F59E0B !important;
      border-radius: 4px !important;
    }
    
    /* İNCE CAM KAİDE (KUTSAL ÜÇLÜ İÇİN YENİ) */
    .royal-pedestal {
      position: absolute; bottom: -10%; left: 5%; right: 5%; height: 40px;
      background: rgba(255, 255, 255, 0.02);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-top: 1px solid rgba(253, 224, 71, 0.4);
      transform: perspective(600px) rotateX(70deg);
      box-shadow: 0 -30px 60px rgba(245, 158, 11, 0.15), 0 20px 30px rgba(0,0,0,0.9);
      pointer-events: none; z-index: 0;
    }

    /* YENİ: KESKİN HATLARA SAHİP PUAN SLIDERLARI */
    input[type="range"] { transition: accent-color 0.12s linear, filter 0.2s ease; height: 6px; border-radius: 0; background: rgba(255,255,255,0.05); outline: 1px solid rgba(255,255,255,0.1); }
    #rating-slider-box input[type="range"]::-webkit-slider-runnable-track {
      background: linear-gradient(90deg, #6b21a8 0%, #9333ea 28%, #db2777 37%, #ef2d2d 45%, #f96416 52%, #facc15 63%, #84cc16 72%, #22c55e 85%, #39ff14 100%);
      height: 6px; border-radius: 0px;
    }
    #rating-slider-box input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none; appearance: none;
      width: 16px; height: 24px; border-radius: 2px;
      background: #fff; border: 2px solid #000;
      box-shadow: 2px 2px 0px rgba(0,0,0,1);
      cursor: pointer; margin-top: -9px;
      transition: transform 0.15s ease, box-shadow 0.15s linear;
    }
    #rating-slider-box input[type="range"]:active::-webkit-slider-thumb {
      transform: scale(1.1) translate(-1px, -1px); box-shadow: 4px 4px 0px rgba(0,0,0,1);
    }

    .lg\\:col-span-8:has(#rating-slider-box) { gap: 0.85rem !important; justify-content: flex-start !important; }
    .lg\\:col-span-8:has(#rating-slider-box) > div:first-child { padding-top: 1rem !important; padding-bottom: 1rem !important; flex: 0 0 auto !important; }
    #rating-slider-box { scroll-margin-top: 210px; padding-top: 1.25rem !important; padding-bottom: 1.25rem !important; flex: 0 0 auto !important; height: auto !important; justify-content: flex-start !important; }
    #rating-slider-box > * { flex: 0 0 auto !important; }
    #rating-slider-box > button, #rating-slider-box > div:last-child { margin-top: 1.55rem !important; padding-top: 0 !important; }

    html, body { max-width: 100vw; overflow-x: hidden; }
    @media (max-width: 767px) { header nav { display: none !important; } }
    @media (max-width: 640px) {
      header > div { padding-left: 0.5rem !important; padding-right: 0.5rem !important; gap: 0.35rem !important; }
      header .overflow-x-auto, .mobile-nav-tabs { display: flex !important; flex-wrap: nowrap !important; overflow-x: auto !important; -webkit-overflow-scrolling: touch; scrollbar-width: none; gap: 0.25rem !important; max-width: 100vw !important; }
      header button, nav button { font-size: clamp(10px, 2.65vw, 12px) !important; padding-left: clamp(6px, 2vw, 11px) !important; padding-right: clamp(6px, 2vw, 11px) !important; white-space: nowrap !important; flex-shrink: 0 !important; }
    }

    /* --- %100 KUSURSUZ İSABETLİ HITBOX ÇÖZÜMÜ --- */
    .slider-hitbox {
      -webkit-appearance: none !important;
      appearance: none !important;
      background: transparent !important;
      width: 100% !important;
      height: 100% !important;
      position: absolute !important;
      inset: 0 !important;
      margin: 0 !important;
      padding: 0 !important;
      outline: none !important;
      z-index: 50 !important;
      opacity: 0 !important;
      cursor: pointer !important;
    }
    .slider-hitbox::-webkit-slider-runnable-track {
      width: 100% !important;
      height: 100% !important; /* İŞTE BU KOD SAYESİNDE BARIN EN ALTINDAN BİLE TIKLANIR */
      background: transparent !important;
      border: none !important;
      margin: 0 !important;
    }
    .slider-hitbox::-webkit-slider-thumb {
      -webkit-appearance: none !important;
      appearance: none !important;
      width: 40px !important;
      height: 100% !important; /* YÜKSEKLİĞİ BAR İLE BİREBİR AYNI YAPTIK */
      background: transparent !important;
      border: none !important;
    }
    .slider-hitbox::-moz-range-track {
      width: 100% !important;
      height: 100% !important;
      background: transparent !important;
      border: none !important;
    }
    .slider-hitbox::-moz-range-thumb {
      width: 40px !important;
      height: 100% !important;
      background: transparent !important;
      border: none !important;
    }

    /* --- YENİ KORKU EFEKTLERİ --- */
    @keyframes scaryShake {
      0%, 100% { transform: translate(0, 0); }
      20% { transform: translate(-2px, 1px) rotate(-1deg); }
      40% { transform: translate(2px, -1px) rotate(1deg); }
      60% { transform: translate(-1px, 2px) rotate(0deg); }
      80% { transform: translate(1px, -2px) rotate(-1deg); }
    }
    .scary-shake-mild { animation: scaryShake 0.35s infinite; }
    .scary-shake-hard { animation: scaryShake 0.15s infinite; }
    
    /* Vahşet & Kan (Gore) - Damar ve Nabız (Kalp Atışı) Efekti */
    .gore-base {
      position: relative;
      overflow: hidden;
      background: linear-gradient(90deg, #7f1d1d, #dc2626, #7f1d1d);
      background-size: 200% 100%;
      animation: bloodFlow 2.5s infinite linear;
    }
    @keyframes bloodFlow {
      0% { background-position: 100% 0; }
      100% { background-position: -100% 0; }
    }
    .gore-veins {
      position: absolute;
      inset: 0;
      background-image: 
        radial-gradient(ellipse at 50% 50%, rgba(69, 10, 10, 0.9) 10%, transparent 60%),
        repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.4) 10px, rgba(0,0,0,0.4) 14px);
      mix-blend-mode: color-burn;
      pointer-events: none;
      animation: heartbeat 1.2s infinite ease-in-out;
    }
    @keyframes heartbeat {
      0%, 100% { transform: scale(1); opacity: 0.6; }
      15% { transform: scale(1.03); opacity: 1; }
      30% { transform: scale(1); opacity: 0.6; }
      45% { transform: scale(1.03); opacity: 1; }
    }

    /* Jumpscare Glitch Efekti (Titremesiz, Salt Renk Ayrışması) */
    .glitch-layer {
      position: absolute;
      inset: 0;
      background: inherit;
      pointer-events: none;
      opacity: 0.7;
      mix-blend-mode: screen;
    }
    .glitch-layer-1 {
      animation: glitchLayer1 0.4s infinite linear alternate-reverse;
      filter: drop-shadow(-4px 0 0 rgba(168,85,247,0.9)); /* Mor Glitch */
    }
    .glitch-layer-2 {
      animation: glitchLayer2 0.3s infinite linear alternate-reverse;
      filter: drop-shadow(4px 0 0 rgba(34,197,94,0.7)); /* Yeşil Glitch */
    }
    @keyframes glitchLayer1 {
      0% { clip-path: inset(10% 0 80% 0); transform: translateX(-2px); }
      50% { clip-path: inset(50% 0 30% 0); transform: translateX(2px); }
      100% { clip-path: inset(80% 0 10% 0); transform: translateX(-1px); }
    }
    @keyframes glitchLayer2 {
      0% { clip-path: inset(20% 0 60% 0); transform: translateX(2px); }
      50% { clip-path: inset(60% 0 20% 0); transform: translateX(-2px); }
      100% { clip-path: inset(30% 0 50% 0); transform: translateX(1px); }
    }
  `}}/>
);

// YENİ: 0-10 ARASI KESİNTİSİZ (ARA TON GEÇİŞLİ) PUAN RENK MOTORU
// 0.0 - 3.0 : Mor Tonları
// 3.0 - 5.5 : Mordan Fuşya/Kızıla -> Kırmızıya -> 5.5'e yaklaşırken Turuncuya doğal geçiş
// 5.5 - 7.0 : Turuncu-Sarıdan -> Altın Sarısına -> 7.0'ye yaklaşırken Limon Sarısına geçiş
// 7.0 - 9.0 : Açık Yeşilden -> Doygun Zümrüt Yeşiline geçiş
// 9.0 - 10.0: Parlak Fosforlu / Elektrik Neon Yeşil
const getScoreColorHex = (score) => {
  const s = Math.max(0, Math.min(10, Number(score) || 0));

  const stops = [
    { pos: 0.0, r: 107, g: 33,  b: 168 }, // #6b21a8 (0.0 - Derin Mor)
    { pos: 2.0, r: 147, g: 51,  b: 234 }, // #9333ea (2.0 - Canlı Mor)
    { pos: 3.0, r: 168, g: 45,  b: 215 }, // #a82dd7 (3.0 - Mor Sınırı / Kızıl Geçiş Başlangıcı)
    { pos: 3.7, r: 219, g: 39,  b: 119 }, // #db2777 (3.7 - Mordan Kırmızıya Köprü: Fuşya/Kızıl)
    { pos: 4.5, r: 239, g: 45,  b: 45  }, // #ef2d2d (4.5 - Tam Kırmızı)
    { pos: 5.1, r: 249, g: 100, b: 22  }, // #f96416 (5.1 - Kırmızıdan Sarıya Köprü: Koyu Turuncu)
    { pos: 5.5, r: 245, g: 158, b: 11  }, // #f59e0b (5.5 - Turuncu / Sarı Geçiş Sınırı)
    { pos: 6.2, r: 250, g: 204, b: 21  }, // #facc15 (6.2 - Saf Parlak Sarı)
    { pos: 6.8, r: 210, g: 225, b: 28  }, // #d2e11c (6.8 - Sarıdan Yeşile Köprü: Limon Sarısı)
    { pos: 7.2, r: 132, g: 204, b: 22  }, // #84cc16 (7.2 - Taze Yeşil)
    { pos: 8.0, r: 34,  g: 197, b: 94  }, // #22c55e (8.0 - Tam Yeşil)
    { pos: 8.9, r: 16,  g: 210, b: 95  }, // #10d25f (8.9 - Doygun Yeşil)
    { pos: 9.0, r: 0,   g: 255, b: 102 }, // #00ff66 (9.0 - Neon Yeşil Başlangıcı)
    { pos: 10.0, r: 57, g: 255, b: 20  }  // #39ff14 (10.0 - Saf Elektrik Neon Yeşil)
  ];

  for (let i = 0; i < stops.length - 1; i++) {
    const curr = stops[i];
    const next = stops[i + 1];
    if (s >= curr.pos && s <= next.pos) {
      const range = next.pos - curr.pos;
      const ratio = range === 0 ? 0 : (s - curr.pos) / range;
      const r = Math.round(curr.r + (next.r - curr.r) * ratio);
      const g = Math.round(curr.g + (next.g - curr.g) * ratio);
      const b = Math.round(curr.b + (next.b - curr.b) * ratio);
      const toHex = (n) => n.toString(16).padStart(2, '0');
      return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }
  }
  return '#39ff14';
};

const MegaScoreVFX = ({ score }) => {
  const s = Number(score);
  if (isNaN(s)) return null;

  if (s >= 9.0) {
    const neonGreen = getScoreColorHex(s);
    return (
      <div className="absolute inset-0 pointer-events-none rounded-lg z-0 flex items-center justify-center">
         {/* Arkadan vuran güçlü statik glow */}
         <div className="absolute inset-0 blur-[20px] opacity-40 animate-pulse rounded-lg" style={{backgroundColor: neonGreen}}></div>
         {/* Dışarı doğru büyüyüp kaybolan keskin çerçeve dalgaları (Sonar / Radar Pulse - Neo Brutalist) */}
         <div className="absolute inset-[-4px] border-4 rounded-lg animate-[ping_2.5s_cubic-bezier(0,0,0.2,1)_infinite] opacity-80" style={{borderColor: neonGreen}}></div>
         <div className="absolute inset-[-4px] border-2 rounded-lg animate-[ping_2.5s_cubic-bezier(0,0,0.2,1)_infinite_1s] opacity-50" style={{borderColor: neonGreen}}></div>
         {/* İç kenarlık şık parlaması */}
         <div className="absolute inset-0 rounded-lg border-2 z-10" style={{borderColor: neonGreen, boxShadow: `inset 0 0 30px ${neonGreen}80, 0 0 20px ${neonGreen}40`}}></div>
      </div>
    );
  }
  
  if (s <= 2.5) {
    const numFlies = Math.min(5, Math.max(1, Math.floor((2.5 - s) / 0.5) + 1));
    return (
      <div className="absolute inset-0 pointer-events-none rounded-full z-20">
        <div className="absolute inset-[-15px] rounded-full bg-purple-700/25 blur-[25px] animate-[pulse_3s_infinite]"></div>
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

const MiniVFX = ({ score }) => {
  const s = Number(score);
  if (isNaN(s)) return null;
  if (s >= 9.0) {
    const neonGreen = getScoreColorHex(s);
    return (
      <div className="absolute inset-0 pointer-events-none rounded-xl overflow-hidden mix-blend-screen z-0">
         <div className="absolute inset-0 rounded-xl animate-pulse" style={{boxShadow: `inset 0 0 18px ${neonGreen}cc`}}></div>
      </div>
    );
  }
  if (s <= 2.5) return (
    <div className="absolute inset-0 pointer-events-none rounded-xl z-20 overflow-visible">
       <div className="absolute inset-0 shadow-[inset_0_0_15px_rgba(168,85,247,0.85)] rounded-xl animate-[pulse_3s_infinite] opacity-65"></div>
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
         <h3 className="text-2xl font-black text-white flex items-center gap-3 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">{icon} {title}</h3>
         <div className="hidden sm:flex items-center gap-3">
            <button onClick={() => scroll('left')} className="p-2 bg-[#03050A] border-2 border-slate-700 rounded-sm hover:border-theme transition-colors shadow-[3px_3px_0px_rgba(0,0,0,1)] magnetic-btn z-20 relative"><ChevronLeft size={20}/></button>
            <button onClick={() => scroll('right')} className="p-2 bg-[#03050A] border-2 border-slate-700 rounded-sm hover:border-theme transition-colors shadow-[3px_3px_0px_rgba(0,0,0,1)] magnetic-btn z-20 relative"><ChevronRight size={20}/></button>
         </div>
      </div>
      <div ref={rowRef} className="flex overflow-x-auto gap-4 sm:gap-6 pb-6 pt-2 hide-scrollbar smooth-scroll relative z-10 pointer-events-auto">
        {movies.map((m) => {
          const globalData = globalMoviesList?.find(g => String(g.id) === String(m.tmdbId));
          const isNeon = globalData && globalData.avgScore >= 9.0;
          const isPurpleNeon = globalData && globalData.avgScore > 0 && globalData.avgScore <= 2.5;
          const displayTitle = localizedData?.[m.tmdbId]?.title || m.title;
          
          let glowStyle = { boxShadow: '4px 4px 0px rgba(0,0,0,1)' };
          let borderClass = 'border-2 border-slate-800 group-hover:border-slate-500 opacity-90 group-hover:opacity-100';
          if (isNeon) {
             glowStyle = { borderColor: '#39ff14', boxShadow: `4px 4px 0px #39ff14` };
             borderClass = 'border-2 border-[#39ff14]';
          } else if (isPurpleNeon) {
             glowStyle = { borderColor: '#a855f7', boxShadow: `4px 4px 0px #a855f7` };
             borderClass = 'border-2 border-[#a855f7]';
          }

          return (
          <div key={m.tmdbId} className="group cursor-pointer shrink-0 w-32 sm:w-44 relative" onClick={() => selectMovieToRate(m.tmdbId, m.title)}>
            {/* Buzlu Cam / Neon Arka Işık Efekti */}
            <div className="absolute -inset-2 rounded-lg bg-gradient-to-t from-theme to-transparent opacity-0 group-hover:opacity-30 blur-[20px] transition-opacity duration-500 z-0 pointer-events-none" style={{'--tw-gradient-from': `${themeColor} 0%`, '--tw-gradient-to': 'transparent 100%'}}></div>
            
            <div className={`relative rounded-lg overflow-hidden border mb-3 aspect-[2/3] bg-[#03050A] transition-all duration-300 group-hover:-translate-y-1 group-hover:-translate-x-1 z-10 ${borderClass}`} style={glowStyle}>
              <img src={m.poster} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 saturate-110 group-hover:saturate-150" alt=""/>
              <div className="absolute inset-0 bg-[#03050A]/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                 <span className="bg-theme text-[#03050A] text-xs sm:text-sm font-black px-4 py-2 rounded-sm border-2 border-black flex items-center gap-1 shadow-[3px_3px_0px_rgba(0,0,0,1)]"><Star size={16} className="fill-current"/> {t.rateNow}</span>
              </div>
              {globalData && globalData.avgScore > 0 && (
                <div className={`absolute top-2 right-2 px-2.5 py-1 rounded-sm border-2 z-10 pointer-events-none flex flex-col items-center ${isNeon ? 'bg-[#03050A] animate-pulse shadow-[3px_3px_0px_#39ff14]' : isPurpleNeon ? 'bg-[#03050A] animate-pulse shadow-[3px_3px_0px_#a855f7]' : 'bg-[#03050A] border-slate-700 shadow-[3px_3px_0px_rgba(0,0,0,1)]'}`} style={isNeon ? {borderColor: '#39ff14'} : isPurpleNeon ? {borderColor: '#a855f7'} : {}}>
                  <span className="text-[8px] text-slate-400 font-black mb-0.5 uppercase tracking-widest leading-none">{t.globalScoreLabel}</span>
                  <span className="text-xs font-black leading-none" style={{color: isNeon ? '#39ff14' : isPurpleNeon ? '#a855f7' : getScoreColorHex(globalData.avgScore)}}>{Number(globalData.avgScore).toFixed(2)}</span>
                </div>
              )}
            </div>
            <h4 className="font-bold text-slate-300 text-xs sm:text-sm group-hover:text-theme truncate drop-shadow-[1px_1px_0px_rgba(0,0,0,1)] transition-colors">{displayTitle}</h4>
          </div>
        )})}
      </div>
    </div>
  );
};

// 1) GLOBAL FİLMLERİN ALT KRİTER ORTALAMASINI ÇIKARAN HIZLANDIRILMIŞ (O(1) CACHE) YARDIMCI
const getMovieCriterionScore = (movie, critId, userRatings = []) => {
  if (!movie) return 0;
  if (!critId || critId === 'all') return Number(movie.avgScore) || 0;

  const vCount = Math.max(1, Number(movie.voteCount) || 1);
  const cacheSignature = `${vCount}_${movie.lastUpdated || 0}`;

  // Önbellekte varsa hiç döngüye girmeden anında döndür (Sıralama kasmasını %100 bitirir)
  if (movie._critCache && movie._critCache._sig === cacheSignature && movie._critCache[critId] !== undefined) {
    return movie._critCache[critId];
  }

  let computed = null;

  // En yaygın kayıt alanı olan categoryTotals'a doğrudan O(1) erişim
  if (movie.categoryTotals && movie.categoryTotals[critId] !== undefined) {
    const raw = Number(movie.categoryTotals[critId]) || 0;
    computed = raw > 10.01 && vCount > 1 ? raw / vCount : raw;
  } else {
    const candidateKeys = ['categoryAverages', 'criteriaAverages', 'avgScores', 'scores', 'criteria', 'categoryScores', 'totalScores'];
    for (let i = 0; i < candidateKeys.length; i++) {
      const k = candidateKeys[i];
      if (movie[k] && typeof movie[k] === 'object' && movie[k][critId] !== undefined) {
        const raw = Number(movie[k][critId]) || 0;
        computed = raw > 10.01 && vCount > 1 ? raw / vCount : raw;
        break;
      }
    }
  }

  if (computed === null && movie[critId] !== undefined) {
    const raw = Number(movie[critId]) || 0;
    computed = raw > 10.01 && vCount > 1 ? raw / vCount : raw;
  }

  if (computed === null && Array.isArray(userRatings) && userRatings.length > 0) {
    const myMatch = userRatings.find(r => String(r.id) === String(movie.id));
    if (myMatch?.scores?.[critId] !== undefined) {
      computed = Number(myMatch.scores[critId]) || 0;
    }
  }

  const finalVal = computed !== null && computed > 0 ? computed : (Number(movie.avgScore) || 0);

  if (!movie._critCache || movie._critCache._sig !== cacheSignature) {
    movie._critCache = { _sig: cacheSignature };
  }
  movie._critCache[critId] = finalVal;
  return finalVal;
};

// 2) KAPSAMLI 3 BOYUTLU DNA ANALİZİ MOTORU (10 FİLM BARAJLI: SEÇİCİLİK + SERTLİK + KARAR ETKİSİ)
const analyzeComprehensiveDNA = (ratingsList, criteriaList = []) => {
  const MIN_MOVIES = 10;
  const validRatings = (Array.isArray(ratingsList) ? ratingsList : []).filter(r => r && r.scores && typeof r.scores === 'object');
  const count = validRatings.length;

  const baseCriteria = criteriaList.length > 0 ? criteriaList : [
    { id: 'c1', name: 'Senaryo' },
    { id: 'c2', name: 'Oyunculuk' },
    { id: 'c3', name: 'Sinematografi' },
    { id: 'c4', name: 'Ses & Müzik' },
    { id: 'c5', name: 'Kurgu & Tempo' }
  ];

  if (count === 0) {
    return {
      unlocked: false,
      count: 0,
      minRequired: MIN_MOVIES,
      remaining: MIN_MOVIES,
      progressPct: 0,
      topCriterion: null,
      secondCriterion: null,
      breakdown: []
    };
  }

  // Her film için kullanıcının 5 kriter ortalamasını ve final puanını hazırla
  const movieStats = validRatings.map(r => {
    const vals = baseCriteria.map(c => Number(r.scores?.[c.id] ?? 5));
    const movieMean = vals.reduce((a, b) => a + b, 0) / vals.length;
    const finalSc = Number(r.finalScore) || movieMean;
    return { scores: r.scores, movieMean, finalSc };
  });

  const overallFinalMean = movieStats.reduce((acc, m) => acc + m.finalSc, 0) / count;

  const rawMetrics = baseCriteria.map(c => {
    const cId = c.id;
    const values = movieStats.map(m => Number(m.scores?.[cId] ?? 5));
    const mean = values.reduce((a, b) => a + b, 0) / count;

    // BOYUT 1: SEÇİCİLİK / VARYANS (Standart Sapma + Makas Açıklığı)
    // Kullanıcı bu kriterde her filme aynı puanı mı veriyor, yoksa iyiyle kötüyü keskin ayırıyor mu?
    const variance = values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / count;
    const stdDev = Math.sqrt(variance);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const spread = maxVal - minVal;
    const selectivityRaw = Math.min(100, (stdDev / 2.35) * 68 + (spread / 9.0) * 32);

    // BOYUT 2: BAĞIL KRİTER SERTLİĞİ (Filmin Kendi Ortalamasına Kıyasla Puan Kırma ve Ceza Oranı)
    // Düz "10 - ortalama" yerine, o filmdeki diğer kriterlere göre ne kadar sert not kırdığını ölçer
    let negativeDiffSum = 0;
    let lowestInMovieCount = 0;
    movieStats.forEach(m => {
      const sc = Number(m.scores?.[cId] ?? 5);
      const diffFromMovieMean = m.movieMean - sc; // Pozitifse bu kriterde filmin ortalamasından daha sert davranmış
      if (diffFromMovieMean > 0) negativeDiffSum += diffFromMovieMean;
      const allSc = baseCriteria.map(bc => Number(m.scores?.[bc.id] ?? 5));
      if (sc === Math.min(...allSc) && Math.max(...allSc) !== Math.min(...allSc)) {
        lowestInMovieCount++;
      }
    });
    const avgPenalty = negativeDiffSum / count;
    const lowestRatio = lowestInMovieCount / count;
    const absoluteToughness = Math.max(0, (8.8 - mean) / 5.5);
    const strictnessRaw = Math.min(100, Math.min(1, avgPenalty / 1.1) * 45 + Math.min(1, lowestRatio / 0.45) * 30 + Math.min(1, absoluteToughness) * 25);

    // BOYUT 3: GENEL KARAR ETKİSİ (Final Puanıyla Korelasyon + Uç Tepki Etkisi)
    // Bu kriter yükselip düştüğünde kullanıcının filme verdiği nihai puan ne kadar etkileniyor?
    let cov = 0, varC = 0, varF = 0;
    let extremeDecisionCount = 0;
    movieStats.forEach(m => {
      const sc = Number(m.scores?.[cId] ?? 5);
      const dC = sc - mean;
      const dF = m.finalSc - overallFinalMean;
      cov += dC * dF;
      varC += dC * dC;
      varF += dF * dF;
      if (Math.abs(sc - m.movieMean) >= 0.85) extremeDecisionCount++;
    });
    const corr = (varC > 0 && varF > 0) ? Math.max(0, cov / Math.sqrt(varC * varF)) : 0.5;
    const extremeRatio = extremeDecisionCount / count;
    const impactRaw = Math.min(100, corr * 65 + Math.min(1, extremeRatio / 0.55) * 35);

    // 3 BOYUTUN BİRLEŞİK SKORU (%40 Seçicilik + %35 Sertlik + %25 Karar Etkisi)
    const compositeRaw = selectivityRaw * 0.40 + strictnessRaw * 0.35 + impactRaw * 0.25;

    return {
      id: cId,
      name: c.name,
      desc: c.desc || '',
      avgScore: Number(mean.toFixed(2)),
      selectivity: Math.round(Math.max(35, Math.min(99, selectivityRaw + 18))),
      strictness: Math.round(Math.max(35, Math.min(99, strictnessRaw + 20))),
      impact: Math.round(Math.max(40, Math.min(99, impactRaw + 15))),
      compositeRaw
    };
  });

  // Kriterler arası farkı netleştiren bağıl kalibrasyon (En dikkat edilen kriter 88-98 bandına oturur)
  const maxComp = Math.max(...rawMetrics.map(m => m.compositeRaw), 1);
  const minComp = Math.min(...rawMetrics.map(m => m.compositeRaw), 0);
  const compRange = Math.max(6, maxComp - minComp);

  const calibrated = rawMetrics.map(m => {
    const relativePos = (m.compositeRaw - minComp) / compRange; // 0..1
    const focusIndex = Math.round(Math.min(98, Math.max(52, 58 + relativePos * 38)));
    return { ...m, focusIndex };
  });

  const sortedByFocus = [...calibrated].sort((a, b) => b.focusIndex - a.focusIndex || b.compositeRaw - a.compositeRaw);

  return {
    unlocked: count >= MIN_MOVIES,
    count,
    minRequired: MIN_MOVIES,
    remaining: Math.max(0, MIN_MOVIES - count),
    progressPct: Math.min(100, Math.round((count / MIN_MOVIES) * 100)),
    topCriterion: sortedByFocus[0] || null,
    secondCriterion: sortedByFocus[1] || null,
    breakdown: calibrated, // Orijinal c1..c5 sırasıyla
    rankedBreakdown: sortedByFocus // En yüksek odaktan en düşüğe
  };
};

// 3) MİKRO SİNEMATİK SES SENTEZLEYİCİ (WEB AUDIO API - SIFIR MP3)
let sharedAudioCtx = null;
const getCineAudioCtx = () => {
  if (typeof window === 'undefined') return null;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;
  if (!sharedAudioCtx) sharedAudioCtx = new AudioCtx();
  if (sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume().catch(() => {});
  }
  return sharedAudioCtx;
};

const playCineSound = (type, enabled = true) => {
  if (!enabled) return;
  try {
    const ctx = getCineAudioCtx();
    if (!ctx) return;
    const now = ctx.currentTime;

    if (type === 'tick') {
      // 35mm Mekanik Film Makarası Dişli Tıkırtısı
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1150, now);
      osc.frequency.exponentialRampToValueAtTime(190, now + 0.018);
      gain.gain.setValueAtTime(0.11, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.018);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.02);
    } else if (type === 'rouletteWin') {
      // Rulet Film Seçildiğinde Sinematik Projektör Vurgusu
      const sub = ctx.createOscillator();
      const subGain = ctx.createGain();
      sub.type = 'sine';
      sub.frequency.setValueAtTime(110, now);
      sub.frequency.exponentialRampToValueAtTime(42, now + 0.55);
      subGain.gain.setValueAtTime(0.22, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      sub.connect(subGain);
      subGain.connect(ctx.destination);
      sub.start(now);
      sub.stop(now + 0.62);

      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'triangle';
        const st = now + idx * 0.055;
        o.frequency.setValueAtTime(freq, st);
        g.gain.setValueAtTime(0.09, st);
        g.gain.exponentialRampToValueAtTime(0.001, st + 0.45);
        o.connect(g);
        g.connect(ctx.destination);
        o.start(st);
        o.stop(st + 0.48);
      });
    } else if (type === 'badge') {
      // 3D Rozet Kazanım Tok Bas + Kristal Kutlama Tınısı
      const bass = ctx.createOscillator();
      const bGain = ctx.createGain();
      bass.type = 'sine';
      bass.frequency.setValueAtTime(95, now);
      bass.frequency.exponentialRampToValueAtTime(38, now + 0.65);
      bGain.gain.setValueAtTime(0.25, now);
      bGain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
      bass.connect(bGain);
      bGain.connect(ctx.destination);
      bass.start(now);
      bass.stop(now + 0.72);

      [587.33, 739.99, 880, 1174.66, 1479.98].forEach((freq, idx) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sine';
        const st = now + 0.05 + idx * 0.07;
        o.frequency.setValueAtTime(freq, st);
        g.gain.setValueAtTime(0.11, st);
        g.gain.exponentialRampToValueAtTime(0.001, st + 0.55);
        o.connect(g);
        g.connect(ctx.destination);
        o.start(st);
        o.stop(st + 0.58);
      });
    } else if (type === 'link') {
      // SineBağ Halka Seçimi Mekanik Kilit Sesi
      const o1 = ctx.createOscillator();
      const g1 = ctx.createGain();
      o1.type = 'sine';
      o1.frequency.setValueAtTime(260, now);
      o1.frequency.exponentialRampToValueAtTime(520, now + 0.065);
      g1.gain.setValueAtTime(0.12, now);
      g1.gain.exponentialRampToValueAtTime(0.001, now + 0.075);
      o1.connect(g1);
      g1.connect(ctx.destination);
      o1.start(now);
      o1.stop(now + 0.08);
    } else if (type === 'undo') {
      // SineBağ Geri Alma Sesi
      const o1 = ctx.createOscillator();
      const g1 = ctx.createGain();
      o1.type = 'sine';
      o1.frequency.setValueAtTime(420, now);
      o1.frequency.exponentialRampToValueAtTime(210, now + 0.065);
      g1.gain.setValueAtTime(0.09, now);
      g1.gain.exponentialRampToValueAtTime(0.001, now + 0.075);
      o1.connect(g1);
      g1.connect(ctx.destination);
      o1.start(now);
      o1.stop(now + 0.08);
    } else if (type === 'gameWin') {
      // SineBağ Köprü Tamamlandı Zafer Akoru
      [440, 554.37, 659.25, 880, 1108.73].forEach((freq, idx) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'triangle';
        const st = now + idx * 0.065;
        o.frequency.setValueAtTime(freq, st);
        g.gain.setValueAtTime(0.12, st);
        g.gain.exponentialRampToValueAtTime(0.001, st + 0.6);
        o.connect(g);
        g.connect(ctx.destination);
        o.start(st);
        o.stop(st + 0.62);
      });
    } else if (type === 'toggle') {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(660, now);
      o.frequency.exponentialRampToValueAtTime(880, now + 0.08);
      g.gain.setValueAtTime(0.08, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      o.connect(g);
      g.connect(ctx.destination);
      o.start(now);
      o.stop(now + 0.095);
    }
  } catch (e) {}
};

// 4) FİLM SAYFASI "SENİN DNA'NA %X UYGUN" EŞLEŞME HESAPLAYICI
const calculateMovieDNAMatch = (dnaAnalysis, dbMovie, criteriaList, userRatings = []) => {
  if (!dnaAnalysis?.unlocked || !dnaAnalysis?.topCriterion || !dbMovie || !(Number(dbMovie.voteCount) > 0)) {
    return null;
  }
  let weightedSum = 0;
  let weightTotal = 0;

  const critDetails = criteriaList.map(c => {
    const dnaItem = dnaAnalysis.breakdown.find(b => b.id === c.id) || { focusIndex: 60 };
    const movieCritScore = getMovieCriterionScore(dbMovie, c.id, userRatings);
    const weight = Math.pow((dnaItem.focusIndex || 60) / 100, 1.8);
    weightedSum += movieCritScore * weight;
    weightTotal += weight;
    return {
      id: c.id,
      name: c.name,
      focusIndex: dnaItem.focusIndex,
      movieScore: Number(movieCritScore.toFixed(1))
    };
  });

  const weightedAvg = weightTotal > 0 ? (weightedSum / weightTotal) : (Number(dbMovie.avgScore) || 0);
  const topCritId = dnaAnalysis.topCriterion.id;
  const topCritMovieScore = getMovieCriterionScore(dbMovie, topCritId, userRatings);

  const blendedScore10 = Math.max(1.5, Math.min(9.9, weightedAvg * 0.65 + topCritMovieScore * 0.35));
  const matchPct = Math.round(blendedScore10 * 10);

  return {
    matchPct,
    score10: blendedScore10,
    topCriterionName: dnaAnalysis.topCriterion.name,
    topCriterionFocus: dnaAnalysis.topCriterion.focusIndex,
    topCriterionMovieScore: Number(topCritMovieScore.toFixed(1)),
    status: topCritMovieScore >= 7.8 ? 'strong' : topCritMovieScore >= 6.2 ? 'medium' : 'weak',
    critDetails
  };
};

// 4.5) KRALİYET & ALTIN VARAKLI "KUTSAL ÜÇLÜ" VİTRİN BİLEŞENİ (AURA BAĞIMSIZ)
const RoyalTrinityShowcase = ({
  top3List = [null, null, null],
  t,
  isEditable = false,
  selectMovieToRate,
  onOpenSlotSearch,
  onSetCrown,
  localizedData
}) => {
  const slots = [0, 1, 2];

  return (
    <div
      className="cine-glass relative p-6 sm:p-12 overflow-hidden group"
      style={{
        borderColor: 'rgba(245,158,11,0.3)'
      }}
    >
      {/* Işıltılı Arka Plan Efektleri */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none mix-blend-overlay"></div>
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[40rem] h-80 rounded-full blur-[100px] pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.15) 0%, transparent 60%)', animation: 'goldAuraPulse 6s ease-in-out infinite' }}></div>
      
      {/* Altın Varak Köşe İşlemeleri - Neo Brutalist Keskin Çizgiler */}
      <div className="absolute top-4 left-4 w-12 h-12 sm:w-16 sm:h-16 border-t-[3px] border-l-[3px] border-amber-500/50 pointer-events-none shadow-[inset_2px_2px_0px_rgba(0,0,0,1)]"></div>
      <div className="absolute top-4 right-4 w-12 h-12 sm:w-16 sm:h-16 border-t-[3px] border-r-[3px] border-amber-500/50 pointer-events-none shadow-[inset_-2px_2px_0px_rgba(0,0,0,1)]"></div>
      <div className="absolute bottom-4 left-4 w-12 h-12 sm:w-16 sm:h-16 border-b-[3px] border-l-[3px] border-amber-500/50 pointer-events-none shadow-[inset_2px_-2px_0px_rgba(0,0,0,1)]"></div>
      <div className="absolute bottom-4 right-4 w-12 h-12 sm:w-16 sm:h-16 border-b-[3px] border-r-[3px] border-amber-500/50 pointer-events-none shadow-[inset_-2px_-2px_0px_rgba(0,0,0,1)]"></div>

      {/* Üst Kraliyet Başlığı */}
      <div className="relative z-10 text-center mb-12 sm:mb-16">
        <h3 className="text-3xl sm:text-5xl font-black tracking-tight flex items-center justify-center gap-3 sm:gap-5 drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">
          <Sparkles className="text-amber-500 shrink-0 opacity-70" size={28} />
          <span className="royal-gold-text uppercase tracking-widest">{t.top3Title}</span>
          <Sparkles className="text-amber-500 shrink-0 opacity-70" size={28} />
        </h3>
        {/* Altın Varak Ayırıcı Çizgi */}
        <div className="flex items-center justify-center gap-2 mt-4 opacity-80">
          <div className="w-16 sm:w-32 h-[2px] bg-amber-500"></div>
          <div className="w-3 h-3 bg-yellow-400 border border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]"></div>
          <div className="w-16 sm:w-32 h-[2px] bg-amber-500"></div>
        </div>
      </div>

      {/* 3'LÜ HAREKETLİ KRALİYET AFİŞ SAHNESİ */}
      <div className="relative z-10 flex justify-center items-center gap-2 sm:gap-6 md:gap-10 px-0 sm:px-4 pt-4 pb-8 sm:pb-12">
        
        {/* İnce Cam Gölgelik/Platform (Zemindeki Işık) */}
        <div className="royal-pedestal"></div>

        {slots.map((slot) => {
          const movie = top3List?.[slot];
          const isCenter = slot === 1;
          const rankLabel = isCenter ? 'I' : slot === 0 ? 'II' : 'III';
          const floatClass = isCenter
            ? 'royal-poster-center w-[36%] sm:w-60 z-30'
            : slot === 0
            ? 'royal-poster-left w-[30%] sm:w-48 z-10'
            : 'royal-poster-right w-[30%] sm:w-48 z-10';

          const dispTitle = movie ? (localizedData?.[movie.id]?.title || movie.title) : '';

          return (
            <div key={slot} className={`relative flex flex-col items-center shrink-0 ${floatClass}`}>
              
              {/* Merkez Afişin Üstündeki Hareketli Kraliyet Tacı */}
              {isCenter && (
                <div className="absolute -top-10 sm:-top-14 left-1/2 z-40 royal-crown-anim">
                  <div className="relative flex items-center justify-center">
                    <div className="absolute w-12 h-12 sm:w-16 sm:h-16 bg-yellow-400/30 blur-xl"></div>
                    <Crown className="w-10 h-10 sm:w-14 sm:h-14 text-yellow-200 fill-amber-500 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]" />
                  </div>
                </div>
              )}

              {/* Afiş Çerçevesi (Neo-Brutalist Keskin) */}
              <div
                className={`relative w-full aspect-[2/3] rounded-lg overflow-hidden transition-all duration-300 gold-foil-sheen ${
                  isCenter
                    ? 'border-[3px] royal-gold-border bg-[#03050A]'
                    : 'border-[2px] border-amber-600/60 bg-[#03050A] shadow-[6px_6px_0px_rgba(0,0,0,1)]'
                }`}
              >
                {movie ? (
                  <>
                    <img
                      src={movie.poster}
                      onClick={() => selectMovieToRate(movie.id, dispTitle)}
                      className="w-full h-full object-cover cursor-pointer transition-transform duration-700 hover:scale-105 saturate-[1.1] contrast-[1.05]"
                      alt={dispTitle}
                    />

                    {/* Romen Rakamı Rozeti (Sert Gölgeli Neo-Brutalist) */}
                    <div
                      className={`absolute top-2.5 left-2.5 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-sm flex items-center justify-center font-serif font-black text-[11px] sm:text-sm border-2 border-black pointer-events-none ${
                        isCenter
                          ? 'bg-amber-400 text-black shadow-[3px_3px_0px_rgba(0,0,0,1)]'
                          : 'bg-slate-800 text-amber-400 shadow-[3px_3px_0px_rgba(0,0,0,1)]'
                      }`}
                    >
                      {rankLabel}
                    </div>

                    {/* Alt Karartma ve Film Adı */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/90 to-transparent p-2.5 sm:p-4 pt-10 pointer-events-none z-20">
                      <p className="text-[10px] sm:text-sm font-black text-yellow-100 text-center truncate drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                        {dispTitle}
                      </p>
                    </div>

                    {/* Kendi Profilinde Düzenleme ve Taçlandırma Butonları (Manyetik Butonlar) */}
                    {isEditable && (
                      <div className="absolute top-2.5 right-2.5 z-30 flex flex-col gap-2 opacity-90 sm:opacity-0 hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); onOpenSlotSearch(slot); }}
                          title="Filmi Değiştir"
                          className="magnetic-btn w-8 h-8 sm:w-10 sm:h-10 rounded-sm bg-amber-400 hover:bg-amber-300 text-black border-2 border-black flex items-center justify-center shadow-[3px_3px_0px_rgba(0,0,0,1)] transition-all"
                        >
                          <Edit3 size={15} />
                        </button>
                        {!isCenter && (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onSetCrown(slot); }}
                            title="Tahta Çıkar (#1 Yap)"
                            className="magnetic-btn w-8 h-8 sm:w-10 sm:h-10 rounded-sm bg-slate-800 hover:bg-slate-700 text-amber-400 border-2 border-black flex items-center justify-center shadow-[3px_3px_0px_rgba(0,0,0,1)] transition-all"
                          >
                            <Crown size={15} />
                          </button>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  /* Boş Slot Görünümü (Keskin Hatlı) */
                  <div
                    onClick={() => isEditable && onOpenSlotSearch && onOpenSlotSearch(slot)}
                    className={`w-full h-full flex flex-col items-center justify-center p-3 text-center bg-[#03050A] ${
                      isEditable ? 'cursor-pointer hover:bg-amber-900/20 transition-colors' : ''
                    }`}
                  >
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-sm bg-amber-500/10 border-2 border-amber-500/50 flex items-center justify-center text-amber-500 mb-3 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                      {isEditable ? <Plus size={24} /> : <Film size={24} />}
                    </div>
                    <span className="text-[11px] sm:text-xs font-black text-amber-500/50 uppercase tracking-[0.2em]">
                      {rankLabel}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// 5) EN ÇOK İZLENEN YÖNETMEN KARTI BİLEŞENİ (SADE VE DOĞAL BAŞLIKLI)
const FavoriteDirectorShowcase = ({ favDirector, t, openPersonCareer, selectMovieToRate, localizedData, isPublic = false }) => {
  if (!favDirector || !favDirector.name) return null;
  const avgColor = getScoreColorHex(favDirector.avgScore);
  const isNeon = Number(favDirector.avgScore) >= 9.0;
  const headerText = isPublic
    ? (t.favDirectorPublicTitle || 'En Çok İzlediği Yönetmen')
    : (t.favDirectorTitle || 'En Çok İzlediğin Yönetmen');

  return (
    <div
      onClick={() => favDirector.id && openPersonCareer(favDirector.id, favDirector.name, 'director')}
      className="lg:col-span-2 order-first bg-slate-900/80 backdrop-blur-xl rounded-[2.5rem] p-5 sm:p-7 border border-slate-800 hover:border-theme shadow-2xl transition-all duration-300 cursor-pointer group relative overflow-hidden"
    >
      <div
        className="absolute -right-16 -top-16 w-64 h-64 rounded-full blur-[90px] opacity-20 pointer-events-none transition-opacity group-hover:opacity-35"
        style={{ backgroundColor: avgColor }}
      ></div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-5 sm:gap-6 relative z-10">
        {/* Sol: Yönetmen Fotoğrafı & İsim */}
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5 text-center sm:text-left min-w-0 w-full md:w-auto">
          <div className="relative shrink-0">
            {favDirector.photo ? (
              <img
                src={favDirector.photo}
                className="w-20 h-20 sm:w-22 sm:h-22 rounded-full object-cover border-[3px] shadow-xl group-hover:scale-105 transition-transform"
                style={{ borderColor: avgColor, boxShadow: `0 0 25px ${avgColor}40` }}
                alt={favDirector.name}
              />
            ) : (
              <div
                className="w-20 h-20 sm:w-22 sm:h-22 rounded-full bg-[#04060C] border-[3px] flex items-center justify-center text-slate-400 shrink-0"
                style={{ borderColor: avgColor }}
              >
                <Clapperboard size={32} style={{ color: avgColor }}/>
              </div>
            )}
          </div>

          <div className="min-w-0">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center justify-center sm:justify-start gap-1.5 mb-1">
              <Clapperboard size={14} className="text-theme"/> {headerText}
            </span>
            <h3 className="text-xl sm:text-3xl font-black text-white group-hover:text-theme transition-colors truncate">
              {favDirector.name}
            </h3>
            <span className="text-xs font-bold text-theme mt-1 inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              {t.openCareerCardBtn || 'Tüm Filmlerini Gör'} &rarr;
            </span>
          </div>
        </div>

        {/* Orta: İzlenen Film Sayısı & Ortalama Puan */}
        <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto justify-center">
          <div className="flex-1 sm:flex-initial bg-[#04060C] border border-slate-800 px-4 py-3 rounded-2xl text-center min-w-[110px]">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">
              {t.favDirectorFilmsRated || 'İzlenen Filmi'}
            </span>
            <span className="text-xl sm:text-2xl font-black text-white mt-0.5 block">
              {favDirector.count}
            </span>
          </div>

          <div
            className="flex-1 sm:flex-initial bg-[#04060C] border px-4 py-3 rounded-2xl text-center min-w-[120px]"
            style={{
              borderColor: `${avgColor}66`,
              boxShadow: isNeon ? `0 0 20px ${avgColor}33` : 'none'
            }}
          >
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">
              {t.favDirectorAvgGiven || 'Verdiğin Ort. Puan'}
            </span>
            <span
              className="text-xl sm:text-2xl font-black mt-0.5 block"
              style={{ color: avgColor, textShadow: isNeon ? `0 0 12px ${avgColor}` : 'none' }}
            >
              {Number(favDirector.avgScore).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Sağ: En Yüksek Puan Verilen 3 Filmi */}
        {favDirector.topMovies?.length > 0 && (
          <div className="flex items-center gap-2.5 shrink-0">
            {favDirector.topMovies.slice(0, 3).map((m) => {
              const mScoreColor = getScoreColorHex(m.score);
              const dispTitle = localizedData?.[m.id]?.title || m.title;
              return (
                <div
                  key={m.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    selectMovieToRate(m.id, dispTitle);
                  }}
                  title={dispTitle}
                  className="relative w-14 sm:w-16 aspect-[2/3] rounded-xl overflow-hidden border border-slate-700 hover:border-white transition-transform hover:-translate-y-1 shadow-lg shrink-0"
                >
                  <img src={m.poster} className="w-full h-full object-cover" alt=""/>
                  <div className="absolute bottom-1 inset-x-1 bg-[#04060C]/90 rounded-md py-0.5 text-center border border-slate-800">
                    <span className="text-[10px] font-black block leading-none" style={{ color: mScoreColor }}>
                      {Number(m.score).toFixed(1)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// 6) TEK PARÇA KRİTER ODAK GRAFİĞİ (TAM GENİŞLİK BEŞGEN RADAR + DAİRESEL HALKALAR + AÇILIR BALONCUKLAR)
const CriteriaFocusDashboard = ({ ratingsList, criteriaData, t, isPublic = false, themeColor = '#39ff14' }) => {
  const [activeBubble, setActiveBubble] = useState('selectivity'); // Tıklanan açıklama baloncuğu
  const [selectedCritId, setSelectedCritId] = useState(null);
  const dna = useMemo(() => analyzeComprehensiveDNA(ratingsList, criteriaData), [ratingsList, criteriaData]);

  const titleText = isPublic
    ? (t.criteriaFocusPublicTitle || 'Bir Filmde En Çok Önem Verdiği Kriterler')
    : (t.criteriaFocusMainTitle || 'Bir Filmde En Çok Önem Verdiğin Kriterler');

  if (!dna.unlocked) {
    if (isPublic) return null;
    const radius = 38;
    const circum = 2 * Math.PI * radius;
    const dashOffset = circum - (dna.progressPct / 100) * circum;
    return (
      <div className="w-full col-span-full bg-slate-900/85 backdrop-blur-xl rounded-[2.5rem] p-6 sm:p-8 border border-slate-800 shadow-2xl text-center">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
              <circle cx="48" cy="48" r={radius} stroke="#1e293b" strokeWidth="8" fill="none" />
              <circle
                cx="48" cy="48" r={radius}
                stroke={themeColor} strokeWidth="8" fill="none"
                strokeDasharray={circum} strokeDashoffset={dashOffset}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-sm font-black text-white">{dna.count}/{dna.minRequired}</span>
          </div>
          <div className="text-center sm:text-left max-w-md">
            <h3 className="text-lg sm:text-xl font-black text-white mb-1 flex items-center justify-center sm:justify-start gap-2">
              <Lock size={18} className="text-theme"/> {titleText}
            </h3>
            <p className="text-xs sm:text-sm font-bold text-slate-400">
              <strong className="text-white">{dna.remaining}</strong> {t.dnaLockedDesc}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const activeCrit = dna.rankedBreakdown.find(c => c.id === selectedCritId) || dna.topCriterion;
  const activeColor = getScoreColorHex((activeCrit?.focusIndex || 80) / 10);

  const bubbles = [
    {
      key: 'selectivity',
      short: t.selectivityLabel || 'Seçicilik',
      title: t.bubbleSelectivityTitle || '🎯 Seçicilik Nedir?',
      desc: t.bubbleSelectivityDesc || 'Bu kriterde her filme benzer puanlar vermiyorsun; iyi ile kötüyü en keskin şekilde ayırdığın alan.',
      val: activeCrit?.selectivity || 0,
      color: '#38bdf8'
    },
    {
      key: 'strictness',
      short: t.strictnessLabel || 'Sertlik',
      title: t.bubbleStrictnessTitle || '⚖️ Sertlik Nedir?',
      desc: t.bubbleStrictnessDesc || 'Filmin diğer yönlerini beğensen bile bu kriter zayıfsa puanını en çok kırdığın, en zor beğendiğin alan.',
      val: activeCrit?.strictness || 0,
      color: '#f43f5e'
    },
    {
      key: 'impact',
      short: t.impactLabel || 'Karar Etkisi',
      title: t.bubbleImpactTitle || '⚡ Karar Etkisi Nedir?',
      desc: t.bubbleImpactDesc || 'Bu kritere verdiğin puan, filme verdiğin genel puanı doğrudan yukarı veya aşağı çekiyor.',
      val: activeCrit?.impact || 0,
      color: '#a855f7'
    }
  ];

  const currentBubbleObj = bubbles.find(b => b.key === activeBubble);

  return (
    <div className="w-full col-span-full bg-slate-900/85 backdrop-blur-xl rounded-[2.5rem] p-5 sm:p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
      <div
        className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-[110px] opacity-20 pointer-events-none"
        style={{ backgroundColor: activeColor }}
      ></div>

      {/* ÜST BAŞLIK VE 1. ÖNCELİKLİ KRİTER ROZETİ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 mb-5 border-b border-slate-800/80 relative z-10">
        <div className="min-w-0 flex-1">
          <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
            <Sparkles className="text-theme shrink-0" size={22}/>
            <span>{titleText}</span>
          </h3>
          <p className="text-xs sm:text-sm font-medium text-slate-400 mt-1 leading-relaxed">
            {t.criteriaFocusMainDesc}
          </p>
        </div>

        {dna.topCriterion && (
          <div
            className="self-start md:self-auto px-4 py-2.5 rounded-2xl bg-[#04060C] border flex items-center gap-3 shrink-0"
            style={{ borderColor: `${getScoreColorHex(dna.topCriterion.focusIndex / 10)}66` }}
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm text-[#04060C] shrink-0"
              style={{ backgroundColor: getScoreColorHex(dna.topCriterion.focusIndex / 10) }}
            >
              %{dna.topCriterion.focusIndex}
            </div>
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">
                {t.primaryFocusBadge || '1. ÖNCELİKLİ KRİTERİN'}
              </span>
              <span className="text-sm sm:text-base font-black text-white">
                {dna.topCriterion.name}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* TIKLANABİLİR KAVRAM BALONCUKLARI (SEÇİCİLİK / SERTLİK / KARAR ETKİSİ) */}
      <div className="mb-6 relative z-10">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {bubbles.map((b) => {
            const isOpen = activeBubble === b.key;
            return (
              <button
                type="button"
                key={b.key}
                onClick={() => setActiveBubble(isOpen ? null : b.key)}
                className={`px-3.5 py-2 rounded-xl border text-xs font-black flex items-center gap-2 transition-all ${
                  isOpen ? 'bg-[#04060C] text-white shadow-lg scale-[1.02]' : 'bg-[#04060C]/60 text-slate-300 border-slate-800 hover:border-slate-600'
                }`}
                style={isOpen ? { borderColor: b.color, boxShadow: `0 0 18px ${b.color}30` } : undefined}
              >
                <span>{b.title}</span>
                <span
                  className="px-2 py-0.5 rounded-md text-[11px] font-black bg-slate-900"
                  style={{ color: b.color }}
                >
                  %{b.val}
                </span>
              </button>
            );
          })}
        </div>

        {/* Açılan Konuşma Baloncuğu Kutusu */}
        {currentBubbleObj && (
          <div
            className="mt-3 p-3.5 sm:p-4 rounded-2xl bg-[#04060C] border flex items-start gap-3 animate-in fade-in duration-200"
            style={{ borderColor: `${currentBubbleObj.color}66` }}
          >
            <Info size={18} className="shrink-0 mt-0.5" style={{ color: currentBubbleObj.color }}/>
            <div className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              <strong className="font-black mr-1.5" style={{ color: currentBubbleObj.color }}>
                {activeCrit?.name} — {currentBubbleObj.short} (%{currentBubbleObj.val}):
              </strong>
              <span>{currentBubbleObj.desc}</span>
            </div>
          </div>
        )}
      </div>

      {/* ANA GRAFİK ALANI: SOLDA 5 KÖŞELİ RADAR + SAĞDA DAİRESEL HALKA KARTLAR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
        
        {/* SOL (5 BİRİM): BEŞGEN RADAR GRAFİĞİ */}
        <div className="lg:col-span-5 bg-[#04060C]/90 border border-slate-800/90 rounded-3xl p-5 sm:p-6 flex flex-col items-center justify-center">
          <div className="w-full max-w-[300px] aspect-square relative">
            <svg viewBox="-35 -30 170 160" className="w-full h-full overflow-visible">
              {[25, 50, 75, 100].map((lvl) => (
                <polygon
                  key={lvl}
                  points={dna.breakdown.map((_, i) => {
                    const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
                    const r = (lvl / 100) * 46;
                    return `${50 + r * Math.cos(angle)},${50 + r * Math.sin(angle)}`;
                  }).join(' ')}
                  fill={lvl === 100 ? '#070b14' : 'none'}
                  stroke="#1e293b"
                  strokeWidth="0.7"
                />
              ))}

              {dna.breakdown.map((c, i) => {
                const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
                const x = 50 + 46 * Math.cos(angle);
                const y = 50 + 46 * Math.sin(angle);
                return <line key={c.id} x1="50" y1="50" x2={x} y2={y} stroke="#1e293b" strokeWidth="0.7" />;
              })}

              <polygon
                points={dna.breakdown.map((c, i) => {
                  const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
                  const r = ((c.focusIndex || 50) / 100) * 46;
                  return `${50 + r * Math.cos(angle)},${50 + r * Math.sin(angle)}`;
                }).join(' ')}
                fill={`${themeColor}28`}
                stroke={themeColor}
                strokeWidth="1.8"
                style={{ filter: `drop-shadow(0 0 10px ${themeColor}66)` }}
              />

              {dna.breakdown.map((c, i) => {
                const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
                const r = ((c.focusIndex || 50) / 100) * 46;
                const px = 50 + r * Math.cos(angle);
                const py = 50 + r * Math.sin(angle);
                const lx = 50 + 63 * Math.cos(angle);
                const ly = 50 + 61 * Math.sin(angle);
                const nodeColor = getScoreColorHex((c.focusIndex || 70) / 10);
                const isSelected = activeCrit?.id === c.id;

                return (
                  <g key={c.id} onClick={() => setSelectedCritId(c.id)} className="cursor-pointer">
                    <circle cx={px} cy={py} r={isSelected ? '3.6' : '2.6'} fill={nodeColor} stroke="#04060C" strokeWidth="1" />
                    <text x={lx} y={ly - 2.5} textAnchor="middle" dominantBaseline="middle" fill={isSelected ? '#ffffff' : '#cbd5e1'} fontSize="5" fontWeight="900">
                      {c.name.toUpperCase()}
                    </text>
                    <text x={lx} y={ly + 4.5} textAnchor="middle" dominantBaseline="middle" fill={nodeColor} fontSize="5.4" fontWeight="900">
                      %{c.focusIndex}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* SAĞ (7 BİRİM): DAİRESEL HALKA KARTLAR */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {dna.rankedBreakdown.map((item, idx) => {
            const focusHex = getScoreColorHex(item.focusIndex / 10);
            const avgHex = getScoreColorHex(item.avgScore);
            const isTop = idx === 0;
            const isSelected = activeCrit?.id === item.id;
            const r = 24;
            const cLen = 2 * Math.PI * r;
            const offset = cLen - (item.focusIndex / 100) * cLen;

            return (
              <div
                key={item.id}
                onClick={() => setSelectedCritId(item.id)}
                className={`cursor-pointer p-4 rounded-2xl bg-[#04060C] border transition-all flex items-center gap-4 ${
                  isTop ? 'sm:col-span-2' : ''
                } ${isSelected ? 'scale-[1.01]' : 'border-slate-800/90 hover:border-slate-700'}`}
                style={isSelected ? { borderColor: focusHex, boxShadow: `0 0 22px ${focusHex}25` } : undefined}
              >
                <div className="relative w-[60px] h-[60px] flex items-center justify-center shrink-0">
                  <svg className="-rotate-90" width="60" height="60" viewBox="0 0 60 60">
                    <circle cx="30" cy="30" r={r} stroke="#1e293b" strokeWidth="5.5" fill="none" />
                    <circle
                      cx="30"
                      cy="30"
                      r={r}
                      stroke={focusHex}
                      strokeWidth="5.5"
                      fill="none"
                      strokeDasharray={cLen}
                      strokeDashoffset={offset}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute text-xs font-black" style={{ color: focusHex }}>
                    %{item.focusIndex}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-slate-900 text-slate-300 border border-slate-800 shrink-0">
                        #{idx + 1}
                      </span>
                      <h4 className="text-sm sm:text-base font-black text-white truncate">{item.name}</h4>
                    </div>
                    <span
                      className="text-xs font-black px-2.5 py-0.5 rounded-lg bg-slate-900 border shrink-0"
                      style={{ color: avgHex, borderColor: `${avgHex}44` }}
                    >
                      {t.average}: {item.avgScore.toFixed(1)}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-300 border border-sky-500/25">
                      🎯 {t.selectivityLabel}: %{item.selectivity}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-300 border border-rose-500/25">
                      ⚖️ {t.strictnessLabel}: %{item.strictness}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/25">
                      ⚡ {t.impactLabel}: %{item.impact}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

const getAllBadges = (ratingsList, t, globalMoviesList = []) => {
  const list = Array.isArray(ratingsList) ? ratingsList : [];
  const c = list.length;

  const trashCount = list.filter(r => Number(r.finalScore) > 0 && Number(r.finalScore) < 3.0).length;
  const ruthlessCount = list.filter(r => Number(r.finalScore) > 0 && Number(r.finalScore) <= 2.0).length;
  const nightOwlCount = list.filter(r => {
    if (!r.date) return false;
    const hour = new Date(Number(r.date)).getHours();
    return hour >= 1 && hour <= 5;
  }).length;
  const decades = new Set();
  list.forEach(r => {
    const g = globalMoviesList.find(m => String(m.id) === String(r.id));
    const yStr = String(r.year || g?.year || '');
    const match = yStr.match(/\d{4}/);
    if (match) decades.add(Math.floor(Number(match[0]) / 10) * 10);
  });

  let gWins = 0, gBest = 999;
  try {
    const saved = JSON.parse(localStorage.getItem('cinescore_gamestats') || '{}');
    gWins = Number(saved.wins) || 0;
    gBest = Number(saved.bestLinks) || 999;
  } catch (e) {}

  return [
    {
      id: 'b1', name: t.b1Name, icon: <Film size={26}/>, tier: 'BAŞLANGIÇ',
      cardBg: 'from-blue-950/90 via-slate-900/95 to-cyan-950/90 border-cyan-400/60 shadow-[0_10px_30px_rgba(34,211,238,0.25)]',
      orbBg: 'from-cyan-400 to-blue-600 text-white shadow-[0_0_25px_rgba(34,211,238,0.6)]',
      badgePill: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40',
      desc: t.b1Desc, earned: c >= 1
    },
    {
      id: 'b2', name: t.b2Name, icon: <Ticket size={26}/>, tier: 'BRONZ',
      cardBg: 'from-sky-950/90 via-indigo-950/90 to-slate-900/95 border-sky-400/60 shadow-[0_10px_30px_rgba(56,189,248,0.28)]',
      orbBg: 'from-sky-400 to-indigo-600 text-white shadow-[0_0_25px_rgba(56,189,248,0.65)]',
      badgePill: 'bg-sky-500/20 text-sky-300 border-sky-400/40',
      desc: t.b2Desc, earned: c >= 10
    },
    {
      id: 'b3', name: t.b3Name, icon: <Award size={26}/>, tier: 'GÜMÜŞ',
      cardBg: 'from-fuchsia-950/90 via-purple-950/90 to-slate-900/95 border-fuchsia-400/70 shadow-[0_10px_35px_rgba(217,70,239,0.3)]',
      orbBg: 'from-fuchsia-400 to-purple-600 text-white shadow-[0_0_28px_rgba(217,70,239,0.7)]',
      badgePill: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-400/40',
      desc: t.b3Desc, earned: c >= 50
    },
    {
      id: 'b4', name: t.b4Name, icon: <Medal size={26}/>, tier: 'ALTIN',
      cardBg: 'from-amber-950/90 via-yellow-950/80 to-slate-900/95 border-amber-400/80 shadow-[0_10px_35px_rgba(251,191,36,0.35)]',
      orbBg: 'from-amber-300 via-amber-500 to-orange-600 text-slate-950 shadow-[0_0_30px_rgba(251,191,36,0.8)]',
      badgePill: 'bg-amber-500/20 text-amber-300 border-amber-400/50',
      desc: t.b4Desc, earned: c >= 100
    },
    {
      id: 'b5', name: t.b5Name, icon: <Clapperboard size={26}/>, tier: 'ELMAS',
      cardBg: 'from-rose-950/90 via-red-950/85 to-slate-900/95 border-rose-400/80 shadow-[0_10px_40px_rgba(244,63,94,0.38)]',
      orbBg: 'from-rose-400 via-red-500 to-pink-600 text-white shadow-[0_0_32px_rgba(244,63,94,0.8)]',
      badgePill: 'bg-rose-500/20 text-rose-300 border-rose-400/50',
      desc: t.b5Desc, earned: c >= 250
    },
    {
      id: 'b6', name: t.b6Name, icon: <Crown size={26}/>, tier: 'MİTİK',
      cardBg: 'from-emerald-950/95 via-teal-950/90 to-slate-900/95 border-emerald-400/90 shadow-[0_10px_45px_rgba(16,185,129,0.45)]',
      orbBg: 'from-emerald-300 via-emerald-500 to-teal-600 text-slate-950 shadow-[0_0_35px_rgba(52,211,153,0.9)]',
      badgePill: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50',
      desc: t.b6Desc, earned: c >= 500
    },
    // GİZLİ BAŞARIMLAR
    {
      id: 'b7', name: t.b7Name || 'Çöp Avcısı', icon: <Flame size={26}/>, tier: 'GİZLİ',
      cardBg: 'from-purple-950/90 via-violet-950/85 to-slate-900/95 border-purple-400/75 shadow-[0_10px_35px_rgba(168,85,247,0.35)]',
      orbBg: 'from-purple-400 via-violet-500 to-indigo-600 text-white shadow-[0_0_28px_rgba(168,85,247,0.75)]',
      badgePill: 'bg-purple-500/25 text-purple-200 border-purple-400/50',
      desc: (trashCount >= 3) ? t.b7Desc : (t.secretLockedDesc || '🔒 Gizli Başarım: Keşfederek kilidini aç!'), realDesc: t.b7Desc, earned: trashCount >= 3, secret: true
    },
    {
      id: 'b8', name: t.b8Name || 'Zaman Yolcusu', icon: <Rocket size={26}/>, tier: 'GİZLİ',
      cardBg: 'from-cyan-950/90 via-teal-950/85 to-slate-900/95 border-cyan-400/75 shadow-[0_10px_35px_rgba(6,182,212,0.35)]',
      orbBg: 'from-cyan-300 via-cyan-500 to-blue-600 text-slate-950 shadow-[0_0_28px_rgba(6,182,212,0.75)]',
      badgePill: 'bg-cyan-500/25 text-cyan-200 border-cyan-400/50',
      desc: (decades.size >= 4) ? t.b8Desc : (t.secretLockedDesc || '🔒 Gizli Başarım: Keşfederek kilidini aç!'), realDesc: t.b8Desc, earned: decades.size >= 4, secret: true
    },
    {
      id: 'b9', name: t.b9Name || 'Gece Kuşu', icon: <Sparkles size={26}/>, tier: 'GİZLİ',
      cardBg: 'from-indigo-950/90 via-blue-950/85 to-slate-900/95 border-indigo-400/75 shadow-[0_10px_35px_rgba(99,102,241,0.35)]',
      orbBg: 'from-indigo-400 via-blue-500 to-violet-600 text-white shadow-[0_0_28px_rgba(99,102,241,0.75)]',
      badgePill: 'bg-indigo-500/25 text-indigo-200 border-indigo-400/50',
      desc: (nightOwlCount >= 3) ? t.b9Desc : (t.secretLockedDesc || '🔒 Gizli Başarım: Keşfederek kilidini aç!'), realDesc: t.b9Desc, earned: nightOwlCount >= 3, secret: true
    },
    {
      id: 'b10', name: t.b10Name || 'Acımasız', icon: <Trophy size={26}/>, tier: 'GİZLİ',
      cardBg: 'from-red-950/90 via-orange-950/85 to-slate-900/95 border-red-500/75 shadow-[0_10px_35px_rgba(239,68,68,0.35)]',
      orbBg: 'from-red-400 via-red-600 to-orange-600 text-white shadow-[0_0_28px_rgba(239,68,68,0.8)]',
      badgePill: 'bg-red-500/25 text-red-200 border-red-400/50',
      desc: (ruthlessCount >= 1) ? t.b10Desc : (t.secretLockedDesc || '🔒 Gizli Başarım: Keşfederek kilidini aç!'), realDesc: t.b10Desc, earned: ruthlessCount >= 1, secret: true
    },
    // MİNİ OYUN (SİNEBAĞ) ROZETLERİ
    {
      id: 'b11', name: t.b11Name || 'Köprü Mimarı', icon: <Clapperboard size={26}/>, tier: 'SİNEBAĞ',
      cardBg: 'from-orange-950/90 via-amber-950/85 to-slate-900/95 border-orange-400/75 shadow-[0_10px_35px_rgba(249,115,22,0.32)]',
      orbBg: 'from-amber-400 via-orange-500 to-red-500 text-slate-950 shadow-[0_0_28px_rgba(249,115,22,0.75)]',
      badgePill: 'bg-orange-500/25 text-orange-200 border-orange-400/50',
      desc: t.b11Desc, realDesc: t.b11Desc, earned: gWins >= 1
    },
    {
      id: 'b12', name: t.b12Name || 'Kestirme Dehası', icon: <Sparkles size={26}/>, tier: 'GİZLİ OYUN',
      cardBg: 'from-teal-950/90 via-emerald-950/85 to-slate-900/95 border-teal-400/75 shadow-[0_10px_35px_rgba(20,184,166,0.35)]',
      orbBg: 'from-teal-300 via-emerald-500 to-cyan-600 text-slate-950 shadow-[0_0_28px_rgba(20,184,166,0.8)]',
      badgePill: 'bg-teal-500/25 text-teal-200 border-teal-400/50',
      desc: (gBest <= 2) ? t.b12Desc : (t.secretLockedDesc || '🔒 Gizli Başarım: Keşfederek kilidini aç!'), realDesc: t.b12Desc, earned: gBest <= 2, secret: true
    },
    {
      id: 'b13', name: t.b13Name || 'SineBağ Ustası', icon: <Crown size={26}/>, tier: 'EFSANEVİ',
      cardBg: 'from-pink-950/90 via-rose-950/85 to-purple-950/95 border-pink-400/80 shadow-[0_10px_40px_rgba(236,72,153,0.4)]',
      orbBg: 'from-pink-400 via-rose-500 to-purple-600 text-white shadow-[0_0_32px_rgba(236,72,153,0.85)]',
      badgePill: 'bg-pink-500/25 text-pink-200 border-pink-400/50',
      desc: t.b13Desc, realDesc: t.b13Desc, earned: gWins >= 5
    }
  ];
};

// YENİ: DİNAMİK GERİ SAYIM SAYACI
const ReleaseCountdown = ({ releaseDateStr, themeColor }) => {
  const [timeLeft, setTimeLeft] = useState({ gün: 0, saat: 0, dk: 0, sn: 0 });

  useEffect(() => {
    const targetDate = new Date(releaseDateStr).getTime() + 86400000;
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        clearInterval(interval);
        return;
      }
      setTimeLeft({
        gün: Math.floor(distance / (1000 * 60 * 60 * 24)),
        saat: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        dk: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        sn: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [releaseDateStr]);

  return (
    <div className="flex justify-center items-center gap-3 sm:gap-5 mt-6 mb-2">
      {Object.entries(timeLeft).map(([unit, value]) => (
        <div key={unit} className="flex flex-col items-center bg-slate-900/80 border border-slate-700/50 px-4 py-3 sm:px-5 sm:py-4 rounded-2xl shadow-xl backdrop-blur-md">
           <span className="text-2xl sm:text-3xl font-black transition-colors" style={{color: themeColor, textShadow: `0 0 15px ${themeColor}66`}}>
              {value.toString().padStart(2, '0')}
           </span>
           <span className="text-[9px] sm:text-[11px] text-slate-500 font-bold uppercase tracking-widest mt-1">{unit}</span>
        </div>
      ))}
    </div>
  );
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

  // YENİ: 404 Hatası verdirmeyen Hash okuyucusu
  const getInitialTab = () => {
    if (typeof window === 'undefined') return 'home';
    const hash = window.location.hash.replace('#', '');
    if (hash.startsWith('/game')) return 'game';
    if (hash.startsWith('/film/')) return 'rate';
    if (hash.startsWith('/user/')) return 'public_profile';
    if (hash === '/siralama') return 'global';
    if (hash === '/topluluk') return 'community';
    if (hash === '/profil/takipciler') return 'profile_followers';
    if (hash === '/profil/takip') return 'profile_following';
    if (hash.startsWith('/profil')) {
       const params = new URLSearchParams(hash.split('?')[1] || '');
       return params.get('sekme') || 'profile_general';
    }
    return 'home';
  };

  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  
  const [activeTab, setActiveTab] = useState(getInitialTab); 
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
  const [upcomingMovies, setUpcomingMovies] = useState([]); // YENİ: Vizyona Girecekler
  const [globalPage, setGlobalPage] = useState(1); // YENİ: Sıralama Sayfalaması
  
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
  
  // YENİ: Puan Silme Penceresi State'leri
  const [ratingToDelete, setRatingToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  // YENİ: 2. PAKET STATE'LERİ (Kariyer Karnesi, Sinema Ruleti, Story Kartı)
  const [personModal, setPersonModal] = useState({ show: false, loading: false, data: null });
  const [rouletteModal, setRouletteModal] = useState({ show: false, spinning: false, currentMovie: null, winner: null });
  const [storyModal, setStoryModal] = useState({ show: false, generating: false, imageUrl: null });

  // 1) YÖNETMEN & OYUNCU KARİYER KARNESİ FONKSİYONU
  const openPersonCareer = async (personId, fallbackName = '', roleType = 'cast') => {
    if (!personId) return;
    setPersonModal({ show: true, loading: true, data: null });
    try {
      const res = await fetch(`https://api.themoviedb.org/3/person/${personId}?api_key=${TMDB_API_KEY}&append_to_response=movie_credits&language=${tmdbLang}`);
      const d = await res.json();
      let rawMovies = [];
      if (roleType === 'director') {
        rawMovies = (d.movie_credits?.crew || []).filter(m => m.job === 'Director' && m.poster_path);
      } else {
        rawMovies = (d.movie_credits?.cast || []).filter(m => m.poster_path);
      }
      const uniqueMap = new Map();
      rawMovies.forEach(m => { if (!uniqueMap.has(m.id)) uniqueMap.set(m.id, m); });
      const allPersonMovies = Array.from(uniqueMap.values()).sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0));

      // CineScore Global & Kişisel Kariyer Ortalaması Hesaplama
      let globalSum = 0, globalCount = 0;
      let mySum = 0, myCount = 0;
      allPersonMovies.forEach(m => {
        const gMatch = globalMovies.find(gm => String(gm.id) === String(m.id) && Number(gm.voteCount) > 0);
        if (gMatch && gMatch.avgScore > 0) { globalSum += Number(gMatch.avgScore); globalCount++; }
        const myMatch = myRatings.find(mr => String(mr.id) === String(m.id));
        if (myMatch && myMatch.finalScore > 0) { mySum += Number(myMatch.finalScore); myCount++; }
      });

      setPersonModal({
        show: true,
        loading: false,
        data: {
          id: d.id,
          name: d.name || fallbackName,
          photo: d.profile_path ? `https://image.tmdb.org/t/p/w300${d.profile_path}` : null,
          role: roleType === 'director' ? t.director : t.cast,
          globalAvg: globalCount > 0 ? (globalSum / globalCount).toFixed(2) : null,
          globalRatedCount: globalCount,
          myAvg: myCount > 0 ? (mySum / myCount).toFixed(2) : null,
          myRatedCount: myCount,
          movies: allPersonMovies.slice(0, 12).map(m => ({
            id: String(m.id),
            title: m.title,
            poster: `https://image.tmdb.org/t/p/w500${m.poster_path}`,
            year: m.release_date ? m.release_date.split('-')[0] : ''
          }))
        }
      });
    } catch (e) {
      setPersonModal({ show: false, loading: false, data: null });
      showToast(t.errorOccurred);
    }
  };

  // YENİ: 3D ROZET KUTLAMA PENCERESİ STATE'İ VE KRİTER SIRALAMA FİLTRESİ
  const [unlockedBadgeModal, setUnlockedBadgeModal] = useState(null);
  const [globalCriterionFilter, setGlobalCriterionFilter] = useState('all'); // 'all' | 'c1' | 'c2' | 'c3' | 'c4' | 'c5'

  // YENİ: SES EFEKTLERİ KONTROLÜ (LOCALSTORAGE KAYITLI)
  const [soundEnabled, setSoundEnabled] = useState(() => {
    try { return localStorage.getItem('cinescore_sound') !== 'off'; } catch { return true; }
  });
  const soundEnabledRef = useRef(soundEnabled);
  useEffect(() => { soundEnabledRef.current = soundEnabled; }, [soundEnabled]);

  const toggleSoundEnabled = () => {
    setSoundEnabled(prev => {
      const next = !prev;
      try { localStorage.setItem('cinescore_sound', next ? 'on' : 'off'); } catch {}
      if (next) playCineSound('toggle', true);
      return next;
    });
  };

  // 3D Rozet Kutlama Penceresi Açıldığında Kristal/Bas Ses Efekti Çal
  useEffect(() => {
    if (unlockedBadgeModal) {
      playCineSound('badge', soundEnabledRef.current);
    }
  }, [unlockedBadgeModal]);

  // YENİ: YÖNETMEN ÖNBELLEĞİ VE FAVORİ YÖNETMEN TESPİT MOTORU
  const [movieDirectorsMap, setMovieDirectorsMap] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cinescore_dir_cache_v1') || '{}'); } catch { return {}; }
  });

  useEffect(() => {
    const allRated = [...(Array.isArray(myRatings) ? myRatings : []), ...(Array.isArray(viewingUserRatings) ? viewingUserRatings : [])];
    const missingIds = [...new Set(allRated.map(r => String(r?.id || '')).filter(id => id && !movieDirectorsMap[id]))];
    if (missingIds.length === 0) return;

    let cancelled = false;
    const fetchMissingDirectors = async () => {
      const batch = missingIds.slice(0, 15);
      const updates = {};
      await Promise.all(batch.map(async (mId) => {
        try {
          const res = await fetch(`https://api.themoviedb.org/3/movie/${mId}/credits?api_key=${TMDB_API_KEY}`);
          const d = await res.json();
          const dir = (d.crew || []).find(c => c.job === 'Director');
          if (dir && dir.name) {
            updates[mId] = {
              id: dir.id,
              name: dir.name,
              photo: dir.profile_path ? `https://image.tmdb.org/t/p/w300${dir.profile_path}` : null
            };
          } else {
            updates[mId] = { id: null, name: null, photo: null };
          }
        } catch {}
      }));
      if (!cancelled && Object.keys(updates).length > 0) {
        setMovieDirectorsMap(prev => {
          const merged = { ...prev, ...updates };
          try { localStorage.setItem('cinescore_dir_cache_v1', JSON.stringify(merged)); } catch {}
          return merged;
        });
      }
    };
    fetchMissingDirectors();
    return () => { cancelled = true; };
  }, [myRatings, viewingUserRatings, movieDirectorsMap]);

  const computeFavoriteDirector = (ratingsList) => {
    const valid = Array.isArray(ratingsList) ? ratingsList : [];
    if (valid.length === 0) return null;
    const byDir = {};

    valid.forEach(r => {
      const cached = movieDirectorsMap[String(r.id)];
      const dirName = cached?.name || r.director;
      const dirId = cached?.id || r.directorId || null;
      const dirPhoto = cached?.photo || null;
      if (!dirName || dirName === 'Bilinmiyor') return;

      const key = dirId ? String(dirId) : dirName;
      if (!byDir[key]) {
        byDir[key] = { id: dirId, name: dirName, photo: dirPhoto, count: 0, totalScore: 0, movies: [] };
      }
      if (!byDir[key].photo && dirPhoto) byDir[key].photo = dirPhoto;
      if (!byDir[key].id && dirId) byDir[key].id = dirId;
      const sc = Number(r.finalScore) || 0;
      byDir[key].count += 1;
      byDir[key].totalScore += sc;
      byDir[key].movies.push({ id: r.id, title: r.title, poster: r.poster, score: sc });
    });

    const candidates = Object.values(byDir).map(d => ({
      ...d,
      avgScore: d.count > 0 ? d.totalScore / d.count : 0,
      topMovies: [...d.movies].sort((a, b) => b.score - a.score)
    }));
    if (candidates.length === 0) return null;

    candidates.sort((a, b) => b.count - a.count || b.avgScore - a.avgScore);
    return candidates[0];
  };

  const myFavoriteDirector = useMemo(() => computeFavoriteDirector(myRatings), [myRatings, movieDirectorsMap]);
  const viewingFavoriteDirector = useMemo(() => computeFavoriteDirector(viewingUserRatings), [viewingUserRatings, movieDirectorsMap]);

  // 2) PROJEKSİYON CİHAZI & 7 SANİYELİK KADEMELİ YAVAŞLAYAN SİNEMA RULETİ (SES SENKRONLU)
  const rouletteTimerRef = useRef(null);
  const rouletteSoundTimersRef = useRef([]);

  const clearRouletteSoundTimers = () => {
    rouletteSoundTimersRef.current.forEach(id => clearTimeout(id));
    rouletteSoundTimersRef.current = [];
  };

  const scheduleRouletteReelTicks = () => {
    clearRouletteSoundTimers();
    if (!soundEnabledRef.current) return;
    // 0-4sn yüksek hızda makara tıkırtısı, 4-7sn arası kademeli yavaşlama
    const tickTimes = [];
    let tMs = 60;
    while (tMs < 6920) {
      tickTimes.push(tMs);
      if (tMs < 4000) tMs += 78;
      else if (tMs < 4800) tMs += 115;
      else if (tMs < 5600) tMs += 170;
      else if (tMs < 6300) tMs += 260;
      else tMs += 390;
    }
    tickTimes.forEach(delay => {
      const tid = setTimeout(() => playCineSound('tick', soundEnabledRef.current), delay);
      rouletteSoundTimersRef.current.push(tid);
    });
  };

  const closeCinemaRoulette = () => {
    if (rouletteTimerRef.current) {
      clearTimeout(rouletteTimerRef.current);
      rouletteTimerRef.current = null;
    }
    clearRouletteSoundTimers();
    setRouletteModal({ show: false, spinning: false, animate: false, strip: [], offsetPx: -56, winner: null });
  };

  // Pencereyi açar, makarayı hazır bekletir
  const startCinemaRoulette = () => {
    if (!myWatchlist || myWatchlist.length === 0) return;
    if (rouletteTimerRef.current) clearTimeout(rouletteTimerRef.current);
    clearRouletteSoundTimers();

    const totalFrames = 60;
    const reelStrip = [];
    for (let i = 0; i < totalFrames; i++) {
      const pick = myWatchlist[i % myWatchlist.length];
      const fastPoster = typeof pick.poster === 'string' ? pick.poster.replace('/w500/', '/w200/') : pick.poster;
      reelStrip.push({ ...pick, fastPoster, reelKey: `ready_${pick.id}_${i}` });
    }

    setRouletteModal({
      show: true,
      spinning: false,
      animate: false,
      strip: reelStrip,
      offsetPx: -56,
      winner: null
    });
  };

  // "Çarkı Çevir"e basıldığında 60 karelik sonsuz şeritte 0-4sn çok hızlı, 4-7sn kademeli yavaşlayarak döner
  const spinCinemaRoulette = () => {
    if (!myWatchlist || myWatchlist.length === 0 || rouletteModal.spinning) return;
    if (rouletteTimerRef.current) clearTimeout(rouletteTimerRef.current);
    clearRouletteSoundTimers();

    const totalFrames = 60;
    const winIndex = 54; // 7. saniyede merceğin tam ortasında duracak olan 55. kare
    const reelStrip = [];
    for (let i = 0; i < totalFrames; i++) {
      const pick = myWatchlist[Math.floor(Math.random() * myWatchlist.length)];
      const fastPoster = typeof pick.poster === 'string' ? pick.poster.replace('/w500/', '/w200/') : pick.poster;
      reelStrip.push({ ...pick, fastPoster, reelKey: `spin_${pick.id}_${i}_${Date.now()}` });
    }
    const chosenWinner = reelStrip[winIndex];

    // Önce makarayı başlangıç konumuna (-56px) sıfırla
    setRouletteModal({
      show: true,
      spinning: true,
      animate: false,
      strip: reelStrip,
      offsetPx: -56,
      winner: null
    });

    // 40ms sonra 7 saniyelik CSS Keyframe animasyonunu ve mekanik makara sesini tetikle
    rouletteTimerRef.current = setTimeout(() => {
      scheduleRouletteReelTicks();
      setRouletteModal(prev => {
        if (!prev.show) return prev;
        return { ...prev, animate: true, offsetPx: -6968 };
      });

      // Tam 7.0 saniye (7000ms) sonunda kazanan filmi projeksiyon perdesine yansıt ve vurgu sesini çal
      rouletteTimerRef.current = setTimeout(() => {
        clearRouletteSoundTimers();
        playCineSound('rouletteWin', soundEnabledRef.current);
        setRouletteModal(prev => {
          if (!prev.show) return prev;
          return { ...prev, spinning: false, winner: chosenWinner };
        });
      }, 7000);
    }, 40);
  };

// --- YENİ: MİNİ OYUN (SİNEBAĞ / CINELINK) STATE VE FONKSİYONLARI (KRONOMETRE, SÜRELİ REKOR & PRİZMA ARENA) ---
  const [gameStartMovie, setGameStartMovie] = useState(null);
  const [gameTargetMovie, setGameTargetMovie] = useState(null);
  const [gameStartQuery, setGameStartQuery] = useState('');
  const [gameTargetQuery, setGameTargetQuery] = useState('');
  const [gameStartResults, setGameStartResults] = useState([]);
  const [gameTargetResults, setGameTargetResults] = useState([]);
  const [gameSearchingSide, setGameSearchingSide] = useState(null);

  const [gameActive, setGameActive] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [gameLoading, setGameLoading] = useState(false);
  const [gameStepType, setGameStepType] = useState('actor');
  const [gameChain, setGameChain] = useState([]);
  const [gameOptions, setGameOptions] = useState([]);
  const [gameHistoryStack, setGameHistoryStack] = useState([]);
  const [gameFilterText, setGameFilterText] = useState('');
  const [gameTargetCast, setGameTargetCast] = useState([]);
  const [showTargetHint, setShowTargetHint] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [bridgeStatus, setBridgeStatus] = useState({ checking: false, possible: true, directMatch: false, reason: '' });

  // KRONOMETRE & GELİŞMİŞ REKOR STATE'LERİ
  const [gameElapsedDeci, setGameElapsedDeci] = useState(0); // Salise (0.1 sn) sayacı
  const [dailyBridgeData, setDailyBridgeData] = useState({
    dayNum: 1, dateKey: '', start: null, target: null,
    completedLinks: null, completedTime: null,
    bestRecord: null, // { bestLinks, bestTime }
    countdown: ''
  });
  const [isDailyModeActive, setIsDailyModeActive] = useState(false);
  const [communityRecord, setCommunityRecord] = useState(null); // { bestLinks, bestTime }
  const [recordBannerStatus, setRecordBannerStatus] = useState(null); // 'new' | 'faster' | 'tied' | null
  const [blitzMode, setBlitzMode] = useState(false);
  const [blitzTimeLeft, setBlitzTimeLeft] = useState(15);
  const [blitzFailed, setBlitzFailed] = useState(false);
  const [bannedActorMode, setBannedActorMode] = useState(false);
  const [bannedActorObj, setBannedActorObj] = useState(null);
  const [winCardModal, setWinCardModal] = useState({ show: false, generating: false, imageUrl: null });

  // Süre Formatlayıcı (Dil Uyumlu: "14.2 sn" / "14.2 s")
  const unitSec = t.secShort || (lang === 'tr' ? 'sn' : 's');
  const formatGameSeconds = (secVal) => {
    if (secVal === null || secVal === undefined || isNaN(secVal) || Number(secVal) <= 0) return null;
    return `${Number(secVal).toFixed(1)} ${unitSec}`;
  };

  const formatRecordSummary = (recObj) => {
    if (!recObj || !recObj.bestLinks) return null;
    const linksPart = `${recObj.bestLinks} ${t.linksCount}`;
    const timePart = recObj.bestTime ? ` • ${formatGameSeconds(recObj.bestTime)}` : '';
    return `${linksPart}${timePart}`;
  };

  // İki Rekoru Karşılaştırma (Önce Bağlantı Sayısı, Eşitse Süre!)
  const pickBetterRecord = (recA, recB) => {
    if (!recA?.bestLinks) return recB?.bestLinks ? recB : null;
    if (!recB?.bestLinks) return recA;
    const lA = Number(recA.bestLinks), lB = Number(recB.bestLinks);
    if (lA < lB) return recA;
    if (lB < lA) return recB;
    const tA = recA.bestTime ? Number(recA.bestTime) : 999999;
    const tB = recB.bestTime ? Number(recB.bestTime) : 999999;
    return tA <= tB ? recA : recB;
  };

  // Yerel Rekor Okuma/Yazma (Hem Köprü Sayısı Hem Süre Saklar)
  const getLocalPairRecord = (id1, id2) => {
    if (!id1 || !id2) return null;
    try {
      const all = JSON.parse(localStorage.getItem('cinescore_pair_records') || '{}');
      const raw = all[`${id1}_${id2}`];
      if (!raw) return null;
      if (typeof raw === 'number') return raw > 0 ? { bestLinks: raw, bestTime: null } : null;
      if (typeof raw === 'object' && Number(raw.bestLinks) > 0) {
        return {
          bestLinks: Number(raw.bestLinks),
          bestTime: raw.bestTime ? Number(raw.bestTime) : null
        };
      }
      return null;
    } catch { return null; }
  };

  const saveLocalPairRecord = (id1, id2, links, timeSec) => {
    if (!id1 || !id2 || !links) return null;
    const candidate = { bestLinks: Number(links), bestTime: timeSec ? Number(Number(timeSec).toFixed(1)) : null };
    try {
      const key = `${id1}_${id2}`;
      const all = JSON.parse(localStorage.getItem('cinescore_pair_records') || '{}');
      const existing = getLocalPairRecord(id1, id2);
      const winner = pickBetterRecord(candidate, existing);
      all[key] = winner;
      localStorage.setItem('cinescore_pair_records', JSON.stringify(all));
      return winner;
    } catch { return candidate; }
  };

  // 1) GÜNÜN KÖPRÜSÜ HAVUZU VE SÜRELİ REKOR SENKRONİZASYONU
  useEffect(() => {
    const DAILY_PAIRS_POOL = [
      [1124, 98],       // Prestij ➔ Gladyatör
      [27205, 1422],    // Başlangıç ➔ Köstebek
      [550, 157336],    // Dövüş Kulübü ➔ Yıldızlararası
      [11324, 22],      // Zindan Adası ➔ Karayip Korsanları
      [680, 155],       // Ucuz Roman ➔ Kara Şövalye
      [603, 278],       // Matrix ➔ Esaretin Bedeli
      [807, 872585],    // Se7en ➔ Oppenheimer
      [77, 68718],      // Akıl Defteri ➔ Zincirsiz
      [769, 106646],    // Sıkı Dostlar ➔ Para Avcısı
      [120, 671],       // Yüzüklerin Efendisi ➔ Harry Potter
      [497, 13],        // Yeşil Yol ➔ Forrest Gump
      [24, 354912],     // Kill Bill ➔ Coco
      [101, 274],       // Leon ➔ Kuzuların Sessizliği
      [475557, 299536], // Joker ➔ Avengers: Sonsuzluk Savaşı
      [194, 129],       // Amelie ➔ Ruhların Kaçışı
      [640, 598],       // Sıkıysa Yakala ➔ Tanrıkent
      [16869, 361743],  // Soysuzlar Çetesi ➔ Top Gun: Maverick
      [496243, 313369], // Parazit ➔ Aşıklar Şehri
      [244786, 557],    // Whiplash ➔ Örümcek-Adam
      [857, 1891]       // Er Ryan'ı Kurtarmak ➔ Yıldız Savaşları
    ];

    const now = new Date();
    const dateKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const epochDays = Math.floor(new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() / 86400000);
    const dayNum = (epochDays - 20300) > 0 ? (epochDays - 20300) : 1;
    const pairIds = DAILY_PAIRS_POOL[epochDays % DAILY_PAIRS_POOL.length];

    let savedLinks = null, savedTime = null;
    try {
      const localDaily = JSON.parse(localStorage.getItem('cinescore_daily_bridge') || '{}');
      const entry = localDaily[dateKey];
      if (typeof entry === 'number') {
        savedLinks = entry;
      } else if (entry && typeof entry === 'object') {
        savedLinks = Number(entry.links) || null;
        savedTime = entry.time ? Number(entry.time) : null;
      }
    } catch (e) {}

    const localPairBest = getLocalPairRecord(pairIds[0], pairIds[1]);
    const myDailyRec = savedLinks ? { bestLinks: savedLinks, bestTime: savedTime } : null;
    const initialBest = pickBetterRecord(localPairBest, myDailyRec);

    let active = true;
    Promise.all([
      fetch(`https://api.themoviedb.org/3/movie/${pairIds[0]}?api_key=${TMDB_API_KEY}&language=${tmdbLang}`).then(r => r.json()),
      fetch(`https://api.themoviedb.org/3/movie/${pairIds[1]}?api_key=${TMDB_API_KEY}&language=${tmdbLang}`).then(r => r.json())
    ]).then(([r1, r2]) => {
      if (!active || !r1?.id || !r2?.id) return;
      const sObj = { id: String(r1.id), title: r1.title, year: r1.release_date?.split('-')[0] || '', poster: `https://image.tmdb.org/t/p/w500${r1.poster_path}` };
      const tObj = { id: String(r2.id), title: r2.title, year: r2.release_date?.split('-')[0] || '', poster: `https://image.tmdb.org/t/p/w500${r2.poster_path}` };
      setDailyBridgeData(prev => ({
        ...prev,
        dayNum,
        dateKey,
        completedLinks: savedLinks,
        completedTime: savedTime,
        bestRecord: pickBetterRecord(prev.bestRecord, initialBest),
        start: sObj,
        target: tObj
      }));
    }).catch(() => {});

    const dailyDocId = `${pairIds[0]}_${pairIds[1]}`;
    const unsubDaily = onSnapshot(doc(db, 'game_records', dailyDocId), (snap) => {
      if (snap.exists() && snap.data()?.bestLinks) {
        const d = snap.data();
        const remoteRec = { bestLinks: Number(d.bestLinks), bestTime: d.bestTime ? Number(d.bestTime) : null };
        setDailyBridgeData(prev => ({
          ...prev,
          bestRecord: pickBetterRecord(prev.bestRecord, remoteRec)
        }));
      }
    }, () => {});

    const updateCountdown = () => {
      // Kullanıcı mini oyun sekmesinde değilse tüm siteyi saniyede bir yeniden render etme!
      if (!window.location.hash.startsWith('#/game')) return;
      const current = new Date();
      const midnight = new Date(current.getFullYear(), current.getMonth(), current.getDate() + 1, 0, 0, 0);
      const diff = Math.max(0, Math.floor((midnight - current) / 1000));
      const hrs = String(Math.floor(diff / 3600)).padStart(2, '0');
      const mins = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
      const secs = String(diff % 60).padStart(2, '0');
      setDailyBridgeData(prev => (prev.countdown === `${hrs}:${mins}:${secs}` ? prev : { ...prev, countdown: `${hrs}:${mins}:${secs}` }));
    };
    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => { active = false; clearInterval(timer); unsubDaily(); };
  }, [tmdbLang]);

  // 2) MEYDAN OKUMA LİNKİ İLE GELİNDİYSE OTOMATİK YÜKLEME
  useEffect(() => {
    const checkChallengeHash = async () => {
      const hash = window.location.hash || '';
      if (!hash.startsWith('#/game?')) return;
      const queryPart = hash.split('?')[1];
      if (!queryPart) return;
      const params = new URLSearchParams(queryPart);
      const sId = params.get('start');
      const tId = params.get('target');
      if (sId && tId && sId !== tId) {
        setActiveTab('game');
        setGameActive(false);
        setGameLoading(true);
        try {
          const [r1, r2] = await Promise.all([
            fetch(`https://api.themoviedb.org/3/movie/${sId}?api_key=${TMDB_API_KEY}&language=${tmdbLang}`).then(r => r.json()),
            fetch(`https://api.themoviedb.org/3/movie/${tId}?api_key=${TMDB_API_KEY}&language=${tmdbLang}`).then(r => r.json())
          ]);
          if (r1?.id && r2?.id) {
            setGameStartMovie({ id: String(r1.id), title: r1.title, year: r1.release_date?.split('-')[0] || '', poster: `https://image.tmdb.org/t/p/w500${r1.poster_path}` });
            setGameTargetMovie({ id: String(r2.id), title: r2.title, year: r2.release_date?.split('-')[0] || '', poster: `https://image.tmdb.org/t/p/w500${r2.poster_path}` });
          }
        } catch (e) {} finally {
          setGameLoading(false);
        }
      }
    };
    checkChallengeHash();
    window.addEventListener('hashchange', checkChallengeHash);
    return () => window.removeEventListener('hashchange', checkChallengeHash);
  }, [tmdbLang]);

  // 3) SEÇİLİ ETAP İÇİN KALICI REKOR DİNLEYİCİSİ (Köprü Sayısı + Süre)
  useEffect(() => {
    if (!gameStartMovie?.id || !gameTargetMovie?.id || String(gameStartMovie.id) === String(gameTargetMovie.id)) {
      setCommunityRecord(null);
      return;
    }
    const sId = String(gameStartMovie.id);
    const tId = String(gameTargetMovie.id);
    const pairDocId = `${sId}_${tId}`;

    const localBest = getLocalPairRecord(sId, tId);
    setCommunityRecord(localBest || null);

    const unsub = onSnapshot(doc(db, 'game_records', pairDocId), (snap) => {
      const currentLocal = getLocalPairRecord(sId, tId);
      if (snap.exists() && snap.data()?.bestLinks) {
        const d = snap.data();
        const remoteRec = { bestLinks: Number(d.bestLinks), bestTime: d.bestTime ? Number(d.bestTime) : null };
        const winner = pickBetterRecord(currentLocal, remoteRec);
        if (winner) saveLocalPairRecord(sId, tId, winner.bestLinks, winner.bestTime);
        setCommunityRecord(winner);
      } else {
        setCommunityRecord(currentLocal || null);
      }
    }, () => {
      setCommunityRecord(getLocalPairRecord(sId, tId) || null);
    });
    return () => unsub();
  }, [gameStartMovie?.id, gameTargetMovie?.id]);

  // 4) GENEL OYUN KRONOMETRESİ (Her oyunda 0.1sn hassasiyetle çalışır, yükleme sırasında duraklar)
  useEffect(() => {
    if (!gameActive || gameWon || blitzFailed || gameLoading) return;
    const timer = setInterval(() => {
      setGameElapsedDeci(prev => prev + 1);
    }, 100);
    return () => clearInterval(timer);
  }, [gameActive, gameWon, blitzFailed, gameLoading]);

  // 5) BLITZ MODU (15 SANİYE HAMLE SAYACI)
  useEffect(() => {
    if (!gameActive || gameWon || blitzFailed || !blitzMode || gameLoading) return;
    const interval = setInterval(() => {
      setBlitzTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setBlitzFailed(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [gameActive, gameWon, blitzFailed, blitzMode, gameLoading, gameChain.length]);

  // Oyun İçi Başlangıç Filmi Arama
  useEffect(() => {
    if (gameStartQuery.trim().length < 2) { setGameStartResults([]); return; }
    const timer = setTimeout(async () => {
      setGameSearchingSide('start');
      try {
        const res = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(gameStartQuery)}&language=${tmdbLang}`);
        const d = await res.json();
        setGameStartResults((d.results || []).filter(m => m.poster_path).slice(0, 6));
      } catch (e) {} finally { setGameSearchingSide(null); }
    }, 350);
    return () => clearTimeout(timer);
  }, [gameStartQuery, tmdbLang]);

  // Oyun İçi Hedef Film Arama
  useEffect(() => {
    if (gameTargetQuery.trim().length < 2) { setGameTargetResults([]); return; }
    const timer = setTimeout(async () => {
      setGameSearchingSide('target');
      try {
        const res = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(gameTargetQuery)}&language=${tmdbLang}`);
        const d = await res.json();
        setGameTargetResults((d.results || []).filter(m => m.poster_path).slice(0, 6));
      } catch (e) {} finally { setGameSearchingSide(null); }
    }, 350);
    return () => clearTimeout(timer);
  }, [gameTargetQuery, tmdbLang]);

  const fetchMovieCastForGame = async (movieId) => {
    const res = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${TMDB_API_KEY}&language=${tmdbLang}`);
    const d = await res.json();
    return (d.cast || []).slice(0, 60).map(c => ({
      id: String(c.id),
      name: c.name,
      sub: c.character || '',
      image: c.profile_path ? `https://image.tmdb.org/t/p/w300${c.profile_path}` : null
    }));
  };

  const fetchActorMoviesForGame = async (personId) => {
    const res = await fetch(`https://api.themoviedb.org/3/person/${personId}/movie_credits?api_key=${TMDB_API_KEY}&language=${tmdbLang}`);
    const d = await res.json();
    const unique = new Map();
    (d.cast || []).forEach(m => {
      if (m.poster_path && !unique.has(String(m.id))) {
        unique.set(String(m.id), {
          id: String(m.id),
          name: m.title,
          sub: m.release_date ? m.release_date.split('-')[0] : '',
          image: `https://image.tmdb.org/t/p/w300${m.poster_path}`,
          votes: m.vote_count || 0
        });
      }
    });
    return Array.from(unique.values()).sort((a, b) => b.votes - a.votes);
  };

  // İKİ FİLM SEÇİLDİĞİNDE OTOMATİK BAĞLANTI ANALİZİ
  useEffect(() => {
    if (!gameStartMovie || !gameTargetMovie) {
      setBridgeStatus({ checking: false, possible: true, directMatch: false, reason: '' });
      return;
    }
    if (String(gameStartMovie.id) === String(gameTargetMovie.id)) {
      setBridgeStatus({ checking: false, possible: false, directMatch: false, reason: 'Başlangıç ve hedef film aynı olamaz!' });
      return;
    }

    let cancelled = false;
    const verifyBridge = async () => {
      setBridgeStatus({ checking: true, possible: true, directMatch: false, reason: '' });
      try {
        const [c1, c2] = await Promise.all([
          fetchMovieCastForGame(gameStartMovie.id),
          fetchMovieCastForGame(gameTargetMovie.id)
        ]);
        if (cancelled) return;
        if (c1.length === 0 || c2.length === 0) {
          setBridgeStatus({ checking: false, possible: false, directMatch: false, reason: t.bridgeImpossibleNoCast });
          return;
        }
        const c2Ids = new Set(c2.map(a => String(a.id)));
        const sharedActor = c1.find(a => c2Ids.has(String(a.id)));
        if (sharedActor) {
          setBridgeStatus({ checking: false, possible: true, directMatch: true, reason: t.bridgeDirectPossible });
          return;
        }
        const sampleStartActors = c1.slice(0, 5);
        const sampleTargetActors = c2.slice(0, 5);
        const [startCreditsList, targetCreditsList] = await Promise.all([
          Promise.all(sampleStartActors.map(a => fetchActorMoviesForGame(a.id))),
          Promise.all(sampleTargetActors.map(a => fetchActorMoviesForGame(a.id)))
        ]);
        if (cancelled) return;
        const canLeaveStart = startCreditsList.some(list => list.some(m => String(m.id) !== String(gameStartMovie.id)));
        const canEnterTarget = targetCreditsList.some(list => list.some(m => String(m.id) !== String(gameTargetMovie.id)));

        if (!canLeaveStart) {
          setBridgeStatus({ checking: false, possible: false, directMatch: false, reason: `"${gameStartMovie.title}" ${t.bridgeImpossibleIsolated}` });
          return;
        }
        if (!canEnterTarget) {
          setBridgeStatus({ checking: false, possible: false, directMatch: false, reason: `"${gameTargetMovie.title}" ${t.bridgeImpossibleIsolated}` });
          return;
        }
        setBridgeStatus({ checking: false, possible: true, directMatch: false, reason: t.bridgeNormalPossible });
      } catch (e) {
        if (!cancelled) setBridgeStatus({ checking: false, possible: true, directMatch: false, reason: '' });
      }
    };
    verifyBridge();
    return () => { cancelled = true; };
  }, [gameStartMovie, gameTargetMovie, tmdbLang]);

  // Oyunu Başlatma (Kronometreyi 0.0 sn'ye sıfırlar)
  const startCineLinkGame = async (customStart = null, customTarget = null, isDaily = false) => {
    const sMovie = customStart || gameStartMovie;
    const tMovie = customTarget || gameTargetMovie;
    if (!sMovie || !tMovie || String(sMovie.id) === String(tMovie.id) || (!isDaily && !bridgeStatus.possible)) return;

    if (customStart) setGameStartMovie(customStart);
    if (customTarget) setGameTargetMovie(customTarget);
    setIsDailyModeActive(Boolean(isDaily));

    const existingBest = getLocalPairRecord(sMovie.id, tMovie.id);
    if (existingBest) {
      setCommunityRecord(prev => pickBetterRecord(prev, existingBest));
    }

    setGameLoading(true);
    setGameActive(true);
    setGameWon(false);
    setGameElapsedDeci(0);
    setBlitzFailed(false);
    setBlitzTimeLeft(15);
    setRecordBannerStatus(null);
    setGameFilterText('');
    setShowTargetHint(false);
    setGameHistoryStack([]);

    try {
      const [startCast, targetCast] = await Promise.all([
        fetchMovieCastForGame(sMovie.id),
        fetchMovieCastForGame(tMovie.id)
      ]);
      setGameTargetCast(targetCast.slice(0, 14));

      if (bannedActorMode && startCast.length > 1) {
        const tIds = new Set(targetCast.map(a => String(a.id)));
        const shared = startCast.find(a => tIds.has(String(a.id)));
        const toBan = shared || startCast[0];
        setBannedActorObj({ id: String(toBan.id), name: toBan.name });
      } else {
        setBannedActorObj(null);
      }

      setGameChain([{
        type: 'movie',
        id: String(sMovie.id),
        name: sMovie.title,
        sub: sMovie.year || '',
        image: sMovie.poster
      }]);
      setGameOptions(startCast);
      setGameStepType('actor');
      setGameElapsedDeci(0);
    } catch (e) {
      showToast(t.errorOccurred);
    } finally {
      setGameLoading(false);
    }
  };

  const scrollToRatingView = () => {
    setTimeout(() => {
      const sliderBox = document.getElementById('rating-slider-box');
      if (!sliderBox) return;
      const topScoreBox = sliderBox.previousElementSibling || sliderBox;
      const topRect = topScoreBox.getBoundingClientRect();
      const botRect = sliderBox.getBoundingClientRect();
      const groupTop = topRect.top + window.scrollY;
      const groupBottom = botRect.bottom + window.scrollY;
      const groupHeight = groupBottom - groupTop;
      const headerOffset = 86;
      const availableHeight = window.innerHeight - headerOffset;
      const targetY = groupHeight < availableHeight
        ? groupTop - headerOffset - ((availableHeight - groupHeight) / 2)
        : groupTop - headerOffset - 10;
      window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
    }, 100);
  };

  const resetGameScrollPosition = () => {
    const gridEl = document.getElementById('game-options-grid');
    if (gridEl) gridEl.scrollTop = 0;

    setTimeout(() => {
      const gridAfter = document.getElementById('game-options-grid');
      if (gridAfter) gridAfter.scrollTop = 0;

      const chainEl = document.getElementById('game-chain-list');
      if (chainEl) {
        chainEl.scrollTop = chainEl.scrollHeight;
        chainEl.scrollLeft = chainEl.scrollWidth;
      }

      const selectionPanel = document.getElementById('game-selection-panel');
      if (selectionPanel) {
        const rect = selectionPanel.getBoundingClientRect();
        if (rect.top < 60 || rect.top > window.innerHeight * 0.65) {
          window.scrollTo({ top: window.scrollY + rect.top - 82, behavior: 'smooth' });
        }
      }
    }, 30);
  };

  useEffect(() => {
    let active = true;
    const localizeGameMovies = async () => {
      try {
        if (gameStartMovie?.id) {
          const r1 = await fetch(`https://api.themoviedb.org/3/movie/${gameStartMovie.id}?api_key=${TMDB_API_KEY}&language=${tmdbLang}`).then(r => r.json());
          if (active && r1?.title) {
            setGameStartMovie(prev => prev ? { ...prev, title: r1.title, poster: r1.poster_path ? `https://image.tmdb.org/t/p/w500${r1.poster_path}` : prev.poster } : prev);
          }
        }
        if (gameTargetMovie?.id) {
          const r2 = await fetch(`https://api.themoviedb.org/3/movie/${gameTargetMovie.id}?api_key=${TMDB_API_KEY}&language=${tmdbLang}`).then(r => r.json());
          if (active && r2?.title) {
            setGameTargetMovie(prev => prev ? { ...prev, title: r2.title, poster: r2.poster_path ? `https://image.tmdb.org/t/p/w500${r2.poster_path}` : prev.poster } : prev);
          }
        }
        if (gameActive && gameChain.length > 0) {
          const updatedChain = await Promise.all(gameChain.map(async (node) => {
            if (node.type !== 'movie') return node;
            try {
              const rm = await fetch(`https://api.themoviedb.org/3/movie/${node.id}?api_key=${TMDB_API_KEY}&language=${tmdbLang}`).then(r => r.json());
              return rm?.title ? { ...node, name: rm.title } : node;
            } catch { return node; }
          }));
          if (active) setGameChain(updatedChain);

          const lastNode = gameChain[gameChain.length - 1];
          if (lastNode) {
            const newOpts = lastNode.type === 'movie'
              ? await fetchMovieCastForGame(lastNode.id)
              : await fetchActorMoviesForGame(lastNode.id);
            if (active) setGameOptions(newOpts);
          }
        }
      } catch (e) {}
    };
    localizeGameMovies();
    return () => { active = false; };
  }, [tmdbLang]);

  const handlePickGameActor = async (actor) => {
    if (bannedActorObj && String(actor.id) === String(bannedActorObj.id)) {
      showToast(`${actor.name} — ${t.bannedActorBadge || 'Yasaklı Oyuncu!'}`);
      return;
    }
    resetGameScrollPosition();
    setGameLoading(true);
    setGameFilterText('');
    try {
      const actorMovies = await fetchActorMoviesForGame(actor.id);
      setGameHistoryStack(prev => [...prev, { chain: gameChain, options: gameOptions, stepType: gameStepType }]);
      playCineSound('link', soundEnabledRef.current);
      setGameChain(prev => [...prev, { type: 'actor', id: actor.id, name: actor.name, sub: actor.sub, image: actor.image }]);
      setGameOptions(actorMovies);
      setGameStepType('movie');
      setBlitzTimeLeft(15);
      resetGameScrollPosition();
    } catch (e) {
      showToast(t.errorOccurred);
    } finally {
      setGameLoading(false);
    }
  };

  // Film Seçildiğinde (Köprü Sayısı + Kronometre Süresi İle Rekor Karşılaştırması)
  const handlePickGameMovie = async (movie) => {
    resetGameScrollPosition();
    setGameFilterText('');
    const newChain = [...gameChain, { type: 'movie', id: movie.id, name: movie.name, sub: movie.sub, image: movie.image }];

    if (String(movie.id) === String(gameTargetMovie.id)) {
      playCineSound('gameWin', soundEnabledRef.current);
      setGameHistoryStack(prev => [...prev, { chain: gameChain, options: gameOptions, stepType: gameStepType }]);
      setGameChain(newChain);
      setGameWon(true);
      resetGameScrollPosition();

      const linksUsed = Math.floor(newChain.length / 2);
      const timeUsedSec = Math.max(0.5, Number((gameElapsedDeci / 10).toFixed(1)));
      const startId = String(newChain[0]?.id || gameStartMovie.id);
      const targetId = String(gameTargetMovie.id);
      const pairDocId = `${startId}_${targetId}`;

      const prevLocal = getLocalPairRecord(startId, targetId);
      const prevCombined = pickBetterRecord(prevLocal, communityRecord);

      let isNewBest = false;
      if (!prevCombined || !prevCombined.bestLinks) {
        isNewBest = true;
        setRecordBannerStatus('new');
      } else if (linksUsed < Number(prevCombined.bestLinks)) {
        isNewBest = true;
        setRecordBannerStatus('new');
      } else if (linksUsed === Number(prevCombined.bestLinks)) {
        const oldT = prevCombined.bestTime ? Number(prevCombined.bestTime) : 999999;
        if (timeUsedSec < oldT) {
          isNewBest = true;
          setRecordBannerStatus('faster');
        } else {
          setRecordBannerStatus('tied');
        }
      }

      const savedWinner = saveLocalPairRecord(startId, targetId, linksUsed, timeUsedSec);
      setCommunityRecord(savedWinner);

      // A) GÜNÜN KÖPRÜSÜ İSE GÜNLÜK SKORU VE GÜNLÜK REKORU SÜRESİYLE GÜNCELLE
      if (isDailyModeActive || (dailyBridgeData.start && startId === String(dailyBridgeData.start.id) && targetId === String(dailyBridgeData.target.id))) {
        try {
          const localDaily = JSON.parse(localStorage.getItem('cinescore_daily_bridge') || '{}');
          const oldEntry = localDaily[dailyBridgeData.dateKey];
          const oldDailyRec = typeof oldEntry === 'number'
            ? { bestLinks: oldEntry, bestTime: null }
            : (oldEntry?.links ? { bestLinks: Number(oldEntry.links), bestTime: Number(oldEntry.time) || null } : null);

          const newDailyRec = pickBetterRecord({ bestLinks: linksUsed, bestTime: timeUsedSec }, oldDailyRec);
          localDaily[dailyBridgeData.dateKey] = { links: newDailyRec.bestLinks, time: newDailyRec.bestTime };
          localStorage.setItem('cinescore_daily_bridge', JSON.stringify(localDaily));

          setDailyBridgeData(prev => ({
            ...prev,
            completedLinks: newDailyRec.bestLinks,
            completedTime: newDailyRec.bestTime,
            bestRecord: pickBetterRecord(prev.bestRecord, newDailyRec)
          }));
        } catch (e) {}
      }

      // B) DAHA KISA KÖPRÜ VEYA AYNI KÖPRÜDE DAHA HIZLI SÜRE İSE FIRESTORE'U GÜNCELLE
      if (isNewBest) {
        try {
          await setDoc(doc(db, 'game_records', pairDocId), {
            bestLinks: linksUsed,
            bestTime: timeUsedSec,
            holderUid: user?.uid || 'guest',
            startTitle: gameStartMovie.title,
            targetTitle: gameTargetMovie.title,
            updatedAt: Date.now()
          }, { merge: true });
        } catch (e) {}
      }

      // C) MİNİ OYUN BAŞARIM ROZETLERİ
      try {
        const oldBadges = getAllBadges(myRatings, t, safeGlobalMovies).filter(b => b.earned).map(b => b.id);
        const prevStats = JSON.parse(localStorage.getItem('cinescore_gamestats') || '{}');
        const updatedStats = {
          wins: (Number(prevStats.wins) || 0) + 1,
          bestLinks: Math.min(Number(prevStats.bestLinks) || 999, linksUsed)
        };
        localStorage.setItem('cinescore_gamestats', JSON.stringify(updatedStats));

        const newBadges = getAllBadges(myRatings, t, safeGlobalMovies).filter(b => b.earned);
        const newlyUnlocked = newBadges.filter(b => !oldBadges.includes(b.id));

        if (newlyUnlocked.length > 0) {
          setTimeout(() => {
            setUnlockedBadgeModal(newlyUnlocked[0]);
            showToast(`🏆 ${t.newBadgeUnlocked || 'Yeni Rozet Kazandın:'} ${newlyUnlocked[0].name}!`);
          }, 500);
          if (user) {
            const currentNotifs = userProfile?.notifications || [];
            const badgeNotifs = newlyUnlocked
              .filter(b => !currentNotifs.some(n => n.type === 'badge' && n.badgeId === b.id))
              .map(b => ({
                id: 'notif_badge_' + b.id + '_' + Date.now(),
                type: 'badge',
                badgeId: b.id,
                fromName: `🏆 ${t.newBadgeUnlocked || 'Yeni Rozet:'} ${b.name}`,
                badgeDesc: b.realDesc || b.desc,
                date: Date.now(),
                read: false
              }));
            if (badgeNotifs.length > 0) {
              const updatedNotifs = [...badgeNotifs, ...currentNotifs].slice(0, 20);
              await setDoc(doc(db, 'users', user.uid), { notifications: updatedNotifs, gameStats: updatedStats }, { merge: true });
              setUserProfile(prev => ({ ...prev, notifications: updatedNotifs, gameStats: updatedStats }));
            }
          }
        } else if (user) {
          await setDoc(doc(db, 'users', user.uid), { gameStats: updatedStats }, { merge: true });
        }
      } catch (e) {}
      return;
    }

    setGameLoading(true);
    try {
      const nextCast = await fetchMovieCastForGame(movie.id);
      playCineSound('link', soundEnabledRef.current);
      setGameHistoryStack(prev => [...prev, { chain: gameChain, options: gameOptions, stepType: gameStepType }]);
      setGameChain(newChain);
      setGameOptions(nextCast);
      setGameStepType('actor');
      setBlitzTimeLeft(15);
      resetGameScrollPosition();
    } catch (e) {
      showToast(t.errorOccurred);
    } finally {
      setGameLoading(false);
    }
  };

  const handleUndoGameStep = () => {
    if (gameHistoryStack.length === 0) return;
    playCineSound('undo', soundEnabledRef.current);
    const lastState = gameHistoryStack[gameHistoryStack.length - 1];
    setGameChain(lastState.chain);
    setGameOptions(lastState.options);
    setGameStepType(lastState.stepType);
    setGameWon(false);
    setBlitzFailed(false);
    setBlitzTimeLeft(15);
    setGameFilterText('');
    setGameHistoryStack(prev => prev.slice(0, -1));
  };

  const copySineBagChallengeLink = () => {
    if (!gameStartMovie?.id || !gameTargetMovie?.id) return;
    const baseUrl = window.location.origin + window.location.pathname;
    const challengeUrl = `${baseUrl}#/game?start=${gameStartMovie.id}&target=${gameTargetMovie.id}`;
    navigator.clipboard.writeText(challengeUrl);
    showToast(t.challengeCopiedToast || 'Meydan okuma linki kopyalandı!');
  };

  // 6) SÜRE VE KÖPRÜ DETAYLI PRİZMA ZAFER KARTI (PNG) ÜRETİCİSİ
  const generateSineBagVictoryCard = async () => {
    if (!gameStartMovie || !gameTargetMovie || gameChain.length < 3) return;
    setWinCardModal({ show: true, generating: true, imageUrl: null });

    try {
      const loadImg = (url) => new Promise((resolve) => {
        if (!url) return resolve(null);
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=600&output=jpg`;
      });

      const [startImg, targetImg] = await Promise.all([
        loadImg(gameStartMovie.poster),
        loadImg(gameTargetMovie.poster)
      ]);

      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1920;
      const ctx = canvas.getContext('2d');

      // Derin Sinematik Prizma Arka Plan
      ctx.fillStyle = '#05060B';
      ctx.fillRect(0, 0, 1080, 1920);

      // Sol Camgöbeği & Sağ Fuşya Işık Huzmeleri
      const gCyan = ctx.createRadialGradient(220, 440, 20, 220, 440, 680);
      gCyan.addColorStop(0, 'rgba(6, 182, 212, 0.25)');
      gCyan.addColorStop(1, 'transparent');
      ctx.fillStyle = gCyan;
      ctx.fillRect(0, 0, 1080, 1920);

      const gRose = ctx.createRadialGradient(860, 440, 20, 860, 440, 680);
      gRose.addColorStop(0, 'rgba(236, 72, 153, 0.25)');
      gRose.addColorStop(1, 'transparent');
      ctx.fillStyle = gRose;
      ctx.fillRect(0, 0, 1080, 1920);

      // Dış Çerçeve
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(52, 52, 976, 1816, 40);
      ctx.stroke();

      // Üst Marka ve Etap Başlığı
      ctx.textAlign = 'left';
      ctx.fillStyle = '#38bdf8';
      ctx.font = '900 24px sans-serif';
      const headerLabel = isDailyModeActive
        ? `🎯 ${t.dailyBridgeTitle || 'GÜNÜN KÖPRÜSÜ'} #${dailyBridgeData.dayNum}`
        : `🎬 ${t.miniGameNav || 'MİNİ OYUN: SİNEBAĞ'}`;
      ctx.fillText(headerLabel.toUpperCase(), 96, 128);

      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 40px Montserrat, sans-serif';
      ctx.fillText('CINESCORE', 984, 132);

      // Başlangıç (Cyan Çerçeve) ve Hedef (Rose Çerçeve) Afişleri
      if (startImg) {
        ctx.save();
        ctx.beginPath(); ctx.roundRect(96, 190, 380, 550, 28); ctx.clip();
        ctx.drawImage(startImg, 96, 190, 380, 550);
        ctx.restore();
        ctx.strokeStyle = '#06b6d4'; ctx.lineWidth = 6;
        ctx.beginPath(); ctx.roundRect(96, 190, 380, 550, 28); ctx.stroke();
      }
      if (targetImg) {
        ctx.save();
        ctx.beginPath(); ctx.roundRect(604, 190, 380, 550, 28); ctx.clip();
        ctx.drawImage(targetImg, 604, 190, 380, 550);
        ctx.restore();
        ctx.strokeStyle = '#ec4899'; ctx.lineWidth = 6;
        ctx.beginPath(); ctx.roundRect(604, 190, 380, 550, 28); ctx.stroke();
      }

      // Orta Enerji Köprüsü İkonu
      ctx.fillStyle = '#090D18';
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 5;
      ctx.beginPath(); ctx.arc(540, 465, 54, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 42px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⇄', 540, 480);

      // Film İsimleri
      const trimT = (s) => (s && s.length > 21 ? s.substring(0, 20) + '…' : (s || ''));
      ctx.fillStyle = '#22d3ee';
      ctx.font = '900 28px sans-serif';
      ctx.fillText(trimT(gameStartMovie.title), 286, 790);
      ctx.fillStyle = '#f472b6';
      ctx.fillText(trimT(gameTargetMovie.title), 794, 790);

      // MERKEZ SKOR & KRONOMETRE SÜRESİ KUTUSU
      const linksUsed = Math.floor(gameChain.length / 2);
      const timeUsedSec = Math.max(0.5, Number((gameElapsedDeci / 10).toFixed(1)));

      ctx.fillStyle = '#090D18';
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 5;
      ctx.beginPath(); ctx.roundRect(96, 840, 888, 235, 34); ctx.fill(); ctx.stroke();

      ctx.fillStyle = '#34d399';
      ctx.font = '900 24px sans-serif';
      const rankTitle = linksUsed <= 2 ? t.winRank1 : linksUsed <= 4 ? t.winRank2 : t.winRank3;
      ctx.fillText(`🏆 ${rankTitle}`, 540, 892);

      // Köprü Sayısı ve Kronometre Süresi Yan Yana
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 70px Montserrat, sans-serif';
      ctx.fillText(`${linksUsed} ${(t.linksCount || 'BAĞLANTI').toUpperCase()}  •  ⏱ ${timeUsedSec.toFixed(1)}${unitSec}`, 540, 982);

      if (recordBannerStatus === 'new' || recordBannerStatus === 'faster') {
        ctx.fillStyle = '#38bdf8';
        ctx.font = '900 24px sans-serif';
        ctx.fillText(recordBannerStatus === 'faster' ? (t.fasterRecordBanner || '⚡ YENİ SÜRE REKORU!') : (t.newRecordBanner || '🔥 YENİ TOPLULUK REKORU!'), 540, 1042);
      }

      // SPOILER KORUMALI ROTA ŞEMASI
      const totalNodes = gameChain.length;
      const boxY = 1120;
      ctx.fillStyle = '#090D18';
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.roundRect(96, boxY, 888, 360, 32); ctx.fill(); ctx.stroke();

      const stepsToShow = [
        { code: '01', type: t.chainStartBadge || 'BAŞLANGIÇ', label: trimT(gameStartMovie.title), accent: '#06b6d4' },
        { code: '🔒', type: `${totalNodes - 2} ${t.hiddenStepLabel || 'GİZLİ ADIM'}`, label: 'SPOILER KORUMALI ROTA [ ? ]', accent: '#a855f7' },
        { code: String(totalNodes).padStart(2, '0'), type: t.targetPointBadge || 'HEDEF FİLM', label: trimT(gameTargetMovie.title), accent: '#ec4899' }
      ];

      stepsToShow.forEach((st, idx) => {
        const rowY = boxY + 34 + idx * 102;
        ctx.fillStyle = '#05060B';
        ctx.strokeStyle = st.accent;
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.roundRect(130, rowY, 820, 78, 20); ctx.fill(); ctx.stroke();

        ctx.fillStyle = st.accent;
        ctx.beginPath(); ctx.roundRect(130, rowY, 92, 78, 20); ctx.fill();
        ctx.fillStyle = '#05060B';
        ctx.textAlign = 'center';
        ctx.font = '900 26px sans-serif';
        ctx.fillText(st.code, 176, rowY + 48);

        ctx.textAlign = 'left';
        ctx.fillStyle = st.accent;
        ctx.font = '900 18px sans-serif';
        ctx.fillText(st.type.toUpperCase(), 248, rowY + 30);

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 25px sans-serif';
        ctx.fillText(st.label.toUpperCase(), 248, rowY + 58);
      });

      // Kullanıcı İmzası (Story Kartında Görünür)
      const uCode = userProfile?.userCode || user?.uid?.substring(0, 6).toUpperCase() || 'OYUNCU';
      const uName = userProfile?.displayName || 'Sinefil';

      ctx.fillStyle = '#090D18';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.roundRect(96, 1530, 888, 130, 28); ctx.fill(); ctx.stroke();

      ctx.textAlign = 'left';
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText((t.criticLabel || 'OYUNCU').toUpperCase(), 136, 1575);
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 36px sans-serif';
      ctx.fillText(uName, 136, 1626);

      ctx.textAlign = 'right';
      ctx.fillStyle = '#38bdf8';
      ctx.font = '900 34px monospace';
      ctx.fillText(`@${uCode}`, 944, 1615);

      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 28px sans-serif';
      ctx.fillText(t.winCardChallengeText || 'SEN DAHA KISA SÜREDE BAĞLAYABİLİR MİSİN?', 540, 1745);
      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText('cinescore.com.tr', 540, 1805);

      setWinCardModal({ show: true, generating: false, imageUrl: canvas.toDataURL('image/png') });
    } catch (e) {
      setWinCardModal({ show: false, generating: false, imageUrl: null });
      showToast(t.errorOccurred);
    }
  };

  // 3 POPÜLER OYUN ROTASI VE RASTGELE 2 FİLM SEÇME FONKSİYONU
  const loadPresetOrRandomPair = async (type = 'random') => {
    setGameLoading(true);
    setIsDailyModeActive(false);
    try {
      const presetPairs = {
        classic: [11324, 22],
        popular2: [27205, 120],
        popular3: [680, 155]
      };

      if (presetPairs[type]) {
        const [id1, id2] = presetPairs[type];
        const [r1, r2] = await Promise.all([
          fetch(`https://api.themoviedb.org/3/movie/${id1}?api_key=${TMDB_API_KEY}&language=${tmdbLang}`).then(r => r.json()),
          fetch(`https://api.themoviedb.org/3/movie/${id2}?api_key=${TMDB_API_KEY}&language=${tmdbLang}`).then(r => r.json())
        ]);
        setGameStartMovie({ id: String(r1.id), title: r1.title, year: r1.release_date?.split('-')[0] || '', poster: `https://image.tmdb.org/t/p/w500${r1.poster_path}` });
        setGameTargetMovie({ id: String(r2.id), title: r2.title, year: r2.release_date?.split('-')[0] || '', poster: `https://image.tmdb.org/t/p/w500${r2.poster_path}` });
      } else {
        const randomPage = Math.floor(Math.random() * 8) + 1;
        const res = await fetch(`https://api.themoviedb.org/3/movie/top_rated?api_key=${TMDB_API_KEY}&language=${tmdbLang}&page=${randomPage}`);
        const d = await res.json();
        const validMovies = (d.results || []).filter(m => m && m.id && m.poster_path && m.vote_count > 500);

        if (validMovies.length >= 2) {
          const idx1 = Math.floor(Math.random() * validMovies.length);
          let idx2 = Math.floor(Math.random() * validMovies.length);
          if (idx2 === idx1) idx2 = (idx1 + 1) % validMovies.length;
          const m1 = validMovies[idx1];
          const m2 = validMovies[idx2];

          setGameStartMovie({
            id: String(m1.id),
            title: m1.title,
            year: m1.release_date ? m1.release_date.split('-')[0] : '',
            poster: `https://image.tmdb.org/t/p/w500${m1.poster_path}`
          });
          setGameTargetMovie({
            id: String(m2.id),
            title: m2.title,
            year: m2.release_date ? m2.release_date.split('-')[0] : '',
            poster: `https://image.tmdb.org/t/p/w500${m2.poster_path}`
          });
        }
      }
} catch (e) {
      showToast(t.errorOccurred);
    } finally {
      setGameLoading(false);
    }
  };

  const [listToDelete, setListToDelete] = useState(null);
  const [listPosterModal, setListPosterModal] = useState({ show: false, generating: false, imageUrl: null, listName: '' });
  // ÖZEL LİSTE SİLME VE FİLM ÇIKARMA FONKSİYONLARI
  const confirmDeleteCustomList = async () => {
    if (!user || !listToDelete) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'customLists', listToDelete));
      if (activeCustomList && activeCustomList.id === listToDelete) {
        setActiveCustomList(null);
        setActiveTab('profile_watchlist');
      }
      setListToDelete(null);
      showToast(t.listDeleted || 'Liste silindi!');
    } catch (e) { showToast(t.errorOccurred); }
  };

  const removeMovieFromCustomList = async (listId, movieId, e) => {
    e.stopPropagation();
    if (!user) return;
    const listData = customLists.find(l => l.id === listId);
    if (!listData) return;
    const updatedMovies = (listData.movies || []).filter(m => String(m.id) !== String(movieId));
    try {
      await setDoc(doc(db, 'users', user.uid, 'customLists', listId), { movies: updatedMovies }, { merge: true });
      if (activeCustomList && activeCustomList.id === listId) {
        setActiveCustomList(prev => ({ ...prev, movies: updatedMovies }));
      }
      showToast(t.removeFromWatchlist);
    } catch (err) { showToast(t.errorOccurred); }
  };

  // ÖZEL LİSTEYİ SIRALI GÖRSEL (POSTER) OLARAK İNDİRME MOTORU
  const generateListPoster = async (listObj, e) => {
    if (e) e.stopPropagation();
    if (!listObj || !listObj.movies || listObj.movies.length === 0) return;

    setListPosterModal({ show: true, generating: true, imageUrl: null, listName: listObj.name });
    try {
      const items = listObj.movies.slice(0, 12);
      const cols = 3;
      const rows = Math.ceil(items.length / cols);
      const canvasW = 1080;
      const canvasH = Math.max(1350, 340 + rows * 430 + 120);
      const canvas = document.createElement('canvas');
      canvas.width = canvasW;
      canvas.height = canvasH;
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = '#04060C';
      ctx.fillRect(0, 0, canvasW, canvasH);
      const grad = ctx.createRadialGradient(540, 200, 50, 540, 400, 900);
      grad.addColorStop(0, themeColor + '40');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvasW, canvasH);

      ctx.textAlign = 'left';
      ctx.font = '900 44px Montserrat, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('CINE', 70, 100);
      const cw = ctx.measureText('CINE').width;
      ctx.fillStyle = themeColor;
      ctx.fillText('SCORE', 70 + cw, 100);

      ctx.textAlign = 'right';
      ctx.font = 'bold 28px sans-serif';
      ctx.fillStyle = '#94a3b8';
      const uCode = userProfile?.userCode || user?.uid?.substring(0, 6).toUpperCase() || 'USER';
      ctx.fillText(`${userProfile?.displayName || 'Sinefil'} (@${uCode})`, 1010, 95);

      ctx.textAlign = 'center';
      ctx.font = '900 56px sans-serif';
      ctx.fillStyle = '#ffffff';
      const lTitle = listObj.name.length > 26 ? listObj.name.substring(0, 26) + '...' : listObj.name;
      ctx.fillText(lTitle, 540, 200);

      ctx.strokeStyle = themeColor;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(390, 230);
      ctx.lineTo(690, 230);
      ctx.stroke();

      const loadImg = (url) => new Promise((res) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => res(img);
        img.onerror = () => res(null);
        img.src = `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=400&output=jpg`;
      });

      const loadedImgs = await Promise.all(items.map(m => loadImg(m.poster)));

      const cardW = 280, cardH = 360, gapX = 50, startX = 70, startY = 280;
      items.forEach((m, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = startX + col * (cardW + gapX);
        const y = startY + row * 430;

        ctx.save();
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.roundRect(x, y, cardW, cardH, 24);
        ctx.fill();
        ctx.clip();
        if (loadedImgs[i]) ctx.drawImage(loadedImgs[i], x, y, cardW, cardH);
        ctx.restore();

        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(x, y, cardW, cardH, 24);
        ctx.stroke();

        ctx.fillStyle = themeColor;
        ctx.beginPath();
        ctx.roundRect(x + 12, y + 12, 54, 42, 12);
        ctx.fill();
        ctx.fillStyle = '#04060C';
        ctx.font = '900 24px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`#${i + 1}`, x + 39, y + 41);

        const myR = myRatings.find(r => String(r.id) === String(m.id));
        const gR = safeGlobalMovies.find(g => String(g.id) === String(m.id));
        const sc = myR ? Number(myR.finalScore) : (gR ? Number(gR.avgScore) : null);
        if (sc) {
          ctx.fillStyle = '#04060C';
          ctx.beginPath();
          ctx.roundRect(x + cardW - 78, y + 12, 66, 42, 12);
          ctx.fill();
          ctx.fillStyle = getScoreColorHex(sc);
          ctx.font = '900 22px sans-serif';
          ctx.fillText(sc.toFixed(1), x + cardW - 45, y + 40);
        }

        ctx.fillStyle = '#e2e8f0';
        ctx.font = 'bold 22px sans-serif';
        ctx.textAlign = 'center';
        const disp = (localizedData?.[m.id]?.title || m.title || '');
        const shortT = disp.length > 20 ? disp.substring(0, 19) + '…' : disp;
        ctx.fillText(shortT, x + cardW / 2, y + cardH + 36);
      });

      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('cinescore.com.tr • Sinema Arşivi ve Derecelendirme Platformu', 540, canvasH - 45);

      setListPosterModal({ show: true, generating: false, imageUrl: canvas.toDataURL('image/png'), listName: listObj.name });
    } catch (err) {
      setListPosterModal({ show: false, generating: false, imageUrl: null, listName: '' });
      showToast(t.errorOccurred);
    }
  };

// 3) 5 FARKLI TASARIMDA & YENİ PUAN RENK SPEKTRUMLU 9:16 STORY KARTI ÜRETİCİ
  const generateStoryCard = async () => {
    if (!selectedMovie) return;
    const myRatingObj = myRatings.find(r => String(r.id) === String(selectedMovie.id));
    if (!myRatingObj) return;

    setStoryModal({ show: true, generating: true, imageUrl: null, activeStyle: 'neon', images: {} });
    try {
      const loadPoster = (url) => new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=750&output=jpg`;
      });

      const posterImg = await loadPoster(selectedMovie.poster);
      const numericFinal = Number(myRatingObj.finalScore) || 0;
      const scoreVal = numericFinal.toFixed(2);
      const scoreHex = getScoreColorHex(numericFinal);
      const isNeonScore = numericFinal >= 9.0;
      const uCode = userProfile?.userCode || user?.uid?.substring(0, 6).toUpperCase() || 'USER';
      const uName = userProfile?.displayName || 'Sinefil';

      const rawTitle = localizedData?.[selectedMovie.id]?.title || selectedMovie.title || '';
      const titleText = rawTitle.length > 25 ? rawTitle.substring(0, 25) + '…' : rawTitle;
      const criticSignature = `${t.criticLabel || 'Eleştirmen'}: ${uName} / @${uCode}`;
      const scoreTitleLabel = (t.yourScoreLabel || 'PUAN').toUpperCase();
      const dirLabel = (t.director || 'Yönetmen').toUpperCase();

      // --- TASARIM 1: NEON AURA ---
      const makeNeon = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 1080; canvas.height = 1920;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#03050B'; ctx.fillRect(0, 0, 1080, 1920);

        const gradTop = ctx.createRadialGradient(540, 420, 40, 540, 420, 760);
        gradTop.addColorStop(0, scoreHex + '44'); gradTop.addColorStop(1, 'transparent');
        ctx.fillStyle = gradTop; ctx.fillRect(0, 0, 1080, 1920);

        const gradBot = ctx.createRadialGradient(540, 1380, 40, 540, 1380, 720);
        gradBot.addColorStop(0, scoreHex + '38'); gradBot.addColorStop(1, 'transparent');
        ctx.fillStyle = gradBot; ctx.fillRect(0, 0, 1080, 1920);

        ctx.font = '900 54px Montserrat, sans-serif'; ctx.fillStyle = '#ffffff'; ctx.textAlign = 'left';
        ctx.fillText('CINE', 80, 120);
        const cineW = ctx.measureText('CINE').width;
        ctx.fillStyle = scoreHex; ctx.fillText('SCORE', 80 + cineW, 120);

        ctx.font = '900 28px sans-serif'; ctx.fillStyle = scoreHex; ctx.textAlign = 'right';
        ctx.fillText(`@${uCode}`, 1000, 115);

        if (posterImg) {
          ctx.save();
          ctx.shadowColor = scoreHex; ctx.shadowBlur = isNeonScore ? 65 : 45;
          ctx.beginPath(); ctx.roundRect(310, 165, 460, 670, 40); ctx.clip();
          ctx.drawImage(posterImg, 310, 165, 460, 670);
          ctx.restore();
          ctx.strokeStyle = scoreHex; ctx.lineWidth = 5;
          ctx.beginPath(); ctx.roundRect(310, 165, 460, 670, 40); ctx.stroke();
        }

        ctx.textAlign = 'center'; ctx.fillStyle = '#ffffff'; ctx.font = '900 50px sans-serif';
        ctx.fillText(titleText, 540, 915);
        ctx.fillStyle = '#94a3b8'; ctx.font = 'bold 28px sans-serif';
        ctx.fillText(`${selectedMovie.year} • ${dirLabel}: ${selectedMovie.director}`, 540, 965);

        ctx.save();
        if (isNeonScore) { ctx.shadowColor = '#39ff14'; ctx.shadowBlur = 35; }
        ctx.fillStyle = '#080c17'; ctx.strokeStyle = scoreHex; ctx.lineWidth = 8;
        ctx.beginPath(); ctx.roundRect(350, 1005, 380, 175, 45); ctx.fill(); ctx.stroke();
        ctx.restore();

        ctx.fillStyle = '#94a3b8'; ctx.font = '900 22px sans-serif';
        ctx.fillText(scoreTitleLabel, 540, 1048);
        ctx.save();
        if (isNeonScore) { ctx.shadowColor = '#39ff14'; ctx.shadowBlur = 25; }
        ctx.fillStyle = scoreHex; ctx.font = '900 88px sans-serif';
        ctx.fillText(scoreVal, 540, 1148);
        ctx.restore();

        criteriaData.forEach((c, idx) => {
          const y = 1255 + idx * 96;
          const val = Number(myRatingObj.scores?.[c.id] ?? 5);
          const cHex = getScoreColorHex(val);
          ctx.textAlign = 'left'; ctx.fillStyle = '#f1f5f9'; ctx.font = 'bold 30px sans-serif'; ctx.fillText(c.name, 100, y);
          ctx.textAlign = 'right'; ctx.fillStyle = cHex; ctx.font = '900 34px sans-serif'; ctx.fillText(val.toFixed(1), 980, y);
          ctx.fillStyle = '#0f172a'; ctx.beginPath(); ctx.roundRect(100, y + 16, 880, 24, 12); ctx.fill();
          ctx.save();
          if (val >= 9.0) { ctx.shadowColor = '#39ff14'; ctx.shadowBlur = 18; }
          ctx.fillStyle = cHex; ctx.beginPath(); ctx.roundRect(100, y + 16, Math.max(24, (val / 10) * 880), 24, 12); ctx.fill();
          ctx.restore();
        });

        ctx.fillStyle = '#090e1a'; ctx.strokeStyle = scoreHex + '88'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.roundRect(100, 1755, 880, 95, 28); ctx.fill(); ctx.stroke();
        ctx.textAlign = 'center'; ctx.fillStyle = '#ffffff'; ctx.font = '900 30px sans-serif';
        ctx.fillText(criticSignature, 540, 1813);
        return canvas.toDataURL('image/png');
      };

      // --- TASARIM 2: SİNEMATİK TAM EKRAN AFİŞ ---
      const makeCinema = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 1080; canvas.height = 1920;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#030408'; ctx.fillRect(0, 0, 1080, 1920);

        if (posterImg) ctx.drawImage(posterImg, 0, 0, 1080, 1420);
        const darkGrad = ctx.createLinearGradient(0, 120, 0, 1420);
        darkGrad.addColorStop(0, 'rgba(3,4,8,0.25)');
        darkGrad.addColorStop(0.55, 'rgba(3,4,8,0.78)');
        darkGrad.addColorStop(1, '#030408');
        ctx.fillStyle = darkGrad; ctx.fillRect(0, 0, 1080, 1450);

        ctx.fillStyle = 'rgba(4,6,12,0.82)'; ctx.strokeStyle = scoreHex + '66'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.roundRect(65, 65, 950, 95, 48); ctx.fill(); ctx.stroke();
        ctx.font = '900 42px Montserrat, sans-serif'; ctx.fillStyle = '#ffffff'; ctx.textAlign = 'left';
        ctx.fillText('CINESCORE', 115, 127);
        ctx.font = '900 26px sans-serif'; ctx.fillStyle = scoreHex; ctx.textAlign = 'right';
        ctx.fillText(`@${uCode}`, 965, 124);

        ctx.save();
        if (isNeonScore) { ctx.shadowColor = '#39ff14'; ctx.shadowBlur = 40; }
        ctx.fillStyle = '#04060C'; ctx.strokeStyle = scoreHex; ctx.lineWidth = 14;
        ctx.beginPath(); ctx.arc(540, 940, 155, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.restore();

        ctx.fillStyle = '#94a3b8'; ctx.textAlign = 'center'; ctx.font = '900 22px sans-serif';
        ctx.fillText(scoreTitleLabel, 540, 875);
        ctx.fillStyle = scoreHex; ctx.font = '900 98px sans-serif';
        ctx.fillText(scoreVal, 540, 985);

        ctx.fillStyle = '#ffffff'; ctx.font = '900 56px sans-serif';
        ctx.fillText(titleText, 540, 1185);
        ctx.fillStyle = '#cbd5e1'; ctx.font = 'bold 30px sans-serif';
        ctx.fillText(`${selectedMovie.year} • ${dirLabel}: ${selectedMovie.director}`, 540, 1240);

        criteriaData.forEach((c, idx) => {
          const val = Number(myRatingObj.scores?.[c.id] ?? 5);
          const cHex = getScoreColorHex(val);
          const bx = 68 + idx * 192;
          const by = 1315;
          ctx.fillStyle = '#090d16'; ctx.strokeStyle = cHex; ctx.lineWidth = 4;
          ctx.beginPath(); ctx.roundRect(bx, by, 176, 235, 28); ctx.fill(); ctx.stroke();
          ctx.fillStyle = cHex; ctx.font = '900 52px sans-serif'; ctx.textAlign = 'center';
          ctx.fillText(val.toFixed(1), bx + 88, by + 115);
          ctx.fillStyle = '#e2e8f0'; ctx.font = 'bold 20px sans-serif';
          const shortCrit = c.name.length > 11 ? c.name.substring(0, 10) + '.' : c.name;
          ctx.fillText(shortCrit.toUpperCase(), bx + 88, by + 185);
        });

        ctx.fillStyle = '#090d16'; ctx.strokeStyle = scoreHex; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.roundRect(68, 1625, 944, 110, 32); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#ffffff'; ctx.font = '900 32px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(criticSignature, 540, 1692);
        ctx.fillStyle = '#64748b'; ctx.font = 'bold 26px sans-serif';
        ctx.fillText('cinescore.com.tr', 540, 1835);
        return canvas.toDataURL('image/png');
      };

      // --- TASARIM 3: KLASİK BİLET (YENİ RENK SPEKTRUMUYLA TAM UYUMLU) ---
      const makeTicket = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 1080; canvas.height = 1920;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#07080c'; ctx.fillRect(0, 0, 1080, 1920);

        ctx.fillStyle = '#0d1017'; ctx.strokeStyle = scoreHex; ctx.lineWidth = 6;
        ctx.beginPath(); ctx.roundRect(65, 65, 950, 1790, 40); ctx.fill(); ctx.stroke();

        ctx.fillStyle = '#07080c';
        ctx.beginPath(); ctx.arc(65, 1125, 36, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(1015, 1125, 36, 0, Math.PI * 2); ctx.fill();

        ctx.textAlign = 'center'; ctx.fillStyle = scoreHex; ctx.font = '900 26px sans-serif';
        ctx.fillText(t.ticketHeader || '★ OFFICIAL CRITIC ARCHIVE TICKET ★', 540, 135);
        ctx.fillStyle = '#ffffff'; ctx.font = '900 66px Montserrat, sans-serif';
        ctx.fillText('CINESCORE', 540, 212);

        if (posterImg) {
          ctx.save();
          ctx.beginPath(); ctx.roundRect(135, 255, 810, 670, 28); ctx.clip();
          ctx.drawImage(posterImg, 135, 170, 810, 950);
          ctx.restore();
          ctx.strokeStyle = scoreHex; ctx.lineWidth = 4;
          ctx.beginPath(); ctx.roundRect(135, 255, 810, 670, 28); ctx.stroke();
        }

        ctx.fillStyle = '#ffffff'; ctx.font = '900 48px sans-serif';
        ctx.fillText(titleText.toUpperCase(), 540, 1005);
        ctx.fillStyle = scoreHex; ctx.font = 'bold 28px sans-serif';
        ctx.fillText(`${dirLabel}: ${selectedMovie.director.toUpperCase()} (${selectedMovie.year})`, 540, 1058);

        ctx.setLineDash([18, 14]); ctx.strokeStyle = '#334155'; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(115, 1125); ctx.lineTo(965, 1125); ctx.stroke();
        ctx.setLineDash([]);

        criteriaData.forEach((c, idx) => {
          const y = 1210 + idx * 92;
          const val = Number(myRatingObj.scores?.[c.id] ?? 5);
          const cHex = getScoreColorHex(val);
          ctx.textAlign = 'left'; ctx.fillStyle = '#e2e8f0'; ctx.font = 'bold 28px sans-serif';
          ctx.fillText(c.name.toUpperCase(), 125, y);
          ctx.textAlign = 'right'; ctx.fillStyle = cHex; ctx.font = '900 34px sans-serif';
          ctx.fillText(`${val.toFixed(1)} / 10`, 615, y);
        });

        ctx.save();
        if (isNeonScore) { ctx.shadowColor = '#39ff14'; ctx.shadowBlur = 35; }
        ctx.fillStyle = scoreHex;
        ctx.beginPath(); ctx.roundRect(660, 1175, 285, 395, 32); ctx.fill();
        ctx.restore();

        ctx.fillStyle = '#04060C'; ctx.textAlign = 'center'; ctx.font = '900 24px sans-serif';
        ctx.fillText(scoreTitleLabel, 802, 1255);
        ctx.font = '900 92px sans-serif';
        ctx.fillText(scoreVal, 802, 1395);
        ctx.font = '900 26px sans-serif';
        ctx.fillText(`@${uCode}`, 802, 1500);

        ctx.fillStyle = '#ffffff'; ctx.font = '900 30px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(criticSignature, 540, 1735);
        ctx.fillStyle = '#64748b'; ctx.font = 'bold 24px sans-serif';
        ctx.fillText('CINESCORE.COM.TR', 540, 1795);
        return canvas.toDataURL('image/png');
      };

      // --- TASARIM 4: EDİTORYAL DERGİ KAPAĞI ---
      const makeMagazine = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 1080; canvas.height = 1920;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#0c0f17'; ctx.fillRect(0, 0, 1080, 1920);

        ctx.strokeStyle = '#334155'; ctx.lineWidth = 4;
        ctx.strokeRect(55, 55, 970, 1810);

        ctx.fillStyle = scoreHex;
        ctx.fillRect(95, 95, 890, 52);
        ctx.fillStyle = '#04060C'; ctx.font = '900 26px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(`${t.magazineHeader || 'SPECIAL CRITIC ISSUE'} • #${selectedMovie.year}`, 540, 130);

        ctx.fillStyle = '#ffffff'; ctx.font = '900 108px Montserrat, sans-serif';
        ctx.fillText('CINESCORE', 540, 265);

        if (posterImg) {
          ctx.save();
          ctx.beginPath(); ctx.roundRect(95, 315, 540, 790, 24); ctx.clip();
          ctx.drawImage(posterImg, 95, 315, 540, 790);
          ctx.restore();
          ctx.strokeStyle = scoreHex; ctx.lineWidth = 4;
          ctx.beginPath(); ctx.roundRect(95, 315, 540, 790, 24); ctx.stroke();
        }

        ctx.save();
        if (isNeonScore) { ctx.shadowColor = '#39ff14'; ctx.shadowBlur = 35; }
        ctx.fillStyle = '#111827'; ctx.strokeStyle = scoreHex; ctx.lineWidth = 6;
        ctx.beginPath(); ctx.roundRect(665, 315, 320, 320, 28); ctx.fill(); ctx.stroke();
        ctx.restore();

        ctx.fillStyle = '#94a3b8'; ctx.font = '900 22px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(scoreTitleLabel, 825, 385);
        ctx.fillStyle = scoreHex; ctx.font = '900 104px sans-serif';
        ctx.fillText(scoreVal, 825, 515);
        ctx.fillStyle = '#ffffff'; ctx.font = 'bold 26px sans-serif';
        ctx.fillText('/ 10', 825, 585);

        criteriaData.forEach((c, idx) => {
          const y = 685 + idx * 86;
          const val = Number(myRatingObj.scores?.[c.id] ?? 5);
          const cHex = getScoreColorHex(val);
          ctx.fillStyle = '#111827';
          ctx.beginPath(); ctx.roundRect(665, y, 320, 70, 16); ctx.fill();
          ctx.textAlign = 'left'; ctx.fillStyle = '#cbd5e1'; ctx.font = 'bold 22px sans-serif';
          const scName = c.name.length > 12 ? c.name.substring(0, 11) + '.' : c.name;
          ctx.fillText(scName.toUpperCase(), 688, y + 44);
          ctx.textAlign = 'right'; ctx.fillStyle = cHex; ctx.font = '900 30px sans-serif';
          ctx.fillText(val.toFixed(1), 962, y + 46);
        });

        ctx.textAlign = 'left'; ctx.fillStyle = '#ffffff'; ctx.font = '900 62px sans-serif';
        ctx.fillText(titleText.toUpperCase(), 95, 1215);
        ctx.fillStyle = scoreHex; ctx.font = '900 32px sans-serif';
        ctx.fillText(`${dirLabel}: ${selectedMovie.director.toUpperCase()} (${selectedMovie.year})`, 95, 1275);

        ctx.fillStyle = '#1e293b'; ctx.fillRect(95, 1325, 890, 4);

        ctx.fillStyle = '#111827'; ctx.strokeStyle = scoreHex; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.roundRect(95, 1380, 890, 145, 28); ctx.fill(); ctx.stroke();
        ctx.textAlign = 'center'; ctx.fillStyle = '#ffffff'; ctx.font = '900 36px sans-serif';
        ctx.fillText(criticSignature, 540, 1468);

        ctx.fillStyle = '#64748b'; ctx.font = 'bold 28px sans-serif';
        ctx.fillText('WWW.CINESCORE.COM.TR', 540, 1790);
        return canvas.toDataURL('image/png');
      };

      // --- TASARIM 5: PRİZMA RADAR (BEŞGEN ANALİZ GRAFİKLİ) ---
      const makePrism = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 1080; canvas.height = 1920;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#020409'; ctx.fillRect(0, 0, 1080, 1920);

        const g1 = ctx.createRadialGradient(200, 300, 20, 200, 300, 650);
        g1.addColorStop(0, scoreHex + '40'); g1.addColorStop(1, 'transparent');
        ctx.fillStyle = g1; ctx.fillRect(0, 0, 1080, 1920);

        const g2 = ctx.createRadialGradient(880, 1250, 20, 880, 1250, 650);
        g2.addColorStop(0, scoreHex + '35'); g2.addColorStop(1, 'transparent');
        ctx.fillStyle = g2; ctx.fillRect(0, 0, 1080, 1920);

        ctx.font = '900 50px Montserrat, sans-serif'; ctx.fillStyle = '#ffffff'; ctx.textAlign = 'left';
        ctx.fillText('CINESCORE', 80, 120);
        ctx.font = '900 26px sans-serif'; ctx.fillStyle = scoreHex; ctx.textAlign = 'right';
        ctx.fillText(t.radarHeader || 'CRITICAL RADAR ANALYSIS', 1000, 115);

        ctx.fillStyle = '#090e1a'; ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.roundRect(80, 165, 920, 480, 36); ctx.fill(); ctx.stroke();

        if (posterImg) {
          ctx.save();
          ctx.beginPath(); ctx.roundRect(115, 200, 280, 410, 24); ctx.clip();
          ctx.drawImage(posterImg, 115, 200, 280, 410);
          ctx.restore();
        }

        ctx.textAlign = 'left'; ctx.fillStyle = '#ffffff'; ctx.font = '900 44px sans-serif';
        const shortT2 = rawTitle.length > 18 ? rawTitle.substring(0, 18) + '…' : rawTitle;
        ctx.fillText(shortT2, 430, 275);
        ctx.fillStyle = '#94a3b8'; ctx.font = 'bold 26px sans-serif';
        ctx.fillText(`${selectedMovie.year} • ${selectedMovie.director}`, 430, 325);

        ctx.save();
        if (isNeonScore) { ctx.shadowColor = '#39ff14'; ctx.shadowBlur = 30; }
        ctx.fillStyle = '#04060C'; ctx.strokeStyle = scoreHex; ctx.lineWidth = 6;
        ctx.beginPath(); ctx.roundRect(430, 375, 520, 210, 28); ctx.fill(); ctx.stroke();
        ctx.restore();

        ctx.textAlign = 'center'; ctx.fillStyle = '#94a3b8'; ctx.font = '900 22px sans-serif';
        ctx.fillText(scoreTitleLabel, 690, 425);
        ctx.fillStyle = scoreHex; ctx.font = '900 96px sans-serif';
        ctx.fillText(scoreVal, 690, 535);

        const cx = 540, cy = 1110, maxR = 290;
        [0.25, 0.5, 0.75, 1].forEach(level => {
          ctx.beginPath();
          criteriaData.forEach((_, i) => {
            const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
            const x = cx + maxR * level * Math.cos(angle);
            const y = cy + maxR * level * Math.sin(angle);
            if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
          });
          ctx.closePath();
          ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 3; ctx.stroke();
        });

        criteriaData.forEach((c, i) => {
          const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
          const x = cx + maxR * Math.cos(angle);
          const y = cy + maxR * Math.sin(angle);
          ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x, y);
          ctx.strokeStyle = '#334155'; ctx.lineWidth = 2; ctx.stroke();

          const lx = cx + (maxR + 78) * Math.cos(angle);
          const ly = cy + (maxR + 65) * Math.sin(angle);
          const val = Number(myRatingObj.scores?.[c.id] ?? 5);
          ctx.textAlign = 'center'; ctx.fillStyle = '#e2e8f0'; ctx.font = '900 24px sans-serif';
          ctx.fillText(c.name.toUpperCase(), lx, ly - 12);
          ctx.fillStyle = getScoreColorHex(val); ctx.font = '900 34px sans-serif';
          ctx.fillText(val.toFixed(1), lx, ly + 28);
        });

        ctx.beginPath();
        criteriaData.forEach((c, i) => {
          const val = Number(myRatingObj.scores?.[c.id] ?? 5);
          const r = (val / 10) * maxR;
          const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
          const x = cx + r * Math.cos(angle);
          const y = cy + r * Math.sin(angle);
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        });
        ctx.closePath();
        ctx.fillStyle = scoreHex + '44'; ctx.fill();
        ctx.strokeStyle = scoreHex; ctx.lineWidth = 6; ctx.stroke();

        ctx.fillStyle = '#090e1a'; ctx.strokeStyle = scoreHex; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.roundRect(80, 1630, 920, 115, 32); ctx.fill(); ctx.stroke();
        ctx.textAlign = 'center'; ctx.fillStyle = '#ffffff'; ctx.font = '900 34px sans-serif';
        ctx.fillText(criticSignature, 540, 1700);
        ctx.fillStyle = '#64748b'; ctx.font = 'bold 26px sans-serif';
        ctx.fillText('cinescore.com.tr', 540, 1825);
        return canvas.toDataURL('image/png');
      };

      const imgs = {
        neon: makeNeon(),
        cinema: makeCinema(),
        ticket: makeTicket(),
        magazine: makeMagazine(),
        prism: makePrism()
      };
      setStoryModal({ show: true, generating: false, imageUrl: imgs.neon, activeStyle: 'neon', images: imgs });
    } catch (err) {
      setStoryModal({ show: false, generating: false, imageUrl: null, activeStyle: 'neon', images: {} });
      showToast(t.errorOccurred);
    }
  };

  const searchDropdownRef = useRef(null);
  const langMenuRef = useRef(null);
  const profileMenuRef = useRef(null);
  const notifMenuRef = useRef(null);

const criteriaData = useMemo(() => [
    { id: 'c1', name: t.c1, weight: 30, desc: t.c1Desc },
    { id: 'c2', name: t.c2, weight: 25, desc: t.c2Desc },
    { id: 'c3', name: t.c3, weight: 20, desc: t.c3Desc },
    { id: 'c4', name: t.c4, weight: 15, desc: t.c4Desc },
    { id: 'c5', name: t.c5, weight: 10, desc: t.c5Desc },
  ], [lang]);
  const [scores, setScores] = useState(criteriaData.reduce((acc, c) => ({ ...acc, [c.id]: 5 }), {}));
  const [horrorScores, setHorrorScores] = useState({ scary: 0, jumpscare: 0, gore: 0 }); // YENİ: KORKU ÖZEL PUANLARI

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
      setIsAuthChecking(false);
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
          return data.results?.filter(m => m.poster_path).map(m => ({
            title: m.title,
            poster: `https://image.tmdb.org/t/p/w500${m.poster_path}`,
            backdrop: m.backdrop_path ? `https://image.tmdb.org/t/p/w1280${m.backdrop_path}` : '',
            year: m.release_date ? m.release_date.split('-')[0] : '',
            fullDate: m.release_date || '', 
            overview: m.overview,
            tmdbId: String(m.id)
          })) || [];
        };

        const todayStr = new Date().toISOString().split('T')[0];

        const [trendRes, cultRes, actionRes, dramaRes, trRes, sciFiRes, comedyRes, upcomingRes] = await Promise.all([
          fetchTMDB(`https://api.themoviedb.org/3/trending/movie/week?api_key=${TMDB_API_KEY}&language=${tmdbLang}`),
          fetchTMDB(`https://api.themoviedb.org/3/movie/top_rated?api_key=${TMDB_API_KEY}&language=${tmdbLang}&page=1`),
          fetchTMDB(`https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&with_genres=28&language=${tmdbLang}&sort_by=popularity.desc`),
          fetchTMDB(`https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&with_genres=18&language=${tmdbLang}&sort_by=popularity.desc`),
          fetchTMDB(`https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&with_original_language=tr&sort_by=vote_average.desc&vote_count.gte=100&language=${tmdbLang}`),
          fetchTMDB(`https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&with_genres=878&language=${tmdbLang}&sort_by=popularity.desc`),
          fetchTMDB(`https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&with_genres=35&language=${tmdbLang}&sort_by=popularity.desc`),
          fetchTMDB(`https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&language=${tmdbLang}&primary_release_date.gte=${todayStr}&sort_by=popularity.desc&page=1`)
        ]);

        const nowTime = new Date().getTime();
        const futureOnly = upcomingRes
           .filter(m => m.fullDate && new Date(m.fullDate).getTime() > nowTime)
           .slice(0, 7);
        
        setUpcomingMovies(futureOnly);
        trendRes.length = Math.min(trendRes.length, 20);
        cultRes.length = Math.min(cultRes.length, 20);
        actionRes.length = Math.min(actionRes.length, 20);
        dramaRes.length = Math.min(dramaRes.length, 20);
        trRes.length = Math.min(trRes.length, 20);
        sciFiRes.length = Math.min(sciFiRes.length, 20);
        comedyRes.length = Math.min(comedyRes.length, 20);

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
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(e.target) && !e.target.closest('#mobile-search-box')) setSearchResults([]); 
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

  const handleCustomImageUpload = (e, targetType = 'avatar') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_BYTES = 2 * 1024 * 1024;
    if (file.size > MAX_BYTES) {
      showToast(t.fileSizeLimitError || 'Dosya boyutu maksimum 2 MB olmalıdır!');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxW = targetType === 'avatar' ? 260 : 960;
        const maxH = targetType === 'avatar' ? 260 : 360;

        let width = img.width;
        let height = img.height;

        if (targetType === 'avatar') {
          const size = Math.min(width, height);
          const sx = (width - size) / 2;
          const sy = (height - size) / 2;
          canvas.width = maxW;
          canvas.height = maxH;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, sx, sy, size, size, 0, 0, maxW, maxH);
        } else {
          const ratio = Math.max(maxW / width, maxH / height);
          const sw = maxW / ratio;
          const sh = maxH / ratio;
          const sx = (width - sw) / 2;
          const sy = (height - sh) / 2;
          canvas.width = maxW;
          canvas.height = maxH;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, sx, sy, sw, sh, 0, 0, maxW, maxH);
        }

        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
        if (targetType === 'avatar') {
          setEditAvatar(compressedDataUrl);
        } else {
          setEditBanner(compressedDataUrl);
        }
        showToast(t.imageUploadSuccess || 'Görsel başarıyla yüklendi!');
      };
      img.src = ev.target?.result;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
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
    const url = `${window.location.origin}/user/${uid}`;
    navigator.clipboard.writeText(url).then(() => showToast(t.copied));
  };

  const handleShareList = (e, listId, uidOverride = null) => {
    e.stopPropagation();
    const targetUid = uidOverride || user.uid;
    const url = `${window.location.origin}/user/${targetUid}?list=${listId}`;
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
        const directorCrew = data.credits?.crew?.find(c => c.job === 'Director');
        const director = directorCrew?.name || 'Bilinmiyor';
        const directorId = directorCrew?.id || null;
        const castObjects = (data.credits?.cast || []).slice(0, 5).map(c => ({ id: c.id, name: c.name }));
        const cast = castObjects.map(c => c.name).join(', ') || 'Bilinmiyor';
        
        let trailerKey = null;
        if (data.videos?.results) {
           const trailer = data.videos.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');
           if (trailer) trailerKey = trailer.key;
        }
        
        const releaseTime = data.release_date ? new Date(data.release_date).getTime() : 0;
        const isReleased = releaseTime === 0 || Date.now() > (releaseTime + 86400000);
        
        setSelectedMovie({ 
          id: data.id.toString(), title: data.title, poster, 
          year: data.release_date ? data.release_date.split('-')[0] : '', 
          genre: data.genres?.map(g=>g.name).join(', ') || '', director, directorId, cast, castObjects,
          overview: data.overview || t.noData, trailerKey,
          isReleased, releaseDateStr: data.release_date
        });
        
        setDynamicBg(backdrop); 
        setSearchTerm(''); setSearchResults([]);
        setShowCategoryAverages(false); 
        setIsRatingMode(false);
        setActiveTab('rate');
        window.scrollTo(0, 0);
        
        if (shouldResetScores) {
          const safeMyRatings = Array.isArray(myRatings) ? myRatings : [];
          const existing = safeMyRatings.find(r => r && String(r.id) === String(data.id));
          if(existing && existing.scores) setScores(existing.scores);
          else setScores(criteriaData.reduce((acc, c) => ({ ...acc, [c.id]: 5 }), {}));

          if (existing && existing.horrorScores) setHorrorScores(existing.horrorScores);
          else setHorrorScores({ scary: 0, jumpscare: 0, gore: 0 });
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
      return parseFloat((total / 100).toFixed(2));
    } catch(e) { return 0; }
  };

  const saveRating = async () => {
    if (!user) { setShowLoginModal(true); return; }
    if (!selectedMovie) return;
    setIsSaving(true);
    
    const newFinalScore = Number(calculateFinalScore());
    const docId = String(selectedMovie.id);
    const isHorror = selectedMovie?.genre?.toLowerCase().includes('korku') || selectedMovie?.genre?.toLowerCase().includes('horror');

    try {
      const movieRef = doc(db, 'movies', docId);
      const userRatingRef = doc(db, 'users', user.uid, 'ratings', docId);

      await runTransaction(db, async (trans) => {
        const mDoc = await trans.get(movieRef);
        const uDoc = await trans.get(userRatingRef);
        
        const hasVotedBefore = uDoc.exists();
        const oldFinalScore = hasVotedBefore ? Number(uDoc.data()?.finalScore || 0) : 0;
        const oldScores = hasVotedBefore ? (uDoc.data()?.scores || {}) : {};
        const oldHorror = hasVotedBefore ? (uDoc.data()?.horrorScores || { scary: 0, jumpscare: 0, gore: 0 }) : { scary: 0, jumpscare: 0, gore: 0 };

        if (!mDoc.exists()) {
          const newCatTotals = {};
          criteriaData.forEach(c => newCatTotals[c.id] = scores[c.id] || 0);
          
          trans.set(movieRef, { 
            title: selectedMovie.title, poster: selectedMovie.poster, year: selectedMovie.year, genre: selectedMovie.genre, 
            totalScore: newFinalScore, voteCount: 1, avgScore: newFinalScore, lastUpdated: Date.now(), lastVoteScore: newFinalScore,
            categoryTotals: newCatTotals,
            horrorTotals: isHorror ? { scary: horrorScores.scary, jumpscare: horrorScores.jumpscare, gore: horrorScores.gore, count: 1 } : null
          });
        } else {
          const d = mDoc.data();
          let currentTotal = d.totalScore !== undefined ? Number(d.totalScore) : (Number(d.avgScore || 0) * Number(d.voteCount || 0));
          let currentCount = Number(d.voteCount || 0);
          const currentCatTotals = d.categoryTotals || { c1:0, c2:0, c3:0, c4:0, c5:0 };
          const newCatTotals = { ...currentCatTotals };

          let newHorrorTotals = d.horrorTotals || { scary: 0, jumpscare: 0, gore: 0, count: 0 };
          if (isHorror) {
            if (hasVotedBefore && uDoc.data()?.horrorScores) {
               newHorrorTotals.scary = Math.max(0, newHorrorTotals.scary - oldHorror.scary + horrorScores.scary);
               newHorrorTotals.jumpscare = Math.max(0, newHorrorTotals.jumpscare - oldHorror.jumpscare + horrorScores.jumpscare);
               newHorrorTotals.gore = Math.max(0, newHorrorTotals.gore - (oldHorror.gore || 0) + horrorScores.gore);
            } else {
               newHorrorTotals.scary += horrorScores.scary;
               newHorrorTotals.jumpscare += horrorScores.jumpscare;
               newHorrorTotals.gore += horrorScores.gore;
               newHorrorTotals.count += 1;
            }
          }

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
            totalScore: currentTotal, voteCount: currentCount, avgScore: parseFloat(newAvg.toFixed(2)), 
            lastUpdated: Date.now(), lastVoteScore: newFinalScore,
            categoryTotals: newCatTotals,
            horrorTotals: isHorror ? newHorrorTotals : d.horrorTotals
          });
        }
        
        const ratingDataToSave = { id: docId, title: selectedMovie.title, poster: selectedMovie.poster, scores: scores, finalScore: newFinalScore, date: Date.now(), genre: selectedMovie.genre, year: selectedMovie.year, director: selectedMovie.director || '', directorId: selectedMovie.directorId || null };
        if (isHorror) ratingDataToSave.horrorScores = horrorScores;

        trans.set(userRatingRef, ratingDataToSave);
      });

      const oldBadges = getAllBadges(myRatings, t, safeGlobalMovies).filter(b => b.earned).map(b => b.id);
      const updatedRatingsList = [
        ...myRatings.filter(r => String(r.id) !== docId),
        { id: docId, title: selectedMovie.title, poster: selectedMovie.poster, scores, finalScore: newFinalScore, date: Date.now(), genre: selectedMovie.genre, year: selectedMovie.year, horrorScores: isHorror ? horrorScores : undefined }
      ];
      const newBadges = getAllBadges(updatedRatingsList, t, safeGlobalMovies).filter(b => b.earned);
      const newlyUnlocked = newBadges.filter(b => !oldBadges.includes(b.id));

      if (newlyUnlocked.length > 0) {
        const currentNotifs = userProfile?.notifications || [];
        const badgeNotifs = newlyUnlocked
          .filter(b => !currentNotifs.some(n => n.type === 'badge' && n.badgeId === b.id))
          .map(b => ({
            id: 'notif_badge_' + b.id + '_' + Date.now(),
            type: 'badge',
            badgeId: b.id,
            fromName: `🏆 ${t.newBadgeUnlocked || 'Yeni Rozet:'} ${b.name}`,
            badgeDesc: b.realDesc || b.desc,
            date: Date.now(),
            read: false
          }));

        if (badgeNotifs.length > 0) {
          const updatedNotifs = [...badgeNotifs, ...currentNotifs].slice(0, 20);
          await setDoc(doc(db, 'users', user.uid), { notifications: updatedNotifs }, { merge: true });
          setUserProfile(prev => ({ ...prev, notifications: updatedNotifs }));
        }
        setTimeout(() => {
          setUnlockedBadgeModal(newlyUnlocked[0]);
          showToast(`🏆 ${t.newBadgeUnlocked || 'Yeni Rozet Kazandın:'} ${newlyUnlocked[0].name}!`);
        }, 600);
      }

      if (userProfile?.autoRemoveWatchlist) {
         const isListed = myWatchlist.find(w => w.id === docId);
         if (isListed) await deleteDoc(doc(db, 'users', user.uid, 'watchlist', docId));
      }

      showToast(t.saveRating);
      setIsRatingMode(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) { showToast(t.errorOccurred); } finally { setIsSaving(false); }
  };

  // YENİ: Puan Silme Penceresini Açma
  const deleteRating = (movieId, e) => {
    e.stopPropagation();
    setRatingToDelete(movieId);
  };

  // YENİ: Özel Pencereden Onaylanınca Gerçekten Silme İşlemi (Hatasız Matematik)
  const confirmDeleteRating = async () => {
    if (!user || !ratingToDelete) return;
    setIsDeleting(true);
    const docId = String(ratingToDelete);
    try {
      const movieRef = doc(db, 'movies', docId);
      const userRatingRef = doc(db, 'users', user.uid, 'ratings', docId);
      
      await runTransaction(db, async (trans) => {
         const mDoc = await trans.get(movieRef);
         const uDoc = await trans.get(userRatingRef);
         
         // 1. Önce kullanıcının kendi oyunu veri tabanından siliyoruz.
         // Bu sayede onSnapshot tetiklenir ve senin DNA analizin anında otomatik düzelir.
         if (uDoc.exists()) {
            const oldFinalScore = Number(uDoc.data().finalScore || 0);
            const oldScores = uDoc.data().scores || {};
            trans.delete(userRatingRef);

            // 2. Global filmin ortalamasını düzeltme işlemi
            if (mDoc.exists()) {
               const d = mDoc.data();
               let currentTotal = d.totalScore !== undefined ? Number(d.totalScore) : (Number(d.avgScore || 0) * Number(d.voteCount || 0));
               let currentCount = Number(d.voteCount || 0);
               const currentCatTotals = d.categoryTotals || { c1:0, c2:0, c3:0, c4:0, c5:0 };
               
               let newCount = currentCount - 1;
               
               // EĞER SİLİNEN OY FİLMİN TEK (SON) OYU İSE:
               // Filmi 0 puanlı bırakıp listeyi kirletmek yerine tamamen siliyoruz.
               if (newCount <= 0) {
                  trans.delete(movieRef);
               } else {
                  // EĞER BAŞKA OYLAR VARSA: Matematiği ve kategori ortalamalarını temizce hesapla
                  let newTotal = Math.max(0, currentTotal - oldFinalScore);
                  const newCatTotals = { ...currentCatTotals };
                  criteriaData.forEach(c => {
                    newCatTotals[c.id] = Math.max(0, (Number(currentCatTotals[c.id]) || 0) - (Number(oldScores[c.id]) || 0));
                  });
                  
                  const newAvg = parseFloat((newTotal / newCount).toFixed(2));
                  
                  trans.update(movieRef, {
                    totalScore: newTotal, 
                    voteCount: newCount, 
                    avgScore: newAvg,
                    categoryTotals: newCatTotals
                  });
               }
            }
         }
      });
      showToast(t.ratingDeleted || "Puanınız başarıyla silindi!");
    } catch (err) { showToast(t.errorOccurred); }
    finally { setIsDeleting(false); setRatingToDelete(null); }
  };

  const handleCloseMovie = () => { setSelectedMovie(null); setDynamicBg(''); setActiveTab('home'); };

  // DÜZELTME 1: Liste donduruldu, saniyede bin kere render etmesi engellendi
  // YENİ: Eskiden kalmış 0 oylu hayalet filmleri siteden sonsuza dek gizle
  const safeGlobalMovies = useMemo(() => {
     return Array.isArray(globalMovies) 
       ? globalMovies.filter(m => m && m.id && Number(m.voteCount) > 0) 
       : [];
  }, [globalMovies]);
  
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
  const sortedMyRatings = useMemo(() => getSortedRatings(safeMyRatings, ratingSortType), [myRatings, ratingSortType, safeGlobalMovies]);
  
  const safeViewingUserRatings = Array.isArray(viewingUserRatings) ? viewingUserRatings.filter(r => r && r.id) : [];
  const sortedViewingUserRatings = useMemo(() => getSortedRatings(safeViewingUserRatings, ratingSortType), [viewingUserRatings, ratingSortType, safeGlobalMovies]);

  const sortedWatchlist = useMemo(() => [...(Array.isArray(myWatchlist) ? myWatchlist : [])].sort((a,b) => (Number(b.dateAdded) || 0) - (Number(a.dateAdded) || 0)), [myWatchlist]);

  // YENİ: Dünya sıralamasını da donduruyoruz!
  const sortedGlobalMovies = useMemo(() => {
     return [...safeGlobalMovies].sort((a,b) => {
        if (globalSortType === 'score_desc') return (b.avgScore || 0) - (a.avgScore || 0);
        return (b.voteCount || 0) - (a.voteCount || 0);
     });
  }, [safeGlobalMovies, globalSortType]);

  const calculateDNA = (ratingsList) => {
      const dna = { c1:0, c2:0, c3:0, c4:0, c5:0 };
      if(ratingsList.length > 0) {
         ratingsList.forEach(r => {
            const globalData = safeGlobalMovies.find(m => String(m.id) === String(r.id));
            const globalAvg = globalData ? Number(globalData.avgScore) : Number(r.finalScore);
            const movieScore = Number(r.finalScore);
            
            criteriaData.forEach(c => { 
               const catScore = Number(r.scores?.[c.id]) || 5;
               
               // Bilimsel Anomali: Kategori puanının, Kendi Genel Puanından ve Dünya Ortalamasından Sapması
               const internalDeviation = Math.abs(catScore - movieScore);
               const globalDeviation = Math.abs(catScore - globalAvg);
               
               // Standart 5-5-5-5 verenleri filtrele, uç noktalara (1 veya 10) ağırlık ver
               let extremityMultiplier = (catScore >= 8 || catScore <= 3) ? 1.5 : 1.0;
               
               let anomalyWeight = ((internalDeviation * 1.5) + globalDeviation) * extremityMultiplier;
               
               dna[c.id] += anomalyWeight;
            });
         });
         
         let maxVal = Math.max(...Object.values(dna));
         if (maxVal === 0) maxVal = 1;
         criteriaData.forEach(c => {
            let finalScore = ((dna[c.id] / maxVal) * 10);
            finalScore = Math.max(1.0, Math.min(10.0, finalScore));
            dna[c.id] = parseFloat(finalScore.toFixed(2));
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

  const userDNA = useMemo(() => calculateDNA(sortedMyRatings), [sortedMyRatings, safeGlobalMovies, criteriaData]);
  const { title: zodiacTitle, desc: zodiacDesc } = useMemo(() => getZodiac(userDNA, sortedMyRatings.length), [userDNA, sortedMyRatings.length, lang]);

  const tasteMatchScore = useMemo(() => {
    if (!viewingUser || !myRatings.length || !viewingUserRatings.length) return null;
    const theirMap = new Map(viewingUserRatings.map(tr => [String(tr.id), Number(tr.finalScore) || 0]));
    let commonCount = 0;
    let totalMatch = 0;
    for (let i = 0; i < myRatings.length; i++) {
      const myR = myRatings[i];
      const theirScore = theirMap.get(String(myR.id));
      if (theirScore !== undefined) {
        commonCount++;
        const diff = Math.abs((Number(myR.finalScore) || 0) - theirScore);
        totalMatch += 100 - ((diff / 9) * 100);
      }
    }
    return commonCount === 0 ? null : Math.round(totalMatch / commonCount);
  }, [viewingUser, myRatings, viewingUserRatings]);

  const getTopGenres = (ratingsList) => {
    const counts = {};
    ratingsList.forEach(m => {
      if (m.genre) m.genre.split(', ').forEach(g => { counts[g] = (counts[g] || 0) + 1; });
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 3);
  };
  const topGenres = useMemo(() => getTopGenres(sortedMyRatings), [sortedMyRatings]);
  const topGenresViewing = useMemo(() => getTopGenres(sortedViewingUserRatings), [sortedViewingUserRatings]);

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

  const globalScoreToDisplay = dbSelectedMovieData && dbSelectedMovieData.avgScore ? Number(dbSelectedMovieData.avgScore).toFixed(2) : '?';
  const globalColorToDisplay = dbSelectedMovieData && dbSelectedMovieData.avgScore ? getScoreColorHex(dbSelectedMovieData.avgScore) : '#475569';

  const similarRef = useRef(null);

  useEffect(() => {
    if (activeTab === 'profile_following') loadFollowingUsers();
    if (activeTab === 'profile_followers') loadFollowersUsers();
  }, [activeTab, userProfile]);

  // GERÇEK ROUTING MOTORU (Hash Based) - ÇÖKME HATASI GİDERİLDİ
  useEffect(() => {
     const handleHashChange = () => {
         const hash = window.location.hash.replace('#', '');
         const hashPath = hash.split('?')[0];
         const hashParams = new URLSearchParams(hash.split('?')[1] || '');
         
         if (hashPath.startsWith('/film/')) {
            const id = hashPath.split('/')[2]?.split('-')[0];
            if (id) selectMovieToRate(id, '', false);
         } else if (hashPath === '/siralama') { setActiveTab('global');
         } else if (hashPath === '/topluluk') { setActiveTab('community');
         } else if (hashPath.startsWith('/profil')) {
            if (hashPath === '/profil/takipciler') { loadFollowersUsers(); setActiveTab('profile_followers'); }
            else if (hashPath === '/profil/takip') { loadFollowingUsers(); setActiveTab('profile_following'); }
            else setActiveTab(hashParams.get('sekme') || 'profile_general');
         } else if (hashPath.startsWith('/user/')) {
            const uid = hashPath.split('/')[2];
            if (uid) loadPublicProfile(uid);
         } else if (hashPath.startsWith('/game')) {
            setActiveTab('game');
         } else { setActiveTab('home'); }
     };

     window.addEventListener('hashchange', handleHashChange);
     
     // Sadece sayfa ilk açıldığında 1 kere çalıştır
     const currentHash = window.location.hash;
     if (currentHash && currentHash !== '#/') handleHashChange();

     return () => window.removeEventListener('hashchange', handleHashChange);
  }, []); // DÜZELTME 2: safeGlobalMovies bağımlılığı kaldırıldı, sonsuz döngü bitti!

  // URL SENKRONİZASYONU (Sitede gezerken URL'i kasmadan günceller)
  useEffect(() => {
     let newHash = '#/';
     
     if (activeTab === 'rate' && selectedMovie) {
        const slug = selectedMovie.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        newHash = `#/film/${selectedMovie.id}-${slug}`;
     } else if (activeTab === 'global') {
        newHash = '#/siralama';
     } else if (activeTab === 'community') {
        newHash = '#/topluluk';
     } else if (activeTab === 'profile_followers') {
        newHash = '#/profil/takipciler';
     } else if (activeTab === 'profile_following') {
        newHash = '#/profil/takip';
     } else if (activeTab.startsWith('profile_') && !activeTab.startsWith('public_')) {
        newHash = `#/profil?sekme=${activeTab}`;
     } else if (activeTab === 'public_profile' && viewingUser) {
        newHash = `#/user/${viewingUser.uid}`;
     } else if (activeTab === 'public_profile_ratings' && viewingUser) {
        newHash = `#/user/${viewingUser.uid}?sekme=ratings`;
     } else if (activeTab === 'game') {
        newHash = '#/game';
     }
     
     const currentHash = window.location.hash || '#/';
     if (currentHash !== newHash) {
        window.history.pushState(null, '', newHash);
     }

     // YENİ: Hangi sekmeye geçilirse geçilsin sayfa her zaman en yukarıda başlar
     window.scrollTo(0, 0);
  }, [activeTab, selectedMovie, viewingUser]);

  return (
    <div style={{ "--theme-color": themeColor, "--theme-color-50": themeColor+"80", "--theme-color-20": themeColor+"33" }} className="min-h-screen bg-[#030408] text-slate-300 font-sans relative overflow-x-hidden selection:bg-slate-200 selection:text-black">
      
      {/* SAĞDAN VE SOLDAN ÇİFT TARAFLI AURA SPOT IŞIKLI ARKA PLAN */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-[#020409] cyber-grid-bg overflow-hidden">
        {/* SOL AURA SPOT IŞIĞI */}
        <div 
          className="absolute -left-24 top-[8%] w-[420px] sm:w-[680px] h-[520px] sm:h-[780px] rounded-full blur-[120px] opacity-35 transition-colors duration-700"
          style={{ background: `radial-gradient(circle, ${themeColor} 0%, transparent 70%)` }}
        ></div>
        {/* SAĞ AURA SPOT IŞIĞI */}
        <div 
          className="absolute -right-24 top-[8%] w-[420px] sm:w-[680px] h-[520px] sm:h-[780px] rounded-full blur-[120px] opacity-35 transition-colors duration-700"
          style={{ background: `radial-gradient(circle, ${themeColor} 0%, transparent 70%)` }}
        ></div>
        {/* ALT VE ÜST SİNEMATİK DERİNLİK IŞIĞI */}
        <div 
          className="absolute left-1/2 -translate-x-1/2 -top-32 w-[80%] h-[320px] rounded-full blur-[130px] opacity-20"
          style={{ background: `linear-gradient(90deg, ${themeColor}, #38bdf8, ${themeColor})` }}
        ></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_95%,_rgba(99,102,241,0.14),_transparent_55%)]"></div>
        {dynamicBg && (
           <>
             <img src={dynamicBg} className="w-full h-full object-cover opacity-15 scale-105" style={{ filter: 'blur(20px) saturate(1.2)' }} alt="bg"/>
             <div className="absolute inset-0 bg-gradient-to-b from-[#030408]/60 via-[#030408]/90 to-[#030408]"></div>
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
        <div className="fixed inset-0 z-[220] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#03050A] border-2 border-slate-700 w-full max-w-lg rounded-lg shadow-[12px_12px_0px_rgba(0,0,0,1)] flex flex-col max-h-[88vh] overflow-hidden">
            
            {/* SABİT ÜST BAR */}
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b-2 border-slate-700 bg-[#03050A] shrink-0">
              <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2.5 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                <Settings size={20} style={{ color: editAura || themeColor }}/> {t.editProfile}
              </h3>
              <button
                type="button"
                onClick={() => setShowProfileModal(false)}
                className="w-9 h-9 rounded-sm bg-[#03050A] border-2 border-slate-700 hover:border-white text-slate-300 hover:text-white flex items-center justify-center transition-colors shadow-[2px_2px_0px_rgba(0,0,0,1)] magnetic-btn"
              >
                <X size={18}/>
              </button>
            </div>

            {/* KAYDIRILABİLİR İÇERİK ALANI */}
            <form onSubmit={handleUpdateProfile} className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1 hide-scrollbar">
              
              {/* CANLI MİNİ PROFİL ÖNİZLEMESİ */}
              <div className="relative rounded-lg overflow-hidden border-2 border-slate-700 bg-[#03050A] shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                <div className="h-24 sm:h-28 w-full relative">
                  <img src={editBanner || BANNER_PRESETS[0]} className="w-full h-full object-cover opacity-80" alt="Banner Preview"/>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#03050A] via-[#03050A]/40 to-transparent"></div>
                </div>
                <div className="px-4 pb-3.5 -mt-10 relative flex items-end gap-3.5">
                  <img
                    src={editAvatar || AVATAR_DEFAULT}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-sm object-cover border-2 bg-[#03050A] shrink-0 shadow-[2px_2px_0px_rgba(0,0,0,1)]"
                    style={{ borderColor: editAura || themeColor }}
                    alt="Avatar Preview"
                  />
                  <div className="min-w-0 flex-1 pb-0.5">
                    <h4 className="text-base sm:text-lg font-black text-white truncate drop-shadow-[1px_1px_0px_rgba(0,0,0,1)]">{editName || 'Sinefil'}</h4>
                    {editBio && <p className="text-xs italic truncate font-bold" style={{ color: editAura || themeColor }}>"{editBio}"</p>}
                  </div>
                </div>
              </div>

              {/* İSİM VE MOTTO (BİO) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] text-slate-400 font-black uppercase mb-1.5 block tracking-wider">{t.username}</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    autoComplete="name"
                    className="w-full bg-[#03050A] border-2 border-slate-700 px-3.5 py-3 rounded-sm text-sm text-white outline-none focus:border-theme shadow-[inset_4px_4px_0px_rgba(0,0,0,0.5)] font-bold transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 font-black uppercase mb-1.5 block tracking-wider">{t.bioLabel}</label>
                  <input
                    type="text"
                    value={editBio}
                    onChange={e => setEditBio(e.target.value)}
                    placeholder={t.bioPlaceholder}
                    maxLength={60}
                    className="w-full bg-[#03050A] border-2 border-slate-700 px-3.5 py-3 rounded-sm text-sm text-white outline-none focus:border-theme shadow-[inset_4px_4px_0px_rgba(0,0,0,0.5)] font-bold italic transition-colors"
                  />
                </div>
              </div>

              {/* AURA TEMA RENGİ */}
              <div>
                <label className="text-[11px] text-slate-400 font-black uppercase mb-2 block tracking-wider">{t.auraColor}</label>
                <div className="flex flex-wrap gap-2.5 bg-[#03050A] p-3 rounded-sm border-2 border-slate-700 shadow-[inset_4px_4px_0px_rgba(0,0,0,0.5)]">
                  {AURA_COLORS.map(color => (
                    <button
                      type="button"
                      key={color}
                      onClick={() => setEditAura(color)}
                      className={`w-8 h-8 rounded-sm border-2 transition-transform magnetic-btn ${editAura === color ? 'scale-110 shadow-[2px_2px_0px_rgba(0,0,0,1)]' : 'opacity-55 hover:opacity-100 shadow-[2px_2px_0px_rgba(0,0,0,1)]'}`}
                      style={{ backgroundColor: color, borderColor: editAura === color ? '#ffffff' : 'transparent' }}
                    />
                  ))}
                </div>
              </div>

              {/* PROFİL FOTOĞRAFI */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] text-slate-400 font-black uppercase tracking-wider">{t.selectAvatar}</label>
                  <label className="cursor-pointer px-3 py-1.5 rounded-sm bg-[#03050A] text-theme border-2 border-slate-700 shadow-[2px_2px_0px_rgba(0,0,0,1)] magnetic-btn text-[11px] font-black flex items-center gap-1.5 transition-colors hover:border-theme">
                    <Plus size={13}/> {t.uploadFromDevice || 'Cihazdan Yükle (Maks 2MB)'}
                    <input type="file" accept="image/*" onChange={(e) => handleCustomImageUpload(e, 'avatar')} className="hidden" />
                  </label>
                </div>
                <div className="grid grid-cols-5 gap-2.5 max-h-28 overflow-y-auto p-2 bg-[#03050A] rounded-sm border-2 border-slate-700 shadow-[inset_4px_4px_0px_rgba(0,0,0,0.5)] hide-scrollbar">
                  {AVATAR_PRESETS.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      onClick={() => setEditAvatar(url)}
                      className={`w-full aspect-square rounded-sm cursor-pointer border-2 transition-all object-cover ${
                        editAvatar === url ? 'border-theme scale-105 shadow-[2px_2px_0px_rgba(0,0,0,1)]' : 'border-slate-700 opacity-60 hover:opacity-100 hover:border-slate-500'
                      }`}
                      alt="Avatar"
                    />
                  ))}
                </div>
              </div>

              {/* ARKA PLAN / BANNER */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] text-slate-400 font-black uppercase tracking-wider">{t.selectBanner}</label>
                  <label className="cursor-pointer px-3 py-1.5 rounded-sm bg-[#03050A] text-theme border-2 border-slate-700 shadow-[2px_2px_0px_rgba(0,0,0,1)] magnetic-btn text-[11px] font-black flex items-center gap-1.5 transition-colors hover:border-theme">
                    <Plus size={13}/> {t.uploadFromDevice || 'Cihazdan Yükle (Maks 2MB)'}
                    <input type="file" accept="image/*" onChange={(e) => handleCustomImageUpload(e, 'banner')} className="hidden" />
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-2.5 max-h-32 overflow-y-auto p-2 bg-[#03050A] rounded-sm border-2 border-slate-700 shadow-[inset_4px_4px_0px_rgba(0,0,0,0.5)] hide-scrollbar">
                  {BANNER_PRESETS.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      onClick={() => setEditBanner(url)}
                      className={`w-full h-14 rounded-sm cursor-pointer border-2 transition-all object-cover ${
                        editBanner === url ? 'border-theme scale-[1.02] shadow-[2px_2px_0px_rgba(0,0,0,1)]' : 'border-slate-700 opacity-55 hover:opacity-100 hover:border-slate-500'
                      }`}
                      alt="Banner"
                    />
                  ))}
                </div>
              </div>

              {/* OTOMATİK İZLEME LİSTESİNDEN KALDIRMA AYARI */}
              <div className="flex items-center justify-between p-4 bg-[#03050A] border-2 border-slate-700 rounded-sm shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                <div className="pr-3">
                  <h4 className="text-xs sm:text-sm font-black text-white">{t.autoRemoveSetting}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{t.autoRemoveDesc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input type="checkbox" checked={editAutoRemove} onChange={() => setEditAutoRemove(!editAutoRemove)} className="sr-only peer"/>
                  <div className="w-12 h-6 bg-slate-800 border-2 border-slate-600 rounded-sm peer peer-checked:border-theme peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-2 after:border-black after:rounded-sm after:h-5 after:w-5 after:transition-all peer-checked:bg-theme shadow-[inset_2px_2px_0px_rgba(0,0,0,0.5)]"></div>
                </label>
              </div>

              {/* KAYDET BUTONU */}
              <button
                type="submit"
                className="w-full bg-theme text-[#03050A] font-black py-4 rounded-sm transition-all border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] magnetic-btn text-base uppercase tracking-wider"
              >
                {t.saveChanges}
              </button>
            </form>
          </div>
        </div>
      )}

      {showNewListModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#03050A] border-2 border-slate-700 w-full max-w-sm rounded-lg p-8 relative shadow-[12px_12px_0px_rgba(0,0,0,1)]">
            <button onClick={() => setShowNewListModal(false)} className="absolute top-4 right-4 p-2 bg-[#03050A] rounded-sm border-2 border-slate-700 text-slate-400 hover:text-white hover:border-white shadow-[2px_2px_0px_rgba(0,0,0,1)] magnetic-btn"><X size={18}/></button>
            <h3 className="text-xl font-black text-white mb-6 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">{t.createNewList}</h3>
            <form onSubmit={createCustomList} className="space-y-5">
               <input type="text" value={newListName} onChange={e=>setNewListName(e.target.value)} placeholder={t.listNamePlaceholder} className="w-full bg-[#03050A] border-2 border-slate-700 p-3.5 rounded-sm text-white outline-none focus:border-theme shadow-[inset_4px_4px_0px_rgba(0,0,0,0.5)] font-bold transition-colors" required/>
               <button type="submit" className="w-full bg-theme text-[#03050A] font-black p-4 rounded-sm border-2 border-black transition-all shadow-[4px_4px_0px_rgba(0,0,0,1)] magnetic-btn text-base uppercase">{t.add}</button>
            </form>
          </div>
        </div>
      )}

      {showAddToListModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#03050A] border-2 border-slate-700 w-full max-w-sm rounded-lg p-6 relative shadow-[12px_12px_0px_rgba(0,0,0,1)]">
            <button onClick={() => setShowAddToListModal(false)} className="absolute top-4 right-4 p-2 bg-[#03050A] rounded-sm border-2 border-slate-700 text-slate-400 hover:text-white hover:border-white shadow-[2px_2px_0px_rgba(0,0,0,1)] magnetic-btn"><X size={18}/></button>
            <h3 className="text-lg font-black text-white mb-4 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">{t.selectList}</h3>
            <div className="space-y-3 mb-5 max-h-60 overflow-y-auto hide-scrollbar">
               {customLists.map(list => (
                 <button key={list.id} onClick={() => addMovieToCustomList(list.id)} className="w-full text-left p-3.5 bg-[#03050A] border-2 border-slate-700 rounded-sm hover:border-theme transition-colors font-bold text-white flex items-center justify-between shadow-[4px_4px_0px_rgba(0,0,0,1)] magnetic-btn">
                   {list.name} <Plus size={18} className="text-theme"/>
                 </button>
               ))}
               {customLists.length === 0 && <p className="text-sm text-slate-500 font-bold text-center py-4">{t.emptyWatchlist}</p>}
            </div>
            <button onClick={() => {setShowAddToListModal(false); setShowNewListModal(true);}} className="w-full py-3.5 border-2 border-slate-700 text-slate-300 hover:border-white hover:text-white bg-[#03050A] rounded-sm font-black transition-colors text-sm shadow-[4px_4px_0px_rgba(0,0,0,1)] magnetic-btn uppercase">{t.createNewList}</button>
          </div>
        </div>
      )}
      
      {/* 1. YÖNETMEN & OYUNCU KARİYER KARNESİ PENCERESİ */}
      {personModal.show && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-[#03050A] border-2 border-slate-700 w-full max-w-3xl rounded-lg p-6 sm:p-8 relative shadow-[12px_12px_0px_rgba(0,0,0,1)] max-h-[88vh] overflow-y-auto hide-scrollbar">
            <button onClick={() => setPersonModal({ show: false, loading: false, data: null })} className="absolute top-4 right-4 p-2 bg-[#03050A] rounded-sm border-2 border-slate-700 text-slate-400 hover:text-white hover:border-white shadow-[2px_2px_0px_rgba(0,0,0,1)] magnetic-btn"><X size={20}/></button>
            {personModal.loading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-theme"/>
              </div>
            ) : personModal.data && (
              <div>
                <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b-2 border-slate-800">
                  {personModal.data.photo ? (
                    <img src={personModal.data.photo} className="w-24 h-24 sm:w-28 sm:h-28 rounded-sm object-cover border-2 border-theme shadow-[4px_4px_0px_var(--theme-color-50)] shrink-0" alt=""/>
                  ) : (
                    <div className="w-24 h-24 rounded-sm bg-[#03050A] border-2 border-slate-700 flex items-center justify-center text-slate-500 shrink-0 shadow-[4px_4px_0px_rgba(0,0,0,1)]"><User size={40}/></div>
                  )}
                  <div className="text-center sm:text-left flex-1">
                    <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-sm border-2 border-black bg-theme text-[#03050A] shadow-[2px_2px_0px_rgba(0,0,0,1)]">{personModal.data.role} • {t.careerCard}</span>
                    <h3 className="text-2xl sm:text-4xl font-black text-white mt-3 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">{personModal.data.name}</h3>
                    <div className="flex flex-wrap justify-center sm:justify-start gap-4 mt-4">
                      <div className="bg-[#03050A] border-2 border-slate-700 px-4 py-2.5 rounded-sm shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                        <span className="text-[10px] font-black text-slate-400 uppercase block">{t.cineScoreCareerAvg}</span>
                        <span className="text-xl font-black drop-shadow-[1px_1px_0px_rgba(0,0,0,1)]" style={{color: personModal.data.globalAvg ? getScoreColorHex(personModal.data.globalAvg) : '#64748b'}}>
                          {personModal.data.globalAvg ? `${personModal.data.globalAvg} (${personModal.data.globalRatedCount})` : '—'}
                        </span>
                      </div>
                      <div className="bg-[#03050A] border-2 border-slate-700 px-4 py-2.5 rounded-sm shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                        <span className="text-[10px] font-black text-slate-400 uppercase block">{t.yourCareerAvg}</span>
                        <span className="text-xl font-black drop-shadow-[1px_1px_0px_rgba(0,0,0,1)]" style={{color: personModal.data.myAvg ? getScoreColorHex(personModal.data.myAvg) : '#64748b'}}>
                          {personModal.data.myAvg ? `${personModal.data.myAvg} (${personModal.data.myRatedCount})` : '—'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mt-6 mb-4">{t.knownFor}</h4>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                  {personModal.data.movies.map(m => (
                    <div key={m.id} onClick={() => { setPersonModal({ show: false, loading: false, data: null }); selectMovieToRate(m.id, m.title); }} className="cursor-pointer group">
                      <img src={m.poster} className="w-full aspect-[2/3] object-cover rounded-sm border-2 border-slate-800 group-hover:border-theme transition-all shadow-[4px_4px_0px_rgba(0,0,0,1)] group-hover:shadow-[6px_6px_0px_var(--theme-color-50)] group-hover:-translate-y-1 group-hover:-translate-x-1" alt=""/>
                      <p className="text-xs font-bold text-slate-300 group-hover:text-theme truncate mt-2 drop-shadow-[1px_1px_0px_rgba(0,0,0,1)]">{m.title}</p>
                      <span className="text-[10px] text-slate-500 font-black">{m.year}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* YENİ: BÜYÜK 3D MADALYON ROZET KUTLAMA PENCERESİ */}
      {unlockedBadgeModal && (
        <div className="fixed inset-0 z-[180] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className={`w-full max-w-sm rounded-lg p-6 sm:p-8 relative text-center border-2 border-amber-400 bg-[#03050A] shadow-[12px_12px_0px_rgba(0,0,0,1)] animate-in zoom-in-95 duration-300 overflow-hidden`}>
            
            {/* Arka Plan Işık Halesi */}
            <div className={`absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-gradient-to-r ${unlockedBadgeModal.orbBg || 'from-amber-400 to-orange-500'} opacity-20 blur-3xl pointer-events-none`}></div>

            <button
              onClick={() => setUnlockedBadgeModal(null)}
              className="absolute top-4 right-4 p-2 bg-[#03050A] rounded-sm border-2 border-slate-700 text-slate-300 hover:text-white hover:border-white shadow-[2px_2px_0px_rgba(0,0,0,1)] z-20 transition-colors magnetic-btn"
            >
              <X size={18}/>
            </button>

            <span className={`inline-block text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-sm border-2 mb-4 relative z-10 shadow-[2px_2px_0px_rgba(0,0,0,1)] ${unlockedBadgeModal.badgePill || 'bg-[#03050A] text-amber-400 border-amber-500'}`}>
              🏆 {t.newBadgeUnlocked || 'YENİ ROZET KAZANDIN!'}
            </span>

            {/* Orta Dev 3D Madalyon (Neo Brutalist Versiyon) */}
            <div className="relative my-6 flex items-center justify-center z-10">
              <div className={`absolute w-28 h-28 rounded-sm bg-gradient-to-r ${unlockedBadgeModal.orbBg || 'from-amber-400 to-orange-500'} opacity-35 blur-xl animate-pulse`}></div>
              <div className={`relative w-24 h-24 sm:w-28 sm:h-28 rounded-sm flex items-center justify-center border-2 border-white/50 bg-gradient-to-br ${unlockedBadgeModal.orbBg || 'from-amber-400 to-orange-500'} shadow-[6px_6px_0px_rgba(0,0,0,1)] badge-emblem-float`}>
                <div className="scale-150 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                  {unlockedBadgeModal.icon}
                </div>
              </div>
            </div>

            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1.5 relative z-10">
              {unlockedBadgeModal.tier || 'ÖZEL BAŞARIM'}
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white mb-3 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] relative z-10">
              {unlockedBadgeModal.name}
            </h3>
            <p className="text-xs sm:text-sm font-bold text-slate-300 leading-relaxed mb-6 px-2 relative z-10">
              {unlockedBadgeModal.realDesc || unlockedBadgeModal.desc}
            </p>

            <button
              onClick={() => setUnlockedBadgeModal(null)}
              className="w-full py-4 rounded-sm border-2 border-black bg-white hover:bg-slate-200 text-[#03050A] font-black text-base shadow-[4px_4px_0px_rgba(0,0,0,1)] magnetic-btn transition-transform relative z-10 uppercase tracking-wider"
            >
              Harika!
            </button>
          </div>
        </div>
      )}

      {/* 2. SADELEŞTİRİLMİŞ PROJEKSİYON CİHAZLI & 7 SANİYELİK SİNEMA RULETİ */}
      {rouletteModal.show && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-3 sm:p-4 bg-black/95 overflow-y-auto">
          <div className="bg-[#03050A] border-2 border-slate-700 w-full max-w-xl rounded-lg p-4 sm:p-8 relative shadow-[12px_12px_0px_rgba(0,0,0,1)] text-center overflow-hidden my-auto">
            
            <button onClick={closeCinemaRoulette} className="absolute top-4 right-4 p-2 bg-[#03050A] rounded-sm text-slate-400 hover:text-white hover:border-white border-2 border-slate-700 shadow-[2px_2px_0px_rgba(0,0,0,1)] z-40 magnetic-btn transition-colors">
              <X size={18}/>
            </button>

            <div className="mb-4 sm:mb-5">
              <h3 className="text-xl sm:text-3xl font-black text-white flex items-center justify-center gap-3 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                <Film className="text-theme" size={24}/> {t.rouletteTitle}
              </h3>
              <p className="text-[10px] sm:text-xs font-bold text-slate-400 max-w-md mx-auto mt-2 leading-snug">
                {t.rouletteDesc}
              </p>
            </div>

            {/* 1. BÖLÜM: ÜST SİNEMA PERDESİ */}
            <div className="relative mx-auto w-full h-36 sm:h-44 rounded-sm bg-[#010103] border-2 border-slate-800 shadow-[inset_4px_4px_0px_rgba(0,0,0,1)] flex items-center justify-center overflow-hidden mb-2">
              <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-rose-950 via-rose-800 to-rose-950 opacity-80"></div>
              
              <div
                className="absolute inset-0 pointer-events-none transition-opacity duration-500"
                style={{
                  background: `radial-gradient(circle at 50% 100%, ${themeColor}${rouletteModal.winner ? '55' : rouletteModal.spinning ? '30' : '12'}, transparent 75%)`
                }}
              ></div>

              {rouletteModal.spinning ? (
                <div className="flex flex-col items-center justify-center gap-2 relative z-10 px-4">
                  <div className="px-3 py-1.5 rounded-sm border-2 border-theme bg-[#03050A] text-theme text-[10px] sm:text-xs font-black uppercase tracking-widest animate-pulse shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                    📽️ {t.rouletteSpinning}
                  </div>
                </div>
              ) : rouletteModal.winner ? (
                <div className="flex items-center gap-3.5 sm:gap-5 px-4 sm:px-6 py-2 w-full relative z-10 animate-in zoom-in-95 duration-300">
                  <img
                    src={rouletteModal.winner.poster}
                    className="w-16 sm:w-22 aspect-[2/3] object-cover rounded-sm border-2 border-theme shadow-[4px_4px_0px_var(--theme-color-50)] shrink-0"
                    alt=""
                  />
                  <div className="text-left min-w-0 flex-1">
                    <span className="inline-block text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-sm border-2 border-black bg-theme text-[#03050A] mb-1 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                      ★ {t.roulettePicked || 'Kaderin Seçimi!'}
                    </span>
                    <h4 className="text-sm sm:text-xl font-black text-white leading-tight line-clamp-2 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                      {localizedData?.[rouletteModal.winner.id]?.title || rouletteModal.winner.title}
                    </h4>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 px-6 text-slate-400 relative z-10">
                  <Sparkles size={24} className="text-theme"/>
                  <span className="text-[11px] sm:text-xs font-black text-slate-300 drop-shadow-[1px_1px_0px_rgba(0,0,0,1)]">
                    {t.rouletteReadyText || 'Makara hazır! Filmini seçmek için çarkı çevir.'}
                  </span>
                </div>
              )}
            </div>

            {/* 2. BÖLÜM: PROJEKSİYON MERCEĞİNDEN PERDEYE VURAN IŞIK HUZMESİ */}
            <div className="relative h-6 sm:h-8 w-full flex justify-center items-center pointer-events-none">
              <div
                className={`w-44 sm:w-56 h-full transition-opacity duration-300 ${rouletteModal.spinning || rouletteModal.winner ? 'opacity-80' : 'opacity-25'}`}
                style={{
                  background: `linear-gradient(to top, ${themeColor}88, ${themeColor}05)`,
                  clipPath: 'polygon(40% 100%, 60% 100%, 100% 0%, 0% 0%)'
                }}
              ></div>
            </div>

            {/* 3. BÖLÜM: SİNEMA PROJEKSİYON CİHAZI GÖVDESİ */}
            <div className="relative rounded-lg bg-[#03050A] border-2 border-slate-700 p-3 sm:p-4 shadow-[6px_6px_0px_rgba(0,0,0,1)] mb-6">
              
              <div className="flex items-end justify-between px-3 sm:px-8 mb-2">
                <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#05070C] border-2 border-slate-500 flex items-center justify-center relative shadow-[inset_2px_2px_0px_rgba(0,0,0,1)] ${rouletteModal.animate ? 'run-spool-7s' : ''}`}>
                  <div className="absolute inset-1.5 rounded-full border-2 border-dashed border-slate-600"></div>
                  <div className="w-full h-1 bg-slate-600 absolute"></div>
                  <div className="w-full h-1 bg-slate-600 absolute rotate-60"></div>
                  <div className="w-full h-1 bg-slate-600 absolute -rotate-60"></div>
                  <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-slate-300 border-2 border-black z-10"></div>
                </div>

                <div
                  className="w-16 sm:w-24 h-4 rounded-t-sm border-t-2 border-x-2 shadow-[inset_0_2px_5px_rgba(0,0,0,0.5)]"
                  style={{ borderColor: themeColor, backgroundColor: `${themeColor}25` }}
                ></div>

                <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#05070C] border-2 border-slate-500 flex items-center justify-center relative shadow-[inset_2px_2px_0px_rgba(0,0,0,1)] ${rouletteModal.animate ? 'run-spool-7s' : ''}`}>
                  <div className="absolute inset-1.5 rounded-full border-2 border-dashed border-slate-600"></div>
                  <div className="w-full h-1 bg-slate-600 absolute"></div>
                  <div className="w-full h-1 bg-slate-600 absolute rotate-60"></div>
                  <div className="w-full h-1 bg-slate-600 absolute -rotate-60"></div>
                  <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-slate-300 border-2 border-black z-10"></div>
                </div>
              </div>

              <div className="relative w-full h-40 sm:h-44 bg-[#03050A] rounded-sm border-y-4 border-slate-600 overflow-hidden select-none shadow-[inset_4px_4px_0px_rgba(0,0,0,1)]">
                <div className="absolute top-1 inset-x-0 h-2.5 film-sprockets z-20 opacity-85"></div>
                <div className="absolute bottom-1 inset-x-0 h-2.5 film-sprockets z-20 opacity-85"></div>
                <div className="absolute inset-y-0 left-0 w-10 sm:w-20 bg-gradient-to-r from-[#03050A] via-[#03050A]/80 to-transparent z-20 pointer-events-none"></div>
                <div className="absolute inset-y-0 right-0 w-10 sm:w-20 bg-gradient-to-l from-[#03050A] via-[#03050A]/80 to-transparent z-20 pointer-events-none"></div>

                <div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[118px] h-[142px] rounded-sm border-[4px] z-30 pointer-events-none"
                  style={{ borderColor: themeColor, boxShadow: `0 0 25px ${themeColor}66` }}
                ></div>

                <div
                  key={rouletteModal.strip?.[0]?.reelKey || 'init'}
                  className={`absolute top-1/2 left-1/2 flex items-center gap-4 ${rouletteModal.animate ? 'run-reel-7s' : ''}`}
                  style={!rouletteModal.animate ? { transform: `translate3d(${rouletteModal.offsetPx ?? -56}px, -50%, 0)` } : undefined}
                >
                  {(rouletteModal.strip || []).map((item) => (
                    <div
                      key={item.reelKey}
                      className="w-28 h-32 rounded-sm overflow-hidden bg-[#03050A] border-2 border-slate-700 shrink-0 shadow-[2px_2px_0px_rgba(0,0,0,1)]"
                    >
                      <img src={item.fastPoster || item.poster} decoding="async" className="w-full h-full object-cover" alt=""/>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 4. BÖLÜM: KONTROL BUTONLARI */}
            {!rouletteModal.winner && !rouletteModal.spinning ? (
              <button
                onClick={spinCinemaRoulette}
                className="w-full py-4 bg-theme text-[#03050A] rounded-sm border-2 border-black font-black text-base sm:text-lg flex items-center justify-center gap-2 shadow-[6px_6px_0px_rgba(0,0,0,1)] magnetic-btn uppercase tracking-wider"
              >
                <Sparkles size={20}/> {t.spinWheelBtn || 'Çarkı Çevir'}
              </button>
            ) : (
              <div className="flex gap-4 w-full">
                <button
                  onClick={spinCinemaRoulette}
                  disabled={rouletteModal.spinning}
                  className="flex-1 py-4 bg-[#03050A] disabled:opacity-40 text-slate-300 hover:text-white rounded-sm border-2 border-slate-700 hover:border-white font-black text-sm sm:text-base transition-colors shadow-[4px_4px_0px_rgba(0,0,0,1)] magnetic-btn uppercase tracking-wider"
                >
                  {rouletteModal.spinning ? t.rouletteSpinning : t.spinAgain}
                </button>
                <button
                  onClick={() => {
                    const w = rouletteModal.winner;
                    if (!w) return;
                    closeCinemaRoulette();
                    selectMovieToRate(w.id, w.title);
                  }}
                  disabled={rouletteModal.spinning || !rouletteModal.winner}
                  className="flex-1 py-4 bg-theme disabled:opacity-35 text-[#03050A] rounded-sm border-2 border-black font-black text-sm sm:text-base transition-colors shadow-[4px_4px_0px_rgba(0,0,0,1)] magnetic-btn uppercase tracking-wider"
                >
                  {t.goToMovie}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. 9:16 HİKAYE (STORY) KARTI ÖNİZLEME VE 5 TASARIM SEÇİM PENCERESİ */}
      {storyModal.show && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-[#03050A] border-2 border-slate-700 w-full max-w-md rounded-lg p-6 sm:p-8 relative shadow-[12px_12px_0px_rgba(0,0,0,1)] text-center">
            <button onClick={() => setStoryModal({ show: false, generating: false, imageUrl: null, activeStyle: 'neon', images: {} })} className="absolute top-4 right-4 p-2 bg-[#03050A] rounded-sm text-slate-400 hover:text-white border-2 border-slate-700 hover:border-white shadow-[2px_2px_0px_rgba(0,0,0,1)] magnetic-btn z-10"><X size={18}/></button>
            <h3 className="text-xl font-black text-white mb-4 flex items-center justify-center gap-2 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]"><Share2 className="text-theme" size={20}/> {t.createStory}</h3>
            
            {storyModal.generating ? (
              <div className="py-24 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-10 h-10 animate-spin text-theme"/>
                <p className="text-xs font-bold text-slate-400">{t.storyGenerating}</p>
              </div>
            ) : storyModal.imageUrl && (
              <div className="flex flex-col items-center">
                {/* 5 TASARIM SEÇİCİ SEKMELER */}
                <div className="grid grid-cols-3 sm:grid-cols-5 w-full bg-[#03050A] p-2 rounded-sm border-2 border-slate-800 shadow-[inset_4px_4px_0px_rgba(0,0,0,0.5)] mb-5 gap-1.5">
                  {[
                    { key: 'neon', label: t.storyStyle1 || 'Neon Aura' },
                    { key: 'cinema', label: t.storyStyle2 || 'Sinematik' },
                    { key: 'ticket', label: t.storyStyle3 || 'Klasik Bilet' },
                    { key: 'magazine', label: t.storyStyle4 || 'Dergi Kapağı' },
                    { key: 'prism', label: t.storyStyle5 || 'Prizma Radar' }
                  ].map(st => (
                    <button
                      key={st.key}
                      onClick={() => setStoryModal(prev => ({ ...prev, activeStyle: st.key, imageUrl: prev.images[st.key] }))}
                      className={`py-2 px-1.5 rounded-sm text-[10px] font-black transition-all border-2 truncate magnetic-btn ${storyModal.activeStyle === st.key ? 'bg-theme text-[#03050A] border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]' : 'bg-[#03050A] border-slate-700 text-slate-400 hover:text-white shadow-[1px_1px_0px_rgba(0,0,0,1)]'}`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>

                <img src={storyModal.imageUrl} className="w-52 sm:w-64 aspect-[9/16] object-contain rounded-sm border-2 border-slate-700 shadow-[6px_6px_0px_rgba(0,0,0,1)] mb-6" alt="Story Card"/>
                <a href={storyModal.imageUrl} download={`CineScore-${selectedMovie?.title || 'Story'}-${storyModal.activeStyle}.png`} className="w-full py-4 bg-theme text-[#03050A] border-2 border-black rounded-sm font-black text-base uppercase tracking-wider shadow-[4px_4px_0px_rgba(0,0,0,1)] magnetic-btn flex items-center justify-center gap-2 transition-transform">
                  <Save size={18}/> {t.downloadStory}
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. ÖZEL LİSTE GÖRSELİ (POSTER) ÖNİZLEME VE İNDİRME PENCERESİ */}
      {listPosterModal.show && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-[#03050A] border-2 border-slate-700 w-full max-w-md rounded-lg p-6 sm:p-8 relative shadow-[12px_12px_0px_rgba(0,0,0,1)] text-center">
            <button onClick={() => setListPosterModal({ show: false, generating: false, imageUrl: null, listName: '' })} className="absolute top-4 right-4 p-2 bg-[#03050A] rounded-sm text-slate-400 hover:text-white hover:border-white border-2 border-slate-700 shadow-[2px_2px_0px_rgba(0,0,0,1)] magnetic-btn z-10"><X size={18}/></button>
            <h3 className="text-xl font-black text-white mb-5 flex items-center justify-center gap-2 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]"><ListPlus className="text-theme" size={22}/> {t.listPosterTitle || 'Liste Paylaşım Kartı'}</h3>
            {listPosterModal.generating ? (
              <div className="py-24 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-10 h-10 animate-spin text-theme"/>
                <p className="text-xs font-bold text-slate-400">{t.storyGenerating}</p>
              </div>
            ) : listPosterModal.imageUrl && (
              <div className="flex flex-col items-center">
                <div className="max-h-[60vh] overflow-y-auto rounded-sm border-2 border-slate-700 shadow-[6px_6px_0px_rgba(0,0,0,1)] mb-6 hide-scrollbar bg-[#03050A]">
                  <img src={listPosterModal.imageUrl} className="w-64 sm:w-72 object-contain" alt="List Poster"/>
                </div>
                <a href={listPosterModal.imageUrl} download={`CineScore-Liste-${listPosterModal.listName}.png`} className="w-full py-4 bg-theme text-[#03050A] border-2 border-black rounded-sm font-black text-base uppercase tracking-wider shadow-[4px_4px_0px_rgba(0,0,0,1)] magnetic-btn flex items-center justify-center gap-2 transition-transform">
                  <Save size={18}/> {t.downloadStory}
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. ÖZEL LİSTE SİLME ONAY PENCERESİ */}
      {listToDelete && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-[#03050A] border-2 border-slate-800 w-full max-w-sm rounded-lg p-8 relative shadow-[12px_12px_0px_rgba(0,0,0,1)] text-center">
            <h3 className="text-2xl font-black text-white mb-2 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">{t.deleteListTitle || 'Listeyi Sil'}</h3>
            <p className="text-slate-400 font-bold mb-8 text-sm">{t.deleteListDesc || 'Bu özel listeyi kalıcı olarak silmek istediğinize emin misiniz?'}</p>
            <div className="flex gap-4">
              <button onClick={() => setListToDelete(null)} className="flex-1 py-4 bg-[#03050A] text-slate-300 hover:text-white border-2 border-slate-700 hover:border-white rounded-sm font-black shadow-[4px_4px_0px_rgba(0,0,0,1)] magnetic-btn">{t.cancel || 'İptal'}</button>
              <button onClick={confirmDeleteCustomList} className="flex-1 py-4 bg-red-600 hover:bg-red-500 text-[#03050A] border-2 border-black rounded-sm font-black shadow-[4px_4px_0px_rgba(0,0,0,1)] magnetic-btn">{t.delete || 'Evet, Sil'}</button>
            </div>
          </div>
        </div>
      )}

      {/* TAM BOYUTLU MOBİL ARAMA PENCERESİ */}
      {isMobileSearchOpen && (
        <div id="mobile-search-box" className="fixed inset-0 z-[150] flex items-start justify-center pt-24 p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-[#03050A] border-2 border-slate-700 w-full max-w-lg rounded-lg p-5 relative shadow-[12px_12px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-black text-white flex items-center gap-2 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                <Search className="text-theme" size={20}/> {t.searchPlaceholder}
              </h3>
              <button onClick={() => { setIsMobileSearchOpen(false); setSearchTerm(''); setSearchResults([]); }} className="p-2 bg-[#03050A] border-2 border-slate-700 rounded-sm text-slate-400 hover:text-white hover:border-white shadow-[2px_2px_0px_rgba(0,0,0,1)] magnetic-btn">
                <X size={18}/>
              </button>
            </div>
            
            <div className="relative flex items-center mb-4">
              <Search className="absolute left-4 text-slate-400" size={18}/>
              <input 
                type="text" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                placeholder={t.searchPlaceholder} 
                autoFocus
                className="w-full bg-[#03050A] border-2 border-slate-700 rounded-sm pl-11 pr-10 py-3.5 text-white text-sm outline-none focus:border-theme transition-colors shadow-[inset_4px_4px_0px_rgba(0,0,0,0.5)] font-bold"
              />
              {searchTerm && (
                <button onClick={() => { setSearchTerm(''); setSearchResults([]); }} className="absolute right-3 text-slate-400 hover:text-white p-1">
                  <X size={16}/>
                </button>
              )}
              {isSearching && <Loader2 className="absolute right-10 animate-spin text-theme" size={18}/>}
            </div>

            <div className="max-h-[55vh] overflow-y-auto space-y-3 pr-1 hide-scrollbar">
               {searchResults.map(res => (
                 <div 
                   key={res.id} 
                   onClick={() => { selectMovieToRate(res.id, res.title); setIsMobileSearchOpen(false); }} 
                   className="flex items-center gap-3 p-3 bg-[#03050A] border-2 border-slate-800 hover:border-theme rounded-sm cursor-pointer transition-colors shadow-[4px_4px_0px_rgba(0,0,0,1)] magnetic-btn"
                 >
                   <img src={res.poster_path ? `https://image.tmdb.org/t/p/w200${res.poster_path}` : 'https://via.placeholder.com/40'} className="w-12 h-16 object-cover rounded-sm shadow-[2px_2px_0px_rgba(0,0,0,1)] shrink-0 border-2 border-slate-800" alt=""/>
                   <div className="flex-1 min-w-0">
                     <h4 className="text-white font-black text-sm truncate drop-shadow-[1px_1px_0px_rgba(0,0,0,1)]">{res.title}</h4>
                     <p className="text-slate-400 text-xs font-bold mt-1 truncate">
                       {res.release_date?.split('-')[0] || ''} {res.director ? ` • ${res.director}` : ''}
                     </p>
                   </div>
                 </div>
               ))}
               {searchTerm.length > 2 && searchResults.length === 0 && !isSearching && (
                 <p className="text-center text-slate-500 font-bold py-6 text-sm bg-[#03050A] border-2 border-slate-800 border-dashed rounded-sm">{t.noData}</p>
               )}
            </div>
          </div>
        </div>
      )}

      {showTop3Modal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#03050A] border-2 border-slate-700 w-full max-w-lg rounded-lg p-6 relative shadow-[12px_12px_0px_rgba(0,0,0,1)]">
            <button onClick={() => setShowTop3Modal(false)} className="absolute top-6 right-6 p-2 bg-[#03050A] border-2 border-slate-700 rounded-sm text-slate-400 hover:text-white hover:border-white shadow-[2px_2px_0px_rgba(0,0,0,1)] magnetic-btn"><X/></button>
            <h3 className="text-xl font-black text-white mb-6 flex items-center gap-3 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]"><Trophy className="text-theme" size={24}/> {t.top3Title}</h3>
            
            <div className="relative flex items-center mb-5">
              <Search className="absolute left-4 text-slate-400" size={18}/>
              <input 
                type="text" value={top3SearchTerm} onChange={(e) => setTop3SearchTerm(e.target.value)} placeholder={t.selectTop3Search} 
                className="w-full bg-[#03050A] border-2 border-slate-700 rounded-sm pl-12 pr-4 py-4 text-white outline-none focus:border-theme transition-colors shadow-[inset_4px_4px_0px_rgba(0,0,0,0.5)] font-bold"
              />
              {isTop3Searching && <Loader2 className="absolute right-4 animate-spin text-theme" size={18}/>}
            </div>

            <div className="max-h-64 overflow-y-auto hide-scrollbar space-y-3">
               {top3Results.map(res => (
                 <div key={res.id} onClick={() => saveTop3Movie(res)} className="flex items-center gap-4 p-3 bg-[#03050A] border-2 border-slate-800 hover:border-theme rounded-sm cursor-pointer transition-colors group shadow-[4px_4px_0px_rgba(0,0,0,1)] magnetic-btn">
                   <img src={res.poster_path ? `https://image.tmdb.org/t/p/w200${res.poster_path}` : 'https://via.placeholder.com/40'} className="w-10 h-14 object-cover rounded-sm border-2 border-slate-800 shadow-[2px_2px_0px_rgba(0,0,0,1)]" alt=""/>
                   <div>
                     <h4 className="text-white font-bold text-sm group-hover:text-theme drop-shadow-[1px_1px_0px_rgba(0,0,0,1)]">{res.title}</h4>
                     <p className="text-slate-500 text-xs font-bold mt-1">{res.release_date?.split('-')[0]}</p>
                   </div>
                 </div>
               ))}
               {top3SearchTerm.length > 2 && top3Results.length === 0 && !isTop3Searching && (
                 <p className="text-center text-slate-500 font-bold py-6 bg-[#03050A] border-2 border-slate-800 border-dashed rounded-sm">{t.noData}</p>
               )}
            </div>
          </div>
        </div>
      )}

      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#03050A] border-2 border-slate-700 w-full max-w-md rounded-lg p-8 relative shadow-[12px_12px_0px_rgba(0,0,0,1)]">
            <button onClick={() => setShowLoginModal(false)} className="absolute top-6 right-6 p-2 bg-[#03050A] border-2 border-slate-700 rounded-sm text-slate-400 hover:text-white hover:border-white shadow-[2px_2px_0px_rgba(0,0,0,1)] magnetic-btn"><X/></button>
            
            <div className="text-center mb-8 relative">
              <div className="absolute inset-0 bg-theme opacity-10 blur-[50px] rounded-full pointer-events-none"></div>
              <div className="w-20 h-20 rounded-sm bg-[#03050A] mx-auto flex items-center justify-center mb-4 border-2 border-theme shadow-[4px_4px_0px_var(--theme-color-50)] relative z-10 logo-morph-bg">
                 <Clapperboard size={40} className="text-[#03050A]"/>
              </div>
              <h2 className="text-4xl font-black tracking-tighter drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] relative z-10" style={{fontFamily: "'Montserrat', sans-serif"}}>
                <span className="text-white">CINE</span><span className="logo-morph-text drop-shadow-none">SCORE</span>
              </h2>
            </div>
            
            <button onClick={handleGoogleAuth} className="w-full mb-6 py-4 bg-white hover:bg-slate-200 text-black border-2 border-black rounded-sm font-black transition-all flex items-center justify-center gap-3 shadow-[4px_4px_0px_rgba(0,0,0,1)] magnetic-btn uppercase tracking-wider">
               <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
               Google {t.login}
            </button>
            <div className="flex items-center gap-4 mb-6"><div className="h-0.5 bg-slate-800 flex-1"></div><span className="text-xs text-slate-500 font-black tracking-widest uppercase">{t.loginOr}</span><div className="h-0.5 bg-slate-800 flex-1"></div></div>
            
            <div className="flex p-1.5 bg-[#03050A] border-2 border-slate-700 rounded-sm mb-6 shadow-[inset_4px_4px_0px_rgba(0,0,0,0.5)]">
              <button onClick={() => setAuthMode('login')} className={`flex-1 py-3 text-sm font-black rounded-sm transition-all border-2 ${authMode === 'login' ? 'bg-theme border-black text-[#03050A] shadow-[2px_2px_0px_rgba(0,0,0,1)]' : 'border-transparent text-slate-500 hover:text-white'}`}>{t.login}</button>
              <button onClick={() => setAuthMode('register')} className={`flex-1 py-3 text-sm font-black rounded-sm transition-all border-2 ${authMode === 'register' ? 'bg-theme border-black text-[#03050A] shadow-[2px_2px_0px_rgba(0,0,0,1)]' : 'border-transparent text-slate-500 hover:text-white'}`}>{t.registerBtn}</button>
            </div>
            
            <form onSubmit={handleAuth} className="space-y-4">
              {authMode === 'register' && <input type="text" onChange={e=>setDisplayName(e.target.value)} autoComplete="name" placeholder={t.namePlaceholder} required className="w-full p-4 bg-[#03050A] border-2 border-slate-700 rounded-sm text-white shadow-[inset_4px_4px_0px_rgba(0,0,0,0.5)] outline-none focus:border-theme font-medium transition-colors"/>}
              <input type="email" onChange={e=>setEmail(e.target.value)} autoComplete="username" placeholder={t.emailPlaceholder} required className="w-full p-4 bg-[#03050A] border-2 border-slate-700 rounded-sm text-white shadow-[inset_4px_4px_0px_rgba(0,0,0,0.5)] outline-none focus:border-theme font-medium transition-colors"/>
              <input type="password" onChange={e=>setPassword(e.target.value)} autoComplete={authMode === 'login' ? 'current-password' : 'new-password'} placeholder={t.passPlaceholder} required minLength={6} className="w-full p-4 bg-[#03050A] border-2 border-slate-700 rounded-sm text-white shadow-[inset_4px_4px_0px_rgba(0,0,0,0.5)] outline-none focus:border-theme font-medium transition-colors"/>
              {authError && <p className={`text-xs text-center font-bold p-3 rounded-sm border-2 ${authError.includes('başarılı') || authError.includes('successful') ? 'text-green-400 bg-green-950/50 border-green-500' : 'text-red-400 bg-red-950/50 border-red-500'}`}>{authError}</p>}
              
              <button className="w-full p-4 bg-theme text-[#03050A] font-black rounded-sm border-2 border-black transition-all shadow-[4px_4px_0px_rgba(0,0,0,1)] magnetic-btn text-base uppercase tracking-wider mt-2">
                {isAuthLoading ? <Loader2 className="animate-spin mx-auto" /> : (authMode === 'login' ? t.login : t.registerBtn)}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ÖZEL SİLME ONAY PENCERESİ */}
      {ratingToDelete && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#03050A] border-2 border-slate-700 w-full max-w-sm rounded-lg p-8 relative shadow-[12px_12px_0px_rgba(0,0,0,1)] text-center">
            <div className="w-20 h-20 bg-red-950 border-2 border-red-500 rounded-sm mx-auto flex items-center justify-center mb-6 shadow-[4px_4px_0px_rgba(239,68,68,0.5)]">
               <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
            </div>
            <h3 className="text-2xl font-black text-white mb-2 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">{t.deleteRatingTitle || "Oyu Sil"}</h3>
            <p className="text-slate-400 font-bold mb-8 text-sm leading-relaxed">{t.deleteRatingDesc || "Bu filme verdiğiniz puanı silmek istediğinize emin misiniz? (Global ortalamadan da düşülecektir.)"}</p>
            <div className="flex gap-4">
               <button onClick={() => setRatingToDelete(null)} className="flex-1 py-4 bg-[#03050A] border-2 border-slate-700 hover:border-white text-slate-300 hover:text-white rounded-sm font-black transition-colors shadow-[4px_4px_0px_rgba(0,0,0,1)] magnetic-btn uppercase tracking-wider">{t.cancel || "İptal"}</button>
               <button onClick={confirmDeleteRating} disabled={isDeleting} className="flex-1 py-4 bg-red-600 hover:bg-red-500 border-2 border-black text-[#03050A] rounded-sm font-black transition-colors flex justify-center items-center shadow-[4px_4px_0px_rgba(0,0,0,1)] magnetic-btn uppercase tracking-wider">
                  {isDeleting ? <Loader2 className="animate-spin text-[#03050A]"/> : (t.delete || "Evet, Sil")}
               </button>
            </div>
          </div>
        </div>
      )}

{/* --- PREMİUM HEADER (HER EKRAN BOYUTUNA UYUMLU & KESİN SABİT) --- */}
      <header className="fixed w-full top-0 left-0 z-[100] bg-[#03050A]/95 backdrop-blur-md border-b-2 border-slate-800 shadow-[0_4px_0px_rgba(0,0,0,1)] pt-[env(safe-area-inset-top)] transition-all">
        <div className="max-w-[90rem] mx-auto px-2.5 sm:px-4 h-16 sm:h-20 flex items-center justify-between gap-1.5 sm:gap-4">
          
          {/* LOGO */}
          <div className="flex items-center gap-1.5 sm:gap-3 cursor-pointer group shrink-0" onClick={handleCloseMovie}>
            <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-sm flex items-center justify-center border-2 border-transparent transition-transform duration-500 group-hover:scale-105 logo-morph-bg shrink-0">
              <Clapperboard className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
            <h1 className="text-base sm:text-3xl font-black tracking-tighter flex items-center transition-transform duration-500 group-hover:scale-105 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]" style={{fontFamily: "'Montserrat', sans-serif"}}>
               <span className="text-white">CINE</span><span className="logo-morph-text drop-shadow-none">SCORE</span>
            </h1>
          </div>

          {/* MASAÜSTÜ ARAMA ÇUBUĞU */}
          <div className="flex-1 max-w-2xl relative hidden sm:block" ref={searchDropdownRef}>
            <div className="relative flex items-center">
              <Search className="absolute left-5 text-slate-400" size={18}/>
              <input 
                type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder={t.searchPlaceholder} 
                className="w-full bg-[#03050A] border-2 border-slate-800 hover:border-slate-600 rounded-sm pl-12 pr-4 py-3 text-sm text-white outline-none focus:border-theme transition-all shadow-[inset_4px_4px_0px_rgba(0,0,0,0.5)] font-bold"
              />
              {isSearching && <Loader2 className="absolute right-5 animate-spin text-theme" size={16}/>}
            </div>
            
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 w-full mt-3 bg-[#03050A] border-2 border-slate-700 rounded-sm shadow-[8px_8px_0px_rgba(0,0,0,1)] overflow-hidden z-50">
                {searchResults.map(result => (
                  <div key={result.id} onClick={() => selectMovieToRate(result.id, result.title)} className="flex items-center gap-4 p-3 hover:bg-slate-800 cursor-pointer border-b-2 border-slate-800 last:border-0 transition-colors">
                    <img src={result.poster_path ? `https://image.tmdb.org/t/p/w200${result.poster_path}` : 'https://via.placeholder.com/40'} className="w-10 h-14 object-cover rounded-sm bg-[#03050A] border-2 border-slate-800" alt=""/>
                    <div>
                       <h4 className="text-white font-black text-sm line-clamp-1 drop-shadow-[1px_1px_0px_rgba(0,0,0,1)]">{result.title}</h4>
                       <p className="text-slate-400 text-xs mt-0.5 font-bold">
                         {result.release_date?.split('-')[0] || ''} {result.director ? ` • ${result.director}` : ''}
                       </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SAĞ KONTROLLER (MOBİLDE KOMPAKT & TAŞMAYAN YAPI) */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            
            {/* MİNİ OYUN: SİNEBAĞ BUTONU */}
            <button
              onClick={() => { setSelectedMovie(null); setViewingUser(null); setActiveTab('game'); }}
              className={`px-2.5 sm:px-4 py-1.5 sm:py-2.5 rounded-sm font-black text-[10px] sm:text-sm flex items-center gap-1.5 transition-all border-2 shrink-0 magnetic-btn shadow-[2px_2px_0px_rgba(0,0,0,1)] ${
                activeTab === 'game'
                  ? 'bg-rose-600 text-[#03050A] border-black shadow-[4px_4px_0px_rgba(0,0,0,1)]'
                  : 'bg-[#03050A] text-slate-300 border-slate-700 hover:border-rose-500 hover:text-white'
              }`}
            >
              <Clapperboard size={14} className={activeTab === 'game' ? 'text-[#03050A]' : 'text-rose-500'}/>
              <div className="flex flex-col sm:flex-row sm:items-center leading-none text-left">
                <span className="text-[7px] sm:hidden font-mono uppercase tracking-wider text-rose-400 block">MİNİ OYUN</span>
                <span className="sm:hidden font-black text-[10px]">SİNEBAĞ</span>
                <span className="hidden sm:inline">{t.miniGameNav || 'Mini Oyun: SineBağ'}</span>
              </div>
            </button>

            {/* MOBİL ARAMA BUTONU */}
            <button 
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)} 
              className={`sm:hidden w-8 h-8 rounded-sm border-2 flex items-center justify-center transition-all shrink-0 magnetic-btn shadow-[2px_2px_0px_rgba(0,0,0,1)] ${isMobileSearchOpen ? 'bg-theme text-[#03050A] border-black' : 'bg-[#03050A] border-slate-700 text-slate-300'}`}
            >
              {isMobileSearchOpen ? <X size={15}/> : <Search size={15}/>}
            </button>

            {/* SES AÇ/KAPAT BUTONU */}
            <button
              onClick={toggleSoundEnabled}
              title={soundEnabled ? t.soundOn : t.soundOff}
              aria-label={soundEnabled ? t.soundOn : t.soundOff}
              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-sm border-2 transition-all flex items-center justify-center shrink-0 magnetic-btn shadow-[2px_2px_0px_rgba(0,0,0,1)] ${
                soundEnabled
                  ? 'bg-[#03050A] border-slate-600 text-theme hover:border-theme'
                  : 'bg-[#03050A] border-slate-800 text-slate-500 hover:text-slate-300'
              }`}
            >
              {soundEnabled ? <Volume2 size={16}/> : <VolumeX size={16}/>}
            </button>

            {/* DİL MENÜSÜ */}
            <div className="relative shrink-0" ref={langMenuRef}>
              <button onClick={() => setIsLangMenuOpen(!isLangMenuOpen)} className="w-8 h-8 sm:w-10 sm:h-10 bg-[#03050A] border-2 border-slate-700 rounded-sm hover:border-theme transition-colors flex items-center justify-center overflow-hidden magnetic-btn shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                 <img src={LANGUAGES.find(l => l.code === lang)?.flag} className="w-4 h-3 sm:w-5 sm:h-4 object-cover" alt="Lang"/>
              </button>
              {isLangMenuOpen && (
                <div className="absolute top-full right-0 mt-3 w-40 bg-[#03050A] border-2 border-slate-700 rounded-sm shadow-[6px_6px_0px_rgba(0,0,0,1)] z-50 animate-in fade-in slide-in-from-top-2">
                  {LANGUAGES.map(l => (
                    <button key={l.code} onClick={() => {setLang(l.code); setIsLangMenuOpen(false);}} className="w-full text-left px-5 py-3 hover:bg-slate-800 text-sm text-white flex items-center gap-3 border-b-2 border-slate-800 last:border-0 transition-colors">
                      <img src={l.flag} className="w-5 h-4 object-cover rounded-sm border border-slate-600" alt=""/> <span className="font-bold">{l.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* MASAÜSTÜ SEKMELER */}
            <nav className="hidden md:flex bg-[#03050A] p-1.5 rounded-sm border-2 border-slate-800 shadow-[inset_2px_2px_0px_rgba(0,0,0,0.5)] gap-2">
               <button onClick={handleCloseMovie} className={`px-5 py-2 rounded-sm text-sm font-black transition-all magnetic-btn ${activeTab === 'home' ? 'bg-theme text-[#03050A] border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]' : 'bg-[#03050A] text-slate-300 hover:text-white border-2 border-transparent'}`}>{t.home}</button>
               <button onClick={() => {setActiveTab('global'); setDynamicBg(''); setSelectedMovie(null);}} className={`px-5 py-2 rounded-sm text-sm font-black transition-all magnetic-btn ${activeTab === 'global' ? 'bg-theme text-[#03050A] border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]' : 'bg-[#03050A] text-slate-300 hover:text-white border-2 border-transparent'}`}>{t.ranking}</button>
               <button onClick={handleOpenCommunity} className={`px-5 py-2 rounded-sm text-sm font-black transition-all magnetic-btn ${activeTab === 'community' ? 'bg-theme text-[#03050A] border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]' : 'bg-[#03050A] text-slate-300 hover:text-white border-2 border-transparent'}`}>{t.community}</button>
            </nav>

            {isAuthChecking ? (
              <div className="flex items-center justify-center px-3 py-2">
                 <Loader2 className="animate-spin text-theme w-5 h-5" />
              </div>
            ) : userProfile ? (
              <div className="flex items-center gap-2 sm:gap-4 shrink-0 pl-1 sm:pl-3 border-l-2 border-slate-800">

                <div className="relative flex items-center justify-center" ref={notifMenuRef}>
                   <button onClick={() => { setIsNotifMenuOpen(!isNotifMenuOpen); markNotificationsAsRead(); }} className="relative w-8 h-8 sm:w-10 sm:h-10 bg-[#03050A] border-2 border-slate-700 rounded-sm hover:border-theme transition-colors flex items-center justify-center group magnetic-btn shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                      <Bell size={16} className="text-slate-300 group-hover:text-theme transition-colors"/>
                      {userProfile?.notifications?.some(n => !n.read) && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-[#03050A] rounded-sm"></span>}
                   </button>
                   {isNotifMenuOpen && (
                     <div className="absolute top-full right-0 mt-3 w-72 bg-[#03050A] border-2 border-slate-700 rounded-sm shadow-[8px_8px_0px_rgba(0,0,0,1)] z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                       <div className="p-4 border-b-2 border-slate-700 bg-[#03050A] font-black text-white">{t.notifications}</div>
                       <div className="max-h-64 overflow-y-auto hide-scrollbar">
                          {userProfile?.notifications?.length > 0 ? userProfile.notifications.map(n => (
                             <div key={n.id} onClick={() => { if (n.type === 'badge') { setIsNotifMenuOpen(false); setActiveTab('profile_general'); } else if (n.fromUid) { handleNotifClick(n.fromUid); } }} className="p-4 border-b-2 border-slate-800 hover:bg-slate-800 cursor-pointer transition-colors flex gap-3 items-center">
                                {n.type === 'badge' ? (
                                   <div className="w-10 h-10 rounded-sm bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center shrink-0 text-amber-400">
                                      <Trophy size={20}/>
                                   </div>
                                ) : (
                                   <img src={n.fromAvatar || AVATAR_DEFAULT} className="w-10 h-10 rounded-sm border-2 border-slate-700 object-cover shrink-0" alt=""/>
                                )}
                                <div className="text-xs text-slate-300 leading-tight">
                                   <strong className="text-white block mb-0.5">{n.fromName}</strong>
                                   {n.type === 'follow' && t.startedFollowing}
                                   {n.type === 'badge' && <span className="text-amber-400 font-bold">{n.badgeDesc}</span>}
                                </div>
                             </div>
                          )) : <div className="p-6 text-center text-slate-500 text-sm font-bold">{t.noNotifications}</div>}
                       </div>
                     </div>
                   )}
                </div>

                <div className="relative" ref={profileMenuRef}>
                  <div className="flex items-center cursor-pointer group" onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}>
                    <div className="relative">
                      <img src={userProfile?.avatar || AVATAR_DEFAULT} className={`w-9 h-9 sm:w-11 sm:h-11 rounded-sm border-2 transition-all duration-300 object-cover magnetic-btn shadow-[2px_2px_0px_rgba(0,0,0,1)] ${activeTab.startsWith('profile') ? 'border-theme' : 'border-slate-700 bg-[#03050A] group-hover:border-theme'}`} alt="Avatar"/>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-theme rounded-sm border-2 border-[#03050A] flex items-center justify-center transform rotate-6">
                         <span className="text-[10px] font-black text-[#03050A]">{sortedMyRatings.length}</span>
                      </div>
                    </div>
                  </div>
                  
                  {isProfileMenuOpen && (
                    <div className="absolute top-full right-0 mt-3 w-56 bg-[#03050A] border-2 border-slate-700 rounded-sm shadow-[8px_8px_0px_rgba(0,0,0,1)] z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                      <div className="p-4 border-b-2 border-slate-700 bg-[#03050A]">
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
                      <div className="py-2 border-t-2 border-slate-700">
                        <button onClick={handleLogout} className="w-full text-left px-5 py-3 text-sm font-black text-rose-500 hover:bg-rose-500 hover:text-[#03050A] flex items-center gap-3 transition-colors"><LogOut size={18}/> {t.logout}</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <button onClick={() => setShowLoginModal(true)} className="flex items-center gap-1.5 px-3 sm:px-6 py-2 sm:py-3 bg-theme text-[#03050A] rounded-sm transition-all text-xs sm:text-sm font-black border-2 border-black magnetic-btn shadow-[4px_4px_0px_rgba(0,0,0,1)] shrink-0 uppercase tracking-wider">
                <LogIn size={16} /> <span className="hidden sm:inline">{t.login}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main data-active-tab={activeTab} className="relative z-10 max-w-[90rem] mx-auto px-4 py-6 sm:py-10 pb-36 md:pb-16 pt-24 sm:pt-28">

        {/* 1) SAF REACT TOPLULUK (COMMUNITY) EKRANI — KULLANICI @KOD ARAMA ÇUBUĞU VE EN ÇOK OYLANANLAR */}
        {activeTab === 'community' && (
          <div className="cinescore-modern-view max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
            
            {/* ÜST GİZLİ TOPLULUK & @KOD ARAMA PANELİ */}
            <div className="cine-glass p-6 sm:p-10 relative overflow-hidden text-center shadow-[8px_8px_0px_rgba(0,0,0,1)]">
              <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-64 rounded-full blur-[110px] opacity-20 pointer-events-none" style={{ backgroundColor: themeColor }}></div>

              <div className="w-16 h-16 rounded-sm bg-[#03050A] border-2 border-slate-700 flex items-center justify-center mx-auto mb-4 shadow-[4px_4px_0px_rgba(0,0,0,1)] text-theme">
                <Users size={30}/>
              </div>

              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-2 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                {t.communityPrivacyTitle}
              </h2>
              <p className="text-xs sm:text-sm font-bold text-slate-400 max-w-xl mx-auto mb-6 leading-relaxed">
                {t.communityPrivacyDesc}
              </p>

              {/* KULLANICININ KENDİ @KODU (GİRİŞ YAPILMIŞSA) */}
              {userProfile && (
                <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-sm bg-[#03050A] border-2 border-slate-800 mb-6 shadow-[inset_2px_2px_0px_rgba(0,0,0,0.5)]">
                  <span className="text-xs font-bold text-slate-400">Senin Kodun:</span>
                  <span className="text-sm font-black font-mono text-theme">
                    @{userProfile.userCode || user?.uid?.substring(0, 6).toUpperCase()}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const myCode = `@${userProfile.userCode || user?.uid?.substring(0, 6).toUpperCase()}`;
                      navigator.clipboard.writeText(myCode);
                      showToast(t.userCodeCopied);
                    }}
                    className="px-2.5 py-1 rounded-sm bg-theme text-[#03050A] border-2 border-black hover:bg-slate-200 text-xs font-black transition-colors shadow-[2px_2px_0px_rgba(0,0,0,1)] magnetic-btn"
                  >
                    {t.share}
                  </button>
                </div>
              )}

              {/* @KOD ARAMA ÇUBUĞU */}
              <div className="max-w-lg mx-auto relative flex items-center">
                <Search className="absolute left-4 text-theme" size={20}/>
                <input
                  type="text"
                  value={communitySearch}
                  onChange={(e) => setCommunitySearch(e.target.value)}
                  maxLength={7}
                  placeholder={t.exactCodeRequired || t.searchUsers}
                  className="w-full bg-[#03050A] border-2 border-slate-700 focus:border-theme rounded-sm pl-12 pr-12 py-4 text-sm sm:text-base text-white font-black tracking-wider uppercase outline-none transition-all shadow-[inset_4px_4px_0px_rgba(0,0,0,0.5)]"
                />
                {communitySearch && (
                  <button
                    type="button"
                    onClick={() => setCommunitySearch('')}
                    className="absolute right-4 p-1 rounded-sm bg-slate-800 text-slate-400 hover:text-white border-2 border-transparent hover:border-slate-500 magnetic-btn"
                  >
                    <X size={16}/>
                  </button>
                )}
              </div>

              {/* ARAMA SONUÇLARI */}
              {communitySearch.replace('@', '').trim().length > 0 && (
                <div className="max-w-lg mx-auto mt-5">
                  {filteredCommunityUsers.length > 0 ? (
                    <div className="space-y-3">
                      {filteredCommunityUsers.map((u) => (
                        <div
                          key={u.uid}
                          onClick={() => loadPublicProfile(u.uid)}
                          className="flex items-center justify-between gap-4 p-4 rounded-sm bg-[#03050A] border-2 border-slate-700 hover:border-theme cursor-pointer transition-all shadow-[4px_4px_0px_rgba(0,0,0,1)] magnetic-btn group"
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <img
                              src={u.avatar || AVATAR_DEFAULT}
                              className="w-14 h-14 rounded-sm object-cover border-2 border-slate-700 group-hover:border-theme shrink-0"
                              alt=""
                            />
                            <div className="text-left min-w-0">
                              <h4 className="text-base sm:text-lg font-black text-white group-hover:text-theme truncate drop-shadow-[1px_1px_0px_rgba(0,0,0,1)]">
                                {u.displayName}
                              </h4>
                              <span className="text-xs font-black font-mono text-theme">
                                @{u.userCode || u.uid?.substring(0, 6).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <div className="text-right hidden sm:block">
                              <span className="text-xs font-black text-white block">{u.followers?.length || 0}</span>
                              <span className="text-[10px] font-bold text-slate-500 uppercase">{t.followers}</span>
                            </div>
                            <ChevronRight size={20} className="text-slate-500 group-hover:text-theme group-hover:translate-x-1 transition-all"/>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : communitySearch.replace('@', '').trim().length === 6 ? (
                    <div className="p-5 rounded-sm bg-[#03050A] border-2 border-slate-800 text-slate-400 text-sm font-bold shadow-[inset_4px_4px_0px_rgba(0,0,0,0.5)]">
                      {t.noData}
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            {/* TOPLULUKTA EN ÇOK OYLANAN FİLMLER VİTRİNİ */}
            {safeGlobalMovies.length > 0 && (
              <div className="mt-12">
                <div className="flex items-center gap-4 mb-6">
                   <div className="w-12 h-12 bg-amber-500 text-[#03050A] border-2 border-black flex items-center justify-center shadow-[4px_4px_0px_rgba(0,0,0,1)] rounded-sm shrink-0">
                     <Flame size={24} />
                   </div>
                   <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-widest drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] flex-1 border-b-4 border-amber-500/20 pb-2 flex justify-between items-center">
                     <span>{t.mostVoted}</span>
                     <button
                        type="button"
                        onClick={() => setActiveTab('global')}
                        className="text-xs font-black text-amber-500 hover:text-white transition-colors cursor-pointer"
                      >
                        {t.viewAll} &rarr;
                      </button>
                   </h3>
                </div>

                <div className="cine-glass p-6 sm:p-8">
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                    {[...safeGlobalMovies]
                      .sort((a, b) => (Number(b.voteCount) || 0) - (Number(a.voteCount) || 0))
                      .slice(0, 12)
                      .map((m) => {
                        const dispTitle = localizedData?.[m.id]?.title || m.title;
                        const sColor = getScoreColorHex(m.avgScore);
                        return (
                          <div
                            key={m.id}
                            onClick={() => selectMovieToRate(m.id, dispTitle)}
                            className="group cursor-pointer"
                          >
                            <div className="relative aspect-[2/3] rounded-sm overflow-hidden border-2 border-slate-800 group-hover:border-theme transition-all mb-2 bg-[#03050A] shadow-[4px_4px_0px_rgba(0,0,0,1)] group-hover:shadow-[4px_4px_0px_var(--theme-color-50)] magnetic-btn">
                              <img src={m.poster} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt=""/>
                              <div className="absolute top-2 right-2 px-2 py-1 rounded-sm bg-[#03050A] border-2 border-slate-700 text-center shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                                <span className="text-xs font-black block leading-none" style={{ color: sColor }}>
                                  {Number(m.avgScore).toFixed(2)}
                                </span>
                              </div>
                              <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-sm bg-[#03050A] border-2 border-slate-700 text-[10px] font-black text-slate-300 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                                {m.voteCount} {t.voteCount}
                              </div>
                            </div>
                            <h4 className="text-xs font-bold text-slate-200 group-hover:text-theme truncate drop-shadow-[1px_1px_0px_rgba(0,0,0,1)]">{dispTitle}</h4>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2) SAF REACT KULLANICI PROFİLİ (PROFILE_GENERAL) EKRANI — SAYFA YENİLEMEDEN İLK TIKLAMADA ANINDA AÇILIR */}
        {activeTab === 'profile_general' && userProfile && (() => {
          const myAvgScore = sortedMyRatings.length > 0
            ? (sortedMyRatings.reduce((acc, r) => acc + (Number(r.finalScore) || 0), 0) / sortedMyRatings.length)
            : 0;

          // Eleştirmen Kimliği (Acımasızlık Endeksi) Hesabı
          let diffSum = 0, diffCount = 0;
          sortedMyRatings.forEach((r) => {
            const g = safeGlobalMovies.find((gm) => String(gm.id) === String(r.id));
            if (g && Number(g.voteCount) > 0) {
              diffSum += (Number(r.finalScore) || 0) - (Number(g.avgScore) || 0);
              diffCount++;
            }
          });
          const avgDiff = diffCount > 0 ? (diffSum / diffCount) : 0;
          const criticTitle = avgDiff <= -0.5 ? 'Acımasız Eleştirmen' : avgDiff >= 0.5 ? 'Cömert Sinefil' : 'Adil Eleştirmen';
          const criticSubtitle = avgDiff <= 0
            ? `Ortalamadan ${Math.abs(avgDiff).toFixed(2)} puan düşük veriyorsun`
            : `Ortalamadan ${avgDiff.toFixed(2)} puan yüksek veriyorsun`;

          // Favori On Yıl Hesabı
          const decadeCounts = {};
          sortedMyRatings.forEach((r) => {
            const g = safeGlobalMovies.find((gm) => String(gm.id) === String(r.id));
            const yStr = String(r.year || g?.year || '');
            const m = yStr.match(/\d{4}/);
            if (m) {
              const dec = Math.floor(Number(m[0]) / 10) * 10;
              decadeCounts[dec] = (decadeCounts[dec] || 0) + 1;
            }
          });
          const topDecadeEntry = Object.entries(decadeCounts).sort((a, b) => b[1] - a[1])[0];
          const favDecadeLabel = topDecadeEntry ? `${topDecadeEntry[0]}'ler Sineması` : '—';

          const allMyBadges = getAllBadges(myRatings, t, safeGlobalMovies);

          return (
            <div className="cinescore-modern-view max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
              
              {/* 1. ÜST PROFİL BANNER & KULLANICI BİLGİ KARTI */}
              <div className="relative rounded-[2.5rem] overflow-hidden border border-slate-800 shadow-2xl bg-slate-900/50">
                <div className="h-48 sm:h-64 w-full relative">
                  <img src={userProfile.banner || BANNER_PRESETS[0]} className="w-full h-full object-cover opacity-80" alt="Banner"/>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#04060C] via-[#04060C]/60 to-transparent"></div>

                  <div className="absolute top-4 sm:top-6 right-4 sm:right-6 flex items-center gap-2 z-20">
                    <button
                      type="button"
                      onClick={() => copyProfileLink(user.uid)}
                      className="px-3.5 py-2 bg-[#04060C]/70 text-slate-200 hover:text-white border border-slate-700 hover:border-white rounded-xl backdrop-blur font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-lg"
                    >
                      <Link size={15}/> <span className="hidden sm:inline">{t.shareProfile}</span>
                    </button>
                    <button
                      type="button"
                      onClick={openProfileEdit}
                      className="px-3.5 py-2 bg-theme text-[#04060C] rounded-xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all shadow-theme hover:scale-105"
                    >
                      <Edit3 size={15}/> <span>{t.editProfile}</span>
                    </button>
                  </div>
                </div>

                <div className="px-6 pb-8 sm:px-12 relative -mt-20 sm:-mt-24 flex flex-col sm:flex-row items-center sm:items-end justify-between gap-6">
                  <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 sm:gap-7 text-center sm:text-left">
                    <div className="relative shrink-0">
                      <img
                        src={userProfile.avatar || AVATAR_DEFAULT}
                        className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border-4 border-[#04060C] bg-[#04060C] object-cover z-10 relative"
                        style={{ boxShadow: `0 0 30px ${themeColor}4d` }}
                        alt="Avatar"
                      />
                      <div className="absolute -bottom-1 -right-1 w-9 h-9 bg-theme rounded-full border-[3px] border-[#04060C] flex items-center justify-center shadow-lg z-20">
                        <span className="text-xs font-black text-[#04060C]">{sortedMyRatings.length}</span>
                      </div>
                    </div>

                    <div className="mb-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-1">
                        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">{userProfile.displayName}</h2>
                        <button
                          type="button"
                          onClick={() => {
                            const codeStr = `@${userProfile.userCode || user?.uid?.substring(0, 6).toUpperCase()}`;
                            navigator.clipboard.writeText(codeStr);
                            showToast(t.userCodeCopied);
                          }}
                          className="font-black text-sm px-3 py-1 rounded-xl border w-max mx-auto sm:mx-0 transition-transform hover:scale-105"
                          style={{ color: themeColor, backgroundColor: `${themeColor}1a`, borderColor: `${themeColor}4d` }}
                        >
                          @{userProfile.userCode || user?.uid?.substring(0, 6).toUpperCase()}
                        </button>
                      </div>

                      <div className="flex items-center justify-center sm:justify-start gap-5 my-2.5">
                        <button
                          type="button"
                          onClick={() => { loadFollowersUsers(); setActiveTab('profile_followers'); }}
                          className="text-slate-400 hover:text-white font-bold text-sm transition-colors"
                        >
                          <strong className="text-white">{userProfile.followers?.length || 0}</strong> {t.followers}
                        </button>
                        <button
                          type="button"
                          onClick={() => { loadFollowingUsers(); setActiveTab('profile_following'); }}
                          className="text-slate-400 hover:text-white font-bold text-sm transition-colors"
                        >
                          <strong className="text-white">{userProfile.following?.length || 0}</strong> {t.following}
                        </button>
                      </div>

                      {userProfile.bio && (
                        <div className="flex items-start justify-center sm:justify-start gap-2 text-theme mt-1">
                          <Quote size={14} className="mt-1 opacity-60 shrink-0"/>
                          <p className="font-medium italic text-sm sm:text-base max-w-lg">{userProfile.bio}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Sağ Özet İstatistik Kutuları */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="bg-[#04060C]/90 border border-slate-800 px-4 py-3 rounded-2xl text-center min-w-[100px]">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">{t.ratedFilmsLabel}</span>
                      <span className="text-2xl font-black text-white mt-0.5 block">{sortedMyRatings.length}</span>
                    </div>
                    <div className="bg-[#04060C]/90 border border-slate-800 px-4 py-3 rounded-2xl text-center min-w-[100px]">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">{t.yourAvg}</span>
                      <span
                        className="text-2xl font-black mt-0.5 block"
                        style={{ color: myAvgScore > 0 ? getScoreColorHex(myAvgScore) : '#64748b' }}
                      >
                        {myAvgScore > 0 ? myAvgScore.toFixed(2) : '—'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. KRALİYET & ALTIN VARAKLI KUTSAL ÜÇLÜ (AURA BAĞIMSIZ, KESİNTİSİZ ANİMASYONLU) */}
              <RoyalTrinityShowcase
                top3List={userProfile.top3 || [null, null, null]}
                t={t}
                isEditable={true}
                selectMovieToRate={selectMovieToRate}
                onOpenSlotSearch={(slot) => {
                  setTop3SlotIndex(slot);
                  setTop3SearchTerm('');
                  setTop3Results([]);
                  setShowTop3Modal(true);
                }}
                onSetCrown={setCrown}
                localizedData={localizedData}
              />

              {/* 3. KUTSAL ÜÇLÜ'NÜN HEMEN ALTINDA: EN ÇOK İZLEDİĞİN YÖNETMEN */}
              {myFavoriteDirector && (
                <FavoriteDirectorShowcase
                  favDirector={myFavoriteDirector}
                  t={t}
                  openPersonCareer={openPersonCareer}
                  selectMovieToRate={selectMovieToRate}
                  localizedData={localizedData}
                  isPublic={false}
                />
              )}

              {/* 4. YÖNETMENİN HEMEN ALTINDA: BİR FİLMDE EN ÇOK ÖNEM VERDİĞİN KRİTERLER (BEŞGEN RADAR + HALKA GRAFİK + BALONCUKLAR) */}
              <CriteriaFocusDashboard
                ratingsList={sortedMyRatings}
                criteriaData={criteriaData}
                t={t}
                isPublic={false}
                themeColor={themeColor}
              />

              {/* 5. ÜÇLÜ YAN YANA ÖZET SATIRI: ACIMASIZLIK ENDEKSİ + FAVORİ ON YIL + SİNEMA BURCU */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Kutu 1: Acımasızlık Endeksi / Eleştirmen Kimliği */}
                <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-6 border border-slate-800 shadow-xl flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                      ELEŞTİRMEN KİMLİĞİ
                    </span>
                    <h4 className="text-xl sm:text-2xl font-black text-white truncate">{criticTitle}</h4>
                    <p className="text-xs font-bold text-slate-400 mt-1 line-clamp-2 leading-snug">{criticSubtitle}</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-[#04060C] border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0 shadow-inner">
                    <TrendingUp size={22}/>
                  </div>
                </div>

                {/* Kutu 2: Favori On Yıl */}
                <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-6 border border-slate-800 shadow-xl flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                      FAVORİ DÖNEM
                    </span>
                    <h4 className="text-xl sm:text-2xl font-black text-white truncate">{favDecadeLabel}</h4>
                    <p className="text-xs font-bold text-slate-400 mt-1 line-clamp-2 leading-snug">En çok puanlanan çıkış yılı aralığı</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-[#04060C] border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
                    <Film size={22}/>
                  </div>
                </div>

                {/* Kutu 3: Küçültülmüş Sinema Burcu */}
                <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-6 border border-slate-800 shadow-xl flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                      {t.cineZodiac}
                    </span>
                    <h4 className="text-xl sm:text-2xl font-black text-white truncate">{zodiacTitle}</h4>
                    <p className="text-xs font-bold text-slate-400 mt-1 line-clamp-2 leading-snug">
                      {zodiacDesc || t.cineZodiacDesc}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-[#04060C] border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0 shadow-inner">
                    <Smile size={22}/>
                  </div>
                </div>
              </div>

              {/* 6. İKİLİ SATIR: FAVORİ TÜRLER & İZLEME LİSTEM (+ SİNEMA RULETİ) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Favori Türler */}
                <div className="bg-slate-900/80 backdrop-blur-xl rounded-[2.5rem] p-6 sm:p-8 border border-slate-800 shadow-xl flex flex-col">
                  <h3 className="text-xl font-black text-white mb-6 flex items-center gap-3">
                    <PieChart className="text-theme" size={24}/> {t.topGenres}
                  </h3>
                  {topGenres.length === 0 ? (
                    <p className="text-slate-500 text-sm font-bold text-center py-8">{t.noRating}</p>
                  ) : (
                    <div className="space-y-4 my-auto">
                      {topGenres.map(([genre, count]) => {
                        const percentage = (count / Math.max(1, sortedMyRatings.length)) * 100;
                        return (
                          <div key={genre}>
                            <div className="flex justify-between items-end mb-1.5">
                              <span className="font-bold text-slate-200 text-sm">{genre}</span>
                              <span className="font-black text-xs text-slate-400">{count} {t.voteCount}</span>
                            </div>
                            <div className="h-2.5 bg-[#04060C] rounded-full overflow-hidden border border-slate-800">
                              <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${percentage}%`, backgroundColor: themeColor }}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* İzleme Listem + Sinema Ruleti */}
                <div className="bg-slate-900/80 backdrop-blur-xl rounded-[2.5rem] p-6 sm:p-8 border border-slate-800 shadow-xl flex flex-col">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
                    <h3
                      onClick={() => setActiveTab('profile_watchlist')}
                      className="text-xl font-black text-white hover:text-theme cursor-pointer flex items-center gap-2.5 transition-colors"
                    >
                      <Bookmark className="text-theme" size={24}/> {t.watchlist} ({sortedWatchlist.length})
                    </h3>
                    <div className="flex items-center gap-2">
                      {sortedWatchlist.length > 0 && (
                        <button
                          type="button"
                          onClick={startCinemaRoulette}
                          className="px-3 py-1.5 rounded-xl bg-theme text-[#04060C] font-black text-xs flex items-center gap-1.5 shadow-theme hover:scale-105 transition-transform"
                        >
                          <Sparkles size={13}/> {t.rouletteBtn}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setActiveTab('profile_watchlist')}
                        className="text-xs font-black text-theme hover:text-white transition-colors"
                      >
                        {t.viewAll} &rarr;
                      </button>
                    </div>
                  </div>

                  {sortedWatchlist.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center">
                      <p className="text-slate-500 text-sm font-bold text-center py-8">{t.emptyWatchlist}</p>
                    </div>
                  ) : (
                    <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
                      {sortedWatchlist.slice(0, 10).map((item) => (
                        <div
                          key={item.id}
                          onClick={() => selectMovieToRate(item.id, item.title)}
                          className="relative w-24 shrink-0 cursor-pointer hover:-translate-y-1 transition-transform"
                        >
                          <img src={item.poster} className="w-full aspect-[2/3] object-cover rounded-xl border border-slate-700 hover:border-theme transition-colors" alt=""/>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 7. OYLADIĞIM FİLMLER VİTRİNİ */}
              <div
                onClick={() => setActiveTab('profile_ratings')}
                className="bg-slate-900/80 backdrop-blur-xl rounded-[2.5rem] p-6 sm:p-8 border border-slate-800 shadow-xl cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-black text-white group-hover:text-theme flex items-center gap-3 transition-colors">
                    <Film className="text-theme" size={24}/> {t.myRatedMovies} ({sortedMyRatings.length})
                  </h3>
                  <span className="text-xs font-black text-theme group-hover:text-white transition-colors">
                    {t.viewAll} &rarr;
                  </span>
                </div>

                {sortedMyRatings.length === 0 ? (
                  <p className="text-slate-500 text-sm font-bold text-center py-8">{t.noRating}</p>
                ) : (
                  <div className="flex gap-3.5 overflow-x-auto hide-scrollbar pb-2">
                    {sortedMyRatings.slice(0, 12).map((item) => {
                      const scColor = getScoreColorHex(item.finalScore);
                      return (
                        <div
                          key={item.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            selectMovieToRate(item.id, item.title);
                          }}
                          className="relative w-24 sm:w-28 shrink-0 hover:-translate-y-1 transition-transform"
                        >
                          <img src={item.poster} className="w-full aspect-[2/3] object-cover rounded-xl border border-slate-700 hover:border-theme transition-all" alt=""/>
                          <div className="absolute inset-0 bg-gradient-to-t from-[#04060C] via-transparent to-transparent rounded-xl flex flex-col justify-end p-2">
                            <span className="text-[9px] font-black text-slate-300 uppercase">{t.yourScoreLabel}</span>
                            <span className="text-lg font-black leading-none mt-0.5" style={{ color: scColor }}>
                              {Number(item.finalScore).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 8. KAZANILAN ROZETLER KOLEKSİYONU */}
              <div className="bg-slate-900/80 backdrop-blur-xl rounded-[2.5rem] p-6 sm:p-8 border border-slate-800 shadow-xl">
                <h3 className="text-xl font-black text-white mb-6 flex items-center gap-3">
                  <Award className="text-theme" size={24}/> {t.badges} ({allMyBadges.filter(b => b.earned).length}/{allMyBadges.length})
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {allMyBadges.map((b) => (
                    <div
                      key={b.id}
                      onClick={() => b.earned && setUnlockedBadgeModal(b)}
                      className={`p-4 rounded-3xl border transition-all flex flex-col items-center text-center relative overflow-hidden ${
                        b.earned
                          ? `cursor-pointer bg-gradient-to-br ${b.cardBg} hover:scale-[1.03]`
                          : 'bg-[#04060C]/70 border-slate-800/80 opacity-45 grayscale'
                      }`}
                    >
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border mb-3 ${b.badgePill}`}>
                        {b.tier}
                      </span>
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br ${b.orbBg} mb-3`}>
                        {b.icon}
                      </div>
                      <h4 className="text-sm font-black text-white mb-1">{b.name}</h4>
                      <p className="text-[11px] font-bold text-slate-300 leading-snug">{b.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          );
        })()}

        {/* YENİ: FİLM SAYFASINDA 3B DNA EŞLEŞME ORANI KUTUSU */}
        {activeTab === 'rate' && selectedMovie && (() => {
          const myDNA3D = analyzeComprehensiveDNA(sortedMyRatings, criteriaData);
          const matchData = calculateMovieDNAMatch(myDNA3D, dbSelectedMovieData, criteriaData, myRatings);
          if (!matchData) return null;

          const matchColor = getScoreColorHex(matchData.score10);
          const critScoreColor = getScoreColorHex(matchData.topCriterionMovieScore);
          const isNeonMatch = matchData.score10 >= 9.0;

          const titleStr = (t.dnaMovieMatchTitle || 'Senin Zevk DNA\'na %{pct} Uyuyor').replace('{pct}', matchData.matchPct);
          const rawFocusTpl = matchData.status === 'strong'
            ? (t.dnaMovieFocusStrong || 'Odak kriterin olan {crit} bu filmde çok güçlü')
            : matchData.status === 'medium'
            ? (t.dnaMovieFocusMedium || 'Odak kriterin olan {crit} bu filmde dengeli seviyede')
            : (t.dnaMovieFocusWeak || 'Odak kriterin olan {crit} bu filmde zayıf kalmış');
          const focusSubtitle = rawFocusTpl.replace('{crit}', matchData.topCriterionName);

          return (
            <div
              className="mb-6 bg-slate-900/85 backdrop-blur-xl rounded-[2rem] p-4 sm:p-6 border shadow-2xl relative overflow-hidden animate-in fade-in slide-in-from-top-3 duration-500"
              style={{
                borderColor: `${matchColor}66`,
                boxShadow: isNeonMatch ? `0 0 35px ${matchColor}33` : '0 20px 50px rgba(0,0,0,0.65)'
              }}
            >
              <div
                className="absolute -left-16 -top-16 w-56 h-56 rounded-full blur-[85px] opacity-25 pointer-events-none"
                style={{ backgroundColor: matchColor }}
              ></div>

              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6 relative z-10">
                {/* Sol: Yüzde Rozeti ve Ana DNA Analiz Metni */}
                <div className="flex items-center gap-3.5 sm:gap-5 min-w-0">
                  <div
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#04060C] border-2 flex flex-col items-center justify-center shrink-0 shadow-xl"
                    style={{
                      borderColor: matchColor,
                      boxShadow: `0 0 22px ${matchColor}40`
                    }}
                  >
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">DNA</span>
                    <span
                      className="text-lg sm:text-2xl font-black leading-none"
                      style={{ color: matchColor, textShadow: isNeonMatch ? `0 0 12px ${matchColor}` : 'none' }}
                    >
                      %{matchData.matchPct}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#04060C] border text-[9px] sm:text-[10px] font-black uppercase tracking-widest mb-1"
                      style={{ borderColor: `${matchColor}55`, color: matchColor }}
                    >
                      🧬 {t.dnaMovieBadge || '3B DNA EŞLEŞME ALGORİTMASI'}
                    </span>
                    <h3 className="text-base sm:text-2xl font-black text-white leading-snug">
                      🧬 {titleStr}
                    </h3>
                    <p className="text-xs sm:text-sm font-bold text-slate-300 mt-1 leading-relaxed">
                      {focusSubtitle}{' '}
                      <span
                        className="inline-block font-black px-2 py-0.5 rounded-lg bg-[#04060C] border ml-1"
                        style={{ color: critScoreColor, borderColor: `${critScoreColor}55` }}
                      >
                        ({matchData.topCriterionMovieScore.toFixed(1)})
                      </span>
                    </p>
                  </div>
                </div>

                {/* Sağ: 5 Kriterlik Mini DNA-Film Karşılaştırma Hapları */}
                <div className="grid grid-cols-5 gap-1.5 sm:gap-2 w-full lg:w-auto shrink-0">
                  {matchData.critDetails.map((cd) => {
                    const cHex = getScoreColorHex(cd.movieScore);
                    const isTopCrit = cd.name === matchData.topCriterionName;
                    return (
                      <div
                        key={cd.id}
                        className={`px-2 py-2 rounded-xl bg-[#04060C] border text-center min-w-0 ${
                          isTopCrit ? 'scale-[1.03]' : 'border-slate-800/90 opacity-90'
                        }`}
                        style={isTopCrit ? { borderColor: cHex, boxShadow: `0 0 14px ${cHex}33` } : undefined}
                      >
                        <span className="text-[8px] sm:text-[9px] font-black text-slate-400 truncate block">
                          {cd.name}
                        </span>
                        <span className="text-xs sm:text-sm font-black block mt-0.5" style={{ color: cHex }}>
                          {cd.movieScore.toFixed(1)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })()}

{/* YENİ: MİNİ OYUN: SİNEBAĞ (SİNEMATİK PRİZMA ARENA — NEO-BRUTALIST GÜNCELLEME) */}
        {activeTab === 'game' && (
          <div className="rounded-lg bg-[#03050A] border-2 border-indigo-500/40 p-4 sm:p-8 md:p-10 shadow-[12px_12px_0px_rgba(0,0,0,1)] relative overflow-hidden animate-in fade-in duration-500">
            
            <div className="absolute -top-36 -left-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-[130px] pointer-events-none"></div>
            <div className="absolute -top-36 -right-24 w-96 h-96 bg-fuchsia-600/10 rounded-full blur-[130px] pointer-events-none"></div>

            {/* ZAFER KARTI (PNG) ÖNİZLEME VE İNDİRME PENCERESİ */}
            {winCardModal.show && (
              <div className="fixed inset-0 z-[190] flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
                <div className="bg-[#03050A] border-2 border-indigo-500 rounded-lg p-4 sm:p-6 w-full max-w-md text-center relative shadow-[12px_12px_0px_rgba(0,0,0,1)]">
                  <button
                    onClick={() => setWinCardModal({ show: false, generating: false, imageUrl: null })}
                    className="absolute top-4 right-4 p-2 rounded-sm bg-[#03050A] text-slate-400 hover:text-white border-2 border-slate-700 shadow-[2px_2px_0px_rgba(0,0,0,1)] magnetic-btn"
                  >
                    <X size={18}/>
                  </button>
                  <div className="text-left pb-3 mb-4 border-b-2 border-white/10">
                    <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 block">SİNEBAĞ // PAYLAŞIM KARTI</span>
                    <h3 className="text-sm sm:text-base font-black text-white drop-shadow-[1px_1px_0px_rgba(0,0,0,1)]">
                      {t.winCardModalTitle || 'SineBağ Zafer Kartı (Spoiler\'sız)'}
                    </h3>
                  </div>

                  {winCardModal.generating ? (
                    <div className="py-24 flex flex-col items-center justify-center gap-3">
                      <Loader2 size={32} className="animate-spin text-cyan-400"/>
                      <span className="text-xs font-bold text-slate-400">{t.storyGenerating || 'Kart hazırlanıyor...'}</span>
                    </div>
                  ) : winCardModal.imageUrl && (
                    <div className="space-y-4">
                      <img src={winCardModal.imageUrl} className="w-full max-h-[60vh] object-contain rounded-sm border-2 border-white/15 mx-auto shadow-[6px_6px_0px_rgba(0,0,0,1)]" alt="SineBag Victory Card"/>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <a
                          href={winCardModal.imageUrl}
                          download={`SineBag_${Date.now()}.png`}
                          className="py-3 px-3 rounded-sm bg-cyan-400 hover:bg-cyan-300 text-[#03050A] border-2 border-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[4px_4px_0px_rgba(0,0,0,1)] magnetic-btn"
                        >
                          📥 {t.downloadStory || 'İndir (PNG)'}
                        </a>
                        <button
                          onClick={copySineBagChallengeLink}
                          className="py-3 px-3 rounded-sm bg-[#03050A] hover:bg-slate-800 text-cyan-300 border-2 border-cyan-500 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[4px_4px_0px_rgba(0,0,0,1)] magnetic-btn"
                        >
                          🔗 {t.copyChallengeBtn || 'Linki Kopyala'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ÜST BAŞLIK BAR */}
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-7 border-b-2 border-white/10">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-cyan-500/15 border-2 border-cyan-400 text-cyan-300 text-[10px] sm:text-[11px] font-black uppercase tracking-widest mb-2 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                  <Sparkles size={13} className="text-fuchsia-400 animate-pulse"/> {t.miniGameNav}
                </div>
                <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                  {t.gameTitle}
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1 max-w-2xl">
                  {t.gameSubtitle}
                </p>
              </div>

              <button
                onClick={() => setShowHowToPlay(!showHowToPlay)}
                className={`self-start sm:self-auto px-4 py-2.5 rounded-sm font-black text-xs flex items-center gap-2 shrink-0 border-2 transition-all magnetic-btn shadow-[4px_4px_0px_rgba(0,0,0,1)] ${
                  showHowToPlay
                    ? 'bg-cyan-400 text-[#03050A] border-black shadow-[4px_4px_0px_rgba(0,0,0,1)]'
                    : 'bg-[#03050A] text-cyan-300 border-cyan-500 hover:border-white hover:text-white'
                }`}
              >
                <HelpCircle size={16}/>
                <span>{showHowToPlay ? t.hideGuideBtn : t.showGuideBtn}</span>
              </button>
            </div>

            {/* NASIL OYNANIR REHBERİ */}
            {showHowToPlay && (
              <div className="relative z-10 mb-8 bg-[#03050A] border-2 border-indigo-500 rounded-sm p-4 sm:p-6 space-y-4 shadow-[6px_6px_0px_rgba(0,0,0,1)] animate-in slide-in-from-top-3 duration-300">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  {[
                    { step: '01', title: t.howStep1Title, desc: t.howStep1Desc, badge: 'text-cyan-400 bg-cyan-500/15 border-cyan-500' },
                    { step: '02', title: t.howStep2Title, desc: t.howStep2Desc, badge: 'text-fuchsia-400 bg-fuchsia-500/15 border-fuchsia-500' },
                    { step: '03', title: t.howStep3Title, desc: t.howStep3Desc, badge: 'text-indigo-400 bg-indigo-500/15 border-indigo-500' },
                    { step: '04', title: t.howStep4Title, desc: t.howStep4Desc, badge: 'text-emerald-400 bg-emerald-500/15 border-emerald-500' }
                  ].map((item, idx) => (
                    <div key={idx} className="bg-[#03050A] border-2 border-white/20 rounded-sm p-4 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                      <span className={`inline-block text-[10px] font-black tracking-widest px-2.5 py-0.5 rounded-sm border-2 mb-2 ${item.badge}`}>
                        {t.stepLabel} {item.step}
                      </span>
                      <h4 className="text-sm font-black text-white mb-1">{item.title}</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-[#03050A] border-2 border-white/20 rounded-sm p-3.5 flex flex-wrap items-center justify-center gap-2 text-xs font-bold shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                  <span className="text-cyan-300 font-black uppercase tracking-wider mr-1">{t.exampleShortestLabel}</span>
                  <span className="px-3 py-1 rounded-sm bg-cyan-500/15 text-cyan-200 border border-cyan-500">🎬 {t.exampleM1}</span>
                  <span className="text-slate-500">➔</span>
                  <span className="px-3 py-1 rounded-sm bg-fuchsia-500/15 text-fuchsia-200 border border-fuchsia-500">🎭 Leonardo DiCaprio</span>
                  <span className="text-slate-500">➔</span>
                  <span className="px-3 py-1 rounded-sm bg-cyan-500/15 text-cyan-200 border border-cyan-500">🎬 {t.exampleM2}</span>
                  <span className="text-slate-500">➔</span>
                  <span className="px-3 py-1 rounded-sm bg-fuchsia-500/15 text-fuchsia-200 border border-fuchsia-500">🎭 Johnny Depp</span>
                  <span className="text-slate-500">➔</span>
                  <span className="px-3 py-1 rounded-sm bg-emerald-500/20 text-emerald-300 border border-emerald-500 font-black">🎯 {t.exampleM3}</span>
                </div>
              </div>
            )}

{!gameActive ? (
              <div className="relative z-10 space-y-7">
                
                {/* GÜNÜN KÖPRÜSÜ KARTI */}
                {dailyBridgeData.start && dailyBridgeData.target && (
                  <div className="rounded-lg bg-[#03050A] border-2 border-fuchsia-500 p-4 sm:p-6 shadow-[8px_8px_0px_rgba(0,0,0,1)] relative overflow-hidden">
                    <div className="absolute -right-12 -top-12 w-48 h-48 bg-fuchsia-500/20 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
                      <div className="space-y-2.5 max-w-xl">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-3 py-1 rounded-sm bg-fuchsia-500 text-black border-2 border-black font-black text-[10px] sm:text-xs uppercase tracking-widest shadow-[2px_2px_0px_rgba(0,0,0,1)] flex items-center gap-1.5">
                            <Flame size={13}/> {t.dailyBridgeTitle} #{dailyBridgeData.dayNum}
                          </span>
                          <span className="px-3 py-1 rounded-sm bg-[#03050A] border-2 border-slate-700 text-slate-300 font-bold text-[11px] shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                            ⏳ {t.nextDailyIn} <strong className="text-white font-mono">{dailyBridgeData.countdown}</strong>
                          </span>
                          <span className="px-3 py-1 rounded-sm bg-[#03050A] border-2 border-indigo-500 text-indigo-300 font-black text-[11px] shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                            🏆 {dailyBridgeData.bestRecord?.bestLinks
                              ? `${t.communityRecordLabel} ${formatRecordSummary(dailyBridgeData.bestRecord)}`
                              : t.noRecordYet}
                          </span>
                          {dailyBridgeData.completedLinks && (
                            <span className="px-3 py-1 rounded-sm bg-[#03050A] border-2 border-emerald-500 text-emerald-300 font-black text-[11px] shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                              ✅ {t.yourBestLabel || 'Senin Skorun:'} {dailyBridgeData.completedLinks} {t.linksCount}
                              {dailyBridgeData.completedTime ? ` • ${formatGameSeconds(dailyBridgeData.completedTime)}` : ''}
                            </span>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-purple-100/90 font-medium leading-relaxed">
                          {t.dailyBridgeDesc}
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 shrink-0">
                        <div className="flex items-center justify-between sm:justify-center gap-3 bg-[#03050A] px-3.5 py-2.5 rounded-sm border-2 border-fuchsia-500 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img src={dailyBridgeData.start.poster} className="w-9 h-13 object-cover rounded-sm border-2 border-cyan-400 shrink-0" alt=""/>
                            <span className="text-xs font-black text-white truncate max-w-[95px] sm:max-w-[125px]">{dailyBridgeData.start.title}</span>
                          </div>
                          <span className="w-7 h-7 rounded-sm bg-fuchsia-500 text-black font-black text-xs flex items-center justify-center shrink-0 border border-black shadow-[1px_1px_0px_rgba(0,0,0,1)]">➔</span>
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img src={dailyBridgeData.target.poster} className="w-9 h-13 object-cover rounded-sm border-2 border-rose-400 shrink-0" alt=""/>
                            <span className="text-xs font-black text-rose-200 truncate max-w-[95px] sm:max-w-[125px]">{dailyBridgeData.target.title}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => startCineLinkGame(dailyBridgeData.start, dailyBridgeData.target, true)}
                          disabled={gameLoading}
                          className="px-6 py-3.5 rounded-sm bg-fuchsia-500 text-black border-2 border-black hover:bg-fuchsia-400 active:scale-95 font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-[4px_4px_0px_rgba(0,0,0,1)] magnetic-btn shrink-0 uppercase"
                        >
                          <Play size={16} fill="currentColor"/> {t.playDailyBtn}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* FİLM SEÇİM ARENASI */}
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-[#03050A] border-2 border-indigo-500/40 rounded-sm px-4 py-3 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400 border border-black animate-ping"></span>
                      <span className="text-xs sm:text-sm font-black text-white tracking-wide">
                        {t.howStep1Title}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => loadPresetOrRandomPair('random')}
                      disabled={gameLoading}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-sm bg-[#03050A] text-theme border-2 border-theme hover:bg-theme hover:text-[#03050A] active:scale-95 font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-[4px_4px_0px_rgba(0,0,0,1)] magnetic-btn shrink-0"
                    >
                      {gameLoading ? <Loader2 size={15} className="animate-spin"/> : <Sparkles size={15}/>}
                      <span>🎲 {t.randomPairBtn}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-11 gap-4 sm:gap-5 items-stretch">
                    
                    {/* BAŞLANGIÇ FİLMİ */}
                    <div className="lg:col-span-5 rounded-lg bg-[#03050A] border-2 border-cyan-500/60 p-5 sm:p-6 flex flex-col justify-between shadow-[6px_6px_0px_rgba(0,0,0,1)]">
                      <div className="flex items-center justify-between pb-3.5 mb-4 border-b-2 border-cyan-500/30">
                        <div className="flex items-center gap-2.5">
                          <span className="w-7 h-7 rounded-sm bg-cyan-400 text-black border-2 border-black font-black text-xs flex items-center justify-center shadow-[2px_2px_0px_rgba(0,0,0,1)]">01</span>
                          <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-cyan-300">{t.startMovieLabel}</span>
                        </div>
                        {gameStartMovie && (
                          <button
                            onClick={() => { setGameStartMovie(null); setGameStartQuery(''); setIsDailyModeActive(false); }}
                            className="text-xs font-bold text-cyan-300 hover:text-white px-3 py-1 rounded-sm bg-[#03050A] border-2 border-cyan-500/40 shadow-[2px_2px_0px_rgba(0,0,0,1)] magnetic-btn transition-colors"
                          >
                            {t.changeMovie}
                          </button>
                        )}
                      </div>

                      {gameStartMovie ? (
                        <div className="flex items-center gap-4 bg-[#03050A] p-3.5 rounded-sm border-2 border-cyan-500/50 shadow-[inset_2px_2px_0px_rgba(0,0,0,0.5)]">
                          <img src={gameStartMovie.poster} className="w-16 sm:w-20 aspect-[2/3] object-cover rounded-sm border-2 border-cyan-400 shrink-0 shadow-[2px_2px_0px_rgba(0,0,0,1)]" alt=""/>
                          <div className="min-w-0 flex-1">
                            <span className="inline-block text-[9px] font-black text-cyan-300 bg-cyan-500/15 px-2 py-0.5 rounded-sm border border-cyan-400 uppercase mb-1">{t.startPointBadge}</span>
                            <h4 className="text-base sm:text-xl font-black text-white truncate drop-shadow-[1px_1px_0px_rgba(0,0,0,1)]">{gameStartMovie.title}</h4>
                            <p className="text-xs font-bold text-slate-400 mt-1">{gameStartMovie.year}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="my-auto">
                          <div className="relative flex items-center">
                            <Search className="absolute left-4 text-cyan-400" size={18}/>
                            <input
                              type="text"
                              value={gameStartQuery}
                              onChange={(e) => setGameStartQuery(e.target.value)}
                              placeholder={t.searchMovieGame}
                              className="w-full bg-[#03050A] border-2 border-cyan-500/50 focus:border-cyan-400 rounded-sm pl-11 pr-10 py-3.5 text-xs sm:text-sm text-white font-bold outline-none transition-all shadow-[inset_4px_4px_0px_rgba(0,0,0,0.5)]"
                            />
                            {gameSearchingSide === 'start' && <Loader2 className="absolute right-4 animate-spin text-cyan-400" size={18}/>}
                          </div>
                          {gameStartResults.length > 0 && (
                            <div className="mt-2 bg-[#03050A] border-2 border-cyan-500/50 rounded-sm overflow-hidden max-h-52 overflow-y-auto divide-y-2 divide-slate-800 shadow-[6px_6px_0px_rgba(0,0,0,1)] hide-scrollbar">
                              {gameStartResults.map(m => (
                                <div
                                  key={m.id}
                                  onClick={() => {
                                    setGameStartMovie({
                                      id: String(m.id),
                                      title: m.title,
                                      year: m.release_date ? m.release_date.split('-')[0] : '',
                                      poster: `https://image.tmdb.org/t/p/w500${m.poster_path}`
                                    });
                                    setIsDailyModeActive(false);
                                    setGameStartResults([]);
                                  }}
                                  className="flex items-center gap-3 p-2.5 hover:bg-cyan-500/20 cursor-pointer transition-colors"
                                >
                                  <img src={`https://image.tmdb.org/t/p/w200${m.poster_path}`} className="w-9 h-12 object-cover rounded-sm shrink-0 border border-slate-700" alt=""/>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs font-black text-white truncate">{m.title}</p>
                                    <span className="text-[10px] font-bold text-cyan-300">{m.release_date?.split('-')[0]}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* ORTA KÖPRÜ İKONU */}
                    <div className="lg:col-span-1 flex items-center justify-center py-1">
                      <div className="w-12 h-12 rounded-sm bg-theme border-2 border-black flex items-center justify-center text-[#03050A] font-black text-base shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                        ⇄
                      </div>
                    </div>

                    {/* HEDEF FİLM */}
                    <div className="lg:col-span-5 rounded-lg bg-[#03050A] border-2 border-rose-500/60 p-5 sm:p-6 flex flex-col justify-between shadow-[6px_6px_0px_rgba(0,0,0,1)]">
                      <div className="flex items-center justify-between pb-3.5 mb-4 border-b-2 border-rose-500/30">
                        <div className="flex items-center gap-2.5">
                          <span className="w-7 h-7 rounded-sm bg-rose-500 text-white border-2 border-black font-black text-xs flex items-center justify-center shadow-[2px_2px_0px_rgba(0,0,0,1)]">02</span>
                          <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-rose-300">{t.targetMovieLabel}</span>
                        </div>
                        {gameTargetMovie && (
                          <button
                            onClick={() => { setGameTargetMovie(null); setGameTargetQuery(''); setIsDailyModeActive(false); }}
                            className="text-xs font-bold text-rose-300 hover:text-white px-3 py-1 rounded-sm bg-[#03050A] border-2 border-rose-500/40 shadow-[2px_2px_0px_rgba(0,0,0,1)] magnetic-btn transition-colors"
                          >
                            {t.changeMovie}
                          </button>
                        )}
                      </div>

                      {gameTargetMovie ? (
                        <div className="flex items-center gap-4 bg-[#03050A] p-3.5 rounded-sm border-2 border-rose-500/50 shadow-[inset_2px_2px_0px_rgba(0,0,0,0.5)]">
                          <img src={gameTargetMovie.poster} className="w-16 sm:w-20 aspect-[2/3] object-cover rounded-sm border-2 border-rose-400 shrink-0 shadow-[2px_2px_0px_rgba(0,0,0,1)]" alt=""/>
                          <div className="min-w-0 flex-1">
                            <span className="inline-block text-[9px] font-black text-rose-300 bg-rose-500/15 px-2 py-0.5 rounded-sm border border-rose-400 uppercase mb-1">{t.targetPointBadge}</span>
                            <h4 className="text-base sm:text-xl font-black text-white truncate drop-shadow-[1px_1px_0px_rgba(0,0,0,1)]">{gameTargetMovie.title}</h4>
                            <p className="text-xs font-bold text-slate-400 mt-1">{gameTargetMovie.year}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="my-auto">
                          <div className="relative flex items-center">
                            <Search className="absolute left-4 text-rose-400" size={18}/>
                            <input
                              type="text"
                              value={gameTargetQuery}
                              onChange={(e) => setGameTargetQuery(e.target.value)}
                              placeholder={t.searchMovieGame}
                              className="w-full bg-[#03050A] border-2 border-rose-500/50 focus:border-rose-400 rounded-sm pl-11 pr-10 py-3.5 text-xs sm:text-sm text-white font-bold outline-none transition-all shadow-[inset_4px_4px_0px_rgba(0,0,0,0.5)]"
                            />
                            {gameSearchingSide === 'target' && <Loader2 className="absolute right-4 animate-spin text-rose-400" size={18}/>}
                          </div>
                          {gameTargetResults.length > 0 && (
                            <div className="mt-2 bg-[#03050A] border-2 border-rose-500/50 rounded-sm overflow-hidden max-h-52 overflow-y-auto divide-y-2 divide-slate-800 shadow-[6px_6px_0px_rgba(0,0,0,1)] hide-scrollbar">
                              {gameTargetResults.map(m => (
                                <div
                                  key={m.id}
                                  onClick={() => {
                                    setGameTargetMovie({
                                      id: String(m.id),
                                      title: m.title,
                                      year: m.release_date ? m.release_date.split('-')[0] : '',
                                      poster: `https://image.tmdb.org/t/p/w500${m.poster_path}`
                                    });
                                    setIsDailyModeActive(false);
                                    setGameTargetResults([]);
                                  }}
                                  className="flex items-center gap-3 p-2.5 hover:bg-rose-500/20 cursor-pointer transition-colors"
                                >
                                  <img src={`https://image.tmdb.org/t/p/w200${m.poster_path}`} className="w-9 h-12 object-cover rounded-sm shrink-0 border border-slate-700" alt=""/>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs font-black text-white truncate">{m.title}</p>
                                    <span className="text-[10px] font-bold text-rose-300">{m.release_date?.split('-')[0]}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                  </div>
                </div>

                {/* BAĞLANTI DURUMU */}
                {gameStartMovie && gameTargetMovie && (
                  <div className="rounded-sm bg-[#03050A] border-2 border-indigo-500 p-4 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                    {bridgeStatus.checking ? (
                      <div className="flex items-center justify-center gap-2.5 text-cyan-300 text-xs font-bold">
                        <Loader2 size={16} className="animate-spin"/> {t.bridgeChecking}
                      </div>
                    ) : !bridgeStatus.possible ? (
                      <div className="text-center space-y-1">
                        <h4 className="text-xs sm:text-sm font-black text-rose-400">{t.bridgeImpossibleTitle}</h4>
                        <p className="text-xs text-slate-300">{bridgeStatus.reason}</p>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                        <span className="font-bold text-emerald-300 flex items-center gap-2">
                          {bridgeStatus.reason}
                        </span>
                        <span className="px-4 py-1.5 rounded-sm bg-[#03050A] border-2 border-indigo-400 font-black text-indigo-200 shrink-0 flex items-center gap-2 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                          <Trophy size={14} className="text-cyan-400"/>
                          {communityRecord?.bestLinks
                            ? `${t.communityRecordLabel} ${formatRecordSummary(communityRecord)}`
                            : t.noRecordYet}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* OYUN MODÜLLERİ VE POPÜLER ROTALAR */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                  
                  {/* ZORLU MODLAR */}
                  <div className="lg:col-span-6 rounded-lg bg-[#03050A] border-2 border-indigo-500/40 p-5 sm:p-6 flex flex-col justify-between space-y-4 shadow-[6px_6px_0px_rgba(0,0,0,1)]">
                    <div className="flex items-center justify-between pb-3 border-b-2 border-white/10">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 block">OYUN MODÜLLERİ</span>
                        <h3 className="text-sm sm:text-base font-black text-white mt-0.5">
                          {t.hardModesTitle || 'Zorlu Modlar'}
                        </h3>
                      </div>
                      <Settings size={18} className="text-indigo-400"/>
                    </div>

                    <div className="space-y-3">
                      <div
                        onClick={() => setBlitzMode(!blitzMode)}
                        className={`cursor-pointer p-4 rounded-sm border-2 transition-all flex items-center justify-between gap-4 shadow-[4px_4px_0px_rgba(0,0,0,1)] ${
                          blitzMode
                            ? 'bg-cyan-950/40 border-cyan-400'
                            : 'bg-[#03050A] border-slate-800 hover:border-slate-600'
                        }`}
                      >
                        <div className="min-w-0">
                          <span className={`text-xs sm:text-sm font-black block ${blitzMode ? 'text-cyan-300' : 'text-white'}`}>
                            {t.blitzModeTitle}
                          </span>
                          <span className="text-[11px] text-slate-400 block mt-0.5 leading-snug">
                            {t.blitzModeDesc}
                          </span>
                        </div>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={blitzMode}
                          className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-sm border-2 border-black transition-colors duration-300 ease-in-out ${
                            blitzMode ? 'bg-cyan-400' : 'bg-slate-800'
                          }`}
                          style={{ width: '52px' }}
                        >
                          <span
                            className={`pointer-events-none inline-block h-6 w-6 transform rounded-sm bg-black ring-0 transition duration-300 ease-in-out ${
                              blitzMode ? 'translate-x-6' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      <div
                        onClick={() => setBannedActorMode(!bannedActorMode)}
                        className={`cursor-pointer p-4 rounded-sm border-2 transition-all flex items-center justify-between gap-4 shadow-[4px_4px_0px_rgba(0,0,0,1)] ${
                          bannedActorMode
                            ? 'bg-rose-950/40 border-rose-400'
                            : 'bg-[#03050A] border-slate-800 hover:border-slate-600'
                        }`}
                      >
                        <div className="min-w-0">
                          <span className={`text-xs sm:text-sm font-black block ${bannedActorMode ? 'text-rose-300' : 'text-white'}`}>
                            {t.bannedModeTitle}
                          </span>
                          <span className="text-[11px] text-slate-400 block mt-0.5 leading-snug">
                            {t.bannedModeDesc}
                          </span>
                        </div>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={bannedActorMode}
                          className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-sm border-2 border-black transition-colors duration-300 ease-in-out ${
                            bannedActorMode ? 'bg-rose-500' : 'bg-slate-800'
                          }`}
                          style={{ width: '52px' }}
                        >
                          <span
                            className={`pointer-events-none inline-block h-6 w-6 transform rounded-sm bg-black ring-0 transition duration-300 ease-in-out ${
                              bannedActorMode ? 'translate-x-6' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* POPÜLER EŞLEŞMELER */}
                  <div className="lg:col-span-6 rounded-lg bg-[#03050A] border-2 border-indigo-500/40 p-5 sm:p-6 flex flex-col justify-between space-y-4 shadow-[6px_6px_0px_rgba(0,0,0,1)]">
                    <div className="flex items-center justify-between pb-3 border-b-2 border-white/10">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 block">HIZLI BAŞLANGIÇ</span>
                        <h3 className="text-sm sm:text-base font-black text-white mt-0.5">
                          {t.popularRoutesHeading || 'Popüler Eşleşmeler'}
                        </h3>
                      </div>
                      <Flame size={18} className="text-fuchsia-400"/>
                    </div>

                    <div className="space-y-3">
                      {[
                        { key: 'classic', code: '#1', label: t.popGame1 || 'Zindan Adası ➔ Karayip Korsanları', pill: 'bg-cyan-400 text-black border-cyan-300' },
                        { key: 'popular2', code: '#2', label: t.popGame2 || 'Başlangıç ➔ Yüzüklerin Efendisi', pill: 'bg-fuchsia-500 text-white border-fuchsia-400' },
                        { key: 'popular3', code: '#3', label: t.popGame3 || 'Ucuz Roman ➔ Kara Şövalye', pill: 'bg-emerald-400 text-black border-emerald-300' }
                      ].map(pg => (
                        <button
                          key={pg.key}
                          onClick={() => loadPresetOrRandomPair(pg.key)}
                          disabled={gameLoading}
                          className="w-full text-left p-3.5 rounded-sm bg-[#03050A] hover:bg-slate-800 border-2 border-slate-800 hover:border-theme transition-all flex items-center justify-between gap-3 group shadow-[4px_4px_0px_rgba(0,0,0,1)] magnetic-btn"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className={`text-[10px] font-black px-2.5 py-1 rounded-sm border-2 border-black shrink-0 shadow-[1px_1px_0px_rgba(0,0,0,1)] ${pg.pill}`}>{pg.code}</span>
                            <span className="text-xs sm:text-sm font-black text-slate-200 group-hover:text-white truncate">{pg.label}</span>
                          </div>
                          <ChevronRight size={16} className="text-slate-500 group-hover:text-theme shrink-0"/>
                        </button>
                      ))}
                    </div>
                  </div>

                </div>

                {/* BAŞLAT BUTONU */}
                <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4">
                  <button
                    onClick={() => startCineLinkGame()}
                    disabled={!gameStartMovie || !gameTargetMovie || String(gameStartMovie.id) === String(gameTargetMovie.id) || gameLoading || bridgeStatus.checking || !bridgeStatus.possible}
                    className="px-12 py-4 rounded-sm bg-theme text-[#03050A] border-2 border-black hover:scale-[1.01] active:scale-95 disabled:opacity-25 disabled:pointer-events-none font-black text-sm sm:text-base uppercase tracking-wider transition-all shadow-[6px_6px_0px_rgba(0,0,0,1)] magnetic-btn inline-flex items-center justify-center gap-3"
                  >
                    {gameLoading ? <Loader2 className="animate-spin" size={20}/> : <Play size={18} fill="currentColor"/>}
                    {t.startGameBtn}
                  </button>

                  {gameStartMovie && gameTargetMovie && bridgeStatus.possible && (
                    <button
                      onClick={copySineBagChallengeLink}
                      className="px-6 py-4 rounded-sm bg-[#03050A] hover:bg-slate-800 text-cyan-300 border-2 border-cyan-500 font-black text-xs sm:text-sm inline-flex items-center justify-center gap-2 transition-all shadow-[4px_4px_0px_rgba(0,0,0,1)] magnetic-btn uppercase tracking-wider"
                    >
                      🔗 {t.copyChallengeBtn}
                    </button>
                  )}
                </div>

              </div>
            ) : (
              /* OYUN İÇİ AKTİF ARENA */
              <div className="relative z-10 space-y-5">
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 bg-[#03050A] border-2 border-indigo-500/40 rounded-lg p-3 sm:p-4 shadow-[6px_6px_0px_rgba(0,0,0,1)]">
                  <div className="bg-[#03050A] border-2 border-cyan-500/40 rounded-sm p-2.5 flex items-center gap-3 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                    <div className="w-9 h-9 rounded-sm bg-cyan-400 border border-black flex items-center justify-center text-black font-black text-sm shrink-0">
                      ⏱
                    </div>
                    <div className="min-w-0">
                      <span className="text-[9px] font-black uppercase tracking-widest text-cyan-400 block">
                        {t.stopwatchLabel || 'SÜRE'}
                      </span>
                      <span className="text-sm sm:text-lg font-mono font-black text-white">
                        {(gameElapsedDeci / 10).toFixed(1)} {unitSec}
                      </span>
                    </div>
                  </div>

                  <div className="bg-[#03050A] border-2 border-fuchsia-500/40 rounded-sm p-2.5 flex items-center gap-3 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                    <div className="w-9 h-9 rounded-sm bg-fuchsia-500 border border-black flex items-center justify-center text-white font-black text-sm shrink-0">
                      🔗
                    </div>
                    <div className="min-w-0">
                      <span className="text-[9px] font-black uppercase tracking-widest text-fuchsia-400 block">
                        {t.linksCount}
                      </span>
                      <span className="text-sm sm:text-lg font-mono font-black text-white">
                        {Math.floor(gameChain.length / 2)}
                      </span>
                    </div>
                  </div>

                  <div className="col-span-2 bg-[#03050A] border-2 border-indigo-500/40 rounded-sm p-2.5 flex items-center justify-between gap-3 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-sm bg-indigo-500 border border-black flex items-center justify-center text-white shrink-0">
                        <Trophy size={16}/>
                      </div>
                      <div className="min-w-0">
                        <span className="text-[9px] font-black uppercase tracking-widest text-indigo-300 block">
                          {t.communityRecordLabel}
                        </span>
                        <span className="text-xs sm:text-sm font-black text-white truncate block">
                          {communityRecord?.bestLinks
                            ? formatRecordSummary(communityRecord)
                            : t.noRecordYet}
                        </span>
                      </div>
                    </div>
                    {isDailyModeActive && (
                      <span className="px-2.5 py-1 rounded-sm bg-fuchsia-500 text-black border border-black text-[10px] font-black shrink-0">
                        #{dailyBridgeData.dayNum}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
                  
                  <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-4">
                    
                    <div className="bg-[#03050A] border-2 border-indigo-500/40 rounded-lg p-4 space-y-4 shadow-[6px_6px_0px_rgba(0,0,0,1)]">
                      <div className="grid grid-cols-2 gap-2.5">
                        <div className="flex items-center gap-2 bg-[#03050A] p-2.5 rounded-sm border-2 border-cyan-500/50 min-w-0 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                          <img src={gameStartMovie?.poster} className="w-8 h-11 object-cover rounded-sm shrink-0 border border-cyan-400" alt=""/>
                          <div className="min-w-0">
                            <span className="text-[8px] font-black text-cyan-400 uppercase block">{t.chainStartBadge}</span>
                            <p className="text-xs font-black text-white truncate">{gameStartMovie?.title}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 bg-[#03050A] p-2.5 rounded-sm border-2 border-rose-500/50 min-w-0 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                          <img src={gameTargetMovie?.poster} className="w-8 h-11 object-cover rounded-sm shrink-0 border border-rose-400" alt=""/>
                          <div className="min-w-0">
                            <span className="text-[8px] font-black text-rose-400 uppercase block">{t.targetMovieLabel}</span>
                            <p className="text-xs font-black text-white truncate">{gameTargetMovie?.title}</p>
                          </div>
                        </div>
                      </div>

                      {bannedActorObj && (
                        <div className="bg-rose-950 border-2 border-rose-500 rounded-sm px-3 py-2 flex items-center justify-between text-[10px] font-black text-rose-300 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                          <span>🚫 YASAKLI:</span>
                          <span className="text-white truncate ml-2">{bannedActorObj.name}</span>
                        </div>
                      )}

                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={handleUndoGameStep}
                          disabled={gameHistoryStack.length === 0 || gameLoading}
                          className="py-2.5 px-2 rounded-sm bg-[#03050A] hover:bg-slate-800 disabled:opacity-30 text-slate-200 border-2 border-slate-700 font-black text-[11px] flex items-center justify-center gap-1 transition-all magnetic-btn shadow-[2px_2px_0px_rgba(0,0,0,1)]"
                        >
                          <ChevronLeft size={14}/> {t.undoStep}
                        </button>

                        <button
                          onClick={() => setShowTargetHint(!showTargetHint)}
                          className={`py-2.5 px-2 rounded-sm font-black text-[11px] flex items-center justify-center gap-1 border-2 transition-all magnetic-btn shadow-[2px_2px_0px_rgba(0,0,0,1)] ${
                            showTargetHint
                              ? 'bg-cyan-400 text-black border-black'
                              : 'bg-[#03050A] hover:bg-slate-800 text-cyan-300 border-cyan-500'
                          }`}
                        >
                          🎯 {t.cast}
                        </button>

                        <button
                          onClick={() => { setGameActive(false); setGameWon(false); setBlitzFailed(false); }}
                          className="py-2.5 px-2 rounded-sm bg-rose-950 hover:bg-rose-600 text-rose-300 hover:text-white border-2 border-rose-500 font-black text-[11px] flex items-center justify-center gap-1 transition-all magnetic-btn shadow-[2px_2px_0px_rgba(0,0,0,1)]"
                        >
                          <X size={13}/> {t.resetGame}
                        </button>
                      </div>

                      {showTargetHint && (
                        <div className="bg-[#03050A] border-2 border-cyan-500 rounded-sm p-3.5 space-y-2 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                          <div className="border-b-2 border-white/10 pb-2">
                            <h5 className="text-[10px] font-black text-cyan-300 uppercase">
                              💡 {t.targetCastExplainTitle}
                            </h5>
                            <p className="text-[10px] text-slate-400 leading-relaxed mt-0.5">
                              {t.targetCastExplainDesc}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1 hide-scrollbar">
                            {gameTargetCast.map(tc => (
                              <span key={tc.id} className="px-2 py-1 rounded-sm bg-[#03050A] border-2 border-slate-700 text-[10px] font-bold text-slate-200">
                                {tc.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="bg-[#03050A] border-2 border-indigo-500/40 rounded-lg p-4 shadow-[6px_6px_0px_rgba(0,0,0,1)]">
                      <div className="flex items-center justify-between mb-3 pb-2.5 border-b-2 border-white/10">
                        <h4 className="text-xs font-black text-cyan-300 uppercase tracking-widest">
                          {t.chainMapTitle}
                        </h4>
                        <span className="px-2 py-0.5 rounded-sm bg-cyan-400 text-black border border-black text-[10px] font-black shadow-[1px_1px_0px_rgba(0,0,0,1)]">
                          {Math.floor(gameChain.length / 2)} {t.linksCount}
                        </span>
                      </div>

                      <div
                        id="game-chain-list"
                        className="flex lg:flex-col items-center lg:items-stretch gap-2.5 overflow-x-auto lg:overflow-x-visible lg:max-h-[420px] lg:overflow-y-auto pb-1 lg:pb-0 pr-1 hide-scrollbar"
                      >
                        {gameChain.map((node, idx) => {
                          const isStart = idx === 0;
                          const isTargetWon = gameWon && idx === gameChain.length - 1;

                          return (
                            <div key={`${node.type}_${node.id}_${idx}`} className="relative flex items-center gap-2.5 shrink-0 lg:shrink">
                              <div className={`w-7 h-7 rounded-sm font-black text-[11px] flex items-center justify-center shrink-0 border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] ${
                                isTargetWon
                                  ? 'bg-emerald-400 text-black'
                                  : node.type === 'movie'
                                  ? 'bg-cyan-400 text-black'
                                  : 'bg-fuchsia-500 text-white'
                              }`}>
                                {idx + 1}
                              </div>

                              <div className={`flex items-center gap-2.5 p-2 rounded-sm border-2 min-w-[140px] sm:min-w-0 lg:flex-1 shadow-[3px_3px_0px_rgba(0,0,0,1)] ${
                                isTargetWon
                                  ? 'bg-emerald-950 border-emerald-400'
                                  : node.type === 'movie'
                                  ? 'bg-[#03050A] border-cyan-500'
                                  : 'bg-[#03050A] border-fuchsia-500'
                              }`}>
                                {node.image ? (
                                  <img
                                    src={node.image}
                                    className={`object-cover shrink-0 border-2 ${
                                      node.type === 'actor' ? 'w-8 h-8 rounded-sm border-fuchsia-400' : 'w-7 h-10 rounded-sm border-cyan-400'
                                    }`}
                                    alt=""
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-sm bg-slate-800 flex items-center justify-center text-slate-400 shrink-0"><User size={13}/></div>
                                )}
                                <div className="min-w-0 flex-1">
                                  <span className={`text-[8px] font-black uppercase tracking-wider block truncate ${
                                    isTargetWon ? 'text-emerald-400' : node.type === 'movie' ? 'text-cyan-300' : 'text-fuchsia-300'
                                  }`}>
                                    {isStart ? t.chainStartBadge : isTargetWon ? t.targetHereBadge : node.type === 'movie' ? `🎬 ${Math.ceil(idx / 2)}. ${t.nodeMovieLabel}` : `🎭 ${Math.ceil(idx / 2)}. ${t.nodeActorLabel}`}
                                  </span>
                                  <p className="text-xs font-black text-white truncate max-w-[100px] sm:max-w-none">{node.name}</p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div id="game-selection-panel" className="lg:col-span-8">
                    {blitzFailed && !gameWon ? (
                      <div className="bg-[#03050A] border-2 border-rose-500 rounded-lg p-8 sm:p-12 text-center space-y-4 shadow-[12px_12px_0px_rgba(0,0,0,1)]">
                        <div className="w-16 h-16 rounded-sm bg-rose-600 border-2 border-black text-white flex items-center justify-center mx-auto text-3xl animate-bounce shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                          ⏱
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black text-white">{t.blitzTimeOutTitle}</h2>
                        <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">{t.blitzTimeOutDesc}</p>
                        <div className="flex flex-wrap justify-center gap-3 pt-3">
                          <button
                            onClick={() => startCineLinkGame(gameStartMovie, gameTargetMovie, isDailyModeActive)}
                            className="px-7 py-3.5 rounded-sm bg-cyan-400 text-black border-2 border-black font-black text-xs sm:text-sm shadow-[4px_4px_0px_rgba(0,0,0,1)] magnetic-btn"
                          >
                            {t.tryAgainBtn}
                          </button>
                          <button
                            onClick={() => { setGameActive(false); setBlitzFailed(false); }}
                            className="px-7 py-3.5 rounded-sm bg-[#03050A] hover:bg-slate-800 text-slate-200 border-2 border-slate-700 font-black text-xs sm:text-sm shadow-[4px_4px_0px_rgba(0,0,0,1)] magnetic-btn"
                          >
                            {t.resetGame}
                          </button>
                        </div>
                      </div>
                    ) : gameWon ? (
                      <div className="bg-[#03050A] border-2 border-emerald-400 rounded-lg p-6 sm:p-10 text-center shadow-[12px_12px_0px_rgba(0,0,0,1)] animate-in zoom-in-95 duration-300">
                        <div className="w-16 h-16 rounded-sm bg-emerald-400 border-2 border-black text-black flex items-center justify-center mx-auto mb-4 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                          <Trophy size={32}/>
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
                          {recordBannerStatus && (
                            <span className="px-3.5 py-1 rounded-sm bg-cyan-400 text-black border-2 border-black text-[10px] sm:text-xs font-black uppercase tracking-widest shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                              {recordBannerStatus === 'new'
                                ? t.newRecordBanner
                                : recordBannerStatus === 'faster'
                                ? (t.fasterRecordBanner || '⚡ YENİ SÜRE REKORU!')
                                : t.recordTiedBanner}
                            </span>
                          )}
                          <span className="px-3.5 py-1 rounded-sm bg-emerald-400 text-black border-2 border-black text-[10px] sm:text-xs font-black uppercase tracking-widest shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                            {Math.floor(gameChain.length / 2) <= 2 ? `🏆 ${t.winRank1}` : Math.floor(gameChain.length / 2) <= 4 ? `🌟 ${t.winRank2}` : `🎬 ${t.winRank3}`}
                          </span>
                        </div>

                        <h2 className="text-2xl sm:text-4xl font-black text-white mb-2">{t.gameWonTitle}</h2>
                        <p className="text-xs sm:text-sm font-bold text-slate-300 mb-6 max-w-md mx-auto">
                          {t.gameWonSubtitle} (<strong className="text-cyan-300">{Math.floor(gameChain.length / 2)} {t.linksCount}</strong> • <strong className="text-emerald-300">⏱ {(gameElapsedDeci / 10).toFixed(1)} {unitSec}</strong>)
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto mb-5">
                          <button
                            onClick={generateSineBagVictoryCard}
                            className="py-3.5 px-4 rounded-sm bg-emerald-400 text-black border-2 border-black font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[4px_4px_0px_rgba(0,0,0,1)] magnetic-btn"
                          >
                            🎟️ {t.createWinCardBtn}
                          </button>
                          <button
                            onClick={copySineBagChallengeLink}
                            className="py-3.5 px-4 rounded-sm bg-[#03050A] text-cyan-300 border-2 border-cyan-500 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[4px_4px_0px_rgba(0,0,0,1)] magnetic-btn"
                          >
                            🔗 {t.copyChallengeBtn}
                          </button>
                        </div>

                        <div className="flex flex-wrap justify-center gap-3 pt-4 border-t-2 border-white/10 max-w-lg mx-auto">
                          <button
                            onClick={() => startCineLinkGame(gameStartMovie, gameTargetMovie, isDailyModeActive)}
                            className="px-5 py-2.5 rounded-sm bg-[#03050A] text-slate-200 border-2 border-slate-700 font-black text-xs shadow-[2px_2px_0px_rgba(0,0,0,1)] magnetic-btn"
                          >
                            {t.retrySameBtn}
                          </button>
                          <button
                            onClick={() => { setGameActive(false); setGameWon(false); }}
                            className="px-6 py-2.5 rounded-sm bg-fuchsia-500 text-white border-2 border-black font-black text-xs shadow-[2px_2px_0px_rgba(0,0,0,1)] magnetic-btn"
                          >
                            {t.playAgainBtn}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className={`rounded-lg p-4 sm:p-6 border-2 transition-colors duration-500 shadow-[10px_10px_0px_rgba(0,0,0,1)] ${
                        gameStepType === 'actor'
                          ? 'bg-[#03050A] border-fuchsia-500'
                          : 'bg-[#03050A] border-cyan-500'
                      }`}>
                        
                        {blitzMode && (
                          <div className="mb-4 bg-[#03050A] border-2 border-slate-800 rounded-sm p-3 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                            <div className="flex items-center justify-between text-xs font-black mb-1.5">
                              <span className={blitzTimeLeft <= 5 ? 'text-rose-400 animate-pulse' : 'text-cyan-300'}>
                                ⚡ BLITZ HAMLE SÜRESİ
                              </span>
                              <span className={`px-2.5 py-0.5 rounded-sm border ${blitzTimeLeft <= 5 ? 'bg-rose-600 text-white border-black' : 'bg-[#03050A] text-cyan-300 border-cyan-500'}`}>
                                {blitzTimeLeft} {unitSec}
                              </span>
                            </div>
                            <div className="w-full h-2.5 bg-black rounded-sm overflow-hidden border border-slate-800">
                              <div
                                className={`h-full transition-all duration-300 ${blitzTimeLeft <= 5 ? 'bg-rose-500' : 'bg-cyan-400'}`}
                                style={{ width: `${(blitzTimeLeft / 15) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        )}

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b-2 border-white/10">
                          <div className="min-w-0">
                            <span className={`inline-block text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-sm mb-1.5 border-2 shadow-[2px_2px_0px_rgba(0,0,0,1)] ${
                              gameStepType === 'actor'
                                ? 'bg-fuchsia-500 text-black border-black'
                                : 'bg-cyan-400 text-black border-black'
                            }`}>
                              {gameStepType === 'actor' ? `🎭 ${t.nextMoveActorBadge}` : `🎬 ${t.nextMoveMovieBadge}`}
                            </span>
                            <h3 className="text-sm sm:text-lg font-black text-white leading-snug drop-shadow-[1px_1px_0px_rgba(0,0,0,1)]">
                              <span className={gameStepType === 'actor' ? 'text-fuchsia-400' : 'text-cyan-300'}>
                                {gameChain[gameChain.length - 1]?.name}
                              </span>{' '}
                              <span className="text-slate-300 font-bold">{gameStepType === 'actor' ? t.stepPickActor : t.stepPickMovie}</span>
                            </h3>
                          </div>

                          <div className="relative w-full sm:w-64 shrink-0">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15}/>
                            <input
                              type="text"
                              value={gameFilterText}
                              onChange={(e) => setGameFilterText(e.target.value)}
                              placeholder={gameStepType === 'actor' ? t.filterActors : t.filterMovies}
                              className="w-full bg-[#03050A] border-2 border-slate-700 focus:border-cyan-400 rounded-sm pl-9 pr-8 py-2.5 text-xs text-white font-bold outline-none transition-colors shadow-[inset_4px_4px_0px_rgba(0,0,0,0.5)]"
                            />
                            {gameFilterText && (
                              <button onClick={() => setGameFilterText('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                                <X size={14}/>
                              </button>
                            )}
                          </div>
                        </div>

                        {gameLoading ? (
                          <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-cyan-400"/></div>
                        ) : (
                          <div id="game-options-grid" className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-3.5 max-h-[60vh] sm:max-h-[65vh] overflow-y-auto pr-1 hide-scrollbar">
                            {gameOptions
                              .filter(opt => opt.name.toLowerCase().includes(gameFilterText.toLowerCase()))
                              .map(opt => {
                                const isTargetMatch = gameStepType === 'movie' && String(opt.id) === String(gameTargetMovie?.id);
                                const isTargetActorMatch = gameStepType === 'actor' && gameTargetCast.some(tc => String(tc.id) === String(opt.id));
                                const isBannedActor = gameStepType === 'actor' && bannedActorObj && String(opt.id) === String(bannedActorObj.id);

                                return (
                                  <div
                                    key={opt.id}
                                    onClick={() => gameStepType === 'actor' ? handlePickGameActor(opt) : handlePickGameMovie(opt)}
                                    className={`group rounded-sm p-1.5 sm:p-2.5 bg-[#03050A] border-2 transition-all duration-200 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:-translate-x-1 ${
                                      isBannedActor
                                        ? 'border-rose-900 opacity-45 cursor-not-allowed'
                                        : isTargetMatch
                                        ? 'border-emerald-400 shadow-[4px_4px_0px_#34d399]'
                                        : isTargetActorMatch
                                        ? 'border-cyan-400 shadow-[4px_4px_0px_#22d3ee]'
                                        : gameStepType === 'actor'
                                        ? 'border-slate-800 hover:border-fuchsia-400'
                                        : 'border-slate-800 hover:border-cyan-400'
                                    }`}
                                  >
                                    <div className="aspect-[3/4] sm:aspect-[2/3] rounded-sm overflow-hidden bg-black mb-2 relative border border-slate-800">
                                      {opt.image ? (
                                        <img src={opt.image} loading="lazy" decoding="async" className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${isBannedActor ? 'grayscale' : ''}`} alt=""/>
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-700"><User size={24}/></div>
                                      )}
                                      {isBannedActor && (
                                        <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-1 text-center">
                                          <span className="bg-rose-600 text-white text-[8px] sm:text-[9px] font-black py-1 px-2 rounded-sm uppercase">
                                            🚫 YASAKLI
                                          </span>
                                        </div>
                                      )}
                                      {!isBannedActor && isTargetMatch && (
                                        <div className="absolute top-1 inset-x-1 bg-emerald-400 text-black text-[8px] sm:text-[9px] font-black py-0.5 px-1 rounded-sm text-center truncate border border-black">
                                          {t.targetHereBadge}
                                        </div>
                                      )}
                                      {!isBannedActor && isTargetActorMatch && (
                                        <div className="absolute top-1 inset-x-1 bg-cyan-400 text-black text-[8px] sm:text-[9px] font-black py-0.5 px-1 rounded-sm text-center truncate border border-black">
                                          ⚡ HEDEF KADRODA
                                        </div>
                                      )}
                                    </div>
                                    <h4 className={`text-[11px] sm:text-xs font-black text-white truncate px-0.5 transition-colors drop-shadow-[1px_1px_0px_rgba(0,0,0,1)] ${
                                      gameStepType === 'actor' ? 'group-hover:text-fuchsia-300' : 'group-hover:text-cyan-300'
                                    }`}>
                                      {opt.name}
                                    </h4>
                                    {opt.sub && <p className="text-[9px] sm:text-[10px] font-bold text-slate-500 truncate px-0.5 mt-0.5">{opt.sub}</p>}
                                  </div>
                                );
                              })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                </div>
              </div>
            )}
          </div>
        )}

{/* YENİ: PUBLIC PROFILE EKRANI */}
        {activeTab === 'public_profile' && viewingUser && (
          <div className="animate-in slide-in-from-right-8 duration-500 max-w-5xl mx-auto space-y-8">
            <button onClick={() => {setActiveTab('community'); setViewingUser(null);}} className="px-5 py-3 bg-[#03050A] border-2 border-slate-800 hover:border-white rounded-sm text-white font-bold flex items-center gap-2 transition-colors w-max shadow-[4px_4px_0px_rgba(0,0,0,1)] magnetic-btn">
               <ChevronLeft size={18}/> Geri
            </button>
            
            <div className="relative rounded-lg overflow-hidden border-2 border-slate-800 shadow-[8px_8px_0px_rgba(0,0,0,1)] group bg-[#03050A]">
              <div className="h-48 sm:h-64 w-full relative">
                 <img src={viewingUser.banner || BANNER_PRESETS[0]} className="w-full h-full object-cover opacity-80" alt="Banner" />
                 <div className="absolute inset-0 bg-gradient-to-t from-[#03050A] via-[#03050A]/60 to-transparent"></div>
                 
                 <div className="absolute top-6 right-6 flex gap-2 z-20">
                   <button onClick={() => copyProfileLink(viewingUser.uid)} className="px-4 py-2 bg-[#03050A] text-slate-300 hover:text-white border-2 border-slate-700 hover:border-white rounded-sm font-bold flex items-center gap-2 transition-all shadow-[4px_4px_0px_rgba(0,0,0,1)] magnetic-btn">
                      <Link size={16}/> <span className="hidden sm:inline">{t.shareProfile}</span>
                   </button>
                   {user && user.uid !== viewingUser.uid && (
                     <button onClick={handleFollowToggle} className={`px-4 py-2 rounded-sm font-bold flex items-center gap-2 transition-all shadow-[4px_4px_0px_rgba(0,0,0,1)] magnetic-btn border-2 ${userProfile?.following?.includes(viewingUser.uid) ? 'bg-rose-500 text-[#03050A] border-black hover:bg-rose-400' : 'bg-theme text-[#03050A] border-black hover:bg-white'}`}>
                        {userProfile?.following?.includes(viewingUser.uid) ? <><UserMinus size={16}/> <span className="hidden sm:inline">{t.unfollow}</span></> : <><UserPlus size={16}/> <span className="hidden sm:inline">{t.follow}</span></>}
                     </button>
                   )}
                 </div>
              </div>
              <div className="px-8 pb-8 sm:px-12 relative -mt-20 sm:-mt-24 flex flex-col sm:flex-row items-center sm:items-end gap-6 sm:gap-8">
                 <div className="relative">
                   <img src={viewingUser.avatar || AVATAR_DEFAULT} className="w-32 h-32 sm:w-40 sm:h-40 rounded-sm border-4 border-[#03050A] bg-[#03050A] object-cover shadow-[6px_6px_0px_rgba(0,0,0,1)] z-10 relative" style={{borderColor: themeColor}} alt="Avatar"/>
                   <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-theme rounded-sm border-2 border-[#03050A] flex items-center justify-center shadow-[2px_2px_0px_rgba(0,0,0,1)] transform rotate-12 z-20">
                     <span className="text-xs font-black text-[#03050A]">{sortedViewingUserRatings.length}</span>
                   </div>
                 </div>
                 <div className="text-center sm:text-left flex-1 mb-2">
                    <div className="flex flex-col sm:flex-row sm:items-end gap-2 sm:gap-4 mb-1">
                      <h2 className="text-4xl sm:text-5xl font-black text-white drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] tracking-tight">{viewingUser.displayName}</h2>
                      <span className="font-black text-lg px-3 py-1 rounded-sm border-2 shadow-[2px_2px_0px_rgba(0,0,0,1)] w-max mx-auto sm:mx-0" style={{color: themeColor, backgroundColor: '#03050A', borderColor: themeColor}}>@{viewingUser.userCode || (viewingUser.uid ? viewingUser.uid.substring(0,6).toUpperCase() : '')}</span>
                    </div>
                    <div className="flex items-center justify-center sm:justify-start gap-4 mb-3 mt-2">
                       <span className="text-slate-400 font-bold text-sm"><strong className="text-white">{viewingUser.followers?.length || 0}</strong> {t.followers}</span>
                       <span className="text-slate-400 font-bold text-sm"><strong className="text-white">{viewingUser.following?.length || 0}</strong> {t.following}</span>
                    </div>
                    {viewingUser.bio && (
                      <div className="flex items-start justify-center sm:justify-start gap-2 text-theme">
                        <Quote size={14} className="mt-1 opacity-50 shrink-0"/>
                        <p className="font-medium italic text-sm sm:text-base drop-shadow-[1px_1px_0px_rgba(0,0,0,1)] max-w-lg">{viewingUser.bio}</p>
                      </div>
                    )}
                 </div>
              </div>
            </div>
            
            {/* ZEVK UYUMU KARTI VE RADAR ÇİZELGESİ */}
            {tasteMatchScore !== null && (
              <div className="flex flex-col items-center justify-center -mt-4 mb-4 gap-6">
                 <div className="flex items-center gap-3 bg-[#03050A] border-2 border-orange-500 px-6 py-3 rounded-sm shadow-[4px_4px_0px_rgba(249,115,22,1)] magnetic-btn">
                    <Flame size={24} className="text-orange-500 animate-pulse" />
                    <span className="text-sm font-bold text-slate-300">{t.tasteMatch}: <strong className="text-orange-400 text-lg ml-1">% {tasteMatchScore}</strong></span>
                 </div>
                 
                 {userProfile && viewingUserRatings.length >= 10 && sortedMyRatings.length >= 10 && (
                   <div className="w-full max-w-[95vw] sm:max-w-md bg-[#03050A] border-2 border-slate-800 rounded-lg p-6 sm:p-8 shadow-[8px_8px_0px_rgba(0,0,0,1)] mt-4">
                     <div className="flex items-center justify-center gap-3 mb-6 relative">
                        <Sparkles size={20} className="text-theme"/>
                        <h4 className="text-center text-sm font-black text-white uppercase tracking-widest drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">DNA Kesişim Radarı</h4>
                     </div>
                     <div className="relative w-full aspect-square">
                       <svg viewBox="-25 -25 150 150" className="w-full h-full overflow-visible">
                         {[20, 40, 60, 80, 100].map(r => (
                           <polygon key={r} points={criteriaData.map((_, i) => { const a = (Math.PI * 2 * i / 5) - Math.PI/2; return `${50 + (r/2)*Math.cos(a)},${50 + (r/2)*Math.sin(a)}`; }).join(' ')} fill={r === 100 ? '#04060C' : 'none'} stroke="#1e293b" strokeWidth="0.5" className={r === 100 ? 'opacity-50' : ''}/>
                         ))}
                         {criteriaData.map((c, i) => {
                           const a = (Math.PI * 2 * i / 5) - Math.PI/2;
                           const x = 50 + 50 * Math.cos(a); const y = 50 + 50 * Math.sin(a);
                           const labelX = 50 + 64 * Math.cos(a); const labelY = 50 + 64 * Math.sin(a); 
                           return (
                             <g key={c.id}>
                               <line x1="50" y1="50" x2={x} y2={y} stroke="#1e293b" strokeWidth="0.5" />
                               <text x={labelX} y={labelY} textAnchor="middle" dominantBaseline="middle" fill="#94a3b8" fontSize="5" fontWeight="900" className="drop-shadow-[1px_1px_0px_rgba(0,0,0,1)]" style={{letterSpacing: '0.05em'}}>{c.name.toUpperCase()}</text>
                             </g>
                           )
                         })}
                         <polygon points={criteriaData.map((c, i) => { 
                             const a = (Math.PI * 2 * i / 5) - Math.PI/2;
                             const theirDNA = calculateDNA(sortedViewingUserRatings);
                             const val = (theirDNA[c.id] || 0) * 5; 
                             return `${50 + val*Math.cos(a)},${50 + val*Math.sin(a)}`; 
                           }).join(' ')} fill={`${themeColor}33`} stroke={themeColor} strokeWidth="1.5" className="transition-all duration-1000 animate-pulse" style={{filter: `drop-shadow(0 0 8px ${themeColor}80)`}}/>
                         <polygon points={criteriaData.map((c, i) => { 
                             const a = (Math.PI * 2 * i / 5) - Math.PI/2;
                             const val = (userDNA[c.id] || 0) * 5; 
                             return `${50 + val*Math.cos(a)},${50 + val*Math.sin(a)}`; 
                           }).join(' ')} fill="rgba(255,255,255,0.05)" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="3,2" className="transition-all duration-1000"/>
                       </svg>
                     </div>
                     <div className="flex flex-wrap justify-center gap-6 mt-6 text-[10px] font-black uppercase tracking-widest bg-[#03050A] py-3 px-4 rounded-sm border-2 border-slate-800 shadow-[inset_2px_2px_0px_rgba(0,0,0,0.5)]">
                       <span className="flex items-center gap-2 text-slate-300"><span className="w-4 h-4 border-2 border-white border-dashed rounded-sm"></span> SENİN DNA'N</span>
                       <span className="flex items-center gap-2" style={{color: themeColor}}><span className="w-4 h-4 rounded-sm shadow-[2px_2px_0px_rgba(0,0,0,1)]" style={{backgroundColor: themeColor}}></span> {viewingUser.displayName}</span>
                     </div>
                   </div>
                 )}

                 <div className="w-full mt-2">
                   <CriteriaFocusDashboard
                     ratingsList={sortedViewingUserRatings}
                     criteriaData={criteriaData}
                     t={t}
                     isPublic={true}
                     themeColor={themeColor}
                   />
                 </div>

                 {/* ARKADAŞLA KAFA KAFAYA (VS) KARŞILAŞTIRMA MODU */}
                 {(() => {
                   const common = [];
                   sortedMyRatings.forEach(myR => {
                     const theirR = sortedViewingUserRatings.find(tr => String(tr.id) === String(myR.id));
                     if (theirR) {
                       common.push({
                         id: myR.id,
                         title: localizedData?.[myR.id]?.title || myR.title,
                         poster: myR.poster,
                         myScore: Number(myR.finalScore),
                         theirScore: Number(theirR.finalScore),
                         diff: Math.abs(Number(myR.finalScore) - Number(theirR.finalScore))
                       });
                     }
                   });
                   if (common.length === 0) return null;
                   const disagreements = [...common].sort((a, b) => b.diff - a.diff).filter(m => m.diff >= 1.5).slice(0, 3);
                   const agreements = [...common].sort((a, b) => a.diff - b.diff).filter(m => m.diff < 1.5).slice(0, 3);

                   return (
                     <div className="w-full cine-glass border-2 border-slate-800 rounded-lg p-6 sm:p-8 shadow-[8px_8px_0px_rgba(0,0,0,1)] mt-2">
                       <h4 className="text-center text-lg sm:text-xl font-black text-white flex items-center justify-center gap-2 mb-6 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                         <Flame className="text-rose-500" size={24}/> {t.vsTitle || 'Kafa Kafaya (VS) Analizi'}
                       </h4>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         {/* En Çok Ayrışılanlar */}
                         <div className="bg-[#03050A] border-2 border-rose-500 rounded-sm p-4 sm:p-5 shadow-[4px_4px_0px_rgba(244,63,94,0.5)]">
                           <h5 className="text-xs font-black text-rose-400 uppercase tracking-widest mb-4 flex items-center gap-2">⚡ {t.vsDisagree || 'En Çok Ayrıştıklarınız'}</h5>
                           {disagreements.length === 0 ? <p className="text-xs text-slate-500 font-bold py-4 text-center">Büyük bir fikir ayrılığı yok.</p> : (
                             <div className="space-y-3">
                               {disagreements.map(m => (
                                 <div key={m.id} onClick={() => selectMovieToRate(m.id, m.title)} className="flex items-center justify-between gap-2 p-2.5 bg-[#03050A] rounded-sm border-2 border-slate-800 hover:border-rose-500 cursor-pointer transition-all magnetic-btn shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                                   <div className="flex items-center gap-3 min-w-0 flex-1">
                                     <img src={m.poster} className="w-10 h-14 object-cover rounded-sm shrink-0 border-2 border-slate-700" alt=""/>
                                     <div className="min-w-0">
                                       <p className="text-xs font-black text-white truncate drop-shadow-[1px_1px_0px_rgba(0,0,0,1)]">{m.title}</p>
                                       <span className="text-[10px] font-black text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded-sm border border-rose-500/30 mt-1 inline-block">{t.vsDiff}: {m.diff.toFixed(1)}</span>
                                     </div>
                                   </div>
                                   <div className="flex items-center gap-2 shrink-0">
                                     <div className="text-center bg-[#03050A] px-2.5 py-1.5 rounded-sm border-2 border-slate-800 shadow-[inset_2px_2px_0px_rgba(0,0,0,0.5)]">
                                       <span className="text-[8px] text-slate-400 font-black block uppercase">SEN</span>
                                       <span className="text-xs font-black" style={{color: getScoreColorHex(m.myScore)}}>{m.myScore.toFixed(1)}</span>
                                     </div>
                                     <span className="text-[10px] font-black text-rose-500">VS</span>
                                     <div className="text-center bg-[#03050A] px-2.5 py-1.5 rounded-sm border-2 border-slate-800 shadow-[inset_2px_2px_0px_rgba(0,0,0,0.5)]">
                                       <span className="text-[8px] text-slate-400 font-black block uppercase">O</span>
                                       <span className="text-xs font-black" style={{color: getScoreColorHex(m.theirScore)}}>{m.theirScore.toFixed(1)}</span>
                                     </div>
                                   </div>
                                 </div>
                               ))}
                             </div>
                           )}
                         </div>

                         {/* Tamamen Aynı Düşünülenler */}
                         <div className="bg-[#03050A] border-2 border-emerald-500 rounded-sm p-4 sm:p-5 shadow-[4px_4px_0px_rgba(16,185,129,0.5)]">
                           <h5 className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2">🤝 {t.vsAgree || 'Tamamen Aynı Düşündükleriniz'}</h5>
                           {agreements.length === 0 ? <p className="text-xs text-slate-500 font-bold py-4 text-center">Tam eşleşen film henüz yok.</p> : (
                             <div className="space-y-3">
                               {agreements.map(m => (
                                 <div key={m.id} onClick={() => selectMovieToRate(m.id, m.title)} className="flex items-center justify-between gap-2 p-2.5 bg-[#03050A] rounded-sm border-2 border-slate-800 hover:border-emerald-500 cursor-pointer transition-all magnetic-btn shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                                   <div className="flex items-center gap-3 min-w-0 flex-1">
                                     <img src={m.poster} className="w-10 h-14 object-cover rounded-sm shrink-0 border-2 border-slate-700" alt=""/>
                                     <div className="min-w-0">
                                       <p className="text-xs font-black text-white truncate drop-shadow-[1px_1px_0px_rgba(0,0,0,1)]">{m.title}</p>
                                       <span className="text-[10px] font-black text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-sm border border-emerald-500/30 mt-1 inline-block">{t.vsDiff}: {m.diff.toFixed(1)}</span>
                                     </div>
                                   </div>
                                   <div className="flex items-center gap-2 shrink-0">
                                     <div className="text-center bg-[#03050A] px-2.5 py-1.5 rounded-sm border-2 border-slate-800 shadow-[inset_2px_2px_0px_rgba(0,0,0,0.5)]">
                                       <span className="text-[8px] text-slate-400 font-black block uppercase">SEN</span>
                                       <span className="text-xs font-black" style={{color: getScoreColorHex(m.myScore)}}>{m.myScore.toFixed(1)}</span>
                                     </div>
                                     <span className="text-[10px] font-black text-emerald-500">==</span>
                                     <div className="text-center bg-[#03050A] px-2.5 py-1.5 rounded-sm border-2 border-slate-800 shadow-[inset_2px_2px_0px_rgba(0,0,0,0.5)]">
                                       <span className="text-[8px] text-slate-400 font-black block uppercase">O</span>
                                       <span className="text-xs font-black" style={{color: getScoreColorHex(m.theirScore)}}>{m.theirScore.toFixed(1)}</span>
                                     </div>
                                   </div>
                                 </div>
                               ))}
                             </div>
                           )}
                         </div>
                       </div>
                     </div>
                   );
                 })()}
              </div>
            )}

            <div className="mt-12 mb-6 flex items-center gap-4">
               <div className="w-12 h-12 bg-amber-400 text-[#03050A] border-2 border-black flex items-center justify-center shadow-[4px_4px_0px_rgba(0,0,0,1)] rounded-sm shrink-0">
                 <Trophy size={24} />
               </div>
               <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-widest drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] flex-1 border-b-4 border-amber-400/20 pb-2">
                 Vitrin: {t.top3Title}
               </h3>
            </div>
            <RoyalTrinityShowcase
              top3List={viewingUser.top3 || [null, null, null]}
              t={t}
              isEditable={false}
              selectMovieToRate={selectMovieToRate}
              localizedData={localizedData}
            />

            <div className="mt-16">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <div>
                    <div className="flex items-center gap-4 mb-6">
                       <div className="w-12 h-12 bg-theme text-[#03050A] border-2 border-black flex items-center justify-center shadow-[4px_4px_0px_rgba(0,0,0,1)] rounded-sm shrink-0">
                         <Film size={24} />
                       </div>
                       <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-widest drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] flex-1 border-b-4 border-theme/20 pb-2 flex justify-between items-center">
                         <span>{t.theirRatedMovies}</span>
                         <span className="text-xs font-black text-theme hover:text-white transition-colors cursor-pointer" onClick={() => setActiveTab('public_profile_ratings')}>{t.viewAll} &rarr;</span>
                       </h3>
                    </div>
                    <div className="cine-glass p-8 flex flex-col group cursor-pointer h-[calc(100%-80px)]" onClick={() => setActiveTab('public_profile_ratings')}>
                      {sortedViewingUserRatings.length === 0 ? (
                         <div className="flex-1 flex items-center justify-center"><p className="text-slate-500 text-sm font-bold text-center py-8">{t.noRating}</p></div>
                      ) : (
                         <div className="flex gap-4 overflow-x-auto hide-scrollbar py-2 px-1">
                            {sortedViewingUserRatings.slice(0, 5).map(item => (
                              <div key={item.id} className="relative w-24 shrink-0 hover:-translate-y-1 hover:-translate-x-1 transition-transform shadow-[4px_4px_0px_rgba(0,0,0,1)] group-hover:shadow-[6px_6px_0px_var(--theme-color-50)]">
                                <img src={item.poster || 'https://via.placeholder.com/200x300?text=Poster'} className="w-full aspect-[2/3] object-cover rounded-sm border-2 border-slate-700 group-hover:border-theme transition-all" alt=""/>
                                <div className="absolute inset-0 bg-gradient-to-t from-[#03050A] via-transparent to-transparent rounded-sm opacity-90 flex flex-col justify-end p-2">
                                   <span className="text-xl font-black text-white drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] text-right">{Number(item.finalScore).toFixed(2)}</span>
                                </div>
                              </div>
                            ))}
                         </div>
                      )}
                    </div>
                 </div>

                 <div>
                    <div className="flex items-center gap-4 mb-6">
                       <div className="w-12 h-12 bg-fuchsia-500 text-[#03050A] border-2 border-black flex items-center justify-center shadow-[4px_4px_0px_rgba(0,0,0,1)] rounded-sm shrink-0">
                         <PieChart size={24} />
                       </div>
                       <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-widest drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] flex-1 border-b-4 border-fuchsia-500/20 pb-2">
                         {t.topGenres}
                       </h3>
                    </div>
                    <div className="cine-glass p-8 flex flex-col h-[calc(100%-80px)]">
                      {topGenresViewing.length === 0 ? (
                         <p className="text-slate-500 text-sm font-bold text-center py-8">{t.noRating}</p>
                      ) : (
                         <div className="space-y-6">
                           {topGenresViewing.map(([genre, count]) => {
                              const percentage = (count / sortedViewingUserRatings.length) * 100;
                              return (
                                <div key={genre}>
                                  <div className="flex justify-between items-end mb-2">
                                    <span className="font-bold text-slate-300 text-sm">{genre}</span>
                                    <span className="font-black text-sm text-slate-500">{count} {t.voteCount}</span>
                                  </div>
                                  <div className="h-4 bg-[#03050A] rounded-sm overflow-hidden border-2 border-slate-800 shadow-[inset_2px_2px_0px_rgba(0,0,0,0.5)]">
                                    <div className="h-full border-r-2 border-black transition-all duration-1000" style={{width: `${percentage}%`, backgroundColor: themeColor}}></div>
                                  </div>
                                </div>
                              )
                           })}
                         </div>
                      )}
                    </div>
                 </div>
              </div>
            </div>

            {viewingFavoriteDirector && (
              <div className="mt-16">
                 <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-blue-500 text-[#03050A] border-2 border-black flex items-center justify-center shadow-[4px_4px_0px_rgba(0,0,0,1)] rounded-sm shrink-0">
                      <Clapperboard size={24} />
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-widest drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] flex-1 border-b-4 border-blue-500/20 pb-2">
                      Yönetmen Radar
                    </h3>
                 </div>
                 <div className="cine-glass overflow-hidden shadow-[8px_8px_0px_rgba(0,0,0,1)] border-2 border-blue-500/50">
                    <FavoriteDirectorShowcase
                      favDirector={viewingFavoriteDirector}
                      t={t}
                      openPersonCareer={openPersonCareer}
                      selectMovieToRate={selectMovieToRate}
                      localizedData={localizedData}
                      isPublic={true}
                    />
                 </div>
              </div>
            )}

            <div className="mt-16">
                <div className="flex items-center gap-4 mb-6">
                   <div className="w-12 h-12 bg-indigo-500 text-[#03050A] border-2 border-black flex items-center justify-center shadow-[4px_4px_0px_rgba(0,0,0,1)] rounded-sm shrink-0">
                     <Sparkles size={24} />
                   </div>
                   <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-widest drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] flex-1 border-b-4 border-indigo-500/20 pb-2">
                     {t.cinematicDNA}
                   </h3>
                </div>

                <div className="cine-glass p-8">
                  {sortedViewingUserRatings.length >= 20 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6">
                         {criteriaData.map((c) => {
                            const dnaObj = calculateDNA(sortedViewingUserRatings);
                            const score = dnaObj[c.id];
                            const color = getScoreColorHex(score);
                            return (
                              <div key={c.id}>
                                 <div className="flex justify-between items-end mb-2">
                                   <span className="font-bold text-slate-300 text-sm tracking-wide">{c.name}</span>
                                   <span className="font-black text-lg drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]" style={{color: color}}>{score}</span>
                                 </div>
                                 <div className="h-4 bg-[#03050A] rounded-sm overflow-hidden border-2 border-slate-800 shadow-[inset_2px_2px_0px_rgba(0,0,0,0.5)]">
                                   <div className="h-full border-r-2 border-black transition-all duration-1000 relative" style={{width: `${score * 10}%`, backgroundColor: color}}>
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
            
          </div>
        )}

        {/* YENİ: BAŞKASININ TÜM OYLADIĞI FİLMLER EKRANI */}
        {activeTab === 'public_profile_ratings' && viewingUser && (
          <div className="animate-in slide-in-from-right-8 duration-500 max-w-7xl mx-auto space-y-8">
            <button onClick={() => setActiveTab('public_profile')} className="px-5 py-3 bg-[#03050A] border-2 border-slate-800 hover:border-white rounded-sm text-white font-bold flex items-center gap-2 transition-colors w-max shadow-[4px_4px_0px_rgba(0,0,0,1)] magnetic-btn">
               <ChevronLeft size={18}/> Geri
            </button>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
              <h3 className="text-2xl font-black text-white flex items-center gap-3 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]"><Film className="text-theme" size={28}/> {viewingUser.displayName} - {t.theirRatedMovies}</h3>
              <div className="flex items-center gap-3 bg-[#03050A] p-2 rounded-sm border-2 border-slate-800 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                 <ListFilter size={18} className="text-slate-400 ml-2" />
                 <select 
                   value={ratingSortType} 
                   onChange={(e) => setRatingSortType(e.target.value)}
                   className="bg-transparent text-sm font-bold text-white outline-none cursor-pointer pr-2"
                 >
                    <option value="date_desc" className="bg-[#03050A]">{t.sortDate}</option>
                    <option value="my_score_desc" className="bg-[#03050A]">{t.sortMyScore}</option>
                    <option value="global_score_desc" className="bg-[#03050A]">{t.sortGlobalScore}</option>
                 </select>
              </div>
            </div>

            {sortedViewingUserRatings.length === 0 ? (
               <div className="text-center py-20 bg-[#03050A] rounded-sm border-2 border-slate-800 border-dashed shadow-[4px_4px_0px_rgba(0,0,0,1)]">
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
                       <img src={safePoster} className="w-full aspect-[2/3] object-cover rounded-lg bg-[#03050A] border-2 border-slate-800 group-hover:border-theme transition-colors shadow-[4px_4px_0px_rgba(0,0,0,1)] group-hover:shadow-[6px_6px_0px_var(--theme-color-50)] group-hover:-translate-y-1 group-hover:-translate-x-1" alt=""/>
                       
                       {globalScore > 0 && (
                         <div className={`absolute top-2 right-2 px-2 py-1 rounded-sm z-10 pointer-events-none flex flex-col items-center justify-center border-2 ${isNeon ? 'bg-[#03050A] shadow-[2px_2px_0px_#39ff14] animate-pulse' : 'bg-[#03050A] border-slate-700 shadow-[2px_2px_0px_rgba(0,0,0,1)]'}`} style={isNeon ? {borderColor: themeColor} : {}}>
                           <span className="text-[8px] sm:text-[10px] text-slate-400 font-black mb-0.5 uppercase tracking-widest leading-none">{t.globalScoreLabel}</span>
                           <span className="text-sm font-black leading-none" style={{color: isNeon ? themeColor : getScoreColorHex(globalScore)}}>{globalScore.toFixed(2)}</span>
                         </div>
                       )}

                       <div className="absolute inset-0 bg-gradient-to-t from-[#03050A] via-[#03050A]/40 to-transparent rounded-lg opacity-0 group-hover:opacity-100 flex flex-col justify-end p-4 transition-opacity">
                          <div>
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest block mb-1 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">{t.theirScore}</span>
                            <div className="relative w-max">
                              <MiniVFX score={safeScore} />
                              <div className="relative z-10 text-4xl font-black leading-none mb-1 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-colors" style={{color: getScoreColorHex(safeScore)}}>{safeScore.toFixed(2)}</div>
                            </div>
                          </div>
                          <h4 className="font-bold text-white text-sm leading-tight line-clamp-2 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] mt-1">{displayTitle}</h4>
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
              <div className="relative w-full h-[500px] sm:h-[700px] rounded-lg overflow-hidden border-2 border-slate-800 shadow-[8px_8px_0px_rgba(0,0,0,1)] group">
                <img src={currentFeatured.backdrop || currentFeatured.poster} className="absolute inset-0 w-full h-full object-cover transition-all duration-1000 group-hover:scale-105 saturate-110" alt=""/>
                <div className="absolute inset-0 bg-gradient-to-t from-[#03050A] via-[#03050A]/60 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-[#03050A] via-[#03050A]/40 to-transparent"></div>
                
                <button onClick={(e) => { e.stopPropagation(); setHeroIndex((prev) => (prev === 0 ? featuredMovies.length - 1 : prev - 1)); }} className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-[#03050A]/80 backdrop-blur rounded-sm flex items-center justify-center text-white border-2 border-slate-700 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:border-theme magnetic-btn transition-colors z-20 hidden md:flex"><ChevronLeft size={28}/></button>
                <button onClick={(e) => { e.stopPropagation(); setHeroIndex((prev) => (prev + 1) % featuredMovies.length); }} className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-[#03050A]/80 backdrop-blur rounded-sm flex items-center justify-center text-white border-2 border-slate-700 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:border-theme magnetic-btn transition-colors z-20 hidden md:flex"><ChevronRight size={28}/></button>

                <div className="absolute bottom-0 left-0 p-8 sm:p-16 w-full max-w-4xl z-10">
                  <div className="flex items-center gap-2 mb-4"><Award className="text-theme" size={24}/><span className="text-theme font-black tracking-widest text-sm uppercase drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">{t.featured}</span></div>
                  <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-4 leading-tight drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] line-clamp-2">{currentFeatured.title}</h2>
                  <p className="text-slate-300 text-sm sm:text-base lg:text-lg line-clamp-2 sm:line-clamp-3 mb-8 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] font-medium max-w-2xl">{currentFeatured.overview}</p>
                  
                  <div className="flex flex-wrap gap-3 sm:gap-4">
                    <button onClick={() => selectMovieToRate(currentFeatured.tmdbId, currentFeatured.title)} className="px-6 py-3 sm:px-8 sm:py-4 bg-theme text-[#03050A] rounded-sm border-2 border-black font-black transition-all flex items-center gap-2 sm:gap-3 shadow-[6px_6px_0px_rgba(0,0,0,1)] magnetic-btn text-lg sm:text-xl">
                      <Star size={20} className="fill-[#03050A] sm:w-6 sm:h-6"/> {t.rateNow}
                    </button>
                    {currentFeatured.trailerKey && (
                      <a href={`https://www.youtube.com/watch?v=${currentFeatured.trailerKey}`} target="_blank" rel="noreferrer" className="px-6 py-3 sm:px-8 sm:py-4 bg-[rgba(255,255,255,0.03)] backdrop-blur text-white border-2 border-slate-600 rounded-sm font-black transition-all flex items-center gap-2 sm:gap-3 shadow-[6px_6px_0px_rgba(0,0,0,1)] magnetic-btn text-lg sm:text-xl group">
                        <Play size={20} className="fill-current text-white group-hover:text-theme transition-colors sm:w-6 sm:h-6"/> {t.watchTrailer}
                      </a>
                    )}
                  </div>
                </div>

                <div className="absolute bottom-6 right-6 sm:bottom-10 sm:right-10 w-32 sm:w-48 h-2 bg-slate-800 border border-black rounded-sm overflow-hidden z-20 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                   <div key={heroIndex} className="h-full bg-theme animate-hero-bar border-r-2 border-black"></div>
                </div>
              </div>
            )}

            {trendingData.length === 0 && (
              <div className="space-y-10">
                <div className="w-full h-[420px] sm:h-[550px] rounded-[2.5rem] skeleton-shimmer border border-slate-800/80"></div>
                <div className="flex gap-4 sm:gap-6 overflow-hidden">
                  {[1,2,3,4,5,6].map(n => (
                    <div key={n} className="w-32 sm:w-44 aspect-[2/3] rounded-2xl skeleton-shimmer shrink-0 border border-slate-800/80"></div>
                  ))}
                </div>
              </div>
            )}
            {upcomingMovies.length > 0 && <MovieRow title="Yakında Vizyonda" movies={upcomingMovies} icon={<Rocket className="text-blue-500" size={28}/>} t={t} selectMovieToRate={selectMovieToRate} globalMoviesList={safeGlobalMovies} localizedData={localizedData} themeColor={themeColor}/>}
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
              <div className="cine-glass p-6 sm:p-8 relative text-center">
                <button onClick={handleCloseMovie} className="absolute top-4 left-4 p-2 bg-[#03050A] rounded-sm text-slate-400 hover:text-white transition-colors z-10 border-2 border-slate-700 shadow-[2px_2px_0px_rgba(0,0,0,1)] magnetic-btn"><X size={18}/></button>
                
                <div className="absolute top-4 right-4 flex gap-3 z-30">
                   <div className="relative group">
                     <button onClick={() => setShowAddToListModal(true)} className="p-2.5 sm:p-3 rounded-sm transition-all border-2 border-slate-700 bg-[#03050A] text-slate-300 hover:text-theme hover:border-theme shadow-[2px_2px_0px_rgba(0,0,0,1)] magnetic-btn">
                       <ListPlus size={20}/>
                     </button>
                     <div className="absolute bottom-full right-0 mb-2 w-max bg-[#03050A] text-slate-200 text-xs font-bold py-2 px-3 rounded-sm border-2 border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-[2px_2px_0px_rgba(0,0,0,1)] z-50">
                        {t.addCustomListHover}
                     </div>
                   </div>

                   <div className="relative group">
                     <button onClick={toggleWatchlist} className={`p-2.5 sm:p-3 rounded-sm transition-all border-2 magnetic-btn shadow-[2px_2px_0px_rgba(0,0,0,1)] flex items-center justify-center ${isMovieInWatchlist ? 'bg-theme text-[#03050A] border-black' : 'bg-[#03050A] text-slate-300 border-slate-700 hover:text-white hover:border-slate-500'}`}>
                       {isMovieInWatchlist ? <BookmarkCheck size={20} className="fill-current"/> : <Bookmark size={20} />}
                     </button>
                     <div className="absolute bottom-full right-0 mb-2 w-max bg-[#03050A] text-slate-200 text-xs font-bold py-2 px-3 rounded-sm border-2 border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-[2px_2px_0px_rgba(0,0,0,1)] z-50">
                        {isMovieInWatchlist ? t.removeWatchlistHover : t.addWatchlistHover}
                     </div>
                   </div>
                </div>

                <div className="relative w-56 sm:w-64 mx-auto mb-8 mt-6 group">
                   <div className="absolute -inset-4 bg-gradient-to-t from-theme to-transparent opacity-30 blur-[40px] rounded-lg z-0 transition-opacity group-hover:opacity-50" style={{'--tw-gradient-from': `${themeColor} 0%`, '--tw-gradient-to': 'transparent 100%'}}></div>
                   <img src={selectedMovie?.poster} className="relative w-full rounded-lg shadow-[8px_8px_0px_rgba(0,0,0,1)] border-2 border-slate-700 object-cover z-10 transition-transform duration-500 hover:-translate-y-2 hover:-translate-x-2 hover:shadow-[12px_12px_0px_rgba(0,0,0,1)]" alt="Poster"/>
                </div>
                <h2 className="text-3xl font-black text-white leading-tight mb-3 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">{selectedMovie?.title}</h2>
                <div className="flex justify-center flex-wrap gap-2 mb-8">
                  <span className="px-3 py-1.5 bg-[#03050A] rounded-sm text-xs font-black text-slate-300 border-2 border-slate-800 shadow-[2px_2px_0px_rgba(0,0,0,1)]">{selectedMovie?.year}</span>
                  <span className="px-3 py-1.5 bg-[#03050A] rounded-sm text-xs font-black text-slate-300 border-2 border-slate-800 shadow-[2px_2px_0px_rgba(0,0,0,1)]">{selectedMovie?.genre}</span>
                </div>
                
                <div className="text-center mb-2 mt-8 sm:mt-12">
                   <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{t.globalScoreLabel || "Genel Ortalama"}</span>
                </div>
                <div className="relative w-40 h-40 mx-auto rounded-lg border-4 flex items-center justify-center bg-[#03050A] mb-8"
                     style={{ borderColor: globalColorToDisplay, transition: 'border-color 0.5s ease-out', boxShadow: `6px 6px 0px rgba(0,0,0,1)` }}>
                   {dbSelectedMovieData && dbSelectedMovieData.avgScore > 0 && <MegaScoreVFX score={dbSelectedMovieData.avgScore} themeColor={globalColorToDisplay}/>}
                   <div className="text-center relative z-10">
                     <span className="text-6xl font-black block text-white transition-colors duration-500 ease-out drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]" style={{color: globalColorToDisplay}}>{globalScoreToDisplay}</span>
                   </div>
                </div>

                {selectedMovie?.trailerKey && (
                  <a 
                    href={`https://www.youtube.com/watch?v=${selectedMovie.trailerKey}`} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="trailer-hero-btn magnetic-btn w-full py-4 px-5 mb-4 text-white rounded-sm font-black text-sm sm:text-base flex items-center justify-center gap-3 transition-all border-2 border-rose-600 shadow-[4px_4px_0px_rgba(0,0,0,1)] relative overflow-hidden group"
                  >
                    <span className="w-8 h-8 rounded-sm bg-white/10 flex items-center justify-center border border-white/20 shadow-[2px_2px_0px_rgba(0,0,0,0.5)]">
                      <Play size={16} fill="currentColor" className="ml-0.5"/>
                    </span>
                    <span className="tracking-wide uppercase">{t.watchTrailer}</span>
                  </a>
                )}

                <div className="bg-[#03050A] rounded-lg p-6 text-left border-2 border-slate-800 shadow-[4px_4px_0px_rgba(0,0,0,1)] space-y-5">
                   <div>
                     <span className="text-xs text-amber-500 font-black uppercase flex items-center gap-1.5"><Clapperboard size={14}/> {t.director}</span>
                     <button onClick={() => openPersonCareer(selectedMovie?.directorId, selectedMovie?.director, 'director')} className="text-sm text-slate-200 hover:text-theme font-bold mt-1.5 px-3 py-1 bg-[#03050A] border-2 border-slate-800 hover:border-theme rounded-sm transition-all inline-flex items-center gap-1.5 shadow-[2px_2px_0px_rgba(0,0,0,1)] magnetic-btn">
                       {selectedMovie?.director}
                     </button>
                   </div>
                   <div>
                     <span className="text-xs text-amber-500 font-black uppercase flex items-center gap-1.5"><Users size={14}/> {t.cast}</span>
                     <div className="flex flex-wrap gap-2 mt-2">
                       {selectedMovie?.castObjects?.length > 0 ? selectedMovie.castObjects.map(actor => (
                         <button key={actor.id} onClick={() => openPersonCareer(actor.id, actor.name, 'cast')} className="text-xs text-slate-200 hover:text-theme font-bold px-2.5 py-1 bg-[#03050A] border-2 border-slate-800 hover:border-theme rounded-sm transition-all shadow-[2px_2px_0px_rgba(0,0,0,1)] magnetic-btn">
                           {actor.name}
                         </button>
                       )) : <p className="text-sm text-slate-200 font-bold">{selectedMovie?.cast}</p>}
                     </div>
                   </div>
                   <div><span className="text-xs text-amber-500 font-black uppercase flex items-center gap-1.5"><Info size={14}/> {t.summary}</span><p className="text-sm text-slate-400 line-clamp-6 leading-relaxed mt-1.5 font-medium">{selectedMovie?.overview}</p></div>
                   
                   {dbSelectedMovieData && dbSelectedMovieData.voteCount > 0 && (
                     <div className="mt-6 pt-6 border-t-2 border-slate-800/50">
                        <div 
                          onClick={() => setShowCategoryAverages(!showCategoryAverages)}
                          className="flex items-center justify-between cursor-pointer group bg-[#03050A] border-2 border-slate-800 p-4 rounded-sm shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:border-theme transition-colors magnetic-btn"
                        >
                           <div>
                              <h4 className="text-[10px] sm:text-xs text-slate-500 group-hover:text-slate-400 font-black uppercase mb-1 tracking-widest flex items-center gap-2 transition-colors"><Globe className="text-amber-500" size={14}/> {t.communityAvg}</h4>
                              <div className="flex items-end gap-2">
                                 <span className="text-2xl sm:text-3xl font-black drop-shadow-[1px_1px_0px_rgba(0,0,0,1)] leading-none" style={{color: getScoreColorHex(dbSelectedMovieData.avgScore)}}>{Number(dbSelectedMovieData.avgScore).toFixed(2)}</span>
                                 <span className="text-xs font-bold text-slate-500 mb-1">/ 10</span>
                              </div>
                           </div>
                           <div className="w-10 h-10 rounded-sm bg-[#03050A] flex items-center justify-center border-2 border-slate-700 group-hover:border-theme transition-colors shadow-[2px_2px_0px_rgba(0,0,0,1)]">
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
                                       <div className="flex-1 h-2 bg-[#03050A] rounded-sm overflow-hidden border border-slate-800">
                                         <div className="h-full transition-all duration-1000 relative" style={{width: `${catAvg * 10}%`, backgroundColor: catColor}}>
                                         </div>
                                       </div>
                                       <span className="text-xs font-black w-8 text-right drop-shadow-[1px_1px_0px_rgba(0,0,0,1)]" style={{color: catColor}}>{catAvg.toFixed(2)}</span>
                                    </div>
                                  )
                               })}
                             </div>
                           )}
                        </div>
                     </div>
                   )}

                   {friendsRatings.length > 0 && (
                     <div className="mt-6 pt-6 border-t-2 border-slate-800/50">
                        <h4 className="text-[10px] sm:text-xs text-slate-500 font-black uppercase mb-3 tracking-widest flex items-center gap-2"><Users size={14}/> {t.friendsWatched}</h4>
                        <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
                           {friendsRatings.map(fr => (
                              <div key={fr.uid} onClick={() => loadPublicProfile(fr.uid)} className="flex items-center gap-3 bg-[#03050A] border-2 border-slate-800 rounded-sm p-2.5 cursor-pointer hover:border-theme transition-colors min-w-[140px] shadow-[3px_3px_0px_rgba(0,0,0,1)] magnetic-btn">
                                 <img src={fr.avatar || AVATAR_DEFAULT} className="w-10 h-10 rounded-sm object-cover border-2 border-slate-700" alt=""/>
                                 <div>
                                    <span className="text-xs font-bold text-slate-300 block line-clamp-1 mb-0.5">{fr.name}</span>
                                    <span className="text-sm font-black drop-shadow-[1px_1px_0px_rgba(0,0,0,1)]" style={{color: getScoreColorHex(fr.score)}}>{Number(fr.score).toFixed(2)}</span>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                   )}
                   
                </div>
              </div>
            </div>

            <div className="lg:col-span-8 flex flex-col gap-8">
              {!selectedMovie?.isReleased ? (
                 <div className="flex-1 cine-glass p-12 flex flex-col items-center justify-center text-center">
                    <div className="w-32 h-32 rounded-lg flex items-center justify-center mb-8 border-4 border-slate-700 bg-[#03050A] shadow-[6px_6px_0px_rgba(0,0,0,1)]">
                       <Lock size={48} className="text-slate-500"/>
                    </div>
                    <h3 className="text-3xl font-black text-white mb-4 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">Henüz Vizyona Girmedi</h3>
                    <p className="text-slate-400 font-bold text-lg mb-2">Puanlama kilitli. Film vizyona girdikten bir gün sonra açılacak.</p>
                    <p className="text-theme font-black text-lg bg-[#03050A] px-6 py-2 rounded-sm border-2 border-theme mt-4 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                       Vizyon Tarihi: {selectedMovie?.releaseDateStr?.split('-').reverse().join('.') || '?'}
                    </p>
                    <ReleaseCountdown releaseDateStr={selectedMovie.releaseDateStr} themeColor={themeColor} />
                 </div>
              ) : !isRatingMode ? (
                 <div className="flex-1 cine-glass p-12 flex flex-col items-center justify-center text-center">
                    {user && sortedMyRatings.find(r=>r.id===selectedMovie?.id) ? (
                      <>
                         <span className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">{t.yourScore}</span>
                         <div className="relative w-48 h-48 mx-auto rounded-lg border-8 flex items-center justify-center bg-[#03050A] mb-8 shadow-[8px_8px_0px_rgba(0,0,0,1)]"
                              style={{ borderColor: getScoreColorHex(sortedMyRatings.find(r=>r.id===selectedMovie?.id).finalScore) }}>
                            <span className="text-7xl font-black text-white drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]" style={{color: getScoreColorHex(sortedMyRatings.find(r=>r.id===selectedMovie?.id).finalScore)}}>{sortedMyRatings.find(r=>r.id===selectedMovie?.id).finalScore}</span>
                         </div>
                         <div className="flex flex-col sm:flex-row items-center gap-4">
                           <button onClick={() => { setIsRatingMode(true); scrollToRatingView(); }} className="px-8 py-4 rounded-sm bg-[#03050A] text-white font-black text-lg transition-all shadow-[4px_4px_0px_rgba(0,0,0,1)] flex items-center gap-3 border-2 border-slate-700 magnetic-btn hover:border-white">
                             <Edit3 size={22}/> {t.updateRating}
                           </button>
                           
                           <div className="relative group">
                             <button onClick={generateStoryCard} className="px-8 py-4 rounded-sm bg-theme text-[#03050A] font-black text-lg transition-all flex items-center gap-2.5 magnetic-btn border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                               <Share2 size={22}/> {t.createStory} <HelpCircle size={18} className="opacity-70"/>
                             </button>
                             <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 bg-[#03050A] text-slate-200 text-xs font-bold p-3.5 rounded-sm shadow-[4px_4px_0px_rgba(0,0,0,1)] border-2 border-slate-600 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 text-center leading-relaxed">
                               {t.storyTooltip}
                               <div className="absolute top-full left-1/2 -translate-x-1/2 w-3 h-3 bg-[#03050A] rotate-45 -mt-1.5 border-r-2 border-b-2 border-slate-600"></div>
                             </div>
                           </div>
                         </div>
                      </>
                    ) : (
                      <>
                         <div className="w-32 h-32 rounded-lg flex items-center justify-center mb-6 border-[4px] shadow-[8px_8px_0px_rgba(0,0,0,1)] animate-pulse" style={{borderColor: themeColor, backgroundColor: themeColor + '20'}}>
                            <Star size={48} style={{color: themeColor}}/>
                         </div>
                         <h3 className="text-2xl sm:text-3xl font-black text-white mb-2 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">{t.noRating}</h3>
                         <p className="text-slate-400 font-bold mb-8">{lang === 'tr' ? 'Bu filmi henüz puanlamadınız. Kendi sinematik zevkinize göre değerlendirin.' : 'You haven\'t rated this movie yet.'}</p>
                         <button onClick={() => { setIsRatingMode(true); setTimeout(() => document.getElementById('rating-slider-box')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100); }} className="px-10 py-5 rounded-sm bg-theme hover:bg-theme text-[#03050A] font-black text-xl transition-all border-2 border-black shadow-[6px_6px_0px_rgba(0,0,0,1)] flex items-center gap-3 magnetic-btn">
                           <Star size={24} className="fill-current"/> {t.rateNow}
                         </button>
                      </>
                    )}
                 </div>
              ) : (
                <div id="rating-slider-box" className="flex-1 cine-glass p-5 sm:p-8 flex flex-col justify-between animate-in zoom-in-95 duration-300 relative overflow-hidden">
                  
                  <div className="absolute top-0 right-0 w-96 h-96 opacity-10 pointer-events-none blur-[80px] rounded-full" style={{backgroundColor: themeColor}}></div>
                  <div className="absolute bottom-0 left-0 w-64 h-64 opacity-5 pointer-events-none blur-[60px] rounded-full" style={{backgroundColor: themeColor}}></div>
                  
                  <div className="relative z-10">
                     <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-slate-800">
                        <h3 className="text-lg sm:text-2xl font-black text-white flex items-center gap-2 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]"><Award className="text-amber-500" size={24}/> {t.criteria}</h3>
                        <div className="flex items-center gap-3 bg-[#03050A] border-2 border-slate-700 px-4 py-2 rounded-sm shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                           <span className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest">{t.yourScoreLabel || "Puanın"}:</span>
                           <div className="text-2xl sm:text-4xl font-black transition-colors duration-300 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]" style={{color: finalDynColor}}>
                             {finalScoreVal}
                           </div>
                        </div>
                     </div>
                     
                     <div className="space-y-6 sm:space-y-8 mt-4">
                       {/* KASMA SORUNUNU ÇÖZEN AKICI NORMAL SLIDERLAR */}
                       {criteriaData.map((c) => (
                         <SmoothStandardSlider 
                           key={c.id} 
                           c={c} 
                           value={scores[c.id]} 
                           onChange={(val) => setScores(prev => ({...prev, [c.id]: val}))} 
                         />
                       ))}
                   
                   {/* YENİ: SADECE KORKU FİLMLERİNDE ÇIKAN KANLI BRUTALIST KORKUNÇLUK BARLARI */}
                   {(() => {
                     const isHorror = selectedMovie?.genre?.toLowerCase().includes('korku') || selectedMovie?.genre?.toLowerCase().includes('horror');
                     if (!isHorror) return null;
                     
                     return (
                       <div className="mt-12 pt-10 border-t-4 border-dashed border-red-900/50 relative">
                         <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#03050A] px-4">
                           <span className="text-red-600 font-black text-xs uppercase tracking-[0.3em] flex items-center gap-2 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                             <Flame size={16} className="animate-pulse"/> {t.horrorProfile} <Flame size={16} className="animate-pulse"/>
                           </span>
                         </div>
                         
                         <div className="space-y-10 mt-6">
                           <SmoothHorrorSlider 
                             type="scary" 
                             label={t.scaryLabel} 
                             desc={t.scaryDesc} 
                             value={horrorScores.scary} 
                             onChange={(val) => setHorrorScores(prev => ({...prev, scary: val}))} 
                           />
                           
                           <SmoothHorrorSlider 
                             type="jumpscare" 
                             label={t.jumpscareLabel} 
                             desc={t.jumpscareDesc} 
                             value={horrorScores.jumpscare} 
                             onChange={(val) => setHorrorScores(prev => ({...prev, jumpscare: val}))} 
                           />

                           <SmoothHorrorSlider 
                             type="gore" 
                             label={t.goreLabel} 
                             desc={t.goreDesc} 
                             value={horrorScores.gore} 
                             onChange={(val) => setHorrorScores(prev => ({...prev, gore: val}))} 
                           />
                         </div>

                       </div>
                     );
                   })()}

                 </div>
              </div>
              
              <div className="mt-8 pt-6 flex gap-4">
                     <button onClick={() => setIsRatingMode(false)} className="px-5 py-4 rounded-sm bg-[#03050A] hover:bg-slate-800 text-white font-black text-lg transition-all border-2 border-slate-700 shadow-[4px_4px_0px_rgba(0,0,0,1)] magnetic-btn"><X size={20}/></button>
                     <button onClick={saveRating} disabled={isSaving} className="flex-1 py-4 rounded-sm bg-theme text-[#03050A] font-black text-lg sm:text-xl transition-all flex items-center justify-center gap-2 border-2 border-black shadow-[6px_6px_0px_rgba(0,0,0,1)] magnetic-btn uppercase tracking-widest">
                       {isSaving ? <Loader2 className="animate-spin text-black"/> : <Save size={20}/>} 
                       {user && sortedMyRatings.find(r=>r.id===selectedMovie?.id) ? t.updateRating : t.saveRating}
                     </button>
                  </div>
                </div>
              )}
              
              {similarMovies.length > 0 && (
                <div className="cine-glass p-8 mt-4 relative">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-black text-white flex items-center gap-2 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]"><Film className="text-theme"/> Benzer Filmler</h3>
                    <div className="flex items-center gap-3">
                       <button onClick={() => { if(similarRef.current) similarRef.current.scrollBy({ left: -300, behavior: 'smooth' }) }} className="p-2 bg-[#03050A] border-2 border-slate-700 hover:border-theme rounded-sm transition-colors shadow-[3px_3px_0px_rgba(0,0,0,1)] magnetic-btn"><ChevronLeft size={20}/></button>
                       <button onClick={() => { if(similarRef.current) similarRef.current.scrollBy({ left: 300, behavior: 'smooth' }) }} className="p-2 bg-[#03050A] border-2 border-slate-700 hover:border-theme rounded-sm transition-colors shadow-[3px_3px_0px_rgba(0,0,0,1)] magnetic-btn"><ChevronRight size={20}/></button>
                    </div>
                  </div>
                  <div ref={similarRef} className="flex gap-5 overflow-x-auto hide-scrollbar pb-4 smooth-scroll">
                    {similarMovies.map(sim => (
                       <div key={sim.id} onClick={() => selectMovieToRate(sim.id, sim.title)} className="w-28 sm:w-32 shrink-0 cursor-pointer group">
                          <img src={sim.poster} className="w-full aspect-[2/3] object-cover rounded-lg border-2 border-slate-700 group-hover:border-theme transition-colors shadow-[4px_4px_0px_rgba(0,0,0,1)]" alt=""/>
                          <h4 className="text-xs font-bold text-slate-300 mt-3 line-clamp-2 group-hover:text-theme drop-shadow-[1px_1px_0px_rgba(0,0,0,1)]">{sim.title}</h4>
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
             <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between cine-glass p-8 sm:p-10 gap-4">
                <div>
                   <h2 className="text-4xl font-black text-white flex items-center gap-3 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]"><Globe className="text-theme" size={36}/> {t.globalRanking}</h2>
                   <p className="text-slate-400 mt-3 font-bold text-lg">{t.globalDesc}</p>
                </div>
                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4">
                   {globalCriterionFilter === 'all' && (
                     <div className="flex items-center gap-3 bg-[#03050A] p-2 rounded-sm border-2 border-slate-800 shadow-[4px_4px_0px_rgba(0,0,0,1)] h-full">
                        <ListFilter size={18} className="text-slate-400 ml-2" />
                        <select 
                          value={globalSortType} 
                          onChange={(e) => setGlobalSortType(e.target.value)}
                          className="bg-transparent text-sm font-bold text-white outline-none cursor-pointer pr-2"
                        >
                           <option value="vote_desc" className="bg-[#03050A]">{t.mostVoted || (lang === 'tr' ? 'En Çok Oylananlar' : 'Most Voted')}</option>
                           <option value="score_desc" className="bg-[#03050A]">{t.sortGlobalScore || (lang === 'tr' ? 'Dünya Geneli Puan' : 'Global Score')}</option>
                        </select>
                     </div>
                   )}
                   <div className="bg-[#03050A] border-2 border-slate-800 px-8 py-5 rounded-lg flex items-center gap-5 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                      <span className="text-6xl font-black text-theme drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">{safeGlobalMovies.length}</span>
                      <span className="text-sm text-slate-500 uppercase font-black tracking-widest leading-tight">{t.registeredMovies}</span>
                   </div>
                </div>
             </div>
             
             {/* YENİ: 5 KRİTER BAZLI DÜNYA SIRALAMASI FİLTRE ÇUBUĞU */}
             <div className="mb-8 cine-glass p-4 sm:p-5">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                 <span className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 shrink-0">
                   <Sparkles size={15} className="text-theme"/> {t.rankByCriteriaLabel || 'Kriter Liderliğine Göre Sırala:'}
                 </span>
                 <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 hide-scrollbar">
                   <button
                     onClick={() => setGlobalCriterionFilter('all')}
                     className={`px-3.5 py-2 rounded-sm text-xs font-black shrink-0 transition-all border-2 magnetic-btn ${
                       globalCriterionFilter === 'all'
                         ? 'bg-theme text-[#03050A] border-black shadow-[4px_4px_0px_rgba(0,0,0,1)]'
                         : 'bg-[#03050A] text-slate-300 border-slate-800 hover:border-slate-600 shadow-[2px_2px_0px_rgba(0,0,0,1)]'
                     }`}
                   >
                     🌐 {t.allCriteriaRank || 'Genel Sıralama'}
                   </button>
                   {criteriaData.map((crit, cIdx) => {
                     const critIcons = ['📝', '🎭', '🎥', '🎵', '✂️'];
                     const isSelected = globalCriterionFilter === crit.id;
                     return (
                       <button
                         key={crit.id}
                         onClick={() => setGlobalCriterionFilter(crit.id)}
                         className={`px-3.5 py-2 rounded-sm text-xs font-black shrink-0 transition-all border-2 magnetic-btn flex items-center gap-1.5 ${
                           isSelected
                             ? 'bg-theme text-[#03050A] border-black shadow-[4px_4px_0px_rgba(0,0,0,1)]'
                             : 'bg-[#03050A] text-slate-300 border-slate-800 hover:border-theme shadow-[2px_2px_0px_rgba(0,0,0,1)]'
                         }`}
                       >
                         <span>{critIcons[cIdx] || '⭐'}</span>
                         <span>{crit.name}</span>
                       </button>
                     );
                   })}
                   {/* YENİ: KORKU ÖZEL FİLTRESİ */}
                   <button
                     onClick={() => setGlobalCriterionFilter('horror')}
                     className={`px-3.5 py-2 rounded-sm text-xs font-black shrink-0 transition-all border-2 magnetic-btn flex items-center gap-1.5 ${
                       globalCriterionFilter === 'horror'
                         ? 'bg-red-600 text-black border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] scale-105'
                         : 'bg-[#03050A] text-red-500 border-red-900 hover:border-red-500 shadow-[2px_2px_0px_rgba(0,0,0,1)]'
                     }`}
                   >
                     <Flame size={14} className={globalCriterionFilter === 'horror' ? 'text-black' : 'text-red-500'}/>
                     <span>En Korkunçlar</span>
                   </button>
                 </div>
               </div>
             </div>

             {safeGlobalMovies.length === 0 ? (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {[1,2,3,4,5,6].map(n => (
                   <div key={n} className="h-44 rounded-lg skeleton-shimmer border-2 border-slate-800 shadow-[6px_6px_0px_rgba(0,0,0,1)]"></div>
                 ))}
               </div>
             ) : globalCriterionFilter !== 'all' ? (
               /* SEÇİLEN KRİTERE VEYA KORKUYA GÖRE SIRALANMIŞ FİLMLER VİTRİNİ */
               (() => {
                 const isHorrorFilter = globalCriterionFilter === 'horror';
                 let activeCritObj = criteriaData.find(c => c.id === globalCriterionFilter) || criteriaData[0];
                 let sortedByCrit = [];

                 if (isHorrorFilter) {
                    activeCritObj = { id: 'horror', name: 'En Korkunç Filmler (Pür Dehşet)', desc: 'Sadece Korku türündeki filmlerin atmosferik dehşet seviyesine göre sıralaması.' };
                    sortedByCrit = [...safeGlobalMovies]
                      .filter(m => m.horrorTotals && m.horrorTotals.count > 0)
                      .map(m => ({
                        ...m,
                        activeCritScore: m.horrorTotals.scary / m.horrorTotals.count,
                        jumpscareScore: m.horrorTotals.jumpscare / m.horrorTotals.count
                      }))
                      .sort((a, b) => b.activeCritScore - a.activeCritScore || (Number(b.voteCount) || 0) - (Number(a.voteCount) || 0));
                 } else {
                    sortedByCrit = [...safeGlobalMovies]
                      .map(m => ({
                        ...m,
                        activeCritScore: getMovieCriterionScore(m, globalCriterionFilter, myRatings)
                      }))
                      .sort((a, b) => b.activeCritScore - a.activeCritScore || (Number(b.voteCount) || 0) - (Number(a.voteCount) || 0));
                 }

                 return (
                   <div className="space-y-5">
                     <div className={`border-2 rounded-sm p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-[4px_4px_0px_rgba(0,0,0,1)] ${isHorrorFilter ? 'bg-red-950/40 border-red-500' : 'bg-[#03050A] border-theme'}`}>
                       <div>
                         <span className={`text-[10px] font-black uppercase tracking-widest block ${isHorrorFilter ? 'text-red-500' : 'text-theme'}`}>{isHorrorFilter ? 'DEHŞET LİDERLİK TABLOSU' : 'KRİTER LİDERLİK TABLOSU'}</span>
                         <h3 className="text-base sm:text-lg font-black text-white">{activeCritObj?.name}</h3>
                       </div>
                       <span className="text-xs font-bold text-slate-400 max-w-xs sm:text-right">{ activeCritObj?.desc }</span>
                     </div>
                     
                     {isHorrorFilter && sortedByCrit.length === 0 && (
                        <div className="text-center py-16 bg-[#03050A] border-2 border-slate-800 border-dashed rounded-sm shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                          <p className="text-slate-400 font-bold">Henüz oylanmış bir korku filmi bulunmuyor. Listeyi başlatmak için bir filme korkunçluk puanı ver!</p>
                        </div>
                     )}

                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                       {sortedByCrit.map((movie, idx) => {
                         const critScore = Number(movie.activeCritScore || 0);
                         const critHex = isHorrorFilter ? '#ef4444' : getScoreColorHex(critScore);
                         const dispTitle = localizedData?.[movie.id]?.title || movie.title;
                         const safePoster = typeof movie.poster === 'string' && movie.poster.startsWith('http') ? movie.poster : 'https://via.placeholder.com/200x300?text=Poster';

                         return (
                           <div
                             key={movie.id}
                             onClick={() => selectMovieToRate(movie.id, movie.title)}
                             className={`bg-[#03050A] border-2 hover:-translate-y-1 hover:-translate-x-1 rounded-lg p-4 flex gap-4 cursor-pointer transition-all group relative overflow-hidden shadow-[4px_4px_0px_rgba(0,0,0,1)] ${isHorrorFilter ? 'border-slate-800 hover:border-red-600 hover:shadow-[6px_6px_0px_rgba(220,38,38,0.6)]' : 'border-slate-800 hover:border-theme hover:shadow-[6px_6px_0px_var(--theme-color-50)]'}`}
                           >
                             {/* Sıra Rozeti */}
                             <div className={`absolute top-3 left-3 z-20 w-8 h-8 rounded-sm border-2 border-black font-black text-xs flex items-center justify-center shadow-[2px_2px_0px_rgba(0,0,0,1)] ${
                               idx === 0 ? 'bg-amber-400 text-[#03050A]' : idx === 1 ? 'bg-slate-300 text-[#03050A]' : idx === 2 ? 'bg-amber-700 text-white' : 'bg-[#03050A] text-white border-slate-700'
                             }`}>
                               #{idx + 1}
                             </div>

                             <img src={safePoster} className={`w-24 sm:w-28 aspect-[2/3] object-cover rounded-sm border-2 shrink-0 group-hover:scale-105 transition-transform ${isHorrorFilter ? 'border-red-900/60 group-hover:border-red-500' : 'border-slate-700'}`} alt=""/>

                             <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                               <div>
                                 <h4 className={`text-sm sm:text-base font-black text-white truncate drop-shadow-[1px_1px_0px_rgba(0,0,0,1)] transition-colors ${isHorrorFilter ? 'group-hover:text-red-500' : 'group-hover:text-theme'}`}>{dispTitle}</h4>
                                 <p className="text-[11px] font-bold text-slate-400 mt-0.5">
                                   {t.globalScoreLabel}: <strong className="text-slate-200">{Number(movie.avgScore || 0).toFixed(2)}</strong> • {movie.voteCount || 1} {t.voteCount}
                                 </p>

                                 {/* Seçili Kriterin Vurgulu Puan Kutusu */}
                                 <div className="mt-2.5 bg-[#03050A] border-2 border-slate-800 rounded-sm p-2.5 flex items-center justify-between shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                                   <span className={`text-[10px] font-black uppercase truncate pr-2 ${isHorrorFilter ? 'text-red-500' : 'text-slate-300'}`}>
                                     {isHorrorFilter ? 'Korkunçluk' : activeCritObj?.name}
                                   </span>
                                   <span className="text-base sm:text-lg font-black shrink-0 drop-shadow-[1px_1px_0px_rgba(0,0,0,1)]" style={{ color: critHex }}>
                                     {critScore.toFixed(2)}
                                   </span>
                                 </div>
                               </div>

                               {/* 5 Kriterin VEYA Korku (Jumpscare) Barının Gösterimi */}
                               {isHorrorFilter ? (
                                  <div className="mt-3 pt-2.5 border-t-2 border-slate-800 flex items-center justify-between">
                                    <span className="text-[9px] font-black text-orange-500 uppercase flex items-center gap-1"><Flame size={12}/> Jumpscare</span>
                                    <span className="text-xs font-black text-white px-2 py-0.5 bg-orange-950/50 border border-orange-500/50 rounded-sm shadow-[1px_1px_0px_rgba(249,115,22,0.5)]">
                                      {movie.jumpscareScore ? movie.jumpscareScore.toFixed(1) : '0.0'}
                                    </span>
                                  </div>
                               ) : (
                                  <div className="grid grid-cols-5 gap-1.5 mt-3 pt-2 border-t-2 border-slate-800">
                                    {criteriaData.map(c => {
                                      const cVal = getMovieCriterionScore(movie, c.id, myRatings);
                                      const isCurrent = c.id === globalCriterionFilter;
                                      return (
                                        <div key={c.id} className={`text-center p-1 rounded-sm border-2 ${isCurrent ? 'bg-theme/10 border-theme' : 'bg-[#03050A] border-slate-800'}`}>
                                          <span className="text-[8px] font-black text-slate-400 block truncate">{c.name.substring(0, 4)}.</span>
                                          <span className="text-[10px] font-black block" style={{ color: getScoreColorHex(cVal) }}>{cVal.toFixed(1)}</span>
                                        </div>
                                      );
                                    })}
                                  </div>
                               )}
                             </div>
                           </div>
                         );
                       })}
                     </div>
                   </div>
                 );
               })()
             ) : (
               <>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {sortedGlobalMovies.slice((globalPage - 1) * 20, globalPage * 20).map((movie, index) => {
                     const idx = (globalPage - 1) * 20 + index;
                     const isNeon = movie.avgScore >= 9.0;
                   const displayTitle = localizedData?.[movie.id]?.title || movie.title;
                   return (
                   <div key={movie.id} onClick={() => selectMovieToRate(movie.id, movie.title)} className={`bg-[#03050A] rounded-lg overflow-hidden border-2 flex flex-row group cursor-pointer transition-all hover:-translate-y-1 hover:-translate-x-1 shadow-[4px_4px_0px_rgba(0,0,0,1)] ${isNeon ? 'border-[#39ff14] hover:shadow-[6px_6px_0px_#39ff14]' : 'border-slate-800 hover:border-theme hover:shadow-[6px_6px_0px_var(--theme-color-50)]'}`}>
                     <div className="w-28 sm:w-32 bg-[#03050A] relative shrink-0 border-r-2 border-slate-800 group-hover:border-theme">
                        <img src={movie.poster} alt="" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"/>
                        <div className="absolute inset-0 bg-gradient-to-t from-[#03050A] to-transparent opacity-80"></div>
                        <div className={`absolute top-2 left-2 w-8 h-8 rounded-sm border-2 border-black text-[#03050A] text-sm font-black flex items-center justify-center shadow-[2px_2px_0px_rgba(0,0,0,1)] ${isNeon ? 'bg-[#39ff14]' : 'bg-amber-400'}`}>#{idx + 1}</div>
                     </div>
                     <div className="flex-1 p-5 flex flex-col justify-between">
                        <div>
                          <h3 className="text-lg font-black text-white line-clamp-2 transition-colors drop-shadow-[1px_1px_0px_rgba(0,0,0,1)] leading-tight mb-1 group-hover:text-theme">{displayTitle}</h3>
                          <div className="text-xs text-slate-400 font-bold mb-4">{movie.year} • {movie.genre}</div>
                          
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-sm font-bold px-3 py-1.5 rounded-sm bg-[#03050A] border-2 border-slate-700 text-slate-300 shadow-[2px_2px_0px_rgba(0,0,0,1)]">{movie.voteCount} {t.voteCount}</span>
                            <div className="relative">
                              <MiniVFX score={movie.avgScore} themeColor={isNeon ? '#39ff14' : themeColor} />
                              <span className={`relative z-10 text-xs font-black px-3 py-1.5 rounded-sm bg-[#03050A] border-2 shadow-[2px_2px_0px_rgba(0,0,0,1)] ${isNeon ? 'border-[#39ff14] animate-pulse' : 'border-slate-800'}`} style={isNeon ? {color: '#39ff14'} : {color: getScoreColorHex(movie.avgScore), borderColor: getScoreColorHex(movie.avgScore)}}>{t.average}: {Number(movie.avgScore).toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                     </div>
                   </div>
                 )})}
                 </div>
                 {Math.ceil(safeGlobalMovies.length / 20) > 1 && (
                   <div className="flex justify-center flex-wrap gap-2 mt-12 mb-6">
                     {Array.from({ length: Math.ceil(safeGlobalMovies.length / 20) }).map((_, i) => (
                       <button key={i} onClick={() => { setGlobalPage(i + 1); window.scrollTo({top: 0, behavior: 'smooth'}); }} className={`w-10 h-10 rounded-sm border-2 font-black transition-all magnetic-btn ${globalPage === i + 1 ? 'bg-theme text-[#03050A] border-black shadow-[4px_4px_0px_rgba(0,0,0,1)]' : 'bg-[#03050A] border-slate-700 text-slate-400 hover:text-theme shadow-[2px_2px_0px_rgba(0,0,0,1)]'}`}>
                         {i + 1}
                       </button>
                     ))}
                   </div>
                 )}
               </>
             )}
          </div>
        )}

        {/* TAB 4: PROFİL (Çok Sayfalı Yapı & Elite Tasarım) */}
        {['profile_general', 'profile_ratings', 'profile_watchlist', 'profile_list_detail'].includes(activeTab) && (
          <div className="animate-in fade-in duration-500 max-w-5xl mx-auto space-y-8">
            
            <div className="relative rounded-lg overflow-hidden border-2 border-slate-800 shadow-[8px_8px_0px_rgba(0,0,0,1)] mb-8 group bg-[#03050A]">
              <div className="h-48 sm:h-64 w-full relative">
                 <img src={userProfile?.banner || BANNER_PRESETS[0]} className="w-full h-full object-cover opacity-80" alt="Banner" />
                 <div className="absolute inset-0 bg-gradient-to-t from-[#03050A] via-[#03050A]/60 to-transparent"></div>
                 <button onClick={openProfileEdit} className="absolute top-6 right-6 px-4 py-2 bg-[#03050A] text-slate-300 hover:text-theme border-2 border-slate-700 hover:border-theme rounded-sm backdrop-blur font-bold flex items-center gap-2 transition-all shadow-[4px_4px_0px_rgba(0,0,0,1)] magnetic-btn z-20">
                    <Edit3 size={16}/> <span className="hidden sm:inline">{t.editProfile}</span>
                 </button>
              </div>
              <div className="px-8 pb-8 sm:px-12 relative -mt-20 sm:-mt-24 flex flex-col sm:flex-row items-center sm:items-end gap-6 sm:gap-8">
                 <div className="relative">
                   <img src={userProfile?.avatar || AVATAR_DEFAULT} className="w-32 h-32 sm:w-40 sm:h-40 rounded-sm border-4 border-[#03050A] bg-[#03050A] object-cover shadow-[6px_6px_0px_rgba(0,0,0,1)] z-10 relative" style={{borderColor: themeColor}} alt="Avatar"/>
                   <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-theme rounded-sm border-2 border-[#03050A] flex items-center justify-center shadow-[4px_4px_0px_rgba(0,0,0,1)] transform rotate-6 z-20">
                     <span className="text-xs font-black text-[#03050A]">{sortedMyRatings.length}</span>
                   </div>
                 </div>
                 <div className="text-center sm:text-left flex-1 mb-2">
                    <div className="flex flex-col sm:flex-row sm:items-end gap-2 sm:gap-4 mb-1">
                      <h2 className="text-4xl sm:text-5xl font-black text-white drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] tracking-tight">{String(userProfile?.displayName || 'Sinefil')}</h2>
                      <span onClick={() => { navigator.clipboard.writeText(userProfile?.userCode || user?.uid?.substring(0,6).toUpperCase()); showToast(t.userCodeCopied); }} className="text-theme font-black text-lg px-3 py-1 rounded-sm cursor-pointer hover:bg-theme hover:text-[#03050A] transition-colors border-2 shadow-[2px_2px_0px_rgba(0,0,0,1)] w-max mx-auto sm:mx-0" style={{backgroundColor: '#03050A', borderColor: themeColor}}>@{userProfile?.userCode || user?.uid?.substring(0,6).toUpperCase()}</span>
                    </div>
                    <div className="flex items-center justify-center sm:justify-start gap-4 mb-3 mt-2">
                       <span onClick={() => { loadFollowersUsers(); setActiveTab('profile_followers'); }} className="text-slate-400 font-bold text-sm cursor-pointer hover:text-white transition-colors"><strong className="text-white">{userProfile?.followers?.length || 0}</strong> {t.followers}</span>
                       <span onClick={() => { loadFollowingUsers(); setActiveTab('profile_following'); }} className="text-slate-400 font-bold text-sm cursor-pointer hover:text-white transition-colors"><strong className="text-white">{userProfile?.following?.length || 0}</strong> {t.following}</span>
                    </div>
                    {userProfile?.bio && (
                      <div className="flex items-start justify-center sm:justify-start gap-2 text-theme mt-1">
                        <Quote size={14} className="mt-1 opacity-50 shrink-0"/>
                        <p className="font-medium italic text-sm sm:text-base drop-shadow-[1px_1px_0px_rgba(0,0,0,1)] max-w-lg">{userProfile.bio}</p>
                      </div>
                    )}
                 </div>
              </div>
            </div>

            {/* ALT SEKMELER: GENEL BAKIŞ */}
            {activeTab === 'profile_general' && (
              <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-10">
                
                {/* 2. KRALİYET & ALTIN VARAKLI KUTSAL ÜÇLÜ */}
                <div className="mt-12 mb-6 flex items-center gap-4">
                   <div className="w-12 h-12 bg-amber-400 text-[#03050A] border-2 border-black flex items-center justify-center shadow-[4px_4px_0px_rgba(0,0,0,1)] rounded-sm shrink-0">
                     <Trophy size={24} />
                   </div>
                   <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-widest drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] flex-1 border-b-4 border-amber-400/50 pb-2">
                     Vitrin: {t.top3Title}
                   </h3>
                </div>
                <div className="bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-opacity-20 rounded-lg p-1 sm:p-2 border-2 border-amber-500/30 shadow-[8px_8px_0px_rgba(245,158,11,0.2)]">
                  <RoyalTrinityShowcase
                    top3List={userProfile?.top3 || [null, null, null]}
                    t={t}
                    isEditable={true}
                    selectMovieToRate={selectMovieToRate}
                    onOpenSlotSearch={(slot) => {
                      setTop3SlotIndex(slot);
                      setShowTop3Modal(true);
                      setTop3SearchTerm('');
                      setTop3Results([]);
                    }}
                    onSetCrown={setCrown}
                    localizedData={localizedData}
                  />
                </div>

                {/* SİNEMA KİMLİĞİ VE İSTATİSTİKLER (Renk Kodlu Grid) */}
                {sortedMyRatings.length > 0 && (
                  <div className="mt-16 space-y-6">
                    <div className="flex items-center gap-4 mb-6">
                       <div className="w-12 h-12 bg-fuchsia-500 text-[#03050A] border-2 border-black flex items-center justify-center shadow-[4px_4px_0px_rgba(0,0,0,1)] rounded-sm shrink-0">
                         <Smile size={24} />
                       </div>
                       <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-widest drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] flex-1 border-b-4 border-fuchsia-500/50 pb-2">
                         Sinema Kimliği
                       </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {(() => {
                        let myAvg = 0; let gAvg = 0; const decades = {};
                        sortedMyRatings.forEach(r => {
                           myAvg += Number(r.finalScore) || 0;
                           const g = safeGlobalMovies.find(m => String(m.id) === String(r.id));
                           gAvg += g ? (Number(g.avgScore) || 0) : (Number(r.finalScore) || 0);
                           
                           const yStr = String(r.year || g?.year || localizedData?.[r.id]?.year || '');
                           const yMatch = yStr.match(/\d{4}/);
                           if(yMatch) { 
                              const y = Number(yMatch[0]);
                              if (y > 1900 && y <= new Date().getFullYear() + 5) {
                                 const dec = Math.floor(y/10)*10; 
                                 decades[dec] = (decades[dec]||0)+1; 
                              }
                           }
                        });
                        myAvg = myAvg / sortedMyRatings.length; gAvg = gAvg / sortedMyRatings.length;
                        const diff = (gAvg - myAvg).toFixed(2);
                        const ruthText = diff > 0.5 ? 'Zor Beğenen (Acımasız)' : diff < -0.5 ? 'Gönlü Bol (Bonkör)' : 'Adil Eleştirmen';
                        
                        let favDec = '?';
                        if (Object.keys(decades).length > 0) {
                            const bestDec = Object.keys(decades).reduce((a,b)=> decades[a] > decades[b] ? a : b);
                            favDec = bestDec + "'ler";
                        }

                        const { title: zTitle, desc: zDesc } = getZodiac(userDNA, sortedMyRatings.length);
                        
                        return (
                          <>
                            {/* Acımasızlık Endeksi (Kırmızı Tema) */}
                            <div className="cine-glass p-6 border-2 border-rose-500/60 bg-gradient-to-br from-[#03050A] to-rose-950/30 flex flex-col justify-between relative overflow-hidden group shadow-[4px_4px_0px_rgba(244,63,94,0.4)] hover:shadow-[8px_8px_0px_rgba(244,63,94,1)] hover:-translate-y-2 hover:-rotate-1 transition-all duration-300">
                               <div className="absolute top-0 right-0 bg-rose-500 text-black text-[9px] font-black px-2.5 py-1 rounded-bl-sm border-b-2 border-l-2 border-black shadow-[-2px_2px_0px_rgba(0,0,0,1)] z-20">ID: RUTHLESS</div>
                               <div className="relative z-10 mt-2">
                                 <h4 className="text-[11px] font-black text-rose-400 uppercase tracking-widest mb-3 border-b border-rose-500/40 pb-2 inline-block">Acımasızlık Endeksi</h4>
                                 <h2 className="text-2xl font-black text-white drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] mb-2 leading-tight">{ruthText}</h2>
                                 <p className="text-xs font-bold text-slate-300 leading-snug bg-black/40 p-2 rounded-sm border border-rose-500/20">Ortalamadan <strong className={diff > 0 ? 'text-rose-400' : 'text-emerald-400'}>{Math.abs(diff)}</strong> puan {diff > 0 ? 'düşük' : 'yüksek'} veriyorsun.</p>
                               </div>
                               <div className="absolute bottom-2 right-2 text-rose-500/30 pointer-events-none group-hover:scale-110 group-hover:text-rose-500/50 transition-all"><TrendingUp size={72}/></div>
                            </div>

                            {/* Favori On Yıl (Mavi Tema) */}
                            <div className="cine-glass p-6 border-2 border-cyan-500/60 bg-gradient-to-br from-[#03050A] to-cyan-950/30 flex flex-col justify-between relative overflow-hidden group shadow-[4px_4px_0px_rgba(6,182,212,0.4)] hover:shadow-[8px_8px_0px_rgba(6,182,212,1)] hover:-translate-y-2 transition-all duration-300">
                               <div className="absolute top-0 right-0 bg-cyan-400 text-black text-[9px] font-black px-2.5 py-1 rounded-bl-sm border-b-2 border-l-2 border-black shadow-[-2px_2px_0px_rgba(0,0,0,1)] z-20">ID: ERA</div>
                               <div className="relative z-10 mt-2">
                                 <h4 className="text-[11px] font-black text-cyan-400 uppercase tracking-widest mb-3 border-b border-cyan-400/40 pb-2 inline-block">Favori On Yıl</h4>
                                 <h2 className="text-2xl font-black text-white drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] mb-2 leading-tight">{favDec} Sineması</h2>
                                 <p className="text-xs font-bold text-slate-300 leading-snug bg-black/40 p-2 rounded-sm border border-cyan-500/20">En çok puanladığın çıkış yılı aralığı.</p>
                               </div>
                               <div className="absolute bottom-2 right-2 text-cyan-400/30 pointer-events-none group-hover:scale-110 group-hover:text-cyan-400/50 transition-all"><Film size={72}/></div>
                            </div>

                            {/* Sinema Burcu (Mor Tema) */}
                            <div className="cine-glass p-6 border-2 border-purple-500/60 bg-gradient-to-br from-[#03050A] to-purple-950/30 flex flex-col justify-between relative overflow-hidden group shadow-[4px_4px_0px_rgba(168,85,247,0.4)] hover:shadow-[8px_8px_0px_rgba(168,85,247,1)] hover:-translate-y-2 hover:rotate-1 transition-all duration-300">
                               <div className="absolute top-0 right-0 bg-purple-500 text-black text-[9px] font-black px-2.5 py-1 rounded-bl-sm border-b-2 border-l-2 border-black shadow-[-2px_2px_0px_rgba(0,0,0,1)] z-20">ID: ZODIAC</div>
                               <div className="relative z-10 mt-2">
                                 <h4 className="text-[11px] font-black text-purple-400 uppercase tracking-widest mb-3 border-b border-purple-500/40 pb-2 inline-block">{t.cineZodiac}</h4>
                                 {sortedMyRatings.length >= 10 ? (
                                   <>
                                     <h2 className="text-2xl font-black text-white drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] mb-2 leading-tight">{zTitle}</h2>
                                     <p className="text-[10px] font-bold text-slate-300 leading-snug bg-black/40 p-2 rounded-sm border border-purple-500/20 line-clamp-3">{zDesc}</p>
                                   </>
                                 ) : (
                                   <>
                                     <h2 className="text-xl font-black text-slate-500 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] mb-2">{t.zodiacDefault}</h2>
                                     <p className="text-[10px] font-bold text-slate-500 leading-snug bg-black/40 p-2 rounded-sm">Analiz için daha fazla filme puan vermelisin.</p>
                                   </>
                                 )}
                               </div>
                               <div className="absolute bottom-2 right-2 text-purple-500/30 pointer-events-none group-hover:scale-110 group-hover:text-purple-500/50 transition-all"><Smile size={72}/></div>
                            </div>
                          </>
                        )
                      })()}
                    </div>
                  </div>
                )}

{/* FAVORİ YÖNETMEN (VİTRİNİ) */}
                {myFavoriteDirector && (
                  <div className="mt-16">
                    <div className="flex items-center gap-4 mb-6">
                       <div className="w-12 h-12 bg-blue-500 text-[#03050A] border-2 border-black flex items-center justify-center shadow-[4px_4px_0px_rgba(0,0,0,1)] rounded-sm shrink-0">
                         <Clapperboard size={24} />
                       </div>
                       <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-widest drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] flex-1 border-b-4 border-blue-500/50 pb-2">
                         Yönetmen Radar
                       </h3>
                    </div>
                    <div className="cine-glass overflow-hidden shadow-[8px_8px_0px_rgba(59,130,246,0.6)] border-2 border-blue-500/60 bg-gradient-to-r from-[#03050A] to-blue-950/20 hover:-translate-y-1 hover:shadow-[12px_12px_0px_rgba(59,130,246,1)] transition-all duration-300">
                       <div className="absolute top-0 right-0 bg-blue-500 text-black text-[9px] font-black px-2.5 py-1 rounded-bl-sm border-b-2 border-l-2 border-black shadow-[-2px_2px_0px_rgba(0,0,0,1)] z-20">TOP DIRECTOR</div>
                       <FavoriteDirectorShowcase
                         favDirector={myFavoriteDirector}
                         t={t}
                         openPersonCareer={openPersonCareer}
                         selectMovieToRate={selectMovieToRate}
                         localizedData={localizedData}
                         isPublic={false}
                       />
                    </div>
                  </div>
                )}

                {/* FAVORİ TÜRLER VE İZLEME LİSTEM (BAŞLIKLI) */}
                <div className="mt-16">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Favori Türler */}
                    <div>
                      <div className="flex items-center gap-4 mb-6">
                         <div className="w-12 h-12 bg-theme text-[#03050A] border-2 border-black flex items-center justify-center shadow-[4px_4px_0px_rgba(0,0,0,1)] rounded-sm shrink-0">
                           <PieChart size={24} />
                         </div>
                         <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-widest drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] flex-1 border-b-4 border-theme/50 pb-2">
                           {t.topGenres}
                         </h3>
                      </div>
                      <div className="cine-glass p-8 flex flex-col group cursor-pointer h-[calc(100%-80px)] border-2 border-theme/60 bg-gradient-to-br from-[#03050A] to-theme/10 hover:-translate-y-2 hover:-translate-x-1 hover:shadow-[12px_12px_0px_rgba(0,0,0,1)] transition-all duration-300 shadow-[8px_8px_0px_rgba(0,0,0,1)] relative overflow-hidden" onClick={() => setActiveTab('profile_ratings')}>
                        <div className="absolute top-0 right-0 bg-theme text-black text-[9px] font-black px-2.5 py-1 rounded-bl-sm border-b-2 border-l-2 border-black shadow-[-2px_2px_0px_rgba(0,0,0,1)] z-20">ID: GENRES</div>
                        {topGenres.length === 0 ? (
                           <p className="text-slate-500 text-sm font-bold text-center py-8">{t.noRating}</p>
                        ) : (
                           <div className="space-y-6 relative z-10 mt-2">
                             {topGenres.map(([genre, count], idx) => {
                                const percentage = (count / sortedMyRatings.length) * 100;
                                return (
                                  <div key={genre}>
                                    <div className="flex justify-between items-end mb-2">
                                      <span className="font-bold text-white drop-shadow-[1px_1px_0px_rgba(0,0,0,1)] text-sm">{genre}</span>
                                      <span className="font-black text-sm text-theme bg-black/40 px-2 py-0.5 rounded-sm border border-theme/20">{count} {t.voteCount}</span>
                                    </div>
                                    <div className="h-4 bg-[#03050A] rounded-sm overflow-hidden border-2 border-slate-800 shadow-[inset_2px_2px_0px_rgba(0,0,0,0.5)]">
                                      <div className="h-full border-r-2 border-black transition-all duration-1000" style={{width: `${percentage}%`, backgroundColor: themeColor}}></div>
                                    </div>
                                  </div>
                                )
                             })}
                           </div>
                        )}
                      </div>
                    </div>

                    {/* İzleme Listem Özeti */}
                    <div>
                      <div className="flex items-center gap-4 mb-6">
                         <div className="w-12 h-12 bg-indigo-500 text-[#03050A] border-2 border-black flex items-center justify-center shadow-[4px_4px_0px_rgba(0,0,0,1)] rounded-sm shrink-0">
                           <Bookmark size={24} />
                         </div>
                         <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-widest drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] flex-1 border-b-4 border-indigo-500/50 pb-2 flex justify-between items-center">
                           <span>{t.watchlist}</span>
                           <span className="text-xs font-black text-indigo-400 hover:text-white transition-colors cursor-pointer" onClick={() => setActiveTab('profile_watchlist')}>{t.viewAll} &rarr;</span>
                         </h3>
                      </div>
                      <div className="cine-glass p-8 flex flex-col group cursor-pointer h-[calc(100%-80px)] border-2 border-indigo-500/60 bg-gradient-to-br from-[#03050A] to-indigo-950/30 hover:-translate-y-2 hover:-translate-x-1 hover:shadow-[12px_12px_0px_rgba(0,0,0,1)] transition-all duration-300 shadow-[8px_8px_0px_rgba(0,0,0,1)] relative overflow-hidden" onClick={() => setActiveTab('profile_watchlist')}>
                        <div className="absolute top-0 right-0 bg-indigo-500 text-white border-b-2 border-l-2 border-black text-[9px] font-black px-2.5 py-1 rounded-bl-sm shadow-[-2px_2px_0px_rgba(0,0,0,1)] z-20">ID: WATCHLIST</div>
                        {sortedWatchlist.length === 0 ? (
                           <div className="flex-1 flex items-center justify-center relative z-10"><p className="text-slate-500 text-sm font-bold text-center py-8">{t.emptyWatchlist}</p></div>
                        ) : (
                           <div className="flex gap-4 overflow-x-hidden hide-scrollbar py-2 px-1 relative z-10 mt-2">
                              {sortedWatchlist.slice(0, 4).map(item => (
                                <img key={item.id} src={item.poster || 'https://via.placeholder.com/200x300?text=Poster'} className="w-20 sm:w-24 aspect-[2/3] object-cover rounded-sm border-2 border-slate-700 shadow-[4px_4px_0px_rgba(0,0,0,1)] group-hover:border-indigo-400 transition-all hover:-translate-y-1 hover:-translate-x-1" alt=""/>
                              ))}
                              {sortedWatchlist.length > 4 && (
                                <div className="w-20 sm:w-24 aspect-[2/3] rounded-sm bg-[#03050A] border-2 border-slate-800 flex items-center justify-center group-hover:border-indigo-400 shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-colors">
                                  <span className="font-black text-indigo-500 group-hover:text-indigo-400 text-xl drop-shadow-[1px_1px_0px_rgba(0,0,0,1)]">+{sortedWatchlist.length - 4}</span>
                                </div>
                              )}
                           </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* SİNEMATİK DNA ANALİZİ VİTRİNİ (BAŞLIKLI) */}
                <div className="mt-16">
                  <div className="flex items-center gap-4 mb-6">
                     <div className="w-12 h-12 bg-theme text-[#03050A] border-2 border-black flex items-center justify-center shadow-[4px_4px_0px_rgba(0,0,0,1)] rounded-sm shrink-0">
                       <Sparkles size={24} />
                     </div>
                     <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-widest drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] flex-1 border-b-4 border-theme/50 pb-2">
                       DNA Analiz & Kritik Odak
                     </h3>
                  </div>

                  {(() => {
                    const dnaReport = analyzeComprehensiveDNA(sortedMyRatings, criteriaData);
                    return (
                      <div className="cine-glass p-5 sm:p-8 relative overflow-hidden border-2 border-theme/60 bg-gradient-to-br from-[#03050A] to-theme/5 shadow-[8px_8px_0px_rgba(0,0,0,1)]">
                        <div className="absolute top-0 right-0 bg-theme text-black border-b-2 border-l-2 border-black text-[9px] font-black px-2.5 py-1 rounded-bl-sm shadow-[-2px_2px_0px_rgba(0,0,0,1)] z-20">ID: DNA_CORE</div>
                        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-[100px] opacity-20 pointer-events-none" style={{ backgroundColor: themeColor }}></div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 mb-6 border-b-2 border-slate-800 relative z-10 mt-2">
                          <div>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-[#03050A] border-2 border-theme text-theme text-[10px] font-black uppercase tracking-widest mb-2 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                              🧬 {t.topFocusSubtitle || '3 Boyutlu DNA Algoritması'}
                            </span>
                            <h3 className="text-xl sm:text-2xl font-black text-white drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">{t.topFocusMyTitle || 'En Çok Dikkat Ettiğin Kriter'}</h3>
                          </div>
                          <span className="px-3.5 py-1.5 rounded-sm bg-[#03050A] border-2 border-slate-800 text-xs font-black text-theme shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                            {dnaReport.count} / {dnaReport.minRequired} Film Analiz Edildi
                          </span>
                        </div>

                        {!dnaReport.unlocked ? (
                          <div className="bg-[#03050A] border-2 border-slate-800 rounded-sm p-6 text-center max-w-xl mx-auto shadow-[4px_4px_0px_rgba(0,0,0,1)] relative z-10">
                            <div className="w-14 h-14 rounded-sm bg-[#03050A] border-2 border-slate-700 flex items-center justify-center mx-auto mb-3 text-theme shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                              <Sparkles size={26}/>
                            </div>
                            <h4 className="text-lg font-black text-white mb-1">{t.dnaLockedTitle}</h4>
                            <p className="text-xs sm:text-sm font-bold text-slate-400 mb-4">
                              <strong className="text-theme">{dnaReport.remaining}</strong> {t.dnaLockedDesc}
                            </p>
                            <div className="w-full bg-slate-900 h-4 rounded-sm overflow-hidden border-2 border-slate-800 shadow-[inset_2px_2px_0px_rgba(0,0,0,0.5)]">
                              <div
                                className="h-full border-r-2 border-black transition-all duration-500"
                                style={{ width: `${dnaReport.progressPct}%`, backgroundColor: themeColor }}
                              ></div>
                            </div>
                            <span className="text-[11px] font-black text-slate-400 mt-2 block">
                              {t.dnaCalibrationLabel || 'DNA Kalibrasyon İlerlemesi'}: %{dnaReport.progressPct}
                            </span>
                          </div>
                        ) : dnaReport.topCriterion && (
                          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch relative z-10">
                            {/* SOL KART: 1 NUMARALI KRİTİK ODAK NOKTASI */}
                            <div className="lg:col-span-5 bg-[#03050A] border-2 rounded-sm p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden shadow-[4px_4px_0px_rgba(0,0,0,1)]" style={{ borderColor: `${themeColor}88` }}>
                              <div>
                                <div className="flex items-center justify-between gap-2 mb-4">
                                  <span className="px-3 py-1 rounded-sm bg-theme text-[#03050A] border-2 border-black font-black text-[10px] uppercase tracking-widest shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                                    #1 KRİTİK ODAK NOKTAN
                                  </span>
                                  <span className="text-2xl font-black text-theme drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">%{dnaReport.topCriterion.focusIndex}</span>
                                </div>

                                <h4 className="text-2xl sm:text-3xl font-black text-white mb-2 leading-tight drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                                  {dnaReport.topCriterion.name}
                                </h4>
                                <p className="text-xs text-slate-300 font-medium leading-relaxed mb-5">
                                  {t.focusAnalysisExplain}
                                </p>

                                <div className="grid grid-cols-3 gap-3 mb-4">
                                  <div className="bg-[#03050A] border-2 border-cyan-500/40 rounded-sm p-2.5 text-center shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                                    <span className="text-[9px] font-black text-cyan-400 uppercase block">{t.selectivityLabel || 'Seçicilik'}</span>
                                    <span className="text-sm sm:text-base font-black text-white">%{dnaReport.topCriterion.selectivity}</span>
                                  </div>
                                  <div className="bg-[#03050A] border-2 border-rose-500/40 rounded-sm p-2.5 text-center shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                                    <span className="text-[9px] font-black text-rose-400 uppercase block">{t.strictnessLabel || 'Sertlik'}</span>
                                    <span className="text-sm sm:text-base font-black text-white">%{dnaReport.topCriterion.strictness}</span>
                                  </div>
                                  <div className="bg-[#03050A] border-2 border-amber-500/40 rounded-sm p-2.5 text-center shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                                    <span className="text-[9px] font-black text-amber-400 uppercase block">{t.impactLabel || 'Karar Etkisi'}</span>
                                    <span className="text-sm sm:text-base font-black text-white">%{dnaReport.topCriterion.impact}</span>
                                  </div>
                                </div>
                              </div>

                              {dnaReport.secondCriterion && (
                                <div className="pt-3 border-t-2 border-slate-800 flex items-center justify-between text-xs">
                                  <span className="font-bold text-slate-400">{t.secondFocusLabel || 'İkincil Odak Noktası:'}</span>
                                  <span className="font-black text-white">{dnaReport.secondCriterion.name} (%{dnaReport.secondCriterion.focusIndex})</span>
                                </div>
                              )}
                            </div>

                            {/* SAĞ KART: TÜM KRİTERLERİN 3 BOYUTLU DNA SIRALAMASI */}
                            <div className="lg:col-span-7 bg-[#03050A] border-2 border-slate-800 rounded-sm p-5 sm:p-6 flex flex-col justify-between space-y-4 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                              {dnaReport.rankedBreakdown.map((item, rIdx) => (
                                <div key={item.id} className="space-y-2">
                                  <div className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-3 min-w-0">
                                      <span className={`w-6 h-6 rounded-sm border-2 border-black font-black text-[10px] flex items-center justify-center shadow-[2px_2px_0px_rgba(0,0,0,0.5)] shrink-0 ${rIdx === 0 ? 'bg-theme text-[#03050A]' : 'bg-[#03050A] text-slate-300'}`}>
                                        {rIdx + 1}
                                      </span>
                                      <span className={`font-black truncate ${rIdx === 0 ? 'text-white' : 'text-slate-300'} drop-shadow-[1px_1px_0px_rgba(0,0,0,1)]`}>{item.name}</span>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                      <span className="text-[10px] font-bold text-slate-500 hidden sm:inline">
                                        {t.selectivityLabel}: %{item.selectivity} • {t.strictnessLabel}: %{item.strictness} • {t.impactLabel}: %{item.impact}
                                      </span>
                                      <span className="font-black text-xs sm:text-sm drop-shadow-[1px_1px_0px_rgba(0,0,0,1)]" style={{ color: rIdx === 0 ? themeColor : '#e2e8f0' }}>
                                        %{item.focusIndex}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="w-full h-3 bg-[#03050A] rounded-sm overflow-hidden border-2 border-slate-800 shadow-[inset_2px_2px_0px_rgba(0,0,0,0.5)]">
                                    <div
                                      className="h-full border-r-2 border-black transition-all duration-700"
                                      style={{
                                        width: `${item.focusIndex}%`,
                                        backgroundColor: rIdx === 0 ? themeColor : rIdx === 1 ? '#38bdf8' : '#64748b'
                                      }}
                                    ></div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* ROZETLER KOLEKSİYONU (BAŞLIKLI) */}
                <div className="mt-16">
                  <div className="flex items-center gap-4 mb-6">
                     <div className="w-12 h-12 bg-amber-400 text-[#03050A] border-2 border-black flex items-center justify-center shadow-[4px_4px_0px_rgba(0,0,0,1)] rounded-sm shrink-0">
                       <Medal size={24} />
                     </div>
                     <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-widest drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] flex-1 border-b-4 border-amber-400/50 pb-2">
                       {t.badges}
                     </h3>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
                     {getAllBadges(sortedMyRatings, t, safeGlobalMovies).map(badge => (
                       <div
                         key={badge.id}
                         tabIndex={0}
                         onClick={() => { if (badge.earned) setUnlockedBadgeModal(badge); }}
                         className={`tilt-card flex flex-col items-center justify-between p-5 rounded-lg border-2 text-center group relative overflow-visible hover:z-50 focus:z-50 outline-none transition-all duration-300 ${
                           badge.earned
                             ? `bg-gradient-to-br ${badge.cardBg} cursor-pointer shadow-[6px_6px_0px_rgba(0,0,0,1)]`
                             : 'border-slate-800 bg-[#03050A] opacity-60 hover:opacity-90 shadow-[6px_6px_0px_rgba(0,0,0,1)]'
                         }`}
                       >
                         {/* Holografik Parlama Katmanı (Baloncuğu kesmemesi için iç katmana alındı) */}
                         {badge.earned && (
                           <div className="absolute inset-0 rounded-lg holo-badge pointer-events-none"></div>
                         )}

                         {/* Üst Seviye (Tier) Etiketi */}
                         <div className="w-full flex items-center justify-between gap-1 mb-2 relative z-10">
                           <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-sm border-2 ${
                             badge.earned ? badge.badgePill : 'bg-[#03050A] text-slate-500 border-slate-800'
                           }`}>
                             {badge.tier || 'ROZET'}
                           </span>
                           <span className="text-[10px] font-black">
                             {badge.earned ? '✨' : '🔒'}
                           </span>
                         </div>

                         {/* Orta 3D Parlayan Madalyon Küresi */}
                         <div className="relative my-3 flex items-center justify-center z-10">
                           {badge.earned && (
                             <div className={`absolute -inset-2 rounded-sm bg-gradient-to-r ${badge.orbBg} opacity-35 blur-md group-hover:opacity-65 transition-opacity`}></div>
                           )}
                           <div className={`relative w-16 h-16 rounded-sm rotate-3 group-hover:rotate-0 flex items-center justify-center transition-all duration-300 border-2 ${
                             badge.earned
                               ? `bg-gradient-to-br ${badge.orbBg} border-white/40 badge-emblem-float shadow-[3px_3px_0px_rgba(0,0,0,1)]`
                               : 'bg-[#03050A] border-slate-800 text-slate-600 grayscale'
                           }`}>
                             <div className="drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                               {badge.icon}
                             </div>
                           </div>
                         </div>

                         {/* Sadece Rozet İsmi (Açıklama Baloncukta Gösterilir) */}
                         <div className="mt-2 w-full relative z-10">
                           <span className={`font-black text-xs sm:text-sm tracking-wide block truncate ${badge.earned ? 'text-white drop-shadow-[1px_1px_0px_rgba(0,0,0,1)]' : 'text-slate-400'}`}>
                             {badge.name}
                           </span>
                         </div>

                         {/* Alt Parlak Neon Çizgi */}
                         {badge.earned && (
                           <div className={`w-12 h-1.5 rounded-sm bg-gradient-to-r ${badge.orbBg} mt-3 opacity-80 relative z-10 border border-black`}></div>
                         )}

                         {/* Hem Kazanılan Hem Kilitli Rozetlerde Açılan Açıklama Baloncuğu (Mobil Dokunma ve Masaüstü Hover Uyumlu) */}
                         <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 hidden group-hover:block group-focus:block group-active:block w-48 sm:w-56 bg-[#03050A] text-slate-100 text-xs font-bold p-3.5 rounded-sm shadow-[6px_6px_0px_rgba(0,0,0,1)] border-2 border-slate-600 z-50 pointer-events-none text-center leading-relaxed">
                            <strong className={`block mb-1 drop-shadow-[1px_1px_0px_rgba(0,0,0,1)] ${badge.earned ? 'text-amber-400' : 'text-slate-400'}`}>
                              {badge.name}
                            </strong>
                            {badge.earned ? (badge.realDesc || badge.desc) : badge.desc}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 w-3 h-3 bg-[#03050A] rotate-45 -mt-1.5 border-r-2 border-b-2 border-slate-600"></div>
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
                  <h3 className="text-2xl font-black text-white flex items-center gap-3 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]"><Film className="text-theme" size={28}/> {t.myRatedMovies}</h3>
                  <div className="flex items-center gap-3 bg-[#03050A] p-2 rounded-sm border-2 border-slate-800 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
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
                   <div className="text-center py-20 bg-[#03050A] rounded-lg border-2 border-slate-800 border-dashed shadow-[4px_4px_0px_rgba(0,0,0,1)]">
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
                           <img src={safePoster} className="w-full aspect-[2/3] object-cover rounded-lg bg-[#03050A] border-2 border-slate-800 group-hover:border-theme transition-colors shadow-[4px_4px_0px_rgba(0,0,0,1)] group-hover:shadow-[6px_6px_0px_var(--theme-color-50)] group-hover:-translate-y-1 group-hover:-translate-x-1" alt=""/>
                           
                           {globalScore > 0 && (
                             <div className={`absolute top-2 right-2 px-2 py-1 rounded-sm border-2 z-10 pointer-events-none flex flex-col items-center justify-center ${isNeon ? 'bg-[#03050A] animate-pulse shadow-[2px_2px_0px_#39ff14]' : 'bg-[#03050A] border-slate-700 shadow-[2px_2px_0px_rgba(0,0,0,1)]'}`} style={isNeon ? {borderColor: '#39ff14'} : {}}>
                               <span className="text-[8px] sm:text-[10px] text-slate-400 font-black mb-0.5 uppercase tracking-widest leading-none">{t.globalScoreLabel}</span>
                               <span className="text-sm font-black leading-none" style={{color: isNeon ? '#39ff14' : getScoreColorHex(globalScore)}}>{globalScore.toFixed(2)}</span>
                             </div>
                           )}

                           <div className="absolute inset-0 bg-gradient-to-t from-[#03050A] via-[#03050A]/60 to-transparent rounded-lg opacity-0 group-hover:opacity-100 flex flex-col justify-end p-4 transition-opacity">
                              <div>
                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest block mb-1 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">{t.yourScoreLabel}</span>
                                <div className="relative w-max">
                                  <MiniVFX score={safeScore} />
                                  <div className="relative z-10 text-4xl font-black leading-none mb-1 transition-colors drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]" style={{color: getScoreColorHex(safeScore)}}>{safeScore.toFixed(2)}</div>
                                </div>
                              </div>
                              <h4 className="font-bold text-white text-sm leading-tight line-clamp-2 mt-1 mb-2 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">{displayTitle}</h4>
                              
                              <button onClick={(e) => deleteRating(safeId, e)} className="absolute bottom-3 right-3 p-2 bg-red-600 hover:bg-red-500 text-[#03050A] rounded-sm opacity-0 group-hover:opacity-100 transition-all border-2 border-black z-50 magnetic-btn shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                              </button>
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
                     <h3 className="text-2xl font-black text-white flex items-center gap-3 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]"><ListPlus className="text-fuchsia-500" size={28}/> {t.customLists}</h3>
                     <button onClick={() => setShowNewListModal(true)} className="px-4 py-2 bg-[#03050A] hover:bg-theme text-theme hover:text-[#03050A] border-2 border-theme rounded-sm font-bold flex items-center gap-2 transition-colors shadow-[4px_4px_0px_rgba(0,0,0,1)] magnetic-btn"><Plus size={18}/> <span className="hidden sm:inline">{t.createNewList}</span></button>
                   </div>
                   
                   {customLists.length === 0 ? (
                     <div className="text-center py-10 bg-[#03050A] rounded-lg border-2 border-slate-800 border-dashed shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                       <p className="text-slate-400 font-bold mb-4">{t.emptyWatchlist}</p>
                       <button onClick={() => setShowNewListModal(true)} className="px-6 py-3 bg-[#03050A] text-theme border-2 border-theme hover:bg-theme hover:text-[#03050A] rounded-sm font-bold transition-colors magnetic-btn shadow-[2px_2px_0px_rgba(0,0,0,1)]">{t.createNewList}</button>
                     </div>
                   ) : (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {customLists.map(list => (
                          <div key={list.id} onClick={() => { setActiveCustomList(list); setActiveTab('profile_list_detail'); }} className="cine-glass p-6 group cursor-pointer">
                             <div className="flex items-center justify-between mb-4 gap-2">
                                <h4 className="text-xl font-black text-white group-hover:text-theme transition-colors truncate drop-shadow-[1px_1px_0px_rgba(0,0,0,1)]">{list.name}</h4>
                                <div className="flex items-center gap-2 shrink-0">
                                  {list.movies?.length > 0 && (
                                    <button onClick={(e) => generateListPoster(list, e)} title={t.downloadListPoster} className="px-3 py-2 bg-[#03050A] rounded-sm border-2 border-slate-700 text-theme text-xs font-black flex items-center gap-1.5 transition-colors magnetic-btn shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                                      <Save size={15}/> <span className="hidden sm:inline">{t.downloadListPoster}</span>
                                    </button>
                                  )}
                                  <button onClick={(e) => handleShareList(e, list.id)} title={t.share} className="p-2 bg-[#03050A] rounded-sm border-2 border-slate-700 text-slate-400 hover:text-theme transition-colors magnetic-btn shadow-[2px_2px_0px_rgba(0,0,0,1)]"><Share2 size={16}/></button>
                                  <button onClick={(e) => { e.stopPropagation(); setListToDelete(list.id); }} title={t.deleteListTitle} className="p-2 bg-red-600 rounded-sm border-2 border-black text-[#03050A] transition-colors magnetic-btn shadow-[2px_2px_0px_rgba(0,0,0,1)]"><X size={16}/></button>
                                </div>
                             </div>
                             
                             {list.movies && list.movies.length > 0 ? (
                               <div className="flex gap-3 overflow-x-hidden pb-2 px-1 pt-1">
                                  {list.movies.slice(0, 5).map(m => (
                                    <img key={m.id} src={m.poster} className="w-16 h-24 rounded-sm object-cover shadow-[2px_2px_0px_rgba(0,0,0,1)] border-2 border-slate-800" alt=""/>
                                  ))}
                                  {list.movies.length > 5 && (
                                    <div className="w-16 h-24 rounded-sm bg-[#03050A] border-2 border-slate-800 flex items-center justify-center font-black text-slate-500 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
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

                <div className="pt-6 border-t-2 border-slate-800/50">
                  <div className="flex items-center justify-between mb-6 gap-4">
                    <h3 className="text-2xl font-black text-white flex items-center gap-3 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]"><Bookmark className="text-theme" size={28}/> {t.watchlist}</h3>
                    {sortedWatchlist.length >= 2 && (
                      <button onClick={startCinemaRoulette} className="px-4 py-2.5 bg-theme text-[#03050A] rounded-sm border-2 border-black font-black text-xs sm:text-sm flex items-center gap-2 shadow-[4px_4px_0px_rgba(0,0,0,1)] magnetic-btn transition-all">
                        <Sparkles size={18}/> {t.rouletteBtn}
                      </button>
                    )}
                  </div>
                  {sortedWatchlist.length === 0 ? (
                     <div className="text-center py-20 bg-[#03050A] rounded-lg border-2 border-slate-800 border-dashed shadow-[4px_4px_0px_rgba(0,0,0,1)]">
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
                             <img src={safePoster} className="w-full aspect-[2/3] object-cover rounded-lg bg-[#03050A] border-2 border-slate-800 group-hover:border-theme transition-colors shadow-[4px_4px_0px_rgba(0,0,0,1)] group-hover:shadow-[6px_6px_0px_var(--theme-color-50)] group-hover:-translate-y-1 group-hover:-translate-x-1" alt=""/>
                             <div className="absolute top-2 right-2 w-8 h-8 rounded-sm bg-[#03050A] border-2 border-theme flex items-center justify-center shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                                <BookmarkCheck size={16} className="text-theme"/>
                             </div>
                             <div className="absolute inset-0 bg-gradient-to-t from-[#03050A] via-[#03050A]/40 to-transparent rounded-lg opacity-0 group-hover:opacity-100 flex flex-col justify-end p-4 transition-opacity">
                                {globalData && globalData.avgScore > 0 && (
                                  <div className="mb-1">
                                    <span className={`text-xs font-black px-2 py-1 rounded-sm border-2 ${isNeon ? 'bg-[#03050A] shadow-[2px_2px_0px_#39ff14]' : 'bg-[#03050A] border-slate-700 shadow-[2px_2px_0px_rgba(0,0,0,1)]'}`} style={isNeon ? {borderColor: '#39ff14', color: '#39ff14'} : {color: getScoreColorHex(globalData.avgScore)}}>{Number(globalData.avgScore).toFixed(2)}</span>
                                  </div>
                                )}
                                <h4 className="font-bold text-white text-sm leading-tight line-clamp-2 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">{displayTitle}</h4>
                             </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

              </div>
            )}

            {activeTab === 'profile_list_detail' && activeCustomList && (
              <div className="animate-in slide-in-from-right-8 duration-500">
                <button onClick={() => setActiveTab('profile_watchlist')} className="px-5 py-3 mb-6 bg-[#03050A] border-2 border-slate-800 rounded-sm text-white font-bold flex items-center gap-2 transition-colors magnetic-btn shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                   <ChevronLeft size={18}/> Geri
                </button>
                
                <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                   <h2 className="text-3xl sm:text-4xl font-black text-white drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] flex items-center gap-3"><ListPlus className="text-theme"/> {activeCustomList.name}</h2>
                   <div className="flex items-center gap-2.5">
                     {activeCustomList.movies?.length > 0 && (
                       <button onClick={(e) => generateListPoster(activeCustomList, e)} className="px-4 py-2.5 bg-theme text-[#03050A] border-2 border-black rounded-sm font-black flex items-center gap-2 shadow-[4px_4px_0px_rgba(0,0,0,1)] magnetic-btn transition-transform text-xs sm:text-sm">
                         <Save size={18}/> {t.downloadListPoster}
                       </button>
                     )}
                     <button onClick={(e) => handleShareList(e, activeCustomList.id)} className="px-4 py-2.5 bg-[#03050A] text-white border-2 border-slate-700 rounded-sm font-bold flex items-center gap-2 transition-colors text-xs sm:text-sm magnetic-btn shadow-[4px_4px_0px_rgba(0,0,0,1)]"><Share2 size={18}/> <span className="hidden sm:inline">{t.share}</span></button>
                     <button onClick={() => setListToDelete(activeCustomList.id)} className="px-3.5 py-2.5 bg-red-600 text-[#03050A] border-2 border-black rounded-sm font-bold flex items-center gap-1.5 transition-colors text-xs sm:text-sm magnetic-btn shadow-[4px_4px_0px_rgba(0,0,0,1)]"><X size={18}/></button>
                   </div>
                </div>

                {!activeCustomList.movies || activeCustomList.movies.length === 0 ? (
                   <div className="text-center py-20 bg-[#03050A] rounded-lg border-2 border-slate-800 border-dashed shadow-[4px_4px_0px_rgba(0,0,0,1)]">
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
                           <div className="absolute top-2.5 left-2.5 z-20 px-2.5 py-1 rounded-sm border-2 border-black bg-theme text-[#03050A] font-black text-xs shadow-[2px_2px_0px_rgba(0,0,0,1)]">#{index + 1}</div>
                           <button onClick={(e) => removeMovieFromCustomList(activeCustomList.id, safeId, e)} className="absolute top-2.5 right-2.5 z-20 p-1.5 rounded-sm bg-red-600 border-2 border-black text-[#03050A] opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity shadow-[2px_2px_0px_rgba(0,0,0,1)] magnetic-btn"><X size={14}/></button>
                           <img src={safePoster} className="w-full aspect-[2/3] object-cover rounded-lg bg-[#03050A] border-2 border-slate-800 group-hover:border-theme transition-colors shadow-[4px_4px_0px_rgba(0,0,0,1)] group-hover:shadow-[6px_6px_0px_var(--theme-color-50)] group-hover:-translate-y-1 group-hover:-translate-x-1" alt=""/>
                           <div className="absolute inset-0 bg-gradient-to-t from-[#03050A] via-[#03050A]/40 to-transparent rounded-lg opacity-0 group-hover:opacity-100 flex flex-col justify-end p-4 transition-opacity">
                              {globalData && globalData.avgScore > 0 && (
                                <div className="mb-1">
                                  <span className={`text-xs font-black px-2 py-1 rounded-sm border-2 ${isNeon ? 'bg-[#03050A] shadow-[2px_2px_0px_#39ff14]' : 'bg-[#03050A] border-slate-700 shadow-[2px_2px_0px_rgba(0,0,0,1)]'}`} style={isNeon ? {borderColor: themeColor, color: themeColor} : {color: getScoreColorHex(globalData.avgScore)}}>{Number(globalData.avgScore).toFixed(2)}</span>
                                </div>
                              )}
                              <h4 className="font-bold text-white text-sm leading-tight line-clamp-2 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">{displayTitle}</h4>
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

        {/* YENİ: BAĞIMSIZ TAKİP ETTİKLERİM EKRANI */}
        {activeTab === 'profile_following' && (
          <div className="animate-in fade-in duration-500 space-y-6 max-w-5xl mx-auto pt-4">
             <button onClick={() => setActiveTab('profile_general')} className="px-5 py-3 bg-[#03050A] border-2 border-slate-800 rounded-sm hover:border-white text-white font-bold flex items-center gap-2 transition-colors w-max mb-6 shadow-[4px_4px_0px_rgba(0,0,0,1)] magnetic-btn">
                <ChevronLeft size={18}/> Geri Dön
             </button>
             
             <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-theme text-[#03050A] border-2 border-black flex items-center justify-center shadow-[4px_4px_0px_rgba(0,0,0,1)] rounded-sm shrink-0">
                  <UserPlus size={24} />
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-widest drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] flex-1 border-b-4 border-theme/20 pb-2">
                  {t.followingTab}
                </h3>
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {followingUsersList.length > 0 ? followingUsersList.map(u => (
                  <div key={u.uid} onClick={() => loadPublicProfile(u.uid)} className="cine-glass p-6 flex items-center gap-4 cursor-pointer hover:border-theme transition-all group magnetic-btn shadow-[6px_6px_0px_rgba(0,0,0,1)]">
                     <img src={u.avatar || AVATAR_DEFAULT} className="w-16 h-16 rounded-sm border-2 border-slate-700 group-hover:border-theme transition-colors object-cover shadow-[2px_2px_0px_rgba(0,0,0,1)]" alt=""/>
                     <div>
                       <h4 className="text-lg font-black text-white group-hover:text-theme transition-colors line-clamp-1 drop-shadow-[1px_1px_0px_rgba(0,0,0,1)]">{u.displayName}</h4>
                       <p className="text-xs font-bold text-slate-500 mt-1">@{u.userCode || (u.uid ? u.uid.substring(0,6).toUpperCase() : '')}</p>
                     </div>
                  </div>
                )) : (
                  <div className="col-span-full text-center py-20 text-slate-500 font-bold bg-[#03050A] rounded-sm border-2 border-slate-800 border-dashed shadow-[inset_4px_4px_0px_rgba(0,0,0,0.5)]">{t.noData}</div>
                )}
             </div>
          </div>
        )}

        {/* YENİ: BAĞIMSIZ TAKİPÇİLERİM EKRANI */}
        {activeTab === 'profile_followers' && (
          <div className="animate-in fade-in duration-500 space-y-6 max-w-5xl mx-auto pt-4">
             <button onClick={() => setActiveTab('profile_general')} className="px-5 py-3 bg-[#03050A] border-2 border-slate-800 rounded-sm hover:border-white text-white font-bold flex items-center gap-2 transition-colors w-max mb-6 shadow-[4px_4px_0px_rgba(0,0,0,1)] magnetic-btn">
                <ChevronLeft size={18}/> Geri Dön
             </button>

             <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-indigo-400 text-[#03050A] border-2 border-black flex items-center justify-center shadow-[4px_4px_0px_rgba(0,0,0,1)] rounded-sm shrink-0">
                  <Users size={24} />
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-widest drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] flex-1 border-b-4 border-indigo-400/20 pb-2">
                  {t.followersTab}
                </h3>
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {followersUsersList.length > 0 ? followersUsersList.map(u => (
                  <div key={u.uid} onClick={() => loadPublicProfile(u.uid)} className="cine-glass p-6 flex items-center gap-4 cursor-pointer hover:border-theme transition-all group magnetic-btn shadow-[6px_6px_0px_rgba(0,0,0,1)]">
                     <img src={u.avatar || AVATAR_DEFAULT} className="w-16 h-16 rounded-sm border-2 border-slate-700 group-hover:border-theme transition-colors object-cover shadow-[2px_2px_0px_rgba(0,0,0,1)]" alt=""/>
                     <div>
                       <h4 className="text-lg font-black text-white group-hover:text-theme transition-colors line-clamp-1 drop-shadow-[1px_1px_0px_rgba(0,0,0,1)]">{u.displayName}</h4>
                       <p className="text-xs font-bold text-slate-500 mt-1">@{u.userCode || (u.uid ? u.uid.substring(0,6).toUpperCase() : '')}</p>
                     </div>
                  </div>
                )) : (
                  <div className="col-span-full text-center py-20 text-slate-500 font-bold bg-[#03050A] rounded-sm border-2 border-slate-800 border-dashed shadow-[inset_4px_4px_0px_rgba(0,0,0,0.5)]">{t.noData}</div>
                )}
             </div>
          </div>
        )}
        
      </main>

      <div className="md:hidden fixed bottom-0 left-0 w-full bg-[#03050A]/95 backdrop-blur-md border-t-2 border-slate-800 p-2 pb-[calc(8px+env(safe-area-inset-bottom))] flex justify-around items-center z-[100] shadow-[0_-4px_0px_rgba(0,0,0,1)]">
         <button onClick={() => {setActiveTab('home'); setDynamicBg(''); setSelectedMovie(null);}} className={`flex-1 py-2.5 mx-1 rounded-sm text-sm font-black flex flex-col items-center gap-1 transition-all border-2 ${activeTab === 'home' ? 'bg-theme text-[#03050A] border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] -translate-y-0.5' : 'text-slate-500 border-transparent hover:text-white'}`}><Clapperboard size={20}/> <span className="text-[9px] uppercase tracking-widest">{t.home}</span></button>
         <button onClick={() => {setActiveTab('global'); setDynamicBg(''); setSelectedMovie(null);}} className={`flex-1 py-2.5 mx-1 rounded-sm text-sm font-black flex flex-col items-center gap-1 transition-all border-2 ${activeTab === 'global' ? 'bg-theme text-[#03050A] border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] -translate-y-0.5' : 'text-slate-500 border-transparent hover:text-white'}`}><Globe size={20}/> <span className="text-[9px] uppercase tracking-widest">{t.ranking}</span></button>
         <button onClick={handleOpenCommunity} className={`flex-1 py-2.5 mx-1 rounded-sm text-sm font-black flex flex-col items-center gap-1 transition-all border-2 ${activeTab === 'community' ? 'bg-theme text-[#03050A] border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] -translate-y-0.5' : 'text-slate-500 border-transparent hover:text-white'}`}><Users size={20}/> <span className="text-[9px] uppercase tracking-widest">{t.community}</span></button>
         <button onClick={() => { if(!user){setShowLoginModal(true); return;} setActiveTab('profile_general'); setDynamicBg(''); setSelectedMovie(null);}} className={`flex-1 py-2.5 mx-1 rounded-sm text-sm font-black flex flex-col items-center gap-1 transition-all border-2 ${activeTab.startsWith('profile') ? 'bg-theme text-[#03050A] border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] -translate-y-0.5' : 'text-slate-500 border-transparent hover:text-white'}`}><User size={20}/> <span className="text-[9px] uppercase tracking-widest">Profil</span></button>
      </div>

      <footer className="relative z-10 border-t-2 border-slate-800 bg-[#03050A] py-10 mt-8 text-center pb-28 md:pb-10 shadow-[0_-4px_0px_rgba(0,0,0,1)]">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-black mb-2 tracking-tighter drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]" style={{fontFamily: "'Montserrat', sans-serif"}}>
             <span className="text-white">CINE</span><span className="logo-morph-text drop-shadow-none">SCORE</span>
          </h2>
          <p className="text-slate-400 text-sm font-bold mb-8">{t.footerDesc}</p>
          
          <a href="https://mail.google.com/mail/?view=cm&fs=1&to=m.enesinalcik@gmail.com" target="_blank" rel="noreferrer" className="inline-flex flex-col sm:flex-row items-center gap-4 px-8 py-5 bg-[#03050A] border-2 border-slate-700 hover:border-theme rounded-sm transition-all group cursor-pointer magnetic-btn shadow-[6px_6px_0px_rgba(0,0,0,1)]">
             <span className="text-slate-400 group-hover:text-white text-xs font-black uppercase tracking-widest transition-colors drop-shadow-[1px_1px_0px_rgba(0,0,0,1)]">{t.contactLabel}</span>
             <span className="text-white group-hover:text-theme text-base font-black transition-colors flex items-center gap-2 drop-shadow-[1px_1px_0px_rgba(0,0,0,1)]">
               m.enesinalcik@gmail.com
             </span>
          </a>
          
          <p className="text-slate-500 text-xs mt-10 font-bold flex items-center justify-center gap-2">
             © 2026 {t.rights} 
             <span className="px-2 py-0.5 bg-[#03050A] rounded-sm text-[10px] tracking-wider text-slate-300 border-2 border-slate-700 shadow-[2px_2px_0px_rgba(0,0,0,1)]">v6.2</span>
          </p>
        </div>
      </footer>

    </div>
  );
}