import { trustHTML } from "@ember/template";

export default <template>
  <div class="static-page">
    {{#if @model.html}}
      {{trustHTML @model.html_content}}
    {{else}}
      {{trustHTML @model.cooked}}
    {{/if}}
  </div>
</template>
