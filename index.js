const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const app = express();
const url = require("url");
const initSslCommerz = require("./utils/sslCommerz");
const generateTransID = require("./utils/generateTransId");
const port = process.env.PORT || 4000;
require("dotenv").config();

// Middleware
app.use(cors());
app.use(express.json());

// database connect
const dbConnection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "raihan",
});

app.get("/", (req, res) => {
  res.send("Server is running...");
});

app.get("/db", (req, res) => {
  dbConnection.query("SELECT * FROM tmi", (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
      // console.log(result);
    }
  });
});

app.get("/user", (req, res) => {
  dbConnection.query("SELECT * FROM login", (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
      // console.log(result)
    }
  });
});


app.post("/sign", (req, res) => {
  const sql =
    "INSERT into tmi (`Name`,`Address`,`Email`, `Phone`,`Password`) VALUES(?)";
  const values = [
    req.body.name,
    req.body.address,
    req.body.email,
    req.body.phone,
    req.body.password,
  ];

  dbConnection.query(sql, [values], (err, data) => {
    if (err) return res.json("Error");
    return res.json(data);
  });
});

app.post("/login", (req, res) => {
  const sql = "INSERT into login (`Name`,`Email`,`Password`) VALUES(?)";
  const values = [req.body.name, req.body.email, req.body.password];
  // console.log(values);
  dbConnection.query(sql, [values], (err, data) => {
    if (err) return res.json("Error");
    return res.json(data);
  });
});


// #####################  ssl commerz payment routes ################

// payment init


app.post("/api/payment/init", async (req, res) => {
  const newTransID = generateTransID();
  const body = req.body;
  const { amount, category, name, email } = body;

  const sslInitData = {
    currency: "BDT",
    store_id: process.env.SSL_STORE_ID,
    store_passwd: process.env.SSL_STORE_PASSWORD,
    is_live: process.env.SSL_COMMERZ_IS_LIVE,
    tran_id: newTransID,
    success_url: `${process.env.APP_BASE_URL}/api/payment/success?trans_id=${newTransID}&amount=${amount}&name=${name}`,
    fail_url: `${process.env.APP_BASE_URL}/api/payment/failed?trans_id=${newTransID}&amount=${amount}&name=${name}`,
    cancel_url: `${process.env.APP_BASE_URL}/api/payment/cancel?trans_id=${newTransID}&amount=${amount}&name=${name}`,
    ship_country: "Bangladesh",
    cus_country: "Bangladesh",
    shipping_method: "None",
    product_name: "Donation",
    product_profile: "general",
    ship_add1: "Dhaka",
    ship_city: "Dhaka",
    ship_state: "Dhaka",
    ship_postcode: 1210,
    cus_add1: "Dhaka",
    cus_city: "Dhaka",
    cus_state: "Dhaka",
    cus_postcode: 1110,

    // customize data as your requirements from the frontend body

    total_amount: amount,
    cus_name: name,
    product_category: category,
    cus_email: email,
    cus_phone: "01711111111",
    cus_fax: "01711111111",
    ship_name: "Customer Name",
  };
  console.log(sslInitData);
  try {
    const redirectURL = await initSslCommerz(sslInitData);
    console.log(redirectURL);
    res.send({ message: "Success", status: 200, redirectURL });
  } catch (err) {
    res.send({
      message: "Failed",
      status: 400,
      error: err,
    });
  }
});

// payment success
app.post("/api/payment/success", (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const { trans_id, amount, name } = parsedUrl.query;

  // -------------- payment success now complete your db operation to save it's your db 


  const sql = "INSERT into pay (`Name`,`Amount`,`TransactionID`) VALUES(?)";
  const values = [name, amount, trans_id,];
  // console.log(values);
  dbConnection.query(sql, [values], (err, data) => {
    if (err) return res.json("Error");
    // return res.json(data);
  });



  // ---------------
  res.redirect(
    `http://localhost:3000/payment/success?trans_id=${trans_id}&amount=${amount}&name=${name}`
  );
});


// payment failed

app.post("/api/payment/failed", (req, res) => {
  res.redirect(`http://localhost:3000/payment/fail`);
});

// payment cancel

app.post("/api/payment/cancel", (req, res) => {
  res.redirect(`http://localhost:3000/payment/cancel`);
});


// app 
app.listen(port, () => {
  console.log(`Backend running on ${process.env.APP_BASE_URL}`);
});
