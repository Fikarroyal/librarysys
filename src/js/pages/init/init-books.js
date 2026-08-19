initBooksPage();
createCrudModule(document.getElementById('tabUlasanRoot'), CONFIG_REVIEWS);
createCrudModule(document.getElementById('tabPermintaanRoot'), CONFIG_BOOK_REQUESTS);
createCrudModule(document.getElementById('tabDonasiRoot'), CONFIG_DONATIONS);
initChrome();
setupTabs();
refreshIcons();
