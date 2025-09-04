# Scene Translation Layer (STL) - Property Mapping

This document outlines the normalization of coordinates, units, and blend modes from the original Wallpaper Engine format to the standardized format used in the Scene Translation Layer (STL) Intermediate Representation (IR).

## 1. Coordinate System

Wallpaper Engine uses a coordinate system where the origin `(0, 0)` is at the center of the screen. The coordinates are normalized based on a virtual resolution of 1920x1080.

The STL IR normalizes all coordinates to a range of `[0, 1]`, where `(0, 0)` is the top-left corner and `(1, 1)` is the bottom-right corner.

### Mapping Table:

| Wallpaper Engine | STL IR (Normalized) | Formula |
| :--- | :--- | :--- |
| `x` (position) | `x_norm` | `(x / 1920) + 0.5` |
| `y` (position) | `y_norm` | `0.5 - (y / 1080)` |
| `width` (scale) | `width_norm` | `width / 1920` |
| `height` (scale) | `height_norm` | `height / 1080` |

**Note:** The Y-axis is inverted to match the common top-left origin convention in web and graphics programming.

## 2. Units

This section will be updated as more properties with specific units are identified and mapped.

| Property | Wallpaper Engine Unit | STL IR Unit | Normalization Factor |
| :--- | :--- | :--- | :--- |
| `size` (e.g., font size) | Points/Pixels | `rem` (relative to root) | TBD |
| `speed` (e.g., particle speed) | Pixels per second | Normalized units per second | `1 / 1920` or `1 / 1080` |

## 3. Blend Modes

Wallpaper Engine layers can have different blend modes. These are mapped to standard CSS `mix-blend-mode` values.

| Wallpaper Engine `blend` Value | STL IR `blendMode` | CSS `mix-blend-mode` |
| :--- | :--- | :--- |
| `Normal` | `NORMAL` | `normal` |
| `Additive` | `ADD` | `add` |
| `Screen` | `SCREEN` | `screen` |
| `Multiply` | `MULTIPLY` | `multiply` |
| `Overlay` | `OVERLAY` | `overlay` |

**Note:** Any blend modes from Wallpaper Engine that do not have a direct equivalent will be mapped to `NORMAL`, and a warning will be logged by the parser.