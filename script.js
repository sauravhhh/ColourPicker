document.addEventListener('DOMContentLoaded', function() {
    const colorPicker = document.getElementById('colorPicker');
    const hexInput = document.getElementById('hexInput');
    const opacitySlider = document.getElementById('opacitySlider');
    const opacityValue = document.getElementById('opacityValue');
    const colorDisplay = document.getElementById('colorDisplay');
    const hexValue = document.getElementById('hexValue');
    const rgbValue = document.getElementById('rgbValue');
    const hslValue = document.getElementById('hslValue');
    const opacityStat = document.getElementById('opacityStat');
    const contrastWhite = document.getElementById('contrastWhite');
    const contrastBlack = document.getElementById('contrastBlack');
    const whiteContrastBox = document.getElementById('whiteContrastBox');
    const blackContrastBox = document.getElementById('blackContrastBox');
    const recentColorsContainer = document.getElementById('recentColors');
    const toast = document.getElementById('toast');
    const copyButtons = document.querySelectorAll('.icon-btn');
    const shareBtn = document.getElementById('shareBtn');

    // Load recent colors from localStorage
    let recentColors = JSON.parse(localStorage.getItem('recentColors')) || [];
    
    // Initialize with default color
    updateColor('#3498db');
    displayRecentColors();

    // Event listeners
    colorPicker.addEventListener('input', function() {
        const color = this.value;
        hexInput.value = color;
        updateColor(color);
        addToRecentColors(color);
    });

    hexInput.addEventListener('input', function() {
        const color = this.value;
        if (/^#[0-9A-F]{6}$/i.test(color)) {
            colorPicker.value = color;
            updateColor(color);
            addToRecentColors(color);
        }
    });

    opacitySlider.addEventListener('input', function() {
        const opacity = this.value;
        opacityValue.textContent = opacity + '%';
        opacityStat.textContent = opacity + '%';
        updateColorDisplay();
    });

    // Copy button event listeners
    copyButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const targetElement = document.getElementById(targetId);
            const textToCopy = targetElement.textContent;
            
            navigator.clipboard.writeText(textToCopy).then(() => {
                showToast('Copied to clipboard!');
            }).catch(err => {
                console.error('Failed to copy: ', err);
                showToast('Failed to copy');
            });
        });
    });

    // Share button event listener
    shareBtn.addEventListener('click', function() {
        const hex = hexValue.textContent;
        const rgb = rgbValue.textContent;
        const hsl = hslValue.textContent;
        const opacity = opacityStat.textContent;
        
        const shareText = `Check out this color!\n\nHEX: ${hex}\nRGB: ${rgb}\nHSL: ${hsl}\nOpacity: ${opacity}`;
        
        if (navigator.share) {
            // Use Web Share API if available
            navigator.share({
                title: 'Color Picker',
                text: shareText
            })
            .then(() => {
                showToast('Shared successfully!');
            })
            .catch((error) => {
                console.log('Error sharing:', error);
                // Fallback to copying to clipboard
                navigator.clipboard.writeText(shareText).then(() => {
                    showToast('Color info copied to clipboard!');
                }).catch(err => {
                    console.error('Failed to copy: ', err);
                    showToast('Failed to copy');
                });
            });
        } else {
            // Fallback to copying to clipboard
            navigator.clipboard.writeText(shareText).then(() => {
                showToast('Color info copied to clipboard!');
            }).catch(err => {
                console.error('Failed to copy: ', err);
                showToast('Failed to copy');
            });
        }
    });

    function showToast(message) {
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 2000);
    }

    function updateColor(hex) {
        // Update color values
        hexValue.textContent = hex;
        
        const rgb = hexToRgb(hex);
        rgbValue.textContent = `${rgb.r}, ${rgb.g}, ${rgb.b}`;
        
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
        hslValue.textContent = `${hsl.h}°, ${hsl.s}%, ${hsl.l}%`;
        
        // Update contrast ratios
        const whiteContrast = calculateContrastRatio(rgb, {r: 255, g: 255, b: 255});
        const blackContrast = calculateContrastRatio(rgb, {r: 0, g: 0, b: 0});
        
        contrastWhite.textContent = `${whiteContrast.toFixed(1)}:1`;
        contrastBlack.textContent = `${blackContrast.toFixed(1)}:1`;
        
        // Update contrast boxes
        whiteContrastBox.style.backgroundColor = '#ffffff';
        whiteContrastBox.style.color = hex;
        
        blackContrastBox.style.backgroundColor = '#000000';
        blackContrastBox.style.color = hex;
        
        // Update color display
        updateColorDisplay();
    }

    function updateColorDisplay() {
        const hex = colorPicker.value;
        const opacity = opacitySlider.value / 100;
        colorDisplay.style.backgroundColor = hex;
        colorDisplay.style.opacity = opacity;
    }

    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    function rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        
        if (max === min) {
            h = s = 0; // achromatic
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            
            switch (max) {
                case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
                case g: h = ((b - r) / d + 2) / 6; break;
                case b: h = ((r - g) / d + 4) / 6; break;
            }
        }
        
        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            l: Math.round(l * 100)
        };
    }

    function calculateContrastRatio(color1, color2) {
        const luminance1 = calculateLuminance(color1.r, color1.g, color1.b);
        const luminance2 = calculateLuminance(color2.r, color2.g, color2.b);
        
        const lighter = Math.max(luminance1, luminance2);
        const darker = Math.min(luminance1, luminance2);
        
        return (lighter + 0.05) / (darker + 0.05);
    }

    function calculateLuminance(r, g, b) {
        const sRGB = [r, g, b].map(val => {
            val = val / 255;
            return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
        });
        
        return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
    }

    function addToRecentColors(color) {
        // Remove if already exists
        recentColors = recentColors.filter(c => c !== color);
        
        // Add to beginning
        recentColors.unshift(color);
        
        // Keep only the last 8 colors
        if (recentColors.length > 8) {
            recentColors = recentColors.slice(0, 8);
        }
        
        // Save to localStorage
        localStorage.setItem('recentColors', JSON.stringify(recentColors));
        
        // Update display
        displayRecentColors();
    }

    function displayRecentColors() {
        recentColorsContainer.innerHTML = '';
        
        recentColors.forEach(color => {
            const swatch = document.createElement('div');
            swatch.className = 'color-swatch';
            swatch.style.backgroundColor = color;
            swatch.title = color;
            swatch.addEventListener('click', function() {
                colorPicker.value = color;
                hexInput.value = color;
                updateColor(color);
            });
            recentColorsContainer.appendChild(swatch);
        });
    }
});
