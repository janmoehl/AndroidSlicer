import { element, by, ElementFinder } from 'protractor';

export class SlicerOptionComponentsPage {
  createButton = element(by.id('jh-create-entity'));
  deleteButtons = element.all(by.css('jhi-slicer-option div table .btn-danger'));
  title = element.all(by.css('jhi-slicer-option div h2#page-heading span')).first();
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

export class SlicerOptionUpdatePage {
  pageTitle = element(by.id('jhi-slicer-option-heading'));
  saveButton = element(by.id('save-entity'));
  cancelButton = element(by.id('cancel-save'));

  typeSelect = element(by.id('field_type'));
  keyInput = element(by.id('field_key'));
  descriptionInput = element(by.id('field_description'));
  isDefaultInput = element(by.id('field_isDefault'));

  async getPageTitle(): Promise<string> {
    return this.pageTitle.getText();
  }

  async setTypeSelect(type: string): Promise<void> {
    await this.typeSelect.sendKeys(type);
  }

  async getTypeSelect(): Promise<string> {
    return await this.typeSelect.element(by.css('option:checked')).getText();
  }

  async typeSelectLastOption(): Promise<void> {
    await this.typeSelect.all(by.tagName('option')).last().click();
  }

  async setKeyInput(key: string): Promise<void> {
    await this.keyInput.sendKeys(key);
  }

  async getKeyInput(): Promise<string> {
    return await this.keyInput.getAttribute('value');
  }

  async setDescriptionInput(description: string): Promise<void> {
    await this.descriptionInput.sendKeys(description);
  }

  async getDescriptionInput(): Promise<string> {
    return await this.descriptionInput.getAttribute('value');
  }

  getIsDefaultInput(): ElementFinder {
    return this.isDefaultInput;
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

export class SlicerOptionDeleteDialog {
  private dialogTitle = element(by.id('jhi-delete-slicerOption-heading'));
  private confirmButton = element(by.id('jhi-confirm-delete-slicerOption'));

  async getDialogTitle(): Promise<string> {
    return this.dialogTitle.getText();
  }

  async clickOnConfirmButton(): Promise<void> {
    await this.confirmButton.click();
  }
}
