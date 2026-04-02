require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const axios = require("axios"); 

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use(cors());

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Conectado ao MongoDB!"))
  .catch((err) => console.error("Erro ao conectar no banco:", err));

const SensorSchema = new mongoose.Schema({
  device_id: String,
  status: String,
  timestamp: { type: Date, default: Date.now },
});
const SensorData = mongoose.model("SensorData", SensorSchema);


app.get("/ping", (req, res) => {
  res.status(200).send("Alive");
});

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

app.get("/api/sensor", async (req, res) => {
  try {
    const data = await SensorData.find().sort({ timestamp: -1 });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar." });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  startSelfPing(); 
});


function startSelfPing() {
  const URL = `https://${process.env.RENDER_EXTERNAL_HOSTNAME}/ping`;
  

  const min = 12 * 60 * 1000;
  const max = 14 * 60 * 1000;

  const interval = Math.floor(Math.random() * (max - min + 1) + min);

  setTimeout(async () => {
    try {
      await axios.get(URL);
      console.log(
        `Ping enviado para ${URL} - Próximo em: ${interval / 60000}min`,
      );
    } catch (err) {
      console.error("Erro no self-ping:", err.message);
    }
    startSelfPing();
  }, interval);
}
