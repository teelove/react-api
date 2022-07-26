var express = require("express");
var cors = require("cors");
var app = express();

// get the client
const mysql = require("mysql2");

// create the connection to database
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "travel",
});

app.use(cors());
app.get("/api/attractions", function (req, res, next) {
  const page = parseInt(req.query.page);
  const per_page = parseInt(req.query.per_page);

  const sort_column = req.query.sort_column;
  const sort_direction = req.query.sort_direction;

  const search = req.query.search;

  const start_idx = (page - 1) * per_page;

  var sql = "SELECT * FROM attractions";

  var param = [];

  if (search) {
    sql += " WHERE name LIKE ?";
    param.push("%" + search + "%");
  }

  if (sort_column) {
    sql += " ORDER BY " + sort_column + " " + sort_direction;
  }

  sql += " LIMIT ?, ?";

  param.push(start_idx);
  param.push(per_page);

  // execute will internally call prepare and query
  connection.execute(sql, param, function (err, results, fields) {
    console.log(results); // results contains rows returned by server
    // simple query
    connection.query(
      'SELECT COUNT(id) as total FROM attractions',
      function (err, counts, fields) {
        const total = counts[0]['total'];
        const total_pages = Math.ceil(total/per_page);
        res.json({
          page: page,
          per_page: per_page,
          total: total,
          total_pages: total_pages,
          data: results,
        });
      }
    );
    // If you execute same statement again, it will be picked from a LRU cache
    // which will save query preparation time and give better performance
  });
});

app.listen(5000, function () {
  console.log("CORS-enabled web server listening on port 80");
});
