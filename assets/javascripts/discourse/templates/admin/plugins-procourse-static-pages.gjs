import { Input } from "@ember/component";
import { fn } from "@ember/helper";
import { on } from "@ember/modifier";
import AceEditor from "discourse/components/ace-editor";
import ComboBox from "discourse/select-kit/components/combo-box";
import DButton from "discourse/ui-kit/d-button";
import DConditionalLoadingSpinner from "discourse/ui-kit/d-conditional-loading-spinner";
import DEditor from "discourse/ui-kit/d-editor";
import DTextField from "discourse/ui-kit/d-text-field";
import dIcon from "discourse/ui-kit/helpers/d-icon";
import { i18n } from "discourse-i18n";

export default <template><DConditionalLoadingSpinner @condition={{@controller.model.loading}} >
  <div class="customize procourse-static-pages admin admin-customize">
    <div class="admin-container">
      <div class="content-list span6">
        <h3>{{i18n "procourse_static_pages.title"}}</h3>
        <ul>
          {{#each @controller.model as |page|}}
            <li><a {{on "click" (fn @controller.onSelectPCPage page)}} class={{if page.selected "active"}}>{{page.title}}</a></li>
          {{/each}}
        </ul>
        {{#unless @controller.model.length}}
          <p class="desc">{{i18n "admin.procourse_static_pages.pages.no_pages"}}</p>
        {{/unless}}
        <DButton class="btn" @type="button" @action={{@controller.onNewPCPage}} @label="admin.customize.new" @icon="plus" />
      </div>
      {{#if @controller.selectedItem.selected}}
        <div class="show-current-style current-style color-scheme">
          <div class="admin-container">
            <h1><DTextField @class="style-name" @value={{@controller.selectedItem.title}} /></h1>
            <div class="controls">
              <button {{on "click" @controller.onSave}} disabled={{@controller.disableSave}} class="btn" type="button">{{i18n "admin.customize.save"}}</button>
              <button {{on "click" @controller.onToggle}} disabled={{@controller.disableEnable}} class="btn" type="button">
                {{#if @controller.selectedItem.active}}
                  {{i18n "disable"}}
                {{else}}
                  {{i18n "enable"}}
                {{/if}}
              </button>
              <button {{on "click" @controller.onCopy}} class="btn" type="button">{{dIcon "copy"}}
                {{i18n "admin.customize.copy"}}</button>
              <button {{on "click" @controller.onDestroy}} class="btn btn-danger" type="button">{{dIcon "trash-can"}}
                {{i18n "admin.customize.delete"}}</button>
              <span class="saving
                  {{unless @controller.selectedItem.savingStatus "hidden"}}">{{@controller.selectedItem.savingStatus}}</span>
            </div>
          </div>
          <br />
          <form class="form-horizontal">
            {{#if @controller.selectedItem.id}}
              <div>
                <label>{{i18n "admin.procourse_static_pages.pages.id"}}:
                  {{@controller.selectedItem.id}}</label>
                <p class="help">{{i18n "admin.procourse_static_pages.pages.page_url_description"}}:
                  <a target="_blank" href="{{@controller.pageURL}}{{@controller.selectedItem.slug}}/{{@controller.selectedItem.id}}/" rel="noopener noreferrer">{{@controller.pageURL}}{{@controller.selectedItem.slug}}/{{@controller.selectedItem.id}}/</a></p>
              </div>
            {{/if}}
            <div>
              <label>{{i18n "admin.procourse_static_pages.pages.slug"}}</label>
              <DTextField @class="style-name" @value={{@controller.selectedItem.slug}} @enter={{@controller.editSlug}} />
              <p class="help">{{i18n "admin.procourse_static_pages.pages.slug_description"}}</p>
            </div>
            <div>
              <label>{{i18n "admin.procourse_static_pages.pages.limit_group"}}</label>
              <ComboBox @content={{@controller.customGroups}} @valueAttribute="id" @value={{@controller.selectedItem.group}} @none="admin.procourse_static_pages.groups.bulk_select" />
              {{#if @controller.selectedItem.group}}
                <DButton class="btn-link clear-group-btn" @icon="xmark" @title="admin.procourse_static_pages.groups.clear" @action={{@controller.clearLimitGroup}} />
              {{/if}}
              <p class="help">{{i18n "admin.procourse_static_pages.pages.limit_group_description"}}</p>
            </div>
            <div>
              <label>
                {{Input type="checkbox" name="html" checked=@controller.selectedItem.html}}
                {{i18n "admin.procourse_static_pages.pages.html"}}
              </label>
              <p class="help">{{i18n "admin.procourse_static_pages.pages.html_description"}}</p>
            </div>
            <div class="pcsp-ace">
              {{#if @controller.selectedItem.html}}
                <AceEditor @content={{@controller.selectedItem.html_content}} @onChange={{fn (mut @controller.selectedItem.html_content)}} @editorId="html|common" @mode="html" />
              {{else}}
                <DEditor @value={{@controller.selectedItem.raw}} @class="raw-bio" />
              {{/if}}
            </div>
          </form>
        </div>
      {{else}}
        <div class="current-style color-scheme badges">{{i18n "admin.procourse_static_pages.pages.no_page_selected"}}</div>
      {{/if}}
    </div>
  </div>
</DConditionalLoadingSpinner></template>