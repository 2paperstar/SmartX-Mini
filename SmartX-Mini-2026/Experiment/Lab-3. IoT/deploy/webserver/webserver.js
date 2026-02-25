var http = require("http");
var url = require("url");
var fs = require("fs");

http
  .createServer(function (request, response) {
    const parseUrl = url.parse(request.url, true);
    const pathname = parseUrl.pathname;
    const query = parseUrl.query;

    if (pathname === "/update") {
      if (Object.keys(query).length > 0) {
        fs.writeFile("temp.txt", JSON.stringify(query), "utf8", (error) => {
          if (error) {
            console.error("Error writing file:", error);
            response.writeHead(500, { "Content-Type": "application/json" });
            response.end(
              JSON.stringify({
                status: "error",
                message: "Failed to save data",
              })
            );
            return;
          }
          console.log("Data saved:", query);
          response.writeHead(200, { "Content-Type": "application/json" });
          response.end(
            JSON.stringify({
              status: "success",
              message: "Data saved successfully",
            })
          );
        });
      } else {
        response.writeHead(400, { "Content-Type": "application/json" });
        response.end(
          JSON.stringify({ status: "error", message: "No data provided" })
        );
      }
    } else {
      fs.readFile("temp.txt", "utf8", (error, data) => {
        if (error) {
          console.error("Error reading file:", error);
          response.writeHead(500, { "Content-Type": "application/json" });
          response.end(
            JSON.stringify({ status: "error", message: "Failed to read data" })
          );
          return;
        }
        console.log("Fetched data:", data);
        response.writeHead(200, { "Content-Type": "application/json" });
        response.end(data);
      });
    }
  })
  .listen(80, function () {
    console.log("Server running on port 80");
  });
