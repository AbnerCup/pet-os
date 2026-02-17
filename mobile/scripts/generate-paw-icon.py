#!/usr/bin/env python3
"""
Genera iconos de Pet OS basados en el SVG de Lucide (paw-print).
Reproduce el diseño: 3 circulos arriba + forma de palma abajo.
"""

from PIL import Image, ImageDraw
import math

# Tamaños
SIZE = 1024
CENTER = SIZE // 2

# Colores
BACKGROUND_COLOR = (124, 154, 107)  # #7c9a6b - Verde salvia
PAW_COLOR = (255, 255, 255)  # Blanco

def draw_circle(draw, center, radius, color):
    """Dibuja un circulo relleno"""
    x, y = center
    draw.ellipse(
        [x - radius, y - radius, x + radius, y + radius],
        fill=color
    )

def create_paw_icon(with_background=True):
    """
    Crea el icono de la huella.
    
    Basado en el SVG de Lucide:
    - 3 circulos arriba (dedos)
    - Forma de palma abajo (path)
    """
    if with_background:
        img = Image.new('RGB', (SIZE, SIZE), BACKGROUND_COLOR)
    else:
        img = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
    
    draw = ImageDraw.Draw(img)
    
    # Escalar coordenadas del SVG (24x24) a nuestro tamaño (1024x1024)
    scale = SIZE / 24
    
    # Posiciones basadas en el SVG:
    # <circle cx="11" cy="4" r="2"/>  - Dedo superior izquierdo
    # <circle cx="18" cy="8" r="2"/>  - Dedo superior derecho  
    # <circle cx="20" cy="16" r="2"/> - Dedo lateral derecho
    
    # Dedo 1 (arriba izquierda)
    finger1_pos = (11 * scale, 4 * scale)
    finger1_radius = 2.5 * scale
    draw_circle(draw, finger1_pos, finger1_radius, PAW_COLOR)
    
    # Dedo 2 (arriba derecha)
    finger2_pos = (18 * scale, 8 * scale)
    finger2_radius = 2.5 * scale
    draw_circle(draw, finger2_pos, finger2_radius, PAW_COLOR)
    
    # Dedo 3 (lateral derecho)
    finger3_pos = (20 * scale, 16 * scale)
    finger3_radius = 2.5 * scale
    draw_circle(draw, finger3_pos, finger3_radius, PAW_COLOR)
    
    # Dedo 4 (lateral izquierdo) - simétrico al 3
    finger4_pos = (4 * scale, 16 * scale)
    finger4_radius = 2.5 * scale
    draw_circle(draw, finger4_pos, finger4_radius, PAW_COLOR)
    
    # Palma (parte de abajo)
    # El SVG tiene un path complejo, lo simplificamos a una forma ovalada
    # centrada debajo de los dedos
    palm_center = (12 * scale, 19 * scale)
    palm_radius_x = 6 * scale  # Ancho
    palm_radius_y = 5 * scale  # Alto
    
    draw.ellipse(
        [palm_center[0] - palm_radius_x, palm_center[1] - palm_radius_y,
         palm_center[0] + palm_radius_x, palm_center[1] + palm_radius_y],
        fill=PAW_COLOR
    )
    
    return img

def create_splash_screen():
    """Crea el splash screen (proporción diferente)"""
    # Splash screen tipicamente es más alto (ratio 1:2 aprox)
    width = 1242
    height = 2436
    
    img = Image.new('RGB', (width, height), BACKGROUND_COLOR)
    draw = ImageDraw.Draw(img)
    
    # Escalar proporcionalmente
    scale = width / 24
    
    center_x = width // 2
    center_y = height // 2 - 100  # Un poco arriba del centro
    
    # Dedo 1
    draw.ellipse(
        [center_x - 3*scale, center_y - 8*scale,
         center_x + 1*scale, center_y - 4*scale],
        fill=PAW_COLOR
    )
    
    # Dedo 2
    draw.ellipse(
        [center_x + 4*scale, center_y - 4*scale,
         center_x + 8*scale, center_y],
        fill=PAW_COLOR
    )
    
    # Dedo 3
    draw.ellipse(
        [center_x + 6*scale, center_y + 4*scale,
         center_x + 10*scale, center_y + 8*scale],
        fill=PAW_COLOR
    )
    
    # Dedo 4
    draw.ellipse(
        [center_x - 10*scale, center_y + 4*scale,
         center_x - 6*scale, center_y + 8*scale],
        fill=PAW_COLOR
    )
    
    # Palma
    draw.ellipse(
        [center_x - 6*scale, center_y + 6*scale,
         center_x + 6*scale, center_y + 16*scale],
        fill=PAW_COLOR
    )
    
    return img

def main():
    import os
    
    assets_dir = os.path.join(os.path.dirname(__file__), '..', 'assets')
    
    print("Generando iconos de Pet OS...")
    print("Diseño basado en: Lucide paw-print SVG")
    print("")
    
    # 1. Icono principal (con fondo) - Para iOS y uso general
    print("1. icon.png (con fondo verde)")
    icon = create_paw_icon(with_background=True)
    icon.save(os.path.join(assets_dir, 'icon.png'))
    print("   Guardado: assets/icon.png")
    
    # 2. Foreground (sin fondo) - Para Android Adaptive Icon
    print("2. adaptive-icon-foreground.png (sin fondo)")
    foreground = create_paw_icon(with_background=False)
    foreground.save(os.path.join(assets_dir, 'adaptive-icon-foreground.png'))
    print("   Guardado: assets/adaptive-icon-foreground.png")
    
    # 3. Legacy adaptive icon (mismo que icon.png)
    print("3. adaptive-icon.png (legacy)")
    icon.save(os.path.join(assets_dir, 'adaptive-icon.png'))
    print("   Guardado: assets/adaptive-icon.png")
    
    # 4. Splash screen
    print("4. splash.png")
    splash = create_splash_screen()
    splash.save(os.path.join(assets_dir, 'splash.png'))
    print("   Guardado: assets/splash.png")
    
    print("")
    print("Iconos generados correctamente!")
    print("")
    print("Nota: El diseño reproduce la huella de Lucide:")
    print("  - 4 dedos (circulos)")
    print("  - 1 palma (forma ovalada)")
    print("  - Color blanco sobre fondo verde #7c9a6b")

if __name__ == '__main__':
    main()
