const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;

app.use(cors({}));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});
// mongodb connection
const uri = process.env.MONGO_URI;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server
    await client.connect();
    //database collections
    const usersCollection = client.db("nutriglow").collection("users");
    const cartsCollection = client.db("nutriglow").collection("carts");
    //save user data
    app.post("/users", async (req, res) => {
      try {
        const user = req.body;
        const query = { email: user.email };
        const existUser = await usersCollection.findOne(query);
        if (existUser) {
          return res.send({ message: "User Already Exits", insurtedId: null });
        }
        const result = await usersCollection.insertOne(user);
        res.send(result);
      } catch (err) {
        res.send(500).send({ message: "failed to add user" });
      }
    });
    //gets users
    app.get("/users", async (req, res) => {
      const email = req.query.email;
      const query = {'userData.email' : email};
      const result = await usersCollection.find(query).toArray();
      res.send(result);
    });
    //get cart
    app.get("/cart", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const result = await cartsCollection.find(query).toArray();
      res.send(result);
    });
    //post cart
    app.post("/cart", async (req, res) => {
      const cart = req.body;
      const result = cartsCollection.insertOne(cart);
      res.send(result);
    });
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
  } finally {
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});
