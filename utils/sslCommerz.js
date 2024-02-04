const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const initSslCommerz = async (data) => {
  const body = new FormData();

  for (const key in data) {
    body.append(key, data[key]);
  }

  const sslResponse = await fetch(
    "https://sandbox.sslcommerz.com/gwprocess/v4/api.php",
    // "https://securepay.sslcommerz.com/gwprocess/v4/api.php",
    {
      method: "POST",
      body,
    }
  );
  const { GatewayPageURL } = await sslResponse.json();
  return GatewayPageURL;
};

module.exports = initSslCommerz;
