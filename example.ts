import pastesh from "node-pastesh";

(async () => {
  const url = await pastesh.create("This is the body of the paste.");
  console.log(`Paste created successfully: ${url}`);
})();
