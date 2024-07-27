const express = require("express");
const axios = require("axios");
const _ = require("lodash");

const router = express.Router();

const baseURL = `https://${process.env.DOMAIN}/admin/api/${process.env.API_VERSION}`;
const http = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
    "X-Shopify-Access-Token": process.env.API_ACCESS_TOKEN,
  },
});

router.get("/healthCheck", (req, res) => {
  const healthCheck = {
    uptime: process.uptime(),
    timeStamp: Date.now(),
    message: "OK",
  };
  return res.status(200).json(healthCheck);
});

router.post("/placeCustomerOrder", async (req, res, next) => {
  try {
    let { customer, order } = req.body;
    if (!(customer.email && customer.phone))
      throw new Error("Email and phone are mandatory parameters!");
    const customerResponse = await http.post(`${baseURL}/customers.json`, {
      customer,
    });
    if (_.get(customerResponse, "data.customer.id")) {
      order.customer = customer;
      order.email = customer.email;
      const orderResponse = await http.post(`${baseURL}/orders.json`, {
        order,
      });
      if (_.get(orderResponse, "data.order.id"))
        return res
          .status(200)
          .json({ message: "Order placed successfully for the customer!" });
      else throw new Error("Failed to create order!");
    } else {
      throw new Error("Failed to create customer!");
    }
  } catch (error) {
    next(error);
  }
});

router.get("/getAllCustomersOrders", async (req, res, next) => {
  try {
    const allCustomers = await http.get(`${baseURL}/customers.json`);
    const customers = _.get(allCustomers, "data.customers");
    if (customers.length === 0) return res.send(customers);
    const orderPromises = customers.map(async (customer) => {
      try {
        const orderResponse = await http.get(
          `${baseURL}/orders.json?customer_id=${_.get(customer, "id")}`
        );
        return { ...customer, orders: _.get(orderResponse, "data.orders") };
      } catch (err) {
        return { ...customer, orders: [] };
      }
    });

    const customerWithOrder = await Promise.all(orderPromises);
    console.log(
      `Fetched ${customerWithOrder.length} customers and their orders.`
    );
    return res.json(customerWithOrder);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
