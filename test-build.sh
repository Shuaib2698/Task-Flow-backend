#!/bin/bash
echo "Current directory: $(pwd)"
echo "Files in directory:"
ls -la
echo "Looking for render files:"
ls -la | grep -i render
