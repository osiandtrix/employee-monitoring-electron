const nodeAbi = require('node-abi');

console.log("Node: "+nodeAbi.getAbi('16.13.0', 'node'));
// '51'
console.log("Electron: "+nodeAbi.getAbi('16.2.8', 'electron'));