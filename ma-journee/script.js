// =====================================================
// 1. LES DONNÉES : la liste des activités de l'école
//    Pour ajouter / enlever une activité, on modifie
//    seulement ce tableau.
// =====================================================
const activites = [
  // "dire" = la phrase que le téléphone prononce quand on touche l'image
  { id: "lecture",  nom: "Lecture",   dire: "J'ai lu",              icone: '<path d="M4 5h6a2 2 0 0 1 2 2v12a2 2 0 0 0-2-2H4z"/><path d="M20 5h-6a2 2 0 0 0-2 2v12a2 2 0 0 1 2-2h6z"/>' },
  { id: "ecriture", nom: "Écriture",  dire: "J'ai écrit",           icone: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13 7l4 4"/>' },
  { id: "maths",    nom: "Maths",     dire: "J'ai fait des maths",  icone: '<path d="M7 4v6M4 7h6M14 7h6M4 17h6M14 14l6 6M20 14l-6 6"/>' },
  { id: "monde",    nom: "Découverte", dire: "J'ai découvert le monde", icone: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>' },
  { id: "dessin",   nom: "Dessin",    dire: "J'ai dessiné",         icone: '<path d="M12 3a9 9 0 1 0 0 18c1.5 0 2-1 2-2s-1-1.5-1-2.5 1-1.5 2-1.5h2a4 4 0 0 0 4-4c0-4.4-4-8-9-8z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7" r="1"/><circle cx="15" cy="7" r="1"/>' },
  { id: "musique",  nom: "Musique",   dire: "J'ai fait de la musique", icone: '<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>' },
  { id: "sport",    nom: "Sport",     dire: "J'ai fait du sport",   icone: '<circle cx="15" cy="4.5" r="2"/><path d="M9 8.5l4-1.5 3 3 3 1M13 7l-2 6 3 3v5M11 13l-3 3H4"/>' },
  { id: "recre",    nom: "Récré",     dire: "J'ai joué à la récré", icone: '<path d="M4 20V8l4-4 4 4v12"/><path d="M12 12l8 8"/><path d="M4 12h8M4 16h8"/>' },
  { id: "cantine",  nom: "Cantine",   dire: "J'ai mangé à la cantine", icone: '<path d="M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M17 3c-2 2-2 6 0 8v10"/>' },
  { id: "calme",    nom: "Calme",     dire: "J'ai fait une pause au calme", icone: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>' },
  { id: "copains",  nom: "Copains",   dire: "J'ai joué avec les copains", icone: '<circle cx="8" cy="8" r="3"/><circle cx="16" cy="8" r="3"/><path d="M3 20c0-3 2.5-5 5-5s5 2 5 5M11 20c0-3 2.5-5 5-5s5 2 5 5"/>' },
  { id: "garderie", nom: "Garderie",  dire: "Je suis allé à la garderie", icone: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>' },
];

const phrasesHumeur = { bien: "J'étais content", moyen: "C'était bof", difficile: "Je n'étais pas content" };

const nomsMoments = { matin: "Matin", midi: "Midi", aprem: "Après-midi" };

// =====================================================
// 2. L'ÉTAT : ce que l'AESH a choisi
//    On le garde dans le téléphone (localStorage) pour
//    ne rien perdre si on ferme la page.
// =====================================================
let journee = chargerJournee();
let momentActif = "matin";
let sonActive = lireReglageSon();

function lireReglageSon() {
  try { return localStorage.getItem("ma-journee-son") !== "non"; } catch (e) { return true; }
}

// =====================================================
// LA VOIX : le téléphone lit le mot à voix haute
// (utile au CP, quand l'enfant ne lit pas encore bien)
// =====================================================
function dire(texte) {
  if (!sonActive || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();          // on coupe la phrase d'avant
  const phrase = new SpeechSynthesisUtterance(texte);
  phrase.lang = "fr-FR";
  phrase.rate = 0.9;                        // un peu plus lent que normal
  window.speechSynthesis.speak(phrase);
}

function journeeVide() {
  return { matin: [], midi: [], aprem: [], humeur: null, note: "" };
}

function chargerJournee() {
  try {
    const texte = localStorage.getItem("ma-journee");
    return texte ? JSON.parse(texte) : journeeVide();
  } catch (e) {
    return journeeVide();
  }
}

function sauvegarderJournee() {
  try {
    localStorage.setItem("ma-journee", JSON.stringify(journee));
  } catch (e) {
    // si le stockage est bloqué, la page marche quand même
  }
}

// =====================================================
// 3. L'AFFICHAGE
// =====================================================

// La date du jour, en français : "mardi 17 novembre"
document.getElementById("date").textContent =
  new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });

// On fabrique un bouton pour chaque activité du tableau
const grille = document.getElementById("grille");
activites.forEach(function (activite) {
  const bouton = document.createElement("button");
  bouton.type = "button";
  bouton.className = "carte";
  bouton.dataset.id = activite.id;
  bouton.innerHTML =
    '<svg aria-hidden="true" viewBox="0 0 24 24">' + activite.icone + "</svg>" +
    "<span>" + activite.nom + "</span>";
  bouton.addEventListener("click", function () {
    basculerActivite(activite.id);
  });
  grille.appendChild(bouton);
});

// Met tout l'écran à jour selon l'état
function afficher() {
  // Les onglets
  document.querySelectorAll(".onglet").forEach(function (onglet) {
    const moment = onglet.dataset.moment;
    const nombre = journee[moment].length;
    onglet.querySelector(".onglet-texte").textContent = nomsMoments[moment] + (nombre > 0 ? " · " + nombre : "");
    onglet.classList.toggle("actif", moment === momentActif);
    onglet.setAttribute("aria-pressed", moment === momentActif);
  });

  // Les activités cochées pour le moment affiché
  document.querySelectorAll("#grille .carte").forEach(function (carte) {
    const choisie = journee[momentActif].includes(carte.dataset.id);
    carte.classList.toggle("choisie", choisie);
    carte.setAttribute("aria-pressed", choisie);
  });

  // L'humeur
  document.querySelectorAll("#humeurs .carte").forEach(function (carte) {
    const choisie = journee.humeur === carte.dataset.humeur;
    carte.classList.toggle("choisie", choisie);
    carte.setAttribute("aria-pressed", choisie);
  });

  // La note
  document.getElementById("note").value = journee.note;

  // Le résumé
  const morceaux = [];
  ["matin", "midi", "aprem"].forEach(function (moment) {
    if (journee[moment].length > 0) {
      const noms = journee[moment].map(function (id) {
        return activites.find(function (a) { return a.id === id; }).nom;
      });
      morceaux.push(nomsMoments[moment] + " : " + noms.join(", "));
    }
  });
  document.getElementById("resume").textContent =
    morceaux.length > 0 ? morceaux.join(" — ") : "Aucune activité choisie pour l'instant.";
}

// =====================================================
// 4. LES ACTIONS (ce qui se passe quand on touche)
// =====================================================
function basculerActivite(id) {
  const liste = journee[momentActif];
  const position = liste.indexOf(id);
  if (position >= 0) {
    liste.splice(position, 1); // déjà cochée → on l'enlève
  } else {
    liste.push(id);            // pas cochée → on l'ajoute
    dire(activites.find(function (a) { return a.id === id; }).dire);
  }
  cacherConfirmation();
  sauvegarderJournee();
  afficher();
}

document.querySelectorAll(".onglet").forEach(function (onglet) {
  onglet.addEventListener("click", function () {
    momentActif = onglet.dataset.moment;
    dire(nomsMoments[momentActif]);
    afficher();
  });
});

document.querySelectorAll("#humeurs .carte").forEach(function (carte) {
  carte.addEventListener("click", function () {
    const humeur = carte.dataset.humeur;
    journee.humeur = journee.humeur === humeur ? null : humeur;
    if (journee.humeur) dire(phrasesHumeur[humeur]);
    cacherConfirmation();
    sauvegarderJournee();
    afficher();
  });
});

document.getElementById("note").addEventListener("input", function (evenement) {
  journee.note = evenement.target.value;
  sauvegarderJournee();
});

document.getElementById("envoyer").addEventListener("click", function () {
  // Version test : pas encore de base de données.
  // Plus tard, c'est ici qu'on enverra la journée à Firebase.
  sauvegarderJournee();
  document.getElementById("confirmation").hidden = false;
});

document.getElementById("effacer").addEventListener("click", function () {
  journee = journeeVide();
  momentActif = "matin";
  cacherConfirmation();
  sauvegarderJournee();
  afficher();
});

function cacherConfirmation() {
  document.getElementById("confirmation").hidden = true;
}

// Le bouton pour couper / remettre le son
// (certains enfants n'aiment pas les sons : on doit pouvoir couper)
function afficherSon() {
  const bouton = document.getElementById("son");
  bouton.setAttribute("aria-pressed", sonActive);
  bouton.classList.toggle("coupe", !sonActive);
  document.getElementById("son-texte").textContent = sonActive ? "Son activé" : "Son coupé";
}

document.getElementById("son").addEventListener("click", function () {
  sonActive = !sonActive;
  try { localStorage.setItem("ma-journee-son", sonActive ? "oui" : "non"); } catch (e) {}
  if (!sonActive && "speechSynthesis" in window) window.speechSynthesis.cancel();
  afficherSon();
});

// Premier affichage
afficherSon();
afficher();

// =====================================================
// 5. LE SERVICE WORKER : permet d'installer l'appli
//    et de l'ouvrir même sans réseau
// =====================================================
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js");
}
