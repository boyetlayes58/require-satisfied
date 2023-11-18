// REQUIRE: foo

console.log('foo'); /*  ** * * * * *a block comment    */ console.log('bar'); /*  block */ console.log('yes') // yeah

/**
 * REQUIRE: hell yeah
 * yes yes
 * foo
 * bar
 *
 * Hail
 */

console.log('foo'); /** foo bar SATISFIED: foo        */ console.log('bar'); // SATISFIED: hell yeah yes yes foo bar
  // REQUIRE(extern): qwerty
