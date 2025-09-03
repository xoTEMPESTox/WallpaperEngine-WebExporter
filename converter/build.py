#!/usr/bin/env python3
"""
Build script for Wallpaper Engine Web Exporter.

This script provides command-line interface for common tasks:
- convert-all: Run the converter on all projects in output/unpacked/ and place the output in output/web/
- serve: Start a simple HTTP server to view the output
- clean: Remove all files in output/web/
"""

import argparse
import os
import shutil
import sys
import http.server
import socketserver
from pathlib import Path

# Add src to Python path so we can import the converter
sys.path.append(str(Path(__file__).parent.parent))

from converter.convert_to_web import convert_wallpaper_engine_project


def convert_all(verbose=False):
    """Convert all Wallpaper Engine projects in output/unpacked/ to web format."""
    unpacked_projects_dir = Path('output/unpacked')
    web_output_dir = Path('output/web')
    
    if not unpacked_projects_dir.exists():
        print(f"Error: Unpacked projects directory not found: {unpacked_projects_dir}")
        return False
    
    # Create output directory if it doesn't exist
    web_output_dir.mkdir(parents=True, exist_ok=True)
    
    # Convert each project
    for project_dir in unpacked_projects_dir.iterdir():
        if project_dir.is_dir():
            print(f"Converting project: {project_dir.name}")
            output_project_path = web_output_dir / project_dir.name
            try:
                convert_wallpaper_engine_project(project_dir, output_project_path, verbose)
                print(f"Successfully converted: {project_dir.name}")
            except Exception as e:
                print(f"Error converting {project_dir.name}: {e}")
                return False
    
    print("All projects converted successfully!")
    return True


def serve(port=8000):
    """Start a simple HTTP server to view the output."""
    web_dir = Path('output/web')
    
    if not web_dir.exists():
        print(f"Error: Web output directory not found: {web_dir}")
        print("Run 'build.py convert-all' first to generate web projects.")
        return False
    
    # Change to the web directory
    os.chdir(web_dir)
    
    # Start the HTTP server
    handler = http.server.SimpleHTTPRequestHandler
    with socketserver.TCPServer(("", port), handler) as httpd:
        print(f"Serving at http://localhost:{port}")
        print("Press Ctrl+C to stop the server")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")
    
    return True


def clean():
    """Remove all files in output/web/."""
    web_output_dir = Path('output/web')
    
    if web_output_dir.exists():
        try:
            shutil.rmtree(web_output_dir)
            print("Cleaned output/web/ directory")
            return True
        except Exception as e:
            print(f"Error cleaning output/web/ directory: {e}")
            return False
    else:
        print("output/web/ directory doesn't exist, nothing to clean")
        return True


def main():
    parser = argparse.ArgumentParser(description="Build script for Wallpaper Engine Web Exporter")
    parser.add_argument(
        'command',
        choices=['convert-all', 'serve', 'clean'],
        help="Command to execute"
    )
    parser.add_argument(
        '--port',
        type=int,
        default=8000,
        help="Port for the serve command (default: 8000)"
    )
    parser.add_argument(
        '--verbose', '-v',
        action='store_true',
        help="Enable verbose output for convert-all command"
    )
    
    args = parser.parse_args()
    
    if args.command == 'convert-all':
        success = convert_all(verbose=args.verbose)
    elif args.command == 'serve':
        success = serve(args.port)
    elif args.command == 'clean':
        success = clean()
    else:
        print(f"Unknown command: {args.command}")
        success = False
    
    if not success:
        sys.exit(1)


if __name__ == "__main__":
    main()