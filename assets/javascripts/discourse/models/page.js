import { tracked } from "@glimmer/tracking";
import EmberObject from "@ember/object";
import { isHTMLSafe } from "@ember/template";
import { ajax } from "discourse/lib/ajax";
import { getURLWithCDN } from "discourse/lib/get-url";
import { cook } from "discourse/lib/text";
import Group from "discourse/models/group";
import { i18n } from "discourse-i18n";

class StaticPage extends EmberObject {
  init() {
    super.init(...arguments);
  }
}

class StaticPagesModel {
  @tracked items = [];
  @tracked loading = true;

  pushObject(item) {
    this.items = [...this.items, item];
  }

  removeObject(item) {
    this.items = this.items.filter((existing) => existing !== item);
  }
}

StaticPage.reopenClass({
  findAll: function () {
    const model = new StaticPagesModel();
    ajax("/procourse-static-pages/admin/pages.json").then((rows) => {
      (rows || []).forEach((row) => {
        let src = row;
        if (row && typeof row.value === "string") {
          try {
            src = JSON.parse(row.value);
          } catch (e) {
            // eslint-disable-next-line no-console
            console.error("[static-pages] bad JSON in row.value:", row, e);
            src = null;
          }
        } else if (row && row.value && typeof row.value === "object") {
          // already an object under value
          src = row.value;
        }
        if (src) {
          model.pushObject(
            StaticPage.create({
              ...src,
              id: src.id != null ? Number(src.id) : src.id,
            }) // avoid sometimes numbers and sometimes strings
          );
        }
      });
      model.loading = false;
    });
    return model;
  },

  save: async function (object, enabledOnly = false) {
    if (object.get("disableSave")) {
      return;
    }

    object.set("savingStatus", i18n("saving"));
    object.set("saving", true);

    let data = { active: object.active };

    if (object.id) {
      data.id = object.id;
    }

    if (!object || !enabledOnly) {
      let cookedStr = "";
      if (!object.html) {
        const maybe = cook(object.raw || "", { getURL: getURLWithCDN });
        const result = typeof maybe?.then === "function" ? await maybe : maybe;

        // ensure we persist a *plain string*:
        if (typeof result === "string") {
          cookedStr = result;
        } else if (isHTMLSafe?.(result)) {
          cookedStr = result.string ?? result.toHTML?.() ?? String(result);
        } else if (result?.toHTML) {
          cookedStr = result.toHTML();
        } else {
          cookedStr = String(result ?? "");
        }
      }

      data = {
        ...data,
        title: object.title,
        slug: object.slug,
        group: object.group,
        raw: object.raw,
        cooked: cookedStr,
        custom_slug: object.custom_slug,
        html: object.html,
        html_content: object.html_content,
      };
    }

    return ajax("/procourse-static-pages/admin/pages.json", {
      data: JSON.stringify({ page: data }),
      type: object.id ? "PUT" : "POST",
      dataType: "json",
      contentType: "application/json",
    })
      .catch(function (result) {
        const message = result?.jqXHR?.responseJSON?.errors?.[0];
        if (message) {
          // eslint-disable-next-line no-console
          console.error("[static-pages] save failed:", message);
        }
      })
      .then(function (result) {
        if (result.id) {
          object.set("id", result.id);
          object.set("savingStatus", i18n("saved"));
          object.set("saving", false);
        }
      });
  },

  copy: function (object) {
    let copiedPage = StaticPage.create({
      ...object,
      id: null,
    });
    return copiedPage;
  },

  destroy: function (object) {
    if (object.id) {
      let data = { id: object.id };
      return ajax("/procourse-static-pages/admin/pages.json", {
        data: JSON.stringify({ page: data }),
        type: "DELETE",
        dataType: "json",
        contentType: "application/json",
      });
    }
  },

  customGroups: function () {
    return Group.findAll();
  },
});

export default StaticPage;
