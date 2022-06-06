/* eslint-disable cypress/no-unnecessary-waiting */
context('Confirm notification', () => {
  const ssPrefix = 'confirm-notification-';

  beforeEach(() => {
    // login
    cy.fixture("user-admin.json").then(user => {
      cy.login(user.username, user.password);
    });
    // collapse sidebar
    cy.collapseSidebar(true);
  });

  it('Confirm notification', () => {
    cy.visit('/');
    cy.get('.notification-wrapper > a').click();
    cy.get('.notification-wrapper > .dropdown-menu > a').click();

    cy.get('#all-in-app-notifications').should('be.visible');

    cy.screenshot(`${ssPrefix}-see-all`, { capture: 'viewport' });

    cy.get('.grw-custom-nav-tab > div > ul > li:nth-child(2) > a').click();

    cy.screenshot(`${ssPrefix}-see-unread`, { capture: 'viewport' });
  });

});
