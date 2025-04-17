import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import auth_router from "./routes/auth.js"
import journalRoutes from "./routes/journal.js"
import router from "./routes/ai.js"

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/auth', auth_router);
app.use('/api/journal', journalRoutes);
app.use('/api/ai', router);

// Add a home route
app.get('/', (req, res) => {
    res.send('Welcome to the AI Journal Agent API!');
});

app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});