# Promotion Rule-Engine Microservice

This microservice picks the best in-game promotion for a player based on rules defined in a YAML file. It supports conditions like player level, spend tier, country, and days since last purchase, with features for A/B testing, weighted randomness, and time-based rules. The service includes endpoints to evaluate promotions, view metrics, and reload rules without restarting.

## Prerequisites
- Node.js (version 16 or higher)
- npm (version 8 or higher)
- Postman (optional, for testing API endpoints with the provided collection)

## Setup
1. Extract the zip file and navigate to the project folder:
   ```bash
   cd promotion-rule-engine
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Ensure the `src/rules/promotions.yaml` file exists and is valid YAML. It contains the promotion rules (e.g., conditions and promotion payloads).

## Running the Application
Start the server:
```bash
npm start
```
The server runs on `http://localhost:3000` by default. To use a different port, set the `PORT` environment variable:
```bash
PORT=4000 npm start
```

## API Endpoints
The microservice provides three endpoints. Screenshots of example requests and responses are included in the `screenshots/` folder and embedded below.

1. **POST /promotion**  
   Evaluates a player’s attributes and returns a promotion (or `null` if none applies).  
   **Example curl command**:
   ```bash
   curl -X POST http://localhost:3000/promotion \
        -H "Content-Type: application/json" \
        -d '{"userId": "123", "level": 15, "spendTier": "GOLD", "country": "US", "daysSinceLastPurchase": 10}'
   ```
   **Example response**:
   ```json
   {
     "id": "BONUS_10",
     "type": "bonus",
     "value": 10,
     "description": "10% bonus on next purchase"
   }
   ```
   **Screenshot**: See `screenshots/postman_promotion.png` for a Postman request example.  
   ![POST /promotion in Postman](screenshots/postman_promotion.png)

2. **GET /metrics**  
   Returns evaluation stats: total evaluations, hits/misses by A/B bucket, and average latency.  
   **Example curl command**:
   ```bash
   curl http://localhost:3000/metrics
   ```
   **Example response**:
   ```json
   {
     "totalEvaluations": 1,
     "hits": { "A": 1, "B": 0 },
     "misses": { "A": 0, "B": 0 },
     "averageLatency": 5.23
   }
   ```
   **Screenshot**: See `screenshots/metrics_curl.png` for the curl output.  
   ![GET /metrics curl output](screenshots/metrics_curl.png)

3. **POST /reload-rules**  
   Reloads rules from `promotions.yaml` without restarting the server.  
   **Example curl command**:
   ```bash
   curl -X POST http://localhost:3000/reload-rules
   ```
   **Example response**:
   ```json
   { "message": "Rules reloaded successfully" }
   ```
   **Screenshot**: See `screenshots/postman_reload_rules.png` in the Postman collection.

Alternatively, import `postman/PromotionRuleEngine.postman_collection.json` into Postman to test these endpoints. The collection includes example requests for:
- Evaluating promotions for players in A/B buckets A and B
- Retrieving metrics
- Reloading rules

## Running Tests
Run unit tests to verify the API and rule engine:
```bash
npm test
```
The tests use Jest and cover:
- Rule evaluation for matching and non-matching players
- Edge cases (e.g., invalid country codes, missing attributes)
- Metrics tracking and rule reloading

**Screenshot**: See `screenshots/test_results.png` for the test output.  
![Test Results](screenshots/testOutput.png)

## Project Structure
- `src/`: Source code
  - `controllers/`: API route handlers
  - `services/`: Rule evaluation logic
  - `utils/`: Logging and metrics utilities
  - `rules/promotions.yaml`: Rule definitions
- `tests/`: Unit tests for API and rule engine
- `postman/`: Postman collection for API testing
- `screenshots/`: Screenshots of API requests and test results
- `Reflection.md`: Design choices and rationale

## Troubleshooting
- **Missing dependencies**: Run `npm install` to fix.
- **Invalid YAML**: Check `promotions.yaml` for correct syntax and a `rules` array.
- **Port conflicts**: Use a different `PORT` environment variable (e.g., `PORT=4000 npm start`).
- **Test failures**: Ensure `promotions.yaml` is in `src/rules/` and Jest is installed (`npm install --save-dev jest`).