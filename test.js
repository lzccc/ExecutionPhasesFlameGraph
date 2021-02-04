//test file, please ignore
function pipe(funcs) {
  // your code here
  let test = [];
  return (x) => {
    test.reduce((pre, func) => {
      return func(x);
    }, null);
  };
}

console.log(flat([1, 2]));
