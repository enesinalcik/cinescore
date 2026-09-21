import React, { useState, useEffect, useRef } from 'react';
import { Star, Film, Save, Award, Clapperboard, Search, Loader2, Globe, User, LogIn, LogOut, X, TrendingUp, Edit3, HelpCircle, Users, Info, Settings, Clock, Flame, Play, Crown, Ticket, Medal, ChevronLeft, ChevronRight, Tv } from 'lucide-react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDoc, onSnapshot, runTransaction, query, orderBy } from 'firebase/firestore';

// --------------------------------------------------------
// 1. FIREBASE VE API AYARLARI (Zırhlı Başlatma)
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
// 2. TAM KAPSAMLI DİL VE ÇEVİRİ DESTEĞİ (Eksiksiz!)
// --------------------------------------------------------
const LANGUAGES = [
  { code: 'tr', tmdbCode: 'tr-TR', flag: 'TR', label: 'Türkçe' },
  { code: 'en', tmdbCode: 'en-US', flag: 'EN', label: 'English' },
  { code: 'de', tmdbCode: 'de-DE', flag: 'DE', label: 'Deutsch' },
  { code: 'it', tmdbCode: 'it-IT', flag: 'IT', label: 'Italiano' },
  { code: 'fr', tmdbCode: 'fr-FR', flag: 'FR', label: 'Français' },
];

const TRANSLATIONS = {
  en: {
    home: 'Home', ranking: 'Global Ranking', login: 'Login', logout: 'Log Out',
    trending: 'Trending Now', topRated: 'Cult Classics', recentActivity: 'Recent Ratings', featured: 'Featured This Week', mostVoted: 'Most Voted',
    searchPlaceholder: 'Search movies...', director: 'Director', cast: 'Cast', summary: 'Plot', watchTrailer: 'Watch Trailer',
    saveRating: 'Save Rating', updateRating: 'Update Rating', criteria: 'Review Criteria', yourScore: 'Your Score', globalRanking: 'Global Ranking', 
    noRating: 'You haven\'t rated any movies yet.', ratedFilms: 'Movies Rated', myRatings: 'My Ratings', editProfile: 'Edit Profile', rateNow: 'Rate',
    lastVote: 'Last Vote', voteCount: 'Votes', average: 'Avg', badges: 'Earned Badges',
    cultClassics: 'Legendary Classics', actionPacked: 'Action Packed', emotionalDramas: 'Emotional Dramas',
    c1: 'Screenplay', c1Desc: 'Plot, dialogue, and story originality.', c2: 'Acting', c2Desc: 'How believable and engaging the actors are.',
    c3: 'Cinematography', c3Desc: 'Camera angles, lighting, and visual composition.', c4: 'Sound & Music', c4Desc: 'Music and sound effects that enhance atmosphere.',
    c5: 'Editing & Pacing', c5Desc: 'Scene transitions and the tempo of the film.',
    globalDesc: 'The massive cinema archive built by community choices.', registeredMovies: 'Rated Movies',
    username: 'Username', selectAvatar: 'Select Cinematic Avatar', saveChanges: 'Save', noBadges: 'Start rating movies to earn badges!',
    b1Name: 'Popcorn Eater', b1Desc: 'Rated your first movie!', b2Name: 'Moviegoer', b2Desc: 'Passed the 10 movie mark.',
    b3Name: 'Cinephile', b3Desc: '50 Movies! A true critic.', b4Name: 'Golden Ticket', b4Desc: 'Member of the 100 Movie Club.',
    b5Name: 'Master Director', b5Desc: '250 Movies. Cinema is your life.', b6Name: 'Cinema God', b6Desc: '500+ Movies. You are a legend!',
    loginOr: 'OR', registerBtn: 'Register', namePlaceholder: 'Name', emailPlaceholder: 'Email', passPlaceholder: 'Password',
    navShowcase: 'SHOWCASE', navList: 'LIST', navProfile: 'PROFILE', noData: 'No data.'
  },
  tr: {
    home: 'Ana Sayfa', ranking: 'Dünya Geneli Sıralama', login: 'Giriş Yap', logout: 'Çıkış Yap',
    trending: 'Şu An Popüler', topRated: 'Kült Başyapıtlar', recentActivity: 'Son Değerlendirmeler', featured: 'Haftanın Öne Çıkanları', mostVoted: 'En Çok Oylananlar',
    searchPlaceholder: 'Film ara...', director: 'Yönetmen', cast: 'Oyuncular', summary: 'Özet', watchTrailer: 'Fragmanı İzle',
    saveRating: 'Puanı Kaydet', updateRating: 'Puanımı Güncelle', criteria: 'İnceleme Kriterleri', yourScore: 'Puanın', globalRanking: 'Dünya Geneli Sıralama', 
    noRating: 'Henüz hiçbir filmi puanlamadın.', ratedFilms: 'Film Puanladın', myRatings: 'Verdiğim Puanlar', editProfile: 'Profili Düzenle', rateNow: 'Puanla',
    lastVote: 'Son Puan', voteCount: 'Oy', average: 'Ort.', badges: 'Kazanılan Rozetler',
    cultClassics: 'Efsanevi Başyapıtlar', actionPacked: 'Aksiyon Dolu', emotionalDramas: 'Duygusal Dramalar',
    c1: 'Senaryo', c1Desc: 'Olay örgüsü, diyaloglar ve hikayenin özgünlüğü.', c2: 'Oyunculuk', c2Desc: 'Aktörlerin karakterleri inandırıcı oynaması.',
    c3: 'Sinematografi', c3Desc: 'Kamera açıları, ışık ve görsel kompozisyon.', c4: 'Ses & Müzik', c4Desc: 'Filmin atmosferini güçlendiren müzikler.',
    c5: 'Kurgu & Akış', c5Desc: 'Sahneler arası geçişler ve filmin temposu.',
    globalDesc: 'Tüm topluluğun kararlarıyla oluşan dev sinema arşivi.', registeredMovies: 'Oylanan Filmler',
    username: 'Kullanıcı Adı', selectAvatar: 'Sinematik Avatarını Seç', saveChanges: 'Kaydet', noBadges: 'Rozet kazanmak için film puanla!',
    b1Name: 'Mısır Yiyici', b1Desc: 'İlk filmini puanladın!', b2Name: 'Sinemasever', b2Desc: '10 Film barajını geçtin.',
    b3Name: 'Sinefil', b3Desc: '50 Film! Gerçek bir eleştirmen.', b4Name: 'Altın Bilet', b4Desc: '100 Film Kulübü üyesi.',
    b5Name: 'Usta Yönetmen', b5Desc: '250 Film. Sinema senin hayatın.', b6Name: 'Sinema Tanrısı', b6Desc: '500+ Film. Sen bir efsanesin!',
    loginOr: 'VEYA', registerBtn: 'Kayıt Ol', namePlaceholder: 'İsim', emailPlaceholder: 'E-posta', passPlaceholder: 'Şifre',
    navShowcase: 'VİTRİN', navList: 'LİSTE', navProfile: 'PROFİL', noData: 'Veri yok.'
  },
  de: {
    home: 'Startseite', ranking: 'Weltrangliste', login: 'Anmelden', logout: 'Abmelden',
    trending: 'Aktuelle Trends', topRated: 'Kultklassiker', recentActivity: 'Neueste', featured: 'Empfehlung', mostVoted: 'Meistbewertet',
    searchPlaceholder: 'Film suchen...', director: 'Regisseur', cast: 'Besetzung', summary: 'Zusammenfassung', watchTrailer: 'Trailer',
    saveRating: 'Speichern', updateRating: 'Aktualisieren', criteria: 'Kriterien', yourScore: 'Punkte', globalRanking: 'Weltrangliste', 
    noRating: 'Keine Bewertungen.', ratedFilms: 'Filme bewertet', myRatings: 'Meine Bewertungen', editProfile: 'Profil', rateNow: 'Bewerten',
    lastVote: 'Letzte Note', voteCount: 'Stimmen', average: 'Dursch.', badges: 'Abzeichen',
    cultClassics: 'Legendäre Klassiker', actionPacked: 'Action', emotionalDramas: 'Dramen',
    c1: 'Drehbuch', c1Desc: 'Handlung und Dialoge.', c2: 'Schauspiel', c2Desc: 'Glaubwürdigkeit.',
    c3: 'Kamera', c3Desc: 'Kamerawinkel und Licht.', c4: 'Ton & Musik', c4Desc: 'Atmosphäre.',
    c5: 'Schnitt', c5Desc: 'Szenenübergänge.',
    globalDesc: 'Das Kinoarchiv der Community.', registeredMovies: 'Bewertete Filme',
    username: 'Benutzername', selectAvatar: 'Avatar wählen', saveChanges: 'Speichern', noBadges: 'Bewerten Sie Filme!',
    b1Name: 'Popcorn', b1Desc: 'Erster Film!', b2Name: 'Kino-Fan', b2Desc: '10 Filme.',
    b3Name: 'Cineast', b3Desc: '50 Filme.', b4Name: 'Goldenes Ticket', b4Desc: '100 Filme.',
    b5Name: 'Regisseur', b5Desc: '250 Filme.', b6Name: 'Kino-Gott', b6Desc: '500+ Filme.',
    loginOr: 'ODER', registerBtn: 'Registrieren', namePlaceholder: 'Name', emailPlaceholder: 'E-Mail', passPlaceholder: 'Passwort',
    navShowcase: 'START', navList: 'LISTE', navProfile: 'PROFIL', noData: 'Keine Daten.'
  },
  it: {
    home: 'Home', ranking: 'Classifica Globale', login: 'Accedi', logout: 'Esci',
    trending: 'In Tendenza', topRated: 'Classici', recentActivity: 'Recenti', featured: 'In Primo Piano', mostVoted: 'Più Votati',
    searchPlaceholder: 'Cerca...', director: 'Regista', cast: 'Cast', summary: 'Trama', watchTrailer: 'Trailer',
    saveRating: 'Salva', updateRating: 'Aggiorna', criteria: 'Criteri', yourScore: 'Punteggio', globalRanking: 'Classifica Globale', 
    noRating: 'Nessuna valutazione.', ratedFilms: 'Film Valutati', myRatings: 'Mie Valutazioni', editProfile: 'Profilo', rateNow: 'Valuta',
    lastVote: 'Ultimo Voto', voteCount: 'Voti', average: 'Media', badges: 'Distintivi',
    cultClassics: 'Capolavori', actionPacked: 'Azione', emotionalDramas: 'Drammatici',
    c1: 'Sceneggiatura', c1Desc: 'Trama.', c2: 'Recitazione', c2Desc: 'Credibilità.',
    c3: 'Fotografia', c3Desc: 'Luce.', c4: 'Suono', c4Desc: 'Musica.',
    c5: 'Montaggio', c5Desc: 'Ritmo.',
    globalDesc: 'L\'archivio della community.', registeredMovies: 'Film Votati',
    username: 'Nome Utente', selectAvatar: 'Scegli Avatar', saveChanges: 'Salva', noBadges: 'Valuta film!',
    b1Name: 'Popcorn', b1Desc: 'Primo film!', b2Name: 'Cinefilo', b2Desc: '10 film.',
    b3Name: 'Critico', b3Desc: '50 Film.', b4Name: 'Biglietto', b4Desc: '100 film.',
    b5Name: 'Maestro', b5Desc: '250 Film.', b6Name: 'Dio del Cinema', b6Desc: '500+ Film.',
    loginOr: 'O', registerBtn: 'Registrati', namePlaceholder: 'Nome', emailPlaceholder: 'Email', passPlaceholder: 'Password',
    navShowcase: 'HOME', navList: 'LISTA', navProfile: 'PROFILO', noData: 'Nessun dato.'
  },
  fr: {
    home: 'Accueil', ranking: 'Classement Mondial', login: 'Connexion', logout: 'Déconnexion',
    trending: 'Tendances', topRated: 'Classiques', recentActivity: 'Récents', featured: 'En Vedette', mostVoted: 'Les Plus Votés',
    searchPlaceholder: 'Rechercher...', director: 'Réalisateur', cast: 'Casting', summary: 'Résumé', watchTrailer: 'Bande-annonce',
    saveRating: 'Enregistrer', updateRating: 'Mettre à jour', criteria: 'Critères', yourScore: 'Note', globalRanking: 'Classement Mondial', 
    noRating: 'Aucune évaluation.', ratedFilms: 'Films Évalués', myRatings: 'Mes Évaluations', editProfile: 'Profil', rateNow: 'Évaluer',
    lastVote: 'Dernière Note', voteCount: 'Votes', average: 'Moyenne', badges: 'Badges',
    cultClassics: 'Chefs-d\'œuvre', actionPacked: 'Action', emotionalDramas: 'Drames',
    c1: 'Scénario', c1Desc: 'Intrigue.', c2: 'Acteur', c2Desc: 'Crédibilité.',
    c3: 'Cinématographie', c3Desc: 'Lumière.', c4: 'Son', c4Desc: 'Musique.',
    c5: 'Montage', c5Desc: 'Rythme.',
    globalDesc: 'Archives de la communauté.', registeredMovies: 'Films Notés',
    username: 'Nom d\'utilisateur', selectAvatar: 'Avatar', saveChanges: 'Enregistrer', noBadges: 'Évaluez des films!',
    b1Name: 'Popcorn', b1Desc: 'Premier film!', b2Name: 'Cinéphile', b2Desc: '10 films.',
    b3Name: 'Critique', b3Desc: '50 Films!', b4Name: 'Ticket', b4Desc: '100 films.',
    b5Name: 'Maître', b5Desc: '250 Films.', b6Name: 'Dieu du Cinéma', b6Desc: '500+ Films.',
    loginOr: 'OU', registerBtn: 'S\'inscrire', namePlaceholder: 'Nom', emailPlaceholder: 'Email', passPlaceholder: 'Mot de passe',
    navShowcase: 'ACCUEIL', navList: 'LISTE', navProfile: 'PROFIL', noData: 'Aucune donnée.'
  }
};

const AVATAR_DEFAULT = "https://api.dicebear.com/7.x/initials/svg?seed=CS&backgroundColor=111424,0f172a&textColor=fbbf24";
const AVATAR_PRESETS = [
  "https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Director&backgroundColor=0f172a",
  "https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Actor&backgroundColor=1e1b4b",
  "https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Writer&backgroundColor=451a03",
  "https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Camera&backgroundColor=064e3b",
  "https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Vader&backgroundColor=000000",
  "https://api.dicebear.com/7.x/personas/svg?seed=Morpheus&backgroundColor=020617",
  "https://api.dicebear.com/7.x/personas/svg?seed=Trinity&backgroundColor=172554",
  "https://api.dicebear.com/7.x/micah/svg?seed=Bond&backgroundColor=111827",
  "https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Ripley&backgroundColor=27272a",
];

// --------------------------------------------------------
// 3. ANİMASYON MOTORU VE RENK GEÇİŞLERİ (MORPHING)
// --------------------------------------------------------
const CustomAnimations = () => (
  <style dangerouslySetInnerHTML={{__html: `
    .hide-scrollbar::-webkit-scrollbar { display: none; }
    .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

    /* DİNAMİK RENK GEÇİŞLİ LOGO ANİMASYONU (Gölgesiz, Kutusuz, Saf Renk Geçişi) */
    @keyframes color-morph {
      0%   { color: #a855f7; filter: drop-shadow(0 0 10px rgba(168,85,247,0.6)); }
      25%  { color: #3b82f6; filter: drop-shadow(0 0 10px rgba(59,130,246,0.6)); }
      50%  { color: #ef4444; filter: drop-shadow(0 0 15px rgba(239,68,68,0.8)); }
      75%  { color: #facc15; filter: drop-shadow(0 0 15px rgba(250,204,21,0.8)); }
      100% { color: #39ff14; filter: drop-shadow(0 0 25px rgba(57,255,20,1)); }
    }
    .logo-morph-text { animation: color-morph 8s alternate infinite; }

    /* GERÇEKÇİ UÇAN SİNEKLER (Sadece 2.5 Altı Puanlar İçin) */
    .fly-wrapper { position: absolute; inset: -40px; pointer-events: none; z-index: 50; }
    .fly { position: absolute; font-size: 20px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.9)); }
    .fly-1 { animation: flight1 6s infinite ease-in-out; }
    .fly-2 { animation: flight2 7s infinite ease-in-out reverse; }
    .fly-inner { animation: flap 0.02s infinite alternate; }

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
  `}}/>
);

// --------------------------------------------------------
// 4. PÜRÜZSÜZ RENK GEÇİŞ FONKSİYONU (HEX TABANLI)
// --------------------------------------------------------
const getScoreColorHex = (score) => {
  const s = Number(score) || 0;
  if (s >= 9.0) return '#39ff14'; // Neon Yeşil
  if (s >= 7.5) return '#22c55e'; // Normal Yeşil
  if (s >= 5.5) return '#facc15'; // Sarı
  if (s >= 3.5) return '#ef4444'; // Kırmızı
  if (s >= 2.0) return '#3b82f6'; // Mavi
  return '#a855f7'; // Kokuşmuş Mor
};

const MegaScoreVFX = ({ score }) => {
  const s = Number(score);
  if (isNaN(s)) return null;

  if (s >= 9.0) {
    return (
      <div className="absolute inset-0 pointer-events-none rounded-full z-0 flex items-center justify-center">
         <div className="absolute inset-[-15px] rounded-full border-[3px] border-[#39ff14]/80 border-t-transparent border-b-transparent animate-[spin_3s_linear_infinite] shadow-[0_0_20px_rgba(57,255,20,0.5)]"></div>
         <div className="absolute inset-[-25px] rounded-full border-[2px] border-[#39ff14]/30 border-l-transparent border-r-transparent animate-[spin_6s_linear_infinite_reverse] shadow-[0_0_10px_rgba(57,255,20,0.3)]"></div>
      </div>
    );
  }
  if (s < 2.5) {
    return (
      <div className="absolute inset-0 pointer-events-none rounded-full z-20">
        <div className="absolute inset-[-15px] rounded-full bg-purple-700/20 blur-[25px] animate-[pulse_3s_infinite]"></div>
        <div className="fly-wrapper">
           <div className="fly fly-1"><div className="fly-inner">🪰</div></div>
           <div className="fly fly-2"><div className="fly-inner">🪰</div></div>
        </div>
      </div>
    );
  }
  return null;
};

const MiniVFX = ({ score }) => {
  const s = Number(score);
  if (isNaN(s)) return null;
  if (s >= 9.0) return (
    <div className="absolute inset-0 pointer-events-none rounded-xl overflow-hidden mix-blend-screen z-0">
       <div className="absolute inset-0 shadow-[inset_0_0_15px_rgba(57,255,20,0.8)] rounded-xl animate-pulse"></div>
    </div>
  );
  if (s < 2.5) return (
    <div className="absolute inset-0 pointer-events-none rounded-xl z-20 overflow-visible">
       <div className="absolute inset-0 shadow-[inset_0_0_15px_rgba(168,85,247,0.8)] rounded-xl animate-[pulse_3s_infinite] opacity-60"></div>
       <div className="absolute -top-3 -right-2 text-[10px] animate-[bounce_1.5s_infinite] drop-shadow-[0_2px_2px_black]">🪰</div>
    </div>
  );
  return null;
};

// YATAY KAYDIRMA ŞERİDİ (Bağımsız Bileşen - Tıklama ve Kayma %100 Sorunsuz)
const MovieRow = ({ title, movies, icon, t, selectMovieToRate, globalMoviesList }) => {
  const rowRef = useRef(null);
  const scroll = (direction) => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const offset = direction === 'left' ? scrollLeft - clientWidth + 100 : scrollLeft + clientWidth - 100;
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
      <div ref={rowRef} className="flex overflow-x-auto gap-4 sm:gap-6 pb-6 pt-2 hide-scrollbar snap-x relative z-10 pointer-events-auto">
        {movies.map((m) => {
          const globalData = globalMoviesList?.find(g => String(g.id) === String(m.tmdbId));
          return (
          <div key={m.tmdbId} className="group cursor-pointer shrink-0 snap-start w-32 sm:w-44" onClick={() => selectMovieToRate(m.tmdbId, m.title)}>
            <div className="relative rounded-2xl overflow-hidden shadow-lg border border-slate-800 mb-3 aspect-[2/3] bg-slate-900 transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-[0_15px_30px_rgba(245,158,11,0.2)]">
              <img src={m.poster} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt=""/>
              <div className="absolute inset-0 bg-[#04060C]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                 <span className="bg-amber-500 text-[#04060C] text-xs sm:text-sm font-black px-4 py-2 rounded-xl flex items-center gap-1 shadow-lg"><Star size={16} className="fill-[#04060C]"/> {t.rateNow}</span>
              </div>
              {globalData && globalData.avgScore > 0 && (
                <div className="absolute top-2 right-2 px-2.5 py-1 rounded-lg bg-[#04060C]/90 backdrop-blur border border-slate-700 shadow-xl z-10 pointer-events-none">
                  <span className="text-xs font-black" style={{color: getScoreColorHex(globalData.avgScore)}}>{Number(globalData.avgScore).toFixed(1)}</span>
                </div>
              )}
            </div>
            <h4 className="font-bold text-slate-200 text-xs sm:text-sm group-hover:text-amber-400 truncate drop-shadow-md transition-colors">{m.title}</h4>
          </div>
        )})}
      </div>
    </div>
  );
};

// ROZET SİSTEMİ
const getBadges = (ratingCount, t) => {
  const c = Number(ratingCount) || 0;
  const badges = [];
  if (c >= 1) badges.push({ id: 'b1', name: t.b1Name, icon: <Film size={24}/>, color: 'text-zinc-400 bg-zinc-800/50 border-zinc-700', desc: t.b1Desc });
  if (c >= 10) badges.push({ id: 'b2', name: t.b2Name, icon: <Ticket size={24}/>, color: 'text-sky-400 bg-sky-900/20 border-sky-800/50', desc: t.b2Desc });
  if (c >= 50) badges.push({ id: 'b3', name: t.b3Name, icon: <Award size={24}/>, color: 'text-fuchsia-400 bg-fuchsia-900/20 border-fuchsia-800/50 shadow-[0_0_15px_rgba(192,38,211,0.2)]', desc: t.b3Desc });
  if (c >= 100) badges.push({ id: 'b4', name: t.b4Name, icon: <Medal size={24}/>, color: 'text-amber-400 bg-amber-900/20 border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.3)] animate-pulse', desc: t.b4Desc });
  if (c >= 250) badges.push({ id: 'b5', name: t.b5Name, icon: <Clapperboard size={24}/>, color: 'text-rose-500 bg-rose-900/20 border-rose-500/50 shadow-[0_0_25px_rgba(225,29,72,0.4)]', desc: t.b5Desc });
  if (c >= 500) badges.push({ id: 'b6', name: t.b6Name, icon: <Crown size={24}/>, color: 'text-emerald-400 bg-emerald-900/20 border-emerald-400/80 shadow-[0_0_30px_rgba(52,211,153,0.6)] animate-bounce', desc: t.b6Desc });
  return badges.reverse();
};

// --------------------------------------------------------
// HATA KALKANI (Error Boundary)
// --------------------------------------------------------
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
            <button onClick={() => window.location.reload()} className="bg-amber-500 hover:bg-amber-400 text-[#04060C] px-8 py-3 rounded-xl font-black transition-colors">Yenile ve Devam Et</button>
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
  // ÇEVİRİ GÜVENLİK AĞI: Eksik kelime varsa otomatik İngilizceyi (en) kullanır. Çökmeyi %100 engeller.
  const t = { ...TRANSLATIONS['en'], ...(TRANSLATIONS[lang] || {}) };
  const tmdbLang = LANGUAGES.find(l => l.code === lang)?.tmdbCode || 'tr-TR';

  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  
  const [activeTab, setActiveTab] = useState('home'); 
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [dynamicBg, setDynamicBg] = useState(''); 
  
  const [globalMovies, setGlobalMovies] = useState([]);
  const [myRatings, setMyRatings] = useState([]);
  
  const [trendingData, setTrendingData] = useState([]);
  const [cultClassics, setCultClassics] = useState([]);
  const [actionMovies, setActionMovies] = useState([]);
  const [dramaMovies, setDramaMovies] = useState([]);
  const [heroIndex, setHeroIndex] = useState(0);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [authError, setAuthError] = useState('');
  const [editName, setEditName] = useState('');
  const [editAvatar, setEditAvatar] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const searchDropdownRef = useRef(null);
  const langMenuRef = useRef(null);

  const getCriteriaData = () => [
    { id: 'c1', name: t.c1, weight: 30, desc: t.c1Desc },
    { id: 'c2', name: t.c2, weight: 25, desc: t.c2Desc },
    { id: 'c3', name: t.c3, weight: 20, desc: t.c3Desc },
    { id: 'c4', name: t.c4, weight: 15, desc: t.c4Desc },
    { id: 'c5', name: t.c5, weight: 10, desc: t.c5Desc },
  ];
  const criteriaData = getCriteriaData();
  const [scores, setScores] = useState(criteriaData.reduce((acc, c) => ({ ...acc, [c.id]: 5 }), {}));

  useEffect(() => {
    let ratingsUnsub = null;

    const authUnsub = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) setUserProfile(userDoc.data());
          
          if (ratingsUnsub) ratingsUnsub();
          ratingsUnsub = onSnapshot(collection(db, 'users', currentUser.uid, 'ratings'), (snap) => {
            setMyRatings(snap.docs.map(d => ({ id: String(d.id), ...d.data() })));
          });
        } catch(e) {}
      } else {
        setUserProfile(null);
        setMyRatings([]);
        if (ratingsUnsub) { ratingsUnsub(); ratingsUnsub = null; }
      }
    });

    const q = query(collection(db, 'movies'), orderBy('lastUpdated', 'desc'));
    const moviesUnsub = onSnapshot(q, (snapshot) => {
      setGlobalMovies(snapshot.docs.map(doc => ({ id: String(doc.id), ...doc.data() })));
    });

    return () => { authUnsub(); moviesUnsub(); if(ratingsUnsub) ratingsUnsub(); };
  }, []);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const fetchTMDB = async (url) => {
          const res = await fetch(url);
          const data = await res.json();
          return data.results?.filter(m => m.poster_path).slice(0, 15).map(m => ({
            title: m.title,
            poster: `https://image.tmdb.org/t/p/w500${m.poster_path}`,
            backdrop: m.backdrop_path ? `https://image.tmdb.org/t/p/w1280${m.backdrop_path}` : '',
            year: m.release_date ? m.release_date.split('-')[0] : '',
            overview: m.overview,
            tmdbId: String(m.id)
          })) || [];
        };

        const [trendRes, cultRes, actionRes, dramaRes] = await Promise.all([
          fetchTMDB(`https://api.themoviedb.org/3/trending/movie/week?api_key=${TMDB_API_KEY}&language=${tmdbLang}`),
          fetchTMDB(`https://api.themoviedb.org/3/movie/top_rated?api_key=${TMDB_API_KEY}&language=${tmdbLang}&page=1`),
          fetchTMDB(`https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&with_genres=28&language=${tmdbLang}&sort_by=popularity.desc`),
          fetchTMDB(`https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&with_genres=18&language=${tmdbLang}&sort_by=popularity.desc`)
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
    const handleClickOutside = (e) => { 
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(e.target)) setSearchResults([]); 
      if (langMenuRef.current && !langMenuRef.current.contains(e.target)) setIsLangMenuOpen(false); 
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const saveUserProfileData = async (userObj, name, customAvatar) => {
    const newProfile = { displayName: name || userObj.displayName || 'Sinefil', email: userObj.email, avatar: customAvatar || userObj.photoURL || AVATAR_DEFAULT };
    await setDoc(doc(db, 'users', userObj.uid), newProfile);
    setUserProfile(newProfile);
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError(''); setIsAuthLoading(true);
    try {
      if (authMode === 'register') {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCred.user, { displayName });
        await saveUserProfileData(userCred.user, displayName);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      setShowLoginModal(false);
    } catch (err) { setAuthError("Giriş başarısız. Lütfen bilgileri kontrol edin."); } 
    finally { setIsAuthLoading(false); }
  };

  const handleGoogleAuth = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      if (!userDoc.exists()) await saveUserProfileData(result.user, result.user.displayName);
      setShowLoginModal(false);
    } catch (err) {}
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if(!user) return;
    try {
      await saveUserProfileData(user, editName, editAvatar);
      setShowProfileModal(false);
    } catch(e) { alert("Güncellenemedi!"); }
  };

  const openProfileEdit = () => {
    setEditName(userProfile?.displayName || '');
    setEditAvatar(userProfile?.avatar || AVATAR_DEFAULT);
    setShowProfileModal(true);
  };

  const handleLogout = () => { signOut(auth); setActiveTab('home'); };

  const selectMovieToRate = async (movieId, fallbackTitle = '', shouldResetScores = true) => {
    try {
      let tmdbID = String(movieId);
      if (tmdbID.startsWith('tt')) {
        const searchRes = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(fallbackTitle || tmdbID)}&language=${tmdbLang}`);
        const searchData = await searchRes.json();
        if (searchData.results && searchData.results.length > 0) tmdbID = String(searchData.results[0].id);
        else return;
      }

      const res = await fetch(`https://api.themoviedb.org/3/movie/${tmdbID}?api_key=${TMDB_API_KEY}&append_to_response=credits,videos&language=${tmdbLang}`);
      const data = await res.json();
      
      if (data.id) {
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

        if (!mDoc.exists()) {
          trans.set(movieRef, { 
            title: selectedMovie.title, poster: selectedMovie.poster, year: selectedMovie.year, genre: selectedMovie.genre, 
            totalScore: newFinalScore, voteCount: 1, avgScore: newFinalScore, lastUpdated: Date.now(), lastVoteScore: newFinalScore 
          });
        } else {
          const d = mDoc.data();
          let currentTotal = d.totalScore !== undefined ? Number(d.totalScore) : (Number(d.avgScore || 0) * Number(d.voteCount || 0));
          let currentCount = Number(d.voteCount || 0);

          if (hasVotedBefore) { currentTotal = currentTotal - oldFinalScore + newFinalScore; } 
          else { currentTotal = currentTotal + newFinalScore; currentCount = currentCount + 1; }

          const newAvg = currentCount > 0 ? (currentTotal / currentCount) : newFinalScore;
          
          trans.update(movieRef, { 
            totalScore: currentTotal, voteCount: currentCount, avgScore: parseFloat(newAvg.toFixed(1)), 
            lastUpdated: Date.now(), lastVoteScore: newFinalScore 
          });
        }
        trans.set(userRatingRef, { id: docId, title: selectedMovie.title, poster: selectedMovie.poster, scores: scores, finalScore: newFinalScore, date: Date.now() });
      });

      setSelectedMovie(null); setDynamicBg(''); setActiveTab('profile');
    } catch (e) { alert("Kayıt sırasında hata oluştu!"); } finally { setIsSaving(false); }
  };

  const handleCloseMovie = () => { setSelectedMovie(null); setDynamicBg(''); setActiveTab('home'); };

  const safeGlobalMovies = Array.isArray(globalMovies) ? globalMovies.filter(m => m && m.id) : [];
  const safeMyRatings = Array.isArray(myRatings) ? myRatings.filter(r => r && r.id) : [];
  const sortedMyRatings = [...safeMyRatings].sort((a,b) => (Number(b.date) || 0) - (Number(a.date) || 0));

  const featuredMovies = trendingData.slice(0, 5);
  const currentFeatured = featuredMovies[heroIndex] || null;

  const finalScoreVal = calculateFinalScore();
  const finalDynColor = getScoreColorHex(finalScoreVal);

  return (
    <div className="min-h-screen bg-[#04060C] text-slate-200 font-sans pb-24 relative overflow-x-hidden selection:bg-amber-500/30 selection:text-[#04060C]">
      
      <div className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900/40 via-[#04060C] to-[#04060C]">
        {dynamicBg && (
           <>
             <img src={dynamicBg} className="w-full h-full object-cover opacity-20 blur-3xl scale-110" alt="bg"/>
             <div className="absolute inset-0 bg-gradient-to-t from-[#04060C] via-[#04060C]/80 to-transparent"></div>
           </>
        )}
      </div>

      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-[2rem] p-8 relative shadow-2xl">
            <button onClick={() => setShowProfileModal(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white"><X/></button>
            <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-3"><Settings className="text-amber-500"/> {t.editProfile}</h3>
            <form onSubmit={handleUpdateProfile} className="space-y-6">
               <div>
                  <label className="text-xs text-slate-400 font-black uppercase mb-2 block tracking-wider">{t.username}</label>
                  <input type="text" value={editName} onChange={e=>setEditName(e.target.value)} className="w-full bg-[#04060C] border border-slate-800 p-4 rounded-xl text-white outline-none focus:border-amber-500 shadow-inner font-bold transition-colors"/>
               </div>
               <div>
                  <label className="text-xs text-slate-400 font-black uppercase mb-3 block tracking-wider">{t.selectAvatar}</label>
                  <div className="grid grid-cols-5 gap-3 mb-3">
                    {AVATAR_PRESETS.map((url, i) => (
                      <img key={i} src={url} onClick={()=>setEditAvatar(url)} className={`w-full aspect-square rounded-xl cursor-pointer border-2 transition-all object-cover ${editAvatar===url ? 'border-amber-500 scale-110 shadow-[0_0_20px_rgba(245,158,11,0.4)]' : 'border-slate-800 hover:border-slate-500 opacity-60 hover:opacity-100'}`} alt="Avatar"/>
                    ))}
                  </div>
               </div>
               <button type="submit" className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black p-4 rounded-xl transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:scale-[1.02] active:scale-[0.98]">{t.saveChanges}</button>
            </form>
          </div>
        </div>
      )}

      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-[2rem] p-8 relative shadow-2xl">
            <button onClick={() => setShowLoginModal(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white"><X/></button>
            
            <div className="text-center mb-8 logo-morph-text">
              <div className="w-20 h-20 rounded-2xl mx-auto flex items-center justify-center mb-4 border-[3px] rotate-3" style={{backgroundColor: 'transparent'}}>
                 <Clapperboard size={40} className="fill-current" />
              </div>
              <h2 className="text-4xl font-black tracking-tighter drop-shadow-md">CINE<span className="text-white">SCORE</span></h2>
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
              {authMode === 'register' && <input type="text" onChange={e=>setDisplayName(e.target.value)} placeholder={t.namePlaceholder} required className="w-full p-4 bg-[#04060C] border border-slate-800 rounded-xl text-white shadow-inner outline-none focus:border-amber-500 font-medium transition-colors"/>}
              <input type="email" onChange={e=>setEmail(e.target.value)} placeholder={t.emailPlaceholder} required className="w-full p-4 bg-[#04060C] border border-slate-800 rounded-xl text-white shadow-inner outline-none focus:border-amber-500 font-medium transition-colors"/>
              <input type="password" onChange={e=>setPassword(e.target.value)} placeholder={t.passPlaceholder} required minLength={6} className="w-full p-4 bg-[#04060C] border border-slate-800 rounded-xl text-white shadow-inner outline-none focus:border-amber-500 font-medium transition-colors"/>
              {authError && <p className="text-red-400 text-xs text-center font-bold bg-red-950/50 p-3 rounded-xl">{authError}</p>}
              <button className="w-full p-4 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-black transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:scale-[1.02] active:scale-[0.98]">{isAuthLoading ? <Loader2 className="animate-spin mx-auto" /> : (authMode === 'login' ? t.login : t.registerBtn)}</button>
            </form>
          </div>
        </div>
      )}

      <header className="relative z-40 bg-[#04060C]/80 backdrop-blur-2xl border-b border-slate-800/50 sticky top-0 shadow-sm">
        <div className="w-full h-[env(safe-area-inset-top)] bg-[#04060C]"></div>
        <div className="max-w-[90rem] mx-auto px-4 h-20 flex items-center justify-between gap-2 sm:gap-4">
          
          <div className="flex items-center gap-2 sm:gap-3 cursor-pointer group shrink-0 logo-morph-text" onClick={handleCloseMovie}>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center rotate-3 border-[3px] transition-transform duration-500 group-hover:rotate-12 group-hover:scale-105" style={{backgroundColor: 'transparent'}}>
              <Clapperboard size={26} className="fill-current" />
            </div>
            {/* MOBİLDE YAZI GÖSTERİMİ AÇILDI */}
            <h1 className="text-xl sm:text-3xl font-black tracking-tighter flex items-center drop-shadow-md transition-transform duration-500 group-hover:scale-105" style={{fontFamily: "'Montserrat', sans-serif"}}>
               <span className="text-white">CINE</span>SCORE
            </h1>
          </div>

          <div className="flex-1 max-w-2xl relative hidden sm:block" ref={searchDropdownRef}>
            <div className="relative flex items-center">
              <Search className="absolute left-5 text-slate-400" size={18}/>
              <input 
                type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder={t.searchPlaceholder} 
                className="w-full bg-slate-900 border border-slate-800 hover:border-slate-600 rounded-full pl-12 pr-4 py-3 text-sm text-white outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all shadow-inner font-medium"
              />
              {isSearching && <Loader2 className="absolute right-5 animate-spin text-amber-500" size={16}/>}
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
                      <span className="font-black text-amber-500">{l.flag}</span> <span className="font-bold">{l.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <nav className="hidden md:flex bg-slate-900/50 p-1.5 rounded-full border border-slate-800 shadow-inner gap-2">
               <button onClick={handleCloseMovie} className={`px-6 py-2.5 rounded-full text-sm font-black transition-all duration-300 hover:scale-105 active:scale-95 ${activeTab === 'home' ? 'bg-amber-500 text-[#04060C] shadow-[0_0_15px_rgba(245,158,11,0.6)]' : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white shadow-md'}`}>{t.home}</button>
               <button onClick={() => {setActiveTab('global'); setDynamicBg(''); setSelectedMovie(null);}} className={`px-6 py-2.5 rounded-full text-sm font-black transition-all duration-300 hover:scale-105 active:scale-95 ${activeTab === 'global' ? 'bg-amber-500 text-[#04060C] shadow-[0_0_15px_rgba(245,158,11,0.6)]' : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white shadow-md'}`}>{t.ranking}</button>
            </nav>

            {userProfile ? (
              <div className="flex items-center gap-3 md:pl-6 md:border-l border-slate-800 group cursor-pointer relative" onClick={() => {setActiveTab('profile'); setDynamicBg(''); setSelectedMovie(null);}}>
                <img src={userProfile?.avatar || AVATAR_DEFAULT} className={`w-11 h-11 rounded-full border-[3px] transition-all duration-300 object-cover shadow-lg ${activeTab === 'profile' ? 'border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]' : 'border-slate-700 bg-slate-900 group-hover:border-amber-500'}`} alt="Avatar"/>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 rounded-full border-2 border-[#04060C] flex items-center justify-center shadow-lg">
                   <span className="text-[10px] font-black text-white">{sortedMyRatings.length}</span>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowLoginModal(true)} className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-[#04060C] rounded-full transition-all text-sm font-black shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:scale-105 active:scale-95">
                <LogIn size={18} /> <span className="hidden sm:inline">{t.login}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-[90rem] mx-auto px-4 py-6 sm:py-10">
        
        {/* TAB 1: ZENGİN ANA SAYFA */}
        {activeTab === 'home' && (
          <div className="animate-in fade-in duration-500 space-y-12 sm:space-y-16">
            
            {/* HERO CAROUSEL */}
            {currentFeatured && (
              <div className="relative w-full h-[500px] sm:h-[700px] rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-800 group">
                <img src={currentFeatured.backdrop || currentFeatured.poster} className="absolute inset-0 w-full h-full object-cover transition-all duration-1000 group-hover:scale-105" alt=""/>
                <div className="absolute inset-0 bg-gradient-to-t from-[#04060C] via-[#04060C]/50 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-[#04060C] via-slate-950/40 to-transparent"></div>
                
                {/* Sol/Sağ Butonlar */}
                <button onClick={(e) => { e.stopPropagation(); setHeroIndex((prev) => (prev === 0 ? featuredMovies.length - 1 : prev - 1)); }} className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-[#04060C]/50 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-amber-500 hover:text-black border border-slate-700 transition-colors z-20 hidden md:flex"><ChevronLeft size={28}/></button>
                <button onClick={(e) => { e.stopPropagation(); setHeroIndex((prev) => (prev + 1) % featuredMovies.length); }} className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-[#04060C]/50 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-amber-500 hover:text-black border border-slate-700 transition-colors z-20 hidden md:flex"><ChevronRight size={28}/></button>

                <div className="absolute bottom-0 left-0 p-8 sm:p-16 max-w-4xl z-10">
                  <div className="flex items-center gap-2 mb-4"><Award className="text-amber-500" size={24}/><span className="text-amber-500 font-black tracking-widest text-sm uppercase drop-shadow">{t.featured}</span></div>
                  <h2 className="text-5xl sm:text-7xl md:text-8xl font-black text-white mb-6 leading-tight drop-shadow-2xl">{currentFeatured.title}</h2>
                  <p className="text-slate-300 text-base sm:text-xl line-clamp-3 mb-10 drop-shadow-lg font-medium max-w-2xl">{currentFeatured.overview}</p>
                  
                  <div className="flex flex-wrap gap-4">
                    <button onClick={() => selectMovieToRate(currentFeatured.tmdbId, currentFeatured.title)} className="px-10 py-5 bg-amber-500 text-[#04060C] hover:bg-amber-400 rounded-full font-black transition-all flex items-center gap-3 shadow-[0_0_30px_rgba(245,158,11,0.5)] text-xl hover:scale-105 active:scale-95">
                      <Star size={24} className="fill-[#04060C]"/> {t.rateNow}
                    </button>
                    {currentFeatured.trailerKey && (
                      <a href={`https://www.youtube.com/watch?v=${currentFeatured.trailerKey}`} target="_blank" rel="noreferrer" className="px-10 py-5 bg-slate-900/80 backdrop-blur text-white hover:bg-white hover:text-black border border-slate-700 hover:border-white rounded-full font-black transition-all flex items-center gap-3 shadow-xl text-xl hover:scale-105 active:scale-95 group">
                         <Play size={24} className="fill-current text-white group-hover:text-red-600"/> {t.watchTrailer}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* YATAY ŞERİTLER */}
            {trendingData.length > 0 && <MovieRow title={t.trending} movies={trendingData} icon={<TrendingUp className="text-amber-500" size={28}/>} t={t} selectMovieToRate={selectMovieToRate} globalMoviesList={safeGlobalMovies} />}
            {cultClassics.length > 0 && <MovieRow title={t.cultClassics} movies={cultClassics} icon={<Award className="text-amber-500" size={28}/>} t={t} selectMovieToRate={selectMovieToRate} globalMoviesList={safeGlobalMovies} />}
            {actionMovies.length > 0 && <MovieRow title={t.actionPacked} movies={actionMovies} icon={<Flame className="text-amber-500" size={28}/>} t={t} selectMovieToRate={selectMovieToRate} globalMoviesList={safeGlobalMovies} />}
            {dramaMovies.length > 0 && <MovieRow title={t.emotionalDramas} movies={dramaMovies} icon={<Users className="text-amber-500" size={28}/>} t={t} selectMovieToRate={selectMovieToRate} globalMoviesList={safeGlobalMovies} />}

          </div>
        )}

        {/* TAB 2: PUANLAMA EKRANI */}
        {activeTab === 'rate' && selectedMovie && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in zoom-in-95 duration-300 max-w-7xl mx-auto">
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-slate-900/80 backdrop-blur-xl rounded-[2.5rem] p-6 sm:p-8 border border-slate-800 shadow-2xl relative text-center">
                <button onClick={handleCloseMovie} className="absolute top-4 left-4 p-2 bg-[#04060C] rounded-xl text-slate-400 hover:text-white transition-colors z-10 shadow-md border border-slate-800 hover:scale-110"><X size={18}/></button>
                <img src={selectedMovie?.poster} className="w-48 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.6)] mx-auto mb-6 border-2 border-slate-800 object-cover" alt="Poster"/>
                <h2 className="text-3xl font-black text-white leading-tight mb-3 drop-shadow-lg">{selectedMovie?.title}</h2>
                <div className="flex justify-center flex-wrap gap-2 mb-8">
                  <span className="px-3 py-1.5 bg-[#04060C] rounded-xl text-xs font-black text-slate-300 shadow-inner border border-slate-800">{selectedMovie?.year}</span>
                  <span className="px-3 py-1.5 bg-[#04060C] rounded-xl text-xs font-black text-slate-300 shadow-inner border border-slate-800">{selectedMovie?.genre}</span>
                </div>
                
                <div className="relative w-40 h-40 mx-auto rounded-full border-[6px] flex items-center justify-center bg-[#04060C] mb-8"
                     style={{ borderColor: finalDynColor, transition: 'border-color 0.5s ease-out, box-shadow 0.5s ease-out', boxShadow: `0 0 40px ${finalDynColor}80, inset 0 0 20px ${finalDynColor}50` }}>
                   <MegaScoreVFX score={finalScoreVal} />
                   <div className="text-center relative z-10">
                     <span className="text-6xl font-black block text-white drop-shadow-xl transition-colors duration-500 ease-out" style={{color: finalDynColor, textShadow: `0 0 20px ${finalDynColor}90`}}>{finalScoreVal}</span>
                   </div>
                </div>

                <div className="bg-[#04060C] rounded-3xl p-6 text-left border border-slate-800 mb-8 space-y-5 shadow-inner">
                   <div><span className="text-xs text-amber-500 font-black uppercase flex items-center gap-1.5"><Clapperboard size={14}/> {t.director}</span><p className="text-sm text-slate-200 font-bold mt-1">{selectedMovie?.director}</p></div>
                   <div><span className="text-xs text-amber-500 font-black uppercase flex items-center gap-1.5"><Users size={14}/> {t.cast}</span><p className="text-sm text-slate-200 font-bold mt-1">{selectedMovie?.cast}</p></div>
                   <div><span className="text-xs text-amber-500 font-black uppercase flex items-center gap-1.5"><Info size={14}/> {t.summary}</span><p className="text-sm text-slate-400 line-clamp-6 leading-relaxed mt-1.5 font-medium">{selectedMovie?.overview}</p></div>
                   
                   {selectedMovie?.trailerKey && (
                     <a href={`https://www.youtube.com/watch?v=${selectedMovie.trailerKey}`} target="_blank" rel="noreferrer" className="w-full mt-4 py-4 bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-500/20 rounded-2xl font-black flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]">
                       <Play size={20} className="fill-current"/> {t.watchTrailer}
                     </a>
                   )}
                </div>
                
                {/* EĞER GİRİŞ YAPMAMIŞSA, BU BUTONA BASTIĞINDA LOGİN EKRANI AÇILIR */}
                <button onClick={saveRating} disabled={isSaving} className="w-full py-5 rounded-full bg-amber-500 hover:bg-amber-400 text-[#04060C] font-black text-xl transition-all shadow-[0_0_20px_rgba(245,158,11,0.4)] flex items-center justify-center gap-2 hover:scale-105 active:scale-95">
                  {isSaving ? <Loader2 className="animate-spin text-black"/> : <Save size={24}/>} 
                  {user && sortedMyRatings.find(r=>r.id===selectedMovie?.id) ? t.updateRating : t.saveRating}
                </button>
              </div>
            </div>

            <div className="lg:col-span-8 bg-slate-900/80 backdrop-blur-xl rounded-[2.5rem] p-8 lg:p-12 border border-slate-800 shadow-2xl">
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
                          <HelpCircle size={20} className="text-slate-500 cursor-help hover:text-amber-500 transition-colors" />
                          <div className="absolute bottom-full left-0 mb-4 w-72 bg-slate-800 text-slate-200 text-sm p-5 rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 font-bold border border-slate-700">
                            {c.desc}<div className="absolute top-full left-5 w-3 h-3 bg-slate-800 rotate-45 -mt-1.5 border-r border-b border-slate-700"></div>
                          </div>
                       </div>
                       <div className="text-6xl font-black w-24 text-right drop-shadow-md transition-all duration-500 ease-out" style={{color: sliderColor, textShadow: `0 0 20px ${sliderColor}90`}}>
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
          </div>
        )}

        {/* TAB 3: DÜNYA GENELİ SIRALAMA */}
        {activeTab === 'global' && (
          <div className="animate-in fade-in duration-500 space-y-8 max-w-7xl mx-auto">
             <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-slate-900/80 backdrop-blur-md p-8 sm:p-10 rounded-[2.5rem] border border-slate-800 shadow-xl gap-4">
                <div>
                   <h2 className="text-4xl font-black text-white flex items-center gap-3 drop-shadow-md"><Globe className="text-amber-500" size={36}/> {t.globalRanking}</h2>
                   <p className="text-slate-400 mt-3 font-bold text-lg">{t.globalDesc}</p>
                </div>
                <div className="bg-[#04060C] border border-slate-800 px-8 py-5 rounded-3xl flex items-center gap-5 shadow-inner">
                   <span className="text-6xl font-black text-amber-500 drop-shadow-md">{safeGlobalMovies.length}</span>
                   <span className="text-sm text-slate-500 uppercase font-black tracking-widest leading-tight">{t.registeredMovies}</span>
                </div>
             </div>
             
             {safeGlobalMovies.length === 0 ? (
               <div className="text-center py-20 text-slate-600"><Loader2 className="animate-spin w-10 h-10 mx-auto mb-4 text-amber-500"/></div>
             ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {/* KÜRESEL SIRALAMA - OY SAYISINA GÖRE SIRALANMIŞTIR */}
                 {[...safeGlobalMovies].sort((a,b) => (b.voteCount||0) - (a.voteCount||0)).map((movie, idx) => (
                   <div key={movie.id} onClick={() => selectMovieToRate(movie.id, movie.title)} className="bg-slate-900/80 backdrop-blur rounded-3xl overflow-hidden border border-slate-800 flex flex-row group cursor-pointer transition-all shadow-xl hover:shadow-[0_0_30px_rgba(245,158,11,0.15)] hover:-translate-y-1">
                     <div className="w-28 sm:w-32 bg-black relative shrink-0">
                        <img src={movie.poster} alt="" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"/>
                        <div className="absolute inset-0 bg-gradient-to-t from-[#04060C] to-transparent opacity-80"></div>
                        <div className="absolute top-3 left-3 w-8 h-8 rounded-xl bg-amber-500 text-[#04060C] text-sm font-black flex items-center justify-center shadow-lg">#{idx + 1}</div>
                     </div>
                     <div className="flex-1 p-5 flex flex-col justify-between">
                        <div>
                          <h3 className="text-lg font-black text-white line-clamp-2 group-hover:text-amber-400 transition-colors drop-shadow-sm leading-tight mb-1">{movie.title}</h3>
                          <div className="text-xs text-slate-400 font-bold mb-4">{movie.year} • {movie.genre}</div>
                          
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-sm font-bold px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shadow-inner">{movie.voteCount} {t.voteCount}</span>
                            <div className="relative">
                              <MiniVFX score={movie.avgScore} />
                              <span className="relative z-10 text-xs font-black px-3 py-1.5 rounded-xl bg-[#04060C] border border-slate-800 shadow-inner" style={{color: getScoreColorHex(movie.avgScore), textShadow: `0 0 10px ${getScoreColorHex(movie.avgScore)}80`}}>{t.average}: {Number(movie.avgScore).toFixed(1)}</span>
                            </div>
                          </div>
                        </div>
                     </div>
                   </div>
                 ))}
               </div>
             )}
          </div>
        )}

        {/* TAB 4: PROFİL */}
        {activeTab === 'profile' && (
          <div className="animate-in fade-in duration-500 max-w-5xl mx-auto space-y-8">
            
            <div className="bg-slate-900/80 backdrop-blur-xl rounded-[2.5rem] p-8 sm:p-10 border border-slate-800 flex flex-col sm:flex-row items-center sm:items-start gap-8 text-center sm:text-left relative shadow-2xl">
               <div className="absolute top-0 right-0 p-6 flex gap-3">
                 <button onClick={openProfileEdit} className="text-amber-500 hover:text-amber-400 font-black flex items-center gap-2 bg-amber-500/10 hover:bg-amber-500/20 px-5 py-3 rounded-xl transition-colors"><Edit3 size={18}/> <span className="hidden sm:inline">{t.editProfile}</span></button>
               </div>
               
               <div className="relative">
                 <img src={userProfile?.avatar || AVATAR_DEFAULT} className="w-36 h-36 rounded-[2rem] border-4 border-slate-800 bg-[#04060C] object-cover shadow-[0_0_30px_rgba(0,0,0,0.5)]" alt=""/>
                 <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-gradient-to-br from-amber-400 to-red-600 rounded-full border-[4px] border-[#04060C] flex items-center justify-center shadow-lg transform rotate-12">
                   <span className="text-sm font-black text-white">{sortedMyRatings.length}</span>
                 </div>
               </div>
               
               <div className="mt-2 flex-1 w-full">
                 <h2 className="text-4xl sm:text-5xl font-black text-white mb-2 drop-shadow-md">{String(userProfile?.displayName || 'Sinefil')}</h2>
                 <p className="text-slate-400 font-bold text-lg mb-6">{String(userProfile?.email || '')}</p>
                 
                 {/* ZENGİN PROFİL İSTATİSTİKLERİ */}
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full">
                    <div className="bg-[#04060C] border border-slate-800 p-4 rounded-2xl shadow-inner text-center">
                       <Film className="text-amber-500 mx-auto mb-2" size={24}/>
                       <span className="text-3xl font-black text-white">{sortedMyRatings.length}</span>
                       <span className="block text-xs text-slate-500 uppercase font-black mt-1">Oylanan Film</span>
                    </div>
                    <div className="bg-[#04060C] border border-slate-800 p-4 rounded-2xl shadow-inner text-center">
                       <Star className="text-emerald-500 mx-auto mb-2" size={24}/>
                       <span className="text-3xl font-black text-white">{sortedMyRatings.length > 0 ? (sortedMyRatings.reduce((a,b)=>a+Number(b?.finalScore || 0),0)/sortedMyRatings.length).toFixed(1) : 0}</span>
                       <span className="block text-xs text-slate-500 uppercase font-black mt-1">Ortalaman</span>
                    </div>
                 </div>

                 {/* SİNEMA SEVİYESİ İLERLEME ÇUBUĞU */}
                 <div className="mt-6 w-full max-w-md">
                    <div className="flex justify-between text-xs font-black text-slate-400 mb-2 uppercase">
                      <span>Sonraki Seviye</span>
                      <span className="text-amber-500">{sortedMyRatings.length} / {sortedMyRatings.length < 10 ? 10 : sortedMyRatings.length < 50 ? 50 : sortedMyRatings.length < 100 ? 100 : sortedMyRatings.length < 250 ? 250 : 500}</span>
                    </div>
                    <div className="w-full h-3 bg-[#04060C] rounded-full overflow-hidden border border-slate-800 shadow-inner">
                      <div className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full" style={{width: `${(sortedMyRatings.length / (sortedMyRatings.length < 10 ? 10 : sortedMyRatings.length < 50 ? 50 : sortedMyRatings.length < 100 ? 100 : sortedMyRatings.length < 250 ? 250 : 500)) * 100}%`}}></div>
                    </div>
                 </div>
               </div>
            </div>

            {/* ROZETLER */}
            <div>
              <h3 className="text-xl font-black text-white mb-6 flex items-center gap-3 drop-shadow-md"><Medal className="text-amber-500" size={24}/> {t.badges}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                 {getBadges(sortedMyRatings.length, t).map(badge => (
                   <div key={badge.id} className={`flex flex-col items-center justify-center p-5 rounded-3xl border-2 ${badge.color} text-center shadow-xl transition-all hover:scale-105 group relative bg-slate-900/50 backdrop-blur`}>
                     <div className="mb-4 p-4 bg-[#04060C]/50 rounded-2xl shadow-inner">{badge.icon}</div>
                     <h4 className="font-black text-sm mb-1">{badge.name}</h4>
                     
                     <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-max max-w-[200px] bg-slate-800 text-white text-xs font-bold p-3 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl border border-slate-600">
                        {badge.desc}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-800 rotate-45 -mt-1.5 border-r border-b border-slate-600"></div>
                     </div>
                   </div>
                 ))}
                 {sortedMyRatings.length === 0 && (
                   <div className="col-span-full p-8 text-center text-slate-500 bg-slate-900/50 rounded-3xl border border-slate-800 border-dashed font-bold">
                     {t.noBadges}
                   </div>
                 )}
              </div>
            </div>

            <button onClick={handleLogout} className="w-full py-5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 rounded-2xl font-black text-lg flex items-center justify-center gap-2 transition-all shadow-lg hover:scale-[1.01] active:scale-[0.99]">
              <LogOut size={24}/> {t.logout}
            </button>

            <div>
              <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-3 drop-shadow-md"><Film className="text-blue-500" size={28}/> {t.myRatings}</h3>
              {sortedMyRatings.length === 0 ? (
                 <div className="text-center py-20 bg-slate-900/50 rounded-3xl border border-slate-800 border-dashed">
                   <p className="text-slate-400 font-bold">{t.noRating}</p>
                 </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                  {sortedMyRatings.map((rating, index) => {
                    const safeId = rating.id ? String(rating.id) : `temp-${index}`;
                    const safeTitle = rating.title ? String(rating.title) : 'Bilinmeyen Film';
                    const safeScore = Number(rating.finalScore) || 0;
                    const safePoster = typeof rating.poster === 'string' && rating.poster.startsWith('http') ? rating.poster : 'https://via.placeholder.com/200x300?text=Poster';

                    return (
                      <div key={safeId} className="relative group cursor-pointer" onClick={() => selectMovieToRate(safeId, safeTitle)}>
                         <img src={safePoster} className="w-full aspect-[2/3] object-cover rounded-3xl bg-slate-900 border border-slate-800 group-hover:border-amber-500 transition-colors shadow-2xl" alt=""/>
                         <div className="absolute inset-0 bg-gradient-to-t from-[#04060C] via-[#04060C]/40 to-transparent rounded-3xl opacity-90 group-hover:opacity-100 flex flex-col justify-end p-4 transition-opacity">
                            
                            <div className="relative w-max">
                              <MiniVFX score={safeScore} />
                              <div className="relative z-10 text-4xl font-black leading-none mb-1 drop-shadow-lg transition-colors" style={{color: getScoreColorHex(safeScore), textShadow: `0 0 10px ${getScoreColorHex(safeScore)}80`}}>{safeScore.toFixed(1)}</div>
                            </div>
                            
                            <h4 className="font-bold text-white text-sm leading-tight line-clamp-2 drop-shadow-md mt-1">{safeTitle}</h4>
                         </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Mobil Uygulama Alt Çubuk */}
        <div className="md:hidden fixed bottom-0 left-0 w-full bg-[#04060C]/90 backdrop-blur-xl border-t border-slate-800 p-3 pb-[calc(12px+env(safe-area-inset-bottom))] flex justify-center gap-3 z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
           <button onClick={() => {setActiveTab('home'); setDynamicBg(''); setSelectedMovie(null);}} className={`flex-1 py-3 rounded-2xl text-sm font-black flex flex-col items-center gap-1.5 transition-colors ${activeTab === 'home' ? 'bg-amber-500 text-[#04060C] shadow-inner' : 'text-slate-500 hover:text-white'}`}><Clapperboard size={20}/> <span className="text-[10px] uppercase tracking-widest">{t.navShowcase}</span></button>
           <button onClick={() => {setActiveTab('global'); setDynamicBg(''); setSelectedMovie(null);}} className={`flex-1 py-3 rounded-2xl text-sm font-black flex flex-col items-center gap-1.5 transition-colors ${activeTab === 'global' ? 'bg-amber-500 text-[#04060C] shadow-inner' : 'text-slate-500 hover:text-white'}`}><Globe size={20}/> <span className="text-[10px] uppercase tracking-widest">{t.navList || 'LİSTE'}</span></button>
           <button onClick={() => { if(!user){setShowLoginModal(true); return;} setActiveTab('profile'); setDynamicBg(''); setSelectedMovie(null);}} className={`flex-1 py-3 rounded-2xl text-sm font-black flex flex-col items-center gap-1.5 transition-colors ${activeTab === 'profile' ? 'bg-amber-500 text-[#04060C] shadow-inner' : 'text-slate-500 hover:text-white'}`}><User size={20}/> <span className="text-[10px] uppercase tracking-widest">{t.navProfile || 'PROFİL'}</span></button>
        </div>
      </main>
    </div>
  );
}