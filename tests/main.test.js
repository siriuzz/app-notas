const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../app");

require("dotenv").config();

const { MONGO_DB_USR, MONGO_DB_PWD, MONGO_DB_HOST, MONGO_DB_PORT } =
  process.env;
const credentials = MONGO_DB_USR ? `${MONGO_DB_USR}:${MONGO_DB_PWD}@` : "";
const mongoURI = `mongodb://${credentials}${MONGO_DB_HOST}:${MONGO_DB_PORT}/`;

/* Connecting to the database before each test. */
beforeAll(async () => {
    await mongoose.connect(mongoURI);
});

afterAll(async () => {
    // Closing the DB connection allows Jest to exit successfully.
    try {
        await mongoose.connection.close();
    } catch (error) {
        console.log(error);
    }
});

/* Testing the API endpoints. */

describe("GET /", () => {
  // We're getting / which redirects to /index which renders the view page
  it("should return the view page", async () => {
    const res = await request(app).get("/");
    // TODO: Change status code to 200
    expect(res.statusCode).toBe(302);
  });
});

// Let's test the CRUD operations under /api/note
describe("POST /api/note", () => {
    it("should create a new note", async () => {
        const res = await request(app).post("/api/note").send({
            title: "Test Title",
            description: "Test Description",
        });
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty("title");
        expect(res.body).toHaveProperty("description");
    });
});

describe("GET /api/note", () => {
    it("should return all notes", async () => {
        const res = await request(app).get("/api/note");
        expect(res.statusCode).toBe(200);
        expect(res.body).toBeDefined();
        expect(res.body.length).toBeGreaterThanOrEqual(1);
    });
});

describe("GET /api/note/:id", () => {
    it("should return a note by id", async () => {
        const res = await request(app).get("/api/note");
        expect(res.statusCode).toBe(200);
        // Pick the id of any note
        const id = res.body[0]._id;
        const res2 = await request(app).get(`/api/note/${id}`);
        expect(res2.statusCode).toBe(200);
        expect(res2.body).toHaveProperty("title");
        expect(res2.body).toHaveProperty("description");
    });
});

describe("PUT /api/note/:id", () => {
    it("should update a note by id", async () => {
        const res = await request(app).get("/api/note");
        expect(res.statusCode).toBe(200);
        // Pick the id of any note
        const { _id, title, description } = res.body[0];
        // Let's generate a random title
        const newTitle = Math.random().toString(36).substring(7);
        const res2 = await request(app)
            .put(`/api/note/${_id}`)
            .send({ title: newTitle, description });
        expect(res2.statusCode).toBe(200);
        expect(res2.body).toHaveProperty("title");
        expect(res2.body.title).toBe(newTitle);
    });
});

describe("DELETE /api/note/:id", () => {
    it("should delete a note by id", async () => {
        const res = await request(app).get("/api/note");
        expect(res.statusCode).toBe(200);
        // Pick the id of any note
        const id = res.body[0]._id;
        const res2 = await request(app).delete(`/api/note/${id}`);
        expect(res2.statusCode).toBe(200);
    });
});
