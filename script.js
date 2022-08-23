/* The stack is used to hold values and operators temporarily in
 * case a higher precedence operation needs to be calculated first.
 *
 * For example:            1 + 2 + 3 * 4 - 1 =
 *
 * Is equivalent to:       1 + 2 + (3 * 4) - 1 =
 *
 * Which becomes:          3 + 12 - 1 =
 *
 * Which evaluates to:     14
 *
 * For this calculator, plus ('+') and minus ('-') have lower
 * precedence than multiplication ('*') and division ('/').
 * This means that a multiplication or division operation will
 * be performed before an addition or subtraction.
 *
 * In other words, all higher precedence operations are calculated
 * first (as if there were parenthesis around them), and then lower
 * precedence operations are calculated. Within the same precedence
 * level, the order of calculation is from left to right. For example:
 *
 * 3 + 7 - 2   =>   (3 + 7) - 2   =>   10 - 2 = 8
 *
 * This is how the original expression is processed:
 *
 *   1 + 2 + 3 * 4 - 1 =
 *
 * 1) User enters 1, then presses +
 *
 *    onclick '+'  =>  read 1, peek stack (empty), so:
 *                     1. push 1, push '+'
 *                     2. stack now looks like this: [ 1, '+' ]
 *
 * 2) User enters 2, then presses +
 *
 *    onclick '+'  => read 2, peek stack: top of stack is '+',
 *                    which is the same precedence as this '+', so:
 *                    1. pop stack => op ('+')
 *                    2. pop stack => prev (1)
 *                       (stack is now empty)
 *                    3. calculate => prev (1) op (+) read (2)
 *                                 => 3
 *                    4. push 3, push current op ('+')
 *                    5. stack now looks like this: [ 3, '+' ]
 *
 * 3) User enters 3, then presses *
 *
 *    onclick '*'  => read 3, peek stack: top of stack is '+', which
 *                    is lower precedence, so only:
 *                    1. push 3, push '*'
 *                    2. stack now looks like this: [ 3, '+', 3, '*' ]
 *
 * 4) User enters 4, then presses -
 *
 *    onclick '-'  => read 4, peek stack: top of stack is '*', which
 *                    is higher precedence (similar to case where same
                      precedence), so process stack while not empty:
 *                    1. pop stack => op ('*')
 *                    2. pop stack => prev (3)
 *                    3. calculate => prev (3) op (+) read (4)
 *                                 => 12
 *                    4. pop stack => '+'
 *                    5. pop stack => 3
 *                    6. calculate => prev (3) op ('+') + 12
 *                                 => 15
 *                    7. push 15, push '-'
 *                    8. stack now looks like this: [ 15, '-' ]
 *
 *
 * 5) User enters 1, then presses =
 *
 *    onclick '='  => read 1, since op is '=', process the stack:
 *                    1. pop stack => op ('-')
 *                    2. pop stack => prev (15)
 *                    3. calculate => prev (15) op ('-') read (1)
 *                                 => 14
 *                    4. Done.
 *
 *
 *
 * This is the algorithm in pseudocode:
 *
 * when an operator (+,-,*,/,=) is clicked, do
 *   read input into val
 *   if op is '=' then
 *     while stack not empty
 *       prev_op = stack.pop()
 *       prev_val = stack.pop()
 *       val = prev_val prev_op val
 *     print val
 *   else // op is (+,-,*,/)
 *     peek stack
 *     if previous op precedence is >= this op // then calculate
 *       while stack
 *         prev_op = stack.pop()
 *         prev_val = stack.pop()
 *         val = prev_val prev_op val
 *     push val // store the updated value (ex, for 5 - 2, store 3)
 *     push op  // store this op
 *
 */


const stack = [];

// After pressing =, remember so the next time something is
// entered, the previous expression log can be cleared.
let lastKeyEqual = false;

// Parses the input and it is valid, returns a number;
// else returns NaN (not a number).
function read() {
  let n = document.getElementById("result").value;
  return parseInt(n);
}

// Checks if NaN and if true, prints "NaN" and returns true,
// else does nothing and returns false.
function nan(n) {
  if (Number.isNaN(n)) {
    print("NaN");
    return true;
  }
  return false;
}

// Displays current value in the input field.
function print(val) {
  document.getElementById("result").value = val;
}

// Appends input values and operators to display the current
// expression above the input.
function log(s) {
  document.getElementById("expression").innerText += s;
}

// Clears the expression.
function clearLog() {
  document.getElementById("expression").innerText = "";
}

// Clears the input field.
function clearInput() {
  print("");
}

// Clears everything and resets the stack.
function allClear() {
  clearLog();
  clearInput();
  stack.length = 0;
  trace();
}

function trace() {
  console.log("stack", stack);
}

function calculate(a, b, op) {
  switch (op) {
    case '+':
      return _add(a, b);
    case '-':
      return _sub(a, b);
    case '*':
      return _mul(a, b);
    case '/':
      return _div(a, b);
    default:
      throw new Error(`Unknown op: ${op}`);
  }
}

// Compares operators for precedence. Returns:
//   -1 if op1 < op2 (op1 has lower precedence)
//    0 if op1 = op2 (op1 has the same precedence)
//    1 if op1 > op2 (op1 has higher precedence)
function checkPrecedence(op1, op2) {
  let prec1 = (op1 === '+' || op1 === '-') ? 0 : 1;
  let prec2 = (op2 === '+' || op2 === '-') ? 0 : 1;
  return prec1 - prec2;
}

function process(op) {
  /*
   * when an operator (+,-,*,/,=) is clicked, do
   *   read input into val
   *   if op is '=' then
   *     while stack not empty
   *       prev_op = stack.pop()
   *       prev_val = stack.pop()
   *       val = prev_val prev_op val
   *     print val
   *   else // op is (+,-,*,/)
   *     peek stack
   *     if previous op precedence is >= this op // then total things up
   *       while stack not empty
   *         prev_op = stack.pop()
   *         prev_val = stack.pop()
   *         val = prev_val prev_op val
   *     push val
   *     push op
   */

  let val = read();
  if (nan(val)) return;

  if (lastKeyEqual) {
    clearLog();
  }

  log(val);
  log(op);

  if (op === '=') {
    lastKeyEqual = true;
    while (stack.length > 1) {
      let prev_op = stack.pop();
      let prev_val = stack.pop();
      val = calculate(prev_val, val, prev_op);
    }
    print(val);
  } else {
    lastKeyEqual = false;
    if (stack.length > 1) {
      let prev_op = stack.at(-1); // peek
      if (checkPrecedence(prev_op, op) >= 0) {
        while (stack.length > 1) {
          let prev_op = stack.pop();
          let prev_val = stack.pop();
          val = calculate(prev_val, val, prev_op);
        }
      }
    }
    stack.push(val);
    stack.push(op);
  }
  print(val);
  trace();
}

// Push the value and operator to the stack in case
// a higher precedence operation comes next.
function add() {
  process('+');
}

// Push the value and operator to the stack in case
// a higher precedence operation comes next.
function sub() {
  process('-');
}

// 
function mul() {
  process('*');
}

function div() {
  process('/');
}

function eq() {
  process('=');
}


function _add(a, b) {
  return a + b;
}

function _sub(a, b) {
  return a - b;
}

function _mul(a, b) {
  return a * b;
}

function _div(a, b) {
  return a / b;
}
