import { NextResponse } from "next/server";

// hardcoded for now — probably should move to env later
const USER_ID = "sarthakagarwal_28082004";
const EMAIL_ID = "sa9916@srmist.edu.in";
const COLLEGE_ROLL_NUMBER = "RA2311003040030";

// simple validation (kept regex, seems fine)
function checkValidFormat(entryStr) {
return /^[A-Z]->[A-Z]$/.test(entryStr);
}

// DFS cycle detection
function detectCycle(curr, graph, visitedSet, stackSet) {

visitedSet.add(curr);
stackSet.add(curr);

const neighbors = graph[curr] || [];

for (let i = 0; i < neighbors.length; i++) {
const next = neighbors[i];

if (!visitedSet.has(next)) {
  if (detectCycle(next, graph, visitedSet, stackSet)) {
    return true;
  }
} else if (stackSet.has(next)) {
  return true; // back edge found
}

}

stackSet.delete(curr);
return false;
}

// builds tree recursively
function makeTree(node, graph) {

const kids = graph[node] || [];
let obj = {}; // could rename later maybe

for (let i = 0; i < kids.length; i++) {
const child = kids[i];
obj[child] = makeTree(child, graph);
}

return obj;
}

// depth calc — not super optimized but fine for this
function calcDepth(node, graph) {

const children = graph[node] || [];

if (children.length === 0) {
return 1;
}

// storing depths manually (instead of map inline)
let depthVals = [];

for (let i = 0; i < children.length; i++) {
depthVals.push(calcDepth(children[i], graph));
}

return 1 + Math.max(...depthVals);
}

// main API
export async function POST(req) {

const body = await req.json();
const inputData = body.data || [];

const invalid_entries = [];
const duplicate_edges = [];

const seen = new Set();
const validList = [];

// cleaning + validation
for (let i = 0; i < inputData.length; i++) {

let entry = inputData[i].trim();

if (!checkValidFormat(entry)) {
  invalid_entries.push(entry);
  continue;
}

if (seen.has(entry)) {
  // avoid pushing duplicates twice
  if (!duplicate_edges.includes(entry)) {
    duplicate_edges.push(entry);
  }
  continue;
}

seen.add(entry);
validList.push(entry);

}

// adjacency list
let adjList = {};
let parentMap = {}; // child -> parent
let nodesSet = new Set();

for (let i = 0; i < validList.length; i++) {

const edge = validList[i];
const parts = edge.split("->");

const parent = parts[0];
const child = parts[1];

nodesSet.add(parent);
nodesSet.add(child);

if (!adjList[parent]) adjList[parent] = [];
if (!adjList[child]) adjList[child] = [];

// only first parent counts (problem rule)
if (parentMap[child] === undefined) {
  parentMap[child] = parent;
  adjList[parent].push(child);
}

// else ignore silently (maybe log later?)

}

// find child nodes
const childSet = new Set(Object.keys(parentMap));

// roots = nodes that are never children
const roots = [...nodesSet].filter(n => !childSet.has(n)).sort();

// reverse adjacency (for component detection)
let reverseAdj = {};

for (let node of nodesSet) {
const children = adjList[node] || [];

for (let i = 0; i < children.length; i++) {
  const c = children[i];

  if (!reverseAdj[c]) reverseAdj[c] = [];
  reverseAdj[c].push(node);
}

}

// get connected component (both directions)
function getComponent(startNode) {

let comp = new Set();
let stack = [startNode];

while (stack.length > 0) {

  const node = stack.pop();

  if (comp.has(node)) continue;

  comp.add(node);

  const neighbors = [
    ...(adjList[node] || []),
    ...(reverseAdj[node] || [])
  ];

  for (let i = 0; i < neighbors.length; i++) {
    stack.push(neighbors[i]);
  }
}

return comp;

}

let visitedAll = new Set();
let components = [];

const sortedNodes = [...nodesSet].sort();

for (let i = 0; i < sortedNodes.length; i++) {

const node = sortedNodes[i];

if (!visitedAll.has(node)) {

  const comp = getComponent(node);

  comp.forEach(n => visitedAll.add(n));

  components.push(comp);
}

}

let hierarchies = [];

for (let i = 0; i < components.length; i++) {

const comp = components[i];
const compNodes = [...comp].sort();

const compRoots = compNodes.filter(n => !childSet.has(n));

// cycle detection
let visited = new Set();
let stack = new Set();
let hasCycleFlag = false;

for (let j = 0; j < compNodes.length; j++) {

  const n = compNodes[j];

  if (!visited.has(n)) {
    if (detectCycle(n, adjList, visited, stack)) {
      hasCycleFlag = true;
      break;
    }
  }
}

if (hasCycleFlag) {

  const root = compRoots.length > 0 ? compRoots[0] : compNodes[0];

  hierarchies.push({
    root,
    tree: {},
    has_cycle: true
  });

} else {

  const root = compRoots.length > 0 ? compRoots[0] : compNodes[0];

  const tree = { [root]: makeTree(root, adjList) };

  const depth = calcDepth(root, adjList);

  hierarchies.push({
    root,
    tree,
    depth
  });
}

}

// summary calc
const nonCycleList = hierarchies.filter(h => !h.has_cycle);

const total_trees = nonCycleList.length;
const total_cycles = hierarchies.filter(h => h.has_cycle).length;

let largest_tree_root = "";
let maxDepth = -1;

for (let i = 0; i < nonCycleList.length; i++) {

const h = nonCycleList[i];

if (
  h.depth > maxDepth ||
  (h.depth === maxDepth && h.root < largest_tree_root)
) {
  maxDepth = h.depth;
  largest_tree_root = h.root;
}

}

return NextResponse.json({
user_id: USER_ID,
email_id: EMAIL_ID,
college_roll_number: COLLEGE_ROLL_NUMBER,
hierarchies,
invalid_entries,
duplicate_edges,
summary: {
total_trees,
total_cycles,
largest_tree_root
}
});
}