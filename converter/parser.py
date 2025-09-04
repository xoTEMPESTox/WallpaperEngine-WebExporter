import json
import logging
import os
import subprocess
import tempfile

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def parse_project_to_ir(project_path):
    """
    Parses an unpacked Wallpaper Engine project directory into a standardized STL IR JSON format.
    """
    if not os.path.isdir(project_path):
        logging.error(f"Project path does not exist or is not a directory: {project_path}")
        return None

    scene_file_path = os.path.join(project_path, 'scene.json')
    if not os.path.exists(scene_file_path):
        logging.error(f"scene.json not found in project: {project_path}")
        return None

    stl_ir = {
        "version": "1.0",
        "scene": {
            "layers": [],
            "particles": [],
            "effects": [],
            "shaders": [],
            "audio": [],
            "ui": {}
        }
    }

    with open(scene_file_path, 'r') as f:
        scene_data = json.load(f)

    # Simulate parsing general properties
    if "general" in scene_data and "properties" in scene_data["general"]:
        for key, prop in scene_data["general"]["properties"].items():
            if key == "unsupported_prop": # Example of an unsupported property
                logging.warning(f"Unsupported general property found: {key}")
    
    # Simulate parsing layers
    if "layers" in scene_data:
        for i, layer in enumerate(scene_data["layers"]):
            layer_type = layer.get("type")
            if layer_type in ["image", "video"]:
                stl_ir["scene"]["layers"].append({
                    "name": layer.get("name", f"Layer {i}"),
                    "type": layer_type,
                    "source": layer.get("file")
                    # In a real implementation, we would normalize coordinates, etc.
                })
            else:
                logging.warning(f"Unsupported layer type found: {layer_type}")

    # Simulate parsing effects
    if "effects" in scene_data:
        for effect in scene_data["effects"]:
            if effect.get("type") == "unsupported_effect":
                logging.warning(f"Unsupported effect type found: {effect.get('name')}")
    
    logging.info("Scene parsing complete. See warnings for unsupported features.")
    return stl_ir

def handle_pkg_input(pkg_path, emit_ir_path):
    """
    Handles .pkg file inputs by unpacking them using RePKG and emitting IR.
    """
    with tempfile.TemporaryDirectory() as temp_dir:
        try:
            logging.info(f"Unpacking {pkg_path} to {temp_dir}...")
            # Ensure RePKG is available in the environment path
            subprocess.run(['RePKG', 'unpack', '-i', pkg_path, '-o', temp_dir], check=True, capture_output=True, text=True)
            
            logging.info("Unpacking complete. Parsing for STL IR...")
            stl_ir = parse_project_to_ir(temp_dir)
            
            if stl_ir and emit_ir_path:
                with open(emit_ir_path, 'w') as f:
                    json.dump(stl_ir, f, indent=4)
                logging.info(f"STL IR successfully generated at {emit_ir_path}")
            elif not emit_ir_path:
                logging.error("No output path provided for the IR file (--emit-ir).")

        except subprocess.CalledProcessError as e:
            logging.error(f"Failed to unpack {pkg_path}: {e}")
        except FileNotFoundError:
            logging.error("RePKG not found. Please ensure it is installed and in your PATH.")

if __name__ == '__main__':
    # Example usage (for testing)
    # This part will be driven by orchestrator.py in the final implementation
    
    # Test with a directory
    # project_path = 'path/to/unpacked/project'
    # ir = parse_project_to_ir(project_path)
    # if ir:
    #     print(json.dumps(ir, indent=4))

    # Test with a .pkg file
    # pkg_file = 'path/to/project.pkg'
    # handle_pkg_input(pkg_file, 'tmp')
    pass