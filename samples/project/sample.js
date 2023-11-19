// SATISFIED: id 000
console.log('Foo') // REQUIRE: id 000
/**
 * REQUIRE: id 001
 */ console.log('Bar') // SATISFIED: id 001
// REQUIRE(extern): id 100
// SATISFIED(extern): id 101
