import DiscourseRoute from "discourse/routes/discourse";
import Page from "../../models/page";

export default DiscourseRoute.extend({
  model() {
    return Page.findAll();
  },

  setupController(controller, model) {
    controller.setProperties({ model });
  },
});
