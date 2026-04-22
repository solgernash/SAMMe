import asyncio
import httpx
import os
import json
from core.config import config

class ComfyUIClient:
    
    @staticmethod
    async def processImage(imagePath: str, outputDir: str) -> str:
        jsonPath = os.path.join(os.path.dirname(__file__), "rigging.json")
        with open(jsonPath, "r", encoding="utf-8") as f:
            promptWorkflow = json.load(f)
        if ("3" in promptWorkflow):
            promptWorkflow["3"]["inputs"]["image"] = imagePath
        expectedFbxPath = os.path.join(outputDir, "sam3d_rigged.fbx")
        expectedFbxPath = expectedFbxPath.replace("\\", "/")
        if ("12" in promptWorkflow):
            promptWorkflow["12"]["inputs"]["output_filename"] = expectedFbxPath
        promptWorkflow.pop("4", None)
        promptWorkflow.pop("13", None)
        payload = {"prompt": promptWorkflow}
        async with httpx.AsyncClient(timeout=30.0) as client:
            triggerUrl = config.comfy_api_url + "/prompt"
            response = await client.post(triggerUrl, json=payload)
            response.raise_for_status()
            promptId = response.json().get("prompt_id")
            historyUrl = config.comfy_api_url + "/history/" + str(promptId)
            maxAttempts = 150 
            attempts = 0
            while (attempts < maxAttempts):
                await asyncio.sleep(2) 
                attempts += 1
                try:
                    histResp = await client.get(historyUrl)
                    if ((histResp.status_code == 200) and (histResp.json() != None)):
                        break
                except httpx.RequestError:
                    continue
            else:
                raise TimeoutError("comfyui generation timed out or failed to report history.")
        return expectedFbxPath