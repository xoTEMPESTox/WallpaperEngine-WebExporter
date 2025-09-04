"""
Maps STL effects to web-based generator format.
"""

def map_water_ripple(effect_data):
    """Maps waterRipple/waterFlow to a Pixi.js filter or fallback."""
    # Placeholder: Map to a simple displacement filter for now
    return {
        "filter": "DisplacementFilter",
        "settings": {
            "scale": effect_data.get("scale", 50)
        }
    }

def map_foliage_sway(effect_data):
    """Maps foliageSway to a periodic transform."""
    # Placeholder: Map to a simple periodic rotation
    return {
        "animation": "foliageSway",
        "settings": {
            "speed": effect_data.get("speed", 1),
            "amount": effect_data.get("amount", 5)
        }
    }

def map_color_grading(effect_data):
    """Maps colorGrading to a color matrix filter."""
    # Placeholder: Map to a simple color matrix
    return {
        "filter": "ColorMatrixFilter",
        "settings": {
            "matrix": [
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1
            ]
        }
    }

def map_blur_precise(effect_data):
    """Maps blurPrecise to a Gaussian blur filter."""
    return {
        "filter": "BlurFilter",
        "settings": {
            "strength": effect_data.get("strength", 8)
        }
    }

def map_scroll(effect_data):
    """Maps scroll to a tweened transform."""
    return {
        "animation": "scroll",
        "settings": {
            "speedX": effect_data.get("speedX", 0),
            "speedY": effect_data.get("speedY", -0.1)
        }
    }

def map_opacity(effect_data):
    """Maps opacity to a tweened transform."""
    return {
        "animation": "opacity",
        "settings": {
            "speed": effect_data.get("speed", 1),
            "start": effect_data.get("start", 0),
            "end": effect_data.get("end", 1)
        }
    }

EFFECT_MAPPERS = {
    "waterRipple": map_water_ripple,
    "waterFlow": map_water_ripple,
    "foliageSway": map_foliage_sway,
    "colorGrading": map_color_grading,
    "blurPrecise": map_blur_precise,
    "scroll": map_scroll,
    "opacity": map_opacity,
}