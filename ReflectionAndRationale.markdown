# Reflection and Rationale: Promotion Rule-Engine Microservice

## Assignment Overview
This project is a Node.js-based REST microservice that selects the most appropriate in-game promotion for a player based on configurable YAML-defined rules. It includes features such as A/B testing, weighted randomness, time windows, hot-reloadable rules, and evaluation metrics.

---

## 1. Design Choices

### a. Language and Architecture
- **Language Chosen**: Node.js  
  - Fast, asynchronous, and lightweight  
  - Great for REST APIs  

### b. Folder Structure
Organized for maintainability and scalability:
- `controllers/`: Handles HTTP logic
- `services/`: Business logic and rule evaluation
- `utils/`: Logging and metric tracking
- `rules/`: YAML rule definitions

### c. Data Handling
- Rules are loaded once at startup into an in-memory array (for performance).
- A reload endpoint (`/reload-rules`) allows hot-swapping of rule logic.

### d. Rule Matching
- Evaluates YAML-based rules with structured conditions (`min`, `max`, enums).
- Rules are sorted by priority.
- Matching logic is modular and extensible.

### e. Extensibility Hooks
- A/B Testing: Bucketing based on `userId % 2` → bucket A or B  
- Weighted Randomness: Rules with `weight` are selected probabilistically  
- Time Windows: Start/end hour constraints per rule  

### f. Alternatives Considered
- Database for rules: Added complexity, unnecessary for short-term caching.
- Match-all rules: Priority sorting avoids ambiguity.

---

## 2. Trade-offs

| Choice                     | Pros                                        | Cons                             |
|----------------------------|---------------------------------------------|----------------------------------|
| In-memory rule evaluation  | Fast, no DB calls                           | Memory usage grows with rules    |
| YAML rule config           | Human-readable, version-controlled          | No schema validation(manual risk)|
| Weighted randomness        | Realistic multi-match behavior              | Slightly unpredictable outcomes  |
| Time window (hourly)       | Simple, efficient                           | No timezone logic yet            |

---

## 3. Areas of Uncertainty

- Bucket Logic: I used hexadecimal-based A/B bucketing. It works well for demos but might need rebalancing in production.
- Time Evaluation: I used `Date.getHours()` which assumes server-local time. There's no support for timezone-based windows yet.
- No YAML Schema Validation: I assumed rule files would be correct. Improperly formatted rules could cause runtime failures.

---

## 4. AI Assistance Disclosure

Yes, I used AI tools during this assignment to support development:

### ChatGPT
- Helped design the project structure.
- Assisted in writing clean YAML syntax and rule structure.
- Generated initial drafts of rule-matching functions.
- Helped generate and structure unit tests in Jest.
- Aided in drafting the README and curl/Postman examples.

### Grok AI
- Used for initial code linting and architecture suggestions.
- Helped identify folder layout improvements.
- Flagged edge-case logic gaps (like country code validation).

**Final Code Ownership**: I personally reviewed, integrated, and in many cases rewrote the AI-generated suggestions to align with my understanding and the project’s goals. Every line of logic in this project is fully understood and controlled by me.

---

## 5. Good Coding Practices Followed

- Data Encapsulation: Metrics and rule logic hidden behind modules.
- Separation of Concerns: Controllers vs. Services vs. Utils.
- Modularity: Each function serves a single purpose.
- Error Handling: All routes handle invalid/missing data.
- Documentation: README with examples and code comments.
- Meaningful Naming: Clean and descriptive names.

---

## 6. Algorithmic Considerations

- Rule evaluation logic is `O(n)` over rules.
- Rules are pre-sorted by `priority` to simplify match selection.
- Weighted random logic is optimized for fast match under `n <= 1000`.
- Metrics collection is simple and efficient (push-based latency tracking).

---

