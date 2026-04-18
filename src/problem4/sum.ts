/**
 * Three different implementations of sum-to-n function
 * Each demonstrates different time/space complexity tradeoffs
 */

/**
 * Approach 1: Iterative For Loop
 * Time Complexity: O(n) - must iterate through each number from 1 to n
 * Space Complexity: O(1) - only uses a single accumulator variable
 *
 * Pros: Simple to understand, easy to debug
 * Cons: Slow for large values of n
 */
function sum_to_n_a(n: number): number {
  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += i;
  }
  return sum;
}

/**
 * Approach 2: Mathematical Formula (Arithmetic Series)
 * Time Complexity: O(1) - constant time calculation
 * Space Complexity: O(1) - no additional memory needed
 *
 * Uses the closed-form formula: n * (n + 1) / 2
 * Derived from: 1 + 2 + ... + n = n(n+1)/2
 *
 * Pros: Optimal time complexity, fastest for any n
 * Cons: May cause intermediate overflow for very large n (mitigated by MAX_SAFE_INTEGER constraint)
 */
function sum_to_n_b(n: number): number {
  return (n * (n + 1)) / 2;
}

/**
 * Approach 3: Bitwise Optimization Formula
 * Time Complexity: O(1) - constant time calculation
 * Space Complexity: O(1) - no additional memory needed
 *
 * Uses bit shift (>> 1) instead of division by 2 for micro-optimization
 * Right shift by 1 is equivalent to division by 2 for positive integers
 *
 * Pros: Slightly faster than division on some processors, same O(1) complexity
 * Cons: Less readable, only works for positive integers
 */
function sum_to_n_c(n: number): number {
  return (n * (n + 1)) >> 1;
}

// Export functions for use in other modules
export { sum_to_n_a, sum_to_n_b, sum_to_n_c };

// ============= Test Suite =============
const testCases = [
  // Basic cases
  { input: 0, expected: 0 },
  { input: 1, expected: 1 },
  { input: 5, expected: 15 },
  { input: 10, expected: 55 },
  { input: 100, expected: 5050 },
];

function runTests(): void {
  let allPassed = true;
  const functions = [sum_to_n_a, sum_to_n_b, sum_to_n_c];
  const fnNames = ['sum_to_n_a', 'sum_to_n_b', 'sum_to_n_c'];

  for (let f = 0; f < functions.length; f++) {
    const fn = functions[f];
    const fnName = fnNames[f];

    console.log(`\nTesting ${fnName}:`);

    for (const tc of testCases) {
      const result = fn(tc.input);
      const passed = result === tc.expected;
      if (!passed) allPassed = false;
      console.log(`  ${fnName}(${tc.input}) = ${result} (expected: ${tc.expected}) ${passed ? '✓' : '✗ FAIL'}`);
    }
  }

  console.log(`\n${allPassed ? '✅ All tests passed!' : '❌ Some tests failed!'}`);
}

// Run tests when executed directly
if (require.main === module) {
  runTests();
}