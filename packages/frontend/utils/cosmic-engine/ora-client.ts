'use client';

function arrayBufferToBase64(buffer: Buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  export function uint8ArrayToSrc(uint8Array: Buffer, mimeType = 'image/png') {
    const base64String = arrayBufferToBase64(uint8Array);
    return `data:${mimeType};base64,${base64String}`;
  }

    export function getBase64Image(layerData: string) {
        const imageJSON = JSON.parse(layerData);
        const imageData = uint8ArrayToSrc(imageJSON[0].buffer.data);
        return imageData;
    }
