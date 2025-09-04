import json
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Constants
SHADER_REGISTRY_PATH = os.path.join(os.path.dirname(__file__), 'registry.json')
SHADER_TEMPLATES_DIR = os.path.join(os.path.dirname(__file__), 'templates')

def load_shader_registry():
    """Loads the shader registry from the JSON file."""
    if not os.path.exists(SHADER_REGISTRY_PATH):
        logging.error("Shader registry not found at %s", SHADER_REGISTRY_PATH)
        return {}
    with open(SHADER_REGISTRY_PATH, 'r') as f:
        return json.load(f)

def get_shader_template(template_name):
    """
    Reads and returns the content of a shader template.
    Returns None if the template is not found.
    """
    template_path = os.path.join(SHADER_TEMPLATES_DIR, template_name)
    if not os.path.exists(template_path):
        logging.error("Shader template not found: %s", template_name)
        return None
    with open(template_path, 'r') as f:
        return f.read()

def get_shader_info(shader_name):
    """
    Retrieves shader information from the registry.
    Returns None if the shader is not found.
    """
    registry = load_shader_registry()
    return registry.get("shaders", {}).get(shader_name)

class Shader:
    """Represents a shader with its properties."""
    def __init__(self, name, uniforms=None, template_content=None):
        self.name = name
        self.uniforms = uniforms or {}
        self.template_content = template_content

    def is_known(self):
        """Checks if the shader is a known and mapped shader."""
        return self.template_content is not None

def get_shader(shader_name, use_fallback=True):
    """
    Factory function to create a Shader object.
    
    If the shader is known, it loads its template and uniform mappings.
    If the shader is unknown, it either returns a fallback shader or None.
    """
    shader_info = get_shader_info(shader_name)
    
    if shader_info:
        template_content = get_shader_template(shader_info["template"])
        if template_content:
            return Shader(
                name=shader_name,
                uniforms=shader_info["uniforms"],
                template_content=template_content
            )

    # Fallback for unknown shaders
    if use_fallback:
        logging.warning("Unknown shader '%s'. Using fallback.", shader_name)
        return Shader(name=shader_name)  # Creates a placeholder for an unknown shader

    return None