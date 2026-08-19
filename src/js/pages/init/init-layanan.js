createCrudModule(document.getElementById('tabEventRoot'), CONFIG_EVENTS);
createCrudModule(document.getElementById('tabPengumumanRoot'), CONFIG_ANNOUNCEMENTS);
createCrudModule(document.getElementById('tabBookingRoot'), CONFIG_ROOM_BOOKINGS);
createCrudModule(document.getElementById('tabFaqRoot'), CONFIG_FAQS);
createCrudModule(document.getElementById('tabFeedbackRoot'), CONFIG_FEEDBACK);
createCrudModule(document.getElementById('tabKunjunganRoot'), CONFIG_VISITS);
initChrome();
setupTabs();
refreshIcons();
