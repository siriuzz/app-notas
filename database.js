const mongoose = require("mongoose");

const NotesSchema = mongoose.Schema({
  title: String,
  description: String,
});

const Notes = mongoose.model("Notes", NotesSchema);

module.exports = Notes;
