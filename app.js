const express = require("express");
const body_parser = require("body-parser");
const path = require("path");

require("dotenv").config();

const Notes = require("./database");
const updateRouter = require("./update-router");
const app = express();

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.use(body_parser.urlencoded({ extended: true }));
app.use(body_parser.json());
app.use("/updatepage", updateRouter);
app.use((req, res, next) => {
  console.log(req.method + " : " + req.url);
  next();
});

app.get("/", (req, res, next) => {
  res.redirect("/index");
});

app
  .route("/notes-add")
  .get((req, res, next) => {
    res.render("notes-add");
  })
  .post((req, res, next) => {
    console.log(req.body);
    const Note = new Notes({});

    Note.title = req.body.title;
    Note.description = req.body.description;
    //save notes first
    Note.save((err, product) => {
      if (err) console.log(err);
      console.log(product);
    });
    res.redirect("/index");
  });

app.get("/index", (req, res, next) => {
  Notes.find({}).exec((err, document) => {
    if (err) console.log(err);
    let Data = [];
    document.forEach((value) => {
      Data.push(value);
    });
    res.render("view", { data: Data });
  });
});

app.get("/delete/:__id", (req, res, next) => {
  Notes.findByIdAndRemove(
    req.params.__id,
    { useFindAndModify: false },
    (err, document) => {
      if (err) console.log(err);
      console.log(document);
    }
  );
  res.redirect("/index");
});

app.get("/updatepage/:__id", (req, res) => {
  console.log("id for get request: " + req.id);
  Notes.findById(req.id, (err, document) => {
    console.log(document);

    res.render("updatepage", { data: document });
  });
});

app.post("/updatepage", (req, res, next) => {
  console.log("id: " + req.id);
  Notes.findByIdAndUpdate(
    req.id,
    { title: req.body.title, description: req.body.description },
    { useFindAndModify: false },
    (err, document) => {
      console.log("updated");
    }
  );
  res.redirect("/index");
  return next();
});

// CRUD operations for Notes schema
// Create
app.post("/api/note", (req, res, next) => {
  const { title, description } = req.body;
  const note = new Notes({ title, description });
  note.save((err, note) => {
    if (err) return next(err);
    res.status(201).json({});
  });
});

// Read
// Read by id
app.get("/api/note/:id", (req, res, next) => {
  const { id } = req.params;
  Notes.findById(id, (err, note) => {
    if (err) return next(err);
    res.status(201).json(note);
  });
});
// Read all
app.get("/api/note", (req, res, next) => {
  Notes.find({}, (err, notes) => {
    if (err) return next(err);
    res.status(201).json(notes);
  });
});

// Update
app.put("/api/note/:id", (req, res, next) => {
  const { id } = req.params;
  const { title, description } = req.body;
  Notes.findByIdAndUpdate(
    id,
    { title, description },
    { new: true },
    (err, document) => {
      if (err) return next(err);
      res.status(200).json(req.body);
    }
  );
});
// Delete
app.delete("/api/note/:id", (req, res, next) => {
  const { id } = req.params;
  Notes.findByIdAndRemove(id, { useFindAndModify: false }, (err, document) => {
    if (err) return next(err);
    res
      .status(500)
      .json({ deleted: true, document, message: "Note deleted successfully" });
  });
});

module.exports = app;
