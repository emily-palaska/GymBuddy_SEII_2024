// dont forget to run node index.js to start the server before testing

describe('Dropdown Navigation Test', () => {
  // Visit the page before each test
  beforeEach(() => {
    cy.visit('http://localhost:8080/docs');
  });

  it('Should navigate to /# after clicking the dropdown with label "default" once', () => {
    // Target the block by its ID and class
    cy.get('h4.opblock-tag.no-desc#operations-tag-default')
      .within(() => {
        // Click the arrow button inside the block
        cy.get('button.expand-operation').click();
      });

    // Verify the URL contains '/#'
    cy.url().should('include', '/#');
  });

  it('Should navigate to /#/default after clicking the dropdown with label "default" twice', () => {
    // Target the block by its ID and class
    cy.get('h4.opblock-tag.no-desc#operations-tag-default')
      .within(() => {
        // Click the arrow button inside the block
        cy.get('button.expand-operation').click().click();
      });

    // Verify the URL contains '/#/default'
    cy.url().should('include', '/#/default');
  });
});

describe('API Download URL Tests', () => {
  // Visit the page before each test
  beforeEach(() => {
    cy.visit('http://localhost:8080/docs');
  });

  it('Tests failure case for /api URL', () => {
    // Locate the input field and type '/api'
    cy.get('.download-url-input').clear().type('/api');

    // Click the 'Explore' button
    cy.get('.download-url-button').click();

    // Assert the page shows the expected failure message
    cy.get('h4.title').should('contain.text', 'Failed to load API definition.');
  });

  it('Tests successful case for /api-docs URL', () => {
    // Locate the input field and type '/api-docs'
    cy.get('.download-url-input').clear().type('/api-docs');

    // Click the 'Explore' button
    cy.get('.download-url-button').click();

    // Assert the page shows the expected success title
    cy.get('h2.title').should('contain.text', 'GymBuddy AUTH');

    // Additional assertions to verify version and specification type
    cy.get('h2.title pre.version').first().should('contain.text', '1.0.0');
    cy.get('h2.title pre.version').last().should('contain.text', 'OAS3');
  });
});