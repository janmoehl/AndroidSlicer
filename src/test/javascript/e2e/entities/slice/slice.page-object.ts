import { element, by, ElementFinder } from 'protractor';

export class SliceComponentsPage {
  createButton = element(by.id('jh-create-entity'));
  deleteButtons = element.all(by.css('jhi-slice div table .btn-danger'));
  title = element.all(by.css('jhi-slice div h2#page-heading span')).first();
  noResult = element(by.id('no-result'));
  entities = element(by.id('entities'));

  async clickOnCreateButton(): Promise<void> {
    await this.createButton.click();
  }

  async clickOnLastDeleteButton(): Promise<void> {
    await this.deleteButtons.last().click();
  }

  async countDeleteButtons(): Promise<number> {
    return this.deleteButtons.count();
  }

  async getTitle(): Promise<string> {
    return this.title.getText();
  }
}

export class SliceMakePage {
  pageTitle = element(by.id('jhi-slice-heading'));
  saveButton = element(by.id('save-entity'));
  cancelButton = element(by.id('cancel-save'));

  androidVersionInput = element(by.id('field_androidVersion'));
  androidClassNameInput = element(by.id('field_androidClassName'));
  entryMethodsInput = element(by.id('field_entryMethods'));
  seedStatementsInput = element(by.id('field_seedStatements'));
  cfaTypeSelect = element(by.id('field_cfaType'));
  cfaLevelInput = element(by.id('field_cfaLevel'));
  reflectionOptionsSelect = element(by.id('field_reflectionOptions'));
  dataDependenceOptionsSelect = element(by.id('field_dataDependenceOptions'));
  controlDependenceOptionsSelect = element(by.id('field_controlDependenceOptions'));

  async getPageTitle(): Promise<string> {
    return this.pageTitle.getText();
  }

  async setAndroidVersionInput(androidVersion: string): Promise<void> {
    await this.androidVersionInput.sendKeys(androidVersion);
  }

  async getAndroidVersionInput(): Promise<string> {
    return await this.androidVersionInput.getAttribute('value');
  }

  async setAndroidClassNameInput(androidClassName: string): Promise<void> {
    await this.androidClassNameInput.sendKeys(androidClassName);
  }

  async getAndroidClassNameInput(): Promise<string> {
    return await this.androidClassNameInput.getAttribute('value');
  }

  async setEntryMethodsInput(entryMethods: string): Promise<void> {
    await this.entryMethodsInput.sendKeys(entryMethods);
  }

  async getEntryMethodsInput(): Promise<string> {
    return await this.entryMethodsInput.getAttribute('value');
  }

  async setSeedStatementsInput(seedStatements: string): Promise<void> {
    await this.seedStatementsInput.sendKeys(seedStatements);
  }

  async getSeedStatementsInput(): Promise<string> {
    return await this.seedStatementsInput.getAttribute('value');
  }

  async setCfaTypeSelect(cfaType) {
    await this.cfaTypeSelect.sendKeys(cfaType);
  }

  async getCfaTypeSelect() {
    return await this.cfaTypeSelect.element(by.css('option:checked')).getText();
  }

  async cfaTypeSelectLastOption(timeout?: number) {
    await this.cfaTypeSelect
      .all(by.tagName('option'))
      .last()
      .click();
  }

  async setCfaLevelInput(cfaLevel) {
    await this.cfaLevelInput.sendKeys(cfaLevel);
  }

  async getCfaLevelInput() {
    return await this.cfaLevelInput.getAttribute('value');
  }

  async setReflectionOptionsSelect(reflectionOptions) {
    await this.reflectionOptionsSelect.sendKeys(reflectionOptions);
  }

  async getReflectionOptionsSelect(): Promise<string> {
    return await this.reflectionOptionsSelect.element(by.css('option:checked')).getText();
  }

  async reflectionOptionsSelectLastOption(): Promise<void> {
    await this.reflectionOptionsSelect
      .all(by.tagName('option'))
      .last()
      .click();
  }

  async setDataDependenceOptionsSelect(dataDependenceOptions: string): Promise<void> {
    await this.dataDependenceOptionsSelect.sendKeys(dataDependenceOptions);
  }

  async getDataDependenceOptionsSelect(): Promise<string> {
    return await this.dataDependenceOptionsSelect.element(by.css('option:checked')).getText();
  }

  async dataDependenceOptionsSelectLastOption(): Promise<void> {
    await this.dataDependenceOptionsSelect
      .all(by.tagName('option'))
      .last()
      .click();
  }

  async setControlDependenceOptionsSelect(controlDependenceOptions: string): Promise<void> {
    await this.controlDependenceOptionsSelect.sendKeys(controlDependenceOptions);
  }

  async getControlDependenceOptionsSelect(): Promise<string> {
    return await this.controlDependenceOptionsSelect.element(by.css('option:checked')).getText();
  }

  async controlDependenceOptionsSelectLastOption(): Promise<void> {
    await this.controlDependenceOptionsSelect
      .all(by.tagName('option'))
      .last()
      .click();
  }

  async save(): Promise<void> {
    await this.saveButton.click();
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }

  getSaveButton(): ElementFinder {
    return this.saveButton;
  }
}

export class SliceDeleteDialog {
  private dialogTitle = element(by.id('jhi-delete-slice-heading'));
  private confirmButton = element(by.id('jhi-confirm-delete-slice'));

  async getDialogTitle(): Promise<string> {
    return this.dialogTitle.getText();
  }

  async clickOnConfirmButton(): Promise<void> {
    await this.confirmButton.click();
  }
}
