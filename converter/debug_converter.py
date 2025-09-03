"""
Debug version of the Wallpaper Engine to Web Exporter - Core Conversion Logic

This module implements a debug version of the core conversion logic for transforming Wallpaper Engine
scene wallpapers into self-contained web projects that use the new rendering engine.
"""

import os
import json
import shutil
import logging
from pathlib import Path
from typing import Dict, List, Any, Optional

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


def find_project_json_file(base_path: Path) -> Optional[Path]:
    """Find the project.json file, looking in common subdirectories if not in the root."""
    # Prefer scene.json over project.json as it contains the objects data
    if (base_path / "scene.json").is_file():
        return base_path / "scene.json"
    if (base_path / "project.json").is_file():
        return base_path / "project.json"
    # Add more potential locations if necessary
    return None


def parse_position(pos_str: str) -> List[float]:
    """Parse a position string into a list of floats."""
    if isinstance(pos_str, dict):
        # Handle dictionary case by converting to string
        pos_str = " ".join(str(v) for v in pos_str.values())
    # Handle script values by using a default
    if isinstance(pos_str, str) and pos_str.strip().startswith("'use"):
        return [0, 0, 0]
    return [float(x) for x in pos_str.split()]


def parse_scale(scale_str: str) -> List[float]:
    """Parse a scale string into a list of floats."""
    if isinstance(scale_str, dict):
        # Handle dictionary case by converting to string
        scale_str = " ".join(str(v) for v in scale_str.values())
    # Handle script values by using a default
    if isinstance(scale_str, str) and scale_str.strip().startswith("'use"):
        return [1, 1, 1]
    return [float(x) for x in scale_str.split()]


def parse_particle_settings(particle_data: Dict) -> Dict:
    """Parse particle system settings from Wallpaper Engine particle data."""
    settings = {
        "emissionRate": 10,  # Default value
        "lifetime": 5,       # Default value
        "velocity": {"x": 0, "y": 0},
        "color": "#FFFFFF",
        "size": 2,
        "spread": 0
    }
    
    # Extract emission rate from emitter data
    if "emitter" in particle_data and particle_data["emitter"]:
        emitter = particle_data["emitter"][0]  # Take first emitter
        if "rate" in emitter:
            settings["emissionRate"] = emitter["rate"]
        if "speedmax" in emitter:
            # Use speedmax for velocity
            settings["velocity"]["x"] = emitter["speedmax"]
    
    # Extract lifetime from initializer data
    if "initializer" in particle_data:
        for initializer in particle_data["initializer"]:
            if initializer.get("name") == "lifetimerandom":
                # Take average of min and max
                min_life = initializer.get("min", 5)
                max_life = initializer.get("max", 5)
                settings["lifetime"] = (min_life + max_life) / 2
            elif initializer.get("name") == "sizerandom":
                # Take average of min and max
                min_size = initializer.get("min", 2)
                max_size = initializer.get("max", 2)
                settings["size"] = (min_size + max_size) / 2
            elif initializer.get("name") == "colorrandom":
                # Take the first color as default
                if "min" in initializer:
                    color_str = initializer["min"]
                    if isinstance(color_str, str):
                        # Convert "R G B" format to hex
                        rgb = [int(float(x) * 255) for x in color_str.split()]
                        settings["color"] = f"#{rgb[0]:02x}{rgb[1]:02x}{rgb[2]:02x}"
    
    # Extract velocity from initializer data
    if "initializer" in particle_data:
        for initializer in particle_data["initializer"]:
            if initializer.get("name") == "velocityrandom":
                # Take average of min and max for x and y
                if "min" in initializer and "max" in initializer:
                    min_vel = initializer["min"]
                    max_vel = initializer["max"]
                    if isinstance(min_vel, str) and isinstance(max_vel, str):
                        min_parts = min_vel.split()
                        max_parts = max_vel.split()
                        if len(min_parts) >= 2 and len(max_parts) >= 2:
                            settings["velocity"]["x"] = (float(min_parts[0]) + float(max_parts[0])) / 2
                            settings["velocity"]["y"] = (float(min_parts[1]) + float(max_parts[1])) / 2
    
    return settings


def convert_wallpaper_engine_project(project_path: Path, output_path: Path, verbose: bool = False):
    """
    Converts a single Wallpaper Engine project to the new web format.

    Args:
        project_path: Path to the unpacked Wallpaper Engine project directory.
        output_path: Path to the directory where the web-compatible project will be saved.
        verbose: If True, print detailed information about the conversion process.
    """
    if verbose:
        logger.setLevel(logging.DEBUG)
    
    logger.info(f"Starting conversion for project: {project_path.name}")

    # 1. Clean and create output directory
    if output_path.exists():
        shutil.rmtree(output_path)
    output_path.mkdir(parents=True)
    assets_output_path = output_path / 'assets'
    assets_output_path.mkdir()

    # 2. Read Wallpaper Engine project.json
    project_json_path = find_project_json_file(project_path)
    if not project_json_path:
        logger.error(f"Could not find project.json or scene.json in {project_path}")
        return

    with open(project_json_path, 'r', encoding='utf-8') as f:
        we_project_data = json.load(f)

    logger.info(f"Project data keys: {list(we_project_data.keys())}")

    # 3. Build the new project.json data model
    new_project_data = {
        "projectInfo": {
            "name": we_project_data.get("title", "Untitled"),
            "id": project_path.name,
            "file": we_project_data.get("file"),
            "preview": we_project_data.get("preview"),
        },
        "assets": {"images": {}, "videos": {}, "models": {}},
        "layers": [],
        "userProperties": we_project_data.get("general", {}).get("properties", {}),
    }

    # 4. Process layers and assets
    if "objects" in we_project_data:  # For scene.json format
        layers_data = we_project_data["objects"]
        logger.info(f"Found objects key with {len(layers_data)} layers")
    else:  # Fallback for other formats
        layers_data = []
        logger.info("No objects key found in project data")

    logger.info(f"Processing {len(layers_data)} layers")

    for i, we_layer in enumerate(layers_data):
        asset_key = we_layer.get("name") or f"layer_{i}"
        logger.info(f"Processing layer {i}: {asset_key}")
        logger.info(f"Layer keys: {list(we_layer.keys())}")
        
        # Handle particle layers
        if "particle" in we_layer:
            particle_file = we_layer.get("particle")
            logger.info(f"Found particle layer: {particle_file}")
            if particle_file:
                # Parse particle system
                particle_path = project_path / particle_file
                if particle_path.exists():
                    with open(particle_path, 'r', encoding='utf-8') as f:
                        particle_data = json.load(f)
                    
                    # Create particle layer entry
                    new_layer = {
                        "name": we_layer.get("name", f"Particle Layer {i}"),
                        "type": "particles",
                        "particleSettings": parse_particle_settings(particle_data),
                        "transform": {
                            "position": parse_position(we_layer.get("origin", "0 0 0")),
                            "scale": parse_scale(we_layer.get("scale", "1 1 1")),
                            "rotation": 0,
                        },
                        "effects": [],
                    }
                    
                    # Add parallax effect if present
                    if "parallaxDepth" in we_layer:
                        new_layer["effects"].append({
                            "name": "parallax",
                            "intensity": 1.0,  # Default intensity
                            "depth": float(we_layer["parallaxDepth"].split()[0])  # Use first value for depth
                        })
                    
                    new_project_data["layers"].append(new_layer)
                    logger.info(f"Added particle layer: {new_layer['name']}")
                else:
                    logger.warning(f"Particle file not found: {particle_path}")
        # Handle shader layers (effects)
        elif "effects" in we_layer and we_layer["effects"]:
            logger.info(f"Found effect layer with {len(we_layer['effects'])} effects")
            # Process all effects in this layer
            for j, effect in enumerate(we_layer["effects"]):
                if "file" in effect:
                    effect_file = effect.get("file")
                    logger.info(f"Processing effect file: {effect_file}")
                    effect_path = project_path / effect_file
                    if effect_path.exists():
                        # Extract shader directory and name
                        shader_dir = effect_path.parent
                        shader_name = effect_path.stem  # Name without extension
                        
                        # Copy shader files if they exist (check both effects/ and shaders/effects/ directories)
                        vert_filenames = []
                        frag_filenames = []
                        
                        # Check in shaders/effects/ directory (newer format)
                        vert_file = project_path / "shaders" / "effects" / f"{shader_name}.vert"
                        frag_file = project_path / "shaders" / "effects" / f"{shader_name}.frag"
                        
                        logger.info(f"Looking for vertex shader: {vert_file} - exists: {vert_file.exists()}")
                        logger.info(f"Looking for fragment shader: {frag_file} - exists: {frag_file.exists()}")
                        
                        if vert_file.exists():
                            shutil.copy(vert_file, assets_output_path)
                            vert_filenames.append(vert_file.name)
                            logger.info(f"Copied vertex shader: {vert_file.name}")
                            
                        if frag_file.exists():
                            shutil.copy(frag_file, assets_output_path)
                            frag_filenames.append(frag_file.name)
                            logger.info(f"Copied fragment shader: {frag_file.name}")
                        
                        # If not found in shaders/effects/, check in effects/ directory (older format)
                        if not vert_file.exists() and not frag_file.exists():
                            vert_file = shader_dir / f"{shader_name}.vert"
                            frag_file = shader_dir / f"{shader_name}.frag"
                            
                            logger.info(f"Looking for vertex shader (fallback): {vert_file} - exists: {vert_file.exists()}")
                            logger.info(f"Looking for fragment shader (fallback): {frag_file} - exists: {frag_file.exists()}")
                            
                            if vert_file.exists():
                                shutil.copy(vert_file, assets_output_path)
                                vert_filenames.append(vert_file.name)
                                logger.info(f"Copied vertex shader: {vert_file.name}")
                                
                            if frag_file.exists():
                                shutil.copy(frag_file, assets_output_path)
                                frag_filenames.append(frag_file.name)
                                logger.info(f"Copied fragment shader: {frag_file.name}")
                        
                        # Also copy any dependencies listed in the effect.json file
                        try:
                            with open(effect_path, 'r', encoding='utf-8') as f:
                                effect_data = json.load(f)
                            logger.info(f"Effect data: {effect_data}")
                            if "dependencies" in effect_data:
                                for dep in effect_data["dependencies"]:
                                    dep_path = project_path / dep
                                    logger.info(f"Processing dependency: {dep_path} - exists: {dep_path.exists()}")
                                    if dep_path.exists() and dep_path.is_file():
                                        # Only copy files, not directories
                                        target_path = assets_output_path / dep_path.name
                                        if not target_path.exists():
                                            shutil.copy(dep_path, assets_output_path)
                                            logger.info(f"Copied dependency: {dep_path.name}")
                                            # Add to shader filenames if it's a shader file
                                            if dep_path.suffix == '.vert':
                                                vert_filenames.append(dep_path.name)
                                                logger.info(f"Added vertex shader dependency: {dep_path.name}")
                                            elif dep_path.suffix == '.frag':
                                                frag_filenames.append(dep_path.name)
                                                logger.info(f"Added fragment shader dependency: {dep_path.name}")
                        except Exception as e:
                            logger.warning(f"Error processing effect dependencies: {e}")
                        
                        # Create shader layer entry (one per effect)
                        effect_layer_name = we_layer.get("name", f"Shader Layer {i}") 
                        if len(we_layer["effects"]) > 1:
                            effect_layer_name = f"{effect_layer_name} ({j+1})"
                            
                        logger.info(f"Creating shader layer with vertex shaders: {vert_filenames} and fragment shaders: {frag_filenames}")
                        new_layer = {
                            "name": effect_layer_name,
                            "type": "shader",
                            "shader": {
                                "vertexShaders": [f"assets/{name}" for name in vert_filenames] if vert_filenames else [],
                                "fragmentShaders": [f"assets/{name}" for name in frag_filenames] if frag_filenames else [],
                                "uniforms": {}  # Would need to parse uniforms from effect data
                            },
                            "transform": {
                                "position": parse_position(we_layer.get("origin", "0 0 0")),
                                "scale": parse_scale(we_layer.get("scale", "1 1 1")),
                                "rotation": 0,
                            },
                            "effects": [],
                        }
                        
                        # Add parallax effect if present
                        if "parallaxDepth" in we_layer:
                            new_layer["effects"].append({
                                "name": "parallax",
                                "intensity": 1.0,  # Default intensity
                                "depth": float(we_layer["parallaxDepth"].split()[0])  # Use first value for depth
                            })
                        
                        new_project_data["layers"].append(new_layer)
                        logger.info(f"Added shader layer: {new_layer['name']}")
                    else:
                        logger.warning(f"Effect file not found: {effect_path}")
        else:
            # Handle regular image layers
            layer_file = we_layer.get("image") or we_layer.get("file")
            logger.info(f"Processing image layer: {layer_file}")
            if not layer_file:
                logger.info("Skipping layer with no image/file reference")
                continue

            # Copy asset to output and add to the new data model
            source_asset_path = project_path / layer_file
            if source_asset_path.exists():
                # Handle both direct files and JSON model references
                if source_asset_path.suffix == '.json':
                    # For JSON models, we need to parse them to get the actual image
                    try:
                        with open(source_asset_path, 'r', encoding='utf-8') as f:
                            model_data = json.load(f)
                        # Extract image path from model data
                        if "textures" in model_data and model_data["textures"]:
                            # Take the first texture
                            texture_data = model_data["textures"][0]
                            if "file" in texture_data:
                                actual_image_path = source_asset_path.parent / texture_data["file"]
                                if actual_image_path.exists():
                                    shutil.copy(actual_image_path, assets_output_path)
                                    asset_filename = actual_image_path.name
                                    new_project_data["assets"]["images"][asset_key] = f"assets/{asset_filename}"
                                    logger.info(f"Copied image asset: {asset_filename}")
                                else:
                                    logger.warning(f"Referenced image file not found: {actual_image_path}")
                                    continue
                            else:
                                logger.warning(f"No file reference in texture data: {texture_data}")
                                continue
                        else:
                            logger.warning(f"No textures found in model: {source_asset_path}")
                            continue
                    except Exception as e:
                        logger.warning(f"Error parsing model file {source_asset_path}: {e}")
                        continue
                else:
                    # Direct image file
                    shutil.copy(source_asset_path, assets_output_path)
                    asset_filename = source_asset_path.name
                    new_project_data["assets"]["images"][asset_key] = f"assets/{asset_filename}"
                    logger.info(f"Copied image asset: {asset_filename}")

                # Create layer entry
                new_layer = {
                    "name": we_layer.get("name", f"Layer {i}"),
                    "type": "image",
                    "asset_key": asset_key,
                    "transform": {
                        "position": parse_position(we_layer.get("origin", "0 0 0")),
                        "scale": parse_scale(we_layer.get("scale", "1 1 1")),
                        "rotation": float(we_layer.get("angles", "0 0 0").split()[2]) if "angles" in we_layer else 0,
                    },
                    "effects": [],
                }

                # Add parallax effect if present
                if "parallaxDepth" in we_layer:
                    new_layer["effects"].append({
                        "name": "parallax",
                        "intensity": 1.0,  # Default intensity
                        "depth": float(we_layer["parallaxDepth"].split()[0])  # Use first value for depth
                    })

                new_project_data["layers"].append(new_layer)
                logger.info(f"Added image layer: {new_layer['name']}")
            else:
                logger.warning(f"Asset file not found: {source_asset_path}")

    logger.info(f"Total layers processed: {len(new_project_data['layers'])}")

    # 5. Write the new project.json
    with open(output_path / 'project.json', 'w', encoding='utf-8') as f:
        json.dump(new_project_data, f, indent=4)

    # 6. Copy renderer and HTML template
    shutil.copy('src/engine/renderer.js', output_path)
    shutil.copy('src/engine/particles.js', output_path)
    shutil.copy('src/engine/shaders.js', output_path)
    shutil.copy('templates/index.html', output_path)

    logger.info(f"Successfully converted project: {project_path.name}")


def main(verbose: bool = False):
    """
    Main execution function to convert all found Wallpaper Engine projects.

    Args:
        verbose: If True, print detailed information about the conversion process.
    """
    unpacked_projects_dir = Path('output/unpacked')
    web_output_dir = Path('output/web')

    if not unpacked_projects_dir.exists():
        logger.error("Unpacked projects directory not found: 'output/unpacked'")
        return

    for project_dir in unpacked_projects_dir.iterdir():
        if project_dir.is_dir():
            output_project_path = web_output_dir / project_dir.name
            convert_wallpaper_engine_project(project_dir, output_project_path, verbose)


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Convert Wallpaper Engine projects to web format (debug version)")
    parser.add_argument("--verbose", "-v", action="store_true", help="Enable verbose output")
    
    args = parser.parse_args()
    main(verbose=args.verbose)