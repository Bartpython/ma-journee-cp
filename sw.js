// Service worker : il garde une copie des fichiers dans le téléphone
// pour que l'appli s'ouvre même sans connexion.
// Quand tu modifies un fichier, change le numéro de version ci-dessous
// (v1 → v2…) pour que les téléphones prennent la nouvelle version.
const VERSION = "ma-journee-v2";

const FICHIERS = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

// À l'installation : on met les fichiers en mémoire
self.addEventListener("install", function (evenement) {
  evenement.waitUntil(
    caches.open(VERSION).then(function (cache) {
      return cache.addAll(FICHIERS);
    })
  );
  self.skipWaiting();
});

// À l'activation : on supprime les anciennes versions
self.addEventListener("activate", function (evenement) {
  evenement.waitUntil(
    caches.keys().then(function (noms) {
      return Promise.all(
        noms.filter(function (nom) { return nom !== VERSION; })
            .map(function (nom) { return caches.delete(nom); })
      );
    })
  );
  self.clients.claim();
});

// Quand la page demande un fichier : on essaie internet d'abord,
// et si ça ne marche pas, on prend la copie en mémoire
self.addEventListener("fetch", function (evenement) {
  evenement.respondWith(
    fetch(evenement.request)
      .then(function (reponse) {
        const copie = reponse.clone();
        caches.open(VERSION).then(function (cache) {
          cache.put(evenement.request, copie);
        });
        return reponse;
      })
      .catch(function () {
        return caches.match(evenement.request);
      })
  );
});
