let flameGraphUtil = {
  jsonToRootNode: {},
  rootNodeToLayerMapList: (root: any) => {
    const layerMapList = [];
    root.forEach((element) => {
      const layerMap = new Map<number, Object[]>();
      layerMap.set(0, null);
      setLayerNode(element, layerMap);
      layerMapList.push(layerMap);
    });
    // const layerMap = new Map<number, Object[]>();
    // layerMap.set(0, null);
    // setLayerNode(root, layerMap);
    return layerMapList;
  },
  getSmallestDepth: (layerMap: Map<number, Object[]>) => {
    const keysIterator = layerMap.keys();
    let smallest = Infinity;
    while (true) {
      let curr = keysIterator.next().value;
      if (!Number.isInteger(curr)) break;
      if (curr === 0) continue;
      smallest = smallest < curr ? smallest : curr;
    }
    return smallest;
  },
};

flameGraphUtil.jsonToRootNode = (jsonFile: any) => {};

let setLayerNode = (node: any, layerMap: Map<number, Object[]>) => {
  if (node) {
    if (!layerMap.get(node.depth)) {
      layerMap.set(node.depth, []);
    }
    layerMap.get(node.depth).push(node);
    node.children.forEach((element) => {
      setLayerNode(element, layerMap);
    });
  }
};

export default flameGraphUtil;
