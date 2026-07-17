function goToCareerDirect() {
  showNavAndProgress();
  setActiveTab('career');
  history.pushState({ page: 'career', lang: currentLanguage, tab: 'career' }, '');
  renderCareer();
  showPage('career');
}
