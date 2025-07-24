
const fs = require('fs');
const yaml = require('js-yaml');
const _ = require('lodash');
const logger = require('../utils/logger');

// rules array for storing rules, sorted by priority, for in-memory access.
let rules = [];


// Itoads promotion rules from a YAML file into memory.
// It also sorts rules by priority to handle conflicts (lower priority number wins).
const loadRules = (filePath = './src/rules/promotions.yaml') => {
  try {
    // Read and parse the YAML file.
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const data = yaml.load(fileContents);

    // for validating the YAML has a rules array.
    if (!data.rules || !Array.isArray(data.rules)) {
      throw new Error('Invalid rules format');
    }

    // Deep cloning to avoid mutating original data and sortin g by priority.
    rules = _.cloneDeep(data.rules).sort((a, b) => a.priority - b.priority);
    logger.info(`Loaded ${rules.length} rules from ${filePath}`);
  } catch (error) {
    logger.error(`Failed to load rules: ${error.message}`);
    throw error;
  }
};

// Initialize rules at startup
loadRules();


// Checks if a player’s attributes match a rule’s conditions.
// will returns true if all conditions (level, spendTier, etc.) are satisfied.
const evaluateConditions = (player, conditions) => {
  for (const [key, condition] of Object.entries(conditions)) {
    const value = player[key];

    // Skip if the player is missing this attribute.
    if (value === undefined || value === null) return false;

    // for handling range conditions (ex level: { min: 10, max: 20 }).
    if (typeof condition === 'object' && ('min' in condition || 'max' in condition)) {
      const { min, max } = condition;
      if (min !== undefined && value < min) return false;
      if (max !== undefined && value > max) return false;
    }

    // for handling array conditions (ex  country: ["US", "CA"]).
    else if (Array.isArray(condition)) {
      // case-insensitive comparison for strings, exact match for others.
      if (!condition.some(c => typeof value === 'string' ? c.toLowerCase() === value.toLowerCase() : c === value)) return false;
    } 

    // for direct value comparison (ex spendTier: "GOLD").
    else {
      if (typeof value === 'string' && typeof condition === 'string') {
        // Case-insensitive string comparison.
        if (value.toLowerCase() !== condition.toLowerCase()) return false;
      } else {
        // if exact match for non-strings we return false.
        if (value !== condition) return false;
      }
    }
  }
  return true;
};


// Checks if the current time is within a rule’s time window.
// Returns true if no time window or if current hour is in range.
// Time window is an object with startHour and endHour properties.
// Example: { startHour: 8, endHour: 20 } for 8 AM to 8 PM.
// If no time window is specified, it defaults to true.
const isWithinTimeWindow = (timeWindow) => {
  // If no time window is specified, return true.
  if (!timeWindow) return true;
  const currentHour = new Date().getHours();
  return currentHour >= timeWindow.startHour && currentHour <= timeWindow.endHour;
};


// Selects a promotion based on the player’s attributes and the rules.
// It filters applicable rules based on A/B bucket, time window, and conditions.
const weightedRandomSelection = (matchingRules) => {

  if (matchingRules.length === 0) return null;
  if (matchingRules.length === 1) return matchingRules[0].promotion;
  
  // Calculate total weight and perform weighted random selection.
  // If no weights are specified, it defaults to equal probability.
  const totalWeight = matchingRules.reduce((sum, rule) => sum + (rule.weight || 0), 0);

  // If total weight is zero, return the first promotion as fallback.
  // This handles cases where all rules have zero weight or no weights are specified.
  if (totalWeight === 0) return matchingRules[0].promotion;
  
  // Generate a random number and select a promotion based on weights.
  // This ensures that promotions with higher weights are more likely to be selected.
  let random = Math.random() * totalWeight;
  for (const rule of matchingRules) {
    random -= rule.weight || 0;
    if (random <= 0) return rule.promotion;
  }
  return matchingRules[0].promotion;
};


// Evaluates a player against the loaded rules and returns a promotion.
// It assigns the player to an A/B bucket based on userId and checks conditions.
const evaluatePlayer = (player) => {
  if (!player || typeof player !== 'object') {
    throw new Error('Invalid player data');
  }

  // Assigns the player to an A/B bucket based on userId.
  // If userId is not provided, it defaults to bucket A.
  const abBucket = player.userId ? (parseInt(player.userId, 16) % 2 === 0 ? 'B' : 'A') : 'A';
  logger.info(`Assigned bucket ${abBucket} for userId ${player.userId}`);

  const applicableRules = rules.filter(rule => 
    (!rule.abBucket || rule.abBucket.includes(abBucket)) &&
    isWithinTimeWindow(rule.timeWindow)
  );

  const matchingRules = applicableRules.filter(rule => evaluateConditions(player, rule.conditions));

  return weightedRandomSelection(matchingRules);
};


// Reloads the rules from the YAML file.
// This wiLL alow dynamic updates to the rules without restarting the application.
const reloadRules = () => {
  loadRules();
};

module.exports = { evaluatePlayer, reloadRules, loadRules };