require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// Conexão com o MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Conectado ao MongoDB!"))
  .catch((err) => console.error("Erro ao conectar no banco:", err));

// Modelo de Dados
const SensorSchema = new mongoose.Schema({
  device_id: String,
  status: String,
  timestamp: { type: Date, default: Date.now }, // O servidor gera a hora exata
});
const SensorData = mongoose.model("SensorData", SensorSchema);

// Rota POST (Recebe dados do ESP8266)
app.post("/api/sensor", async (req, res) => {
  try {
    const newData = new SensorData({
      device_id: req.body.device_id,
      status: req.body.status,
    });
    await newData.save();
    res
      .status(201)
      .json({ message: "Sinal salvo com sucesso!", data: newData });
  } catch (error) {
    res.status(500).json({ error: "Erro ao salvar." });
  }
});

// Rota GET (Envia dados para o gráfico no Expo)
app.get("/api/sensor", async (req, res) => {
  try {
    const data = await SensorData.find().sort({ timestamp: -1 });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
