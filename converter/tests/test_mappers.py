import unittest
from converter.mappers.effects import map_blur_precise, map_opacity
from converter.mappers.particles import map_snow
from converter.shaders import get_shader

class TestMappers(unittest.TestCase):

    def test_get_shader(self):
        # Test known shader
        shader = get_shader("ripple")
        self.assertIsNotNone(shader)
        self.assertTrue(shader.is_known())
        self.assertIn("time", shader.uniforms)

        # Test unknown shader with fallback
        shader = get_shader("unknown_shader")
        self.assertIsNotNone(shader)
        self.assertFalse(shader.is_known())

        # Test unknown shader with strict mode (no fallback)
        shader = get_shader("unknown_shader", use_fallback=False)
        self.assertIsNone(shader)

    def test_map_blur_precise(self):
        effect_data = {"strength": 10}
        result = map_blur_precise(effect_data)
        self.assertEqual(result["filter"], "BlurFilter")
        self.assertEqual(result["settings"]["strength"], 10)

    def test_map_opacity(self):
        effect_data = {"speed": 2, "start": 0.1, "end": 0.9}
        result = map_opacity(effect_data)
        self.assertEqual(result["animation"], "opacity")
        self.assertEqual(result["settings"]["speed"], 2)
        self.assertEqual(result["settings"]["start"], 0.1)
        self.assertEqual(result["settings"]["end"], 0.9)

    def test_map_snow(self):
        particle_data = {"spawnrate": 15}
        result = map_snow(particle_data)
        self.assertEqual(result["emitter"], "snow")
        self.assertEqual(result["settings"]["spawnRate"], 15)

if __name__ == '__main__':
    unittest.main()