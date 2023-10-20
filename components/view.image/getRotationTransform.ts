export const getRotationTransform = (
    degrees: number,
    image: { width: number; height: number },
    container: { width: number; height: number }
) => {
    if (degrees === 0) {
        return {
            transform: `rotate(0) scale(1)`
        };
    }

    let radians = ((degrees % 360) / 180) * Math.PI;

    // boundsDimensions calculation works properly only in [0, Pi/2]
    if (radians < 0) {
        radians = Math.PI * 2 + radians;
    }
    if (radians > Math.PI) {
        radians = Math.PI * 2 - radians;
    }
    if (radians > Math.PI / 2) {
        radians = Math.PI - radians;
    }

    const boundsDimensions = {
        width: image.width * Math.cos(radians) + image.height * Math.sin(radians),
        height: image.width * Math.sin(radians) + image.height * Math.cos(radians)
    };
    const scaleByWidth = Math.abs(container.width / boundsDimensions.width);
    const scaleByHeight = Math.abs(container.height / boundsDimensions.height);
    let scale = 1;

    if (boundsDimensions.width > container.width) {
        scale = scaleByWidth;
    }
    if (boundsDimensions.height > container.height && scaleByHeight < scale) {
        scale = scaleByHeight;
    }

    return {
        transform: `rotate(${degrees}deg) scale(${scale})`
    };
};
