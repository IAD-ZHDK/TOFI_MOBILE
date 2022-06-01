let colorPallete = [];
export function getColorPallet() {
    if (colorPallete.length <= 1) {
        console.log("fetching color pallete")
        const css = getComputedStyle(document.documentElement);
        const color0 = css.getPropertyValue('--c0');
        const color1 = css.getPropertyValue('--c1');
        const color2 = css.getPropertyValue('--c2');
        const color3 = css.getPropertyValue('--c3');
        const color4 = css.getPropertyValue('--c4');
        const color5 = css.getPropertyValue('--c5');
        const color6 = css.getPropertyValue('--c6');
        const color7 = css.getPropertyValue('--c7');
        colorPallete = [color0, color1, color2, color3, color4, color5, color6,color7]
    }
    return colorPallete;
}