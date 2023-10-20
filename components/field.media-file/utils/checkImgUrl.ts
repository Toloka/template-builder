export const checkImgUrl = (url: string) =>
    new Promise<void>((resolve, reject) => {
        const img = new Image();

        img.onerror = () => {
            reject();
            img.remove();
        };
        img.onload = () => {
            resolve();
            img.remove();
        };

        img.src = url;
    });
