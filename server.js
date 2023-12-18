const express = require("express")
const app = express()
const mariadb = require("mariadb")
require('dotenv').config()
let cors = require("cors")
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

app.use(cors())
app.use(express.json())

const pool = mariadb.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PWD,
    database: process.env.DB_DTB
})


//user
app.get("/user", async (req, res) => {
    try {
        const conn = await pool.getConnection();
        const users = await conn.query("SELECT * FROM user");
        conn.release();
        res.json(users);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.get("/user/:id", async (req, res) => {
const userId = req.params.id;
try {
    const conn = await pool.getConnection();
    const user = await conn.query("SELECT * FROM user WHERE id = ?", [userId]);
    conn.release();
    if (user.length > 0) {
    res.json(user[0]);
    } else {
    res.status(404).send("User not found");
    }
} catch (err) {
    res.status(500).send(err.message);
}
});

// Inscription (Register) d'un utilisateur
app.post("/register", async (req, res) => {
    const { name, surname, email, password } = req.body;

    // Générer le sel et hacher le mot de passe
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    try {
        const conn = await pool.getConnection();
        await conn.query("INSERT INTO user (name, surname, email, password) VALUES (?, ?, ?, ?)", [name, surname, email, hashedPassword]);
        conn.release();
        res.send("User registered successfully");
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Connexion (Login) d'un utilisateur
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const conn = await pool.getConnection();
        console.log('test')
        const result = await conn.query("SELECT * FROM user WHERE email = ?", [email]);
        console.log('test2')
 
        conn.release();

        if (result.length > 0) {
            const storedPassword = result[0].password;

            // Vérifier le mot de passe haché
            const match = await bcrypt.compare(password, storedPassword);

            if (match) {
                // Générer un token JWT valide pour 1 heure
                const token = jwt.sign({ email: result[0].email }, process.env.JWT_SECRET, { expiresIn: '1h' });
                res.json({ token });
            } else {
                res.status(401).send("Invalid password");
            }
        } else {
            res.status(404).send("User not found");
        }
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.patch("/user/:id", async (req, res) => {
const userId = req.params.id;
const { name, surname, email } = req.body;
try {
    const conn = await pool.getConnection();
    await conn.query("UPDATE user SET name = ?, surname = ?, email = ? WHERE id = ?", [name, surname, email, userId]);
    conn.release();
    res.send("User updated successfully");
} catch (err) {
    res.status(500).send(err.message);
}
});

app.delete("/user/:id", async (req, res) => {
const userId = req.params.id;
try {
    const conn = await pool.getConnection();
    await conn.query("DELETE FROM user WHERE id = ?", [userId]);
    conn.release();
    res.send("User deleted successfully");
} catch (err) {
    res.status(500).send(err.message);
}
});

//comment
app.get("/comment", async (req, res) => {
    try {
      const conn = await pool.getConnection();
      const comments = await conn.query("SELECT * FROM comment");
      conn.release();
      res.json(comments);
    } catch (err) {
      res.status(500).send(err.message);
    }
  });


app.get("/comment/user/:id", async (req, res) => {
    const userId = req.params.id;
    try {
      const conn = await pool.getConnection();
      const comments = await conn.query("SELECT * FROM comment WHERE id_user = ?", [userId]);
      conn.release();
      res.json(comments);
    } catch (err) {
      res.status(500).send(err.message);
    }
});

app.get("/comment/techno/:id", async (req, res) => {
    const technoId = req.params.id;
    try {
      const conn = await pool.getConnection();
      const comments = await conn.query("SELECT * FROM comment WHERE id_techno = ?", [technoId]);
      conn.release();
      res.json(comments);
    } catch (err) {
      res.status(500).send(err.message);
    }
});

app.post("/comment", async (req, res) => {
    const { id_user, id_techno, content } = req.body;
    try {
      const conn = await pool.getConnection();
      await conn.query("INSERT INTO comment (id_user, id_techno, content) VALUES (?, ?, ?)", [id_user, id_techno, content]);
      conn.release();
      res.send("Comment created successfully");
    } catch (err) {
      res.status(500).send(err.message);
    }
});

//techno
app.get("/techno", async (req, res) => {
    try {
        const conn = await pool.getConnection();
        const techno = await conn.query("SELECT * FROM techno");
        conn.release();
        res.json(techno);
    } catch (err) {
        res.status(500).send(err.message);
    }
    });

app.post("/techno", async (req, res) => {
    const { name } = req.body;
    try {
        const conn = await pool.getConnection();
        await conn.query("INSERT INTO techno (name) VALUES (?)", [name]);
        conn.release();
        res.send("Technology created successfully");
    } catch (err) {
        res.status(500).send(err.message);
    }
});



app.listen(3000, () => {
    console.log("serverStart")
})