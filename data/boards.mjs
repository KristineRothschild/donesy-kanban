export const boards = [
  {
    id: 1,
    name: "Application Development 1",
    description: "Group project",
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    name: "Application Development 2",
    description: "Individual project",
    createdAt: new Date().toISOString(),
  },
];

let nextBoardId = 3;

export function getNextBoardId() {
  return nextBoardId++;
}
