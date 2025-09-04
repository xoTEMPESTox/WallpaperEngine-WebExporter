import argparse
import os
import json
import shutil
import zipfile
from pathlib import Path
import datetime

from converter.detector import detect_wallpaper_type
from converter.generator_scene import SceneGenerator
from converter.validator import validate_output
from converter.parser import parse_project_to_ir, handle_pkg_input

def main():
    parser = argparse.ArgumentParser(description="Wallpaper Engine Web Exporter CLI")
    parser.add_argument("--input", type=str, required=True,
                        help="Path to the input folder (unpacked wallpaper) or a zip file.")
    parser.add_argument("--out", type=str, required=True,
                        help="Path to the output directory (e.g., output/web/{id}/).")
    parser.add_argument("--type", type=str, choices=["video", "scene", "hybrid"],
                         help="Force a specific wallpaper type (e.g., scene, video).")
    parser.add_argument("--all", action="store_true",
                         help="Process all detected wallpapers in the input if it's a collection.")
    parser.add_argument("--emit-ir", type=str,
                         help="Emit the STL IR to the specified JSON file and exit.")
    parser.add_argument("--strict-shaders", action="store_true",
                        help="Fail conversion if an unknown or unmappable shader is found.")

    args = parser.parse_args()

    input_path = Path(args.input)
    output_base_path = Path(args.out)
    
    # Ensure output base path exists
    output_base_path.mkdir(parents=True, exist_ok=True)

    conversion_log = {
        "timestamp": datetime.datetime.now().isoformat(),
        "input_path": str(input_path),
        "output_base_path": str(output_base_path),
        "forced_type": args.type,
        "process_all": args.all,
        "results": []
    }

    temp_extract_path = None
    if input_path.is_file() and input_path.suffix.lower() == ".zip":
        print(f"Input is a zip file. Extracting to temporary directory...")
        temp_extract_path = Path(output_base_path / f"temp_unzipped_{os.urandom(4).hex()}")
        try:
            with zipfile.ZipFile(input_path, 'r') as zip_ref:
                zip_ref.extractall(temp_extract_path)
            input_path = temp_extract_path
            print(f"Zip extracted to: {input_path}")
        except Exception as e:
            print(f"Error extracting zip file: {e}")
            conversion_log["error"] = f"Zip extraction failed: {e}"
            with open(output_base_path / "debug.json", 'w', encoding='utf-8') as f:
                json.dump(conversion_log, f, indent=4)
            return

    try:
        if args.all:
            # For --all, assume input_path is a directory containing multiple wallpapers
            print("Processing all detected wallpapers in collection (not yet fully implemented for multiple wallpapers).")
            # This part would require iterating through subdirectories and calling detect/generate for each
            # For now, we'll treat the main input_path as a single wallpaper for demonstration
            process_single_wallpaper(input_path, output_base_path, args.type, args.emit_ir, args.strict_shaders, conversion_log["results"])
        else:
            # Handle .pkg input separately for now
            if input_path.is_file() and input_path.suffix.lower() == ".pkg":
                if args.emit_ir:
                    print(f"Processing .pkg file: {input_path}")
                    handle_pkg_input(input_path, args.emit_ir)
                else:
                    print("Processing .pkg files for web export is not yet supported. Use --emit-ir to generate IR.")
                return # Exit after handling the .pkg file

            process_single_wallpaper(input_path, output_base_path, args.type, args.emit_ir, args.strict_shaders, conversion_log["results"])

    except Exception as e:
        print(f"An error occurred during conversion: {e}")
        conversion_log["error"] = f"Conversion failed: {e}"
    finally:
        if temp_extract_path and temp_extract_path.exists():
            print(f"Cleaning up temporary extraction directory: {temp_extract_path}")
            shutil.rmtree(temp_extract_path)
        
        # Write debug.json
        with open(output_base_path / "debug.json", 'w', encoding='utf-8') as f:
            json.dump(conversion_log, f, indent=4)
        print(f"Conversion log written to {output_base_path / 'debug.json'}")


def process_single_wallpaper(input_path: Path, output_base_path: Path, forced_type: str, emit_ir_path: str, strict_shaders: bool, results_log: list):
    """
    Processes a single wallpaper (folder), either generating web export or emitting STL IR.
    """
    print(f"\n--- Processing wallpaper from {input_path.name} ---")

    # If emitting IR, just run the parser and exit
    if emit_ir_path:
        print(f"Parsing project to generate STL IR...")
        ir_data = parse_project_to_ir(input_path)
        if ir_data:
            try:
                with open(emit_ir_path, 'w', encoding='utf-8') as f:
                    json.dump(ir_data, f, indent=4)
                print(f"STL IR successfully written to {emit_ir_path}")
                results_log.append({"wallpaper_name": input_path.name, "status": "ir_emitted", "output_path": emit_ir_path})
            except Exception as e:
                print(f"Error writing IR file: {e}")
                results_log.append({"wallpaper_name": input_path.name, "status": "ir_failed", "error": str(e)})
        else:
            print("Failed to generate STL IR.")
            results_log.append({"wallpaper_name": input_path.name, "status": "ir_failed", "error": "Parser returned no data."})
        return

    detected_type, metadata = detect_wallpaper_type(input_path)
    conversion_type = forced_type if forced_type else detected_type

    result_entry = {
        "wallpaper_name": input_path.name,
        "detected_type": detected_type,
        "conversion_type": conversion_type,
        "metadata": metadata,
        "status": "failed",
        "output_dir": None
    }
    
    if conversion_type == "unknown":
        print(f"Could not determine wallpaper type for {input_path.name}. Skipping.")
        result_entry["error"] = "Unknown wallpaper type"
        results_log.append(result_entry)
        return

    # Use the provided output_base_path directly
    current_output_path = output_base_path
    result_entry["output_dir"] = str(current_output_path)

    try:
        ir_data = parse_project_to_ir(input_path)
        if not ir_data:
            raise Exception("Failed to generate IR.")

        current_output_path.mkdir(parents=True, exist_ok=True)
        ir_path = current_output_path / "ir.json"
        with open(ir_path, 'w', encoding='utf-8') as f:
            json.dump(ir_data, f, indent=4)

        generator = SceneGenerator(str(ir_path), str(current_output_path))
        generator.generate()
        print(f"Generated web export to: {current_output_path}")
        
        print("Running validation...")
        if validate_output(current_output_path):
            print("Validation successful.")
            result_entry["status"] = "success"
            print(f"Conversion complete for {input_path.name}. Open {current_output_path / 'index.html'} to view and inspect console logs.")
        else:
            print("Validation failed or had warnings.")
            result_entry["status"] = "success_with_warnings" # or "failed" if critical
            print(f"Conversion complete for {input_path.name} with warnings/errors. Check {current_output_path / 'index.html'} and logs.")

    except Exception as e:
        print(f"Error during generation/validation for {input_path.name}: {e}")
        result_entry["error"] = str(e)
    
    results_log.append(result_entry)


if __name__ == "__main__":
    main()