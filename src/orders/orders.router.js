const router = require("express").Router();
const controller = require("./orders.controller");
const methodNotAllowed = require("../errors/methodNotAllowed"); // IMPORTED HELPER FUNCTION

// ------- ROUTE HANDLER ------- //
router
  .route("/:orderId")
  .get(controller.read)
  .put(controller.update)
  .delete(controller.delete)
  .all(methodNotAllowed); // HELPER FUNCTION CALLED TO HANDLE REQUEST ERRORS

// ------- ROUTE HANDLER ------- //
router
  .route("/")
  .get(controller.list)
  .post(controller.create)
  .all(methodNotAllowed); // HELPER FUNCTION CALLED TO HANDLE REQUEST ERRORS

module.exports = router;
