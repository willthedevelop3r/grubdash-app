const path = require("path");
const orders = require(path.resolve("src/data/orders-data"));
const nextId = require("../utils/nextId"); // IMPORTED HELPER FUNCTION

// ------- CONTROLLER TO HANDLE "G"ET" REQUESTS -------//
const list = (req, res) => res.json({ data: orders });

// ------- MIDDLEWARE FOR VALIDATION ------- //
function hasDeliverTo(req, res, next) {
  const { data: { deliverTo } = {} } = req.body;

  if (!deliverTo || deliverTo.trim() === "") {
    return next({ status: 400, message: "Order must include a deliverTo" });
  }

  next();
}

// ------- MIDDLEWARE FOR VALIDATION ------- //
function hasMobileNumber(req, res, next) {
  const { data: { mobileNumber } = {} } = req.body;

  if (!mobileNumber || mobileNumber.trim() === "") {
    return next({ status: 400, message: "Order must include a mobileNumber" });
  }

  next();
}

// ------- MIDDLEWARE FOR VALIDATION ------- //
function hasDishes(req, res, next) {
  const { data: { dishes } = [] } = req.body;

  if (!dishes) {
    return next({ status: 400, message: "Order must include a dish" });
  }

  if (!Array.isArray(dishes) || dishes.length === 0) {
    return next({
      status: 400,
      message: "Order must include at least one dish",
    });
  }

  next();
}

// ------- MIDDLEWARE FOR VALIDATION ------- //
function hasDishQuantity(req, res, next) {
  const { data: { dishes = [] } = {} } = req.body;

  for (let i = 0; i < dishes.length; i++) {
    const quantity = dishes[i].quantity;

    if (!quantity) {
      return next({
        status: 400,
        message: `Dish ${i} must have a quantity that is an integer greater than 0`,
      });
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      return next({
        status: 400,
        message: `Dish ${i} must have a quantity that is an integer greater than 0`,
      });
    }
  }

  next();
}

// ------- MIDDLEWARE FOR VALIDATION ------- //
function orderExists(req, res, next) {
  const orderId = req.params.orderId;
  const foundOrder = orders.find((order) => order.id === orderId);

  if (foundOrder) {
    res.locals.order = foundOrder;
    return next();
  }

  next({ status: 404, message: `Order does not exist: ${orderId}` });
}

// ------- MIDDLEWARE FOR VALIDATION ------- //
function hasStatus(req, res, next) {
  const order = res.locals.order;
  const { data: { status } = {} } = req.body;

  if (!status || status === "") {
    return next({
      status: 400,
      message:
        "Order must have a status of pending, preparing, out-for-delivery, delivered",
    });
  }

  if (order.status === "delivered") {
    return next({
      status: 400,
      message: "A delivered order cannot be changed",
    });
  }

  // TO CHECK IF STATUS IS "VALID"
  const validStatuses = [
    "pending",
    "preparing",
    "out-for-delivery",
    "delivered",
  ];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ data: undefined, error: "Invalid status" });
  }

  next();
}

// ------- CONTROLLER TO HANDLE "POST" REQUESTS ------- //
function create(req, res, next) {
  const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;

  const newOrder = {
    id: nextId(), // HELPER FUNCTION TO CREATE A "UNIQUE" ID
    deliverTo,
    mobileNumber,
    status,
    dishes,
  };
  orders.push(newOrder);

  res.status(201).json({ data: newOrder });
}

// ------- CONTROLLER TO HANDLE "SPECIFIC" "GET" REQUESTS ------- //
function read(req, res) {
  const order = res.locals.order;
  res.json({ data: order });
}

// -------- CONTROLLER TO HANDLE "PUT" REQUESTS ------- //
function update(req, res, next) {
  const orderId = req.params.orderId;
  const order = res.locals.order;
  const { data: { id, deliverTo, mobileNumber, status, dishes } = {} } =
    req.body;

  if (id && id !== orderId) {
    return next({
      status: 400,
      message: `Order id does not match route id. Order: ${id}, Route: ${orderId}`,
    });
  }

  order.deliverTo = deliverTo;
  order.mobileNumber = mobileNumber;
  order.dishes = dishes;
  order.status = status;

  res.json({ data: order });
}

// ------- CONTROLLER TO HANDLE "DELETE" REQUESTS ------- //
function destroy(req, res, next) {
  const order = res.locals.order;

  if (order.status !== "pending") {
    return next({
      status: 400,
      message: "An order cannot be deleted unless it is pending",
    });
  }

  const index = orders.findIndex((order) => order.id === order.id);
  orders.splice(index, 1);

  res.status(204).json({ message: "Order deleted successfully" });
}

// ------- RUN MIDDLEWARE BEFORE REQUEST ------- //
module.exports = {
  list,
  create: [hasDeliverTo, hasMobileNumber, hasDishes, hasDishQuantity, create],
  read: [orderExists, read],
  update: [
    orderExists,
    hasDeliverTo,
    hasMobileNumber,
    hasDishes,
    hasDishQuantity,
    hasStatus,
    update,
  ],
  delete: [orderExists, destroy],
};
