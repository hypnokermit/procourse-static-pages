import { tracked } from "@glimmer/tracking";
import Controller from "@ember/controller";
import EmberObject, { action, computed } from "@ember/object";
import { service } from "@ember/service";
import { i18n } from "discourse-i18n";
import Page from "../../models/page";

export default class AdminPluginsProcourseStaticPagesController extends Controller {
  @service dialog;

  @tracked selectedItem = null;
  @tracked customGroups = null;
  @tracked originals = null;
  @tracked editingTitle = false;
  @tracked forceEnableSave = false;

  get pageURL() {
    return document.location.origin + "/page/";
  }

  get basePCPage() {
    const page = EmberObject.create({});
    page.set("title", i18n("admin.procourse_static_pages.pages.new_title"));
    page.set("active", false);
    return page;
  }

  @computed("selectedItem.id", "selectedItem.saving")
  get disableEnable() {
    return !this.selectedItem?.id || this.selectedItem?.saving;
  }

  @computed(
    "originals",
    "forceEnableSave",
    "selectedItem.title",
    "selectedItem.slug",
    "selectedItem.group",
    "selectedItem.raw",
    "selectedItem.html",
    "selectedItem.html_content",
    "selectedItem.cooked",
  )
  get disableSave() {
    if (this.forceEnableSave) {
      return false;
    }

    if (!this.originals || !this.selectedItem) {
      return true;
    }

    const unchanged =
      this.originals.title === this.selectedItem.title &&
      this.originals.slug === this.selectedItem.slug &&
      this.originals.group === this.selectedItem.group &&
      this.originals.raw === this.selectedItem.raw &&
      this.originals.html === this.selectedItem.html &&
      this.originals.html_content === this.selectedItem.html_content &&
      this.originals.cooked === this.selectedItem.cooked;

    return (
      unchanged ||
      !this.selectedItem.title ||
      (!this.selectedItem.html && !this.selectedItem.raw) ||
      (this.selectedItem.html && !this.selectedItem.html_content)
    );
  }

  removeSelected() {
    this.model.removeObject(this.selectedItem);
    this.selectedItem = null;
  }

  slugify(text) {
    return text
      .toString()
      .toLowerCase()
      .replace(/\s+/g, "-") // Replace spaces with -
      .replace(/[^\w-]+/g, "") // Remove all non-word chars
      .replace(/--+/g, "-") // Replace multiple - with single -
      .replace(/^-+/, "") // Trim - from start of text
      .replace(/-+$/, ""); // Trim - from end of text
  }

  @action
  clearLimitGroup() {
    this.selectedItem?.set("group", null);
  }

  @action
  editTitle() {
    this.editingTitle = true;
    if (
      this.selectedItem &&
      !this.selectedItem.custom_slug &&
      this.selectedItem.selected
    ) {
      this.selectedItem.set("slug", this.slugify(this.selectedItem.title));
    }
    this.editingTitle = false;
  }

  @action
  editSlug() {
    if (this.selectedItem && !this.editingTitle && this.selectedItem.selected) {
      if (this.originals.slug === this.selectedItem.slug) {
        this.selectedItem.set("custom_slug", this.originals.custom_slug);
      } else {
        this.selectedItem.set("custom_slug", true);
      }
    }
  }

  @action
  selectPCPage(page) {
    this.forceEnableSave = false;
    Page.customGroups().then((g) => {
      this.customGroups = g;
      if (this.selectedItem) {
        this.selectedItem.set("selected", false);
      }
      this.originals = {
        title: page.title,
        active: page.active,
        slug: page.slug,
        group: page.group,
        raw: page.raw,
        cooked: page.cooked,
        custom_slug: page.custom_slug,
        html: page.html,
        html_content: page.html_content,
      };
      this.selectedItem = page;
      page.set("savingStatus", null);
      page.set("selected", true);
    });
  }

  @action
  newPCPage() {
    const newPCPage = EmberObject.create(this.basePCPage);
    const newTitle = i18n("admin.procourse_static_pages.pages.new_title");
    newPCPage.set("title", newTitle);
    newPCPage.set("slug", this.slugify(newTitle));
    newPCPage.set("slugEdited", false);
    newPCPage.set("group", null);
    newPCPage.set("newRecord", true);
    newPCPage.set("html", false);
    newPCPage.set("html_content", "");
    this.model.pushObject(newPCPage);
    this.selectPCPage(newPCPage);
  }

  @action
  toggleEnabled() {
    this.selectedItem.toggleProperty("active");
    Page.save(this.selectedItem, true);
  }

  @action
  save() {
    if (this.selectedItem.slug === this.slugify(this.selectedItem.title)) {
      this.selectedItem.set("custom_slug", false);
    }
    Page.save(this.selectedItem);
    this.selectPCPage(this.selectedItem);
  }

  @action
  copyPage() {
    const page = this.selectedItem;
    const newPCPage = Page.copy(page);
    newPCPage.set(
      "title",
      i18n("admin.customize.colors.copy_name_prefix") + " " + page.get("title"),
    );
    this.model.pushObject(newPCPage);
    this.selectPCPage(newPCPage);
    this.forceEnableSave = true;
  }

  @action
  deletePage() {
    const item = this.selectedItem;

    this.dialog.confirm({
      message: i18n("admin.procourse_static_pages.pages.delete_confirm"),
      cancelButtonLabel: "admin.procourse_static_pages.pages.confirm_no",
      confirmButtonLabel: "admin.procourse_static_pages.pages.confirm_yes",

      didConfirm: () => {
        if (!item.id) {
          this.removeSelected();
        } else {
          Page.destroy(item).then(() => this.removeSelected());
        }
      },
    });
  }
}
