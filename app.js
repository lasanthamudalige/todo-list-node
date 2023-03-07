const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
// Import lodash
const _ = require("lodash");
// Import dotenv from .env file
require('dotenv').config();

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Create a db for tasks in mongo atlas
mongoose.connect('mongodb+srv://' + process.env.USER + '-admin:' + process.env.PASSWORD + '@cluster0.ctyjgpw.mongodb.net/todolistDB',
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });

// Table structure for items
const itemsSchema = new mongoose.Schema({
    name: String
});

// Create a table for items
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

// Lists for custom task lists

const listSchema = {
    name: String,
    items: [itemsSchema]
};

// Custom list for different ToDo Lists 
const List = mongoose.model("List", listSchema);

app.get("/", (req, res) => {

    // Mongoose find method
    Item.find({})
        .then((items) => {
            // If items are empty insert default items and redirect to home route
            if (items.length === 0) {
                Item.insertMany(defaultItems)
                    .then(() => {
                        console.log("Successfully saved default items to the DB.");
                        res.redirect("/");
                    })
                // Else render existing items   
            } else {
                res.render("list", { listTitle: "Today", newListItems: items });
            }
        })

});

app.post("/", function (req, res) {
    // Get items name and list name from list.ejs
    const itemName = req.body.NewItem;
    const listName = req.body.list;

    const item = new Item({
        name: itemName
    });

    //  If list name it 'Today' save it directly
    if (listName === "Today") {
        item.save();
        res.redirect("/");
    } else {
        // If it is in a different list add it to that 'list.items' array
        List.findOne({ name: listName })
            .then((foundList) => {
                foundList.items.push(item);
                foundList.save();
                res.redirect("/" + listName);
            });
    }
});

app.post("/delete", (req, res) => {
    /// Check button will work as a submit button
    // Get check button status and list name from list.ejs
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    // If task is in 'Today' list remove it from id
    if (listName === "Today") {
        // Mongoose remove method by using id
        Item.findByIdAndRemove({ _id: checkedItemId })
            .then((query) => {
                console.log("Successfully deleted checked item.");
                res.redirect("/")
            });
    } else {
        // Else Get the list from lists and remove item from the item array 
        List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } })
            .then((query) => {
                res.redirect("/" + listName);
            });
    }
});

app.get("/:customListName", (req, res) => {
    // Get custom list name from the url parameters
    let customListName = _.capitalize(req.params.customListName);

    // Mongoose find method for single item
    List.findOne({ name: customListName })
        .then((foundList) => {
            // If list was not found create a new list and add default items to that list
            if (foundList === null) {
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });

                list.save();
                res.redirect("/" + customListName);
                // Else load that found list
            } else {
                res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
            }
        });
});

app.get("/about", function (req, res) {
    res.render("about");
});

// Port
app.listen(3000, function () {
    console.log("Server started on port 3000.");
});