import sys
import json
import bpy
class BlenderExtractor:
    @staticmethod
    def runExtraction():
        argv = sys.argv
        if ("--" not in argv):
            print("error: no arguments provided.")
            sys.exit(1)
        args = argv[argv.index("--") + 1:]
        if (len(args) != 3):
            print("error: expected 3 arguments: <fbxPath> <glbPath> <jsonPath>")
            sys.exit(1)
        fbxPath = args[0]
        glbPath = args[1]
        posePath = args[2]
        bpy.ops.wm.read_factory_settings(use_empty=True)
        print("importing: " + str(fbxPath))
        bpy.ops.import_scene.fbx(filepath=fbxPath)
        print("exporting glb to: " + str(glbPath))
        bpy.ops.export_scene.gltf(filepath=glbPath, export_format='GLB', use_selection=False, export_apply=True, export_animations=False)
        skeletonData = {}
        armature = None
        for obj in bpy.context.scene.objects:
            if (obj.type == 'ARMATURE'):
                armature = obj
                break
        if (armature != None):
            for bone in armature.pose.bones:
                skeletonData[bone.name] = {"head": [bone.head[0], bone.head[1], bone.head[2]], "tail": [bone.tail[0], bone.tail[1], bone.tail[2]]}
        print("exporting skeleton json to: " + str(posePath))
        with open(posePath, "w") as f:
            json.dump(skeletonData, f, indent=4)
        print("blender extraction completed successfully.")
if (__name__ == "__main__"):
    try:
        BlenderExtractor.runExtraction()
    except Exception as e:
        print("script failed: " + str(e), file=sys.stderr)
        sys.exit(1)