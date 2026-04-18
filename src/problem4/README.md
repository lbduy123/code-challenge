# Problem 4: Sum to N

This directory contains three different implementations of a function that calculates the sum from 1 to n.

## Implementations

| Function | Approach | Time Complexity | Space Complexity |
|----------|----------|-----------------|-----------------|
| `sum_to_n_a` | Iterative loop | O(n) | O(1) |
| `sum_to_n_b` | Mathematical formula `n*(n+1)/2` | O(1) | O(1) |
| `sum_to_n_c` | Bitwise formula `(n*(n+1)) >> 1` | O(1) | O(1) |

### Complexity Analysis

- **Approach A (Iterative)**: Simple but O(n) - slow for large n. Good for understanding, but not optimal.
- **Approach B (Mathematical)**: Uses closed-form formula `n(n+1)/2`. Optimal O(1) time.
- **Approach C (Bitwise)**: Same as B, uses bit-shift `>> 1` instead of division. Micro-optimization.

**Best approach**: B or C - both achieve optimal O(1) time complexity.

## How to Run

### Prerequisites
```bash
cd src/problem4/
```

### Run tests
```bash
npx ts-node sum.ts
```

### Run via npm
```bash
npm run sum
```

## Test Cases

- `n = 0` → 0
- `n = 1` → 1
- `n = 5` → 15
- `n = 10` → 55
- `n = 100` → 5050