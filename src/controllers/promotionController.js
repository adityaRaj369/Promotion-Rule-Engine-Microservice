
const { evaluatePlayer, reloadRules } = require('../services/ruleEngine');
const { recordEvaluation, getMetrics } = require('../utils/metrics');
const logger = require('../utils/logger');


// Evaluates a player for promotions based on the loaded rules.
// It checks the player's attributes against the rules and returns a promotion if applicable.
const evaluatePromotion = async (req, res) => {
  const startTime = Date.now();
  // Validate player data and country code.
  try {
    const player = req.body;

    // Check if the player has a valid country code.
    if (!player.country || !['US', 'CA', 'UK', 'AU'].includes(player.country)) {
      return res.status(400).json({ error: 'Invalid or unsupported country code' });
    }

    // Check if userId is provided for A/B testing.
    // If userId is missing, return an error.
    if (!player.userId) {
      return res.status(400).json({ error: 'userId is required for A/B testing' });
    }

    // Evaluate the player against the rules and get the promotion.
    // This will assign the player to an A/B bucket and check conditions.
    const promotion = evaluatePlayer(player);
    const abBucket = player.userId ? (parseInt(player.userId, 16) % 2 === 0 ? 'B' : 'A') : 'A';
    // Record the evaluation metrics.
    // This will track hits and misses for each A/B bucket.
    recordEvaluation(startTime, !!promotion, abBucket);
    logger.info(`Evaluated player: ${JSON.stringify(player)}, Bucket: ${abBucket}, Promotion: ${promotion ? promotion.id : 'none'}`);
    res.status(200).json(promotion);
  } catch (error) {
    logger.error(`Evaluation error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};

// Returns the evaluation metrics.
// It provides stats like total evaluations, hits, and misses for each A/B bucket.
const getMetricsHandler = (req, res) => {
  res.status(200).json(getMetrics());
};


// Reloads the promotion rules from the YAML file.
// This allows dynamic updates to the rules without restarting the application.
const reloadRulesHandler = (req, res) => {
  try {
    reloadRules();
    res.status(200).json({ message: 'Rules reloaded successfully' });
  } catch (error) {
    logger.error(`Rule reload error: ${error.message}`);
    res.status(500).json({ error: 'Failed to reload rules' });
  }
};

module.exports = { evaluatePromotion, getMetrics:getMetricsHandler, reloadRulesHandler };