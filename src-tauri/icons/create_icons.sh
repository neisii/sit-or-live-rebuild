#!/bin/bash
# Create a simple colored square as base64 PNG and decode it

# 32x32 orange square (minimal PNG)
echo "iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAA7AAAAOwBeShxvQAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAABNSURBVFiF7dcxDQAgEMCwgX/PwrIgCUGTdE93yUuKAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4GcBOKkEbgARAQA=" | base64 -d > 32x32.png

# 128x128 (same image, scaled reference)
cp 32x32.png 128x128.png
cp 32x32.png 128x128@2x.png

echo "Created PNG icons"
