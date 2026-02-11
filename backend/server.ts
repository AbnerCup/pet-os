import 'dotenv/config'
import app from './src/app'

const PORT = process.env.PORT || 3001

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`🚀 Servidor backend corriendo en http://0.0.0.0:${PORT}`);
  console.log(`📡 Accesible desde tu móvil en http://192.168.1.38:${PORT}`);
});

// Log simple para ver si llegan peticiones desde afuera
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url} - IP: ${req.ip}`);
  next();
});
