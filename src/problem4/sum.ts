/**
 * Three different implementations of sum-to-n function
 * Each demonstrates different time/space complexity tradeoffs
 */

/**
 * Approach 1: Iterative For Loop
 * Time Complexity: O(n) - must iterate through each number from 1 to n
 * Space Complexity: O(1) - only uses a single accumulator variable
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
 */
function sum_to_n_c(n: number): number {
  return (n * (n + 1)) >> 1;
}

// Example usage and testing
console.log("Testing sum_to_n functions:");
console.log(`sum_to_n_a(5) = ${sum_to_n_a(5)}`); // Expected: 15
console.log(`sum_to_n_b(5) = ${sum_to_n_b(5)}`); // Expected: 15
console.log(`sum_to_n_c(5) = ${sum_to_n_c(5)}`); // Expected: 15

console.log(`sum_to_n_a(100) = ${sum_to_n_a(100)}`); // Expected: 5050
console.log(`sum_to_n_b(100) = ${sum_to_n_b(100)}`); // Expected: 5050
console.log(`sum_to_n_c(100) = ${sum_to_n_c(100)}`); // Expected: 5050

// Export functions for use in other modules
export { sum_to_n_a, sum_to_n_b, sum_to_n_c };
