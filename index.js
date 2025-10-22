const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");

const uri = "mongodb+srv://admin:123@cluster0.tz018.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);
const dbName = "backend_crud_android_studio";
let db;

async function connectDB() {
    try {
        await client.connect();
        db = client.db(dbName);
        console.log("Conectado a la base de datos");
    } catch (error) {
        console.error("Error al conectar a la base de datos:", error);
    }
}

const app = express();

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.listen(3000, '0.0.0.0', () => {
    console.log("Servidor escuchando en http://0.0.0.0:3000");
});

// GET /rappers
app.get("/rappers", async (req, res) => {
    try {
        const collection = db.collection("cards");
        const rappers = await collection.find({}).toArray();
        
        res.json(rappers);
    } catch (error) {
        res.status(500).json({ error: "Ha habido un error al obtener los datos" });
    }
});

// POST /rappers
app.post("/rappers", async (req, res) => {
    try {
        const { aka, name, album, song } = req.body;
        const collection = db.collection("cards");

        const lastRapper = await collection.find().sort({ id: -1 }).limit(1).toArray();
        const id = lastRapper.length > 0 ? lastRapper[0].id + 1 : 1;

        const newRapper = { id, aka, name, album, song };
        await collection.insertOne(newRapper);
        res.status(201).json({ message: "Los datos han sido insertados correctamente" });
    } catch (error) {
        res.status(500).json({ error: "Ha habido un error al insertar los datos" });
    }
});

// DELETE /rappers/borrar/:id
app.delete("/rappers/borrar/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const collection = db.collection("cards");
        const result = await collection.deleteOne({ id });

        if (result.deletedCount === 0) {
            console.log(`El rapero con ID ${id} no ha sido encontrado`);
            return res.status(404).json({ error: "No se ha encontrado el rapero" });
        } else {
            console.log(`El rapero con ID ${id} ha sido eliminado`);
            return res.json({ message: "El rapero ha sido eliminado correctamente" });
        }
    } catch (error) {
        console.error("Ha habido al eliminar los datos:", error);
        res.status(500).json({ error: "Ha habido un error al eliminar los datos" });
    }
});

// GET /rappers/aka/:aka
app.get("/rappers/aka/:aka", async (req, res) => {
  try {
    const { aka } = req.params;
    const collection = db.collection("cards");

    const regex = new RegExp(aka, "i");

    const rappers = await collection.find({ aka: { $regex: regex } }).toArray();

    if (rappers.length === 0) {
      return res.status(404).json({ error: "El rapero que buscas no ha sido encontrado" });
    }

    res.json(rappers);
  } catch (error) {
    console.error("Ha habido un error al obtener los datos:", error);
    res.status(500).json({ error: "Ha habido un error al obtener los datos" });
  }
});

// GET /rappers/name/:name
app.get("/rappers/name/:name", async (req, res) => {
    try {
        const { name } = req.params;
        const collection = db.collection("cards");

        const regex = new RegExp(name, "i");

        const rappers = await collection.find({ name: { $regex: regex } }).toArray();

        if (rappers.length === 0) {
            return res.status(404).json({ error: "El rapero que buscas no ha sido encontrado" });
        }

        res.json(rappers);
    } catch (error) {
        console.error("Ha habido un error al obtener los datos:", error);
        res.status(500).json({ error: "Ha habido un error al obtener los datos" });
    }
});

// PUT /rappers/modificar/:id
app.put("/rappers/modificar/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { aka, name, album, song } = req.body;
        const collection = db.collection("cards");
        const result = await collection.updateOne(
            { id },
            { $set: { aka, name, album, song } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: "No se ha encontrado el rapero" });
        }
        
        res.json({ message: "Los datos del rapero han sido actualizados correctamente" });
    } catch (error) {
        res.status(500).json({ error: "Ha habido un error al actualizar los datos" });
    }
});

connectDB();