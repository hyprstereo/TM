"use strict"; // https://www.w3schools.com/js/js_strict.asp
require("dotenv").config();
const express = require("express");
const path = require("path");
const app = express();
const http = require("http");
const server = http.createServer(app);
const cors = require("cors");
var PORT = process.env.PORT || 8000; // signalingServerPort
var localHost = "http://localhost:" + PORT; // http

// Use all static files from the www folder
const content = path.join(__dirname, process.env.STATIC  || "www")
app.use(cors({ origin: ["*"] }));
app.use(express.static(content));

// Remove trailing slashes in url
app.use(function (req, res, next) {
  if (req.path.substr(-1) === "/" && req.path.length > 1) {
    let query = req.url.slice(req.path.length);
    res.redirect(301, req.path.slice(0, -1) + query);
  } else {
    next();
  }
});

server.listen(PORT, null, function () {
  logme(
    `%c
http://localhost:${PORT}/
static: ${content}

    ████████╗███╗   ███╗     ██████╗ ███╗   ██╗███████╗    ███████╗██╗  ██╗██████╗
    ╚══██╔══╝████╗ ████║    ██╔═══██╗████╗  ██║██╔════╝    ██╔════╝╚██╗██╔╝██╔══██╗
       ██║   ██╔████╔██║    ██║   ██║██╔██╗ ██║█████╗      █████╗   ╚███╔╝ ██████╔╝
       ██║   ██║╚██╔╝██║    ██║   ██║██║╚██╗██║██╔══╝      ██╔══╝   ██╔██╗ ██╔══██╗
       ██║   ██║ ╚═╝ ██║    ╚██████╔╝██║ ╚████║███████╗    ███████╗██╔╝ ██╗██║  ██║
       ╚═╝   ╚═╝     ╚═╝     ╚═════╝ ╚═╝  ╚═══╝╚══════╝    ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝
                                                                                    started...

	`,
    "font-family:monospace"
  );
});
/*
app.get(["/"], (req, res) =>
  res.sendFile(path.join(__dirname, "www/client.html"))
); */

app.get(["/"], (req, res) =>
  res.sendFile(path.join(__dirname, "www/index.html"))
);

// // join to room
// app.get("/join/*", function (req, res) {
//   if (Object.keys(req.query).length > 0) {
//     logme("redirect:" + req.url + " to " + url.parse(req.url).pathname);
//     res.redirect(url.parse(req.url).pathname);
//   } else {
//     res.sendFile(path.join(__dirname, "www/client.html"));
//   }
// });

/**
 * log with UTC data time
 * @param {*} msg message any
 * @param {*} op optional params
 */
function logme(msg, op = "") {
  let dataTime = new Date().toISOString().replace(/T/, " ").replace(/Z/, "");
  console.log("[" + dataTime + "] " + msg, op);
}
