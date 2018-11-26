self.addEventListener('install', function(e) {
 e.waitUntil(
   caches.open('fnkfk').then(function(cache) {
     return cache.addAll([
       '/',
       '/index.html',
       '/index.html?homescreen=1',
       '/?homescreen=1',
       '/dist/css/styles.css',
       '/dist/js/scripts.js'
     ]);
   })
 );
});