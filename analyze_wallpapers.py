import os
import json
import glob
from collections import defaultdict, Counter
from pathlib import Path

# Constants
UNPACKED_DIR = "output/unpacked"
REPORT_FILE = "wallpaper_analysis_report.md"

def get_file_extension_counts(directory):
    """Count files by extension in a directory recursively"""
    extension_counts = defaultdict(int)
    file_list = []
    
    for root, dirs, files in os.walk(directory):
        for file in files:
            ext = os.path.splitext(file)[1].lower()
            extension_counts[ext] += 1
            file_list.append(os.path.join(root, file))
    
    return extension_counts, file_list

def extract_metadata(wallpaper_path):
    """Extract metadata from project.json"""
    metadata = {
        "id": os.path.basename(wallpaper_path),
        "title": "Unknown",
        "author": "Unknown",
        "resolution": "Unknown",
        "tags": []
    }
    
    project_file = os.path.join(wallpaper_path, "project.json")
    scene_file = os.path.join(wallpaper_path, "scene.json")
    
    # Extract from project.json
    if os.path.exists(project_file):
        try:
            with open(project_file, "r", encoding="utf-8") as f:
                project_data = json.load(f)
                metadata["title"] = project_data.get("title", "Unknown")
                metadata["tags"] = project_data.get("tags", [])
                
                # Try to get author from description or other fields
                if "author" in project_data:
                    metadata["author"] = project_data["author"]
                elif "description" in project_data:
                    # Simple heuristic - author might be mentioned in description
                    desc = project_data["description"]
                    if "by" in desc:
                        # Try to extract author from "by Author Name" pattern
                        parts = desc.split("by")
                        if len(parts) > 1:
                            metadata["author"] = parts[1].split("\n")[0].strip()
        except Exception as e:
            print(f"Error reading project.json for {wallpaper_path}: {e}")
    
    # Extract resolution from scene.json
    if os.path.exists(scene_file):
        try:
            with open(scene_file, "r", encoding="utf-8") as f:
                scene_data = json.load(f)
                if "general" in scene_data and "orthogonalprojection" in scene_data["general"]:
                    proj = scene_data["general"]["orthogonalprojection"]
                    if "width" in proj and "height" in proj:
                        metadata["resolution"] = f"{proj['width']}x{proj['height']}"
        except Exception as e:
            print(f"Error reading scene.json for {wallpaper_path}: {e}")
    
    return metadata

def categorize_assets(wallpaper_path):
    """Categorize assets in the wallpaper"""
    assets = {
        "images": [],
        "videos": [],
        "shaders": [],
        "models": [],
        "particles": [],
        "effects": [],
        "audio": []
    }
    
    # Count files by extension
    extension_counts, all_files = get_file_extension_counts(wallpaper_path)
    
    # Categorize files
    for file_path in all_files:
        ext = os.path.splitext(file_path)[1].lower()
        rel_path = os.path.relpath(file_path, wallpaper_path)
        
        # Images (including TEX files that would be converted to PNG)
        if ext in [".png", ".jpg", ".jpeg", ".bmp", ".tga", ".tex"]:
            assets["images"].append(rel_path)
        
        # Videos
        elif ext in [".mp4", ".webm", ".gif"]:
            assets["videos"].append(rel_path)
        
        # Shaders
        elif ext in [".glsl", ".fx", ".hlsl", ".frag", ".vert", ".geom", ".comp"]:
            assets["shaders"].append(rel_path)
        
        # Models
        elif ext in [".fbx", ".obj", ".dae", ".3ds", ".blend"]:
            assets["models"].append(rel_path)
        
        # Audio
        elif ext in [".mp3", ".wav", ".ogg", ".flac"]:
            assets["audio"].append(rel_path)
    
    # Special directories
    particles_dir = os.path.join(wallpaper_path, "particles")
    if os.path.exists(particles_dir):
        for root, dirs, files in os.walk(particles_dir):
            for file in files:
                if file.endswith(".json"):
                    rel_path = os.path.relpath(os.path.join(root, file), wallpaper_path)
                    assets["particles"].append(rel_path)
    
    effects_dir = os.path.join(wallpaper_path, "effects")
    if os.path.exists(effects_dir):
        for root, dirs, files in os.walk(effects_dir):
            for file in files:
                if file.endswith(".json"):
                    rel_path = os.path.relpath(os.path.join(root, file), wallpaper_path)
                    assets["effects"].append(rel_path)
    
    return assets

def classify_complexity(assets, scene_data=None):
    """Classify the complexity type of the wallpaper"""
    has_videos = len(assets["videos"]) > 0
    has_images = len(assets["images"]) > 0
    has_particles = len(assets["particles"]) > 0
    has_shaders = len(assets["shaders"]) > 0
    has_models = len(assets["models"]) > 0
    has_effects = len(assets["effects"]) > 0
    
    # Determine if it's parallax-based
    is_parallax = False
    if scene_data and "objects" in scene_data:
        for obj in scene_data.get("objects", []):
            if "parallaxDepth" in obj and obj["parallaxDepth"] != "0.000 0.000":
                is_parallax = True
                break
    
    # Classification logic
    categories = []
    if has_videos:
        categories.append("video")
    if is_parallax and has_images:
        categories.append("parallax")
    if has_particles and not has_videos and not is_parallax:
        categories.append("particles")
    if (has_shaders or has_effects) and not has_videos and not is_parallax:
        categories.append("shader")
    
    # Determine primary type
    if len(categories) == 0:
        return "static_image", []
    elif len(categories) == 1:
        return categories[0], categories
    else:
        return "hybrid", categories

def suggest_conversion_strategy(complexity_type, subcategories, assets):
    """Suggest the best conversion strategy"""
    strategies = {
        "video": "Video → `<video>` background",
        "parallax": "Parallax → Pixi.js / Three.js layers",
        "particles": "Particles → Pixi.js emitters",
        "shader": "Shaders/Effects → fallback pre-render video, or shader port if feasible",
        "static_image": "Static image → `<img>` background",
        "hybrid": "Hybrid → combine approaches"
    }
    
    base_strategy = strategies.get(complexity_type, "Unknown → manual analysis required")
    
    # Add details based on assets
    details = []
    if "video" in subcategories:
        details.append(f"{len(assets['videos'])} video files")
    if "parallax" in subcategories:
        details.append(f"{len(assets['images'])} image layers")
    if "particles" in subcategories:
        details.append(f"{len(assets['particles'])} particle systems")
    if "shader" in subcategories:
        details.append(f"{len(assets['shaders'])} shader files")
    
    if details:
        base_strategy += f" ({', '.join(details)})"
    
    return base_strategy

def analyze_wallpaper(wallpaper_path):
    """Analyze a single wallpaper"""
    # Extract metadata
    metadata = extract_metadata(wallpaper_path)
    
    # Categorize assets
    assets = categorize_assets(wallpaper_path)
    
    # Load scene data for complexity analysis
    scene_data = None
    scene_file = os.path.join(wallpaper_path, "scene.json")
    if os.path.exists(scene_file):
        try:
            with open(scene_file, "r", encoding="utf-8") as f:
                scene_data = json.load(f)
        except Exception as e:
            print(f"Error loading scene.json: {e}")
    
    # Classify complexity
    complexity_type, subcategories = classify_complexity(assets, scene_data)
    
    # Suggest conversion strategy
    conversion_strategy = suggest_conversion_strategy(complexity_type, subcategories, assets)
    
    return {
        "metadata": metadata,
        "assets": assets,
        "complexity_type": complexity_type,
        "subcategories": subcategories,
        "conversion_strategy": conversion_strategy
    }

def generate_markdown_report(analyses):
    """Generate a markdown report from all analyses"""
    # Global summary
    complexity_counter = Counter(analysis["complexity_type"] for analysis in analyses)
    
    # Sort analyses by complexity for roadmap
    complexity_order = {
        "static_image": 0,
        "video": 1,
        "parallax": 2,
        "particles": 3,
        "shader": 4,
        "hybrid": 5
    }
    
    sorted_analyses = sorted(analyses, key=lambda x: complexity_order.get(x["complexity_type"], 999))
    
    # Generate report
    report = []
    report.append("# Wallpaper Engine Wallpaper Analysis Report")
    report.append("")
    
    # Global Summary
    report.append("## Global Summary")
    report.append("")
    report.append("Distribution of wallpapers by complexity type:")
    report.append("")
    
    for complexity_type, count in complexity_counter.most_common():
        # Map complexity types to readable names
        readable_names = {
            "static_image": "Static Images",
            "video": "Video-based",
            "parallax": "Image + Parallax",
            "particles": "Particles only",
            "shader": "Shaders/Effects",
            "hybrid": "Hybrid"
        }
        name = readable_names.get(complexity_type, complexity_type)
        report.append(f"- {name}: {count}")
    report.append("")
    
    # Individual wallpaper sections
    report.append("## Wallpaper Details")
    report.append("")
    
    for analysis in analyses:
        metadata = analysis["metadata"]
        assets = analysis["assets"]
        complexity_type = analysis["complexity_type"]
        subcategories = analysis["subcategories"]
        conversion_strategy = analysis["conversion_strategy"]
        
        report.append(f"### {metadata['title']} (ID: {metadata['id']})")
        report.append("")
        
        # Metadata
        report.append("**Metadata:**")
        report.append(f"- Title: {metadata['title']}")
        report.append(f"- Author: {metadata['author']}")
        report.append(f"- Resolution: {metadata['resolution']}")
        report.append(f"- Tags: {', '.join(metadata['tags']) if metadata['tags'] else 'None'}")
        report.append("")
        
        # Assets
        report.append("**Assets:**")
        
        # Images
        if assets["images"]:
            report.append(f"- Images: {len(assets['images'])} files")
            if len(assets["images"]) <= 10:  # Only list if not too many
                for img in assets["images"]:
                    report.append(f"  - {img}")
        else:
            report.append("- Images: 0 files")
        
        # Videos
        if assets["videos"]:
            report.append(f"- Videos: {len(assets['videos'])} files")
            for vid in assets["videos"]:
                report.append(f"  - {vid}")
        else:
            report.append("- Videos: 0 files")
        
        # Shaders
        if assets["shaders"]:
            report.append(f"- Shaders: {len(assets['shaders'])} files")
            if len(assets["shaders"]) <= 10:
                for shader in assets["shaders"]:
                    report.append(f" - {shader}")
        else:
            report.append("- Shaders: 0 files")
        
        # Models
        if assets["models"]:
            report.append(f"- Models: {len(assets['models'])} files")
            for model in assets["models"]:
                report.append(f"  - {model}")
        else:
            report.append("- Models: 0 files")
        
        # Particles
        if assets["particles"]:
            report.append(f"- Particles: {len(assets['particles'])} files")
            if len(assets["particles"]) <= 10:
                for particle in assets["particles"]:
                    report.append(f"  - {particle}")
        else:
            report.append("- Particles: 0 files")
        
        # Effects
        if assets["effects"]:
            report.append(f"- Effects: {len(assets['effects'])} files")
            if len(assets["effects"]) <= 10:
                for effect in assets["effects"]:
                    report.append(f"  - {effect}")
        else:
            report.append("- Effects: 0 files")
        
        # Audio
        if assets["audio"]:
            report.append(f"- Audio: {len(assets['audio'])} files")
            for audio in assets["audio"]:
                report.append(f"  - {audio}")
        else:
            report.append("- Audio: 0 files")
        
        report.append("")
        
        # Complexity and strategy
        readable_complexity = {
            "static_image": "Static Image",
            "video": "Video-based",
            "parallax": "Image + Parallax",
            "particles": "Particles only",
            "shader": "Shaders/Effects",
            "hybrid": "Hybrid"
        }
        
        report.append("**Analysis:**")
        report.append(f"- Complexity Type: {readable_complexity.get(complexity_type, complexity_type)}")
        if subcategories:
            report.append(f"- Subcategories: {', '.join(subcategories)}")
        report.append(f"- Conversion Strategy: {conversion_strategy}")
        report.append("")
    
    # Conversion Roadmap
    report.append("## Conversion Roadmap")
    report.append("")
    report.append("Recommended order of conversion (easiest to most complex):")
    report.append("")
    
    for i, analysis in enumerate(sorted_analyses, 1):
        metadata = analysis["metadata"]
        complexity_type = analysis["complexity_type"]
        readable_complexity = {
            "static_image": "Static Image",
            "video": "Video-based",
            "parallax": "Image + Parallax",
            "particles": "Particles only",
            "shader": "Shaders/Effects",
            "hybrid": "Hybrid"
        }
        complexity_name = readable_complexity.get(complexity_type, complexity_type)
        report.append(f"{i}. **{metadata['title']}** (ID: {metadata['id']}) - {complexity_name}")
    
    report.append("")
    report.append("---")
    report.append("*Report generated automatically by Wallpaper Engine Web Exporter*")
    
    return "\n".join(report)

def main():
    """Main function to analyze all wallpapers and generate report"""
    analyses = []
    
    # Check if unpacked directory exists
    if not os.path.exists(UNPACKED_DIR):
        print(f"Error: {UNPACKED_DIR} directory not found!")
        return
    
    # Get list of wallpapers
    wallpapers = [d for d in os.listdir(UNPACKED_DIR) 
                  if os.path.isdir(os.path.join(UNPACKED_DIR, d))]
    
    if not wallpapers:
        print(f"No wallpapers found in {UNPACKED_DIR}")
        return
    
    print(f"Found {len(wallpapers)} wallpapers to analyze...")
    
    # Analyze each wallpaper
    for wallpaper_id in wallpapers:
        wallpaper_path = os.path.join(UNPACKED_DIR, wallpaper_id)
        print(f"Analyzing {wallpaper_id}...")
        
        try:
            analysis = analyze_wallpaper(wallpaper_path)
            analyses.append(analysis)
        except Exception as e:
            print(f"Error analyzing {wallpaper_id}: {e}")
    
    # Generate report
    if analyses:
        print(f"Generating report for {len(analyses)} wallpapers...")
        report_content = generate_markdown_report(analyses)
        
        # Write report to file
        with open(REPORT_FILE, "w", encoding="utf-8") as f:
            f.write(report_content)
        
        print(f"Report generated: {REPORT_FILE}")
        
        # Print summary to console
        complexity_counter = Counter(analysis["complexity_type"] for analysis in analyses)
        print("\nSummary:")
        for complexity_type, count in complexity_counter.most_common():
            readable_names = {
                "static_image": "Static Images",
                "video": "Video-based",
                "parallax": "Image + Parallax",
                "particles": "Particles only",
                "shader": "Shaders/Effects",
                "hybrid": "Hybrid"
            }
            name = readable_names.get(complexity_type, complexity_type)
            print(f"- {name}: {count}")
    else:
        print("No analyses completed successfully.")

if __name__ == "__main__":
    main()