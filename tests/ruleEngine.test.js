
const { evaluatePlayer, loadRules } = require('../src/services/ruleEngine');

// Reset metrics before each test to ensure clean state.
describe('Rule Engine', () => {
  beforeEach(() => {
    loadRules('./src/rules/promotions.yaml');
  });

  test('should return BONUS_10 for bucket A, matching player', () => {
    const player = {
      userId: '123', // Bucket A
      level: 15,
      spendTier: 'GOLD',
      country: 'US',
      daysSinceLastPurchase: 10
    };
    const promotion = evaluatePlayer(player);
    expect(promotion.id).toBe('BONUS_10');
  });
  test('should return DISCOUNT_5 for bucket B, matching player', () => {
    // Mock Date.prototype.getHours to return 18 (6 PM)
    const originalGetHours = Date.prototype.getHours;
    Date.prototype.getHours = () => 18;
    
    const player = { userId: '124', level: 7, country: 'UK' };
    const promotion = evaluatePlayer(player);
    expect(promotion.id).toBe('DISCOUNT_5');
    
    // Restore original method
    Date.prototype.getHours = originalGetHours;
  });

  test('should return null for non-matching player', () => {
    const player = { userId: '123', level: 1, country: 'FR' };
    const promotion = evaluatePlayer(player);
    expect(promotion).toBeNull();
  });

  test('should handle missing attributes', () => {
    const player = { userId: '123', level: 15 };
    const promotion = evaluatePlayer(player);
    expect(promotion).toBeNull();
  });

  test('should respect time window', () => {
    const player = { userId: '124', level: 7, country: 'UK' };
    jest.spyOn(global.Date.prototype, 'getHours').mockReturnValue(18); // Within 8:00–20:00
    const promotion = evaluatePlayer(player);
    expect(promotion.id).toBe('DISCOUNT_5');
    jest.spyOn(global.Date.prototype, 'getHours').mockReturnValue(7); // Outside 8:00–20:00
    const promotionOutside = evaluatePlayer(player);
    expect(promotionOutside).toBeNull();
  });

  test('should throw error for invalid player data', () => {
    expect(() => evaluatePlayer(null)).toThrow('Invalid player data');
  });
});