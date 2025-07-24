const express = require('express');
const { evaluatePromotion, getMetrics, reloadRulesHandler } = require('./controllers/promotionController');

const app = express();
app.use(express.json());

// Routes
app.post('/promotion', evaluatePromotion);
app.get('/metrics', getMetrics);
app.post('/reload-rules', reloadRulesHandler);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;