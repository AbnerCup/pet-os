#!/usr/bin/env python3
"""
Script para crear el icono foreground de Android con fondo transparente.
"""

from PIL import Image
import numpy as np
import os

ASSETS_DIR = os.path.join(os.path.dirname(__file__), '..', 'assets')

def create_foreground_icon():
    """Crea el icono foreground para Android Adaptive Icons."""
    input_path = os.path.join(ASSETS_DIR, 'icon.png')
    output_path = os.path.join(ASSETS_DIR, 'adaptive-icon-foreground.png')
    
    if not os.path.exists(input_path):
        print("ERROR: No se encontro: " + input_path)
        return False
    
    print("Cargando: " + input_path)
    img = Image.open(input_path).convert('RGBA')
    data = np.array(img)
    
    r, g, b, a = data.T
    
    # Detectar color verde de fondo (aproximadamente #7c9a6b)
    # RGB: 124, 154, 107
    green_mask = (
        (r >= 100) & (r <= 150) &
        (g >= 130) & (g <= 180) &
        (b >= 80) & (b <= 130)
    )
    
    # Hacer transparentes los pixeles verdes
    data[..., 3][green_mask.T] = 0
    
    # Guardar resultado
    result = Image.fromarray(data)
    result.save(output_path)
    
    print("OK: Foreground guardado: " + output_path)
    print("Tamaño: " + str(round(os.path.getsize(output_path) / 1024, 1)) + " KB")
    
    return True

def create_simple_foreground():
    """Crea un foreground simple con circulos blancos."""
    from PIL import ImageDraw
    
    size = 1024
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Huella principal
    center_x, center_y = size // 2, size // 2 + 50
    paw_size = 180
    draw.ellipse(
        [center_x - paw_size//2, center_y - paw_size//2,
         center_x + paw_size//2, center_y + paw_size//2],
        fill=(255, 255, 255, 255)
    )
    
    # Dedos
    finger_size = 100
    positions = [
        (center_x - 140, center_y - 180),
        (center_x + 140, center_y - 180),
        (center_x - 80, center_y + 150),
        (center_x + 80, center_y + 150),
    ]
    
    for x, y in positions:
        draw.ellipse(
            [x - finger_size//2, y - finger_size//2,
             x + finger_size//2, y + finger_size//2],
            fill=(255, 255, 255, 255)
        )
    
    output_path = os.path.join(ASSETS_DIR, 'adaptive-icon-foreground.png')
    img.save(output_path)
    
    print("OK: Foreground simple creado: " + output_path)
    return True

if __name__ == '__main__':
    print("Generador de Icono Foreground para Android\n")
    
    try:
        if not create_foreground_icon():
            print("Usando metodo alternativo...")
            create_simple_foreground()
    except Exception as e:
        print("Error: " + str(e))
        print("Usando metodo simple...")
        create_simple_foreground()
    
    print("\nProceso completado!")
    print("Verifica que adaptive-icon-foreground.png se creo correctamente.")
