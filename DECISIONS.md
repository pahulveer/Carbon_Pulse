# Architectural & Product Decisions — CARBON//PULSE

This document outlines the core architectural and UX decisions implemented in **CARBON//PULSE**, with detailed rationales for the three mandatory Decision Points (DP1, DP2, DP3).

---

## Decision Point 1 (DP1): The Nudge (Target Exceeded)

### The Challenge
When a user crosses their weekly carbon allowance (for example, logging 23.4 kg CO₂ against a 20.0 kg target), traditional applications often resort to punitive friction: red flashing warning banners, shaming copy, or blocking further activity logs.

### The Decision
**Encourage + inform, never shame and never block.**

### Implementation & User Experience
1. **Supportive Visual Language**: Instead of an alarming red "FAILED" state, CARBON//PULSE displays a refined rose/coral telemetry card with clear metrics:
   ```text
   WEEKLY TARGET EXCEEDED
   23.4 kg / 20.0 kg (3.4 kg above target)
   ```
2. **Empowering Microcopy**:
   > *"Your tracking still matters. Continue logging your activities to understand where your footprint is coming from. Awareness is the first step toward high-leverage reduction."*
3. **Zero Interruption**:
   - The user is **never blocked** from logging further activities.
   - All historical data, breakdown filters, and export capabilities remain 100% active.
   - Actionable CTAs are provided: `[Continue Logging]`, `[View History]`, and `[Adjust Budget]`.

### Product Rationale
Behavioral psychology demonstrates that guilt-based shaming and artificial blockers cause users to abandon tracking tools entirely. Preserving transparent data fidelity throughout the remainder of the week allows users to identify exactly which activity categories (such as long-distance travel vs. daily home power) drove the variance.

---

## Decision Point 2 (DP2): Absurd Input Interception

### The Challenge
A user enters an unusually high value, such as `500,000 km` for a single car trip.

### The Decision
**Flag, don't assume. Rule-based anomaly detection without silent clamping or truncation.**

### Implementation & User Experience
1. **Rule-Based Anomaly Detection Engine**:
   - Each activity has an established domain threshold based on physical limits:
     - **Car travel**: `2,000 km` in a single log (typical cross-country driving maximum)
     - **Bus travel**: `1,500 km` in a single log
     - **Flight**: `20,000 km` in a single log (halfway around the globe)
     - **Electricity**: `3,000 kWh` in a single log (months of typical residential power)
     - **Veg meal / Non-veg meal**: `20 meals` in a single log
     - **Single-Event Carbon Spike**: Any single activity generating `≥ 500.00 kg CO₂`
2. **Transparent Mathematical Pre-Calculation**:
   Before committing the entry, the system intercepts the event with a dedicated Anomaly Dialog displaying the calculated impact:
   ```text
   UNUSUALLY LARGE ENTRY
   500,000 km would produce: 100,000.00 kg CO₂

   This value is unusually large for a single car travel activity. Please verify the distance.
   [EDIT ENTRY]     [CONFIRM ANYWAY]
   ```
3. **Dual Action Branching**:
   - **`[EDIT ENTRY]`**: Returns focus directly to the quantity input with previous text preserved for quick correction.
   - **`[CONFIRM ANYWAY]`**: Respects user agency. If the user intentionally meant to log a massive fleet migration or corporate event, the record is stored accurately with an internal `flaggedAsAbsurd` telemetry tag visible in the ledger.

### Product Rationale
Silently altering user input damages product trust and corrupts scientific data. Outright rejection alienates edge cases. By calculating and explaining the mathematical impact transparently through rule-based anomaly detection, the user remains in complete control.

---

## Decision Point 3 (DP3): The Deterministic Week & Pacing Telemetry

### The Challenge
Weekly carbon tracking requires unambiguous temporal boundaries and clear answers to: *"Am I burning my carbon budget too fast for where we are in the week?"*

### The Decision
**Strict ISO Monday → Sunday calendar week with dual-axis pacing telemetry.**

### Implementation & User Experience
1. **Deterministic Boundaries**:
   - **Week Start**: Monday at 00:00:00.000 local time.
   - **Week End**: Sunday at 23:59:59.999 local time.
   - Dynamic week calculation based on the user's active local calendar.
   - For the current week cycle: **Monday September 14, 2026 → Sunday September 20, 2026** (displayed as `14 SEP → 20 SEP`).
2. **Dual-Axis Progress Telemetry**:
   Rather than merely displaying a single static target bar, CARBON//PULSE simultaneously measures:
   - **% of target used**: `(Total Weekly CO₂ / Weekly Target) × 100`
   - **% of week elapsed**: `(Time elapsed since Monday 00:00 / Total Week Duration) × 100`
3. **Objective Pacing Status**:
   - **`ON PACE`**: When consumption is within a balanced window relative to week progress.
   - **`ABOVE CURRENT PACE`**: When carbon consumption is accumulating faster than time elapsed.
   - **`BELOW CURRENT PACE`**: When consumption is lower than expected for the mid-week point.
4. **Daily Emissions Bar Chart**:
   - Monday through Sunday SVG distribution showing daily carbon volume.
   - Visual benchmark line displaying the ideal daily average allowance (`Target / 7`).

### Product Rationale
Displaying both percentage of budget consumed and percentage of week elapsed transforms raw numbers into intuitive pace telemetry. Users can pace their high-carbon choices (such as meal planning or optional car trips) before the week ends.
