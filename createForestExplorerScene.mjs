import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { ShadowGenerator } from "@babylonjs/core/Lights/Shadows/shadowGenerator";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { VertexBuffer } from "@babylonjs/core/Buffers/buffer";
import { VertexData } from "@babylonjs/core/Meshes/mesh.vertexData";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { DynamicTexture } from "@babylonjs/core/Materials/Textures/dynamicTexture";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { Matrix, Quaternion, Vector3 } from "@babylonjs/core/Maths/math.vector";
import { SkyMaterial } from "@babylonjs/materials/sky";

/**
 * Drop-in Babylon.js outdoor explorer for SAMMe.
 *
 * Controls:
 *   - WASD / arrow keys: move
 *   - Shift: sprint
 *   - Mouse drag: orbit camera
 *   - Mouse wheel / pinch: zoom
 *
 * Attach your avatar by parenting the loaded root mesh to `avatarAnchor`.
 * The controller only moves/rotates `playerRoot`, so your animation system can
 * stay separate from the environment code.
 *
 * @param {Engine} engine Babylon engine
 * @param {HTMLCanvasElement} canvas Render canvas
 * @param {object} [options]
 * @param {number} [options.worldSize=280]
 * @param {number} [options.treeCount=260]
 * @param {boolean} [options.showDebugCapsule=false]
 * @param {(playerRoot: TransformNode) => void} [options.onPlayerMoved]
 */
export function createForestExplorerScene(engine, canvas, options = {}) {
  const worldSize = options.worldSize ?? 280;
  const treeCount = options.treeCount ?? 260;
  const showDebugCapsule = options.showDebugCapsule ?? false;

  const scene = new Scene(engine);
  scene.clearColor = new Color4(0.82, 0.92, 1.0, 1.0);
  scene.ambientColor = new Color3(0.35, 0.4, 0.35);
  scene.fogMode = Scene.FOGMODE_EXP2;
  scene.fogDensity = 0.0035;
  scene.fogColor = new Color3(0.83, 0.92, 1.0);
  scene.skipPointerMovePicking = true;

  const playerRoot = new TransformNode("playerRoot", scene);
  playerRoot.position = new Vector3(0, 0, 0);
  playerRoot.rotationQuaternion = Quaternion.Identity();

  const avatarAnchor = new TransformNode("avatarAnchor", scene);
  avatarAnchor.parent = playerRoot;
  avatarAnchor.position = new Vector3(0, 0, 0);

  const cameraTarget = new TransformNode("cameraTarget", scene);
  cameraTarget.parent = playerRoot;
  cameraTarget.position = new Vector3(0, 1.45, 0);

  const camera = new ArcRotateCamera(
    "explorerCamera",
    -Math.PI / 2,
    1.08,
    7.5,
    new Vector3(0, 1.45, 0),
    scene,
  );
  camera.lockedTarget = cameraTarget;
  camera.attachControl(canvas, true);
  camera.lowerRadiusLimit = 4.5;
  camera.upperRadiusLimit = 10.5;
  camera.lowerBetaLimit = 0.82;
  camera.upperBetaLimit = 1.38;
  camera.wheelDeltaPercentage = 0.02;
  camera.panningSensibility = 0;
  camera.minZ = 0.1;
  camera.maxZ = 2000;

  const hemiLight = new HemisphericLight("hemiLight", new Vector3(0, 1, 0), scene);
  hemiLight.intensity = 0.65;
  hemiLight.groundColor = new Color3(0.38, 0.33, 0.25);

  const sun = new DirectionalLight("sun", new Vector3(-0.45, -1.0, 0.2), scene);
  sun.position = new Vector3(160, 240, -120);
  sun.intensity = 2.3;

  const shadowGenerator = new ShadowGenerator(2048, sun);
  shadowGenerator.usePercentageCloserFiltering = true;
  shadowGenerator.bias = 0.00035;
  shadowGenerator.normalBias = 0.015;

  const sky = MeshBuilder.CreateSphere(
    "skySphere",
    { diameter: 1800, segments: 24, sideOrientation: Mesh.BACKSIDE },
    scene,
  );
  sky.isPickable = false;
  sky.infiniteDistance = true;

  const skyMaterial = new SkyMaterial("skyMaterial", scene);
  skyMaterial.backFaceCulling = false;
  skyMaterial.luminance = 1.15;
  skyMaterial.turbidity = 8;
  skyMaterial.rayleigh = 2.4;
  skyMaterial.mieCoefficient = 0.005;
  skyMaterial.mieDirectionalG = 0.8;
  skyMaterial.inclination = 0.47;
  skyMaterial.azimuth = 0.22;
  sky.material = skyMaterial;

  const terrainHeightAt = createTerrainSampler();
  const ground = createTerrain(scene, worldSize, terrainHeightAt);
  ground.material = createGrassMaterial(scene);
  ground.receiveShadows = true;
  ground.isPickable = false;

  const treePalette = createTreePalette(scene);
  treePalette.forEach((tree) => {
    tree.trunkMaster.material.freeze();
    tree.leafMaster.material.freeze();
    shadowGenerator.addShadowCaster(tree.trunkMaster);
    shadowGenerator.addShadowCaster(tree.leafMaster);
  });

  const treeColliders = scatterForest({
    scene,
    treePalette,
    treeCount,
    terrainHeightAt,
    worldSize,
    shadowGenerator,
  });

  createClouds(scene, worldSize);

  const debugCapsule = MeshBuilder.CreateCapsule(
    "debugCapsule",
    { height: 1.9, radius: 0.35, tessellation: 8 },
    scene,
  );
  debugCapsule.parent = playerRoot;
  debugCapsule.position.y = 0.95;
  debugCapsule.isPickable = false;
  debugCapsule.visibility = showDebugCapsule ? 0.55 : 0;
  const debugMat = new StandardMaterial("debugCapsuleMat", scene);
  debugMat.diffuseColor = new Color3(0.25, 0.45, 1.0);
  debugMat.specularColor = Color3.Black();
  debugCapsule.material = debugMat;
  shadowGenerator.addShadowCaster(debugCapsule);

  const playerRadius = 0.75;
  const moveState = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    sprint: false,
  };

  const onKeyDown = (event) => {
    const key = event.key.toLowerCase();
    if (key === "w" || key === "arrowup") moveState.forward = true;
    if (key === "s" || key === "arrowdown") moveState.backward = true;
    if (key === "a" || key === "arrowleft") moveState.left = true;
    if (key === "d" || key === "arrowright") moveState.right = true;
    if (key === "shift") moveState.sprint = true;
  };

  const onKeyUp = (event) => {
    const key = event.key.toLowerCase();
    if (key === "w" || key === "arrowup") moveState.forward = false;
    if (key === "s" || key === "arrowdown") moveState.backward = false;
    if (key === "a" || key === "arrowleft") moveState.left = false;
    if (key === "d" || key === "arrowright") moveState.right = false;
    if (key === "shift") moveState.sprint = false;
  };

  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);

  const tmpForward = new Vector3();
  const tmpRight = new Vector3();
  const tmpMove = new Vector3();
  const targetRotation = Quaternion.Identity();
  const up = Vector3.Up();
  const halfWorld = worldSize * 0.5 - 8;

  const tick = scene.onBeforeRenderObservable.add(() => {
    const dt = Math.min(engine.getDeltaTime() / 1000, 0.033);

    tmpForward.copyFrom(playerRoot.position).subtractInPlace(camera.position);
    tmpForward.y = 0;
    if (tmpForward.lengthSquared() < 0.0001) {
      tmpForward.set(0, 0, 1);
    } else {
      tmpForward.normalize();
    }

    Vector3.CrossToRef(up, tmpForward, tmpRight);
    tmpRight.normalize();

    tmpMove.set(0, 0, 0);
    if (moveState.forward) tmpMove.addInPlace(tmpForward);
    if (moveState.backward) tmpMove.subtractInPlace(tmpForward);
    if (moveState.right) tmpMove.addInPlace(tmpRight);
    if (moveState.left) tmpMove.subtractInPlace(tmpRight);

    if (tmpMove.lengthSquared() > 0) {
      tmpMove.normalize();
      const speed = moveState.sprint ? 9.5 : 5.8;
      tmpMove.scaleInPlace(speed * dt);

      const proposedX = clamp(playerRoot.position.x + tmpMove.x, -halfWorld, halfWorld);
      const proposedZ = clamp(playerRoot.position.z + tmpMove.z, -halfWorld, halfWorld);
      const resolved = resolveTreeCollision(proposedX, proposedZ, playerRadius, treeColliders);

      playerRoot.position.x = clamp(resolved.x, -halfWorld, halfWorld);
      playerRoot.position.z = clamp(resolved.z, -halfWorld, halfWorld);

      const yaw = Math.atan2(tmpMove.x, tmpMove.z);
      Quaternion.FromEulerAnglesToRef(0, yaw, 0, targetRotation);
      Quaternion.SlerpToRef(
        playerRoot.rotationQuaternion,
        targetRotation,
        Math.min(1, dt * 10),
        playerRoot.rotationQuaternion,
      );
    }

    playerRoot.position.y = terrainHeightAt(playerRoot.position.x, playerRoot.position.z);

    if (options.onPlayerMoved) {
      options.onPlayerMoved(playerRoot);
    }
  });

  const dispose = () => {
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("keyup", onKeyUp);
    scene.onBeforeRenderObservable.remove(tick);
    scene.dispose();
  };

  return {
    scene,
    camera,
    playerRoot,
    avatarAnchor,
    ground,
    dispose,
  };
}

function createTerrainSampler() {
  return (x, z) => {
    const low = Math.sin(x * 0.018) * 2.6 + Math.cos(z * 0.014) * 2.2;
    const mid = Math.sin((x + z) * 0.035) * 1.2 + Math.cos((x - z) * 0.028) * 0.95;
    const fine = Math.sin(x * 0.085) * Math.cos(z * 0.078) * 0.35;
    const distance = Math.sqrt(x * x + z * z);
    const flatness = smoothstep(10, 35, distance);
    return (low + mid + fine) * flatness;
  };
}

function createTerrain(scene, worldSize, terrainHeightAt) {
  const ground = MeshBuilder.CreateGround(
    "ground",
    { width: worldSize, height: worldSize, subdivisions: 180 },
    scene,
  );

  const positions = ground.getVerticesData(VertexBuffer.PositionKind);
  const indices = ground.getIndices();
  if (!positions || !indices) {
    return ground;
  }

  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i];
    const z = positions[i + 2];
    positions[i + 1] = terrainHeightAt(x, z);
  }
  ground.updateVerticesData(VertexBuffer.PositionKind, positions);

  const normals = [];
  VertexData.ComputeNormals(positions, indices, normals);
  ground.updateVerticesData(VertexBuffer.NormalKind, normals);
  return ground;
}

function createGrassMaterial(scene) {
  const textureSize = 512;
  const grassTexture = new DynamicTexture(
    "grassTexture",
    { width: textureSize, height: textureSize },
    scene,
    false,
  );
  const ctx = grassTexture.getContext();

  ctx.fillStyle = "#5b8f3a";
  ctx.fillRect(0, 0, textureSize, textureSize);

  for (let i = 0; i < 9000; i += 1) {
    const x = Math.random() * textureSize;
    const y = Math.random() * textureSize;
    const w = 1 + Math.random() * 2;
    const h = 3 + Math.random() * 6;
    ctx.fillStyle = i % 7 === 0 ? "rgba(154, 189, 96, 0.38)" : "rgba(49, 93, 30, 0.28)";
    ctx.fillRect(x, y, w, h);
  }

  for (let i = 0; i < 180; i += 1) {
    ctx.beginPath();
    ctx.fillStyle = "rgba(124, 98, 58, 0.14)";
    ctx.arc(
      Math.random() * textureSize,
      Math.random() * textureSize,
      4 + Math.random() * 10,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  grassTexture.wrapU = Texture.WRAP_ADDRESSMODE;
  grassTexture.wrapV = Texture.WRAP_ADDRESSMODE;
  grassTexture.uScale = 55;
  grassTexture.vScale = 55;
  grassTexture.anisotropicFilteringLevel = 8;
  grassTexture.update(false);

  const groundMaterial = new StandardMaterial("groundMaterial", scene);
  groundMaterial.diffuseTexture = grassTexture;
  groundMaterial.specularColor = new Color3(0.04, 0.04, 0.04);
  return groundMaterial;
}

function createTreePalette(scene) {
  const trunkBrown = new Color3(0.36, 0.24, 0.13);
  const leafGreen = new Color3(0.23, 0.48, 0.2);
  const leafGreenB = new Color3(0.2, 0.4, 0.16);
  const leafGreenC = new Color3(0.28, 0.52, 0.23);

  const trunkMatA = new StandardMaterial("trunkMatA", scene);
  trunkMatA.diffuseColor = trunkBrown;
  trunkMatA.specularColor = Color3.Black();

  const trunkMatB = new StandardMaterial("trunkMatB", scene);
  trunkMatB.diffuseColor = trunkBrown.scale(0.92);
  trunkMatB.specularColor = Color3.Black();

  const leafMatA = new StandardMaterial("leafMatA", scene);
  leafMatA.diffuseColor = leafGreen;
  leafMatA.specularColor = Color3.Black();

  const leafMatB = new StandardMaterial("leafMatB", scene);
  leafMatB.diffuseColor = leafGreenB;
  leafMatB.specularColor = Color3.Black();

  const leafMatC = new StandardMaterial("leafMatC", scene);
  leafMatC.diffuseColor = leafGreenC;
  leafMatC.specularColor = Color3.Black();

  const oakTrunk = MeshBuilder.CreateCylinder(
    "oakTrunkMaster",
    { height: 4.2, diameterTop: 0.42, diameterBottom: 0.65, tessellation: 8 },
    scene,
  );
  oakTrunk.position.y = 2.1;
  oakTrunk.material = trunkMatA;

  const oakCanopyA = MeshBuilder.CreateSphere("oakCanopyA", { diameter: 2.9, segments: 6 }, scene);
  oakCanopyA.scaling.set(1.25, 1.0, 1.2);
  oakCanopyA.position.set(0, 4.35, 0);

  const oakCanopyB = MeshBuilder.CreateSphere("oakCanopyB", { diameter: 2.5, segments: 6 }, scene);
  oakCanopyB.position.set(0.95, 4.0, 0.2);

  const oakCanopyC = MeshBuilder.CreateSphere("oakCanopyC", { diameter: 2.1, segments: 6 }, scene);
  oakCanopyC.position.set(-0.9, 4.0, -0.25);

  const oakLeaves = Mesh.MergeMeshes([oakCanopyA, oakCanopyB, oakCanopyC], true, true);
  oakLeaves.name = "oakLeavesMaster";
  oakLeaves.material = leafMatA;

  const pineTrunk = MeshBuilder.CreateCylinder(
    "pineTrunkMaster",
    { height: 5.4, diameterTop: 0.26, diameterBottom: 0.5, tessellation: 8 },
    scene,
  );
  pineTrunk.position.y = 2.7;
  pineTrunk.material = trunkMatB;

  const pineConeA = MeshBuilder.CreateCylinder(
    "pineConeA",
    { height: 3.2, diameterTop: 0.0, diameterBottom: 3.2, tessellation: 8 },
    scene,
  );
  pineConeA.position.y = 3.7;

  const pineConeB = MeshBuilder.CreateCylinder(
    "pineConeB",
    { height: 2.6, diameterTop: 0.0, diameterBottom: 2.45, tessellation: 8 },
    scene,
  );
  pineConeB.position.y = 5.0;

  const pineConeC = MeshBuilder.CreateCylinder(
    "pineConeC",
    { height: 1.8, diameterTop: 0.0, diameterBottom: 1.7, tessellation: 8 },
    scene,
  );
  pineConeC.position.y = 6.05;

  const pineLeaves = Mesh.MergeMeshes([pineConeA, pineConeB, pineConeC], true, true);
  pineLeaves.name = "pineLeavesMaster";
  pineLeaves.material = leafMatB;

  const roundTrunk = MeshBuilder.CreateCylinder(
    "roundTrunkMaster",
    { height: 3.7, diameterTop: 0.35, diameterBottom: 0.58, tessellation: 8 },
    scene,
  );
  roundTrunk.position.y = 1.85;
  roundTrunk.material = trunkMatA;

  const roundCanopyA = MeshBuilder.CreateSphere("roundCanopyA", { diameter: 2.8, segments: 6 }, scene);
  roundCanopyA.position.set(0, 3.9, 0);

  const roundCanopyB = MeshBuilder.CreateSphere("roundCanopyB", { diameter: 2.05, segments: 6 }, scene);
  roundCanopyB.position.set(0.85, 4.3, 0.15);

  const roundCanopyC = MeshBuilder.CreateSphere("roundCanopyC", { diameter: 1.95, segments: 6 }, scene);
  roundCanopyC.position.set(-0.85, 4.25, -0.2);

  const roundCanopyD = MeshBuilder.CreateSphere("roundCanopyD", { diameter: 1.65, segments: 6 }, scene);
  roundCanopyD.position.set(0.05, 4.85, -0.35);

  const roundLeaves = Mesh.MergeMeshes(
    [roundCanopyA, roundCanopyB, roundCanopyC, roundCanopyD],
    true,
    true,
  );
  roundLeaves.name = "roundLeavesMaster";
  roundLeaves.material = leafMatC;

  const masters = [
    { trunkMaster: oakTrunk, leafMaster: oakLeaves, radius: 1.55, scaleMin: 0.9, scaleMax: 1.2 },
    { trunkMaster: pineTrunk, leafMaster: pineLeaves, radius: 1.35, scaleMin: 0.95, scaleMax: 1.25 },
    { trunkMaster: roundTrunk, leafMaster: roundLeaves, radius: 1.5, scaleMin: 0.88, scaleMax: 1.15 },
  ];

  masters.forEach((tree, index) => {
    tree.trunkMaster.isPickable = false;
    tree.leafMaster.isPickable = false;
    tree.trunkMaster.receiveShadows = false;
    tree.leafMaster.receiveShadows = false;
    tree.trunkMaster.setEnabled(false);
    tree.leafMaster.setEnabled(false);
    tree.variantIndex = index;
  });

  return masters;
}

function scatterForest({ scene, treePalette, treeCount, terrainHeightAt, worldSize, shadowGenerator }) {
  const colliders = [];
  const placed = [];
  const half = worldSize * 0.5 - 10;
  const spawnClearRadius = 18;

  for (let i = 0; i < treeCount; i += 1) {
    const archetype = treePalette[i % treePalette.length];
    let attempt = 0;
    let point = null;

    while (attempt < 120 && !point) {
      attempt += 1;
      const x = randomRange(-half, half);
      const z = randomRange(-half, half);
      const d = Math.hypot(x, z);
      if (d < spawnClearRadius + Math.random() * 14) continue;

      const scale = randomRange(archetype.scaleMin, archetype.scaleMax);
      const radius = archetype.radius * scale;
      let blocked = false;

      for (let j = 0; j < placed.length; j += 1) {
        const other = placed[j];
        const minDist = other.radius + radius + 0.45;
        const dx = x - other.x;
        const dz = z - other.z;
        if (dx * dx + dz * dz < minDist * minDist) {
          blocked = true;
          break;
        }
      }
      if (blocked) continue;

      point = {
        x,
        z,
        y: terrainHeightAt(x, z),
        scale,
        radius,
        rotationY: Math.random() * Math.PI * 2,
        archetype,
      };
    }

    if (!point) continue;

    placed.push(point);
    colliders.push({ x: point.x, z: point.z, radius: point.radius * 0.7 });
  }

  placed.forEach((point, index) => {
    const trunk = point.archetype.trunkMaster.createInstance(`treeTrunk_${index}`);
    trunk.position.set(point.x, point.y, point.z);
    trunk.rotationQuaternion = Quaternion.FromEulerAngles(0, point.rotationY, 0);
    trunk.scaling.set(point.scale, point.scale, point.scale);
    trunk.isPickable = false;

    const leaves = point.archetype.leafMaster.createInstance(`treeLeaves_${index}`);
    leaves.position.copyFrom(trunk.position);
    leaves.rotationQuaternion = trunk.rotationQuaternion.clone();
    leaves.scaling.copyFrom(trunk.scaling);
    leaves.isPickable = false;

    shadowGenerator.addShadowCaster(trunk);
    shadowGenerator.addShadowCaster(leaves);
  });

  return colliders;
}

function createClouds(scene, worldSize) {
  const cloudMaterial = new StandardMaterial("cloudMaterial", scene);
  cloudMaterial.diffuseColor = new Color3(1, 1, 1);
  cloudMaterial.emissiveColor = new Color3(0.35, 0.35, 0.35);
  cloudMaterial.alpha = 0.92;
  cloudMaterial.specularColor = new Color3(0.05, 0.05, 0.05);

  const clouds = [];
  for (let i = 0; i < 7; i += 1) {
    const puffA = MeshBuilder.CreateSphere(`cloudA_${i}`, { diameter: 9 + Math.random() * 4, segments: 4 }, scene);
    puffA.scaling.set(1.4, 0.8, 1.1);
    puffA.position.set(0, 0, 0);

    const puffB = MeshBuilder.CreateSphere(`cloudB_${i}`, { diameter: 8 + Math.random() * 4, segments: 4 }, scene);
    puffB.scaling.set(1.2, 0.75, 1.2);
    puffB.position.set(4.5, 0.5, 0.2);

    const puffC = MeshBuilder.CreateSphere(`cloudC_${i}`, { diameter: 6 + Math.random() * 3, segments: 4 }, scene);
    puffC.scaling.set(1.1, 0.7, 1.0);
    puffC.position.set(-4.3, 0.15, -0.35);

    const puffD = MeshBuilder.CreateSphere(`cloudD_${i}`, { diameter: 5 + Math.random() * 2, segments: 4 }, scene);
    puffD.scaling.set(1.0, 0.6, 0.9);
    puffD.position.set(1.2, 1.15, -1.25);

    const cloud = Mesh.MergeMeshes([puffA, puffB, puffC, puffD], true, true);
    cloud.material = cloudMaterial;
    cloud.isPickable = false;
    cloud.position.set(
      randomRange(-worldSize * 0.45, worldSize * 0.45),
      42 + Math.random() * 16,
      randomRange(-worldSize * 0.45, worldSize * 0.45),
    );
    cloud.scaling.setAll(0.7 + Math.random() * 0.55);
    clouds.push({
      mesh: cloud,
      speed: 0.45 + Math.random() * 0.6,
      wrapLimit: worldSize * 0.6,
    });
  }

  scene.onBeforeRenderObservable.add(() => {
    const dt = Math.min(scene.getEngine().getDeltaTime() / 1000, 0.033);
    clouds.forEach((cloud) => {
      cloud.mesh.position.x += cloud.speed * dt;
      if (cloud.mesh.position.x > cloud.wrapLimit) {
        cloud.mesh.position.x = -cloud.wrapLimit;
      }
    });
  });
}

function resolveTreeCollision(targetX, targetZ, playerRadius, colliders) {
  let x = targetX;
  let z = targetZ;
  const maxIterations = 3;

  for (let iter = 0; iter < maxIterations; iter += 1) {
    let resolvedAny = false;
    for (let i = 0; i < colliders.length; i += 1) {
      const collider = colliders[i];
      const minDist = playerRadius + collider.radius;
      const dx = x - collider.x;
      const dz = z - collider.z;
      const distSq = dx * dx + dz * dz;
      if (distSq >= minDist * minDist) continue;

      const dist = Math.sqrt(Math.max(distSq, 0.000001));
      const push = minDist - dist;
      x += (dx / dist) * push;
      z += (dz / dist) * push;
      resolvedAny = true;
    }

    if (!resolvedAny) break;
  }

  return { x, z };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function smoothstep(edge0, edge1, x) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

function randomRange(min, max) {
  return min + Math.random() * (max - min);
}
