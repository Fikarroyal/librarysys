initMembersPage();
createCrudModule(document.getElementById('tabBlacklistRoot'), CONFIG_BLACKLIST);
createCrudModule(document.getElementById('tabKartuRoot'), CONFIG_CARDS);
createCrudModule(document.getElementById('tabJkaRoot'), CONFIG_MEMBERSHIP_TYPES);
createCrudModule(document.getElementById('tabJurusanRoot'), CONFIG_DEPARTMENTS);
initChrome();
setupTabs();
refreshIcons();
