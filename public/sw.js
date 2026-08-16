self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Apenas passa a requisição adiante. 
  // Isso é suficiente para o Chrome reconhecer o app como um PWA instalável.
  return;
});
