const express = require("express");
const cors = require("cors");
const errorHandler = require("./errors/errorHandler");
const notFound = require("./errors/notFound");
const ordersRouter = require("./orders/orders.router");
const dishesRouter = require("./dishes/dishes.router");

const app = express();

app.use(cors());
app.use(express.json());

// ------- ROUTE HANDLERS ------- //
app.use("/dishes", dishesRouter);
app.use("/orders", ordersRouter);

app.use(notFound); // MIDDLEWARE CALLED TO HANDLE ROUTE ERRORS

app.use(errorHandler); // MIDDLEWARE CALLED TO HANDLE ANY OTHER ERRORS

module.exports = app;
