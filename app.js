const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.set("view engine","ejs");

mongoose.set('strictQuery', false);
mongoose.connect('mongodb+srv://admin-vreddy:Sinreddy-1910@vishnu.1sudniy.mongodb.net/todolistDB');

const itemsSchema = new mongoose.Schema({
    name:String
});

const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item({name:"Welcome to ToDo list App."});
const item2 = new Item({name:"Hit the + button to add an item."});
const item3 = new Item({name:"<-- Hit this to delete the item."});

const defaultItems = [item1,item2,item3];

const listSchema = new mongoose.Schema({
    name:String,
    items:[itemsSchema]
});

const List = mongoose.model("List",listSchema);

//GET REQUESTS
app.get("/",function (req,res) {  

    Item.find({},(err,items)=>{

        if(items.length===0){
            Item.insertMany(defaultItems,(err)=>{
                if(err){
                    console.log(err);
                }
            });
            res.redirect("/");

        }else{

            res.render("list",{TitleHeading:"Today",newListItems:items});

        }
    });

});
app.get("/:customListName",function (req,res) {
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name:customListName},(err,foundList)=>{
        if(!err){
            if(!foundList){
                // create a list
                const list1 = new List({
                    name:customListName,
                    items:defaultItems
                });
                list1.save();
                res.redirect(`/${list1.name}`)
            }else{
                //show the list
                res.render("list",{TitleHeading:`${foundList.name}`,newListItems:foundList.items});
            }
        }
    });

});
app.get("/about",function (req,res) {
    res.render("about");
});


//POST REQUESTS
app.post("/",function (req,res) {
    const item = req.body.newItem;
    const listName = req.body.list;

    const newItem = new Item({name:item});
    if(listName === "Today"){
        newItem.save();
        res.redirect("/");
    }else{
        List.findOne({name:listName},(err,foundList)=>{
            foundList.items.push(newItem);
            foundList.save();
            res.redirect("/"+listName);
        });
    }
});

app.post("/delete",function (req,res) {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;
    if(listName === "Today"){
        Item.findByIdAndRemove(checkedItemId,(err)=>{
            if (!err) {
                res.redirect("/");
            }
        });
    }else{
        List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},(err)=>{
            if (!err) {
                res.redirect("/"+listName);
            }
        });
    }
});



app.listen(3000,function () {
    console.log("Server has started at port 3000");
});