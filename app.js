const express = require("express");
const bodyParser = require("body-parser");

// Add date as a module
const date = require(__dirname + "/date.js");

const app = express();

const items = ["Buy food", "Cook food", "Eat food"];
const workItems = []

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", function (req, res) {

    let day = date.getDate();

    res.render("list", { listTitle: day, newListItems: items });
});

app.post("/", function (req, res) {
    let item = req.body.NewItem;
    console.log(req.body.list)

    if (req.body.list === "Work List") {
        workItems.push(item)
        res.redirect("/work")
    } else {
        items.push(item)
        res.redirect("/")
    }
});

app.get("/work", function (req, res) {
    res.render("list", { listTitle: "Work List", newListItems: workItems });
});

app.get("/about", function (req, res) {
    res.render("about");
});

app.listen(3000, function () {
    console.log("Server started on port 3000.");
});