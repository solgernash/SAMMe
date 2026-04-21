# SAMMe
SAMMe (pronounced Sammy) is a Three.js web application where end users upload full-body photos that are made into 3D models using SAM3D Body. Then users can use their own models to explore the environment. This is a projected created for Dr. Yiheng Liang's Software Engineering 4050/6050. The student collaborators are Nash Carroll, Eric Liu, Chris Ambrose, Daniel Shaji, Shiv Pandey, and Asher Oortman.

Chris(4/20 - frontend photo upload flow)
to run backend skeleton, cd backend_chris, run pip3 install -r requirements.txt, then run uvicorn app.main:app --reload
to run frontend open a seperate terminal and run npm run dev inside the samme-forest-test directory. you may need to run npm install first

Asher(4/20 - 3D processing)
/generate actually makes a .glb now. it runs in the background, the GPU lock keeps requests from stepping on each other, and the avatar flips from processing to ready (or failed). the frontend picks it up by polling /avatars.

two backends, pick with INFERENCE_BACKEND:
  - stub (default) - fake humanoid .glb, no GPU needed. use this when you're not on the NVIDIA machine.
  - sam3d - Only works on the CUDA box. needs the SAM 3D Body package installed and SAM3D_CHECKPOINT pointed at model.ckpt.

so to run: INFERENCE_BACKEND=stub uvicorn app.main:app --reload (or just skip the env var, stub is default)