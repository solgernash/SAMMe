import os
import asyncio
class BpyProcessor:
    @staticmethod
    async def runDoubleExtraction(fbxPath: str, userId: str, avatarId: str) -> tuple[str, str]:
        outputDir = os.path.dirname(fbxPath)
        meshPath = os.path.join(outputDir, str(avatarId) + "_rest.glb")
        posePath = os.path.join(outputDir, str(avatarId) + "_pose.json")
        blenderScript = os.path.join(os.path.dirname(__file__), "blender_wash_logic.py")
        cmd = ["blender", "-b", "-P", blenderScript, "--", fbxPath, meshPath, posePath]
        process = await asyncio.create_subprocess_exec(*cmd, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE)
        stdout, stderr = await process.communicate()
        if (process.returncode != 0):
            errorMsg = stderr.decode().strip()
            raise RuntimeError("blender extraction failed: " + str(errorMsg))
        return meshPath, posePath