const path = require("path");
const dishes = require(path.resolve("src/data/dishes-data"));
const nextId = require("../utils/nextId"); // IMPORTED HELPER FUNCTION

// ------- CONTROLLER TO HANDLE "GET" REQUEST -------//
const list = (req, res) => res.json({ data: dishes });

// ------- MIDDLEWARE FOR VALIDATION ------- //
function hasName(req, res, next) {
  const { data: { name } = {} } = req.body;

  if (!name || name.trim() === "") {
    return next({ status: 400, message: "Dish must include a name" });
  }

  next();
}

// ------- MIDDLEWARE FOR VALIDATION ------- //
function hasDescription(req, res, next) {
  const { data: { description } = {} } = req.body;

  if (!description || description.trim() === "") {
    return next({ status: 400, message: "Dish must include a description" });
  }

  next();
}

// ------- MIDDLEWARE FOR VALIDATION ------- //
function hasPrice(req, res, next) {
  const { data: { price } = {} } = req.body;

  if (!price) {
    return next({ status: 400, message: "Dish must include a price" });
  }

  if (isNaN(price) || price <= 0 || !Number.isInteger(price)) {
    return next({
      status: 400,
      message: "Dish must have a price that is an integer greater than 0",
    });
  }

  next();
}

// ------- MIDDLEWARE FOR VALIDATION ------- //
function hasImage(req, res, next) {
  const { data: { image_url } = {} } = req.body;

  if (!image_url || image_url.trim() === "") {
    return next({ status: 400, message: "Dish must include a image_url" });
  }

  next();
}

// ------- MIDDLEWARE FOR VALIDATION ------- //
function dishExists(req, res, next) {
  const dishId = req.params.dishId;
  const foundDish = dishes.find((dish) => dish.id === dishId);

  if (foundDish) {
    res.locals.dish = foundDish;
    return next();
  }

  next({ status: 404, message: `Dish does not exist: ${dishId}` });
}

// ------- CONTROLLER TO HANDLE "POST" REQUESTS ------- //
function create(req, res, next) {
  const { data: { name, description, price, image_url } = {} } = req.body;

  const newDish = {
    id: nextId(), // HELPER FUNCTION TO CREATE A "UNIQUE" ID
    name,
    description,
    price,
    image_url,
  };
  dishes.push(newDish);

  res.status(201).json({ data: newDish });
}

// ------- CONTROLLER TO HANDLE "SPECIFIC" "GET" REQUESTS ------- //
function read(req, res) {
  const dish = res.locals.dish;
  res.json({ data: dish });
}

// -------- CONTROLLER TO HANDLE "PUT" REQUESTS ------- //
function update(req, res, next) {
  const dish = res.locals.dish;
  const { data: { id, name, description, price, image_url } = {} } = req.body;

  if (id && id !== dish.id) {
    return next({
      status: 400,
      message: `Dish id does not match route id. Dish: ${id}, Route: ${dish.id}`,
    });
  }

  dish.name = name;
  dish.description = description;
  dish.price = price;
  dish.image_url = image_url;

  res.json({ data: dish });
}

// ------- RUN MIDDLEWARE BEFORE REQUEST ------- //
module.exports = {
  list,
  create: [hasName, hasDescription, hasPrice, hasImage, create],
  read: [dishExists, read],
  update: [dishExists, hasName, hasDescription, hasPrice, hasImage, update],
};
