"""
Maps STL particles to web-based generator format.
"""

def map_fireflies(particle_data):
    """Maps fireflies to a Pixi.js emitter configuration."""
    return {
        "emitter": "fireflies",
        "settings": {
            "spawnRate": particle_data.get("spawnrate", 10),
            "lifetime": {"min": 0.5, "max": 3},
            "speed": {"min": 50, "max": 100},
            "size": {"min": 1, "max": 3},
            "color": ["#ffff80", "#ffffff"]
        }
    }

def map_fog(particle_data):
    """Maps fog to a Pixi.js emitter configuration."""
    return {
        "emitter": "fog",
        "settings": {
            "spawnRate": particle_data.get("spawnrate", 1),
            "lifetime": {"min": 5, "max": 15},
            "speed": {"min": 10, "max": 20},
            "size": {"min": 100, "max": 200},
            "alpha": {"start": 0.1, "end": 0}
        }
    }

def map_leaves(particle_data):
    """Maps leaves to a Pixi.js emitter configuration."""
    return {
        "emitter": "leaves",
        "settings": {
            "spawnRate": particle_data.get("spawnrate", 2),
            "lifetime": {"min": 5, "max": 10},
            "speed": {"min": 50, "max": 100},
            "size": {"min": 10, "max": 20},
            "gravity": 0.1
        }
    }

def map_snow(particle_data):
    """Maps snow to a Pixi.js emitter configuration."""
    return {
        "emitter": "snow",
        "settings": {
            "spawnRate": particle_data.get("spawnrate", 10),
            "lifetime": {"min": 5, "max": 10},
            "speed": {"min": 50, "max": 100},
            "size": {"min": 2, "max": 5},
            "gravity": 0.05
        }
    }

def map_starfield(particle_data):
    """Maps starfield to a Pixi.js emitter configuration."""
    return {
        "emitter": "starfield",
        "settings": {
            "spawnRate": particle_data.get("spawnrate", 20),
            "lifetime": {"min": 10, "max": 20},
            "speed": {"min": 5, "max": 10},
            "size": {"min": 1, "max": 2}
        }
    }

PARTICLE_MAPPERS = {
    "fireflies": map_fireflies,
    "fog": map_fog,
    "leaves": map_leaves,
    "snow": map_snow,
    "starfield": map_starfield,
}