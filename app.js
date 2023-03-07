const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
// Import lodash
const _ = require("lodash");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Create a db for tasks
mongoose.connect('mongodb+srv://lasantha-admin:oorrio62MsiFYPhf@cluster0.ctyjgpw.mongodb.net/todolistDB');

const itemsSchema = new mongoose.Schema({
    name: String
});

const Item = mongoose.model("Item", itemsSchema);

// Default items to add to an empty List
const item1 = new Item({
    name: "Welcome to your todolist!"
});

const item2 = new Item({
    name: "Hit the + button to add a new item."
});

const item3 = new Item({
    name: "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemsSchema]
};

// Custom list for different ToDo Lists 
const List = mongoose.model("List", listSchema);

app.get("/", (req, res) => {

    Item.find({})
        .then((items) => {
            if (items.length === 0) {
                Item.insertMany(defaultItems)
                    .then(() => {
                        console.log("Successfully saved default items to the DB.");
                        res.redirect("/")
                    })
            } else {
                res.render("list", { listTitle: "Today", newListItems: items });
            }
        })

});

app.post("/", function (req, res) {
    const itemName = req.body.NewItem;
    const listName = req.body.list;

    const item = new Item({
        name: itemName
    });

    if (listName === "Today") {
        item.save();
        res.redirect("/");
    } else {
        List.findOne({ name: listName })
            .then((foundList) => {
                foundList.items.push(item);
                foundList.save();
                res.redirect("/" + listName);
            });
    }
});

app.post("/delete", (req, res) => {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === "Today") {
        Item.findByIdAndRemove({ _id: checkedItemId })
            .then((query) => {
                console.log("Successfully deleted checked item.");
                res.redirect("/")
            });
    } else {
        List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } })
            .then((query) => {
                res.redirect("/" + listName);
            });
    }
});

app.get("/:customListName", (req, res) => {

    let customListName = _.capitalize(req.params.customListName);

    List.findOne({ name: customListName })
        .then((foundList) => {
            console.log(foundList);
            if (foundList === null) {
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });

                list.save();
                res.redirect("/" + customListName);
            } else {
                res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
            }
        });
});

app.get("/about", function (req, res) {
    res.render("about");
});

app.listen(3000, function () {
    console.log("Server started on port 3000.");
});