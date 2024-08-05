import pastesh from "./src/index";

(async () => {
  const url = await pastesh.create(
    "나는 유리를 먹을 수 있어요. 그래도 아프지 않아요\nI can eat glass and it doesn't hurt me."
  );
  console.log(`Paste created successfully: ${url}`);
})();
