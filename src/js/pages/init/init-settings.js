initSettingsPage();
createCrudModule(document.getElementById('tabStafRoot'), CONFIG_STAFF);
createCrudModule(document.getElementById('tabRoleRoot'), CONFIG_ROLES);
createCrudModule(document.getElementById('tabLogRoot'), CONFIG_ACTIVITY_LOG);
createCrudModule(document.getElementById('tabBackupRoot'), CONFIG_BACKUPS);
initChrome();
setupTabs();
refreshIcons();
