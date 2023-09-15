/* eslint-disable */
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const Notes = require('./database');
const updateRouter = require('./update-router');
const app = express();

const { NodeTracerProvider } = require('@opentelemetry/node');
const { SimpleSpanProcessor } = require('@opentelemetry/sdk-trace-base');
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');
const { trace } = require('@opentelemetry/api');

// Set up the tracer provider and exporter
const provider = new NodeTracerProvider();
const exporter = new JaegerExporter({
  serviceName: 'middleware',
  headers: {

  }, // an optional object containing custom headers to be sent with each request
  concurrencyLimit: 10, // an optional limit on pending requests
});
const tracer = trace.getTracer('middleware');

// Create a span processor and register it with the tracer provider
const spanProcessor = new SimpleSpanProcessor(exporter);
provider.addSpanProcessor(spanProcessor);

// Set the tracer provider as the global tracer provider
provider.register();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use((req, res, next) => {
  const span = tracer.startSpan(req.path);
  // Call next middleware or route handler
  span.addEvent('error', { ip: req.ip });
  return next();

});

app.use('/updatepage', updateRouter);

app.get('/', (req, res, next) => {
  const span = tracer.startSpan('root span');
  info(span, req);
  span.addEvent('request-started', { path: req.path });

  res.redirect('/index');
  next();
  span.end();

});

app
  .route('/notes-add')
  .get((req, res, next) => {
    const span = tracer.startSpan('add-note');
    info(span, req);
    res.render('notes-add');
    span.end();
  })
  .post((req, res, next) => {
    const span = tracer.startSpan('create-note');
    info(span, req);

    console.log(req.body);
    const Note = new Notes({});

    Note.title = req.body.title;
    Note.description = req.body.description;
    // save notes first
    Note.save((err, product) => {
      if (err) console.log(err);
      console.log(product);
    });
    res.redirect('/index');
    next();
    span.end();
  });

app.get('/index', (req, res, next) => {
  const span = tracer.startSpan('view-notes');
  info(span, req);
  Notes.find({}).exec((err, document) => {
    span.addEvent('view-notes', { data: document, "hola": "buenas" });

    if (err) console.log(err);
    const Data = [];
    document.forEach((value) => {
      Data.push(value);
    });
    res.render('view', { data: Data });
    next();
    span.end();
  });

});

app.get('/delete/:__id', (req, res, next) => {
  const span = tracer.startSpan('delete-note');
  info(span, req);
  Notes.findByIdAndRemove(
    req.params.__id,
    { useFindAndModify: false },
    (err, document) => {
      if (err) console.log(err);
      console.log(document);
    },
  );
  res.redirect('/index');
  next();

  span.end();
});

app.get('/updatepage/:__id', (req, res) => {
  const span = tracer.startSpan('update-note');
  info(span, req);
  console.log('id for get request: ' + req.id);
  Notes.findById(req.id, (err, document) => {
    console.log(document);

    res.render('updatepage', { data: document });

  });

  span.end();
});

app.post('/updatepage', (req, res, next) => {
  const span = tracer.startSpan('update-page');
  info(span, req);
  console.log('id: ' + req.id);
  Notes.findByIdAndUpdate(
    req.id,
    { title: req.body.title, description: req.body.description },
    { useFindAndModify: false },
    (err, document) => {
      console.log('updated');
    },
  );
  res.redirect('/index');
  next();

  span.end();
});

// CRUD operations for Notes schema
// Create
app.post('/api/note', (req, res, next) => {
  const span = tracer.startSpan('crud-create-note');
  const { title, description } = req.body;
  const note = new Notes({ title, description });
  note.save((err, note) => {
    if (err) return next(err);
    res.status(201).json(note); // Include the created note in the response
  });
  span.end();
});

// Read
// Read by id
app.get('/api/note/:id', (req, res, next) => {
  const span = tracer.startSpan('crud-read-note');
  const { id } = req.params;
  Notes.findById(id, (err, note) => {
    if (err) return next(err);
    res.status(200).json(note);
  });


  span.end();
});
// Read all
app.get('/api/note', (req, res, next) => {
  const span = tracer.startSpan('crud-read-all-notes');

  Notes.find({}, (err, notes) => {
    if (err) return next(err);
    res.status(200).json(notes);
  });
  span.end();
});

// Update
app.put('/api/note/:id', (req, res, next) => {
  const span = tracer.startSpan('crud-update-note');
  const { id } = req.params;
  const { title, description } = req.body;
  Notes.findByIdAndUpdate(
    id,
    { title, description },
    { new: true },
    (err, document) => {
      if (err) return next(err);
      res.status(200).json(req.body);
    },
  );
  span.end();
});
// Delete
app.delete('/api/note/:id', (req, res, next) => {
  const span = tracer.startSpan('crud-delete-note');
  const { id } = req.params;
  Notes.findByIdAndRemove(id, { useFindAndModify: false }, (err, document) => {
    if (err) return next(err);
    res
      .status(500)
      .json({ deleted: true, document, message: 'Note deleted successfully' });
  });
  span.end();
});

// const logRequest = (req, res, next) => {
//   // Get the client's IP address
//   const ip = req.ip;

//   // Get the request method and URL
//   const method = req.method;
//   const url = req.url;

//   // Get the query parameters
//   const queryParams = req.query;

//   // Get the request body
//   const requestBody = req.body;

//   // Log the information
//   console.log(`Request made - IP: ${ip}, Method: ${method}, URL: ${url}`);
//   console.log('Query Parameters:', queryParams);
//   console.log('Request Body:', requestBody);

//   // Call the next middleware function
//   next();
// };
const info = (span, req) => {
  span.addEvent("Information", {
    "web-browser": req.headers['user-agent'],
    "ip": req.ip, "params": JSON.stringify(req.params), "body": JSON.stringify(req.body)
  });
}
module.exports = app;
