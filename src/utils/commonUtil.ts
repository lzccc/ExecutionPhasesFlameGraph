let commonUtil = {
  debounce: (func, wait) => {
    let timer = null;
    return function debounced(...args) {
      clearTimeout(timer);
      timer = setTimeout(() => {
        func.apply(this, args);
      }, wait);
    };
  },
};

export default commonUtil;
